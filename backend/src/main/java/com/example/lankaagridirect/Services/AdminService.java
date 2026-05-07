package com.example.lankaagridirect.Services;

import com.example.lankaagridirect.DTOs.response.*;
import com.example.lankaagridirect.Exception.ResourceNotFoundException;
import com.example.lankaagridirect.Models.Producer;
import com.example.lankaagridirect.Repositories.AdminRepository;
import com.example.lankaagridirect.Repositories.CategoryRepository;
import com.example.lankaagridirect.Repositories.ProducerRepository;
import com.example.lankaagridirect.Repositories.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final ProducerRepository producerRepository;
    private final ProductRepository productRepository;
    private final AdminRepository adminRepository;
    private final CategoryRepository categoryRepository;
    private final AuditLogService auditLogService;

    public AdminService(ProducerRepository producerRepository, ProductRepository productRepository,
                        AdminRepository adminRepository, CategoryRepository categoryRepository,
                        AuditLogService auditLogService) {
        this.producerRepository = producerRepository;
        this.productRepository = productRepository;
        this.adminRepository = adminRepository;
        this.categoryRepository = categoryRepository;
        this.auditLogService = auditLogService;
    }

    // ─── Producer Management ──────────────────────────────────────────────────
    public Page<ProducerAdminResponse> getAllProducers(String status, String district, int page, int limit) {
        List<Producer> producers;
        if (status != null && district != null) {
            producers = producerRepository.findByVerificationStatusAndDistrictAndIsDeletedFalse(status, district);
        } else if (status != null) {
            producers = producerRepository.findByVerificationStatusAndIsDeletedFalse(status);
        } else {
            producers = producerRepository.findAll().stream()
                    .filter(p -> !p.getIsDeleted()).collect(Collectors.toList());
        }
        Pageable pageable = PageRequest.of(page - 1, limit);
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), producers.size());
        List<ProducerAdminResponse> pageContent = producers.subList(start, end)
                .stream().map(this::toAdminResponse).collect(Collectors.toList());
        return new PageImpl<>(pageContent, pageable, producers.size());
    }

    public ProducerAdminResponse getProducerById(String id) {
        Producer producer = producerRepository.findById(id)
                .filter(p -> !p.getIsDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Producer not found with ID: " + id));
        return toAdminResponse(producer);
    }

    public void verifyProducer(String id, String adminId) {
        Producer producer = producerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producer not found with ID: " + id));
        producer.setVerificationStatus("verified");
        producer.setModifiedAt(LocalDateTime.now());
        producerRepository.save(producer);
        auditLogService.logAdminAction(adminId, "VERIFY_PRODUCER",
                "Verified producer: " + producer.getFirstName() + " " + producer.getLastName() + " (ID: " + id + ")");
    }

    public void blockProducer(String id, String adminId, String reason) {
        Producer producer = producerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producer not found with ID: " + id));
        producer.setVerificationStatus("blocked");
        producer.setModifiedAt(LocalDateTime.now());
        producerRepository.save(producer);
        auditLogService.logAdminAction(adminId, "BLOCK_PRODUCER",
                "Blocked producer " + producer.getFirstName() + " " + producer.getLastName()
                        + " (ID: " + id + "). Reason: " + reason);
    }

    public void unblockProducer(String id, String adminId) {
        Producer producer = producerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producer not found with ID: " + id));
        producer.setVerificationStatus("verified");
        producer.setModifiedAt(LocalDateTime.now());
        producerRepository.save(producer);
        auditLogService.logAdminAction(adminId, "UNBLOCK_PRODUCER",
                "Unblocked producer " + producer.getFirstName() + " " + producer.getLastName() + " (ID: " + id + ")");
    }

    public void deleteProducer(String id, String adminId) {
        Producer producer = producerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producer not found with ID: " + id));
        producer.setIsDeleted(true);
        producer.setModifiedAt(LocalDateTime.now());
        producerRepository.save(producer);
        auditLogService.logAdminAction(adminId, "DELETE_PRODUCER",
                "Deleted producer " + producer.getFirstName() + " " + producer.getLastName() + " (ID: " + id + ")");
    }

    // ─── Reports ──────────────────────────────────────────────────────────────
    public UserStatsResponse getUserStats() {
        UserStatsResponse stats = new UserStatsResponse();
        stats.setTotalProducers(producerRepository.countByIsDeletedFalse());
        stats.setVerifiedProducers(producerRepository.countByVerificationStatusAndIsDeletedFalse("verified"));
        stats.setPendingProducers(producerRepository.countByVerificationStatusAndIsDeletedFalse("pending"));
        stats.setBlockedProducers(producerRepository.countByVerificationStatusAndIsDeletedFalse("blocked"));
        stats.setTotalAdmins(adminRepository.countByIsDeletedFalse());
        return stats;
    }

    public ProductStatsResponse getProductStats() {
        List<String> categories = categoryRepository.findAll()
                .stream().map(c -> c.getName()).collect(Collectors.toList());
        Map<String, Long> byCategory = categories.stream()
                .collect(Collectors.toMap(c -> c, productRepository::countByCategoryAndIsDeletedFalse));

        ProductStatsResponse stats = new ProductStatsResponse();
        stats.setTotalProducts(productRepository.countByProductStatusAndIsDeletedFalse("active")
                + productRepository.countByProductStatusAndIsDeletedFalse("suspended"));
        stats.setActiveProducts(productRepository.countByProductStatusAndIsDeletedFalse("active"));
        stats.setSuspendedProducts(productRepository.countByProductStatusAndIsDeletedFalse("suspended"));
        stats.setSoldOutProducts(productRepository.countByIsSoldOutAndIsDeletedFalse(true));
        stats.setByCategory(byCategory);
        return stats;
    }

    // ─── Helper: Producer → AdminResponse ────────────────────────────────────
    private ProducerAdminResponse toAdminResponse(Producer p) {
        ProducerAdminResponse res = new ProducerAdminResponse();
        res.setId(p.getId());
        res.setFirstName(p.getFirstName());
        res.setLastName(p.getLastName());
        res.setNic(p.getNic());
        res.setNicPhotoUrl(p.getNicPhotoUrl());
        res.setProfilePictureUrl(p.getProfilePictureUrl());
        res.setBusinessPhone(p.getBusinessPhone());
        res.setMobilePhone(p.getMobilePhone());
        res.setEmail(p.getEmail());
        res.setStoreTitle(p.getStoreTitle());
        res.setOperatingDays(p.getOperatingDays());
        res.setStartTime(p.getStartTime());
        res.setEndTime(p.getEndTime());
        res.setLatitude(p.getLatitude());
        res.setLongitude(p.getLongitude());
        res.setLocationDescription(p.getLocationDescription());
        res.setHomeAddress(p.getHomeAddress());
        res.setStoreAddress(p.getStoreAddress());
        res.setDistrict(p.getDistrict());
        res.setProvince(p.getProvince());
        res.setGnDivision(p.getGnDivision());
        res.setBusinessType(p.getBusinessType());
        res.setVerificationStatus(p.getVerificationStatus());
        res.setCreatedAt(p.getCreatedAt());
        res.setModifiedAt(p.getModifiedAt());
        return res;
    }
}

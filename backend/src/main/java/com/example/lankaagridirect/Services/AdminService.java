package com.example.lankaagridirect.Services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.lankaagridirect.DTOs.response.ProducerAdminResponse;
import com.example.lankaagridirect.DTOs.response.ProductStatsResponse;
import com.example.lankaagridirect.DTOs.response.UserStatsResponse;
import com.example.lankaagridirect.Exception.BusinessRuleException;
import com.example.lankaagridirect.Exception.DuplicateResourceException;
import com.example.lankaagridirect.Exception.ResourceNotFoundException;
import com.example.lankaagridirect.Models.Admin;
import com.example.lankaagridirect.Models.Producer;
import com.example.lankaagridirect.Repositories.AdminRepository;
import com.example.lankaagridirect.Repositories.CategoryRepository;
import com.example.lankaagridirect.Repositories.ProducerRepository;
import com.example.lankaagridirect.Repositories.ProductRepository;

@Service
public class AdminService {

    private final ProducerRepository producerRepository;
    private final ProductRepository productRepository;
    private final AdminRepository adminRepository;
    private final CategoryRepository categoryRepository;
    private final AuditLogService auditLogService;
    private final PasswordEncoder passwordEncoder;

    public AdminService(ProducerRepository producerRepository, ProductRepository productRepository,
                        AdminRepository adminRepository, CategoryRepository categoryRepository,
                        AuditLogService auditLogService, PasswordEncoder passwordEncoder) {
        this.producerRepository = producerRepository;
        this.productRepository = productRepository;
        this.adminRepository = adminRepository;
        this.categoryRepository = categoryRepository;
        this.auditLogService = auditLogService;
        this.passwordEncoder = passwordEncoder;
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

    // ─── Admin Account Management ─────────────────────────────────────────────
    public void changeAdminPassword(String adminId, String currentPassword, String newPassword) {
        Admin admin = adminRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        if (!passwordEncoder.matches(currentPassword, admin.getPassword())) {
            throw new BusinessRuleException("Current password is incorrect");
        }

        admin.setPassword(passwordEncoder.encode(newPassword));
        admin.setModifiedAt(LocalDateTime.now());
        adminRepository.save(admin);
        auditLogService.logAdminAction(adminId, "CHANGE_PASSWORD",
                "Admin " + admin.getName() + " changed their password");
    }

    public void addAdminEmail(String adminId, String email) {
        Admin admin = adminRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        if (adminRepository.existsByEmailAndIdNot(email, adminId)) {
            throw new DuplicateResourceException("Email already in use by another admin");
        }

        admin.setEmail(email);
        admin.setModifiedAt(LocalDateTime.now());
        adminRepository.save(admin);
        auditLogService.logAdminAction(adminId, "ADD_EMAIL",
                "Admin " + admin.getName() + " added email: " + email);
    }

    public String createNewAdmin(String adminId, String name, String email, String password, String role) {
        // Verify that the current admin has permission to create other admins
        Admin currentAdmin = adminRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Current admin not found"));

        if (!currentAdmin.getRole().equals("Admin")) {
            throw new BusinessRuleException("Only Admin users can create new admin accounts");
        }

        if (adminRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("Email already in use");
        }

        Admin newAdmin = new Admin();
        newAdmin.setName(name);
        newAdmin.setEmail(email);
        newAdmin.setUsername(email); // Use email as username
        newAdmin.setPassword(passwordEncoder.encode(password));
        newAdmin.setRole(role);
        newAdmin.setIsDeleted(false);
        newAdmin.setCreatedAt(LocalDateTime.now());
        newAdmin.setModifiedAt(LocalDateTime.now());

        Admin savedAdmin = adminRepository.save(newAdmin);
        auditLogService.logAdminAction(adminId, "CREATE_ADMIN",
                "Created new admin: " + name + " (" + email + ") with role: " + role);

        return savedAdmin.getId();
    }
}

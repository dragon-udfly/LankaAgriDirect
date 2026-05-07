package com.example.lankaagridirect.Services;

import com.example.lankaagridirect.DTOs.response.*;
import com.example.lankaagridirect.Exception.ResourceNotFoundException;
import com.example.lankaagridirect.Models.Producer;
import com.example.lankaagridirect.Repositories.ProductRepository;
import com.example.lankaagridirect.Repositories.ProducerRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProducerService {

    private final ProducerRepository producerRepository;
    private final ProductRepository productRepository;

    public ProducerService(ProducerRepository producerRepository, ProductRepository productRepository) {
        this.producerRepository = producerRepository;
        this.productRepository = productRepository;
    }

    public Page<ProducerPublicResponse> getVerifiedProducers(String district, String province, int page, int limit) {
        List<Producer> producers;
        if (district != null && !district.isBlank()) {
            producers = producerRepository.findByDistrictAndVerificationStatusAndIsDeletedFalse(district, "verified");
        } else if (province != null && !province.isBlank()) {
            producers = producerRepository.findByProvinceAndVerificationStatusAndIsDeletedFalse(province, "verified");
        } else {
            producers = producerRepository.findByVerificationStatusAndIsDeletedFalse("verified");
        }
        Pageable pageable = PageRequest.of(page - 1, limit);
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), producers.size());
        List<ProducerPublicResponse> pageContent = producers.subList(start, end)
                .stream().map(this::toPublicResponse).collect(Collectors.toList());
        return new PageImpl<>(pageContent, pageable, producers.size());
    }

    public ProducerPublicResponse getProducerDetails(String id) {
        Producer producer = producerRepository.findById(id)
                .filter(p -> !p.getIsDeleted() && "verified".equals(p.getVerificationStatus()))
                .orElseThrow(() -> new ResourceNotFoundException("Producer not found with ID: " + id));
        return toPublicResponse(producer);
    }

    public List<ProductResponse> getProducerProducts(String id, boolean includeSoldOut) {
        producerRepository.findById(id)
                .filter(p -> !p.getIsDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Producer not found with ID: " + id));
        var products = productRepository.findByProducerIdAndIsDeletedFalse(id);
        return products.stream()
                .filter(p -> "active".equals(p.getProductStatus()))
                .filter(p -> includeSoldOut || !p.getIsSoldOut())
                .map(p -> {
                    ProductResponse res = new ProductResponse();
                    res.setId(p.getId());
                    res.setProducerId(p.getProducerId());
                    res.setName(p.getName());
                    res.setCategory(p.getCategory());
                    res.setUnitPrice(p.getUnitPrice());
                    res.setUnitType(p.getUnitType());
                    res.setImageUrls(p.getImageUrls());
                    res.setIsSoldOut(p.getIsSoldOut());
                    return res;
                }).collect(Collectors.toList());
    }

    public List<MapProducerResponse> getProducerLocationsForMap(String district, String province, String category) {
        List<Producer> producers = producerRepository.findByVerificationStatusAndIsDeletedFalse("verified");
        return producers.stream()
                .filter(p -> district == null || district.equalsIgnoreCase(p.getDistrict()))
                .filter(p -> province == null || province.equalsIgnoreCase(p.getProvince()))
                .map(p -> {
                    MapProducerResponse res = new MapProducerResponse();
                    res.setProducerId(p.getId());
                    res.setStoreTitle(p.getStoreTitle());
                    res.setLatitude(p.getLatitude());
                    res.setLongitude(p.getLongitude());
                    res.setDistrict(p.getDistrict());
                    long count = productRepository.findByProducerIdAndIsDeletedFalse(p.getId())
                            .stream().filter(pr -> "active".equals(pr.getProductStatus())).count();
                    res.setProductCount(count);
                    return res;
                }).collect(Collectors.toList());
    }

    private ProducerPublicResponse toPublicResponse(Producer p) {
        ProducerPublicResponse res = new ProducerPublicResponse();
        res.setId(p.getId());
        res.setStoreTitle(p.getStoreTitle());
        res.setProfilePictureUrl(p.getProfilePictureUrl());
        res.setBusinessPhone(p.getBusinessPhone());
        res.setHomeAddress(p.getHomeAddress());
        res.setStoreAddress(p.getStoreAddress());
        res.setDistrict(p.getDistrict());
        res.setProvince(p.getProvince());
        res.setGnDivision(p.getGnDivision());
        res.setBusinessType(p.getBusinessType());
        res.setOperatingDays(p.getOperatingDays());
        res.setStartTime(p.getStartTime());
        res.setEndTime(p.getEndTime());
        res.setLatitude(p.getLatitude());
        res.setLongitude(p.getLongitude());
        res.setVerificationStatus(p.getVerificationStatus());
        res.setCreatedAt(p.getCreatedAt());
        return res;
    }
}

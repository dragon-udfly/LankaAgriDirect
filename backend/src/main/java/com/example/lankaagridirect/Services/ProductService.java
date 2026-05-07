package com.example.lankaagridirect.Services;

import com.example.lankaagridirect.DTOs.request.ProductCreateRequest;
import com.example.lankaagridirect.DTOs.request.ProductUpdateRequest;
import com.example.lankaagridirect.DTOs.request.SoldOutToggleRequest;
import com.example.lankaagridirect.DTOs.response.ProductResponse;
import com.example.lankaagridirect.Exception.AccessDeniedException;
import com.example.lankaagridirect.Exception.BusinessRuleException;
import com.example.lankaagridirect.Exception.ResourceNotFoundException;
import com.example.lankaagridirect.Models.Product;
import com.example.lankaagridirect.Models.Producer;
import com.example.lankaagridirect.Repositories.ProducerRepository;
import com.example.lankaagridirect.Repositories.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final ProducerRepository producerRepository;

    public ProductService(ProductRepository productRepository, ProducerRepository producerRepository) {
        this.productRepository = productRepository;
        this.producerRepository = producerRepository;
    }

    public Page<ProductResponse> getAllProducts(String category, int page, int limit) {
        Pageable pageable = PageRequest.of(page - 1, limit);
        Page<Product> products = (category != null && !category.isBlank())
                ? productRepository.findByCategoryAndIsSoldOutFalseAndProductStatusAndIsDeletedFalse(category, "active", pageable)
                : productRepository.findByIsSoldOutFalseAndProductStatusAndIsDeletedFalse("active", pageable);
        return products.map(this::toProductResponse);
    }

    public ProductResponse getProductById(String id) {
        Product product = productRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));
        return toProductResponse(product);
    }

    public String createProduct(String producerId, ProductCreateRequest req) {
        Producer producer = producerRepository.findById(producerId)
                .orElseThrow(() -> new ResourceNotFoundException("Producer account not found"));
        if (!"verified".equals(producer.getVerificationStatus())) {
            throw new BusinessRuleException("Your account must be verified before you can create product listings.");
        }
        Product product = new Product();
        product.setProducerId(producerId);
        product.setName(req.getName());
        product.setCategory(req.getCategory());
        product.setDescription(req.getDescription());
        product.setUnitPrice(req.getUnitPrice());
        product.setUnitType(req.getUnitType());
        product.setImageUrls(req.getImageUrls());
        product.setIsSoldOut(false);
        product.setProductStatus("active");
        product.setIsDeleted(false);
        product.setCreatedAt(LocalDateTime.now());
        product.setModifiedAt(LocalDateTime.now());
        return productRepository.save(product).getId();
    }

    public void updateProduct(String id, String producerId, ProductUpdateRequest req) {
        Product product = productRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));
        if (!product.getProducerId().equals(producerId)) {
            throw new AccessDeniedException("You are not authorized to modify this product.");
        }
        if (req.getName() != null)        product.setName(req.getName());
        if (req.getDescription() != null) product.setDescription(req.getDescription());
        if (req.getUnitPrice() != null)   product.setUnitPrice(req.getUnitPrice());
        if (req.getImageUrls() != null)   product.setImageUrls(req.getImageUrls());
        product.setModifiedAt(LocalDateTime.now());
        productRepository.save(product);
    }

    public void toggleSoldOut(String id, String producerId, SoldOutToggleRequest req) {
        Product product = productRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));
        if (!product.getProducerId().equals(producerId)) {
            throw new AccessDeniedException("You are not authorized to modify this product.");
        }
        product.setIsSoldOut(req.getIsSoldOut());
        product.setModifiedAt(LocalDateTime.now());
        productRepository.save(product);
    }

    public void deleteProduct(String id, String actorId, String actorRole) {
        Product product = productRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));
        if ("PRODUCER".equals(actorRole) && !product.getProducerId().equals(actorId)) {
            throw new AccessDeniedException("You are not authorized to delete this product.");
        }
        product.setIsDeleted(true);
        product.setModifiedAt(LocalDateTime.now());
        productRepository.save(product);
    }

    public void suspendProduct(String id) {
        Product product = productRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));
        product.setProductStatus("suspended");
        product.setModifiedAt(LocalDateTime.now());
        productRepository.save(product);
    }

    public void activateProduct(String id) {
        Product product = productRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));
        product.setProductStatus("active");
        product.setModifiedAt(LocalDateTime.now());
        productRepository.save(product);
    }

    public Page<Product> adminGetAllProducts(String status, String category, int page, int limit) {
        Pageable pageable = PageRequest.of(page - 1, limit);
        if (status != null && category != null)
            return productRepository.findByProductStatusAndCategoryAndIsDeletedFalse(status, category, pageable);
        if (status != null)
            return productRepository.findByProductStatusAndIsDeletedFalse(status, pageable);
        return productRepository.findByIsDeletedFalse(pageable);
    }

    private ProductResponse toProductResponse(Product product) {
        ProductResponse res = new ProductResponse();
        res.setId(product.getId());
        res.setProducerId(product.getProducerId());
        res.setName(product.getName());
        res.setCategory(product.getCategory());
        res.setDescription(product.getDescription());
        res.setUnitPrice(product.getUnitPrice());
        res.setUnitType(product.getUnitType());
        res.setImageUrls(product.getImageUrls());
        res.setIsSoldOut(product.getIsSoldOut());
        res.setProductStatus(product.getProductStatus());
        res.setCreatedAt(product.getCreatedAt());
        producerRepository.findById(product.getProducerId()).ifPresent(p -> {
            res.setProducerName(p.getFirstName() + " " + p.getLastName());
            res.setProducerStoreTitle(p.getStoreTitle());
            res.setProducerDistrict(p.getDistrict());
            res.setProducerProvince(p.getProvince());
            res.setProducerAddress(p.getStoreAddress() != null ? p.getStoreAddress() : p.getHomeAddress());
            res.setProducerPhone(p.getBusinessPhone());
            res.setProducerLatitude(p.getLatitude());
            res.setProducerLongitude(p.getLongitude());
        });
        return res;
    }
}

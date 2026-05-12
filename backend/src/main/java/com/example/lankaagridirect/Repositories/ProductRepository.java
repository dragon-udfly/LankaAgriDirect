package com.example.lankaagridirect.Repositories;

import com.example.lankaagridirect.Models.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends MongoRepository<Product, String> {

    Optional<Product> findByIdAndIsDeletedFalse(String id);

    Page<Product> findByIsDeletedFalse(Pageable pageable);

    Page<Product> findByCategoryAndIsDeletedFalse(String category, Pageable pageable);

    Page<Product> findByProductStatusAndIsDeletedFalse(String productStatus, Pageable pageable);

    // Producer's own products
    List<Product> findByProducerIdAndIsDeletedFalse(String producerId);

    List<Product> findByProducerIdAndIsSoldOutAndProductStatusAndIsDeletedFalse(
            String producerId, Boolean isSoldOut, String productStatus);

    // Admin moderation view
    Page<Product> findByProductStatusAndCategoryAndIsDeletedFalse(
            String productStatus, String category, Pageable pageable);

    // Count queries for reports
    long countByProductStatusAndIsDeletedFalse(String productStatus);

    long countByIsSoldOutAndIsDeletedFalse(Boolean isSoldOut);

    long countByCategoryAndIsDeletedFalse(String category);

    // Public feed — only active, non-sold-out, non-deleted
    Page<Product> findByIsSoldOutFalseAndProductStatusAndIsDeletedFalse(
            String productStatus, Pageable pageable);

    Page<Product> findByCategoryAndIsSoldOutFalseAndProductStatusAndIsDeletedFalse(
            String category, String productStatus, Pageable pageable);

    // Search by name or description
    @org.springframework.data.mongodb.repository.Query("{ 'isDeleted': false, 'isSoldOut': false, 'productStatus': 'active', " +
            "  $or: [ { 'name': { $regex: ?0, $options: 'i' } }, { 'description': { $regex: ?0, $options: 'i' } } ] }")
    Page<Product> searchProducts(String query, org.springframework.data.domain.Pageable pageable);

    @org.springframework.data.mongodb.repository.Query("{ 'isDeleted': false, 'isSoldOut': false, 'productStatus': 'active', 'category': ?1, " +
            "  $or: [ { 'name': { $regex: ?0, $options: 'i' } }, { 'description': { $regex: ?0, $options: 'i' } } ] }")
    Page<Product> searchProductsByCategory(String query, String category, org.springframework.data.domain.Pageable pageable);
}

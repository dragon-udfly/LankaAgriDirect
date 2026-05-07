package com.example.lankaagridirect.Services;

import com.example.lankaagridirect.DTOs.request.CategoryRequest;
import com.example.lankaagridirect.Exception.DuplicateResourceException;
import com.example.lankaagridirect.Exception.ResourceNotFoundException;
import com.example.lankaagridirect.Models.Category;
import com.example.lankaagridirect.Repositories.CategoryRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<Category> getAllActive() {
        return categoryRepository.findByIsActiveTrue();
    }

    public List<Category> getAll() {
        return categoryRepository.findAll();
    }

    public String create(CategoryRequest req) {
        if (categoryRepository.existsByNameIgnoreCase(req.getName())) {
            throw new DuplicateResourceException("Category '" + req.getName() + "' already exists.");
        }
        Category category = new Category();
        category.setName(req.getName());
        category.setIsActive(true);
        category.setCreatedAt(LocalDateTime.now());
        return categoryRepository.save(category).getId();
    }

    public void update(String id, CategoryRequest req) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + id));
        if (req.getName() != null) category.setName(req.getName());
        if (req.getIsActive() != null) category.setIsActive(req.getIsActive());
        categoryRepository.save(category);
    }

    public void delete(String id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + id));
        categoryRepository.delete(category);
    }
}

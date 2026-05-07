package com.example.lankaagridirect.DTOs.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class CategoryRequest {

    @NotBlank(message = "Category name is required")
    private String name;

    private Boolean isActive;
}

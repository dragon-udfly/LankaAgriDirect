package com.example.lankaagridirect.DTOs.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.List;

@Data
public class ProductCreateRequest {

    @NotBlank(message = "Product name is required")
    private String name;

    @NotBlank(message = "Category is required")
    private String category;

    private String description;

    @NotNull(message = "Unit price is required")
    @Positive(message = "Unit price must be positive")
    private Double unitPrice;

    @NotBlank(message = "Unit type is required")
    private String unitType;

    private List<String> imageUrls;
}

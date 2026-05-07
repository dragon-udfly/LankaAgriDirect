package com.example.lankaagridirect.DTOs.request;

import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.util.List;

@Data
public class ProductUpdateRequest {
    private String name;
    private String description;
    @Positive(message = "Unit price must be positive")
    private Double unitPrice;
    private List<String> imageUrls;
}

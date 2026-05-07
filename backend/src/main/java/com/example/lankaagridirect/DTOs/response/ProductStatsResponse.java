package com.example.lankaagridirect.DTOs.response;

import lombok.Data;

import java.util.Map;

@Data
public class ProductStatsResponse {
    private long totalProducts;
    private long activeProducts;
    private long soldOutProducts;
    private long suspendedProducts;
    private Map<String, Long> byCategory;
}

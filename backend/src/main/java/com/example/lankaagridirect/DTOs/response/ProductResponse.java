package com.example.lankaagridirect.DTOs.response;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class ProductResponse {
    private String id;
    private String producerId;
    private String producerName;
    private String producerStoreTitle;
    private String producerDistrict;
    private String producerProvince;
    private String producerAddress;
    private String producerPhone;
    private Double producerLatitude;
    private Double producerLongitude;
    private String name;
    private String category;
    private String description;
    private Double unitPrice;
    private String unitType;
    private List<String> imageUrls;
    private Boolean isSoldOut;
    private String productStatus;
    private LocalDateTime createdAt;
    private Double distance; // km — only in proximity search results
}

package com.example.lankaagridirect.DTOs.response;

import lombok.Data;

@Data
public class MapProducerResponse {
    private String producerId;
    private String storeTitle;
    private Double latitude;
    private Double longitude;
    private String district;
    private long productCount;
}

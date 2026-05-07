package com.example.lankaagridirect.DTOs.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AnalyticsRequest {

    @NotBlank(message = "Producer ID is required")
    private String producerId;

    private String deviceId;
}

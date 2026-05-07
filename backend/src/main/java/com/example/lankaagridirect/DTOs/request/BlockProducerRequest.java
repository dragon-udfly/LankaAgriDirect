package com.example.lankaagridirect.DTOs.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class BlockProducerRequest {

    @NotBlank(message = "Reason for blocking is required")
    private String reason;
}

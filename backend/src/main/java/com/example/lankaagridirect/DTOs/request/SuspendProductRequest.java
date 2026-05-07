package com.example.lankaagridirect.DTOs.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SuspendProductRequest {

    @NotBlank(message = "Reason for suspension is required")
    private String reason;
}

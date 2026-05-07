package com.example.lankaagridirect.DTOs.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SoldOutToggleRequest {

    @NotNull(message = "isSoldOut flag is required")
    private Boolean isSoldOut;
}

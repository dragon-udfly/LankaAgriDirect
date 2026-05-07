package com.example.lankaagridirect.DTOs.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {

    @NotBlank(message = "Login ID is required (NIC, email, or phone)")
    private String loginId;

    @NotBlank(message = "Password is required")
    private String password;
}

package com.example.lankaagridirect.DTOs.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String id;
    private String name;
    private String role;
    private String verificationStatus; // null for admins
    private String profilePictureUrl;  // null for admins
}

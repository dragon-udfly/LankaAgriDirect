package com.example.lankaagridirect.DTOs.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ApiResponse {
    private String message;
    private String id; // optional — used on create operations

    public ApiResponse(String message) {
        this.message = message;
        this.id = null;
    }
}

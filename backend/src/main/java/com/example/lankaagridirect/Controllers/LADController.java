package com.example.lankaagridirect.Controllers;

import com.example.lankaagridirect.DTOs.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Health check endpoint — confirms the backend is running.
 */
@RestController
@RequestMapping("/api/v1")
public class LADController {

    @GetMapping("/health")
    public ResponseEntity<ApiResponse> health() {
        return ResponseEntity.ok(new ApiResponse("Lanka Agri-Direct API is running."));
    }
}
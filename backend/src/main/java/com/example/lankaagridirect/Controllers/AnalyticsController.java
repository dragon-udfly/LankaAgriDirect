package com.example.lankaagridirect.Controllers;

import com.example.lankaagridirect.DTOs.request.AnalyticsRequest;
import com.example.lankaagridirect.DTOs.response.AnalyticsResponse;
import com.example.lankaagridirect.DTOs.response.ApiResponse;
import com.example.lankaagridirect.Services.AnalyticsService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @PostMapping("/call")
    public ResponseEntity<ApiResponse> trackCall(@Valid @RequestBody AnalyticsRequest req) {
        analyticsService.trackCall(req.getProducerId(), req.getDeviceId());
        return ResponseEntity.ok(new ApiResponse("Click recorded."));
    }

    @PostMapping("/address")
    public ResponseEntity<ApiResponse> trackAddressView(@Valid @RequestBody AnalyticsRequest req) {
        analyticsService.trackAddressView(req.getProducerId(), req.getDeviceId());
        return ResponseEntity.ok(new ApiResponse("View recorded."));
    }

    @GetMapping("/producer/{id}")
    public ResponseEntity<AnalyticsResponse> getProducerAnalytics(@PathVariable String id,
                                                                    Authentication auth) {
        return ResponseEntity.ok(analyticsService.getProducerAnalytics(id));
    }
}

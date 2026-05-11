package com.example.lankaagridirect.Controllers;

import com.example.lankaagridirect.DTOs.request.*;
import com.example.lankaagridirect.DTOs.response.ApiResponse;
import com.example.lankaagridirect.DTOs.response.AuthResponse;
import com.example.lankaagridirect.Services.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register/producer")
    public ResponseEntity<ApiResponse> registerProducer(@Valid @RequestBody ProducerRegisterRequest req) {
        String id = authService.registerProducer(req);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse("Registration successful. Pending admin verification.", id));
    }

    @PostMapping("/register/admin")
    public ResponseEntity<ApiResponse> registerAdmin(@Valid @RequestBody AdminRegisterRequest req) {
        String id = authService.registerAdmin(req);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse("Admin created successfully.", id));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse> getMe(Authentication auth) {
        String userId = (String) auth.getPrincipal();
        String role = auth.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");
        return ResponseEntity.ok(authService.getCurrentUser(userId, role));
    }

    @GetMapping("/me/profile")
    public ResponseEntity<?> getMyProfile(Authentication auth) {
        String userId = (String) auth.getPrincipal();
        return ResponseEntity.ok(authService.getMyProfile(userId));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse> updateProfile(Authentication auth,
                                                      @Valid @RequestBody UpdateProfileRequest req) {
        String userId = (String) auth.getPrincipal();
        authService.updateProfile(userId, req);
        return ResponseEntity.ok(new ApiResponse("Profile updated successfully."));
    }

    @DeleteMapping("/profile")
    public ResponseEntity<ApiResponse> deleteAccount(Authentication auth) {
        String userId = (String) auth.getPrincipal();
        authService.deleteAccount(userId);
        return ResponseEntity.ok(new ApiResponse("Account deleted successfully."));
    }
}

package com.example.lankaagridirect.Services;

import com.example.lankaagridirect.DTOs.request.*;
import com.example.lankaagridirect.DTOs.response.AuthResponse;
import com.example.lankaagridirect.DTOs.response.ProducerAdminResponse;
import com.example.lankaagridirect.Exception.BusinessRuleException;
import com.example.lankaagridirect.Exception.DuplicateResourceException;
import com.example.lankaagridirect.Exception.ResourceNotFoundException;
import com.example.lankaagridirect.Models.Admin;
import com.example.lankaagridirect.Models.Producer;
import com.example.lankaagridirect.Repositories.AdminRepository;
import com.example.lankaagridirect.Repositories.ProducerRepository;
import com.example.lankaagridirect.Security.JwtUtil;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuthService {

    private final ProducerRepository producerRepository;
    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(ProducerRepository producerRepository,
                       AdminRepository adminRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.producerRepository = producerRepository;
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    // ─── Producer Registration ────────────────────────────────────────────────
    public String registerProducer(ProducerRegisterRequest req) {
        if (producerRepository.findByNicAndIsDeletedFalse(req.getNic()).isPresent()) {
            throw new DuplicateResourceException("A producer with this NIC is already registered.");
        }
        if (req.getEmail() != null && !req.getEmail().isBlank() &&
                producerRepository.findByEmailAndIsDeletedFalse(req.getEmail()).isPresent()) {
            throw new DuplicateResourceException("A producer with this email is already registered.");
        }

        Producer producer = new Producer();
        producer.setFirstName(req.getFirstName());
        producer.setLastName(req.getLastName());
        producer.setNic(req.getNic());
        producer.setNicPhotoUrl(req.getNicPhotoUrl());
        producer.setProfilePictureUrl(req.getProfilePictureUrl());
        producer.setBusinessPhone(req.getBusinessPhone());
        producer.setMobilePhone(req.getMobilePhone());
        producer.setEmail(req.getEmail());
        producer.setStoreTitle(req.getStoreTitle());
        producer.setOperatingDays(req.getOperatingDays());
        producer.setStartTime(req.getStartTime());
        producer.setEndTime(req.getEndTime());
        producer.setLatitude(req.getLatitude());
        producer.setLongitude(req.getLongitude());
        producer.setLocationDescription(req.getLocationDescription());
        producer.setHomeAddress(req.getHomeAddress());
        producer.setStoreAddress(req.getStoreAddress());
        producer.setDistrict(req.getDistrict());
        producer.setProvince(req.getProvince());
        producer.setGnDivision(req.getGnDivision());
        producer.setBusinessType(req.getBusinessType());
        producer.setPassword(passwordEncoder.encode(req.getPassword()));
        producer.setVerificationStatus("pending");
        producer.setIsDeleted(false);
        producer.setCreatedAt(LocalDateTime.now());
        producer.setModifiedAt(LocalDateTime.now());

        return producerRepository.save(producer).getId();
    }

    // ─── Admin Registration (first-time only guard) ───────────────────────────
    public String registerAdmin(AdminRegisterRequest req) {
        if (adminRepository.existsByUsername(req.getUsername())) {
            throw new DuplicateResourceException("Username '" + req.getUsername() + "' is already taken.");
        }

        Admin admin = new Admin();
        admin.setName(req.getName());
        admin.setUsername(req.getUsername());
        admin.setPassword(passwordEncoder.encode(req.getPassword()));
        admin.setIsDeleted(false);
        admin.setCreatedAt(LocalDateTime.now());
        admin.setModifiedAt(LocalDateTime.now());

        return adminRepository.save(admin).getId();
    }

    // ─── Login (Producer or Admin) ────────────────────────────────────────────
    public AuthResponse login(LoginRequest req) {
        // Try admin first
        var adminOpt = adminRepository.findByUsernameAndIsDeletedFalse(req.getLoginId());
        if (adminOpt.isPresent()) {
            Admin admin = adminOpt.get();
            if (!passwordEncoder.matches(req.getPassword(), admin.getPassword())) {
                throw new BadCredentialsException("Invalid credentials");
            }
            String token = jwtUtil.generateToken(admin.getId(), "ADMIN");
            return new AuthResponse(token, admin.getId(), admin.getName(), "ADMIN", null, null);
        }

        // Try producer — loginId can be NIC, email, or business phone
        Producer producer = producerRepository.findByNicAndIsDeletedFalse(req.getLoginId())
                .or(() -> producerRepository.findByEmailAndIsDeletedFalse(req.getLoginId()))
                .or(() -> producerRepository.findByBusinessPhoneAndIsDeletedFalse(req.getLoginId()))
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        if (producer.getIsDeleted()) {
            throw new BadCredentialsException("Account has been deleted");
        }
        if ("blocked".equals(producer.getVerificationStatus())) {
            throw new BusinessRuleException("Your account has been blocked. Please contact support.");
        }
        if (!passwordEncoder.matches(req.getPassword(), producer.getPassword())) {
            throw new BadCredentialsException("Invalid credentials");
        }

        String token = jwtUtil.generateToken(producer.getId(), "PRODUCER");
        String name = producer.getFirstName() + " " + producer.getLastName();
        return new AuthResponse(token, producer.getId(), name, "PRODUCER", producer.getVerificationStatus(), producer.getProfilePictureUrl());
    }

    // ─── Get Current User ─────────────────────────────────────────────────────
    public AuthResponse getCurrentUser(String userId, String role) {
        if ("PRODUCER".equals(role)) {
            Producer p = producerRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Producer not found"));
            return new AuthResponse(null, p.getId(),
                    p.getFirstName() + " " + p.getLastName(), "PRODUCER", p.getVerificationStatus(), p.getProfilePictureUrl());
        } else {
            Admin a = adminRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));
            return new AuthResponse(null, a.getId(), a.getName(), "ADMIN", null, null);
        }
    }

    // ─── Get My Full Profile (for Account Settings) ────────────────────────────
    public com.example.lankaagridirect.DTOs.response.ProducerProfileResponse getMyProfile(String producerId) {
        Producer producer = producerRepository.findById(producerId)
                .orElseThrow(() -> new ResourceNotFoundException("Producer not found"));

        var resp = new com.example.lankaagridirect.DTOs.response.ProducerProfileResponse();
        resp.setId(producer.getId());
        resp.setFirstName(producer.getFirstName());
        resp.setLastName(producer.getLastName());
        resp.setNic(producer.getNic());
        resp.setNicPhotoUrl(producer.getNicPhotoUrl());
        resp.setProfilePictureUrl(producer.getProfilePictureUrl());
        resp.setBusinessPhone(producer.getBusinessPhone());
        resp.setMobilePhone(producer.getMobilePhone());
        resp.setEmail(producer.getEmail());
        resp.setStoreTitle(producer.getStoreTitle());
        resp.setOperatingDays(producer.getOperatingDays());
        resp.setStartTime(producer.getStartTime());
        resp.setEndTime(producer.getEndTime());
        resp.setLatitude(producer.getLatitude());
        resp.setLongitude(producer.getLongitude());
        resp.setLocationDescription(producer.getLocationDescription());
        resp.setHomeAddress(producer.getHomeAddress());
        resp.setStoreAddress(producer.getStoreAddress());
        resp.setDistrict(producer.getDistrict());
        resp.setProvince(producer.getProvince());
        resp.setGnDivision(producer.getGnDivision());
        resp.setBusinessType(producer.getBusinessType());
        resp.setVerificationStatus(producer.getVerificationStatus());
        resp.setRole("PRODUCER");
        resp.setName(producer.getFirstName() + " " + producer.getLastName());
        return resp;
    }

    // ─── Update Profile ───────────────────────────────────────────────────────
    public void updateProfile(String producerId, UpdateProfileRequest req) {
        Producer producer = producerRepository.findById(producerId)
                .orElseThrow(() -> new ResourceNotFoundException("Producer not found"));

        if (req.getFirstName() != null)        producer.setFirstName(req.getFirstName());
        if (req.getLastName() != null)          producer.setLastName(req.getLastName());
        if (req.getBusinessPhone() != null)     producer.setBusinessPhone(req.getBusinessPhone());
        if (req.getMobilePhone() != null)       producer.setMobilePhone(req.getMobilePhone());
        if (req.getEmail() != null)             producer.setEmail(req.getEmail());
        if (req.getStoreTitle() != null)        producer.setStoreTitle(req.getStoreTitle());
        if (req.getOperatingDays() != null)     producer.setOperatingDays(req.getOperatingDays());
        if (req.getStartTime() != null)         producer.setStartTime(req.getStartTime());
        if (req.getEndTime() != null)           producer.setEndTime(req.getEndTime());
        if (req.getLatitude() != null)          producer.setLatitude(req.getLatitude());
        if (req.getLongitude() != null)         producer.setLongitude(req.getLongitude());
        if (req.getLocationDescription() != null) producer.setLocationDescription(req.getLocationDescription());
        if (req.getHomeAddress() != null)       producer.setHomeAddress(req.getHomeAddress());
        if (req.getStoreAddress() != null)      producer.setStoreAddress(req.getStoreAddress());
        if (req.getProfilePictureUrl() != null) producer.setProfilePictureUrl(req.getProfilePictureUrl());
        if (req.getPassword() != null)          producer.setPassword(passwordEncoder.encode(req.getPassword()));

        producer.setModifiedAt(LocalDateTime.now());
        producerRepository.save(producer);
    }

    // ─── Soft Delete Account ──────────────────────────────────────────────────
    public void deleteAccount(String producerId) {
        Producer producer = producerRepository.findById(producerId)
                .orElseThrow(() -> new ResourceNotFoundException("Producer not found"));
        producer.setIsDeleted(true);
        producer.setModifiedAt(LocalDateTime.now());
        producerRepository.save(producer);
    }
}

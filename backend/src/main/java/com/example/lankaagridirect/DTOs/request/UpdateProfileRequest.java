package com.example.lankaagridirect.DTOs.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

/**
 * Partial update request for producer profile.
 * All fields are optional — only non-null fields will be applied.
 */
@Data
public class UpdateProfileRequest {
    private String firstName;
    private String lastName;
    private String businessPhone;
    private String mobilePhone;
    @Email(message = "Invalid email format")
    private String email;
    private String storeTitle;
    private List<String> operatingDays;
    private String startTime;
    private String endTime;
    private Double latitude;
    private Double longitude;
    private String locationDescription;
    private String homeAddress;
    private String storeAddress;
    private String profilePictureUrl;
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;
    
    private String district;
    private String province;
    private String gnDivision;
    private String businessType;
}

package com.example.lankaagridirect.DTOs.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.List;

@Data
public class ProducerRegisterRequest {

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @NotBlank(message = "NIC is required")
    private String nic;

    @NotBlank(message = "NIC photo URL is required")
    private String nicPhotoUrl;

    private String profilePictureUrl;

    @NotBlank(message = "Business phone is required")
    private String businessPhone;

    private String mobilePhone;

    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Store title is required")
    private String storeTitle;

    @NotEmpty(message = "Operating days are required")
    private List<String> operatingDays;

    @NotBlank(message = "Start time is required")
    private String startTime;

    @NotBlank(message = "End time is required")
    private String endTime;

    @NotNull(message = "Latitude is required")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    private Double longitude;

    private String locationDescription;

    @NotBlank(message = "Home address is required")
    private String homeAddress;

    private String storeAddress;

    @NotBlank(message = "District is required")
    private String district;

    @NotBlank(message = "Province is required")
    private String province;

    @NotBlank(message = "GN Division is required")
    private String gnDivision;

    @NotBlank(message = "Business type is required")
    @Pattern(regexp = "small-scale|home-gardener", message = "Business type must be 'small-scale' or 'home-gardener'")
    private String businessType;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;
}

package com.example.lankaagridirect.DTOs.response;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/** Full producer view for Admin — includes NIC and all sensitive fields. */
@Data
public class ProducerAdminResponse {
    private String id;
    private String firstName;
    private String lastName;
    private String nic;
    private String nicPhotoUrl;
    private String profilePictureUrl;
    private String businessPhone;
    private String mobilePhone;
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
    private String district;
    private String province;
    private String gnDivision;
    private String businessType;
    private String verificationStatus;
    private LocalDateTime createdAt;
    private LocalDateTime modifiedAt;
}

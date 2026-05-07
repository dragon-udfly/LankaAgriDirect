package com.example.lankaagridirect.DTOs.response;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/** Safe public view of a producer — no NIC or sensitive fields. */
@Data
public class ProducerPublicResponse {
    private String id;
    private String storeTitle;
    private String profilePictureUrl;
    private String businessPhone;
    private String homeAddress;
    private String storeAddress;
    private String district;
    private String province;
    private String gnDivision;
    private String businessType;
    private List<String> operatingDays;
    private String startTime;
    private String endTime;
    private Double latitude;
    private Double longitude;
    private String verificationStatus;
    private LocalDateTime createdAt;
    private Double distance; // km — populated only in proximity search results
}

package com.example.lankaagridirect.Models;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@Document(collection = "producers")
public class Producer {

    @Id
    private String id;

    private String firstName;
    private String lastName;

    @Indexed(unique = true)
    private String nic;

    private String nicPhotoUrl;
    private String profilePictureUrl;
    private String businessPhone;
    private String mobilePhone;

    @Indexed(unique = true, sparse = true)
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

    @Indexed
    private String district;

    @Indexed
    private String province;

    private String gnDivision;
    private String businessType;

    @Indexed
    private String verificationStatus = "pending";

    private String password;

    private Boolean isDeleted = false;
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime modifiedAt = LocalDateTime.now();
}
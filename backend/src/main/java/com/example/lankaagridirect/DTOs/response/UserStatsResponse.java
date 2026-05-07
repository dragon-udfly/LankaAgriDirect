package com.example.lankaagridirect.DTOs.response;

import lombok.Data;

@Data
public class UserStatsResponse {
    private long totalProducers;
    private long verifiedProducers;
    private long pendingProducers;
    private long blockedProducers;
    private long totalAdmins;
}

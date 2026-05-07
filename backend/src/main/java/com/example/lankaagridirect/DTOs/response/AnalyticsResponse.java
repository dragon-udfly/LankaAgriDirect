package com.example.lankaagridirect.DTOs.response;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class AnalyticsResponse {
    private String producerId;
    private long totalCallClicks;
    private long totalAddressViews;
    private List<DailyStat> dailyStats;

    @Data
    public static class DailyStat {
        private String date;
        private long calls;
        private long addressViews;
    }
}

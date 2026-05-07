package com.example.lankaagridirect.Services;

import com.example.lankaagridirect.DTOs.response.AnalyticsResponse;
import com.example.lankaagridirect.Models.LeadAnalytic;
import com.example.lankaagridirect.Repositories.LeadAnalyticRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final LeadAnalyticRepository leadAnalyticRepository;

    public AnalyticsService(LeadAnalyticRepository leadAnalyticRepository) {
        this.leadAnalyticRepository = leadAnalyticRepository;
    }

    public void trackCall(String producerId, String deviceId) {
        save(producerId, deviceId, "clicked_call");
    }

    public void trackAddressView(String producerId, String deviceId) {
        save(producerId, deviceId, "viewed_address");
    }

    private void save(String producerId, String deviceId, String actionType) {
        LeadAnalytic lead = new LeadAnalytic();
        lead.setProducerId(producerId);
        lead.setDeviceId(deviceId);
        lead.setActionType(actionType);
        lead.setTimestamp(LocalDateTime.now());
        leadAnalyticRepository.save(lead);
    }

    public AnalyticsResponse getProducerAnalytics(String producerId) {
        List<LeadAnalytic> logs = leadAnalyticRepository.findByProducerId(producerId);

        long calls = logs.stream().filter(l -> "clicked_call".equals(l.getActionType())).count();
        long views = logs.stream().filter(l -> "viewed_address".equals(l.getActionType())).count();

        // Group by date for daily stats
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        Map<String, AnalyticsResponse.DailyStat> byDate = new TreeMap<>();

        for (LeadAnalytic log : logs) {
            String date = log.getTimestamp().format(fmt);
            AnalyticsResponse.DailyStat stat = byDate.computeIfAbsent(date, d -> {
                AnalyticsResponse.DailyStat s = new AnalyticsResponse.DailyStat();
                s.setDate(d);
                return s;
            });
            if ("clicked_call".equals(log.getActionType())) {
                stat.setCalls(stat.getCalls() + 1);
            } else {
                stat.setAddressViews(stat.getAddressViews() + 1);
            }
        }

        AnalyticsResponse response = new AnalyticsResponse();
        response.setProducerId(producerId);
        response.setTotalCallClicks(calls);
        response.setTotalAddressViews(views);
        response.setDailyStats(new ArrayList<>(byDate.values()));
        return response;
    }
}

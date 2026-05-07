package com.example.lankaagridirect.Repositories;

import com.example.lankaagridirect.Models.LeadAnalytic;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LeadAnalyticRepository extends MongoRepository<LeadAnalytic, String> {

    List<LeadAnalytic> findByProducerId(String producerId);

    List<LeadAnalytic> findByProducerIdAndTimestampBetween(
            String producerId, LocalDateTime start, LocalDateTime end);

    List<LeadAnalytic> findByTimestampBetween(LocalDateTime start, LocalDateTime end);

    long countByProducerIdAndActionType(String producerId, String actionType);

    long countByActionType(String actionType);
}

package com.example.lankaagridirect.Repositories;

import com.example.lankaagridirect.Models.ProducerAuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProducerAuditLogRepository extends MongoRepository<ProducerAuditLog, String> {

    Page<ProducerAuditLog> findByProducerIdOrderByPerformedAtDesc(String producerId, Pageable pageable);

    Page<ProducerAuditLog> findAllByOrderByPerformedAtDesc(Pageable pageable);
}

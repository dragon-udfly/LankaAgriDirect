package com.example.lankaagridirect.Repositories;

import com.example.lankaagridirect.Models.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface AuditLogRepository extends MongoRepository<AuditLog, String> {

    Page<AuditLog> findByAdminId(String adminId, Pageable pageable);

    Page<AuditLog> findByPerformedAtBetween(LocalDateTime start, LocalDateTime end, Pageable pageable);

    Page<AuditLog> findByAdminIdAndPerformedAtBetween(
            String adminId, LocalDateTime start, LocalDateTime end, Pageable pageable);

    Page<AuditLog> findAllByOrderByPerformedAtDesc(Pageable pageable);
}

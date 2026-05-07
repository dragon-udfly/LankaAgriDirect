package com.example.lankaagridirect.Services;

import com.example.lankaagridirect.Models.AuditLog;
import com.example.lankaagridirect.Models.ProducerAuditLog;
import com.example.lankaagridirect.Repositories.AuditLogRepository;
import com.example.lankaagridirect.Repositories.ProducerAuditLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * Handles append-only audit logging for Admin and Producer actions.
 * Logs are never updated or deleted.
 */
@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final ProducerAuditLogRepository producerAuditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository,
                           ProducerAuditLogRepository producerAuditLogRepository) {
        this.auditLogRepository = auditLogRepository;
        this.producerAuditLogRepository = producerAuditLogRepository;
    }

    public void logAdminAction(String adminId, String action, String description) {
        AuditLog log = new AuditLog();
        log.setAdminId(adminId);
        log.setAction(action);
        log.setDescription(description);
        log.setPerformedAt(LocalDateTime.now());
        auditLogRepository.save(log);
    }

    public void logProducerAction(String producerId, String action, String description) {
        ProducerAuditLog log = new ProducerAuditLog();
        log.setProducerId(producerId);
        log.setAction(action);
        log.setDescription(description);
        log.setPerformedAt(LocalDateTime.now());
        producerAuditLogRepository.save(log);
    }

    public Page<AuditLog> getAdminLogs(String adminId, LocalDateTime start,
                                        LocalDateTime end, Pageable pageable) {
        if (adminId != null && start != null && end != null) {
            return auditLogRepository.findByAdminIdAndPerformedAtBetween(adminId, start, end, pageable);
        } else if (adminId != null) {
            return auditLogRepository.findByAdminId(adminId, pageable);
        } else if (start != null && end != null) {
            return auditLogRepository.findByPerformedAtBetween(start, end, pageable);
        }
        return auditLogRepository.findAllByOrderByPerformedAtDesc(pageable);
    }

    public Page<ProducerAuditLog> getProducerLogs(String producerId, Pageable pageable) {
        return producerAuditLogRepository.findByProducerIdOrderByPerformedAtDesc(producerId, pageable);
    }
}

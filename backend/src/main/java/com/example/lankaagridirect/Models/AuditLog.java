package com.example.lankaagridirect.Models;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * Immutable audit log for all Admin actions.
 * Append-only — records must never be updated or deleted.
 */
@Data
@NoArgsConstructor
@Document(collection = "admin_audit_logs")
public class AuditLog {

    @Id
    private String id;

    @Indexed
    private String adminId;

    private String action;       // e.g. "VERIFY_PRODUCER", "BLOCK_PRODUCER"
    private String description;  // e.g. "Verified producer John Doe (ID: abc123)"
    private LocalDateTime performedAt = LocalDateTime.now();
}

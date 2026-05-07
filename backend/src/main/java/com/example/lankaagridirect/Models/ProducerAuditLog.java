package com.example.lankaagridirect.Models;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * Immutable audit log for Producer self-actions.
 * Append-only — records must never be updated or deleted.
 */
@Data
@NoArgsConstructor
@Document(collection = "producer_audit_logs")
public class ProducerAuditLog {

    @Id
    private String id;

    @Indexed
    private String producerId;

    private String action;       // e.g. "CREATE_PRODUCT", "TOGGLE_SOLD_OUT", "UPDATE_PROFILE"
    private String description;  // e.g. "Created product 'Fresh Mango'"
    private LocalDateTime performedAt = LocalDateTime.now();
}

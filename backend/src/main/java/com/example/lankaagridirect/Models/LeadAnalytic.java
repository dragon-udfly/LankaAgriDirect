package com.example.lankaagridirect.Models;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@Document(collection = "lead_analytics")
public class LeadAnalytic {

    @Id
    private String id;

    @Indexed
    private String producerId;

    private LocalDateTime timestamp = LocalDateTime.now();

    /**
     * Type of buyer interaction.
     * Values: "clicked_call" | "viewed_address"
     */
    private String actionType;

    private String buyerDeviceId; // stored as buyerDeviceId, setter exposed as setDeviceId for service use

    public void setDeviceId(String deviceId) {
        this.buyerDeviceId = deviceId;
    }

}

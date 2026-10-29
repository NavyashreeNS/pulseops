package com.pulseops.dto;

import java.time.Instant;
import java.util.Map;

public class AuditLogDTO {
    private String id;
    private Long incidentId;
    private String trackingNumber;
    private String action;
    private String performedBy;
    private Map<String, Object> changes;
    private String notes;
    private Instant timestamp;

    public AuditLogDTO() {}

    public AuditLogDTO(String id, Long incidentId, String trackingNumber, String action,
                       String performedBy, Map<String, Object> changes, String notes, Instant timestamp) {
        this.id = id;
        this.incidentId = incidentId;
        this.trackingNumber = trackingNumber;
        this.action = action;
        this.performedBy = performedBy;
        this.changes = changes;
        this.notes = notes;
        this.timestamp = timestamp;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Long getIncidentId() { return incidentId; }
    public void setIncidentId(Long incidentId) { this.incidentId = incidentId; }

    public String getTrackingNumber() { return trackingNumber; }
    public void setTrackingNumber(String trackingNumber) { this.trackingNumber = trackingNumber; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getPerformedBy() { return performedBy; }
    public void setPerformedBy(String performedBy) { this.performedBy = performedBy; }

    public Map<String, Object> getChanges() { return changes; }
    public void setChanges(Map<String, Object> changes) { this.changes = changes; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
}

package com.pulseops.model.mongo;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.Map;

@Document(collection = "incident_audit_logs")
public class IncidentAuditLog {

    @Id
    private String id;

    @Indexed
    private Long incidentId;

    @Indexed
    private String trackingNumber;

    private String action; // e.g. "INCIDENT_CREATED", "STATUS_CHANGED", "SEVERITY_ESCALATED", "ASSIGNEE_UPDATED"

    private String performedBy;

    private Map<String, Object> changes; // Before & after state diff

    private String notes;

    @Indexed
    private Instant timestamp = Instant.now();

    public IncidentAuditLog() {}

    public IncidentAuditLog(Long incidentId, String trackingNumber, String action,
                            String performedBy, Map<String, Object> changes, String notes) {
        this.incidentId = incidentId;
        this.trackingNumber = trackingNumber;
        this.action = action;
        this.performedBy = performedBy;
        this.changes = changes;
        this.notes = notes;
        this.timestamp = Instant.now();
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

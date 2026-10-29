package com.pulseops.dto;

import com.pulseops.model.sql.IncidentStatus;
import com.pulseops.model.sql.Severity;

import java.time.Instant;
import java.util.Map;

public class IncidentResponseDTO {

    private Long id;
    private String trackingNumber;
    private String title;
    private String description;
    private String serviceName;
    private Severity severity;
    private IncidentStatus status;
    private String reportedByUsername;
    private String assigneeUsername;
    private Long assigneeId;
    private Instant createdAt;
    private Instant slaDeadline;
    private Instant resolvedAt;
    private boolean slaBreached;
    private Long version;

    // MongoDB telemetry/payload data
    private String errorSignature;
    private String stackTrace;
    private Map<String, Object> diagnosticPayload;

    public IncidentResponseDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTrackingNumber() { return trackingNumber; }
    public void setTrackingNumber(String trackingNumber) { this.trackingNumber = trackingNumber; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getServiceName() { return serviceName; }
    public void setServiceName(String serviceName) { this.serviceName = serviceName; }

    public Severity getSeverity() { return severity; }
    public void setSeverity(Severity severity) { this.severity = severity; }

    public IncidentStatus getStatus() { return status; }
    public void setStatus(IncidentStatus status) { this.status = status; }

    public String getReportedByUsername() { return reportedByUsername; }
    public void setReportedByUsername(String reportedByUsername) { this.reportedByUsername = reportedByUsername; }

    public String getAssigneeUsername() { return assigneeUsername; }
    public void setAssigneeUsername(String assigneeUsername) { this.assigneeUsername = assigneeUsername; }

    public Long getAssigneeId() { return assigneeId; }
    public void setAssigneeId(Long assigneeId) { this.assigneeId = assigneeId; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getSlaDeadline() { return slaDeadline; }
    public void setSlaDeadline(Instant slaDeadline) { this.slaDeadline = slaDeadline; }

    public Instant getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(Instant resolvedAt) { this.resolvedAt = resolvedAt; }

    public boolean isSlaBreached() { return slaBreached; }
    public void setSlaBreached(boolean slaBreached) { this.slaBreached = slaBreached; }

    public Long getVersion() { return version; }
    public void setVersion(Long version) { this.version = version; }

    public String getErrorSignature() { return errorSignature; }
    public void setErrorSignature(String errorSignature) { this.errorSignature = errorSignature; }

    public String getStackTrace() { return stackTrace; }
    public void setStackTrace(String stackTrace) { this.stackTrace = stackTrace; }

    public Map<String, Object> getDiagnosticPayload() { return diagnosticPayload; }
    public void setDiagnosticPayload(Map<String, Object> diagnosticPayload) { this.diagnosticPayload = diagnosticPayload; }
}

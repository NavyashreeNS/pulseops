package com.pulseops.dto;

import com.pulseops.model.sql.Severity;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.Map;

public class IncidentCreateRequest {

    @NotBlank
    private String title;

    private String description;

    @NotBlank
    private String serviceName;

    @NotNull
    private Severity severity;

    private Long assigneeId;

    // NoSQL dynamic fields for MongoDB
    private String errorSignature;
    private String stackTrace;
    private Map<String, Object> diagnosticPayload;

    public IncidentCreateRequest() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getServiceName() { return serviceName; }
    public void setServiceName(String serviceName) { this.serviceName = serviceName; }

    public Severity getSeverity() { return severity; }
    public void setSeverity(Severity severity) { this.severity = severity; }

    public Long getAssigneeId() { return assigneeId; }
    public void setAssigneeId(Long assigneeId) { this.assigneeId = assigneeId; }

    public String getErrorSignature() { return errorSignature; }
    public void setErrorSignature(String errorSignature) { this.errorSignature = errorSignature; }

    public String getStackTrace() { return stackTrace; }
    public void setStackTrace(String stackTrace) { this.stackTrace = stackTrace; }

    public Map<String, Object> getDiagnosticPayload() { return diagnosticPayload; }
    public void setDiagnosticPayload(Map<String, Object> diagnosticPayload) { this.diagnosticPayload = diagnosticPayload; }
}

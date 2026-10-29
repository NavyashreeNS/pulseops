package com.pulseops.dto;

import com.pulseops.model.sql.IncidentStatus;
import com.pulseops.model.sql.Severity;

import java.util.Map;

public class IncidentUpdateRequest {

    private IncidentStatus status;
    private Severity severity;
    private Long assigneeId;
    private String notes;
    private Map<String, Object> diagnosticUpdates;

    public IncidentUpdateRequest() {}

    public IncidentStatus getStatus() { return status; }
    public void setStatus(IncidentStatus status) { this.status = status; }

    public Severity getSeverity() { return severity; }
    public void setSeverity(Severity severity) { this.severity = severity; }

    public Long getAssigneeId() { return assigneeId; }
    public void setAssigneeId(Long assigneeId) { this.assigneeId = assigneeId; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public Map<String, Object> getDiagnosticUpdates() { return diagnosticUpdates; }
    public void setDiagnosticUpdates(Map<String, Object> diagnosticUpdates) { this.diagnosticUpdates = diagnosticUpdates; }
}

package com.pulseops.model.mongo;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.Map;

@Document(collection = "incident_telemetry")
public class IncidentTelemetry {

    @Id
    private String id;

    @Indexed
    private Long incidentId;

    @Indexed
    private String trackingNumber;

    private String errorSignature;

    private String stackTrace;

    private Map<String, Object> diagnosticPayload; // Flexible NoSQL attributes (pod, latency, status code, headers)

    @Indexed
    private Instant recordedAt = Instant.now();

    public IncidentTelemetry() {}

    public IncidentTelemetry(Long incidentId, String trackingNumber, String errorSignature,
                             String stackTrace, Map<String, Object> diagnosticPayload) {
        this.incidentId = incidentId;
        this.trackingNumber = trackingNumber;
        this.errorSignature = errorSignature;
        this.stackTrace = stackTrace;
        this.diagnosticPayload = diagnosticPayload;
        this.recordedAt = Instant.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Long getIncidentId() { return incidentId; }
    public void setIncidentId(Long incidentId) { this.incidentId = incidentId; }

    public String getTrackingNumber() { return trackingNumber; }
    public void setTrackingNumber(String trackingNumber) { this.trackingNumber = trackingNumber; }

    public String getErrorSignature() { return errorSignature; }
    public void setErrorSignature(String errorSignature) { this.errorSignature = errorSignature; }

    public String getStackTrace() { return stackTrace; }
    public void setStackTrace(String stackTrace) { this.stackTrace = stackTrace; }

    public Map<String, Object> getDiagnosticPayload() { return diagnosticPayload; }
    public void setDiagnosticPayload(Map<String, Object> diagnosticPayload) { this.diagnosticPayload = diagnosticPayload; }

    public Instant getRecordedAt() { return recordedAt; }
    public void setRecordedAt(Instant recordedAt) { this.recordedAt = recordedAt; }
}

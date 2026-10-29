package com.pulseops.service;

import com.pulseops.dto.*;
import com.pulseops.model.mongo.IncidentTelemetry;
import com.pulseops.model.sql.*;
import com.pulseops.repository.mongo.IncidentTelemetryRepository;
import com.pulseops.repository.sql.IncidentRepository;
import com.pulseops.repository.sql.SlaPolicyRepository;
import com.pulseops.repository.sql.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class IncidentService {

    private static final Logger log = LoggerFactory.getLogger(IncidentService.class);

    private final IncidentRepository incidentRepository;
    private final UserRepository userRepository;
    private final SlaPolicyRepository slaPolicyRepository;
    private final IncidentTelemetryRepository telemetryRepository;
    private final AuditService auditService;
    private final SimpMessagingTemplate messagingTemplate;

    // In-memory fallback cache for telemetry when MongoDB is not active
    private final Map<Long, IncidentTelemetry> telemetryMemoryFallback = new ConcurrentHashMap<>();

    public IncidentService(IncidentRepository incidentRepository,
                           UserRepository userRepository,
                           SlaPolicyRepository slaPolicyRepository,
                           IncidentTelemetryRepository telemetryRepository,
                           AuditService auditService,
                           SimpMessagingTemplate messagingTemplate) {
        this.incidentRepository = incidentRepository;
        this.userRepository = userRepository;
        this.slaPolicyRepository = slaPolicyRepository;
        this.telemetryRepository = telemetryRepository;
        this.auditService = auditService;
        this.messagingTemplate = messagingTemplate;
    }

    public List<IncidentResponseDTO> getAllIncidents(IncidentStatus status, Severity severity) {
        List<Incident> incidents = incidentRepository.findFiltered(status, severity);
        return incidents.stream().map(this::enrichIncidentDTO).collect(Collectors.toList());
    }

    public IncidentResponseDTO getIncidentById(Long id) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Incident not found with ID: " + id));
        return enrichIncidentDTO(incident);
    }

    public IncidentResponseDTO getIncidentByTrackingNumber(String trackingNumber) {
        Incident incident = incidentRepository.findByTrackingNumber(trackingNumber)
                .orElseThrow(() -> new NoSuchElementException("Incident not found with tracking number: " + trackingNumber));
        return enrichIncidentDTO(incident);
    }

    @Transactional
    public IncidentResponseDTO createIncident(IncidentCreateRequest request, String currentUsername) {
        User reportedBy = userRepository.findByUsername(currentUsername)
                .orElseGet(() -> userRepository.findAll().stream().findFirst().orElseThrow());

        // SLA deadline calculation
        int slaMinutes = slaPolicyRepository.findBySeverity(request.getSeverity())
                .map(SlaPolicy::getTargetResolutionMinutes)
                .orElse(240);

        Instant slaDeadline = Instant.now().plus(slaMinutes, ChronoUnit.MINUTES);
        String trackingNumber = "INC-" + (1000 + new Random().nextInt(9000));

        Incident incident = new Incident(
                trackingNumber,
                request.getTitle(),
                request.getDescription(),
                request.getServiceName(),
                request.getSeverity(),
                reportedBy,
                slaDeadline
        );

        if (request.getAssigneeId() != null) {
            userRepository.findById(request.getAssigneeId()).ifPresent(incident::setAssignee);
        }

        // 1. Relational Persistence in SQL (ACID guarantee)
        Incident savedIncident = incidentRepository.save(incident);

        // 2. Telemetry Persistence in MongoDB (Flexible Document Schema)
        if (request.getErrorSignature() != null || request.getDiagnosticPayload() != null || request.getStackTrace() != null) {
            IncidentTelemetry telemetry = new IncidentTelemetry(
                    savedIncident.getId(),
                    savedIncident.getTrackingNumber(),
                    request.getErrorSignature(),
                    request.getStackTrace(),
                    request.getDiagnosticPayload() != null ? request.getDiagnosticPayload() : new HashMap<>()
            );
            telemetryMemoryFallback.put(savedIncident.getId(), telemetry);
            try {
                telemetryRepository.save(telemetry);
            } catch (Exception ex) {
                log.warn("MongoDB unavailable, cached telemetry in memory fallback for incident: {}", savedIncident.getTrackingNumber());
            }
        }

        // 3. Event-Sourcing Audit Log in MongoDB
        Map<String, Object> changes = new HashMap<>();
        changes.put("title", savedIncident.getTitle());
        changes.put("severity", savedIncident.getSeverity().name());
        changes.put("serviceName", savedIncident.getServiceName());
        changes.put("slaDeadline", savedIncident.getSlaDeadline().toString());

        auditService.logEvent(
                savedIncident.getId(),
                savedIncident.getTrackingNumber(),
                "INCIDENT_CREATED",
                currentUsername,
                changes,
                "Initial incident triage created"
        );

        IncidentResponseDTO responseDTO = enrichIncidentDTO(savedIncident);

        // 4. Real-Time Broadcast to Frontend Dashboard
        try {
            messagingTemplate.convertAndSend("/topic/incidents", responseDTO);
        } catch (Exception ex) {
            log.debug("WebSocket broadcast skipped: {}", ex.getMessage());
        }

        return responseDTO;
    }

    @Transactional
    public IncidentResponseDTO updateIncident(Long id, IncidentUpdateRequest request, String currentUsername) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Incident not found with ID: " + id));

        Map<String, Object> diff = new HashMap<>();

        if (request.getStatus() != null && request.getStatus() != incident.getStatus()) {
            diff.put("previousStatus", incident.getStatus().name());
            diff.put("newStatus", request.getStatus().name());
            incident.setStatus(request.getStatus());

            if (request.getStatus() == IncidentStatus.RESOLVED) {
                incident.setResolvedAt(Instant.now());
                if (incident.getResolvedAt().isAfter(incident.getSlaDeadline())) {
                    incident.setSlaBreached(true);
                }
            }
        }

        if (request.getSeverity() != null && request.getSeverity() != incident.getSeverity()) {
            diff.put("previousSeverity", incident.getSeverity().name());
            diff.put("newSeverity", request.getSeverity().name());
            incident.setSeverity(request.getSeverity());

            int slaMinutes = slaPolicyRepository.findBySeverity(request.getSeverity())
                    .map(SlaPolicy::getTargetResolutionMinutes)
                    .orElse(240);
            incident.setSlaDeadline(incident.getCreatedAt().plus(slaMinutes, ChronoUnit.MINUTES));
            diff.put("updatedSlaDeadline", incident.getSlaDeadline().toString());
        }

        if (request.getAssigneeId() != null) {
            User newAssignee = userRepository.findById(request.getAssigneeId()).orElse(null);
            String prevName = incident.getAssignee() != null ? incident.getAssignee().getUsername() : "Unassigned";
            String newName = newAssignee != null ? newAssignee.getUsername() : "Unassigned";
            diff.put("previousAssignee", prevName);
            diff.put("newAssignee", newName);
            incident.setAssignee(newAssignee);
        }

        Incident updatedIncident = incidentRepository.save(incident);

        // Update MongoDB telemetry if provided
        if (request.getDiagnosticUpdates() != null && !request.getDiagnosticUpdates().isEmpty()) {
            IncidentTelemetry memoryTele = telemetryMemoryFallback.get(id);
            if (memoryTele == null) {
                memoryTele = new IncidentTelemetry(
                        updatedIncident.getId(),
                        updatedIncident.getTrackingNumber(),
                        "Manual Diagnostic Update",
                        null,
                        new HashMap<>()
                );
                telemetryMemoryFallback.put(id, memoryTele);
            }
            if (memoryTele.getDiagnosticPayload() == null) {
                memoryTele.setDiagnosticPayload(new HashMap<>());
            }
            memoryTele.getDiagnosticPayload().putAll(request.getDiagnosticUpdates());

            try {
                telemetryRepository.save(memoryTele);
            } catch (Exception ex) {
                log.warn("MongoDB unavailable, updated telemetry in memory fallback");
            }
        }

        auditService.logEvent(
                updatedIncident.getId(),
                updatedIncident.getTrackingNumber(),
                "INCIDENT_UPDATED",
                currentUsername,
                diff,
                request.getNotes() != null ? request.getNotes() : "Incident state modified"
        );

        IncidentResponseDTO responseDTO = enrichIncidentDTO(updatedIncident);

        try {
            messagingTemplate.convertAndSend("/topic/incidents", responseDTO);
        } catch (Exception ex) {
            log.debug("WebSocket broadcast skipped: {}", ex.getMessage());
        }

        return responseDTO;
    }

    public DashboardStatsDTO getDashboardStats() {
        long active = incidentRepository.countActiveIncidents();
        long resolved = incidentRepository.countResolvedIncidents();
        long breached = incidentRepository.countBreachedIncidents(Instant.now());
        long critical = incidentRepository.findBySeverityOrderByCreatedAtDesc(Severity.CRITICAL)
                .stream().filter(i -> i.getStatus() != IncidentStatus.RESOLVED).count();

        long total = active + resolved;
        double compliance = total > 0 ? ((double)(total - breached) / total) * 100.0 : 100.0;
        compliance = Math.round(compliance * 10.0) / 10.0;

        return new DashboardStatsDTO(active, critical, breached, resolved, compliance);
    }

    @Scheduled(fixedRate = 60000)
    @Transactional
    public void evaluateSlaBreaches() {
        Instant now = Instant.now();
        List<Incident> openOverdue = incidentRepository.findByStatusNotAndSlaDeadlineBefore(IncidentStatus.RESOLVED, now);
        for (Incident inc : openOverdue) {
            if (!inc.isSlaBreached()) {
                inc.setSlaBreached(true);
                incidentRepository.save(inc);

                auditService.logEvent(
                        inc.getId(),
                        inc.getTrackingNumber(),
                        "SLA_BREACH_DETECTED",
                        "SYSTEM_MONITOR",
                        Collections.singletonMap("breachedAt", now.toString()),
                        "Target resolution window exceeded SLA commitment"
                );

                try {
                    messagingTemplate.convertAndSend("/topic/incidents", enrichIncidentDTO(inc));
                } catch (Exception ex) {
                    log.debug("WebSocket broadcast skipped: {}", ex.getMessage());
                }
            }
        }
    }

    private IncidentResponseDTO enrichIncidentDTO(Incident incident) {
        IncidentResponseDTO dto = new IncidentResponseDTO();
        dto.setId(incident.getId());
        dto.setTrackingNumber(incident.getTrackingNumber());
        dto.setTitle(incident.getTitle());
        dto.setDescription(incident.getDescription());
        dto.setServiceName(incident.getServiceName());
        dto.setSeverity(incident.getSeverity());
        dto.setStatus(incident.getStatus());
        dto.setCreatedAt(incident.getCreatedAt());
        dto.setSlaDeadline(incident.getSlaDeadline());
        dto.setResolvedAt(incident.getResolvedAt());
        dto.setSlaBreached(incident.isSlaBreached() || (incident.getStatus() != IncidentStatus.RESOLVED && Instant.now().isAfter(incident.getSlaDeadline())));
        dto.setVersion(incident.getVersion());

        if (incident.getReportedBy() != null) {
            dto.setReportedByUsername(incident.getReportedBy().getUsername());
        }

        if (incident.getAssignee() != null) {
            dto.setAssigneeUsername(incident.getAssignee().getUsername());
            dto.setAssigneeId(incident.getAssignee().getId());
        }

        // Try Mongo first, then in-memory fallback
        try {
            telemetryRepository.findByIncidentId(incident.getId()).ifPresentOrElse(
                    t -> {
                        dto.setErrorSignature(t.getErrorSignature());
                        dto.setStackTrace(t.getStackTrace());
                        dto.setDiagnosticPayload(t.getDiagnosticPayload());
                    },
                    () -> applyMemoryTelemetry(incident.getId(), dto)
            );
        } catch (Exception ex) {
            applyMemoryTelemetry(incident.getId(), dto);
        }

        return dto;
    }

    private void applyMemoryTelemetry(Long incidentId, IncidentResponseDTO dto) {
        IncidentTelemetry mem = telemetryMemoryFallback.get(incidentId);
        if (mem != null) {
            dto.setErrorSignature(mem.getErrorSignature());
            dto.setStackTrace(mem.getStackTrace());
            dto.setDiagnosticPayload(mem.getDiagnosticPayload());
        }
    }
}

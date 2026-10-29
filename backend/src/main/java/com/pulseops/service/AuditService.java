package com.pulseops.service;

import com.pulseops.dto.AuditLogDTO;
import com.pulseops.model.mongo.IncidentAuditLog;
import com.pulseops.repository.mongo.IncidentAuditRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.stream.Collectors;

@Service
public class AuditService {

    private static final Logger log = LoggerFactory.getLogger(AuditService.class);

    private final IncidentAuditRepository auditRepository;
    private final SimpMessagingTemplate messagingTemplate;

    // In-memory fallback buffer ensures 100% uptime even if MongoDB instance is temporarily offline
    private final List<IncidentAuditLog> memoryFallback = new CopyOnWriteArrayList<>();

    public AuditService(IncidentAuditRepository auditRepository, SimpMessagingTemplate messagingTemplate) {
        this.auditRepository = auditRepository;
        this.messagingTemplate = messagingTemplate;
    }

    public IncidentAuditLog logEvent(Long incidentId, String trackingNumber, String action,
                                     String performedBy, Map<String, Object> changes, String notes) {
        IncidentAuditLog auditLog = new IncidentAuditLog(
                incidentId,
                trackingNumber,
                action,
                performedBy != null ? performedBy : "SYSTEM",
                changes,
                notes
        );
        if (auditLog.getId() == null) {
            auditLog.setId(UUID.randomUUID().toString());
        }

        memoryFallback.add(0, auditLog);

        try {
            IncidentAuditLog saved = auditRepository.save(auditLog);
            auditLog = saved;
        } catch (Exception ex) {
            log.warn("MongoDB offline, persisted audit log to in-memory fallback cache for incident: {}", trackingNumber);
        }

        AuditLogDTO dto = mapToDTO(auditLog);
        try {
            messagingTemplate.convertAndSend("/topic/audits", dto);
            messagingTemplate.convertAndSend("/topic/audits/" + trackingNumber, dto);
        } catch (Exception ex) {
            log.debug("WebSocket broadcast skipped: {}", ex.getMessage());
        }

        return auditLog;
    }

    public List<AuditLogDTO> getAuditLogsForIncident(Long incidentId) {
        try {
            List<IncidentAuditLog> fromMongo = auditRepository.findByIncidentIdOrderByTimestampDesc(incidentId);
            if (!fromMongo.isEmpty()) {
                return fromMongo.stream().map(this::mapToDTO).collect(Collectors.toList());
            }
        } catch (Exception ex) {
            log.warn("MongoDB unavailable, serving audits from in-memory fallback cache");
        }

        return memoryFallback.stream()
                .filter(l -> incidentId != null && incidentId.equals(l.getIncidentId()))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<AuditLogDTO> getAuditLogsByTrackingNumber(String trackingNumber) {
        try {
            List<IncidentAuditLog> fromMongo = auditRepository.findByTrackingNumberOrderByTimestampDesc(trackingNumber);
            if (!fromMongo.isEmpty()) {
                return fromMongo.stream().map(this::mapToDTO).collect(Collectors.toList());
            }
        } catch (Exception ex) {
            log.warn("MongoDB unavailable, serving audits from in-memory fallback cache");
        }

        return memoryFallback.stream()
                .filter(l -> trackingNumber != null && trackingNumber.equalsIgnoreCase(l.getTrackingNumber()))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<AuditLogDTO> getRecentAudits() {
        try {
            List<IncidentAuditLog> fromMongo = auditRepository.findTop20ByOrderByTimestampDesc();
            if (!fromMongo.isEmpty()) {
                return fromMongo.stream().map(this::mapToDTO).collect(Collectors.toList());
            }
        } catch (Exception ex) {
            log.warn("MongoDB unavailable, serving recent audits from in-memory fallback cache");
        }

        return memoryFallback.stream()
                .limit(20)
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private AuditLogDTO mapToDTO(IncidentAuditLog log) {
        return new AuditLogDTO(
                log.getId(),
                log.getIncidentId(),
                log.getTrackingNumber(),
                log.getAction(),
                log.getPerformedBy(),
                log.getChanges(),
                log.getNotes(),
                log.getTimestamp()
        );
    }
}

package com.pulseops.controller;

import com.pulseops.dto.AuditLogDTO;
import com.pulseops.service.AuditService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audit")
public class AuditController {

    private final AuditService auditService;

    public AuditController(AuditService auditService) {
        this.auditService = auditService;
    }

    @GetMapping("/incident/{incidentId}")
    public ResponseEntity<List<AuditLogDTO>> getAuditLogsByIncidentId(@PathVariable Long incidentId) {
        return ResponseEntity.ok(auditService.getAuditLogsForIncident(incidentId));
    }

    @GetMapping("/tracking/{trackingNumber}")
    public ResponseEntity<List<AuditLogDTO>> getAuditLogsByTrackingNumber(@PathVariable String trackingNumber) {
        return ResponseEntity.ok(auditService.getAuditLogsByTrackingNumber(trackingNumber));
    }

    @GetMapping("/recent")
    public ResponseEntity<List<AuditLogDTO>> getRecentAudits() {
        return ResponseEntity.ok(auditService.getRecentAudits());
    }
}

package com.pulseops.controller;

import com.pulseops.dto.IncidentCreateRequest;
import com.pulseops.dto.IncidentResponseDTO;
import com.pulseops.dto.IncidentUpdateRequest;
import com.pulseops.model.sql.IncidentStatus;
import com.pulseops.model.sql.Severity;
import com.pulseops.service.IncidentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/incidents")
public class IncidentController {

    private final IncidentService incidentService;

    public IncidentController(IncidentService incidentService) {
        this.incidentService = incidentService;
    }

    @GetMapping
    public ResponseEntity<List<IncidentResponseDTO>> getAllIncidents(
            @RequestParam(required = false) IncidentStatus status,
            @RequestParam(required = false) Severity severity) {
        return ResponseEntity.ok(incidentService.getAllIncidents(status, severity));
    }

    @GetMapping("/{id}")
    public ResponseEntity<IncidentResponseDTO> getIncidentById(@PathVariable Long id) {
        return ResponseEntity.ok(incidentService.getIncidentById(id));
    }

    @GetMapping("/tracking/{trackingNumber}")
    public ResponseEntity<IncidentResponseDTO> getIncidentByTrackingNumber(@PathVariable String trackingNumber) {
        return ResponseEntity.ok(incidentService.getIncidentByTrackingNumber(trackingNumber));
    }

    @PostMapping
    public ResponseEntity<IncidentResponseDTO> createIncident(
            @Valid @RequestBody IncidentCreateRequest request,
            Authentication authentication) {
        String username = authentication != null ? authentication.getName() : "admin";
        IncidentResponseDTO created = incidentService.createIncident(request, username);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<IncidentResponseDTO> updateIncident(
            @PathVariable Long id,
            @RequestBody IncidentUpdateRequest request,
            Authentication authentication) {
        String username = authentication != null ? authentication.getName() : "admin";
        return ResponseEntity.ok(incidentService.updateIncident(id, request, username));
    }
}

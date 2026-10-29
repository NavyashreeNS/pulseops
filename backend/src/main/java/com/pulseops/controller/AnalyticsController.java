package com.pulseops.controller;

import com.pulseops.dto.DashboardStatsDTO;
import com.pulseops.service.IncidentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final IncidentService incidentService;

    public AnalyticsController(IncidentService incidentService) {
        this.incidentService = incidentService;
    }

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDTO> getStats() {
        return ResponseEntity.ok(incidentService.getDashboardStats());
    }
}

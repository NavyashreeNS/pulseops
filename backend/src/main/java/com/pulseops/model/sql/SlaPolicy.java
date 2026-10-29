package com.pulseops.model.sql;

import jakarta.persistence.*;

@Entity
@Table(name = "sla_policies")
public class SlaPolicy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, unique = true, length = 20)
    private Severity severity;

    @Column(nullable = false)
    private int targetResolutionMinutes;

    @Column(length = 255)
    private String description;

    public SlaPolicy() {}

    public SlaPolicy(Severity severity, int targetResolutionMinutes, String description) {
        this.severity = severity;
        this.targetResolutionMinutes = targetResolutionMinutes;
        this.description = description;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Severity getSeverity() { return severity; }
    public void setSeverity(Severity severity) { this.severity = severity; }

    public int getTargetResolutionMinutes() { return targetResolutionMinutes; }
    public void setTargetResolutionMinutes(int targetResolutionMinutes) { this.targetResolutionMinutes = targetResolutionMinutes; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}

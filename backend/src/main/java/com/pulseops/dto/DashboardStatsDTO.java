package com.pulseops.dto;

public class DashboardStatsDTO {
    private long totalActive;
    private long totalCritical;
    private long totalSlaBreached;
    private long totalResolved;
    private double slaCompliancePercentage;

    public DashboardStatsDTO() {}

    public DashboardStatsDTO(long totalActive, long totalCritical, long totalSlaBreached,
                             long totalResolved, double slaCompliancePercentage) {
        this.totalActive = totalActive;
        this.totalCritical = totalCritical;
        this.totalSlaBreached = totalSlaBreached;
        this.totalResolved = totalResolved;
        this.slaCompliancePercentage = slaCompliancePercentage;
    }

    public long getTotalActive() { return totalActive; }
    public void setTotalActive(long totalActive) { this.totalActive = totalActive; }

    public long getTotalCritical() { return totalCritical; }
    public void setTotalCritical(long totalCritical) { this.totalCritical = totalCritical; }

    public long getTotalSlaBreached() { return totalSlaBreached; }
    public void setTotalSlaBreached(long totalSlaBreached) { this.totalSlaBreached = totalSlaBreached; }

    public long getTotalResolved() { return totalResolved; }
    public void setTotalResolved(long totalResolved) { this.totalResolved = totalResolved; }

    public double getSlaCompliancePercentage() { return slaCompliancePercentage; }
    public void setSlaCompliancePercentage(double slaCompliancePercentage) { this.slaCompliancePercentage = slaCompliancePercentage; }
}

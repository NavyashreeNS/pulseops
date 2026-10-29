package com.pulseops.repository.sql;

import com.pulseops.model.sql.Incident;
import com.pulseops.model.sql.IncidentStatus;
import com.pulseops.model.sql.Severity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, Long> {

    Optional<Incident> findByTrackingNumber(String trackingNumber);

    List<Incident> findByStatusOrderByCreatedAtDesc(IncidentStatus status);

    List<Incident> findBySeverityOrderByCreatedAtDesc(Severity severity);

    @Query("SELECT i FROM Incident i WHERE (:status IS NULL OR i.status = :status) " +
           "AND (:severity IS NULL OR i.severity = :severity) " +
           "ORDER BY i.createdAt DESC")
    List<Incident> findFiltered(@Param("status") IncidentStatus status, @Param("severity") Severity severity);

    @Query("SELECT COUNT(i) FROM Incident i WHERE i.status <> 'RESOLVED'")
    long countActiveIncidents();

    @Query("SELECT COUNT(i) FROM Incident i WHERE i.status <> 'RESOLVED' AND i.slaDeadline < :now")
    long countBreachedIncidents(@Param("now") Instant now);

    @Query("SELECT COUNT(i) FROM Incident i WHERE i.status = 'RESOLVED'")
    long countResolvedIncidents();

    List<Incident> findByStatusNotAndSlaDeadlineBefore(IncidentStatus status, Instant now);
}

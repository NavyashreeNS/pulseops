package com.pulseops.repository.mongo;

import com.pulseops.model.mongo.IncidentAuditLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidentAuditRepository extends MongoRepository<IncidentAuditLog, String> {
    List<IncidentAuditLog> findByIncidentIdOrderByTimestampDesc(Long incidentId);
    List<IncidentAuditLog> findByTrackingNumberOrderByTimestampDesc(String trackingNumber);
    List<IncidentAuditLog> findTop20ByOrderByTimestampDesc();
}

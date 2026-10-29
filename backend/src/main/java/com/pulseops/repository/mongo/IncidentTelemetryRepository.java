package com.pulseops.repository.mongo;

import com.pulseops.model.mongo.IncidentTelemetry;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IncidentTelemetryRepository extends MongoRepository<IncidentTelemetry, String> {
    Optional<IncidentTelemetry> findByIncidentId(Long incidentId);
    Optional<IncidentTelemetry> findByTrackingNumber(String trackingNumber);
}

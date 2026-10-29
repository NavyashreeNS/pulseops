package com.pulseops.repository.sql;

import com.pulseops.model.sql.Severity;
import com.pulseops.model.sql.SlaPolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SlaPolicyRepository extends JpaRepository<SlaPolicy, Long> {
    Optional<SlaPolicy> findBySeverity(Severity severity);
}

package com.pulseops.config;

import com.pulseops.dto.IncidentCreateRequest;
import com.pulseops.model.sql.*;
import com.pulseops.repository.sql.IncidentRepository;
import com.pulseops.repository.sql.SlaPolicyRepository;
import com.pulseops.repository.sql.UserRepository;
import com.pulseops.service.IncidentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final SlaPolicyRepository slaPolicyRepository;
    private final IncidentRepository incidentRepository;
    private final IncidentService incidentService;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           SlaPolicyRepository slaPolicyRepository,
                           IncidentRepository incidentRepository,
                           IncidentService incidentService,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.slaPolicyRepository = slaPolicyRepository;
        this.incidentRepository = incidentRepository;
        this.incidentService = incidentService;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return;
        }

        log.info("Initializing PulseOps demo data with Polyglot persistence (SQL + MongoDB)...");

        // 1. Seed Users in SQL
        User admin = userRepository.save(new User("admin", "admin@pulseops.io", passwordEncoder.encode("admin123"), Role.ROLE_ADMIN, "Site Reliability"));
        User alex = userRepository.save(new User("alex_dev", "alex@pulseops.io", passwordEncoder.encode("password123"), Role.ROLE_ENGINEER, "Core Payments"));
        User sarah = userRepository.save(new User("sarah_sre", "sarah@pulseops.io", passwordEncoder.encode("password123"), Role.ROLE_ENGINEER, "Infrastructure"));

        // 2. Seed SLA Policies in SQL
        slaPolicyRepository.save(new SlaPolicy(Severity.CRITICAL, 30, "P0 Critical Incident - 30 min SLA"));
        slaPolicyRepository.save(new SlaPolicy(Severity.HIGH, 120, "P1 High Incident - 2 hour SLA"));
        slaPolicyRepository.save(new SlaPolicy(Severity.MEDIUM, 480, "P2 Medium Incident - 8 hour SLA"));
        slaPolicyRepository.save(new SlaPolicy(Severity.LOW, 1440, "P3 Low Incident - 24 hour SLA"));

        // 3. Seed Realistic Incidents with NoSQL Diagnostic Telemetry (MongoDB)
        IncidentCreateRequest inc1 = new IncidentCreateRequest();
        inc1.setTitle("Stripe Webhook Gateway Timeout (504)");
        inc1.setDescription("Checkout webhook ingestion queue backing up. Deadlock observed on order settlement thread pool.");
        inc1.setServiceName("payment-orchestrator");
        inc1.setSeverity(Severity.CRITICAL);
        inc1.setAssigneeId(alex.getId());
        inc1.setErrorSignature("SocketTimeoutException: Read timed out after 5000ms at stripe.client.StripeGateway.postWebhook");
        inc1.setStackTrace("java.net.SocketTimeoutException: Read timed out\n\tat java.base/sun.nio.ch.NioSocketImpl.timedRead(NioSocketImpl.java:283)\n\tat com.pulseops.payment.StripeGateway.invoke(StripeGateway.java:88)");
        Map<String, Object> payload1 = new HashMap<>();
        payload1.put("httpStatus", 504);
        payload1.put("impactedTransactions", 382);
        payload1.put("kubernetesPod", "pay-svc-prod-east-74b89f");
        payload1.put("region", "us-east-1");
        payload1.put("retryCount", 4);
        inc1.setDiagnosticPayload(payload1);
        incidentService.createIncident(inc1, "sarah_sre");

        IncidentCreateRequest inc2 = new IncidentCreateRequest();
        inc2.setTitle("Kafka Partition Rebalance Lag in Notification Service");
        inc2.setDescription("Consumer lag exceeded threshold (> 50,000 messages) across notification partitions 2 and 4.");
        inc2.setServiceName("notification-hub");
        inc2.setSeverity(Severity.HIGH);
        inc2.setAssigneeId(sarah.getId());
        inc2.setErrorSignature("CommitFailedException: Offset commit cannot be completed since the group is already rebalancing");
        Map<String, Object> payload2 = new HashMap<>();
        payload2.put("topic", "customer.transaction.events");
        payload2.put("consumerLag", 52410);
        payload2.put("activeConsumers", 3);
        payload2.put("clusterId", "kafka-prod-cluster-01");
        inc2.setDiagnosticPayload(payload2);
        incidentService.createIncident(inc2, "admin");

        IncidentCreateRequest inc3 = new IncidentCreateRequest();
        inc3.setTitle("Redis Cluster Cache Eviction Spike");
        inc3.setDescription("Memory fragmentation ratio elevated, high rate of volatile-lru keys evicted prematurely.");
        inc3.setServiceName("session-manager");
        inc3.setSeverity(Severity.MEDIUM);
        inc3.setAssigneeId(alex.getId());
        Map<String, Object> payload3 = new HashMap<>();
        payload3.put("redisMemoryUsedMb", 14200);
        payload3.put("evictedKeysSec", 890);
        payload3.put("hitRatePercent", 71.4);
        inc3.setDiagnosticPayload(payload3);
        incidentService.createIncident(inc3, "alex_dev");

        log.info("Demo data initialized successfully with users, SLA policies, and MongoDB audit logs!");
    }
}

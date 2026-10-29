# 🎤 Interview Cheat Sheet: How to Pitch & Defend PulseOps

This guide equips you with word-for-word explanations and technical justifications to stand out in technical interviews.

---

## ⚡ The 60-Second Elevator Pitch

> *"In my recent project, **PulseOps**, I built a full-stack incident and SLA orchestration platform from scratch using **Java 17, Spring Boot 3, React, SQL (PostgreSQL/H2), and MongoDB**.*
>
> *The problem I solved is that in enterprise SaaS architectures, incident management requires strict transactional integrity for SLA contracts and status transitions, but at the same time, incident telemetry involves high-velocity, unstructured JSON diagnostic payloads and immutable audit trails.*
>
> *Rather than forcing a single database paradigm, I architected a **polyglot persistence system**: PostgreSQL handles the ACID transactions, user role permissions, and incident state machines with optimistic locking, while MongoDB stores the flexible diagnostic payloads and append-only audit event streams.*
>
> *On top of that, I built a real-time React dashboard powered by **WebSockets over STOMP**, allowing engineers to collaborate live on incidents with sub-minute SLA countdowns without page refreshes."*

---

## 💡 Top 5 Technical Interview Deep-Dive Q&A

### Q1: "Why use both PostgreSQL and MongoDB? Couldn't you just store JSON in Postgres using JSONB?"
**Your Winning Answer:**
> *"That's a very common consideration! While Postgres `JSONB` is great for moderate semi-structured fields, here is why a true Polyglot architecture was chosen:*
>
> 1. **Write vs. Read Isolation:** Incident triage involves frequent status read/writes, while telemetry and audit logs are high-throughput, append-heavy write streams. Mixing massive append logs and stack traces into the primary transactional tables causes table bloat, index degradation, and vacuuming overhead on Postgres.
> 2. **Document Model Freedom:** Different microservices (e.g. Payment Gateway vs Kafka Broker) produce drastically different diagnostic shapes. MongoDB provides native nested querying and natural horizontal sharding as telemetry volume grows.
> 3. **Architectural Decoupling:** Decoupling audit logging into MongoDB ensures that heavy forensic queries or long-term analytical scans never contend for locks with core transactional business operations in Postgres."*

---

### Q2: "How do you ensure consistency between SQL and MongoDB? What if one write succeeds and the other fails?"
**Your Winning Answer:**
> *"In PulseOps, the transactional source of truth is strictly **PostgreSQL**.
>
> The business logic enforces that the SQL transaction commits first inside a `@Transactional` boundary.
> For the MongoDB audit log and telemetry:
> - If MongoDB is available, it immediately records the event and broadcasts it over WebSockets.
> - If MongoDB experiences network partitioning or transient downtime, the backend captures the exception gracefully, logs the failure, and routes the audit event to an in-memory concurrent fallback buffer so that the core incident state in SQL is never corrupted or blocked.
>
> In an enterprise distributed microservice setup, I would elevate this to the **Transactional Outbox Pattern** with Debezium / Kafka CDC, where events are written to an outbox table in Postgres in the same transaction, and an asynchronous relay publishes them to MongoDB."*

---

### Q3: "How do you prevent race conditions if two engineers resolve or update an incident at the exact same millisecond?"
**Your Winning Answer:**
> *"I implemented **Optimistic Locking** using JPA's `@Version` annotation on the `Incident` entity.
>
> Every time an incident record is read, Hibernate loads its current version number. When an engineer submits an update (e.g. changing status from `INVESTIGATING` to `RESOLVED`), Hibernate issues a SQL query with `WHERE id = ? AND version = ?`.
>
> If another engineer updated the record a millisecond earlier, the version in the database has already incremented, causing the second write to fail with an `OptimisticLockException`. This prevents 'lost updates' without incurring the heavy database locks of pessimistic locking."*

---

### Q4: "How does the real-time notification mechanism work between Spring Boot and React?"
**Your Winning Answer:**
> *"We use **Spring WebSocket Message Broker with STOMP over SockJS**:
>
> 1. When the React client mounts, it initializes a STOMP connection to `http://localhost:8080/ws` with SockJS fallback (which falls back to HTTP long-polling if WebSockets are blocked by proxies).
> 2. The client subscribes to topic destinations like `/topic/incidents` and `/topic/audits`.
> 3. Whenever an incident is created, escalated, or its status changes, the Spring service uses `SimpMessagingTemplate.convertAndSend()` to publish the updated DTO to the broker.
> 4. All active engineers' dashboards immediately receive the payload and update their React component state without re-fetching all incidents from the REST API."*

---

### Q5: "How does the SLA breach detector work without overloading the database?"
**Your Winning Answer:**
> *"Rather than polling every incident repeatedly, the system employs two optimizations:
>
> 1. **Calculated Static Deadlines:** When an incident is created, its SLA deadline timestamp is computed upfront based on the configured `SlaPolicy` for its severity (`Instant.now().plus(slaMinutes)`).
> 2. **Indexed Targeted Scanner:** A Spring `@Scheduled` background worker runs periodically, executing a targeted query: `SELECT i FROM Incident i WHERE i.status <> 'RESOLVED' AND i.slaDeadline < :now`. Because `status` and `slaDeadline` are indexed via B-Tree compound indexes in SQL, this query executes in sub-milliseconds without table scanning. Any overdue incident is flagged as `slaBreached = true`, recorded in the MongoDB audit log, and pushed live via WebSockets."*

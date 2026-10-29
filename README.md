# 🛰️ PulseOps: Polyglot Incident & SLA Governance Platform

> **A production-ready Full-Stack Enterprise Platform engineered from scratch using Java 17, Spring Boot 3, React (JavaScript), SQL (PostgreSQL / H2), and MongoDB.**

[![Java](https://img.shields.io/badge/Java-17%2B-ED8B00?logo=openjdk&logoColor=white)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.4-6DB33F?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-ACID%20Core-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Audit%20%26%20Telemetry-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![WebSockets](https://img.shields.io/badge/WebSockets-STOMP%20Live-blue?logo=socket.io&logoColor=white)](https://stomp.github.io/)

---

## 📌 Executive Summary

Modern enterprise cloud architectures (Netflix, Uber, Stripe) cannot afford service downtime without strict SLA tracking and forensic accountability. **PulseOps** solves this by delivering an automated incident orchestration platform that combines:
1. **Strict Relational Transactions (SQL):** Users, role-based permissions, SLA contracts, and incident lifecycle transitions with optimistic locking.
2. **High-Throughput Flexible Storage (MongoDB):** Arbitrary dynamic diagnostic payloads (stack traces, custom metrics, pod metadata) and append-only immutable audit logs.
3. **Real-Time React Dashboard:** Live countdown SLA clocks, bidirectional WebSocket event feeds, and dynamic NoSQL payload builders.

---

## 🏛️ System Architecture

```mermaid
flowchart TD
    subgraph Client["Frontend Layer (React 18 + Vite)"]
        UI["Mission Control Dashboard"]
        WSClient["STOMP / SockJS WebSocket Client"]
        AuthUI["JWT Auth Interceptor"]
    end

    subgraph Backend["Backend Layer (Spring Boot 3 + Java 17)"]
        Sec["Spring Security 6 (Stateless JWT)"]
        IncCtrl["Incident & Analytics Controller"]
        AudCtrl["Audit Controller"]
        Broker["Spring Message Broker (/topic)"]
        Cron["SLA Breach Scanner (@Scheduled)"]
        IncSvc["Incident Service (Orchestration Engine)"]
    end

    subgraph Storage["Polyglot Persistence Layer"]
        subgraph SQLDB["Relational Database (PostgreSQL / H2)"]
            T_Users["users (ID, Username, Role, Org)"]
            T_Inc["incidents (ID, SLA Deadline, Status, Version)"]
            T_SLA["sla_policies (Severity, Target Minutes)"]
        end

        subgraph MongoDB["NoSQL Document Store (MongoDB)"]
            C_Audit["incident_audit_logs (Immutable Event Trail)"]
            C_Telem["incident_telemetry (Dynamic JSON Diagnostic Payload)"]
        end
    end

    UI --> AuthUI
    AuthUI -->|REST API over HTTP| Sec
    Sec --> IncCtrl
    Sec --> AudCtrl
    IncCtrl --> IncSvc
    AudCtrl --> IncSvc
    IncSvc -->|ACID Transactions & Optimistic Locking| SQLDB
    IncSvc -->|Append-Only Event Sourcing & JSON Docs| MongoDB
    Cron -->|Indexed SLA Queries| SQLDB
    Cron -->|Push SLA Breaches| Broker
    IncSvc -->|Broadcast State Changes| Broker
    Broker -->|Live Push over WebSocket| WSClient
    WSClient --> UI
```

---

## ⚖️ Polyglot Persistence: Why Dual Databases?

| Feature | Relational SQL (PostgreSQL / H2) | NoSQL Document Store (MongoDB) |
|---|---|---|
| **Role in PulseOps** | Transactional Source of Truth | Telemetry & Audit Stream Store |
| **Data Handled** | Users, SLA Policies, Incident Status State Machine | Microservice diagnostic dumps, stack traces, immutable event logs |
| **Data Model** | Normalized schema with foreign key constraints | Flexible schema-free JSON documents |
| **Consistency Guarantee** | Strong ACID, Optimistic Locking (`@Version`) | High write throughput, append-only isolation |
| **Why not just one DB?** | Adding millions of raw stack traces & telemetry dumps into SQL creates severe table bloat & vacuuming overhead. | Incident states require strict relational integrity, foreign keys, and ACID locking to prevent double-resolutions. |

---

## 🚀 Quick Start (Run in 2 Minutes)

### Option 1: Local Development (Zero External DB Needed!)
PulseOps is pre-configured with embedded **H2 Database** and **in-memory fallback caching** for MongoDB, meaning you can start it immediately without installing any external database!

#### 1. Start the Java Backend:
```bash
cd backend
./mvnw spring-boot:run
```
*Backend starts on `http://localhost:8080` with pre-loaded demo data, SLA policies, and sample incidents.*

#### 2. Start the React Frontend:
```bash
cd frontend
npm run dev
```
*Frontend starts on `http://localhost:5173`.*

#### 3. Log In with Default Credentials:
- **Username:** `admin`
- **Password:** `admin123`
- *(Additional test accounts: `sarah_sre` / `password123`, `alex_dev` / `password123`)*

---

### Option 2: Full Docker Compose (PostgreSQL + MongoDB + Backend + Frontend)
If you have Docker running, launch the entire polyglot stack with one command:
```bash
docker compose up --build
```
- **React Web UI:** [http://localhost:5173](http://localhost:5173)
- **Spring Boot API:** [http://localhost:8080](http://localhost:8080)
- **PostgreSQL:** `localhost:5432` (db: `pulseops`)
- **MongoDB:** `localhost:27017` (db: `pulseops`)

---

## 📡 REST API Specifications

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/login` | Authenticate & obtain JWT token | No |
| `POST` | `/api/auth/register` | Register new engineer account | No |
| `GET` | `/api/incidents` | List incidents (filter by `status`, `severity`) | Optional (GET) |
| `GET` | `/api/incidents/{id}` | Get incident details enriched with Mongo telemetry | Optional (GET) |
| `POST` | `/api/incidents` | Create incident + save MongoDB telemetry + broadcast WS | Yes (Bearer JWT) |
| `PUT` | `/api/incidents/{id}` | Update status/severity + append MongoDB audit log | Yes (Bearer JWT) |
| `GET` | `/api/audit/incident/{id}` | Retrieve MongoDB immutable audit trail for incident | Optional (GET) |
| `GET` | `/api/analytics/stats` | Active count, SLA breach rate, compliance % | Optional (GET) |

---

## 📚 Resume & Interview Preparation Kits

Included in this repository are comprehensive interview preparation assets:
- 📄 **[RESUME_HIGHLIGHTS.md](./RESUME_HIGHLIGHTS.md):** Pre-written, quantifiable bullet points formatted with the Google XYZ formula for your resume.
- 🎤 **[INTERVIEW_CHEAT_SHEET.md](./INTERVIEW_CHEAT_SHEET.md):** 60-second elevator pitch and answers to 5 deep-dive technical interview questions.

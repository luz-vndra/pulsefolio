# Pulsefolio — 10-Week Engineering Plan

> **Project:** Real-time investment portfolio simulator  
> **Primary goal:** Learn to build, scale, test, and explain a WebSocket-driven MERN + Redux application.  
> **Time budget:** 8–10 hours/week, approximately 80–100 hours total.  
> **Mode:** Build one production-minded portfolio project incrementally; use simulated funds and market data only.

---

## How to Use This Plan with Claude Code or Codex

1. Keep this file at the repository root as `PLAN.md`.
2. At the start of a work session, ask your coding agent to read `PLAN.md`, inspect the current repository, and identify the **next unchecked task**.
3. Ask it to implement only the smallest coherent task, with tests and documentation.
4. Review the diff yourself. Do not accept changes you cannot explain.
5. After running the tests locally, update the relevant checkboxes in this file.
6. Do not skip ahead just to add infrastructure. Add complexity when the current milestone demonstrates why it is needed.

### Suggested session prompt

```text
Read PLAN.md and inspect the current repository before changing anything.
Identify the current week and the next unchecked task. Summarize the intended
change and the files you expect to touch. Implement only that task, including
appropriate tests and documentation. Follow the existing project conventions,
avoid unrelated refactors, and do not mark tasks complete until you tell me
how to verify them locally. If a requirement is ambiguous or a destructive
change is needed, ask first.
```

### Definition of Done for every task

- [ ] Implementation is complete and the behavior is understandable.
- [ ] Relevant automated tests are added or updated.
- [ ] Linting, type-checking, and tests pass (where configured).
- [ ] Failure and edge cases are considered.
- [ ] README or architecture notes are updated when behavior or design changes.
- [ ] I can explain the code and the trade-offs without relying on the agent.

---

## Product Scope

Pulsefolio is a **simulated** investment portfolio application. It will display synthetic market prices, holdings, cash, portfolio valuation, order history, and notifications. It will not connect to real brokerage accounts or execute real trades.

### Core features

- Live market watchlist with price, change, sequence/version, and last-updated time.
- Portfolio snapshot and holdings.
- Simulated buy/sell orders validated and processed on the server.
- Persistent order/trade history and portfolio notifications.
- Redux Toolkit state management with a single managed real-time connection.
- Reconnection and snapshot resynchronization after interruptions.
- Redis-backed cross-instance event distribution.
- Load testing, metrics, security checks, and deployment documentation.

### Non-goals for the first 10 weeks

- Real-money trading or brokerage integration.
- Financial advice or production custody of funds.
- Kubernetes, microservices, or elaborate cloud infrastructure before the core system works.
- Guaranteeing delivery from Redis Pub/Sub. Important persisted events need a durable publication/recovery strategy.

---

## Target Architecture

### Initial architecture

- **Frontend:** React + TypeScript + Redux Toolkit
- **HTTP API:** Node.js + Express + TypeScript
- **Real-time transport:** Socket.IO
- **Database:** MongoDB + Mongoose
- **Validation/contracts:** Zod and shared TypeScript event contracts
- **Testing:** Vitest or the project's chosen test runner; integration tests
- **Local environment:** Docker Compose when MongoDB/Redis are introduced
- **Load testing:** k6 or another documented WebSocket-capable load-testing tool
- **Observability:** structured logs and metrics; Prometheus-compatible metrics/Grafana if practical

### Final architecture target

```text
React + Redux Toolkit
        | HTTPS REST + Socket.IO
        v
Load balancer / reverse proxy
        |
   +----+----+
   v         v
API + WS   API + WS
instance A instance B
   |         |
   +---- Redis adapter / event distribution
        |
     MongoDB
        ^
        |
Order / portfolio services and durable event publication
```

MongoDB is authoritative for persisted financial records. Redux is a client-side view of server state. Redis Pub/Sub is for transient distribution, not durable storage.

### Event design rules

- Use explicit event names and validated payload schemas.
- Include an event ID where deduplication matters, a schema version, timestamp, and sequence/version where ordering matters.
- Distinguish **commands** (requests to do something) from **events** (facts that happened).
- Authorize every sensitive command and subscription on the server.
- Treat all client input as untrusted.
- Never accept a client-supplied balance, holding, or execution price as authoritative.
- Define reconnect behavior and snapshot reconciliation instead of assuming every event is received.
- Use idempotency for simulated orders and a transactional outbox or equivalent reliable publication strategy for persisted order events.

---

# 10-Week Roadmap

## Week 1 — WebSocket Fundamentals and Live Ticker

**Time budget:** 8–10 hours  
**Learning question:** What does a persistent connection provide, and what happens when it breaks?

### Learn
- HTTP upgrade and WebSocket basics.
- WebSocket vs. Socket.IO: protocol differences and added application features.
- Connection lifecycle, connect/disconnect events, acknowledgements, ping/pong, and reconnection.
- Why event handlers must be registered and cleaned up correctly.

### Build
- [ ] Initialize repository and document prerequisites/run commands.
- [ ] Create a TypeScript React frontend and Node.js/Express API.
- [ ] Add a Socket.IO server and client.
- [ ] Implement a synthetic price publisher for one symbol (e.g., `RELIANCE`).
- [ ] Display price, connection state, timestamp, and monotonically increasing sequence.
- [ ] Register and clean up client event listeners correctly.
- [ ] Add a small README section explaining the connection lifecycle.

### Verify
- [ ] Price updates arrive approximately once per second.
- [ ] Stopping the API shows a disconnected state.
- [ ] Restarting the API results in reconnection.
- [ ] React remounts do not multiply event handlers.
- [ ] No unexpected console/server errors.

### Failure experiment
Stop and restart the server. Record what the client sees and what data it misses.

### Deliverable
A working live ticker plus a short explanation of the WebSocket lifecycle.

---

## Week 2 — MERN Foundation and REST Snapshot

**Time budget:** 8–10 hours  
**Learning question:** Which data should come from REST, and which updates should be pushed?

### Learn
- Express routing, controllers/services, validation, error handling.
- MongoDB/Mongoose schemas, indexes, and basic query design.
- Configuration through environment variables.
- REST for initial snapshots and commands; sockets for live updates.

### Build
- [ ] Establish consistent TypeScript, lint, formatting, and test scripts.
- [ ] Create a clean separation between routes/controllers/services/repositories where useful.
- [ ] Add MongoDB and connection health checks.
- [ ] Define initial models for demo user, watchlist, portfolio, and holding (avoid premature complexity).
- [ ] Add a REST endpoint to fetch the market snapshot.
- [ ] Add a REST endpoint to fetch the current demo portfolio.
- [ ] Seed deterministic demo data.
- [ ] Add API validation and predictable error responses.

### Verify
- [ ] Frontend can load an initial snapshot before live updates begin.
- [ ] Invalid input produces a useful 4xx response.
- [ ] Database-unavailable behavior is visible and does not crash silently.
- [ ] Seed operation is repeatable without duplicating data.

### Deliverable
A full-stack skeleton with persistent demo data and REST snapshots.

---

## Week 3 — Socket.IO Rooms, Contracts, and Security Basics

**Time budget:** 8–10 hours  
**Learning question:** How can clients subscribe to only the events they are allowed to receive?

### Learn
- Socket.IO rooms and namespaces.
- Connection authentication and token/session lifecycle.
- Event schema validation and acknowledgement patterns.
- Origin validation, payload limits, and rate limiting.
- Server-side authorization versus UI-only hiding.

### Build
- [ ] Create a shared `packages/contracts` package or an equivalent shared contract module.
- [ ] Define validated schemas for market update and subscription events.
- [ ] Add market rooms such as `market:RELIANCE`.
- [ ] Add a private user room such as `user:<userId>` only after identity is verified server-side.
- [ ] Validate subscription symbols and payloads.
- [ ] Return explicit success/error acknowledgements for subscription requests.
- [ ] Add tests for invalid payloads and unauthorized subscriptions.
- [ ] Document event names and payload shapes.

### Verify
- [ ] Invalid symbols and malformed payloads are rejected.
- [ ] A user cannot join another user's private room by supplying an arbitrary user ID.
- [ ] Event handlers fail safely and return useful errors.
- [ ] Frontend and backend use the same event contract.

### Deliverable
A documented, validated event contract and authorized subscription flow.

---

## Week 4 — Redux Toolkit and Real-Time State

**Time budget:** 8–10 hours  
**Learning question:** How should a long-lived socket update application state without coupling every component to the connection?

### Learn
- Redux Toolkit slices, selectors, normalized state, and serializability.
- Middleware as a home for long-lived socket side effects.
- Avoid storing socket instances in Redux state.
- Listener cleanup, reconnect state, and UI data freshness.

### Build
- [ ] Configure the Redux store and typed hooks.
- [ ] Add market and connection slices.
- [ ] Move socket ownership to one middleware/service layer.
- [ ] Dispatch typed Redux actions from socket event handlers.
- [ ] Normalize market entities by symbol if useful.
- [ ] Add connection status and last-update age to the UI.
- [ ] Prevent duplicate listeners and duplicate socket instances.
- [ ] Add unit tests for reducers/selectors and tests for middleware lifecycle.

### Verify
- [ ] Multiple components consume the same market state.
- [ ] Components do not each create their own socket connection.
- [ ] Mount/unmount and reconnect do not multiply event handlers.
- [ ] Redux state contains serializable data only.
- [ ] UI indicates stale data when updates stop.

### Deliverable
A real-time Redux architecture with a single managed socket connection.

---

## Week 5 — Simulated Trading and Financial Correctness

**Time budget:** 8–10 hours  
**Learning question:** How can a retry or race condition avoid corrupting a simulated portfolio?

### Learn
- Order state machine and server-authoritative business logic.
- MongoDB atomic updates and transactions (including deployment requirements).
- Idempotency keys and duplicate command handling.
- Ledger-oriented thinking and why client state cannot be authoritative.
- Integer minor units or an appropriate decimal representation for money; avoid floating-point arithmetic for financial totals.

### Build
- [ ] Define order states, for example `accepted`, `filled`, `rejected`.
- [ ] Define order, trade, holding, and cash-ledger persistence models.
- [ ] Implement server-side buy/sell validation.
- [ ] Use a client-generated idempotency key and enforce uniqueness server-side.
- [ ] Apply balance and holding changes atomically; use a transaction where required.
- [ ] Persist order/trade results before notifying clients.
- [ ] Emit order status and portfolio update events only after the relevant commit.
- [ ] Add an order history endpoint and UI.
- [ ] Add tests for retries, insufficient cash, insufficient holdings, and concurrent orders.

### Verify
- [ ] Repeating the same idempotency key does not create a second trade.
- [ ] Two competing buy orders cannot overspend the same cash balance.
- [ ] Selling more shares than owned is rejected.
- [ ] Persisted state remains correct if the client disconnects after submitting an order.
- [ ] Money calculations do not rely on binary floating-point for authoritative totals.

### Deliverable
A simulated trade flow with persistence, idempotency, and consistency tests.

---

## Week 6 — Redis and Horizontal Scaling

**Time budget:** 8–10 hours  
**Learning question:** What changes when different clients connect to different Node.js instances?

### Learn
- Stateless application instances and shared infrastructure.
- Redis Pub/Sub and Socket.IO Redis adapter.
- Load balancing, sticky sessions, and WebSocket upgrade forwarding.
- Why the standard Redis Pub/Sub adapter does not provide durable event storage.
- Resource limits and how fan-out affects bandwidth.

### Build
- [ ] Add Redis to local development (e.g., Docker Compose).
- [ ] Configure the Socket.IO Redis adapter according to current official docs.
- [ ] Run two API/socket instances on separate ports.
- [ ] Configure a local reverse proxy/load balancer if practical.
- [ ] Ensure shared events reach authorized subscribers across instances.
- [ ] Document sticky-session requirements for the chosen transport configuration.
- [ ] Add a Redis health check and useful logs.
- [ ] Write a repeatable multi-instance smoke test.

### Verify
- [ ] Clients on different instances receive the intended shared events.
- [ ] Room membership and user authorization remain correct.
- [ ] A single instance can be stopped without bringing down the other instance.
- [ ] Redis failure behavior is understood and documented.
- [ ] No claim is made that Pub/Sub alone guarantees durable delivery.

### Deliverable
A two-instance real-time system with shared event distribution.

---

## Week 7 — Reconnection, Resynchronization, and Reliable Events

**Time budget:** 8–10 hours  
**Learning question:** How does a client recover when it missed events or receives duplicates?

### Learn
- At-most-once vs. at-least-once application-level delivery strategies.
- Event IDs, sequence numbers, version checks, deduplication.
- Snapshot resynchronization and stale-event rejection.
- Transactional outbox pattern and retryable publishers.
- Backpressure, slow consumers, and coalescing replaceable updates.

### Build
- [ ] Add sequence/version handling for market data.
- [ ] Ignore duplicate or older market updates where appropriate.
- [ ] On reconnect, fetch an authoritative snapshot and reconcile client state.
- [ ] Define a clear strategy for detecting gaps in sequence numbers.
- [ ] Add an outbox record in the same database transaction as important order changes, if supported by the selected schema/transaction design.
- [ ] Implement a retryable outbox publisher and idempotent consumer behavior where appropriate.
- [ ] Coalesce or drop obsolete intermediate market ticks for slow consumers, while preserving important order events.
- [ ] Add integration tests for disconnect, duplicate, out-of-order, and missing-event scenarios.

### Verify
- [ ] A reconnecting client converges to current authoritative state.
- [ ] Duplicate market events do not regress the UI.
- [ ] A committed order change can be published after a temporary publisher/Redis failure.
- [ ] Slow clients do not cause unbounded queues.
- [ ] The documented delivery guarantee matches the implementation.

### Deliverable
A documented recovery strategy with tests for missed and duplicated events.

---

## Week 8 — Load Testing and Performance Analysis

**Time budget:** 8–10 hours  
**Learning question:** What is the measured bottleneck, and how does it change as load increases?

### Learn
- Concurrent connections vs. messages/second.
- Connection ramp-up and sustained load.
- p50/p95/p99 latency, throughput, errors, CPU, memory, and event-loop lag.
- Broadcast fan-out, payload size, backpressure, and realistic subscriber distributions.
- Test-environment limits and reproducibility.

### Build
- [ ] Choose a WebSocket-capable load-testing tool and record its version/configuration.
- [ ] Write a scenario for gradual connection ramp-up.
- [ ] Write a sustained market update subscription scenario.
- [ ] Record connection success, event throughput, latency percentiles, CPU, memory, and errors.
- [ ] Compare one instance with two instances.
- [ ] Vary payload size and update rate.
- [ ] Save scripts, run instructions, raw results or summarized reports, and environment details.
- [ ] Identify at least one measured bottleneck and make one evidence-based improvement.

### Verify
- [ ] Tests are repeatable enough to compare runs.
- [ ] The report distinguishes estimated capacity from measured results.
- [ ] Latency and error-rate targets are stated before the test.
- [ ] Results explain what the load generator and test machine can sustain.
- [ ] No unsupported claim such as “production-ready for 10,000 users” is made without evidence.

### Deliverable
A reproducible performance report and a reasoned bottleneck analysis.

---

## Week 9 — Security and Observability

**Time budget:** 8–10 hours  
**Learning question:** Can the system reject unauthorized activity and help diagnose failures?

### Learn
- Authentication expiry and revocation.
- Authorization at every command/subscription boundary.
- Origin validation, rate limits, payload limits, and safe error responses.
- Structured logs, correlation IDs, metrics, and tracing basics.
- Avoiding sensitive data in logs.

### Build
- [ ] Review authentication and authorization on REST and socket paths.
- [ ] Validate allowed origins and production TLS assumptions.
- [ ] Apply payload size and event-rate limits.
- [ ] Add structured logs for connect/disconnect, rejected commands, and server errors.
- [ ] Add metrics for active connections, events in/out, handler errors, latency, and event-loop lag where practical.
- [ ] Add a correlation/request ID to trace a simulated order through processing and notification.
- [ ] Add a small operations view or dashboard.
- [ ] Write a security checklist and incident/failure notes.

### Verify
- [ ] Expired/invalid credentials cannot perform protected actions.
- [ ] A client cannot access another user's private events.
- [ ] Logs do not expose tokens, secrets, or unnecessary financial/user data.
- [ ] A failed order can be diagnosed from logs and metrics.
- [ ] Health checks distinguish application readiness from optional dependency failures.

### Deliverable
A security review checklist and an observable system.

---

## Week 10 — Deployment, Documentation, and Portfolio Demo

**Time budget:** 8–10 hours  
**Learning question:** Can someone else run, test, and understand the system?

### Learn
- Container builds, environment variables, secrets, TLS, health checks, and graceful shutdown.
- Deployment configuration for WebSockets and load balancing.
- Documentation that explains trade-offs and failure behavior.

### Build
- [ ] Add reproducible Dockerfiles and Compose configuration where appropriate.
- [ ] Document required environment variables without committing real secrets.
- [ ] Deploy the demo using a suitable hosting setup.
- [ ] Ensure the reverse proxy supports WebSocket upgrades.
- [ ] Add graceful shutdown and connection cleanup.
- [ ] Seed synthetic demo data safely.
- [ ] Write a complete README with setup, architecture, event contract, tests, and known limitations.
- [ ] Add architecture diagrams and a short demo script.
- [ ] Publish load-test findings and explain the test environment.
- [ ] Record future work separately rather than expanding scope indefinitely.

### Verify
- [ ] A clean clone can be configured from the README.
- [ ] Tests and the local development setup work from documented commands.
- [ ] The demo uses only simulated funds/data.
- [ ] Reconnect, multi-instance delivery, and a simulated order can be demonstrated.
- [ ] Architecture, security limitations, and load-test results are honest and clear.

### Deliverable
A deployed project suitable for a technical portfolio walkthrough.

---

# Repository Structure

Start with a simple structure and evolve it only when the code requires it.

```text
pulsefolio/
├── apps/
│   ├── web/
│   │   └── src/
│   │       ├── app/
│   │       ├── features/
│   │       │   ├── market/
│   │       │   ├── portfolio/
│   │       │   ├── orders/
│   │       │   └── session/
│   │       └── realtime/
│   └── api/
│       └── src/
│           ├── config/
│           ├── modules/
│           │   ├── auth/
│           │   ├── market/
│           │   ├── portfolio/
│           │   └── orders/
│           ├── realtime/
│           │   ├── handlers/
│           │   ├── middleware/
│           │   └── rooms.ts
│           ├── events/
│           ├── infrastructure/
│           │   ├── mongodb/
│           │   └── redis/
│           ├── jobs/
│           └── observability/
├── packages/
│   └── contracts/
│       └── src/
├── tests/
│   ├── integration/
│   ├── realtime/
│   └── load/
├── docs/
│   ├── architecture.md
│   ├── event-contracts.md
│   ├── decisions/
│   └── load-test-report.md
├── docker-compose.yml
├── PLAN.md
└── README.md
```

---

# Engineering Decision Log

For important decisions, add a short record under `docs/decisions/`. Use this template:

```text
# Decision: <short title>

## Context
What problem are we solving?

## Options considered
What realistic alternatives exist?

## Decision
What did we choose and why?

## Trade-offs
What gets better? What gets worse?

## Revisit when
What evidence would make us change this decision?
```

Suggested decisions to document:

- Why Socket.IO instead of raw WebSocket for the main app?
- Why is the socket instance outside Redux state?
- Which events are replaceable (market ticks) versus important persisted events (order changes)?
- What delivery guarantee does each event have?
- Why Redis Pub/Sub is sufficient for some events but not durable order publication?
- How is client state reconciled after reconnect?
- What are the measured single-instance and multi-instance limits?

---

# Final Acceptance Checklist

## Product
- [ ] Live watchlist works.
- [ ] Portfolio snapshot and holdings work.
- [ ] Simulated buy/sell orders persist.
- [ ] Order history and notifications work.
- [ ] Demo data is clearly labeled as simulated.

## Real-time engineering
- [ ] Shared, validated event contracts exist.
- [ ] One managed client connection feeds Redux.
- [ ] Room membership and authorization are enforced server-side.
- [ ] Reconnection and snapshot reconciliation are tested.
- [ ] Duplicate and out-of-order event behavior is defined.
- [ ] Cross-instance event distribution works through Redis.
- [ ] Important persisted events have a documented recovery/publication strategy.

## Quality and operations
- [ ] Unit and integration tests run from documented commands.
- [ ] Idempotency and concurrent-order tests pass.
- [ ] Load tests are reproducible and results are documented.
- [ ] Metrics/logging help diagnose failures.
- [ ] Secrets are not committed.
- [ ] Deployment and local setup are documented.
- [ ] Architecture and trade-offs can be explained clearly.

## Final demo script
- [ ] Open two sessions and show a shared market update.
- [ ] Place a simulated order and show the persisted result.
- [ ] Show the order/portfolio update in the other authorized session.
- [ ] Disconnect a client, allow updates to occur, reconnect, and show reconciliation.
- [ ] Stop one API instance and explain what happens.
- [ ] Show the multi-instance test and load-test report.
- [ ] Explain the biggest bottleneck found and the change made to address it.

---

## Notes and Progress

Use this section for weekly retrospectives.

### Week 1
- What I learned:
- What broke:
- How I verified the fix:
- What I would improve:

### Week 2
- What I learned:
- What broke:
- How I verified the fix:
- What I would improve:

### Week 3
- What I learned:
- What broke:
- How I verified the fix:
- What I would improve:

### Week 4
- What I learned:
- What broke:
- How I verified the fix:
- What I would improve:

### Week 5
- What I learned:
- What broke:
- How I verified the fix:
- What I would improve:

### Week 6
- What I learned:
- What broke:
- How I verified the fix:
- What I would improve:

### Week 7
- What I learned:
- What broke:
- How I verified the fix:
- What I would improve:

### Week 8
- What I learned:
- What broke:
- How I verified the fix:
- What I would improve:

### Week 9
- What I learned:
- What broke:
- How I verified the fix:
- What I would improve:

### Week 10
- What I learned:
- What broke:
- How I verified the fix:
- What I would improve:

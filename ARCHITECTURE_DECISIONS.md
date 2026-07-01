# JNAS Architecture Decision Records (ADR)

This log tracks architectural design decisions made during the stabilization and refactoring sprints of JNAS AI Core.

---

## ADR 01: Core Infrastructure Consolidation

### Context
Various packages and custom routes relied on ad-hoc local configurations, raw `console.log` statements, and manual error wrappers. This led to fragmented patterns, circular imports, and difficulty in troubleshooting cross-service problems.

### Decision
Consolidate all infrastructural components under the unified `/src/core` path. This includes types, centralized configuration, custom error subclasses, event publishing hubs, domain-focused loggers, and a dynamic runtime service registry.

### Consequences
- **Positive**: High code-reuse, structured logs, consistent error payloads, and eliminated import loops.
- **Negative**: Adds a thin initial runtime lookup layer on service resolution, which is highly negligible for performance.

---

## ADR 02: Event-Driven Module Coordination

### Context
Modules like Customer Registry, Document Intelligence, and Projects frequently required triggering logging actions or initiating side effects (like updating histories or triggering workflow evaluations) upon certain operations, causing tight structural coupling.

### Decision
Introduce an internal PubSub `EventBus` that handles synchronous and asynchronous event dispatching, supports priority thresholds, handles callback retries, and maintains a rotating 250-item audit trail in-memory.

### Consequences
- **Positive**: Modules emit events and remain decoupled from listener details. Safe retry mechanics handle transient failures.
- **Negative**: Flows are less linearly explicit inside code traces; developers must consult `/EVENT_SYSTEM.md` to trace event pipelines.

---

## ADR 03: Unified Error Typings with Severity and Remediation

### Context
Errors across database, AI, and validation pipelines were caught as generic `any` or `Error` instances, missing recovery actions or systematic categorization.

### Decision
Require all system exceptions to inherit from the base `AppError` class which embeds standardized properties (`code`, `severity`, `recoveryStrategy`, `timestamp`, `context`).

### Consequences
- **Positive**: Allows the UI to consistently render clear instructions telling the user how to recover from failures, with clean backend logging.
- **Negative**: Developers must proactively select and instantiate the appropriate subclass instead of generic `throw new Error()`.

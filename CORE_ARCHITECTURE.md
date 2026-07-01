# JNAS Core Architecture Platform

This document describes the design principles and structural organization of the foundational platform layers of JNAS AI Core.

---

## 1. System Philosophy

The JNAS AI Core is structured using a **Modular Layered Architecture**. The core infrastructure is completely separated from business applications (such as CRM, LMS, or Projects) to ensure maximum maintainability, loose coupling, and high scalability.

```
┌────────────────────────────────────────────────────────┐
│               Business & Product Views                 │
│         (Projects, CRM, Knowledge Base, LMS)           │
├────────────────────────────────────────────────────────┤
│                  Centralized Registry                  │
│       (Customer Registry, Project Registry, KMS)       │
├────────────────────────────────────────────────────────┤
│                 Enterprise Core Layer                  │
│   (Service Registry, Event Bus, Errors, Logger, Config) │
└────────────────────────────────────────────────────────┘
```

---

## 2. Structural Layout (`/src/core`)

All shared infrastructure modules are grouped within `/src/core` to prevent namespace collision and cyclic dependencies:

- **`src/core/types/`**: Houses all global domain-agnostic contracts (Logger interface, EventBus callbacks, Service contracts).
- **`src/core/config/`**: Reads and normalizes ambient systems environment configurations across local development and Cloud Run runtimes.
- **`src/core/events/`**: Provides an in-memory PubSub Event Bus allowing modules to trigger asynchronously and handle callbacks with fault tolerance.
- **`src/core/logging/`**: Supplies specialized event-specific loggers to monitor AI interactions, authentication checks, workflow operations, and more.
- **`src/core/errors/`**: Implements a consistent error hierarchy deriving from a standard AppError structure carrying severity flags and recovery instructions.
- **`src/core/registry/`**: Tracks and exposes active runtime platform engines (AI Gateway, KMS, Search Engine) dynamically to bypass tight structural compilation.

---

## 3. High Availability and Isolation

- **Client-Server Transparency**: System configurations adapt seamlessly. Under Node.js (Express), they reference standard `process.env`. Under Vite, they reference `import.meta.env` or dynamic fallbacks to guard key parameters.
- **Zero Business Logic Coupling**: No domain logic (such as sales targets, document indexes, or user authorization keys) lives within `/src/core/`.
- **Fault Isolation**: Malfunctioning subscribers, un-configured environment parameters, or third-party AI outages are handled cleanly through standardized error classes and retry policies without terminating the core process.

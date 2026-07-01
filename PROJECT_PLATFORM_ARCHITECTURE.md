# JNAS Project Platform Architecture

This document describes the design principles, isolation models, service facades, and core execution boundaries of the JNAS Enterprise Project Management Platform.

---

## 1. System Topology Overview

The Project Platform acts as the structural orchestrator for all business units across JNAS (CRM, LMS, KMS, and Engineering/Packaging Workspaces). Rather than treating projects as a basic database table, the platform provides isolated container workspaces that connect files, tasks, active telemetry streams, and dedicated AI expert personas.

```
                  [Unified Operator Entry Portal]
                                 │
                                 ▼
                     ┌───────────────────────┐
                     │ Project Registry Hub  │
                     │  (Registry Singleton) │
                     └───────────┬───────────┘
                                 │
       ┌─────────────────────────┼─────────────────────────┐
       ▼                         ▼                         ▼
┌──────────────┐          ┌──────────────┐          ┌──────────────┐
│  Engineering │          │   Business   │          │   Learning   │
│   Workspace  │          │   Workspace  │          │   Workspace  │
│ (CAD/Planners)│         │ (AS9100/Sales)│         │  (Safety)    │
└──────┬───────┘          └──────┬───────┘          └──────┬───────┘
       │                         │                         │
       └─────────────────────────┼─────────────────────────┘
                                 │
                                 ▼
                   ┌───────────────────────────┐
                   │ Project Integration Facade│
                   └─────────────┬─────────────┘
                                 │
         ┌───────────────┬───────┴───────┬───────────────┐
         ▼               ▼               ▼               ▼
  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
  │  DocIntel   │ │ Knowledge   │ │ Memory      │ │ AI Gateway  │
  │  (Registry) │ │   (KMS)     │ │  (Logs)     │ │ (Provider)  │
  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
```

---

## 2. Structural Security Boundaries

To enforce zero-trust and role-based confidentiality across divisions:

1. **Workspace Sandboxing**: Projects registered to the `engineering` workspace partition cannot be viewed, listed, or compiled into AI contexts originating in the `business` or `learning` sectors.
2. **Role-Based Clearance Levels**:
   - `Owner`: Absolute administrative rights including deleting, archiving, and editing critical metadata.
   - `Administrator` / `Manager`: Read/write access to project tasks, member invitations, and integration syncs.
   - `Member` / `Viewer`: Standard operation, task checklist mutations, and read-only context analysis queries.
3. **Audit Log Streams**: Every state mutation (e.g. member additions, task completion, and context prompt compilations) writes an immutable entry into the Project Activity Log system.

---

## 3. Modular Integrations Engine

The Project Platform is designed as an decoupled layer:
- **KMS Connectors**: Dynamically matches and links specific standard indexes from the Knowledge Management Service based on project categorizations and hashtags.
- **Unified Context Synthesizer**: Interrogates the Document Registry, Memory Store, and KMS structures to construct dense markdown prompt payloads. These are injected into the safe AI Provider Gateway, ensuring no external large language model directly reads raw project files.
- **Workflow Triggers**: Connects and displays background tasks (such as laser calibration, aerodynamic testing) inside the unified workspace.

# JNAS Enterprise Engineering Workspace

The **JNAS Enterprise Engineering Workspace** is the core operational cockpit for JNAS engineers, architects, managers, and quality inspectors. Rather than acting as a localized CAD geometry engine or direct drawing viewer, this system serves as the high-level control ledger, metadata hub, and contextual bridge for all physical and logical systems built by JNAS.

---

## 1. Architectural Architecture

The Workspace is architected as an offline-first, client-synchronized reactive system built on top of a centralized state registry (`EngineeringRegistry`). This state registry manages:
*   **Engineering Projects & Sub-projects**: Complex engineering assemblies, their budgets, timelines, and milestones.
*   **Drawing Registries & Blueprints**: Comprehensive bills of materials (BOM), revision history trees, and quality clearance vectors.
*   **Audit Trails & Security Ledgers**: Tamper-proof, role-isolated event histories tracing all modifications and IAM state-swaps.
*   **Unified Search Indexes**: Faceted metadata-based indices enabling search-on-demand for drawings, projects, and documents.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        JNAS Command Event Bus                          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ (CMD_ENGINEERING)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        EngineeringPage Controller                      │
├─────────────────┬─────────────────┬──────────────────┬─────────────────┤
│    Dashboard    │  Drawing Registry │   Sub-Projects   │    Standards    │
└────────┬────────┴────────┬────────┴────────┬─────────┴────────┬────────┘
         │                 │                 │                  │
         ▼                 ▼                 ▼                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      EngineeringRegistry (State Engine)                │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                         ┌──────────┴──────────┐
                         ▼                     ▼
              Local Storage Cache      Central Audit Trail
```

---

## 2. Key Objectives & Scope

### In-Scope
*   **Consolidated Workspace**: A single high-density operational grid linking blueprints to projects, budgets, and compliance standards.
*   **Hierarchical BOM Management**: Part tracking with physical composition metadata (e.g. materials, sourcing channels, and unit costs).
*   **Dynamic Gating & Security Isolation**: Multi-profile permission locks simulating three specific roles: `Lead Engineer`, `CAD Designer`, and `QA Inspector`.
*   **Integrated Action Timeline**: Compliance-compliant logging of every document change, download, and review.

### Out-of-Scope (Strict Boundaries)
*   **No CAD Geometry Parsing**: No rendering of heavy 3D canvases, STEP files, or OpenCascade structures.
*   **No Design Automation**: No automatic physical system configuration; all designs are human-engineered and cataloged via the metadata workspace.

---

## 3. UI Worksheets

1.  **Engineering Dashboard**: High-level KPIs, pending reviews, favorite drawings, and recent audit trials.
2.  **Drawings Explorer**: Comprehensive list/grid directory with multi-factor search, interactive detail drawers, revision trees, and BOM structures.
3.  **Project Explorer**: Budget allocation grids, timeline milestones, and tenant team rosters.
4.  **Documents & Standards**: Technical library housing official ASTM, Aviation, and internal geometric standards.
5.  **Compliance Audit Trail**: Live, filterable ledger of security and modification logs.
6.  **Security Policies**: Role access matrices outlining operational constraints.

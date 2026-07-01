# Engineering Workspace Architectural Report

This document outlines the design decisions, component layouts, and security matrices established during the implementation of the JNAS Enterprise Engineering Workspace.

## 1. Technical Goals & Non-Goals

### Core Focus (Intentional Boundaries)
- **Central Activities Hub**: Unified cockpit linking drawings, BOMs, standards, team coordination, and project costs.
- **Enterprise Integration**: Seamless alignment with JNAS customers, projects, and the master command center.
- **Rigorous Auditing**: Compliance-focused, immutable security event trails.

### Non-Goals (Scope Limits)
- *No CAD / Draw-Engine Larping*: We do not write heavy canvas CAD rendering loops or drawing viewer libraries.
- *No Mock Clutter*: We use human-readable labels, authentic materials standards, and genuine interface routes rather than artificial terminal outputs or system indicator noises.

---

## 2. Component Design & Layout Strategy

The workspace features a fluid, responsive sidebar-based viewport:
1. **Top Bar**: Displays the operational department, role isolation dropdowns, and live AI Context Mapping metrics.
2. **Left Sidebar**: Provides instant access to six dedicated workspaces: Dashboard, Drawings Registry, Sub-Projects, Documents & Standards, Compliance Ledger, and Security Isolation Policies.
3. **Dashboard**: Features bento-grid widgets displaying active blueprints, pending QA reviews, saved drawings, and recently modified records.
4. **Drawing Registry**: Highly polished search and sort layout with list/grid toggle options, interactive revision history trees, BOM item explorers, and secure PDF/STEP simulation generators.
5. **Project Explorer**: Links master JNAS projects to milestone timelines and team structures.

---

## 3. Department & Role Isolation (Gated Security)

The JNAS isolation model is driven by state-controlled active directory identities:
- **Lead Engineer**: Full access across all drawing lifecycles and compliance clearances.
- **CAD Designer**: Permitted to create drafts, update drawings, and submit revisions. Locked out of final quality clearances.
- **QA Inspector**: Permitted to approve or reject drawings. Locked out of modifying drawing dimensions.

All transitions are bound to the secure event-bus ledger, providing a transparent audit trail for compliance.

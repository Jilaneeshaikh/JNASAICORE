# JNAS Engineering Drawing Registry

The **Drawing Registry** is the central ledger of truth for all engineering blueprints, CAD package revisions, and hardware system schemas across JNAS.

---

## 1. Metadata Schema

Each drawing cataloged in the registry conforms to a strict data structure optimized for manufacturing pipelines and compliance checks:

| Attribute | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique identifier (e.g., `dwg-x921`). |
| `drawingNumber` | `string` | Human-readable standardized system part string (e.g., `JNAS-PROP-002`). |
| `revision` | `number` | Incremental integer specifying current draft release index. |
| `title` | `string` | Precise system name. |
| `description` | `string` | Technical narrative of the subsystem. |
| `category` | `string` | Classification (e.g., Mechanical, Avionics, Electrical). |
| `owner` | `string` | Assigned engineer username. |
| `projectId` | `string` | Linked parent project. |
| `customerId` | `string` | Linked client reference. |
| `status` | `string` | Assembly lifecycle stage (`Draft`, `Released`, `Obsolete`). |
| `approvalStatus` | `string` | QA compliance check state (`Pending`, `In Review`, `Approved`, `Rejected`). |
| `relatedStandards` | `string[]` | Reference codes to active ASTM/military/aviation standards. |
| `bom` | `BOMItem[]` | Breakdown of components required for physical assembly. |

---

## 2. Bill of Materials (BOM) System

Each drawing houses a structured, nested component matrix specifying everything required to manufacture the physical part:

```
┌────────────────────────────────────────────────────────┐
│             JNAS-PROP-002: Propulsion Assembly         │
├───────────────┬──────────────────────┬─────────────────┤
│ Part Number   │ Material             │ Sourcing        │
├───────────────┼──────────────────────┼─────────────────┤
│ RM-TI-05      │ Grade 5 Titanium     │ Subcontracted   │
│ NOZ-LN-12     │ Inconel 718          │ Purchased       │
│ SL-VT-02      │ Viton FKM            │ In-house        │
└───────────────┴──────────────────────┴─────────────────┘
```

*   **Sourcing Classifications**:
    *   `In-house`: Fabricated directly in JNAS manufacturing facilities.
    *   `Subcontracted`: Spec-built by certified JNAS hardware partners.
    *   `Purchased`: Standard off-the-shelf components.

---

## 3. Revision Controls & Lifecycle Gating

Drawings flow through a strict state machine to prevent unapproved designs from entering production loops:

1.  **Draft**: Newly created or modified drawings.
2.  **In Review**: QA review requested. Dimensions, standards, and material bills are locked.
3.  **Approved**: Drawing approved by QA Inspector or Lead Engineer. It can now be formally **Released**.
4.  **Released**: Active on the factory floor. Immutable; changes require triggering a new revision number (e.g., Revision `R2`).
5.  **Obsolete**: Retired assemblies replaced by a superior revision.

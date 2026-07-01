# JNAS Enterprise Decision Intelligence Platform
## Strategic Steering & Executive Analytics Core Guide
### Document Reference: JNAS-STRAT-DIR-35-A

---

## 1. Executive Summary

This document specifies the architecture and mathematical grounding for the **JNAS Enterprise Decision Intelligence Platform** implemented in Sprint 35. This platform is not a business intelligence reporting tool or a standard dashboard; it is the **centralized executive orchestration and steering layer** for the entire JNAS ecosystem. 

All operational workspace modules—including Customer Relationship Management (CRM), Workflows & Milestones, Engineering Speeds, Reusable Packaging Studio, Learning Management (LMS), Knowledge Base (KMS), and Returnables Asset Lifecycles—publish strategic performance metrics into a central, thread-safe, persisted, and role-secured **KPI Registry**.

---

## 2. Platform Architecture

The Decision Intelligence layer operates as a stateful, singleton singleton service (`DecisionRegistry`) registered within the JNAS micro-service mesh. 

```
  ┌─────────────────────────────────────────────────────────────┐
  │                   JNAS Workspace Ecosystem                  │
  │  (CRM, Projects, Engineering, Packaging, LMS, KMS, Assets)   │
  └──────────────────────────────┬──────────────────────────────┘
                                 │
                                 ▼ [Publish Telemetry]
  ┌─────────────────────────────────────────────────────────────┐
  │                 DecisionRegistry Singleton                  │
  │   - LocalStorage State Synchronization                     │
  │   - Non-Destructive Event Bus Integration                   │
  └───────┬──────────────────────┬──────────────────────┬───────┘
          │                      │                      │
          ▼                      ▼                      ▼
  ┌──────────────┐       ┌──────────────┐       ┌──────────────┐
  │ KPI Registry │       │ Dashboard/   │       │ Audit &      │
  │   Ledger     │       │ Widget Engine│       │ Security IAM │
  └───────┬──────┘       └───────┬──────┘       └───────┬──────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │ [XML Serialization]
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │             JNAS Unified AI Context Grounding               │
  │     - Grounding Decision Copilot Core                      │
  │     - Real-Time Context Token Estimator                     │
  └─────────────────────────────────────────────────────────────┘
```

---

## 3. Grounding KPI Formulas & Formulations

The strategic indicators managed within the registry rely on exact mathematical derivations. The formulas are codified inside the registry schema:

### 3.1. Deal Velocity Ratio (DVR)
- **Target Module**: CRM Portal
- **Code**: `KPI-CRM-DVR`
- **Formula**:
  $$\text{DVR} = \frac{\sum \text{Days in Pipeline for Won Opportunities}}{\text{Total Days Allocated}} \times 100$$
- **Target Threshold**: $\ge 85.0\%$
- **Purpose**: Evaluates customer onboarding velocity to prevent operational resource stagnation.

### 3.2. Milestones Rate (PMR)
- **Target Module**: Workflows & Milestones
- **Code**: `KPI-PROJ-PMR`
- **Formula**:
  $$\text{PMR} = \frac{\text{Milestones Cleared On Time}}{\text{Total Milestones Scheduled}} \times 100$$
- **Target Threshold**: $\ge 90.0\%$
- **Purpose**: Quantifies schedule compliance.

### 3.3. CAD Drawing Approvals Clearance (CDA)
- **Target Module**: Engineering Specs
- **Code**: `KPI-ENG-CDA`
- **Formula**:
  $$\text{CDA} = \frac{\text{Drawings Approved (Rev B+)}}{\text{Total Drawings Created}} \times 100$$
- **Target Threshold**: $\ge 95.0\%$
- **Purpose**: Monitors drafting blockages.

### 3.4. Structural Design Verification (SDV)
- **Target Module**: Packaging Studio
- **Code**: `KPI-PKG-SDV`
- **Formula**:
  $$\text{SDV} = \frac{\text{ASTM/ISTA Compliant Validation Runs}}{\text{Total Packaging Runs Executed}} \times 100$$
- **Target Threshold**: $\ge 98.0\%$
- **Purpose**: Avoids structural failures.

### 3.5. Asset Cycle Optimization (ACO)
- **Target Module**: Returnable Assets
- **Code**: `KPI-RET-ACO`
- **Formula**:
  $$\text{ACO} = \frac{\text{Active Rotation Cycles Completed}}{\text{Design Cycle Capacity Limit}} \times 100$$
- **Target Threshold**: $\ge 92.0\%$
- **Purpose**: Preventative lifecycle dunnage tracking.

---

## 4. Security, Access, and Isolation Levels

Role-Based Workspace Isolation (RBWI) is enforced strictly across the Decision layer:

| Operator Role | Authorization Clearance | Steering Capabilities Allowed |
| :--- | :--- | :--- |
| **Chief Executive** | Level 4 Clearances | Global dashboard creation, master KPI registry modifications, secure Steering Reports generation, context fabric reviews. |
| **Business Manager** | Level 3 Clearances | Sub-module dashboard viewing, local KPI status modifications, team sharing, operations ledger exports. |
| **Systems Engineer** | Level 2 Clearances | Engineering specs indicator inspections, CAD drawing verification logs, local metric reviews. |
| **Department Head** | Level 3 Clearances | Departmental dashboard alignment, audit paths inspections, team sharing. |

---

## 5. AI Context Grounding Schema

Active KPIs are serialized dynamically into `<DECISION_INTELLIGENCE_COGNITION>` XML tags. This standardizes information fed to the server-side AI model to prevent hallucinations:

```xml
<JNAS_UNIFIED_CONTEXT_FABRIC>
  <GENERATED_TIMESTAMP>2026-06-30T18:00:00Z</GENERATED_TIMESTAMP>
  <CURRENT_USER>
    <NAME>Chief Executive</NAME>
    <ROLE>Executive</ROLE>
  </CURRENT_USER>
  <ISOLATION_WORKSPACE>BUSINESS</ISOLATION_WORKSPACE>
  <DECISION_INTELLIGENCE_COGNITION>
    <STRATEGIC_KPIS>
      <KPI id="KPI-CRM-DVR" module="CRM" category="Growth" status="On Track" priority="High">
        <NAME>Deal Velocity Ratio</NAME>
        <DESCRIPTION>Measures pipeline opportunity clearance rate</DESCRIPTION>
        <CURRENT_VALUE>88.4</CURRENT_VALUE>
        <TARGET_VALUE>85</TARGET_VALUE>
        <UNIT>%</UNIT>
        <TREND>up</TREND>
        <FORMULA>Won Deals Pipeline Days / Total Allocated Days * 100</FORMULA>
      </KPI>
    </STRATEGIC_KPIS>
  </DECISION_INTELLIGENCE_COGNITION>
</JNAS_UNIFIED_CONTEXT_FABRIC>
```

---
*Authorized for organization-wide distribution under security clearance level 4.*

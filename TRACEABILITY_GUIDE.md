# JNAS Digital Thread Traceability Guide
## Operations Playbook: Forward, Backward, and Impact Traces
### Document Code: JNAS-DTP-TRC-36-C

---

## 1. Trace Methodologies

The JNAS Digital Thread Platform supports three distinct recursive trace patterns to inspect lineage.

### 1.1. Forward Trace
- **Direction**: `source ──> target`
- **Purpose**: Tracks how raw objects or upstream standards cascade into final assemblies, shipments, and dashboard KPIs.
- **Example**: Selecting a Customer account and tracing forward to see which specific physical racks are currently carrying their transit stock.

### 1.2. Backward Trace
- **Direction**: `target ──> source`
- **Purpose**: Root-cause analysis.
- **Example**: Selecting a failed Quality Inspection on the floor and tracing backwards to see which custom Packaging Design, BOM, or CAD Drawing blueprint approved that configuration.

### 1.3. Impact Trace
- **Direction**: Bidirectional (Upstream + Downstream)
- **Purpose**: Evaluates change risks.
- **Example**: Before modifying a CAD Blueprint (`eng-cad-09`), running an Impact trace tells you exactly which active BOMs, drop tests, load plans, and customer accounts will be affected, assigning an overall risk score to the proposed edit.

---

## 2. Dependency Risk Valuation

Impact Traces calculate a localized centrality score to establish risk:

$$\text{Risk Factor} = \text{Base Connections} + \sum (\text{Connection Strength Weights})$$

- **Risk Score > 7**: **High / Critical Dependency**. Modifying this object requires formal engineering signoff and notifications.
- **Risk Score 4 - 7**: **Moderate Dependency**. Core standard operation.
- **Risk Score < 4**: **Low / Decoupled Dependency**. Localized adjustments are safe.

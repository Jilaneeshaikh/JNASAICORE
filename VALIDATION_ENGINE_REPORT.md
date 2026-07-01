# Enterprise Packaging Validation & Design Rules Engine Report

## 1. Executive Summary
The **Enterprise Packaging Validation & Design Rules Engine** is a core sub-system of the JNAS Enterprise Platform designed to enforce physical, structural, and chemical safety standards on custom packaging designs. It serves as a programmatic gatekeeper that ensures container architectures, material selections, and part configurations conform strictly to military, aerospace, and industrial regulations (e.g., MIL-STD, ASTM, OSHA, NIOSH, ESD, AIAG) before they are released for production.

---

## 2. Core Architectural Pillars

### A. Faceted Rule Categories & Registry
The rules engine maintains a centralized database of rigorous industrial guidelines segmenting compliance checks into:
*   **Safety Rules**: Checks for electrostatic discharge (ESD) safety in avionics, sensor, and energy-storage transports.
*   **Material Rules**: Inspects compound alignments (e.g., foam thickness, compression sets) to prevent payload damage.
*   **Forklift Rules**: Verifies forklift pocket width and clearance tolerances for containers with high deadweight.
*   **Stacking Rules**: Validates vertical tier-stacking factors and corner-post reinforcements.
*   **Ergonomic Rules**: Checks manual-lift weight thresholds and hand-holding design clearances.
*   **Automotive Rules**: Assesses volumetric grid layouts for intermodal standard container footprints.

### B. High-Fidelity Validation Results Schema
The validation results are standardized into explicit compliance codes to aid automated downstream parsing and future AI validation:
*   `Passed`: Design conforms completely to all referenced specifications.
*   `Warning`: Potential hazard or inefficiency detected (e.g., corner post bracing recommended for stacking). Corrective action is advised.
*   `Failed`: Severe violation of compliance codes (e.g., lack of ESD padding in avionics, or lack of forklift pockets in heavyweight structures). Requires immediate engineering revision.
*   `Skipped`: The checked rule is non-applicable to the active design classification (e.g., ESD check skipped for inert metal brackets).
*   `Manual Review Required`: Demands physical drawing validation due to specialized customer/aerospace envelope constraints (e.g., SpaceX payload envelope clearances).

---

## 3. Technical Types & Interfaces Schema

Implemented inside `/src/backend/packaging/types.ts`:

```typescript
export type ValidationRuleCategory =
  | 'Safety Rules'
  | 'Material Rules'
  | 'Forklift Rules'
  | 'Stacking Rules'
  | 'Ergonomic Rules'
  | 'Automotive Rules';

export type ValidationSeverity = 'Error' | 'Warning' | 'Recommendation';

export type ValidationStatus = 'Active' | 'Archived' | 'Draft';

export interface ValidationRule {
  id: string;
  ruleNumber: string; // e.g. "JNAS-RULE-001"
  ruleName: string;
  description: string;
  category: ValidationRuleCategory;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  severity: ValidationSeverity;
  owner: string;
  department: string;
  revision: string;
  status: ValidationStatus;
  version: string;
  customer?: string;
  projectType?: string;
  packagingCategory?: string;
  relatedStandard?: string; // e.g., "ESD-S20.20", "MIL-STD-2073-1D"
  createdAt: string;
  updatedAt: string;
  auditMetadata: {
    createdBy: string;
    approvedBy?: string;
  };
}

export interface ValidationResult {
  ruleId: string;
  ruleNumber: string;
  ruleName: string;
  category: ValidationRuleCategory;
  severity: ValidationSeverity;
  status: 'Passed' | 'Warning' | 'Failed' | 'Skipped' | 'Manual Review Required';
  message: string;
  recommendationPlaceholder?: string;
}

export interface ValidationRun {
  id: string;
  designId: string;
  designNumber: string;
  designName: string;
  executedBy: string;
  executedAt: string;
  overallStatus: 'Passed' | 'Warning' | 'Failed' | 'Manual Review Required';
  results: ValidationResult[];
}
```

---

## 4. Programmatic Validation Logic & Implementation

The validation execution engine is located in `/src/backend/packaging/registry.ts` inside `executeValidation(designId: string)`:

1.  **ESD Protection Compliance (JNAS-RULE-001)**:
    *   *Trigger*: Avionics, Gimbal, Sensor, Battery, or electronic transport specifications.
    *   *Check*: Scans the linked materials of the design. Must find at least one compound containing anti-static, dissipative, or ESD properties in its specification ledger.
    *   *Actionable Recommendation*: Link aerospace ESD polyurethane or dissipative EVA lining compounds.
2.  **Maximum Stacking Load Factor (JNAS-RULE-002)**:
    *   *Trigger*: Steel Rack designs.
    *   *Check*: Scans the active Bill of Materials (BOM). Must contain reinforcing corner posts, support struts, columns, or structural bracket components.
    *   *Actionable Recommendation*: Add post bracing parts to BOM to handle structural vertical stacks.
3.  **Forklift Tine Channel Clearance (JNAS-RULE-003)**:
    *   *Trigger*: Heavyweight engines, thrusters, and custom kitting carts.
    *   *Check*: Validates if design includes forklift pockets, channels, skids, or structural base frames in BOM.
    *   *Actionable Recommendation*: Severe hazard. Insert structural forklift pocket assemblies immediately to comply with OSHA.
4.  **Manual Lift Hand-Carrying Weights (JNAS-RULE-004)**:
    *   *Trigger*: Hand-held totes, plastic boxes, and travel cases.
    *   *Check*: Calculates aggregate BOM part count (proxy for cumulative payload weight). Triggers warning if it exceeds threshold limit of 35 lbs.
    *   *Actionable Recommendation*: Transition tote payload to mechanised hoists or dual-operator hand straps.
5.  **Dunnage Foam Compression Set Margin (JNAS-RULE-005)**:
    *   *Trigger*: General aerospace precision components.
    *   *Check*: Confirms linked materials contain high-density cushioning foam (EVA, Polyurethane) to prevent impulse fatigue damage during launch pad transport.
6.  **AIAG Automotive Standard Alignment (JNAS-RULE-006)**:
    *   *Trigger*: Aerospace customers (SpaceX, Blue Origin).
    *   *Check*: Evaluates custom rocket envelope restrictions. Triggers `Manual Review Required` to require senior signature.

---

## 5. AI Co-Pilot & Workspace Grounding

To facilitate smart, interactive compliance troubleshooting, the active validation results dataset is automatically serialized and injected into the AI context fabric. 

### A. Context Schema (XML Compiler)
```xml
<VALIDATION_RULES>
  <RULE id="rule-001" code="JNAS-RULE-001" category="Safety Rules" severity="Error" priority="Critical" status="Active">
    <NAME>ESD Protection Compliance</NAME>
    <DESCRIPTION>Verifies dissipative linings on avionics transport</DESCRIPTION>
    <RELATED_STANDARD>ESD-S20.20</RELATED_STANDARD>
  </RULE>
</VALIDATION_RULES>
<VALIDATION_RUNS>
  <RUN id="run-1700" designId="dsn-2803" designNum="DSN-PKG-2803" status="Failed" executedAt="2026-06-30T12:00:00Z">
    <DESIGN_NAME>Vector Actuator Gimbal Multi-Kit Cart</DESIGN_NAME>
    <EXECUTED_BY>jilaneeshaikh@gmail.com</EXECUTED_BY>
  </RUN>
</VALIDATION_RUNS>
```

By pressing the **Export to AI** button inside the validation panel, the prompt context is refreshed, allowing engineers to query the AI assistant regarding compliance gaps, e.g.:
> *"Why did DSN-PKG-2803 fail the ESD compliance check, and which MIL-STD standards govern this?"*

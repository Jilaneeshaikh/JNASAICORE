# Rule Engine Specification (Deterministic Audit Engine)

This document details the rule specification format and deterministic validation logics that drive compliance in the JNAS Packaging Studio workspace.

## Rule Specification Object Schema

Every rule conforms to the strict `ValidationRule` TypeScript interface:

| Property | Type | Description |
|---|---|---|
| `id` | `string` | Unique database identifier. |
| `ruleNumber` | `string` | Enterprise compliance number (e.g. `JNAS-RULE-001`). |
| `ruleName` | `string` | Human-readable title of compliance law. |
| `description` | `string` | Comprehensive details of standard check. |
| `category` | `enum` | Segment (Safety, Material, Forklift, Stacking, Ergonomic, Automotive). |
| `priority` | `enum` | Execution severity order (Critical, High, Medium, Low). |
| `severity` | `enum` | Failure impact level (Error, Warning, Recommendation). |
| `owner` | `string` | Engineering author or manager. |
| `department` | `string` | Governing business department. |
| `relatedStandard` | `string` | Reference standard (e.g. MIL-STD, ASTM, OSHA). |

## Algorithmic Evaluations

The Rules Engine runs programmatically (without fuzzy AI approximations) to ensure 100% reliability:

### Rule 001 (ESD Compliance Verification)
```typescript
const needsESD = design.project.name.toLowerCase().includes('avionics') || ...
const hasESD = designMaterials.some(m => m.name.toLowerCase().includes('esd') || ...);
if (needsESD && !hasESD) {
  status = 'Failed';
  message = 'No ESD safe lining material detected.';
}
```

### Rule 002 (Maximum Stacking Reinforcement)
```typescript
const isSteelRack = design.packagingType === 'Steel Rack' || ...
const hasBraces = design.bom.some(item => item.name.toLowerCase().includes('post') || ...);
if (isSteelRack && !hasBraces) {
  status = 'Warning';
  message = 'Corner-post bracing components missing from BOM.';
}
```

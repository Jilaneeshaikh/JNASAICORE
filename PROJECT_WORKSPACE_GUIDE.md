# JNAS Project Workspace Operational Guide

This guide provides instructions for developers and system operators utilizing the JNAS Enterprise Project Platform.

---

## 1. Quick Start Workflow

### A. Manual Creation vs. Templates
Operators can spin up workspaces in two distinct ways:
1. **Manual Inception**: Supply custom metadata fields (Client, category, department, priorities, tags).
2. **Standardized Blueprint Templates**:
   - *Aerospace Engineering Blueprint*: Pre-seeds FEA simulation tasks and structures.
   - *Insulation Casing Packaging*: Pre-configures vacuum seam thermal drop check criteria.
   - *AS9100 Rev D Compliance Guide*: Outlines registrar audit control items.
   - *Aviation Safety LMS Training*: Generates lesson video guidelines.

### B. Project Archiving & Lifecycle States
- **Archiving**: Moving a project into the archive suspends active background simulations and tags the state as `Archived`. It remains available in read-only rosters for history auditing.
- **Cloning**: Duplicating a project makes an exact deep copy of member structures and tasks, resetting progress metrics to streamline recurring pipelines.

---

## 2. Compiling Isolated AI Contexts

The Project workspace integrates directly with the JNAS AI Gateway and Context Builder:
1. Open the **AI Context Assistant** within any active project.
2. Select your query target (e.g. "Assess AS9100 material safety compliance").
3. Choose the context layers to bind (RAG documents, KMS guides, memory logs, team profiles).
4. Click **Compile Prompt**: The platform aggregates, deduplicates, and ranks these components, returning an optimized markdown payload.
5. Click **Trigger AI Analysis**: The compiled prompt is securely funneled through the gateway to generate context-bounded executive answers.

---

## 3. Future Plugin Integrations

Future business modules can integrate seamlessly with Projects without changing the platform core:

### A. CRM Integration (Sales Lead to Project Conversion)
When a sales lead changes status to "Won", the CRM service triggers:
```typescript
import { ProjectRegistry } from '../backend/projects/registry';

const clientPrj = ProjectRegistry.getInstance().createProject(
  "Acme Corp CAD Deployment",
  "Onboarding Acme engineering teams into custom CAD pipelines.",
  "business",
  "business",
  "Sales Manager"
);
```

### B. LMS Training Linkages
When a pilot completes a "Decompression Drill", the LMS platform triggers a Project Activity Log update:
```typescript
import { ProjectRegistry } from '../backend/projects/registry';

ProjectRegistry.getInstance().addActivityLog(
  "prj-safety-lms",
  "usr-pilot-12",
  "WorkflowCompleted",
  "Pilot completed cabin decompression assessment with score 96%."
);
```

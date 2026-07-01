# JNAS Technical Debt Report

This report documents current structural technical debt and recommends strategies to resolve it in future sprints.

---

## 1. Identified Technical Debt Areas

### A. In-Memory Registry Persistence
- **Current State**: Registries (such as Projects, Customers, and Events) run as singleton classes storing data entirely in-memory.
- **Risk**: Clearing browser sessions or restarting the container environment resets all active items back to their seeded state.
- **Remediation**: Transition these registry singletons to load and save states from a persistent Cloud Firestore database using standard repositories.

### B. Inline Mock-Data Seeding
- **Current State**: Mock workspaces and documents are hardcoded or programmatically seeded in frontend UI component initialization.
- **Risk**: Increases the compiled frontend assets size and blurs the lines between backend datastores and client views.
- **Remediation**: Migrate the seeding logic to live within background database migration scripts.

### C. Service Orchestration Couplings
- **Current State**: Some controllers dynamically invoke RAG or KMS utilities with static dependencies.
- **Risk**: Increases circular dependency compiles if features grow.
- **Remediation**: Route future calls through the dynamic lookup authority of the `ServiceRegistry`.

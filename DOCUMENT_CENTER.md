# JNAS Enterprise Document Center (Sprint 20)

The **JNAS Enterprise Document Center** is the unified, single-source-of-truth document registry and linking engine for the entire JNAS ecosystem. It is designed around the philosophy that **every document must exist exactly once, with all other core entities linking to it**.

Whether a document originates in the CRM, Engineering Drawing registry, Milestone Projects, or Packaging Studio, it is registered in a centralized metadata directory, facilitating universal search, full audit logs, security clearance bounds, and structured context feeds for AI model training.

---

## 🚀 Key Objectives & Philosophy

1. **Single Source of Truth**: Eliminate duplicate file uploads. Documents are identified by a unique ID and mapped to logical folder directories.
2. **Dynamic Relationship Mesh**: Documents form associations with external platform components (Customers, Project Milestones, Contacts, KMS Articles, and Memory Engines).
3. **Enterprise Metadata Architecture**: Fully tracks authoring, department ownership, revisions, approval states, and compliance tags.
4. **Structured AI Reference Exposer**: Exposes clean XML representation of documents' full relational maps, eliminating costly extraction scripts.
5. **Security Isolation & Guardrails**: Enforces clear access-level tiers (`Secret`, `Confidential`, `Internal`) and department isolation boundaries.

---

## 📂 Core Architecture

```
   ┌────────────────────────────────────────────────────────┐
   │                    Platform Modules                    │
   │  (CRM, Projects, Engineering, KMS, Packaging, HR, LMS) │
   └───────────────────────────┬────────────────────────────┘
                               │
                      [Linkage / Creation]
                               │
                               ▼
   ┌────────────────────────────────────────────────────────┐
   │             Central JNAS Document Registry             │
   │       - Unique Document ID                             │
   │       - Global File Metadata                           │
   │       - Access Audit Logs                              │
   │       - Event Dispatches on JNAS EventBus              │
   └───────────────────────────┬────────────────────────────┘
                               │
               ┌───────────────┼───────────────┐
               ▼               ▼               ▼
         ┌───────────┐   ┌───────────┐   ┌───────────┐
         │ Customers │   │ Projects  │   │ KMS Docs  │
         │ (Linkage) │   │ (Linkage) │   │ (Linkage) │
         └───────────┘   └───────────┘   └───────────┘
```

---

## 🛠️ Module Index

*   **[DOCUMENT_DOMAIN.md](./DOCUMENT_DOMAIN.md)**: Details the domain entities, types, structures, and schemas.
*   **[DOCUMENT_API.md](./DOCUMENT_API.md)**: Outlines the programmatic interfaces, registry methods, and CRUD capabilities.
*   **[DOCUMENT_UI_GUIDE.md](./DOCUMENT_UI_GUIDE.md)**: Guides on JNAS design guidelines, reuse, layout patterns, and component hierarchies.
*   **[DOCUMENT_SECURITY_GUIDE.md](./DOCUMENT_SECURITY_GUIDE.md)**: Reviews clearances, soft-delete rules, and audit logs.
*   **[MODULE_INTEGRATION_GUIDE.md](./MODULE_INTEGRATION_GUIDE.md)**: Walkthrough for other JNAS platform developers to hook documents into their respective modules.

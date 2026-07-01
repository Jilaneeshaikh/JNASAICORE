# JNAS Customer Registry Platform (Sprint 16)

Welcome to the **JNAS Customer Registry Platform** — the master registry for client workspace data across the entire JNAS ecosystem. 

This platform establishes a single source of truth for all enterprise client accounts. All downstream applications — including Projects, Knowledge (KMS), Memories, and workflows — reference this centralized database.

---

## 📖 Module Technical Documentation

We have compiled the following architectural blueprints, schemas, and operational instructions:

1. **[Customer Domain Architecture](./CUSTOMER_DOMAIN.md)**: Defines the core structural interface schema, data invariants, and relational mappings for client workspaces.
2. **[Customer Registry API Guide](./CUSTOMER_API.md)**: Standard programmatic references for singleton CRUD operations, contact modifiers, favorites roster, and duplicate-merging capabilities.
3. **[Customer UI Guide](./CUSTOMER_UI_GUIDE.md)**: In-depth documentation of the interactive split-pane dashboard, detailed tabbed drawers, and quick-action overlay dialogs.
4. **[Platform Integration Guide](./INTEGRATION_GUIDE.md)**: Operational blueprints showing how the customer registry publishes events to the `eventBus`, queries standard projects, binds KMS documentation, and queries Google Gemini models.

---

## ⚡ Architectural Achievements

- **Zero Duplication**: Leverages existing JNAS core services (`eventBus`, `loggers`, `serviceRegistry`) and dependencies.
- **Relational Integrity**: Integrates with JNAS Project records, KMS sheets, and memory vectors in real-time.
- **AI RAG Sandbox**: Compiles context structures to query Google Gemini Pro through the AI Core platform.
- **Robust Design Patterns**: Implements standard singleton registry patterns, soft deletions, and secure validation rules.
- **Zero-Error Build**: Standardized with the JNAS design system, passing all TypeScript and ESLint checks.

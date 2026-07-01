# JNAS Document Center — Programmatic API

The programmatic interface of the Document Center is managed by the thread-safe, centralized singleton class `DocumentRegistry`.

## 1. Registry Access

The registry is available as a core service singleton:

```typescript
import { DocumentRegistry } from './backend/documents/registry';

const registry = DocumentRegistry.getInstance();
```

---

## 2. API Method Directory

### A. CRUD Operations

#### `createDocument(docInput)`
Registers a new document with metadata and auto-computes derived properties like extension, UUID, MIME-type, and timestamps.
*   **Returns**: `Document` object.

```typescript
const newDoc = registry.createDocument({
  title: "Precision Micro-Nozzle SLA",
  displayName: "MicroNozzle_SLA.docx",
  description: "Operational specs",
  type: "word",
  category: "Engineering"
});
```

#### `getDocument(id)`
Retrieves a single document, updating access audit records.
*   **Returns**: `Document | undefined`.

```typescript
const doc = registry.getDocument("doc-as9100-manual");
```

#### `updateDocument(id, updates)`
Applies incremental updates, automatically increments the version count, and logs the revision event.
*   **Returns**: `Document | undefined`.

#### `deleteDocument(id)`
Toggles the `softDelete` flag to `true`, shielding it from standard workspaces while allowing administrators to review and restore.

---

### B. Relationship Linkages

#### `linkEntity(docId, entityType, entityId)`
Creates a dynamic pointer mapping.
*   **entityType**: `'customer' | 'project' | 'contact' | 'kms' | 'memory'`

```typescript
registry.linkEntity("doc-as9100-manual", "project", "prj-as9100-audit");
```

#### `unlinkEntity(docId, entityType, entityId)`
Removes the specified relation pointer.

---

### C. Advanced Multi-Faceted Search

#### `searchDocuments(criteria)`
Executes highly performant queries across fields, tags, and relational markers.

```typescript
const searchResults = registry.searchDocuments({
  query: "nozzle",
  category: "Engineering",
  confidentiality: "StrictlyConfidential"
});
```

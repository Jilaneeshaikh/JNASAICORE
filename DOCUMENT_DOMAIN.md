# JNAS Document Center — Domain Specification

This specification outlines the master domain models and type systems backing the Enterprise Document Center.

## 1. Domain Entities & Fields

A document is represented by a single structured object mapping extensive properties across compliance, lifecycle, ownership, and relations:

| Property Field | Type | Description |
| :--- | :--- | :--- |
| **id** | `string` | Unique identifier (e.g., `doc-as9100-manual`). |
| **title** | `string` | Descriptive human-readable title of the document. |
| **displayName** | `string` | File name as uploaded/stored (e.g., `AS9100_Manual.pdf`). |
| **description** | `string` | Brief abstract or context. |
| **type** | `DocumentType` | Low-level file classifier (`pdf`, `word`, `cad`, etc.). |
| **category** | `DocumentCategory` | High-level business module domain indicator. |
| **owner** | `string` | Identity of the master record administrator. |
| **workspace** | `string` | Logical division (`personal`, `engineering`, `business`). |
| **status** | `DocumentStatus` | Current operational lifecycle stage. |
| **tags** | `string[]` | Keywords mapped to full-text indices. |
| **version** | `number` | Incremental revision ledger number. |
| **checksum** | `string` | Hash validating file integrity (MD5, etc.). |
| **size** | `number` | File payload size in bytes. |
| **fileExtension**| `string` | Suffix indicating raw file type. |
| **mimeType** | `string` | Universal Internet media type. |
| **storageLocation**| `string` | URI of actual storage (`jnas://s3-us-west-2/...`). |
| **createdDate** | `string` | ISO 8601 creation timestamp. |
| **updatedDate** | `string` | ISO 8601 revision timestamp. |
| **archiveStatus** | `boolean` | Flag indicating historic read-only state. |
| **softDelete** | `boolean` | Flag for recovery (trash bin state). |

---

## 2. Enumerated Domains

### A. Document Type
Encompasses primary modern file architectures:
```typescript
export type DocumentType =
  | 'pdf' | 'word' | 'excel' | 'powerpoint'
  | 'markdown' | 'text' | 'csv' | 'json'
  | 'image' | 'cad' | 'archive' | 'other';
```

### B. Document Category
Maps directly to business operational columns:
```typescript
export type DocumentCategory =
  | 'CRM' | 'Projects' | 'Engineering' | 'Packaging'
  | 'Knowledge' | 'LMS' | 'HR' | 'Finance'
  | 'Procurement' | 'Quality' | 'Administration' | 'General';
```

### C. Document Status
Defines standard workflow lifecycle:
```typescript
export type DocumentStatus =
  | 'Draft' | 'Review' | 'Approved' | 'Released' | 'Archived' | 'Deprecated';
```

---

## 3. Relational Linkage Architecture

Rather than duplicating documents, other registries save document IDs, or the Document Center maintains active arrays of relational pointers:

*   **customerLinks**: Linked customer profile IDs in the JNAS master CRM ledger.
*   **projectLinks**: Linked operational project milestones.
*   **contactLinks**: Associated personnel IDs.
*   **knowledgeLinks**: Associated KMS Knowledge Base Articles.
*   **memoryLinks**: Associated corporate Memory Blocks.

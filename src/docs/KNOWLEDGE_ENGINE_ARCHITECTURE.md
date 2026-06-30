# JNAS Enterprise Knowledge Engine — System Architecture

This document outlines the software design, registration protocols, schemas, and integration directions for the JNAS **Enterprise Knowledge Engine** built during Sprint 7 of the Intelligence Platform phase.

---

## 1. System Architecture Overview

The Knowledge Engine acts as a **decoupled, centralized knowledge middleware layer** that bridges physical document storage, transactional systems (CRM, LMS, Projects), and future intelligent RAG pipelines.

```
+------------------------------------------------------------------------+
|                          JNAS ENTERPRISE ECOSYSTEM                     |
+------------------------------------------------------------------------+
|    [CRM Module]      [LMS Module]      [Engineering]    [Projects]     |
|   Customer Docs     Course Guides     CAD Metadata     Charters & logs |
+---------+-----------------+-----------------+-----------------+--------+
          |                 |                 |                 |
          v                 v                 v                 v
+------------------------------------------------------------------------+
|                       KNOWLEDGE REGISTRY SINGLETON                     |
|                      (src/backend/knowledge/registry.ts)               |
+------------------------------------------------------------------------+
|  * registerSource()                     * registerObject()             |
|  * registerRelationship()               * query()                      |
+-----------------------------------+------------------------------------+
                                    |
                                    v
+------------------------------------------------------------------------+
|                          KNOWLEDGE DATA ENGINE                         |
+------------------------------------------------------------------------+
|  [Ingestion Pipelines]   [Document Catalogs]   [Relational Mappings]   |
+-----------------------------------+------------------------------------+
                                    |
                                    v
+------------------------------------------------------------------------+
|                         UNIVERSAL UI INTERFACES                        |
+------------------------------------------------------------------------+
|  * KnowledgeSearchForm    * KnowledgeCard    * KnowledgeViewer         |
+------------------------------------------------------------------------+
```

---

## 2. Technical Data Schemas

The system enforces strict type validation at `/src/backend/knowledge/types.ts`:

### A. The Knowledge Object (`KnowledgeObject`)
Represents the unified target data model for any corporate artifact:
```typescript
interface KnowledgeObject {
  id: string;               // Unique primary identifier
  title: string;            // Human-readable title
  description: string;      // Concise abstract/summary
  type: KnowledgeSourceType;// Format: pdf, excel, cad_metadata, etc.
  owner: string;            // Document owner/author
  workspace: string;        // Active workspace boundary
  project?: string;         // Connected project ID (optional)
  category: KnowledgeCategory; // Engineering, Packaging, Learning, etc.
  tags: string[];           // Custom keyword index tags
  status: 'Draft' | 'Published' | 'Archived';
  version: string;          // Semantic version string (e.g. 1.2.0)
  metadata: Record<string, any>; // Flexible metadata payload
  permissions: {
    visibility: KnowledgeVisibility; // Public, Organization, Shared, Private
    allowedRoles: string[]; // Role authorization clearances
  };
  source: string;           // Name of the ingestion pipeline source
  createdAt: string;        // ISO timestamp
  updatedAt: string;        // ISO timestamp
}
```

### B. The Knowledge Relationship (`KnowledgeRelationship`)
Captures multidirectional semantic couplings across different system boundaries:
```typescript
interface KnowledgeRelationship {
  sourceId: string;
  targetId: string;
  relationshipType:
    | 'Document_To_Project'
    | 'Project_To_Customer'
    | 'Meeting_To_Project'
    | 'Drawing_To_Packaging'
    | 'Lesson_To_Standard'
    | 'Customer_To_Documents'
    | 'Derived_From'
    | 'References';
  description: string;
}
```

---

## 3. Developer Integration Guide

### How to Register a Module Ingestion Source
To register an upstream microservice pipeline (for example, the CRM Customer notes system):

```typescript
import { registry } from '@/backend/knowledge/registry';

// 1. Establish your pipeline channel
registry.registerSource({
  id: 'src-crm-pipeline',
  name: 'CRM Customer Sync Pipeline',
  description: 'Synchronizes custom customer account logs.',
  ownerModule: 'CRM',
  category: 'Customers',
  permissions: {
    roles: ['sales_representative', 'engineer'],
    visibility: 'Organization'
  },
  version: '1.0.0',
  status: 'Active',
  tags: ['accounts', 'crm']
});
```

### How to Ingest a Knowledge Object
Once a pipeline is registered, any system action can ingest a specific document object:

```typescript
registry.registerObject({
  id: 'obj-contract-999',
  title: 'Acme Logistics Master Agreement',
  description: 'Core logistics agreement specs.',
  type: 'word',
  owner: 'Clarissa Evans',
  workspace: 'Enterprise Sales',
  project: 'Acme-Transit-2026',
  category: 'Customers',
  tags: ['acme', 'agreement', 'sla'],
  status: 'Published',
  version: '1.0.0',
  metadata: { contractValueUsd: 500000 },
  permissions: {
    visibility: 'Shared',
    allowedRoles: ['sales_representative']
  },
  source: 'CRM Customer Sync Pipeline',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});
```

### How to Map Cross-Module Relationships
Establish connections to build a rich corporate knowledge graph:

```typescript
registry.registerRelationship({
  sourceId: 'obj-contract-999',  // CRM Agreement
  targetId: 'obj-eng-001',       // Engineering Design spec
  relationshipType: 'Customer_To_Documents',
  description: 'Design requirements dictated directly by Acme SLA Section 4.2.'
});
```

---

## 4. Future AI & Semantic RAG Integration Blueprint

The JNAS Knowledge Engine has been architected to scale directly into a fully active AI-powered RAG (Retrieval-Augmented Generation) system:

1. **Semantic Ingestion Pipeline**: In a future sprint, when a `KnowledgeObject` is registered, its description and raw text will be dispatched to an embedding service (e.g., Gemini `text-embedding-004`) to generate a 768-dimension vector.
2. **Vector Indexing**: The vector coordinate along with the `KnowledgeObject` reference will be cataloged inside a Vector Database (such as Pinecone, Chroma, or Cloud SQL pgvector).
3. **Graph Retrieval & Prompt Assembly**: When an agent query is initiated from the AI Core Chat, the engine will query pgvector, identify close coordinate neighbors, map their physical relationships (using our `KnowledgeRelationship` links), and append this structured context directly to the Gemini LLM prompt window.

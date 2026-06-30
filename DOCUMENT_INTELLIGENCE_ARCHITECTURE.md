# JNAS Enterprise Document Intelligence & RAG Platform

This document describes the design principles, isolation boundaries, and processing mechanisms of the Document Intelligence and Retrieval-Augmented Generation (RAG) Platform.

---

## 1. System Topology Overview

The JNAS Document Intelligence engine acts as the foundational knowledge-ingestion gate. Rather than acting as standard document storage, it processes raw files into optimized, contextual text slices.

```
       [Raw Files / Stream Data]
                   │
                   ▼
  ┌─────────────────────────────────┐
  │   Ingestion Sandbox Pipeline    │
  │  (Upload, Scan, Extract, Chunk) │
  └────────────────┬────────────────┘
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
┌──────────────┐      ┌──────────────┐
│  KMS Catalog │      │ Document Reg │
└──────────────┘      └──────┬───────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ RAG Retrieval   │◄── [Query Vector]
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Context Builder │◄── [Recent Memory & Search]
                    └────────┬────────┘
                             │
                             ▼
                    [Compiled Prompts]
                    [  to AI Gateway ]
```

---

## 2. Ingestion Pipeline Stages

Every registered document runs through an automated, multi-stage processing pipeline:

1. **Upload Stream Handshake**: Receives and validates raw binary streams, checking size limits and generating deterministic checksum hashes.
2. **Format Verification**: Checks support parameters. Invokes dedicated parser engines with dynamic priorities.
3. **Antivirus Scanning**: Simulates anti-malware filter clearances to secure downstream containers.
4. **Layout & Content Extraction**: Parses text strings, extracting metadata variables, spreadsheets grids, and CAD coordinate layers.
5. **Language Classification**: Automatically localizes streams for precise prompt stitching.
6. **Overlap Chunking Partition**: Decomposes text into standard character slices with **15% overlaps** to avoid contextual information cutting.
7. **Ecosystem Registry Dispatch**: Fires notifications and seeds catalogs within KMS, Memory, and Search registries.

---

## 3. Security & Workspace Isolation

To enforce multi-tenant isolation, the RAG Retrieval engine validates operations against three strict boundaries:

- **Workspace Enclosures**: Documents uploaded to the `engineering` workspace can never be queried or compiled into payloads originating in the `business` workspace.
- **Role-Based Clearance Filters**: Chunks carry classification levels (`public` | `internal` | `confidential` | `restricted`). Only clients possessing equivalent clearance levels receive matching results.
- **Reference URL Integrity**: All compiled context sources provide direct navigation pathways (`#/${workspace}/docs/${id}`) for auditing purposes.

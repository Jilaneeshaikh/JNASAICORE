# JNAS J-Intelligence Platform - Changelog

## [Sprint 12] - Enterprise Document Intelligence & RAG Platform

### Added
- Created `/src/backend/document-intelligence/types.ts` defining all schema constraints for document metadata, partition slices, pipeline states, and context payloads.
- Created `/src/backend/document-intelligence/parserRegistry.ts` establishing parser structures with version prioritization, fallback mechanisms, and out-of-the-box parsers for PDF, CAD/DWG, DOCX, Markdown, XLSX, Text, and ZIP.
- Created `/src/backend/document-intelligence/documentRegistry.ts` for secure metadata querying, in-memory isolation, deletion safety, and auditing logs.
- Created `/src/backend/document-intelligence/pipeline.ts` executing the step-by-step ingestion workflow with sub-stage latencies, custom chunk overlap controls (15%), and link triggers into KMS catalogs.
- Created `/src/backend/document-intelligence/retrieval.ts` conducting text query score calculations, coordinate maps filtering, and workspace role clearances.
- Created `/src/backend/document-intelligence/contextBuilder.ts` assembling context divisions, token estimates, and markdown prompt formatting sent to the AI gateway.
- Created `/src/backend/document-intelligence/mockData.ts` to populate the workspace directory with structured specifications, vector blueprints, manuals, and ledgers.
- Created `/src/pages/DocumentIntelligencePage.tsx` delivering the dashboard, log terminal visualizer, file manager, retrieval sandbox, parser management knobs, and developer manuals.

### Modified
- Updated `/src/hooks/useRouter.ts` to introduce the `'document-intelligence'` state literal.
- Updated `/src/App.tsx` importing and rendering `DocumentIntelligencePage` within standard route mappings.
- Updated `/src/layouts/AppShell.tsx` importing and appending the sidebar launcher navigation links.

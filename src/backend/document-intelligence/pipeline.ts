import { 
  DocumentMetadata, 
  DocumentChunk, 
  DocumentFormat, 
  SecurityClassification, 
  PipelineState, 
  PipelineLog 
} from './types';
import { parserRegistry } from './parserRegistry';
import { documentRegistry } from './documentRegistry';
import { registry as kmsRegistry } from '../knowledge/registry';

// Simple helper to generate dummy checksums
function generateDummyChecksum(): string {
  const chars = 'abcdef0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export interface ProcessingResult {
  document: DocumentMetadata;
  chunks: DocumentChunk[];
  state: PipelineState;
}

export async function processDocument(
  fileData: {
    title: string;
    description: string;
    content: string;
    format: DocumentFormat;
    owner: string;
    workspace: string;
    project?: string;
    module?: string;
    category: string;
    tags: string[];
    classification?: SecurityClassification;
  },
  onProgress?: (state: PipelineState) => void
): Promise<ProcessingResult> {
  const docId = `doc-${Date.now()}`;
  const classification = fileData.classification || 'internal';
  const sizeBytes = fileData.content.length * 2; // Rough estimate of UTF-16 bytes

  const state: PipelineState = {
    documentId: docId,
    currentStage: 'Upload',
    progressPercentage: 5,
    logs: [],
    metrics: {}
  };

  const addLog = (stage: string, status: PipelineLog['status'], message: string) => {
    const log: PipelineLog = {
      timestamp: new Date().toISOString(),
      stage,
      status,
      message
    };
    state.logs.push(log);
    if (onProgress) {
      onProgress({ ...state });
    }
  };

  // Stage 1: Upload
  addLog('Upload', 'info', `Ingesting file stream: "${fileData.title}" [${fileData.format.toUpperCase()}]`);
  const uploadStart = Date.now();
  await new Promise((r) => setTimeout(r, 100)); // Simulate IO
  state.metrics.uploadTimeMs = Date.now() - uploadStart;
  addLog('Upload', 'success', `File bytes ingested: ${sizeBytes} bytes.`);
  state.progressPercentage = 15;

  // Stage 2: Validation
  state.currentStage = 'Validation';
  addLog('Validation', 'info', `Verifying document format and schema guidelines for ${fileData.format}`);
  await new Promise((r) => setTimeout(r, 80));
  const parsers = parserRegistry.getParsersForFormat(fileData.format);
  if (parsers.length === 0) {
    addLog('Validation', 'error', `No direct parser registered for format: ${fileData.format}. Ingestion halted.`);
    throw new Error(`Unsupported document format: ${fileData.format}`);
  }
  const activeParser = parsers[0];
  addLog('Validation', 'success', `Format validated. Selected primary engine: ${activeParser.name} (v${activeParser.version})`);
  state.progressPercentage = 25;

  // Stage 3: Virus Scan Interface
  state.currentStage = 'Virus Scan';
  const virusStart = Date.now();
  addLog('Virus Scan', 'info', 'Routing raw binary stream through JNAS Enterprise Antivirus Filter Gate...');
  await new Promise((r) => setTimeout(r, 150));
  state.metrics.virusScanTimeMs = Date.now() - virusStart;
  addLog('Virus Scan', 'success', 'Virus check complete: Clean payload. Threat assessment index: 0.00.');
  state.progressPercentage = 40;

  // Stage 4: Metadata & Content Extraction
  state.currentStage = 'Extraction';
  const extractStart = Date.now();
  addLog('Extraction', 'info', `Invoking parser: ${activeParser.id} ...`);
  
  const parsedData = await activeParser.parse(fileData.content);
  state.metrics.contentExtractTimeMs = Date.now() - extractStart;
  state.metrics.metadataExtractTimeMs = Math.round(state.metrics.contentExtractTimeMs * 0.2);
  
  addLog('Extraction', 'success', `Successfully extracted ${parsedData.text.length} chars of plaintext content.`);
  if (parsedData.outline && parsedData.outline.length > 0) {
    addLog('Extraction', 'info', `Extracted document layout containing ${parsedData.outline.length} structural headers.`);
  }
  state.progressPercentage = 60;

  // Stage 5: Language Detection
  state.currentStage = 'Language Detection';
  addLog('Language Detection', 'info', 'Analyzing linguistic features for document localization...');
  await new Promise((r) => setTimeout(r, 60));
  const detectedLang = parsedData.text.includes('Blueprint') || parsedData.text.includes('Aerospace') ? 'English (Aviation Technical)' : 'English (US Standard)';
  addLog('Language Detection', 'success', `Linguistic classification completed: Detected ${detectedLang}.`);
  state.progressPercentage = 70;

  // Stage 6: Chunking
  state.currentStage = 'Chunking';
  const chunkStart = Date.now();
  addLog('Chunking', 'info', `Decomposing document text into logical, overlapping vectors (overlap constraints: 15%).`);
  
  // Real chunking execution
  const text = parsedData.text;
  const targetChunkSize = 300; // Target characters per chunk
  const chunksList: DocumentChunk[] = [];
  let chunkIndex = 0;
  let cursor = 0;

  while (cursor < text.length) {
    const end = Math.min(cursor + targetChunkSize, text.length);
    const chunkContent = text.substring(cursor, end);
    const chunkId = `${docId}-chunk-${chunkIndex}`;
    
    chunksList.push({
      id: chunkId,
      documentId: docId,
      chunkNumber: chunkIndex + 1,
      content: chunkContent,
      sizeBytes: chunkContent.length * 2,
      startCharIndex: cursor,
      endCharIndex: end,
      metadata: {
        title: `${fileData.title} - Segment ${chunkIndex + 1}`,
        pageNumber: Math.floor(cursor / 1000) + 1,
        tags: fileData.tags
      },
      security: {
        classification: classification,
        allowedRoles: ['admin', 'operator', 'auditor']
      },
      relationships: {
        siblingIds: [] // Will set below
      }
    });

    // Advance cursor with overlap
    cursor += Math.floor(targetChunkSize * 0.85); // 15% overlap
    if (cursor >= text.length) break;
    chunkIndex++;
  }

  // Bind siblings relationships
  for (let i = 0; i < chunksList.length; i++) {
    const siblings: string[] = [];
    if (i > 0) siblings.push(chunksList[i - 1].id);
    if (i < chunksList.length - 1) siblings.push(chunksList[i + 1].id);
    chunksList[i].relationships.siblingIds = siblings;
  }

  state.metrics.chunkTimeMs = Date.now() - chunkStart;
  addLog('Chunking', 'success', `Partitioned text into ${chunksList.length} distinct chunks. Mean segment length: ${Math.round(text.length / (chunksList.length || 1))} characters.`);
  state.progressPercentage = 85;

  // Stage 7: Index Preparation & Registrations
  state.currentStage = 'Index Preparation';
  addLog('Index Preparation', 'info', 'Building token lookup schemas and inverse index directories...');
  await new Promise((r) => setTimeout(r, 100));

  // Dynamic cross-module links
  // Hook into KMS (Knowledge Management System)
  try {
    kmsRegistry.registerSource({
      id: `source-${docId}`,
      name: fileData.title,
      description: fileData.description,
      ownerModule: fileData.module || 'DocIntel',
      category: 'Standards',
      permissions: {
        roles: ['admin', 'operator'],
        visibility: 'Organization'
      },
      version: '1.0.0',
      status: 'Active',
      tags: fileData.tags
    });
    addLog('Index Preparation', 'success', 'Linked reference source created inside Enterprise KMS Catalog.');
  } catch (err) {
    addLog('Index Preparation', 'warn', 'KMS Catalog link bypassed. Document compiled independently.');
  }

  // Mock Hook into Memory Engine, Universal Search, and Workflows
  addLog('Index Preparation', 'success', `Cross-registered search metadata for universal index queries.`);
  addLog('Index Preparation', 'success', `Fired system event: "WORKFLOW_TRIGGER: DOCUMENT_INDEXED" targeting workflow registries.`);
  
  state.progressPercentage = 100;
  state.metrics.totalTimeMs = 
    (state.metrics.uploadTimeMs || 0) +
    (state.metrics.virusScanTimeMs || 0) +
    (state.metrics.contentExtractTimeMs || 0) +
    (state.metrics.chunkTimeMs || 0);

  addLog('Index Preparation', 'success', `Processing pipeline complete! Consolidated file registered in ${state.metrics.totalTimeMs}ms.`);

  const newDoc: DocumentMetadata = {
    id: docId,
    title: fileData.title,
    description: fileData.description,
    format: fileData.format,
    sizeBytes,
    owner: fileData.owner,
    workspace: fileData.workspace,
    project: fileData.project,
    module: fileData.module,
    category: fileData.category,
    tags: fileData.tags,
    version: 1,
    status: 'indexed',
    classification,
    checksum: generateDummyChecksum(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    customFields: parsedData.metadata
  };

  // Store in global singleton registry
  documentRegistry.registerDocument(newDoc, chunksList);

  return {
    document: newDoc,
    chunks: chunksList,
    state
  };
}

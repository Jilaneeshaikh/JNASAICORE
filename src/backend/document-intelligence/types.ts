export type DocumentFormat =
  | 'pdf'
  | 'docx'
  | 'xlsx'
  | 'pptx'
  | 'md'
  | 'txt'
  | 'csv'
  | 'json'
  | 'image'
  | 'dwg' // CAD drawing
  | 'zip'
  | 'other';

export type DocumentStatus = 'uploaded' | 'processing' | 'indexed' | 'failed';

export type SecurityClassification = 'public' | 'internal' | 'confidential' | 'restricted';

export interface DocumentMetadata {
  id: string;
  title: string;
  description: string;
  format: DocumentFormat;
  sizeBytes: number;
  owner: string;
  workspace: string;
  project?: string;
  module?: string;
  category: string;
  tags: string[];
  version: number;
  status: DocumentStatus;
  classification: SecurityClassification;
  checksum: string;
  createdAt: string;
  updatedAt: string;
  customFields?: Record<string, any>;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  chunkNumber: number;
  content: string;
  sizeBytes: number;
  startCharIndex: number;
  endCharIndex: number;
  metadata: {
    title: string;
    section?: string;
    pageNumber?: number;
    tags?: string[];
  };
  security: {
    classification: SecurityClassification;
    allowedRoles: string[];
  };
  relationships: {
    siblingIds: string[]; // Prev/next chunk
    knowledgeObjectIds?: string[];
    memoryObjectIds?: string[];
    searchResultIds?: string[];
  };
}

export interface PipelineLog {
  timestamp: string;
  stage: string;
  status: 'info' | 'success' | 'warn' | 'error';
  message: string;
}

export interface PipelineState {
  documentId: string;
  currentStage: string;
  progressPercentage: number;
  logs: PipelineLog[];
  metrics: {
    uploadTimeMs?: number;
    virusScanTimeMs?: number;
    metadataExtractTimeMs?: number;
    contentExtractTimeMs?: number;
    chunkTimeMs?: number;
    totalTimeMs?: number;
  };
}

export interface DocumentParser {
  id: string;
  name: string;
  version: string;
  supportedFormats: DocumentFormat[];
  status: 'online' | 'offline' | 'disabled';
  priority: number;
  fallbackParserId?: string;
  parse: (content: any, options?: Record<string, any>) => Promise<{
    text: string;
    metadata: Record<string, any>;
    outline: { title: string; level: number; page?: number }[];
  }>;
}

export interface RetrievalQuery {
  text?: string;
  workspace: string;
  project?: string;
  module?: string;
  categories?: string[];
  tags?: string[];
  classification?: SecurityClassification[];
  limit?: number;
}

export interface RetrievalResult {
  chunk: DocumentChunk;
  relevanceScore: number; // Simulated
  documentTitle: string;
  documentFormat: DocumentFormat;
}

export interface ContextBuilderConfig {
  includeDocuments: boolean;
  includeKnowledge: boolean;
  includeMemory: boolean;
  includeSearchResults: boolean;
  maxTokens: number;
  diversityWeight: number; // 0 to 1
}

export interface UnifiedContextPayload {
  contextString: string;
  tokenCount: number;
  sources: {
    type: 'document' | 'knowledge' | 'memory' | 'search';
    id: string;
    title: string;
    referenceUrl?: string;
  }[];
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  action: 'upload' | 'process' | 'view' | 'delete' | 'retrieve' | 'permission_change';
  documentId: string;
  workspace: string;
  status: 'success' | 'failure';
  details: string;
}

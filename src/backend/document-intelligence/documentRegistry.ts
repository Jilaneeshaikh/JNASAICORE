import { DocumentMetadata, DocumentChunk, AuditLogEntry, SecurityClassification } from './types';

class DocumentRegistry {
  private documents: Map<string, DocumentMetadata> = new Map();
  private chunks: Map<string, DocumentChunk[]> = new Map();
  private auditLogs: AuditLogEntry[] = [];

  public registerDocument(doc: DocumentMetadata, docChunks: DocumentChunk[]): void {
    this.documents.set(doc.id, doc);
    this.chunks.set(doc.id, docChunks);
    this.addAuditLog('system', 'upload', doc.id, doc.workspace, 'success', `Successfully registered document "${doc.title}" with version ${doc.version} and ${docChunks.length} content chunks.`);
  }

  public getDocument(id: string): DocumentMetadata | undefined {
    return this.documents.get(id);
  }

  public getChunksForDocument(docId: string): DocumentChunk[] {
    return this.chunks.get(docId) || [];
  }

  public getDocuments(): DocumentMetadata[] {
    return Array.from(this.documents.values());
  }

  public deleteDocument(id: string, userId: string = 'operator'): boolean {
    const doc = this.getDocument(id);
    if (doc) {
      this.documents.delete(id);
      this.chunks.delete(id);
      this.addAuditLog(userId, 'delete', id, doc.workspace, 'success', `Deleted document "${doc.title}" and purged all associated chunks.`);
      return true;
    }
    return false;
  }

  public queryDocuments(filters: {
    query?: string;
    workspace?: string;
    project?: string;
    module?: string;
    format?: string;
    classification?: SecurityClassification;
    status?: string;
  }): DocumentMetadata[] {
    return this.getDocuments().filter((doc) => {
      if (filters.workspace && doc.workspace !== filters.workspace) return false;
      if (filters.project && doc.project !== filters.project) return false;
      if (filters.module && doc.module !== filters.module) return false;
      if (filters.format && doc.format !== filters.format) return false;
      if (filters.classification && doc.classification !== filters.classification) return false;
      if (filters.status && doc.status !== filters.status) return false;

      if (filters.query) {
        const q = filters.query.toLowerCase();
        const matchesTitle = doc.title.toLowerCase().includes(q);
        const matchesDesc = doc.description.toLowerCase().includes(q);
        const matchesCategory = doc.category.toLowerCase().includes(q);
        const matchesTags = doc.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesCategory && !matchesTags) return false;
      }

      return true;
    });
  }

  public updateDocumentClassification(id: string, classification: SecurityClassification, userId: string = 'operator'): boolean {
    const doc = this.documents.get(id);
    if (doc) {
      const oldVal = doc.classification;
      doc.classification = classification;
      doc.updatedAt = new Date().toISOString();
      this.addAuditLog(userId, 'permission_change', id, doc.workspace, 'success', `Modified document classification from ${oldVal} to ${classification}`);
      return true;
    }
    return false;
  }

  public addAuditLog(
    userId: string,
    action: AuditLogEntry['action'],
    documentId: string,
    workspace: string,
    status: 'success' | 'failure',
    details: string
  ): void {
    const entry: AuditLogEntry = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      userId,
      action,
      documentId,
      workspace,
      status,
      details,
    };
    this.auditLogs.unshift(entry); // Newest first
  }

  public getAuditLogs(documentId?: string): AuditLogEntry[] {
    if (documentId) {
      return this.auditLogs.filter((log) => log.documentId === documentId);
    }
    return this.auditLogs;
  }
}

export const documentRegistry = new DocumentRegistry();
export default documentRegistry;

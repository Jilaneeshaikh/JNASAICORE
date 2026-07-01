import { Document, DocumentActivityLog, DocumentStatus, DocumentType, DocumentCategory, ConfidentialityLevel } from './types';
import { seedDocuments } from './mockData';
import { eventBus, loggers, serviceRegistry, IService, EventPriority } from '../../core';

export class DocumentRegistry implements IService {
  private static instance: DocumentRegistry;
  public serviceId = 'DocumentRegistry';

  private documents: Map<string, Document> = new Map();
  private activityLogs: DocumentActivityLog[] = [];
  private recentIds: string[] = [];
  private maxRecentCount = 10;

  private constructor() {}

  public static getInstance(): DocumentRegistry {
    if (!this.instance) {
      this.instance = new DocumentRegistry();
      // Auto-register with Core Service Registry
      serviceRegistry.register(this.instance);
    }
    return this.instance;
  }

  public async initialize(): Promise<void> {
    loggers.app.info('Document Registry Service initializing...');
    
    // Seed initial database if empty
    if (this.documents.size === 0) {
      seedDocuments.forEach(doc => {
        this.documents.set(doc.id, { ...doc });
      });
      loggers.app.info(`Document Registry seeded successfully with ${this.documents.size} enterprise documents.`);
    }
  }

  public async shutdown(): Promise<void> {
    loggers.app.info('Document Registry Service shutting down...');
  }

  private generateId(): string {
    return 'doc-' + Math.random().toString(36).substring(2, 11);
  }

  /**
   * Log document events internally and publish onto JNAS EventBus
   */
  public logActivity(
    docId: string,
    actionType: DocumentActivityLog['actionType'],
    details: string,
    operator: string = 'usr-operator'
  ) {
    const log: DocumentActivityLog = {
      id: 'doclog-' + Math.random().toString(36).substring(2, 11),
      documentId: docId,
      timestamp: new Date().toISOString(),
      actionType,
      operator,
      details
    };
    this.activityLogs.unshift(log);

    // Also dispatch onto global EventBus
    const eventType = `DOCUMENT_${actionType.toUpperCase()}`;
    eventBus.publish(eventType, { documentId: docId, log }, {
      emitter: 'DocumentRegistry',
      priority: EventPriority.NORMAL
    });
  }

  /**
   * Track access history (recent documents)
   */
  public trackAccess(docId: string) {
    if (!this.documents.has(docId)) return;
    this.recentIds = this.recentIds.filter(id => id !== docId);
    this.recentIds.unshift(docId);
    if (this.recentIds.length > this.maxRecentCount) {
      this.recentIds.pop();
    }
  }

  /**
   * Retrieve all non-deleted, non-archived documents
   */
  public getDocuments(includeArchived = false, includeDeleted = false): Document[] {
    return Array.from(this.documents.values()).filter(doc => {
      if (!includeDeleted && doc.softDelete) return false;
      if (!includeArchived && doc.archiveStatus) return false;
      return true;
    });
  }

  /**
   * Get single document by ID, automatically recording access history
   */
  public getDocument(id: string): Document | undefined {
    const doc = this.documents.get(id);
    if (doc) {
      this.trackAccess(id);
    }
    return doc;
  }

  /**
   * Create new document record in the registry
   */
  public createDocument(docInput: Partial<Document> & { title: string; displayName: string }): Document {
    const id = this.generateId();
    const timestamp = new Date().toISOString();
    
    const fileExt = docInput.displayName.split('.').pop() || 'txt';
    const guessedMime = this.getMimeType(fileExt);

    const doc: Document = {
      id,
      title: docInput.title,
      displayName: docInput.displayName,
      description: docInput.description || '',
      type: docInput.type || 'text',
      category: docInput.category || 'General',
      owner: docInput.owner || 'usr-operator',
      workspace: docInput.workspace || 'personal',
      project: docInput.project,
      customer: docInput.customer,
      contact: docInput.contact,
      module: docInput.module || 'Administration',
      status: docInput.status || 'Draft',
      tags: docInput.tags || [],
      permissions: docInput.permissions || { roles: [], users: [], departments: [] },
      version: 1,
      checksum: docInput.checksum || Math.random().toString(36).substring(2, 15),
      size: docInput.size || 1024,
      fileExtension: fileExt,
      mimeType: guessedMime,
      storageLocation: `jnas://s3-us-west-2/docs/${docInput.displayName}`,
      createdDate: timestamp,
      updatedDate: timestamp,
      archiveStatus: false,
      softDelete: false,
      isFavorite: false,
      author: docInput.author || 'System Operator',
      department: docInput.department || 'Operations',
      revision: docInput.revision || 'Rev A',
      approvalStatus: docInput.approvalStatus || 'Pending',
      confidentiality: docInput.confidentiality || 'Internal',
      keywords: docInput.keywords || [],
      labels: docInput.labels || {},
      customProperties: docInput.customProperties || {},
      customerLinks: docInput.customerLinks || [],
      projectLinks: docInput.projectLinks || [],
      contactLinks: docInput.contactLinks || [],
      knowledgeLinks: docInput.knowledgeLinks || [],
      memoryLinks: docInput.memoryLinks || []
    };

    this.documents.set(id, doc);
    this.logActivity(id, 'Created', `Registered new enterprise document: ${doc.title} (${doc.displayName})`);
    return doc;
  }

  /**
   * Update existing document configuration
   */
  public updateDocument(id: string, updates: Partial<Document>): Document | undefined {
    const doc = this.documents.get(id);
    if (!doc) return undefined;

    const timestamp = new Date().toISOString();
    const updatedDoc: Document = {
      ...doc,
      ...updates,
      version: doc.version + 1,
      updatedDate: timestamp
    };

    this.documents.set(id, updatedDoc);
    this.logActivity(id, 'Updated', `Document properties updated. Version incremented to v${updatedDoc.version}`);
    return updatedDoc;
  }

  /**
   * Archive document
   */
  public archiveDocument(id: string): boolean {
    const doc = this.documents.get(id);
    if (!doc) return false;

    doc.archiveStatus = true;
    doc.status = 'Archived';
    doc.updatedDate = new Date().toISOString();
    this.logActivity(id, 'Archived', 'Document archived and moved to inactive directories.');
    return true;
  }

  /**
   * Unarchive document
   */
  public unarchiveDocument(id: string): boolean {
    const doc = this.documents.get(id);
    if (!doc) return false;

    doc.archiveStatus = false;
    doc.status = 'Draft';
    doc.updatedDate = new Date().toISOString();
    this.logActivity(id, 'Restored', 'Document restored from archived records.');
    return true;
  }

  /**
   * Soft delete document
   */
  public deleteDocument(id: string): boolean {
    const doc = this.documents.get(id);
    if (!doc) return false;

    doc.softDelete = true;
    doc.updatedDate = new Date().toISOString();
    this.logActivity(id, 'Deleted', 'Document soft-deleted and transferred to recycle bin.');
    return true;
  }

  /**
   * Hard wipe document (from system maps completely)
   */
  public hardWipeDocument(id: string): boolean {
    if (!this.documents.has(id)) return false;
    this.documents.delete(id);
    this.recentIds = this.recentIds.filter(recentId => recentId !== id);
    return true;
  }

  /**
   * Restore soft deleted document
   */
  public restoreDocument(id: string): boolean {
    const doc = this.documents.get(id);
    if (!doc) return false;

    doc.softDelete = false;
    doc.updatedDate = new Date().toISOString();
    this.logActivity(id, 'Restored', 'Document recovered from recycle bin.');
    return true;
  }

  /**
   * Toggle favorite flag
   */
  public toggleFavorite(id: string): boolean {
    const doc = this.documents.get(id);
    if (!doc) return false;
    doc.isFavorite = !doc.isFavorite;
    doc.updatedDate = new Date().toISOString();
    this.logActivity(id, 'Updated', doc.isFavorite ? 'Document marked as favorite.' : 'Document removed from favorites.');
    return doc.isFavorite;
  }

  /**
   * Relationship Mapping Utilities
   */
  public linkEntity(id: string, entityType: 'customer' | 'project' | 'contact' | 'kms' | 'memory', entityId: string): boolean {
    const doc = this.documents.get(id);
    if (!doc) return false;

    let updated = false;
    if (entityType === 'customer' && !doc.customerLinks.includes(entityId)) {
      doc.customerLinks.push(entityId);
      updated = true;
    } else if (entityType === 'project' && !doc.projectLinks.includes(entityId)) {
      doc.projectLinks.push(entityId);
      updated = true;
    } else if (entityType === 'contact' && !doc.contactLinks.includes(entityId)) {
      doc.contactLinks.push(entityId);
      updated = true;
    } else if (entityType === 'kms' && !doc.knowledgeLinks.includes(entityId)) {
      doc.knowledgeLinks.push(entityId);
      updated = true;
    } else if (entityType === 'memory' && !doc.memoryLinks.includes(entityId)) {
      doc.memoryLinks.push(entityId);
      updated = true;
    }

    if (updated) {
      doc.updatedDate = new Date().toISOString();
      this.logActivity(id, 'Linked', `Associated document to entity: [${entityType}] with identifier ${entityId}`);
    }
    return updated;
  }

  public unlinkEntity(id: string, entityType: 'customer' | 'project' | 'contact' | 'kms' | 'memory', entityId: string): boolean {
    const doc = this.documents.get(id);
    if (!doc) return false;

    let updated = false;
    if (entityType === 'customer' && doc.customerLinks.includes(entityId)) {
      doc.customerLinks = doc.customerLinks.filter(x => x !== entityId);
      updated = true;
    } else if (entityType === 'project' && doc.projectLinks.includes(entityId)) {
      doc.projectLinks = doc.projectLinks.filter(x => x !== entityId);
      updated = true;
    } else if (entityType === 'contact' && doc.contactLinks.includes(entityId)) {
      doc.contactLinks = doc.contactLinks.filter(x => x !== entityId);
      updated = true;
    } else if (entityType === 'kms' && doc.knowledgeLinks.includes(entityId)) {
      doc.knowledgeLinks = doc.knowledgeLinks.filter(x => x !== entityId);
      updated = true;
    } else if (entityType === 'memory' && doc.memoryLinks.includes(entityId)) {
      doc.memoryLinks = doc.memoryLinks.filter(x => x !== entityId);
      updated = true;
    }

    if (updated) {
      doc.updatedDate = new Date().toISOString();
      this.logActivity(id, 'Unlinked', `Removed association to entity: [${entityType}] with identifier ${entityId}`);
    }
    return updated;
  }

  /**
   * Search and Filter Engine
   */
  public searchDocuments(criteria: {
    query?: string;
    type?: DocumentType;
    category?: DocumentCategory;
    confidentiality?: ConfidentialityLevel;
    workspace?: string;
    project?: string;
    customer?: string;
    contact?: string;
    status?: DocumentStatus;
    tags?: string[];
    isFavorite?: boolean;
    archiveStatus?: boolean;
    softDelete?: boolean;
  }): Document[] {
    let list = Array.from(this.documents.values());

    return list.filter(doc => {
      // Archive / SoftDelete status checks
      if (criteria.softDelete !== undefined && doc.softDelete !== criteria.softDelete) return false;
      if (criteria.softDelete === undefined && doc.softDelete) return false; // Default: hide deleted

      if (criteria.archiveStatus !== undefined && doc.archiveStatus !== criteria.archiveStatus) return false;
      if (criteria.archiveStatus === undefined && doc.archiveStatus) return false; // Default: hide archived

      // Direct Matches
      if (criteria.type && doc.type !== criteria.type) return false;
      if (criteria.category && doc.category !== criteria.category) return false;
      if (criteria.confidentiality && doc.confidentiality !== criteria.confidentiality) return false;
      if (criteria.status && doc.status !== criteria.status) return false;
      if (criteria.workspace && doc.workspace !== criteria.workspace) return false;
      if (criteria.isFavorite !== undefined && doc.isFavorite !== criteria.isFavorite) return false;

      // Entity Link Mappings
      if (criteria.project && doc.project !== criteria.project && !doc.projectLinks.includes(criteria.project)) return false;
      if (criteria.customer && doc.customer !== criteria.customer && !doc.customerLinks.includes(criteria.customer)) return false;
      if (criteria.contact && doc.contact !== criteria.contact && !doc.contactLinks.includes(criteria.contact)) return false;

      // Tag filter
      if (criteria.tags && criteria.tags.length > 0) {
        const hasAll = criteria.tags.every(t => doc.tags.includes(t));
        if (!hasAll) return false;
      }

      // Keyword Query Text Index
      if (criteria.query && criteria.query.trim()) {
        const q = criteria.query.toLowerCase().trim();
        const matchesTitle = doc.title.toLowerCase().includes(q);
        const matchesDisplayName = doc.displayName.toLowerCase().includes(q);
        const matchesDesc = doc.description?.toLowerCase().includes(q) || false;
        const matchesAuthor = doc.author.toLowerCase().includes(q);
        const matchesDept = doc.department.toLowerCase().includes(q);
        const matchesKeywords = doc.keywords.some(k => k.toLowerCase().includes(q));
        const matchesTags = doc.tags.some(t => t.toLowerCase().includes(q));

        if (!matchesTitle && !matchesDisplayName && !matchesDesc && !matchesAuthor && !matchesDept && !matchesKeywords && !matchesTags) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Fetch Access Records for specific document ID or global list
   */
  public getActivityLogs(docId?: string): DocumentActivityLog[] {
    if (docId) {
      return this.activityLogs.filter(log => log.documentId === docId);
    }
    return this.activityLogs;
  }

  /**
   * Fetch recents
   */
  public getRecentDocuments(): Document[] {
    return this.recentIds
      .map(id => this.documents.get(id))
      .filter((doc): doc is Document => !!doc && !doc.softDelete && !doc.archiveStatus);
  }

  /**
   * Helper to retrieve MIME categories dynamically
   */
  private getMimeType(ext: string): string {
    const map: Record<string, string> = {
      pdf: 'application/pdf',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      doc: 'application/msword',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      xls: 'application/vnd.ms-excel',
      pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      ppt: 'application/vnd.ms-powerpoint',
      md: 'text/markdown',
      txt: 'text/plain',
      csv: 'text/csv',
      json: 'application/json',
      step: 'application/step',
      stl: 'application/sla',
      png: 'image/png',
      jpeg: 'image/jpeg',
      jpg: 'image/jpeg',
      svg: 'image/svg+xml',
      zip: 'application/zip'
    };
    return map[ext.toLowerCase()] || 'application/octet-stream';
  }
}

import {
  Drawing,
  EngineeringProjectDetails,
  EngineeringDocument,
  DrawingCategory,
  DrawingStatus,
  ApprovalStatus,
  EngineeringDocType,
  BOMItem,
  SubProject,
  EngineeringMilestone,
  EngineeringTeamMember
} from './types';
import { initialDrawings, initialProjectDetails, initialEngineeringDocuments } from './mockData';
import { eventBus, loggers, serviceRegistry, IService } from '../../core';

export interface EngineeringAuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userRole: string;
  department: string;
  action: string;
  targetId: string;
  targetType: 'Drawing' | 'Project' | 'Document' | 'Security';
  details: string;
}

export class EngineeringRegistry implements IService {
  private static instance: EngineeringRegistry;
  public serviceId = 'EngineeringRegistry';

  private drawings: Map<string, Drawing> = new Map();
  private projectDetails: Map<string, EngineeringProjectDetails> = new Map();
  private documents: Map<string, EngineeringDocument> = new Map();
  private auditLogs: EngineeringAuditLog[] = [];
  private favoriteDrawingIds: Set<string> = new Set();
  
  // Security parameters (stored in localStorage / reactive in UI)
  private currentRole: string = 'Lead Engineer';
  private currentDepartment: string = 'R&D Propulsion';

  private constructor() {
    this.loadState();
  }

  public static getInstance(): EngineeringRegistry {
    if (!this.instance) {
      this.instance = new EngineeringRegistry();
      try {
        serviceRegistry.register(this.instance);
      } catch (e) {
        // Fallback if serviceRegistry isn't ready or initialized
        console.warn('Could not register EngineeringRegistry with Core Service Registry', e);
      }
    }
    return this.instance;
  }

  public async initialize(): Promise<void> {
    loggers.app.info('Engineering Registry Service initializing...');
  }

  public async shutdown(): Promise<void> {
    loggers.app.info('Engineering Registry Service shutting down...');
    this.saveState();
  }

  private saveState(): void {
    try {
      localStorage.setItem('jnas-eng-drawings', JSON.stringify(Array.from(this.drawings.values())));
      localStorage.setItem('jnas-eng-project-details', JSON.stringify(Array.from(this.projectDetails.values())));
      localStorage.setItem('jnas-eng-documents', JSON.stringify(Array.from(this.documents.values())));
      localStorage.setItem('jnas-eng-audit-logs', JSON.stringify(this.auditLogs));
      localStorage.setItem('jnas-eng-favorites', JSON.stringify(Array.from(this.favoriteDrawingIds)));
      localStorage.setItem('jnas-eng-role', this.currentRole);
      localStorage.setItem('jnas-eng-department', this.currentDepartment);
    } catch (e) {
      loggers.app.error('Failed to save Engineering state to localStorage', e);
    }
  }

  private loadState(): void {
    try {
      const storedDrawings = localStorage.getItem('jnas-eng-drawings');
      const storedProjectDetails = localStorage.getItem('jnas-eng-project-details');
      const storedDocuments = localStorage.getItem('jnas-eng-documents');
      const storedAuditLogs = localStorage.getItem('jnas-eng-audit-logs');
      const storedFavorites = localStorage.getItem('jnas-eng-favorites');
      const storedRole = localStorage.getItem('jnas-eng-role');
      const storedDept = localStorage.getItem('jnas-eng-department');

      if (storedDrawings) {
        const parsed = JSON.parse(storedDrawings) as Drawing[];
        parsed.forEach(d => this.drawings.set(d.id, d));
      } else {
        initialDrawings.forEach(d => this.drawings.set(d.id, d));
      }

      if (storedProjectDetails) {
        const parsed = JSON.parse(storedProjectDetails) as EngineeringProjectDetails[];
        parsed.forEach(p => this.projectDetails.set(p.projectId, p));
      } else {
        initialProjectDetails.forEach(p => this.projectDetails.set(p.projectId, p));
      }

      if (storedDocuments) {
        const parsed = JSON.parse(storedDocuments) as EngineeringDocument[];
        parsed.forEach(doc => this.documents.set(doc.id, doc));
      } else {
        initialEngineeringDocuments.forEach(doc => this.documents.set(doc.id, doc));
      }

      if (storedAuditLogs) {
        this.auditLogs = JSON.parse(storedAuditLogs);
      } else {
        this.auditLogs = [
          {
            id: 'elog-init-1',
            timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
            userId: 'usr-sarah',
            userRole: 'Lead Engineer',
            department: 'R&D Propulsion',
            action: 'System Initialized',
            targetId: 'system',
            targetType: 'Security',
            details: 'Engineering Workspace Foundation loaded. Security bounds verified.'
          }
        ];
      }

      if (storedFavorites) {
        this.favoriteDrawingIds = new Set(JSON.parse(storedFavorites));
      }

      if (storedRole) {
        this.currentRole = storedRole;
      }
      if (storedDept) {
        this.currentDepartment = storedDept;
      }
    } catch (e) {
      console.error('Error loading Engineering state, using defaults', e);
      // Fallback defaults
      initialDrawings.forEach(d => this.drawings.set(d.id, d));
      initialProjectDetails.forEach(p => this.projectDetails.set(p.projectId, p));
      initialEngineeringDocuments.forEach(doc => this.documents.set(doc.id, doc));
    }
  }

  // Security Role & Department Accessors
  public getCurrentRole(): string {
    return this.currentRole;
  }

  public setCurrentRole(role: string): void {
    this.currentRole = role;
    localStorage.setItem('jnas-eng-role', role);
    this.addAuditLog('Change Role', 'system', 'Security', `Operator switched role context to ${role}`);
  }

  public getCurrentDepartment(): string {
    return this.currentDepartment;
  }

  public setCurrentDepartment(dept: string): void {
    this.currentDepartment = dept;
    localStorage.setItem('jnas-eng-department', dept);
    this.addAuditLog('Change Department', 'system', 'Security', `Operator switched department context to ${dept}`);
  }

  // Permissions gatekeeping: check action permissions based on role
  // QA Inspector: Can approve/reject. CAD Designer: Can create/edit drafts, but not approve. Lead Engineer: Can do everything.
  public hasPermission(action: 'CreateDraft' | 'ModifyDrawing' | 'ApproveDrawing' | 'DeleteDrawing'): boolean {
    if (this.currentRole === 'Lead Engineer') return true;
    if (this.currentRole === 'QA Inspector') {
      return action === 'ApproveDrawing' || action === 'ModifyDrawing';
    }
    if (this.currentRole === 'CAD Designer') {
      return action === 'CreateDraft' || action === 'ModifyDrawing';
    }
    return false; // Default guest or viewer: view only
  }

  // Audit Logger
  public addAuditLog(action: string, targetId: string, targetType: EngineeringAuditLog['targetType'], details: string): void {
    const newLog: EngineeringAuditLog = {
      id: `elog-${Math.random().toString(36).substring(2, 11)}`,
      timestamp: new Date().toISOString(),
      userId: 'Operator',
      userRole: this.currentRole,
      department: this.currentDepartment,
      action,
      targetId,
      targetType,
      details
    };
    this.auditLogs.unshift(newLog);
    if (this.auditLogs.length > 500) {
      this.auditLogs.pop();
    }
    this.saveState();
  }

  public getAuditLogs(): EngineeringAuditLog[] {
    return this.auditLogs;
  }

  // --- DRAWING PORTFOLIO METHODS ---
  public getDrawings(): Drawing[] {
    return Array.from(this.drawings.values());
  }

  public getDrawingById(id: string): Drawing | undefined {
    return this.drawings.get(id);
  }

  public registerDrawing(drawing: Drawing): void {
    this.drawings.set(drawing.id, drawing);
    this.saveState();
  }

  public createDrawing(fields: Omit<Drawing, 'id' | 'createdAt' | 'updatedAt'>): Drawing {
    // Permission guard
    if (!this.hasPermission('CreateDraft')) {
      throw new Error(`Permission Denied: Current role [${this.currentRole}] cannot create a drawing.`);
    }

    const timestamp = new Date().toISOString();
    const id = `drw-gen-${Math.random().toString(36).substring(2, 11)}`;
    const drawing: Drawing = {
      ...fields,
      id,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    this.drawings.set(id, drawing);
    this.saveState();

    // Event & Audit
    this.addAuditLog('Drawing Created', id, 'Drawing', `Created drawing ${drawing.drawingNumber}: "${drawing.title}"`);
    eventBus.publish('Drawing Created', { drawing });

    return drawing;
  }

  public updateDrawing(id: string, updates: Partial<Omit<Drawing, 'id' | 'createdAt' | 'updatedAt'>>): Drawing {
    const drawing = this.getDrawingById(id);
    if (!drawing) {
      throw new Error(`Drawing with ID ${id} not found.`);
    }

    // Permission guard
    if (updates.approvalStatus && updates.approvalStatus !== drawing.approvalStatus) {
      if (!this.hasPermission('ApproveDrawing')) {
        throw new Error(`Permission Denied: Current role [${this.currentRole}] cannot change approval states.`);
      }
      this.addAuditLog('Approval Transition', id, 'Drawing', `Drawing ${drawing.drawingNumber} approval shifted from ${drawing.approvalStatus} to ${updates.approvalStatus}`);
      eventBus.publish(updates.approvalStatus === 'Approved' ? 'Review Completed' : 'Review Started', { drawingId: id, status: updates.approvalStatus });
    } else {
      if (!this.hasPermission('ModifyDrawing')) {
        throw new Error(`Permission Denied: Current role [${this.currentRole}] cannot modify drawings.`);
      }
    }

    const updated: Drawing = {
      ...drawing,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.drawings.set(id, updated);
    this.saveState();

    this.addAuditLog('Drawing Updated', id, 'Drawing', `Modified core parameters of ${drawing.drawingNumber}`);
    eventBus.publish('Drawing Updated', { drawing: updated });

    return updated;
  }

  public deleteDrawing(id: string): void {
    if (!this.hasPermission('DeleteDrawing')) {
      throw new Error(`Permission Denied: Current role [${this.currentRole}] cannot delete drawings.`);
    }
    const drawing = this.getDrawingById(id);
    if (drawing) {
      this.drawings.delete(id);
      this.favoriteDrawingIds.delete(id);
      this.saveState();
      this.addAuditLog('Drawing Deleted', id, 'Drawing', `Permanently purged drawing ${drawing.drawingNumber} from active registry.`);
    }
  }

  // Favorites
  public getFavorites(): Drawing[] {
    return this.getDrawings().filter(d => this.favoriteDrawingIds.has(d.id));
  }

  public toggleFavorite(id: string): void {
    if (this.favoriteDrawingIds.has(id)) {
      this.favoriteDrawingIds.delete(id);
    } else {
      this.favoriteDrawingIds.add(id);
    }
    this.saveState();
  }

  public isFavorite(id: string): boolean {
    return this.favoriteDrawingIds.has(id);
  }

  // --- ENGINEERING PROJECT DETAIL METHODS ---
  public getProjectDetails(projectId: string): EngineeringProjectDetails | undefined {
    return this.projectDetails.get(projectId);
  }

  public registerProjectDetails(details: EngineeringProjectDetails): void {
    this.projectDetails.set(details.projectId, details);
    this.saveState();
  }

  public createSubProject(projectId: string, sub: Omit<SubProject, 'id'>): SubProject {
    let details = this.getProjectDetails(projectId);
    if (!details) {
      details = {
        projectId,
        subProjects: [],
        revisions: [],
        milestones: [],
        team: [],
        budget: { allocated: 250000, spent: 0, currency: 'USD' }
      };
    }

    const id = `sub-prj-${Math.random().toString(36).substring(2, 11)}`;
    const newSub: SubProject = { ...sub, id };
    details.subProjects.push(newSub);
    this.projectDetails.set(projectId, details);
    this.saveState();

    this.addAuditLog('SubProject Created', id, 'Project', `Added sub-project "${sub.name}" under parent project ${projectId}`);
    eventBus.publish('Project Updated', { projectId });

    return newSub;
  }

  public createMilestone(projectId: string, ms: Omit<EngineeringMilestone, 'id'>): EngineeringMilestone {
    let details = this.getProjectDetails(projectId);
    if (!details) {
      details = {
        projectId,
        subProjects: [],
        revisions: [],
        milestones: [],
        team: [],
        budget: { allocated: 250000, spent: 0, currency: 'USD' }
      };
    }

    const id = `mls-${Math.random().toString(36).substring(2, 11)}`;
    const newMs: EngineeringMilestone = { ...ms, id };
    details.milestones.push(newMs);
    this.projectDetails.set(projectId, details);
    this.saveState();

    this.addAuditLog('Milestone Created', id, 'Project', `Added milestone "${ms.title}" to project ${projectId}`);
    eventBus.publish('Project Updated', { projectId });

    return newMs;
  }

  public addTeamMember(projectId: string, member: Omit<EngineeringTeamMember, 'userId'>): EngineeringTeamMember {
    let details = this.getProjectDetails(projectId);
    if (!details) {
      details = {
        projectId,
        subProjects: [],
        revisions: [],
        milestones: [],
        team: [],
        budget: { allocated: 250000, spent: 0, currency: 'USD' }
      };
    }

    const userId = `usr-gen-${Math.random().toString(36).substring(2, 11)}`;
    const newMember: EngineeringTeamMember = { ...member, userId };
    details.team.push(newMember);
    this.projectDetails.set(projectId, details);
    this.saveState();

    this.addAuditLog('Team Member Added', userId, 'Project', `Added ${member.name} as ${member.role} in project ${projectId}`);
    return newMember;
  }

  public addProjectRevision(projectId: string, rev: { version: string; description: string; author: string }): void {
    let details = this.getProjectDetails(projectId);
    if (!details) {
      details = {
        projectId,
        subProjects: [],
        revisions: [],
        milestones: [],
        team: [],
        budget: { allocated: 250000, spent: 0, currency: 'USD' }
      };
    }

    details.revisions.push({
      version: rev.version,
      description: rev.description,
      date: new Date().toISOString().split('T')[0],
      author: rev.author
    });
    this.projectDetails.set(projectId, details);
    this.saveState();

    this.addAuditLog('Revision Created', projectId, 'Project', `Registered revision ${rev.version} in project ${projectId}`);
    eventBus.publish('Revision Created', { projectId, version: rev.version });
  }

  // --- ENGINEERING DOCUMENT PORTFOLIO METHODS ---
  public getDocuments(): EngineeringDocument[] {
    return Array.from(this.documents.values());
  }

  public getDocumentById(id: string): EngineeringDocument | undefined {
    return this.documents.get(id);
  }

  public createDocument(fields: Omit<EngineeringDocument, 'id' | 'createdAt' | 'updatedAt'>): EngineeringDocument {
    const timestamp = new Date().toISOString();
    const id = `edoc-${Math.random().toString(36).substring(2, 11)}`;
    const doc: EngineeringDocument = {
      ...fields,
      id,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    this.documents.set(id, doc);
    this.saveState();

    this.addAuditLog('Document Added', id, 'Document', `Uploaded engineering document "${doc.title}" of type ${doc.type}`);
    eventBus.publish('Document Added', { document: doc });

    return doc;
  }

  public clearAuditLogs(): void {
    this.auditLogs = [];
    this.saveState();
  }

  public resetToDefaults(): void {
    this.drawings.clear();
    this.projectDetails.clear();
    this.documents.clear();
    this.favoriteDrawingIds.clear();

    initialDrawings.forEach(d => this.drawings.set(d.id, d));
    initialProjectDetails.forEach(p => this.projectDetails.set(p.projectId, p));
    initialEngineeringDocuments.forEach(doc => this.documents.set(doc.id, doc));

    this.auditLogs = [
      {
        id: `elog-${Math.random().toString(36).substring(2, 11)}`,
        timestamp: new Date().toISOString(),
        userId: 'usr-operator',
        userRole: this.currentRole,
        department: this.currentDepartment,
        action: 'System Reset',
        targetId: 'system',
        targetType: 'Security',
        details: 'Ecosystem state databases fully aligned with fallback blueprints.'
      }
    ];

    this.saveState();
  }

  // --- SEARCH INTEGRATION ENGINE ---
  // Matches all queried text against Drawing fields, specifications, standards, and meta.
  public searchEngineering(query: string): { type: 'drawing' | 'document'; id: string; name: string; detail: string; status: string }[] {
    const q = query.toLowerCase().trim();
    if (!q) return [];

    const results: { type: 'drawing' | 'document'; id: string; name: string; detail: string; status: string }[] = [];

    // Search drawings
    this.getDrawings().forEach(d => {
      const match =
        d.drawingNumber.toLowerCase().includes(q) ||
        d.title.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q) ||
        d.owner.toLowerCase().includes(q) ||
        d.status.toLowerCase().includes(q) ||
        d.relatedStandards.some(s => s.toLowerCase().includes(q)) ||
        d.relatedParts.some(p => p.toLowerCase().includes(q));

      if (match) {
        results.push({
          type: 'drawing',
          id: d.id,
          name: `${d.drawingNumber}: ${d.title}`,
          detail: `[Drawing - ${d.category}] ${d.description.slice(0, 80)}...`,
          status: d.status
        });
      }
    });

    // Search documents
    this.getDocuments().forEach(doc => {
      const match =
        doc.title.toLowerCase().includes(q) ||
        doc.description.toLowerCase().includes(q) ||
        doc.type.toLowerCase().includes(q) ||
        doc.revision.toLowerCase().includes(q) ||
        doc.owner.toLowerCase().includes(q);

      if (match) {
        results.push({
          type: 'document',
          id: doc.id,
          name: doc.title,
          detail: `[Document - ${doc.type}] Rev ${doc.revision} - Created by ${doc.owner}`,
          status: doc.type
        });
      }
    });

    return results;
  }
}

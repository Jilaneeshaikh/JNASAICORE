import { 
  PackagingMaterial, 
  PackagingProject, 
  PackagingAuditLog, 
  PackagingStatus, 
  PackagingPriority, 
  PackagingType, 
  PackagingRole,
  MaterialStandard,
  PackagingComponent,
  PackagingDesign,
  ValidationRule,
  ValidationResult,
  ValidationRun,
  ValidationRuleCategory
} from './types';
import { 
  initialMaterials, 
  initialPackagingProjects,
  initialStandards,
  initialComponents,
  initialPackagingDesigns,
  initialRules
} from './mockData';
import { eventBus, loggers, serviceRegistry, IService } from '../../core';

export class PackagingRegistry implements IService {
  private static instance: PackagingRegistry;
  public serviceId = 'PackagingRegistry';

  private materials: Map<string, PackagingMaterial> = new Map();
  private components: Map<string, PackagingComponent> = new Map();
  private standards: Map<string, MaterialStandard> = new Map();
  private projects: Map<string, PackagingProject> = new Map();
  private designs: Map<string, PackagingDesign> = new Map();
  private rules: Map<string, ValidationRule> = new Map();
  private validationRuns: ValidationRun[] = [];
  private auditLogs: PackagingAuditLog[] = [];
  private favoriteProjectIds: Set<string> = new Set();
  private favoriteMaterialIds: Set<string> = new Set();
  private favoriteDesignIds: Set<string> = new Set();

  private currentRole: PackagingRole = 'Packaging Engineer';
  private currentDepartment: string = 'Industrial Packaging';

  private constructor() {
    this.loadState();
  }

  public static getInstance(): PackagingRegistry {
    if (!this.instance) {
      this.instance = new PackagingRegistry();
      try {
        serviceRegistry.register(this.instance);
      } catch (e) {
        console.warn('Could not register PackagingRegistry with Core Service Registry', e);
      }
    }
    return this.instance;
  }

  public async initialize(): Promise<void> {
    loggers.app.info('Packaging Registry Service initializing...');
  }

  public async shutdown(): Promise<void> {
    loggers.app.info('Packaging Registry Service shutting down...');
    this.saveState();
  }

  private saveState(): void {
    try {
      localStorage.setItem('jnas-pkg-materials', JSON.stringify(Array.from(this.materials.values())));
      localStorage.setItem('jnas-pkg-components', JSON.stringify(Array.from(this.components.values())));
      localStorage.setItem('jnas-pkg-standards', JSON.stringify(Array.from(this.standards.values())));
      localStorage.setItem('jnas-pkg-projects', JSON.stringify(Array.from(this.projects.values())));
      localStorage.setItem('jnas-pkg-designs', JSON.stringify(Array.from(this.designs.values())));
      localStorage.setItem('jnas-pkg-rules', JSON.stringify(Array.from(this.rules.values())));
      localStorage.setItem('jnas-pkg-validation-runs', JSON.stringify(this.validationRuns));
      localStorage.setItem('jnas-pkg-audit-logs', JSON.stringify(this.auditLogs));
      localStorage.setItem('jnas-pkg-favorites', JSON.stringify(Array.from(this.favoriteProjectIds)));
      localStorage.setItem('jnas-pkg-favorite-materials', JSON.stringify(Array.from(this.favoriteMaterialIds)));
      localStorage.setItem('jnas-pkg-favorite-designs', JSON.stringify(Array.from(this.favoriteDesignIds)));
      localStorage.setItem('jnas-pkg-role', this.currentRole);
      localStorage.setItem('jnas-pkg-department', this.currentDepartment);
    } catch (e) {
      loggers.app.error('Failed to save Packaging state to localStorage', e);
    }
  }

  private loadState(): void {
    try {
      const storedMaterials = localStorage.getItem('jnas-pkg-materials');
      const storedComponents = localStorage.getItem('jnas-pkg-components');
      const storedStandards = localStorage.getItem('jnas-pkg-standards');
      const storedProjects = localStorage.getItem('jnas-pkg-projects');
      const storedDesigns = localStorage.getItem('jnas-pkg-designs');
      const storedAuditLogs = localStorage.getItem('jnas-pkg-audit-logs');
      const storedFavorites = localStorage.getItem('jnas-pkg-favorites');
      const storedFavMats = localStorage.getItem('jnas-pkg-favorite-materials');
      const storedFavDsns = localStorage.getItem('jnas-pkg-favorite-designs');
      const storedRole = localStorage.getItem('jnas-pkg-role');
      const storedDept = localStorage.getItem('jnas-pkg-department');

      if (storedStandards) {
        const parsed = JSON.parse(storedStandards) as MaterialStandard[];
        parsed.forEach(s => this.standards.set(s.id, s));
      } else {
        initialStandards.forEach(s => this.standards.set(s.id, s));
      }

      if (storedMaterials) {
        const parsed = JSON.parse(storedMaterials) as PackagingMaterial[];
        parsed.forEach(m => this.materials.set(m.id, m));
      } else {
        initialMaterials.forEach(m => this.materials.set(m.id, m));
      }

      if (storedComponents) {
        const parsed = JSON.parse(storedComponents) as PackagingComponent[];
        parsed.forEach(c => this.components.set(c.id, c));
      } else {
        initialComponents.forEach(c => this.components.set(c.id, c));
      }

      if (storedProjects) {
        const parsed = JSON.parse(storedProjects) as PackagingProject[];
        parsed.forEach(p => this.projects.set(p.id, p));
      } else {
        initialPackagingProjects.forEach(p => this.projects.set(p.id, p));
      }

      if (storedDesigns) {
        const parsed = JSON.parse(storedDesigns) as PackagingDesign[];
        parsed.forEach(d => this.designs.set(d.id, d));
      } else {
        initialPackagingDesigns.forEach(d => this.designs.set(d.id, d));
      }

      if (storedAuditLogs) {
        this.auditLogs = JSON.parse(storedAuditLogs);
      } else {
        this.auditLogs = [
          {
            id: 'pkg-log-1',
            timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
            userId: 'jilaneeshaikh@gmail.com',
            userRole: 'Packaging Engineer',
            department: 'Industrial Packaging',
            action: 'INITIALIZED',
            targetId: 'system',
            targetType: 'Security',
            details: 'Packaging Studio Foundation initialized with standard material and component registries.'
          }
        ];
      }

      if (storedFavorites) {
        this.favoriteProjectIds = new Set(JSON.parse(storedFavorites));
      } else {
        this.favoriteProjectIds = new Set(['pkg-001']);
      }

      if (storedFavMats) {
        this.favoriteMaterialIds = new Set(JSON.parse(storedFavMats));
      } else {
        this.favoriteMaterialIds = new Set(['mat-001', 'mat-002']);
      }

      if (storedFavDsns) {
        this.favoriteDesignIds = new Set(JSON.parse(storedFavDsns));
      } else {
        this.favoriteDesignIds = new Set(['dsn-2801']);
      }

      if (storedRole) {
        this.currentRole = storedRole as PackagingRole;
      }
      if (storedDept) {
        this.currentDepartment = storedDept;
      }

      const storedRules = localStorage.getItem('jnas-pkg-rules');
      const storedValidationRuns = localStorage.getItem('jnas-pkg-validation-runs');

      if (storedRules) {
        const parsed = JSON.parse(storedRules) as ValidationRule[];
        parsed.forEach(r => this.rules.set(r.id, r));
      } else {
        initialRules.forEach(r => this.rules.set(r.id, r));
      }

      if (storedValidationRuns) {
        this.validationRuns = JSON.parse(storedValidationRuns);
      } else {
        this.validationRuns = [];
      }
    } catch (e) {
      loggers.app.error('Failed to load Packaging state', e);
      // fallback seeds
      initialStandards.forEach(s => this.standards.set(s.id, s));
      initialMaterials.forEach(m => this.materials.set(m.id, m));
      initialComponents.forEach(c => this.components.set(c.id, c));
      initialPackagingProjects.forEach(p => this.projects.set(p.id, p));
      initialPackagingDesigns.forEach(d => this.designs.set(d.id, d));
      initialRules.forEach(r => this.rules.set(r.id, r));
      this.validationRuns = [];
      this.favoriteProjectIds = new Set(['pkg-001']);
      this.favoriteMaterialIds = new Set(['mat-001', 'mat-002']);
      this.favoriteDesignIds = new Set(['dsn-2801']);
    }
  }

  // Role and security isolation
  public getCurrentRole(): PackagingRole {
    return this.currentRole;
  }

  public setCurrentRole(role: PackagingRole): void {
    this.currentRole = role;
    this.addAuditLog('ROLE_SWITCH', role, 'Security', `User profile transitioned to ${role}.`);
    this.saveState();
  }

  public getCurrentDepartment(): string {
    return this.currentDepartment;
  }

  public setCurrentDepartment(dept: string): void {
    this.currentDepartment = dept;
    this.addAuditLog('DEPARTMENT_SWITCH', dept, 'Security', `Department tenant context shifted to ${dept}.`);
    this.saveState();
  }

  // Projects CRUD
  public getProjects(): PackagingProject[] {
    return Array.from(this.projects.values());
  }

  public getProjectById(id: string): PackagingProject | undefined {
    return this.projects.get(id);
  }

  public createProject(proj: Omit<PackagingProject, 'id' | 'projectNumber' | 'createdAt' | 'updatedAt' | 'revision'>): PackagingProject {
    const nextId = `pkg-00${this.projects.size + 1}`;
    const nextNumber = `JNAS-PKG-${300 + this.projects.size + 1}`;
    
    const newProj: PackagingProject = {
      ...proj,
      id: nextId,
      projectNumber: nextNumber,
      revision: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.projects.set(nextId, newProj);
    this.addAuditLog('CREATE_PROJECT', nextId, 'Project', `Packaging Project ${nextNumber} (${proj.projectName}) created successfully.`);
    
    // Publish activity event on JNAS Event Bus
    eventBus.publish('ACTIVITY_CREATED', {
      type: 'Packaging Project Created',
      title: `New Packaging Project: ${nextNumber}`,
      description: `Packaging Project ${proj.projectName} initiated under ${proj.customerName}.`,
      category: 'packaging',
      referenceId: nextId
    }, { emitter: 'PackagingRegistry' });

    this.saveState();
    return newProj;
  }

  public updateProject(id: string, updates: Partial<PackagingProject>): PackagingProject {
    const existing = this.projects.get(id);
    if (!existing) {
      throw new Error(`Packaging project with ID ${id} not found.`);
    }

    const updatedProj: PackagingProject = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    // If approvalStatus is transitioned to Approved
    if (updates.approvalStatus === 'Approved' && existing.approvalStatus !== 'Approved') {
      eventBus.publish('ACTIVITY_CREATED', {
        type: 'Packaging Approved',
        title: `Packaging Approved: ${existing.projectNumber}`,
        description: `Packaging project ${existing.projectName} approved by quality control and released for deployment.`,
        category: 'packaging',
        referenceId: id
      }, { emitter: 'PackagingRegistry' });
    }

    // Generic update log
    this.projects.set(id, updatedProj);
    this.addAuditLog('UPDATE_PROJECT', id, 'Project', `Project ${existing.projectNumber} updated.`);
    
    eventBus.publish('ACTIVITY_CREATED', {
      type: 'Packaging Project Updated',
      title: `Packaging Updated: ${existing.projectNumber}`,
      description: `Packaging Project ${existing.projectName} parameters modified.`,
      category: 'packaging',
      referenceId: id
    }, { emitter: 'PackagingRegistry' });

    this.saveState();
    return updatedProj;
  }

  public deleteProject(id: string): void {
    const existing = this.projects.get(id);
    if (existing) {
      this.projects.delete(id);
      this.addAuditLog('DELETE_PROJECT', id, 'Project', `Project ${existing.projectNumber} deleted.`);
      this.saveState();
    }
  }

  // Revision Increment
  public createRevision(id: string, notes: string): PackagingProject {
    const existing = this.projects.get(id);
    if (!existing) throw new Error('Project not found');

    const updated: PackagingProject = {
      ...existing,
      revision: existing.revision + 1,
      approvalStatus: 'Pending',
      status: 'In Review',
      updatedAt: new Date().toISOString()
    };

    this.projects.set(id, updated);
    this.addAuditLog('REVISION_CREATED', id, 'Project', `Created revision R${updated.revision}. Change notes: ${notes}`);
    
    eventBus.publish('ACTIVITY_CREATED', {
      type: 'Packaging Revision Created',
      title: `Revision Created: ${existing.projectNumber} R${updated.revision}`,
      description: `New revision R${updated.revision} drafted for ${existing.projectName}. Notes: ${notes}`,
      category: 'packaging',
      referenceId: id
    }, { emitter: 'PackagingRegistry' });

    this.saveState();
    return updated;
  }

  // Designs CRUD (New for Sprint 28)
  public getDesigns(): PackagingDesign[] {
    return Array.from(this.designs.values());
  }

  public getDesignById(id: string): PackagingDesign | undefined {
    return this.designs.get(id);
  }

  public createDesign(design: Omit<PackagingDesign, 'id' | 'designNumber' | 'createdAt' | 'updatedAt' | 'revision' | 'version' | 'activities' | 'workflow' | 'auditMetadata'>): PackagingDesign {
    const nextId = `dsn-${2800 + this.designs.size + 1}`;
    const nextNumber = `DSN-PKG-${2800 + this.designs.size + 1}`;
    
    const newDesign: PackagingDesign = {
      ...design,
      id: nextId,
      designNumber: nextNumber,
      revision: 1,
      version: '1.0.0',
      activities: [
        {
          id: `act-${Date.now()}`,
          timestamp: new Date().toISOString(),
          user: 'jilaneeshaikh@gmail.com',
          action: 'Design Created',
          details: `Packaging Design ${nextNumber} (${design.designName}) was created.`
        }
      ],
      workflow: [
        { stage: 'Drafting', status: 'Completed', assignee: 'Alex Mercer' },
        { stage: 'Design Review', status: 'Pending', assignee: 'Elena Rostova' },
        { stage: 'Approval Gate', status: 'Pending', assignee: 'Marcus Aurelius' }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      auditMetadata: {
        createdBy: 'jilaneeshaikh@gmail.com'
      }
    };

    this.designs.set(nextId, newDesign);
    this.addAuditLog('CREATE_DESIGN', nextId, 'Project', `Packaging Design ${nextNumber} (${design.designName}) created.`);
    
    // Publish design created activity
    eventBus.publish('ACTIVITY_CREATED', {
      type: 'Packaging Design Created',
      title: `Design Registered: ${nextNumber}`,
      description: `Packaging Design ${design.designName} registered under project ${design.project.name}.`,
      category: 'packaging',
      referenceId: nextId
    }, { emitter: 'PackagingRegistry' });

    this.saveState();
    return newDesign;
  }

  public updateDesign(id: string, updates: Partial<PackagingDesign>): PackagingDesign {
    const existing = this.designs.get(id);
    if (!existing) {
      throw new Error(`Packaging design with ID ${id} not found.`);
    }

    const updatedDesign: PackagingDesign = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.designs.set(id, updatedDesign);
    this.addAuditLog('UPDATE_DESIGN', id, 'Project', `Design ${existing.designNumber} parameters updated.`);
    
    // Create detailed activities or publish updates
    eventBus.publish('ACTIVITY_CREATED', {
      type: 'Packaging Design Updated',
      title: `Design Updated: ${existing.designNumber}`,
      description: `Packaging Design ${existing.designName} was modified in the workspace.`,
      category: 'packaging',
      referenceId: id
    }, { emitter: 'PackagingRegistry' });

    this.saveState();
    return updatedDesign;
  }

  public deleteDesign(id: string): void {
    const existing = this.designs.get(id);
    if (existing) {
      this.designs.delete(id);
      this.addAuditLog('DELETE_DESIGN', id, 'Project', `Removed design ${existing.designNumber} from registry.`);
      this.saveState();
    }
  }

  public isDesignFavorite(id: string): boolean {
    return this.favoriteDesignIds.has(id);
  }

  public toggleDesignFavorite(id: string): void {
    if (this.favoriteDesignIds.has(id)) {
      this.favoriteDesignIds.delete(id);
      this.addAuditLog('FAVORITE_DESIGN_REMOVE', id, 'Project', `Removed design from bookmarks.`);
    } else {
      this.favoriteDesignIds.add(id);
      this.addAuditLog('FAVORITE_DESIGN_ADD', id, 'Project', `Bookmarked design.`);
    }
    this.saveState();
  }

  public promoteDesignRevision(id: string, notes: string): PackagingDesign {
    const existing = this.designs.get(id);
    if (!existing) throw new Error('Design not found');

    const nextRevision = existing.revision + 1;
    const parts = existing.version.split('.');
    const nextVersion = `${parseInt(parts[0]) + 1}.0.0`; // Major bump for revision lock

    const updated: PackagingDesign = {
      ...existing,
      revision: nextRevision,
      version: nextVersion,
      lifecycleStatus: 'In Review',
      approvalStatus: 'Pending',
      activities: [
        {
          id: `act-${Date.now()}`,
          timestamp: new Date().toISOString(),
          user: 'jilaneeshaikh@gmail.com',
          action: 'Revision Created',
          details: `Created revision R${nextRevision} (v${nextVersion}). Notes: ${notes}`
        },
        ...existing.activities
      ],
      updatedAt: new Date().toISOString()
    };

    this.designs.set(id, updated);
    this.addAuditLog('DESIGN_REVISION_CREATED', id, 'Project', `Design ${existing.designNumber} promoted to R${nextRevision}. Notes: ${notes}`);

    eventBus.publish('ACTIVITY_CREATED', {
      type: 'Packaging Revision Created',
      title: `Revision R${nextRevision}: ${existing.designNumber}`,
      description: `New revision drafted for design ${existing.designName}. Notes: ${notes}`,
      category: 'packaging',
      referenceId: id
    }, { emitter: 'PackagingRegistry' });

    this.saveState();
    return updated;
  }

  // Materials CRUD (Updated & Detailed for Sprint 27)
  public getMaterials(): PackagingMaterial[] {
    return Array.from(this.materials.values());
  }

  public getMaterialById(id: string): PackagingMaterial | undefined {
    return this.materials.get(id);
  }

  public createMaterial(mat: Omit<PackagingMaterial, 'id' | 'createdAt' | 'updatedAt' | 'isArchived'>): PackagingMaterial {
    const nextId = `mat-00${this.materials.size + 1}`;
    const newMat: PackagingMaterial = {
      ...mat,
      id: nextId,
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.materials.set(nextId, newMat);
    this.addAuditLog('ADD_MATERIAL', nextId, 'Material', `Created detailed material standard: ${mat.code} - ${mat.name}`);

    // Publish to central event bus
    eventBus.publish('ACTIVITY_CREATED', {
      type: 'Material Created',
      title: `New Material Registered: ${mat.code}`,
      description: `Material standard ${mat.name} has been added to the master component library catalog.`,
      category: 'packaging',
      referenceId: nextId
    }, { emitter: 'PackagingRegistry' });

    this.saveState();
    return newMat;
  }

  public updateMaterial(id: string, updates: Partial<PackagingMaterial>): PackagingMaterial {
    const existing = this.materials.get(id);
    if (!existing) {
      throw new Error(`Material with ID ${id} not found.`);
    }

    const updatedMat: PackagingMaterial = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.materials.set(id, updatedMat);
    this.addAuditLog('UPDATE_MATERIAL', id, 'Material', `Material ${existing.code} details modified.`);

    eventBus.publish('ACTIVITY_CREATED', {
      type: 'Material Updated',
      title: `Material Updated: ${existing.code}`,
      description: `Physical properties or compliance metrics of material ${existing.name} were updated.`,
      category: 'packaging',
      referenceId: id
    }, { emitter: 'PackagingRegistry' });

    this.saveState();
    return updatedMat;
  }

  public deleteMaterial(id: string): void {
    const existing = this.materials.get(id);
    if (existing) {
      this.materials.delete(id);
      this.addAuditLog('DELETE_MATERIAL', id, 'Material', `Removed material ${existing.code} from catalog.`);
      this.saveState();
    }
  }

  // Components CRUD (New for Sprint 27)
  public getComponents(): PackagingComponent[] {
    return Array.from(this.components.values());
  }

  public getComponentById(id: string): PackagingComponent | undefined {
    return this.components.get(id);
  }

  public createComponent(comp: Omit<PackagingComponent, 'id' | 'createdAt' | 'updatedAt'>): PackagingComponent {
    const nextId = `comp-00${this.components.size + 1}`;
    const newComp: PackagingComponent = {
      ...comp,
      id: nextId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.components.set(nextId, newComp);
    this.addAuditLog('ADD_COMPONENT', nextId, 'Component', `Registered engineering component: ${comp.code} - ${comp.name}`);

    // Publish to event bus
    eventBus.publish('ACTIVITY_CREATED', {
      type: 'Component Created',
      title: `Component Engineered: ${comp.code}`,
      description: `Packaging component ${comp.name} successfully registered in the component master base.`,
      category: 'packaging',
      referenceId: nextId
    }, { emitter: 'PackagingRegistry' });

    this.saveState();
    return newComp;
  }

  public updateComponent(id: string, updates: Partial<PackagingComponent>): PackagingComponent {
    const existing = this.components.get(id);
    if (!existing) {
      throw new Error(`Component with ID ${id} not found.`);
    }

    const updatedComp: PackagingComponent = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.components.set(id, updatedComp);
    this.addAuditLog('UPDATE_COMPONENT', id, 'Component', `Component ${existing.code} specifications modified.`);

    eventBus.publish('ACTIVITY_CREATED', {
      type: 'Component Updated',
      title: `Component Updated: ${existing.code}`,
      description: `Physical component metrics of ${existing.name} updated.`,
      category: 'packaging',
      referenceId: id
    }, { emitter: 'PackagingRegistry' });

    this.saveState();
    return updatedComp;
  }

  public deleteComponent(id: string): void {
    const existing = this.components.get(id);
    if (existing) {
      this.components.delete(id);
      this.addAuditLog('DELETE_COMPONENT', id, 'Component', `Removed component ${existing.code} from database.`);
      this.saveState();
    }
  }

  // Standards CRUD (New for Sprint 27)
  public getStandards(): MaterialStandard[] {
    return Array.from(this.standards.values());
  }

  public getStandardById(id: string): MaterialStandard | undefined {
    return this.standards.get(id);
  }

  public createStandard(std: Omit<MaterialStandard, 'id'>): MaterialStandard {
    const nextId = `std-00${this.standards.size + 1}`;
    const newStd: MaterialStandard = {
      ...std,
      id: nextId
    };

    this.standards.set(nextId, newStd);
    this.addAuditLog('CREATE_STANDARD', nextId, 'Standard', `Registered quality packaging standard: ${std.code}`);

    this.saveState();
    return newStd;
  }

  public linkStandardToMaterial(materialId: string, standardId: string): void {
    const mat = this.materials.get(materialId);
    const std = this.standards.get(standardId);
    if (mat && std) {
      const standardIds = mat.standardIds || [];
      if (!standardIds.includes(standardId)) {
        standardIds.push(standardId);
        this.updateMaterial(materialId, { standardIds });
        this.addAuditLog('LINK_STANDARD', materialId, 'Standard', `Linked standard ${std.code} to material ${mat.code}`);
        
        eventBus.publish('ACTIVITY_CREATED', {
          type: 'Standard Linked',
          title: `Compliance Link: ${std.code}`,
          description: `Compliance standard ${std.name} has been formally linked to material compound ${mat.name}.`,
          category: 'packaging',
          referenceId: materialId
        }, { emitter: 'PackagingRegistry' });
      }
    }
  }

  // Favorites
  public isFavorite(id: string): boolean {
    return this.favoriteProjectIds.has(id);
  }

  public toggleFavorite(id: string): void {
    if (this.favoriteProjectIds.has(id)) {
      this.favoriteProjectIds.delete(id);
      this.addAuditLog('FAVORITE_REMOVE', id, 'Project', `Removed project from bookmarks.`);
    } else {
      this.favoriteProjectIds.add(id);
      this.addAuditLog('FAVORITE_ADD', id, 'Project', `Added project to bookmarks.`);
    }
    this.saveState();
  }

  public isMaterialFavorite(id: string): boolean {
    return this.favoriteMaterialIds.has(id);
  }

  public toggleMaterialFavorite(id: string): void {
    if (this.favoriteMaterialIds.has(id)) {
      this.favoriteMaterialIds.delete(id);
      this.addAuditLog('FAVORITE_MATERIAL_REMOVE', id, 'Material', `Removed material compound from favorites.`);
    } else {
      this.favoriteMaterialIds.add(id);
      this.addAuditLog('FAVORITE_MATERIAL_ADD', id, 'Material', `Bookmarked material compound.`);
    }
    this.saveState();
  }

  // Auditing
  public getAuditLogs(): PackagingAuditLog[] {
    return this.auditLogs;
  }

  public addAuditLog(action: string, targetId: string, targetType: PackagingAuditLog['targetType'], details: string): void {
    const log: PackagingAuditLog = {
      id: `pkg-log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      userId: 'jilaneeshaikh@gmail.com',
      userRole: this.currentRole,
      department: this.currentDepartment,
      action,
      targetId,
      targetType,
      details
    };
    this.auditLogs.unshift(log);
    if (this.auditLogs.length > 200) {
      this.auditLogs.pop();
    }
  }

  public clearAuditLogs(): void {
    this.auditLogs = [];
    this.addAuditLog('CLEAR_TRAIL', 'system', 'Security', 'Compliance audit log trail purged by Lead Administrator.');
    this.saveState();
  }

  // Rules Engine CRUD & Exec (New for Sprint 31)
  public getRules(): ValidationRule[] {
    return Array.from(this.rules.values());
  }

  public getRuleById(id: string): ValidationRule | undefined {
    return this.rules.get(id);
  }

  public createRule(rule: Omit<ValidationRule, 'id' | 'createdAt' | 'updatedAt'>): ValidationRule {
    const nextId = `rule-00${this.rules.size + 1}`;
    const newRule: ValidationRule = {
      ...rule,
      id: nextId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.rules.set(nextId, newRule);
    this.addAuditLog('CREATE_RULE', nextId, 'Security', `Created validation rule: ${rule.ruleNumber} - ${rule.ruleName}`);

    eventBus.publish('ACTIVITY_CREATED', {
      type: 'Rule Created',
      title: `Rule Registered: ${rule.ruleNumber}`,
      description: `New engineering rule "${rule.ruleName}" registered under category "${rule.category}".`,
      category: 'packaging',
      referenceId: nextId
    }, { emitter: 'PackagingRegistry' });

    this.saveState();
    return newRule;
  }

  public updateRule(id: string, updates: Partial<ValidationRule>): ValidationRule {
    const existing = this.rules.get(id);
    if (!existing) {
      throw new Error(`Rule with ID ${id} not found.`);
    }
    const updated: ValidationRule = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.rules.set(id, updated);
    this.addAuditLog('UPDATE_RULE', id, 'Security', `Updated validation rule: ${updated.ruleNumber}`);

    eventBus.publish('ACTIVITY_CREATED', {
      type: 'Rule Updated',
      title: `Rule Updated: ${updated.ruleNumber}`,
      description: `Engineering rule "${updated.ruleName}" parameters have been modified.`,
      category: 'packaging',
      referenceId: id
    }, { emitter: 'PackagingRegistry' });

    this.saveState();
    return updated;
  }

  public deleteRule(id: string): void {
    const existing = this.rules.get(id);
    if (existing) {
      this.rules.delete(id);
      this.addAuditLog('DELETE_RULE', id, 'Security', `Removed validation rule: ${existing.ruleNumber}`);
      this.saveState();
    }
  }

  private favoriteRuleIds: Set<string> = new Set();
  public isRuleFavorite(id: string): boolean {
    return this.favoriteRuleIds.has(id);
  }
  public toggleRuleFavorite(id: string): void {
    if (this.favoriteRuleIds.has(id)) {
      this.favoriteRuleIds.delete(id);
    } else {
      this.favoriteRuleIds.add(id);
    }
    this.saveState();
  }

  public getValidationRuns(): ValidationRun[] {
    return this.validationRuns;
  }

  public getValidationRunsByDesign(designId: string): ValidationRun[] {
    return this.validationRuns.filter(r => r.designId === designId);
  }

  public executeValidation(designId: string): ValidationRun {
    const design = this.designs.get(designId);
    if (!design) {
      throw new Error(`Design with ID ${designId} not found.`);
    }

    const results: ValidationResult[] = [];
    const activeRules = this.getRules().filter(r => r.status === 'Active');

    activeRules.forEach(rule => {
      let status: 'Passed' | 'Warning' | 'Failed' | 'Skipped' | 'Manual Review Required' = 'Passed';
      let message = 'Verification passed successfully. All parameters conform to standard specifications.';

      if (rule.ruleNumber === 'JNAS-RULE-001') {
        const needsESD = 
          design.project.name.toLowerCase().includes('avionics') || 
          design.designName.toLowerCase().includes('avionics') ||
          design.designName.toLowerCase().includes('gimbal') ||
          design.description.toLowerCase().includes('sensor') ||
          design.description.toLowerCase().includes('battery') ||
          design.description.toLowerCase().includes('electronic');

        if (needsESD) {
          const designMaterials = (design.materials || []).map(mid => this.materials.get(mid)).filter(Boolean);
          const hasESD = designMaterials.some(m => 
            m!.name.toLowerCase().includes('esd') || 
            m!.name.toLowerCase().includes('dissipative') || 
            m!.name.toLowerCase().includes('anti-static') ||
            m!.description.toLowerCase().includes('esd') ||
            m!.description.toLowerCase().includes('charge')
          );
          if (!hasESD) {
            status = 'Failed';
            message = 'No electrostatic discharge (ESD) safe lining material detected. Avionics components require conductive or static dissipative foam packaging.';
          }
        } else {
          status = 'Skipped';
          message = 'ESD protection check skipped. This design is categorized as non-avionics inert structural cargo.';
        }
      } 
      else if (rule.ruleNumber === 'JNAS-RULE-002') {
        const isSteelRack = design.packagingType === 'Steel Rack' || design.category === 'Steel Rack';
        if (isSteelRack) {
          const bomItems = design.bom || [];
          const hasPosts = bomItems.some(b => 
            b.name.toLowerCase().includes('post') || 
            b.name.toLowerCase().includes('column') || 
            b.name.toLowerCase().includes('brace') || 
            b.name.toLowerCase().includes('support')
          );
          if (!hasPosts) {
            status = 'Warning';
            message = 'Corner-post bracing components missing from BOM. Standard 3-tier stacking loads require structural reinforcement elements.';
          }
        }
      } 
      else if (rule.ruleNumber === 'JNAS-RULE-003') {
        const isHeavy = 
          design.designName.toLowerCase().includes('thrust') ||
          design.designName.toLowerCase().includes('chassis') ||
          design.designName.toLowerCase().includes('cart') ||
          design.description.toLowerCase().includes('heavy') ||
          design.engineeringAsset.toLowerCase().includes('assy');

        if (isHeavy) {
          const bomItems = design.bom || [];
          const hasPockets = bomItems.some(b => 
            b.name.toLowerCase().includes('pocket') || 
            b.name.toLowerCase().includes('channel') || 
            b.name.toLowerCase().includes('skid') || 
            b.name.toLowerCase().includes('base')
          );
          if (!hasPockets) {
            status = 'Failed';
            message = 'Severe hazard. Design footprint estimated above manual lift weight limits but lacks dedicated forklift pockets or skid channels in BOM.';
          }
        }
      } 
      else if (rule.ruleNumber === 'JNAS-RULE-004') {
        const isHandHeld = design.packagingType === 'Plastic Tote' || design.designName.toLowerCase().includes('tote') || design.designName.toLowerCase().includes('case');
        if (isHandHeld) {
          const bomCount = (design.bom || []).reduce((acc, item) => acc + item.quantity, 0);
          if (bomCount > 6) {
            status = 'Warning';
            message = 'Estimated cumulative handle payload exceeds 35 lbs ergonomic manual limits. Recommend transitioning to mechanical lift or dual-operator handles.';
          }
        } else {
          status = 'Skipped';
          message = 'Ergonomic manual lift check skipped. Design is classified as a palletized or racked assembly.';
        }
      } 
      else if (rule.ruleNumber === 'JNAS-RULE-005') {
        const hasFoam = (design.materials || []).some(mid => {
          const m = this.materials.get(mid);
          return m && (m.name.toLowerCase().includes('foam') || m.name.toLowerCase().includes('cushion') || m.name.toLowerCase().includes('eva') || m.name.toLowerCase().includes('polyurethane'));
        });
        if (!hasFoam) {
          status = 'Failed';
          message = 'No cushioning foam or dunnage materials linked. High-precision payloads require verified padding materials to absorb impulse loads.';
        }
      } 
      else if (rule.ruleNumber === 'JNAS-RULE-006') {
        const customerName = design.customer.name.toLowerCase();
        if (customerName.includes('spacex') || customerName.includes('blue origin')) {
          status = 'Manual Review Required';
          message = 'Aerospace customer transport payload. Standard intermodal AIAG envelope sizing may clash with custom rocket fairing clearances. Manual review of physical drawings is mandatory.';
        }
      }

      results.push({
        ruleId: rule.id,
        ruleNumber: rule.ruleNumber,
        ruleName: rule.ruleName,
        category: rule.category,
        severity: rule.severity,
        status,
        message,
        recommendationPlaceholder: `Review corresponding standard ${rule.relatedStandard || 'ASTM'} for exact sizing blueprints.`
      });
    });

    let overallStatus: 'Passed' | 'Warning' | 'Failed' | 'Manual Review Required' = 'Passed';
    if (results.some(r => r.status === 'Failed')) {
      overallStatus = 'Failed';
    } else if (results.some(r => r.status === 'Manual Review Required')) {
      overallStatus = 'Manual Review Required';
    } else if (results.some(r => r.status === 'Warning')) {
      overallStatus = 'Warning';
    }

    const run: ValidationRun = {
      id: `run-${Date.now()}`,
      designId: design.id,
      designNumber: design.designNumber,
      designName: design.designName,
      executedBy: 'jilaneeshaikh@gmail.com',
      executedAt: new Date().toISOString(),
      overallStatus,
      results
    };

    this.validationRuns.unshift(run);
    if (this.validationRuns.length > 100) {
      this.validationRuns.pop();
    }

    this.addAuditLog('EXECUTE_VALIDATION', designId, 'Project', `Executed rules-engine validation on design: ${design.designNumber}. Status: ${overallStatus}`);
    
    eventBus.publish('ACTIVITY_CREATED', {
      type: 'Validation Executed',
      title: `Validation Executed: ${design.designNumber}`,
      description: `Comprehensive rules-engine validation completed with status: ${overallStatus}.`,
      category: 'packaging',
      referenceId: designId
    }, { emitter: 'PackagingRegistry' });

    if (overallStatus === 'Failed') {
      eventBus.publish('ACTIVITY_CREATED', {
        type: 'Validation Failed',
        title: `Validation Failed: ${design.designNumber}`,
        description: `Design failed critical engineering rules. Corrective actions required immediately.`,
        category: 'packaging',
        referenceId: designId
      }, { emitter: 'PackagingRegistry' });
    } else if (overallStatus === 'Passed') {
      eventBus.publish('ACTIVITY_CREATED', {
        type: 'Validation Passed',
        title: `Validation Passed: ${design.designNumber}`,
        description: `Design successfully cleared all structural, ergonomic, and safety validation gates.`,
        category: 'packaging',
        referenceId: designId
      }, { emitter: 'PackagingRegistry' });
    }

    const updatedActivities = [
      {
        id: `act-val-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user: 'jilaneeshaikh@gmail.com',
        action: 'Validation Executed',
        details: `Programmatic validation run completed with status: ${overallStatus}.`
      },
      ...design.activities
    ];
    this.updateDesign(designId, { activities: updatedActivities });

    this.saveState();
    return run;
  }

  public resetToDefaults(): void {
    this.materials.clear();
    this.components.clear();
    this.standards.clear();
    this.projects.clear();
    this.designs.clear();
    this.rules.clear();
    this.validationRuns = [];

    initialStandards.forEach(s => this.standards.set(s.id, s));
    initialMaterials.forEach(m => this.materials.set(m.id, m));
    initialComponents.forEach(c => this.components.set(c.id, c));
    initialPackagingProjects.forEach(p => this.projects.set(p.id, p));
    initialPackagingDesigns.forEach(d => this.designs.set(d.id, d));
    initialRules.forEach(r => this.rules.set(r.id, r));

    this.favoriteProjectIds = new Set(['pkg-001']);
    this.favoriteMaterialIds = new Set(['mat-001', 'mat-002']);
    this.favoriteDesignIds = new Set(['dsn-2801']);
    this.favoriteRuleIds = new Set();
    this.currentRole = 'Packaging Engineer';
    this.currentDepartment = 'Industrial Packaging';
    this.auditLogs = [];
    this.addAuditLog('RESET_SYSTEM', 'system', 'Security', 'Packaging Studio restored to base blueprint seeds.');
    this.saveState();
  }
}
export const packagingRegistry = PackagingRegistry.getInstance();

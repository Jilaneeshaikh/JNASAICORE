import { ThreadNode, ThreadRelationship, ThreadAuditLog, ThreadObjectType, TraceResult, ThreadRole } from './types';

export class DigitalThreadRegistry {
  private static instance: DigitalThreadRegistry;

  private nodes: Map<string, ThreadNode> = new Map();
  private relationships: Map<string, ThreadRelationship> = new Map();
  private auditLogs: ThreadAuditLog[] = [];
  
  private activeRole: ThreadRole = 'PLM Architect';
  private activeWorkspace: string = 'global';

  private constructor() {
    this.loadState();
  }

  public static getInstance(): DigitalThreadRegistry {
    if (!DigitalThreadRegistry.instance) {
      DigitalThreadRegistry.instance = new DigitalThreadRegistry();
    }
    return DigitalThreadRegistry.instance;
  }

  private loadState() {
    try {
      const cachedNodes = localStorage.getItem('jnas_thread_nodes');
      const cachedRelationships = localStorage.getItem('jnas_thread_relationships');
      const cachedAudits = localStorage.getItem('jnas_thread_audits');
      const cachedRole = localStorage.getItem('jnas_thread_role');
      const cachedWorkspace = localStorage.getItem('jnas_thread_workspace');

      if (cachedNodes) {
        const parsed = JSON.parse(cachedNodes);
        Object.keys(parsed).forEach(k => this.nodes.set(k, parsed[k]));
      } else {
        this.seedInitialNodes();
      }

      if (cachedRelationships) {
        const parsed = JSON.parse(cachedRelationships);
        Object.keys(parsed).forEach(k => this.relationships.set(k, parsed[k]));
      } else {
        this.seedInitialRelationships();
      }

      if (cachedAudits) {
        this.auditLogs = JSON.parse(cachedAudits);
      } else {
        this.auditLogs = [
          {
            logId: 'log-seed-01',
            timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
            operator: 'System Seeder Engine',
            role: 'PLM Architect',
            action: 'Relationship Created',
            details: 'Bootstrap initial end-to-end Enterprise Digital Thread connections.',
            ipAddress: '10.240.0.1'
          }
        ];
      }

      if (cachedRole) this.activeRole = cachedRole as ThreadRole;
      if (cachedWorkspace) this.activeWorkspace = cachedWorkspace;

    } catch (e) {
      console.error('Error loading Digital Thread cache, resetting to defaults:', e);
      this.seedInitialNodes();
      this.seedInitialRelationships();
    }
  }

  private saveState() {
    try {
      const nodesObj: Record<string, ThreadNode> = {};
      this.nodes.forEach((v, k) => { nodesObj[k] = v; });

      const relsObj: Record<string, ThreadRelationship> = {};
      this.relationships.forEach((v, k) => { relsObj[k] = v; });

      localStorage.setItem('jnas_thread_nodes', JSON.stringify(nodesObj));
      localStorage.setItem('jnas_thread_relationships', JSON.stringify(relsObj));
      localStorage.setItem('jnas_thread_audits', JSON.stringify(this.auditLogs));
      localStorage.setItem('jnas_thread_role', this.activeRole);
      localStorage.setItem('jnas_thread_workspace', this.activeWorkspace);
    } catch (e) {
      console.error('Error saving Digital Thread state:', e);
    }
  }

  private seedInitialNodes() {
    const seed: ThreadNode[] = [
      // CRM Portal
      { objectId: 'cust-alpha', objectName: 'Tesla Gigafactory Texas', objectType: 'Customer', status: 'Active', owner: 'Elon Musk', createdDate: '2026-01-10T10:00:00Z' },
      // Projects
      { objectId: 'proj-enterprise', objectName: 'Tesla Cybertruck Rack Staging Project', objectType: 'Project', status: 'In Progress', owner: 'Sarah Connor', createdDate: '2026-02-15T12:00:00Z' },
      // Engineering Specifications
      { objectId: 'eng-cad-09', objectName: 'CAD Drawing: Cybertruck Fender Rack V4', objectType: 'EngineeringAsset', status: 'Approved', owner: 'Tony Stark', createdDate: '2026-03-01T09:00:00Z' },
      // BOM
      { objectId: 'bom-structural-4', objectName: 'BOM: Structural Fender Rig Assembly-B', objectType: 'BOM', status: 'Released', owner: 'Bruce Banner', createdDate: '2026-03-12T14:30:00Z' },
      // Packaging Design
      { objectId: 'pkg-design-twilight', objectName: 'Packaging Design: Steel Twilight Case Dunnage', objectType: 'PackagingDesign', status: 'Qualified', owner: 'Steve Rogers', createdDate: '2026-03-20T11:00:00Z' },
      // Validation Reports
      { objectId: 'val-structural-02', objectName: 'ASTM D4169 Structural Drop Test Validation', objectType: 'Validation', status: 'Passed', owner: 'Peter Parker', createdDate: '2026-03-25T15:00:00Z' },
      // Cost Profile
      { objectId: 'cost-twilight-9', objectName: 'Steering Unit Cost Profile Matrix 9B', objectType: 'CostProfile', status: 'Approved', owner: 'Natasha Romanoff', createdDate: '2026-03-27T08:15:00Z' },
      // Logistics Plans
      { objectId: 'log-route-7', objectName: 'Load Plan: Austin Inter-facility Transit', objectType: 'LogisticsPlan', status: 'Scheduled', owner: 'Thor Odinson', createdDate: '2026-04-02T16:00:00Z' },
      // Returnables Assets
      { objectId: 'ret-rack-82', objectName: 'Returnable Asset: Heavy-Duty Steel Rack R-82', objectType: 'ReturnableAsset', status: 'Active', owner: 'Wanda Maximoff', createdDate: '2026-04-10T10:00:00Z' },
      // Inspections
      { objectId: 'insp-rack-82-qa', objectName: 'Annual Mechanical Stress Quality Audit QA-42', objectType: 'Inspection', status: 'Compliant', owner: 'Carol Danvers', createdDate: '2026-04-12T11:00:00Z' },
      // Executive Dashboards
      { objectId: 'db-executive-summary', objectName: 'CEO Steering Strategy Dashboard', objectType: 'DecisionDashboard', status: 'Published', owner: 'Nick Fury', createdDate: '2026-04-15T09:00:00Z' },

      // Documents
      { objectId: 'doc-security-standards', objectName: 'Standard Operating Security Spec v5.4', objectType: 'Document', status: 'Approved', owner: 'Vision', createdDate: '2026-01-20T10:00:00Z' },
      // Knowledge 
      { objectId: 'know-assembly-guide', objectName: 'Fender Rack Stress Analysis Guide', objectType: 'Knowledge', status: 'Published', owner: 'Tony Stark', createdDate: '2026-02-28T14:00:00Z' },
      // Memory
      { objectId: 'mem-lessons-learned', objectName: 'Sprint 35 Retrospective Log: Structural Tolerance', objectType: 'Memory', status: 'Logged', owner: 'Sam Wilson', createdDate: '2026-03-05T16:45:00Z' },
      // Workflows
      { objectId: 'wf-cad-clearance', objectName: 'Automated CAD approval cycle clearance', objectType: 'Workflow', status: 'Active', owner: 'Tony Stark', createdDate: '2026-03-01T08:30:00Z' },
      // Activities
      { objectId: 'act-cad-revision', objectName: 'Revision-B clearance checklist checklist', objectType: 'Activity', status: 'Completed', owner: 'Tony Stark', createdDate: '2026-03-02T13:00:00Z' },
      // AI Session
      { objectId: 'ai-session-copilot', objectName: 'Copilot Session: Structural Weight Allocation', objectType: 'AISession', status: 'Active', owner: 'Tony Stark', createdDate: '2026-03-24T14:00:00Z' },
    ];

    seed.forEach(n => this.nodes.set(n.objectId, n));
  }

  private seedInitialRelationships() {
    const relationships: Omit<ThreadRelationship, 'relationshipId' | 'createdDate' | 'updatedDate'>[] = [
      {
        sourceId: 'cust-alpha',
        sourceType: 'Customer',
        targetId: 'proj-enterprise',
        targetType: 'Project',
        relationshipType: 'Customer -> Project',
        direction: 'bidirectional',
        strength: 'Strong',
        status: 'Active',
        owner: 'Tony Stark',
        workspace: 'global',
        metadata: { rationale: 'Tesla Cybertruck custom dunnage project' },
        auditMetadata: { createdBy: 'Seeder', updatedBy: 'Seeder', version: 1 }
      },
      {
        sourceId: 'proj-enterprise',
        sourceType: 'Project',
        targetId: 'eng-cad-09',
        targetType: 'EngineeringAsset',
        relationshipType: 'Project -> Engineering Asset',
        direction: 'bidirectional',
        strength: 'Strong',
        status: 'Active',
        owner: 'Tony Stark',
        workspace: 'global',
        metadata: { rationale: 'Links Project objectives with cad drawing clearances' },
        auditMetadata: { createdBy: 'Seeder', updatedBy: 'Seeder', version: 1 }
      },
      {
        sourceId: 'eng-cad-09',
        sourceType: 'EngineeringAsset',
        targetId: 'bom-structural-4',
        targetType: 'BOM',
        relationshipType: 'Engineering Asset -> BOM',
        direction: 'source_to_target',
        strength: 'Strong',
        status: 'Active',
        owner: 'Tony Stark',
        workspace: 'global',
        metadata: { rationale: 'Engineering Drawing mandates precise BOM components' },
        auditMetadata: { createdBy: 'Seeder', updatedBy: 'Seeder', version: 1 }
      },
      {
        sourceId: 'bom-structural-4',
        sourceType: 'BOM',
        targetId: 'pkg-design-twilight',
        targetType: 'PackagingDesign',
        relationshipType: 'BOM -> Packaging Design',
        direction: 'bidirectional',
        strength: 'Strong',
        status: 'Active',
        owner: 'Steve Rogers',
        workspace: 'global',
        metadata: { rationale: 'Structural Packaging relies on approved steel/dunnage BOM' },
        auditMetadata: { createdBy: 'Seeder', updatedBy: 'Seeder', version: 1 }
      },
      {
        sourceId: 'pkg-design-twilight',
        sourceType: 'PackagingDesign',
        targetId: 'val-structural-02',
        targetType: 'Validation',
        relationshipType: 'Packaging Design -> Validation',
        direction: 'source_to_target',
        strength: 'Strong',
        status: 'Active',
        owner: 'Peter Parker',
        workspace: 'global',
        metadata: { rationale: 'Structural packaging must pass drop testing validation' },
        auditMetadata: { createdBy: 'Seeder', updatedBy: 'Seeder', version: 1 }
      },
      {
        sourceId: 'pkg-design-twilight',
        sourceType: 'PackagingDesign',
        targetId: 'cost-twilight-9',
        targetType: 'CostProfile',
        relationshipType: 'Packaging Design -> Cost Profile',
        direction: 'bidirectional',
        strength: 'Medium',
        status: 'Active',
        owner: 'Natasha Romanoff',
        workspace: 'global',
        metadata: { rationale: 'Design materials map into Cost Profiles dynamically' },
        auditMetadata: { createdBy: 'Seeder', updatedBy: 'Seeder', version: 1 }
      },
      {
        sourceId: 'pkg-design-twilight',
        sourceType: 'PackagingDesign',
        targetId: 'log-route-7',
        targetType: 'LogisticsPlan',
        relationshipType: 'Packaging Design -> Logistics Plan',
        direction: 'source_to_target',
        strength: 'Strong',
        status: 'Active',
        owner: 'Thor Odinson',
        workspace: 'global',
        metadata: { rationale: 'Unit dimensions and load limits specify trailer packing layouts' },
        auditMetadata: { createdBy: 'Seeder', updatedBy: 'Seeder', version: 1 }
      },
      {
        sourceId: 'log-route-7',
        sourceType: 'LogisticsPlan',
        targetId: 'ret-rack-82',
        targetType: 'ReturnableAsset',
        relationshipType: 'Logistics Plan -> Returnable Asset',
        direction: 'bidirectional',
        strength: 'Strong',
        status: 'Active',
        owner: 'Wanda Maximoff',
        workspace: 'global',
        metadata: { rationale: 'The transit route allocates Returnable Rack-82 physically' },
        auditMetadata: { createdBy: 'Seeder', updatedBy: 'Seeder', version: 1 }
      },
      {
        sourceId: 'ret-rack-82',
        sourceType: 'ReturnableAsset',
        targetId: 'insp-rack-82-qa',
        targetType: 'Inspection',
        relationshipType: 'Returnable Asset -> Inspection',
        direction: 'source_to_target',
        strength: 'Strong',
        status: 'Active',
        owner: 'Carol Danvers',
        workspace: 'global',
        metadata: { rationale: 'Rack cycles trigger Annual stress quality audits' },
        auditMetadata: { createdBy: 'Seeder', updatedBy: 'Seeder', version: 1 }
      },
      {
        sourceId: 'insp-rack-82-qa',
        sourceType: 'Inspection',
        targetId: 'db-executive-summary',
        targetType: 'DecisionDashboard',
        relationshipType: 'Returnable Asset -> Inspection -> Executive Dashboard',
        direction: 'source_to_target',
        strength: 'Medium',
        status: 'Active',
        owner: 'Nick Fury',
        workspace: 'global',
        metadata: { rationale: 'Inspections pass rate feeds into executive dashboard metrics' },
        auditMetadata: { createdBy: 'Seeder', updatedBy: 'Seeder', version: 1 }
      },

      // Document relations
      {
        sourceId: 'cust-alpha',
        sourceType: 'Customer',
        targetId: 'doc-security-standards',
        targetType: 'Document',
        relationshipType: 'Customer -> Documents',
        direction: 'bidirectional',
        strength: 'Medium',
        status: 'Active',
        owner: 'Steve Rogers',
        workspace: 'global',
        metadata: { rationale: 'Tesla Master Service & Security Agreements' },
        auditMetadata: { createdBy: 'Seeder', updatedBy: 'Seeder', version: 1 }
      },
      // Knowledge relations
      {
        sourceId: 'proj-enterprise',
        sourceType: 'Project',
        targetId: 'know-assembly-guide',
        targetType: 'Knowledge',
        relationshipType: 'Project -> Knowledge',
        direction: 'bidirectional',
        strength: 'Strong',
        status: 'Active',
        owner: 'Tony Stark',
        workspace: 'global',
        metadata: { rationale: 'Enterprise blueprint guides are indexed to standard knowledge' },
        auditMetadata: { createdBy: 'Seeder', updatedBy: 'Seeder', version: 1 }
      },
      // Memory relations
      {
        sourceId: 'know-assembly-guide',
        sourceType: 'Knowledge',
        targetId: 'mem-lessons-learned',
        targetType: 'Memory',
        relationshipType: 'Knowledge -> Memory',
        direction: 'bidirectional',
        strength: 'Medium',
        status: 'Active',
        owner: 'Sam Wilson',
        workspace: 'global',
        metadata: { rationale: 'Stress guides link directly to memory logs and retro notes' },
        auditMetadata: { createdBy: 'Seeder', updatedBy: 'Seeder', version: 1 }
      },
      // Workflow / Activities
      {
        sourceId: 'wf-cad-clearance',
        sourceType: 'Workflow',
        targetId: 'act-cad-revision',
        targetType: 'Activity',
        relationshipType: 'Workflow -> Activities',
        direction: 'source_to_target',
        strength: 'Strong',
        status: 'Active',
        owner: 'Tony Stark',
        workspace: 'global',
        metadata: { rationale: 'Approval cycles execute Revision clearances checklist activities' },
        auditMetadata: { createdBy: 'Seeder', updatedBy: 'Seeder', version: 1 }
      },
      // AI Session Sources
      {
        sourceId: 'ai-session-copilot',
        sourceType: 'AISession',
        targetId: 'val-structural-02',
        targetType: 'Validation',
        relationshipType: 'AI Session -> Sources',
        direction: 'bidirectional',
        strength: 'Medium',
        status: 'Active',
        owner: 'Tony Stark',
        workspace: 'global',
        metadata: { rationale: 'AI Copilot reads Drop tests for material allocation reasoning' },
        auditMetadata: { createdBy: 'Seeder', updatedBy: 'Seeder', version: 1 }
      }
    ];

    relationships.forEach((r, idx) => {
      const relationshipId = `rel-thread-00${idx + 1}`;
      this.relationships.set(relationshipId, {
        ...r,
        relationshipId,
        createdDate: new Date(Date.now() - 3600000 * 24).toISOString(),
        updatedDate: new Date().toISOString()
      });
    });
  }

  // Set active role/workspace
  public setRoleAndWorkspace(role: ThreadRole, workspace: string) {
    this.activeRole = role;
    this.activeWorkspace = workspace;
    this.saveState();
  }

  public getRole(): ThreadRole {
    return this.activeRole;
  }

  public getWorkspace(): string {
    return this.activeWorkspace;
  }

  // CRUD Nodes
  public getNodes(): ThreadNode[] {
    return Array.from(this.nodes.values());
  }

  public getNode(id: string): ThreadNode | undefined {
    return this.nodes.get(id);
  }

  public createNode(node: ThreadNode): ThreadNode {
    this.nodes.set(node.objectId, node);
    this.saveState();
    return node;
  }

  // CRUD Relationships
  public getRelationships(): ThreadRelationship[] {
    // Filter by Workspace Isolation rules
    const rels = Array.from(this.relationships.values());
    if (this.activeWorkspace === 'global') return rels;
    return rels.filter(r => r.workspace === this.activeWorkspace || r.workspace === 'global');
  }

  public createRelationship(params: Omit<ThreadRelationship, 'relationshipId' | 'createdDate' | 'updatedDate' | 'auditMetadata'>): ThreadRelationship {
    const relationshipId = `rel-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    const newRel: ThreadRelationship = {
      ...params,
      relationshipId,
      createdDate: now,
      updatedDate: now,
      auditMetadata: {
        createdBy: params.owner,
        updatedBy: params.owner,
        version: 1
      }
    };

    this.relationships.set(relationshipId, newRel);

    this.logAudit(
      'Relationship Created',
      `Registered digital link "${newRel.relationshipType}" between ${newRel.sourceType} [${newRel.sourceId}] and ${newRel.targetType} [${newRel.targetId}].`
    );

    this.saveState();
    return newRel;
  }

  public updateRelationship(id: string, updates: Partial<ThreadRelationship>, operator: string): ThreadRelationship | null {
    const r = this.relationships.get(id);
    if (!r) return null;

    const updated: ThreadRelationship = {
      ...r,
      ...updates,
      updatedDate: new Date().toISOString(),
      auditMetadata: {
        ...r.auditMetadata,
        updatedBy: operator,
        version: r.auditMetadata.version + 1
      }
    };

    this.relationships.set(id, updated);
    this.logAudit(
      'Relationship Updated',
      `Modified relationship [${id}] - status set to "${updated.status}", strength set to "${updated.strength}".`
    );
    this.saveState();
    return updated;
  }

  public deleteRelationship(id: string): boolean {
    const r = this.relationships.get(id);
    if (!r) return false;

    this.relationships.delete(id);
    this.logAudit(
      'Relationship Removed',
      `Removed digital thread connection [${id}] ("${r.relationshipType}") connecting [${r.sourceId}] ──> [${r.targetId}].`
    );
    this.saveState();
    return true;
  }

  // Recursive Traceability Solvers
  public performTrace(objectId: string, direction: 'forward' | 'backward' | 'impact'): TraceResult | null {
    const startNode = this.nodes.get(objectId);
    if (!startNode) return null;

    const visitedNodes: ThreadNode[] = [];
    const pathRelationships: ThreadRelationship[] = [];
    const visitedIds = new Set<string>();
    const dependencyScores: Record<string, number> = {};

    // Helper functions for traversals
    const dfs = (currId: string, depth: number) => {
      if (visitedIds.has(currId) || depth > 8) return; // guard against cycles and cap trace depth
      visitedIds.add(currId);

      const currNode = this.nodes.get(currId);
      if (currNode && currId !== objectId) {
        visitedNodes.push(currNode);
      }

      // Calculate a base centrality dependency rank for each node
      dependencyScores[currId] = (dependencyScores[currId] || 0) + (10 - depth);

      // Fetch links adjacent to current Node
      const activeRels = this.getRelationships();
      activeRels.forEach(rel => {
        if (direction === 'forward') {
          // Traverse source to target
          if (rel.sourceId === currId) {
            pathRelationships.push(rel);
            dfs(rel.targetId, depth + 1);
          }
        } else if (direction === 'backward') {
          // Traverse target to source
          if (rel.targetId === currId) {
            pathRelationships.push(rel);
            dfs(rel.sourceId, depth + 1);
          }
        } else {
          // Impact Trace: Traverse both directions to find any dependent links
          if (rel.sourceId === currId) {
            pathRelationships.push(rel);
            dfs(rel.targetId, depth + 1);
          } else if (rel.targetId === currId) {
            pathRelationships.push(rel);
            dfs(rel.sourceId, depth + 1);
          }
        }
      });
    };

    dfs(objectId, 0);

    // Filter duplicate relationships logged in recursive traversals
    const uniqueRels = pathRelationships.filter((v, i, a) => a.findIndex(t => t.relationshipId === v.relationshipId) === i);

    this.logAudit(
      'Trace Executed',
      `Executed recursive ${direction} traceability tree query on starting node [${objectId}] (${startNode.objectType}). Depth achieved: ${visitedIds.size - 1} linked records.`
    );

    return {
      startNode,
      direction,
      visitedNodes,
      pathRelationships: uniqueRels,
      maxDepthReached: visitedIds.size - 1,
      dependencyScores
    };
  }

  // Logging and audits
  private logAudit(action: ThreadAuditLog['action'], details: string) {
    const ipList = ['192.168.1.15', '10.140.4.82', '172.16.2.21', '8.8.8.8'];
    const randomIp = ipList[Math.floor(Math.random() * ipList.length)];
    
    this.auditLogs.unshift({
      logId: `log-thread-${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toISOString(),
      operator: 'Chief PLM Architect',
      role: this.activeRole,
      action,
      details,
      ipAddress: randomIp
    });

    // Cap logs length at 100 entries
    if (this.auditLogs.length > 100) {
      this.auditLogs.pop();
    }
  }

  public getAuditLogs(): ThreadAuditLog[] {
    return this.auditLogs;
  }
}

export const threadRegistry = DigitalThreadRegistry.getInstance();

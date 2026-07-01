export type ThreadObjectType = 
  | 'Customer'
  | 'Project'
  | 'EngineeringAsset'
  | 'BOM'
  | 'PackagingDesign'
  | 'Validation'
  | 'CostProfile'
  | 'LogisticsPlan'
  | 'ReturnableAsset'
  | 'Inspection'
  | 'DecisionDashboard'
  | 'Document'
  | 'Knowledge'
  | 'Memory'
  | 'Activity'
  | 'Workflow'
  | 'AISession'
  | 'ExternalERP'
  | 'ExternalMES';

export interface ThreadNode {
  objectId: string;
  objectName: string;
  objectType: ThreadObjectType;
  status?: string;
  owner?: string;
  createdDate?: string;
  detailsUrl?: string;
}

export interface ThreadRelationship {
  relationshipId: string;
  sourceId: string;
  sourceType: ThreadObjectType;
  targetId: string;
  targetType: ThreadObjectType;
  relationshipType: string; // e.g., 'Customer -> Project', 'Project -> CAD Spec'
  direction: 'bidirectional' | 'source_to_target' | 'target_to_source';
  strength: 'Strong' | 'Medium' | 'Weak';
  status: 'Active' | 'Draft' | 'Deprecated';
  owner: string;
  workspace: string;
  createdDate: string;
  updatedDate: string;
  metadata: Record<string, string>;
  auditMetadata: {
    createdBy: string;
    updatedBy: string;
    version: number;
  };
}

export interface TraceResult {
  startNode: ThreadNode;
  direction: 'forward' | 'backward' | 'impact';
  visitedNodes: ThreadNode[];
  pathRelationships: ThreadRelationship[];
  maxDepthReached: number;
  dependencyScores: Record<string, number>; // Maps node ID to an calculated rank of centrality
}

export interface ThreadAuditLog {
  logId: string;
  timestamp: string;
  operator: string;
  role: string;
  action: 'Relationship Created' | 'Relationship Updated' | 'Relationship Removed' | 'Trace Executed';
  details: string;
  ipAddress: string;
}

export type ThreadRole = 'Administrator' | 'PLM Architect' | 'Systems Engineer' | 'Supply Chain Planner' | 'Quality Inspector' | 'Executive';

export type PackagingType =
  | 'Returnable'
  | 'Expendable'
  | 'Rack'
  | 'Pallet'
  | 'Kit Cart'
  | 'Bin'
  | 'Plastic Tote'
  | 'Steel Rack'
  | 'Wooden Crate'
  | 'Foam'
  | 'Corrugated Box'
  | 'Custom';

export type PackagingStatus =
  | 'Draft'
  | 'Submitted'
  | 'In Review'
  | 'Approved'
  | 'Active'
  | 'Archived'
  | 'Cancelled';

export type PackagingPriority = 'Low' | 'Medium' | 'High' | 'Critical';

// Detailed standards interface for ISO, ASTM, OEM, internal, etc.
export interface MaterialStandard {
  id: string;
  code: string;
  name: string;
  type: 'Internal' | 'Customer' | 'OEM' | 'Material' | 'Dimension' | 'Weight' | 'Quality' | 'ISO' | 'ASTM';
  description: string;
  revision: string;
  publishedDate: string;
  status: 'Active' | 'Under Review' | 'Superseded';
}

// Enterprise Packaging Material Definition
export interface PackagingMaterial {
  id: string;
  code: string;
  name: string;
  category: string; // Steel, Aluminium, Plastic, HDPE, PP, ABS, Foam, Wood, Plywood, Corrugated, etc.
  subcategory?: string;
  description: string;
  materialType: string; // e.g. Polymer, Metal, Composite, Organic, Paper-based
  grade: string; // e.g. ESD, Structural, Maritime, Aerospace, Standard
  density: string;
  weight?: string; // Weight per unit / volume
  thickness?: string;
  dimensions?: string;
  color?: string;
  finish?: string;
  surfaceTreatment?: string;
  manufacturer: string;
  supplierPlaceholder?: string;
  standardIds?: string[]; // References to MaterialStandard
  unit: string; // e.g. kg, sheet, roll, custom
  costPlaceholder?: number; // Cost estimate per unit
  lifecycleStatus: 'Candidate' | 'Approved' | 'Obsolete' | 'Suspended';
  revision: string;
  approvalStatus: 'Draft' | 'Submitted' | 'In Review' | 'Approved';
  tags: string[];
  metadata?: Record<string, any>;
  relationships?: {
    parentMaterialId?: string;
    equivalentMaterialId?: string;
  };
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
  auditMetadata?: {
    createdBy: string;
    approvedBy?: string;
    lastAuditedAt?: string;
  };
}

// Enterprise Packaging Component Definition
export interface PackagingComponent {
  id: string;
  code: string;
  name: string;
  description: string;
  category: 'Cushion' | 'Divider' | 'Spacer' | 'Brace' | 'Fastener' | 'Label' | 'Handle' | 'Caster' | 'Lid' | 'Base' | 'Dunnage Insert' | 'Other';
  materialId: string; // References a PackagingMaterial.id
  revision: string;
  status: 'Active' | 'In Design' | 'Under Review' | 'Obsolete';
  engineeringAsset?: string;
  drawingRef?: string;
  partNumber?: string;
  projectId?: string; // Linked PackagingProject.id
  customerId?: string; // Linked Customer.id
  knowledgeLinks?: string[];
  memoryLinks?: string[];
  activities?: string[];
  documentRefs?: string[];
  futureSupplierPlaceholder?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PackagingProject {
  id: string;
  projectNumber: string;
  projectName: string;
  customerId: string;
  customerName: string;
  engineeringProjectId: string;
  engineeringProjectName: string;
  packagingType: PackagingType;
  industry: string;
  status: PackagingStatus;
  priority: PackagingPriority;
  owner: string;
  packagingEngineer: string;
  revision: number;
  startDate: string;
  targetDate: string;
  approvalStatus: 'Pending' | 'In Review' | 'Approved' | 'Rejected';
  tags: string[];
  knowledgeLinks: string[];
  memoryLinks: string[];
  documentRefs: string[];
  drawingRefs: string[];
  changeRefs: string[];
  dunnageSpecs?: {
    materialCode: string;
    thickness: string;
    customCavities: number;
    antistatic: boolean;
  };
  weightCapacityKg?: number;
  dimensionsOuter?: {
    length: number;
    width: number;
    height: number;
    unit: 'mm' | 'inch';
  };
  createdAt: string;
  updatedAt: string;
}

export interface PackagingAuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userRole: string;
  department: string;
  action: string;
  targetId: string;
  targetType: 'Project' | 'Material' | 'Component' | 'Standard' | 'Security' | 'Integration';
  details: string;
}

export type PackagingRole = 'Packaging Engineer' | 'Engineering Manager' | 'Quality Inspector';

export type DesignCategory =
  | 'Steel Rack'
  | 'Returnable Rack'
  | 'Kit Cart'
  | 'Pallet'
  | 'Plastic Tote'
  | 'Wooden Crate'
  | 'Corrugated Box'
  | 'Foam Packaging'
  | 'Export Packaging'
  | 'Domestic Packaging'
  | 'Custom Packaging';

export type DesignLifecycleStatus =
  | 'Draft'
  | 'In Review'
  | 'Approved'
  | 'Released'
  | 'Obsolete'
  | 'Archived'
  | 'Future Manufacturing Release';

export interface PackagingDesign {
  id: string;
  designNumber: string;
  designName: string;
  description: string;
  customer: {
    id: string;
    name: string;
  };
  project: {
    id: string;
    name: string;
  };
  packagingType: PackagingType;
  category: DesignCategory;
  revision: number;
  lifecycleStatus: DesignLifecycleStatus;
  approvalStatus: 'Pending' | 'In Review' | 'Approved' | 'Rejected';
  packagingEngineer: string;
  owner: string;
  version: string;
  engineeringAsset: string;
  bom: {
    componentId: string;
    code: string;
    name: string;
    quantity: number;
  }[];
  materials: string[]; // array of materialIds
  knowledgeLinks: string[];
  memoryLinks: string[];
  documents: {
    id: string;
    name: string;
    url?: string;
  }[];
  activities: {
    id: string;
    timestamp: string;
    user: string;
    action: string;
    details: string;
  }[];
  workflow: {
    stage: string;
    status: 'Pending' | 'In Progress' | 'Completed';
    assignee: string;
  }[];
  createdAt: string;
  updatedAt: string;
  auditMetadata: {
    createdBy: string;
    approvedBy?: string;
    lastAuditedAt?: string;
  };
}

export type ValidationRuleCategory =
  | 'Material Rules'
  | 'Dimension Rules'
  | 'Weight Rules'
  | 'Stacking Rules'
  | 'Forklift Rules'
  | 'Ergonomic Rules'
  | 'Safety Rules'
  | 'Export Rules'
  | 'Automotive Rules'
  | 'Customer Rules'
  | 'Internal Rules';

export type ValidationSeverity = 'Error' | 'Warning' | 'Recommendation';

export type ValidationStatus = 'Passed' | 'Warning' | 'Failed' | 'Skipped' | 'Manual Review Required';

export interface ValidationRule {
  id: string;
  ruleNumber: string;
  ruleName: string;
  description: string;
  category: ValidationRuleCategory;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  severity: ValidationSeverity;
  owner: string;
  department: string;
  revision: string;
  status: 'Active' | 'Draft' | 'Deprecated';
  version: string;
  customer?: string;
  projectType?: string;
  packagingCategory?: string;
  relatedStandard?: string;
  createdAt: string;
  updatedAt: string;
  auditMetadata: {
    createdBy: string;
    approvedBy?: string;
    lastAuditedAt?: string;
  };
}

export interface ValidationResult {
  ruleId: string;
  ruleNumber: string;
  ruleName: string;
  category: ValidationRuleCategory;
  severity: ValidationSeverity;
  status: ValidationStatus;
  message: string;
  recommendationPlaceholder?: string;
}

export interface ValidationRun {
  id: string;
  designId: string;
  designNumber: string;
  designName: string;
  executedBy: string;
  executedAt: string;
  overallStatus: 'Passed' | 'Warning' | 'Failed' | 'Manual Review Required';
  results: ValidationResult[];
}



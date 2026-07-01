export type DrawingCategory = 'Mechanical' | 'Electrical' | 'Structural' | 'Civil' | 'Simulation' | 'Packaging' | 'Automation' | 'Standards';
export type DrawingStatus = 'Draft' | 'Released' | 'Superseded' | 'Withdrawn' | 'Obsolete';
export type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected' | 'In Review';
export type EngineeringDocType =
  | 'Drawing2D'
  | 'Specification'
  | 'DesignNote'
  | 'Calculation'
  | 'Standard'
  | 'InspectionReport'
  | 'ManufacturingNote'
  | 'PackagingDrawing'
  | 'RevisionNote'
  | 'FutureCAD';

export interface BOMItem {
  partNumber: string;
  name: string;
  quantity: number;
  unit: string;
  material?: string;
  source?: 'In-House' | 'Purchased' | 'Subcontract';
}

export interface Drawing {
  id: string;
  drawingNumber: string;
  revision: string;
  title: string;
  description: string;
  category: DrawingCategory;
  owner: string; // Engineer Name
  projectId: string; // Linked Project
  customerId?: string; // Linked Customer
  status: DrawingStatus;
  approvalStatus: ApprovalStatus;
  relatedDocuments: string[]; // Document titles or IDs
  relatedParts: string[]; // Part Numbers
  relatedBOM: BOMItem[];
  relatedStandards: string[]; // Standard IDs (e.g. 'AS9100-Ti')
  futureCADFile?: {
    format: 'STEP' | 'DXF' | 'DWG' | 'IGES';
    fileName: string;
    fileSizeMb: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SubProject {
  id: string;
  name: string;
  status: 'Planning' | 'Active' | 'On Hold' | 'Completed';
  leadEngineer: string;
  deadline: string;
  estimatedCost: number;
}

export interface EngineeringMilestone {
  id: string;
  title: string;
  status: 'Scheduled' | 'In Progress' | 'Achieved' | 'Delayed';
  targetDate: string;
}

export interface EngineeringTeamMember {
  userId: string;
  name: string;
  role: 'Lead Engineer' | 'Structural Specialist' | 'CAD Designer' | 'QA Inspector' | 'Material Analyst' | 'Release Manager';
  department: string;
}

export interface EngineeringProjectDetails {
  projectId: string; // Parent JNAS Project ID
  subProjects: SubProject[];
  revisions: {
    version: string;
    description: string;
    date: string;
    author: string;
  }[];
  milestones: EngineeringMilestone[];
  team: EngineeringTeamMember[];
  budget: {
    allocated: number;
    spent: number;
    currency: string;
  };
}

export interface EngineeringDocument {
  id: string;
  title: string;
  type: EngineeringDocType;
  description: string;
  revision: string;
  owner: string;
  projectId: string;
  fileSizeKb: number;
  createdAt: string;
  updatedAt: string;
}

export interface EngineeringDashboardKPIs {
  totalDrawings: number;
  pendingReviews: number;
  activeEngineeringProjects: number;
  releasedDrawings: number;
  totalBOMParts: number;
}

export type ProjectType = 'engineering' | 'packaging' | 'research' | 'learning' | 'business' | 'personal';
export type ProjectStatus = 'Active' | 'Paused' | 'On Hold' | 'Archived' | 'Completed';
export type ProjectPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type ProjectHealth = 'healthy' | 'at_risk' | 'critical';
export type ProjectRole = 'Owner' | 'Administrator' | 'Manager' | 'Member' | 'Viewer' | 'Guest';

export interface ProjectMember {
  userId: string;
  name: string;
  role: ProjectRole;
  department: string;
  email: string;
  joinDate: string;
}

export interface ProjectTask {
  id: string;
  title: string;
  description: string;
  status: 'Backlog' | 'Todo' | 'In Progress' | 'In Review' | 'Done';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  assignedTo?: string; // Member Name
  dueDate: string;
}

export interface ProjectActivityLog {
  id: string;
  timestamp: string;
  projectId: string;
  userId: string;
  actionType:
    | 'Created'
    | 'Updated'
    | 'DocumentAdded'
    | 'KnowledgeAdded'
    | 'WorkflowStarted'
    | 'WorkflowCompleted'
    | 'AIInteraction'
    | 'FileUploaded'
    | 'MemberAdded'
    | 'MemberRemoved'
    | 'Archived'
    | 'Restored'
    | 'TaskUpdated';
  details: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  type: ProjectType;
  status: ProjectStatus;
  priority: ProjectPriority;
  health: ProjectHealth;
  owner: string;
  members: ProjectMember[];
  workspace: 'personal' | 'engineering' | 'learning' | 'business' | 'admin';
  department: string;
  client?: string;
  category: string;
  tags: string[];
  version: string;
  archiveStatus: boolean;
  tasks: ProjectTask[];
  createdDate: string;
  updatedDate: string;
  metadata?: Record<string, any>;
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  type: ProjectType;
  defaultCategory: string;
  defaultTasks: Omit<ProjectTask, 'id'>[];
  defaultMembers: Omit<ProjectMember, 'joinDate'>[];
}

export interface ProjectAPI {
  documentsCount: number;
  knowledgeLinksCount: number;
  memoryNodesCount: number;
  activeWorkflowsCount: number;
  storageUsageMb: number;
}

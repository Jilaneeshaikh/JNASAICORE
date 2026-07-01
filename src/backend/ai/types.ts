import { ProviderMessage } from '../types';

export type AISessionStatus = 'active' | 'archived' | 'pinned';

export interface AISession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  favorite: boolean;
  status: AISessionStatus;
  category: string;
  tags: string[];
  workspace: string;
  projectId?: string; // Linked project
  customerId?: string; // Linked customer
  contactId?: string; // Linked contact
  messages: ProviderMessage[];
  systemInstruction?: string;
  temperature: number;
  maxTokens: number;
  providerId: string;
}

export interface AIContextObject {
  currentUser: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
  currentWorkspace: string;
  currentModule: string;
  currentCustomer: any | null;
  currentContact: any | null;
  currentProject: any | null;
  currentDocuments: any[];
  knowledge: any[];
  memory: any[];
  activities: any[];
  communication: any[];
  workflow: any | null;
  searchResults: any[];
  settings: any;
  permissions: string[];
  activeDrawing?: any;
  engineeringDetails?: any;
  packagingContext?: any;
  logisticsContext?: any;
  returnablesContext?: any;
  decisionContext?: any;
  threadContext?: any;
}

export interface ContextItem {
  id: string;
  type: 'user' | 'workspace' | 'module' | 'customer' | 'contact' | 'project' | 'document' | 'knowledge' | 'memory' | 'activity' | 'communication' | 'workflow' | 'drawing' | 'engineering' | 'packaging' | 'logistics' | 'returnables' | 'decision' | 'thread';
  label: string;
  enabled: boolean;
  metadata: any;
}

export interface AITool {
  id: string;
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, {
      type: string;
      description: string;
      enum?: string[];
      required?: boolean;
    }>;
  };
  handler: (args: any) => Promise<any>;
}

export interface AIResponseMeta {
  providerId: string;
  modelName: string;
  latencyMs: number;
  inputTokens: number;
  outputTokens: number;
  confidence: number; // Placeholder mock between 0.85 and 0.99
  costEstimate: number; // Dynamic estimation based on model pricing
  knowledgeUsed: string[];
  memoryUsed: string[];
  documentsUsed: string[];
  projectsUsed: string[];
  referencedSources: Array<{ id: string; type: string; title: string; snippet?: string }>;
  warnings: string[];
  toolsExecuted: Array<{ toolId: string; args: any; result: any }>;
}

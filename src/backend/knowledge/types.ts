export type KnowledgeCategory =
  | 'Engineering'
  | 'Packaging'
  | 'Learning'
  | 'Business'
  | 'Projects'
  | 'Research'
  | 'Meetings'
  | 'Processes'
  | 'Standards'
  | 'Customers'
  | 'Suppliers'
  | 'Personal';

export type KnowledgeVisibility = 'Private' | 'Shared' | 'Organization' | 'Public';

export type KnowledgeSourceType =
  | 'pdf'
  | 'word'
  | 'excel'
  | 'markdown'
  | 'text'
  | 'engineering_notes'
  | 'packaging_notes'
  | 'meeting_notes'
  | 'project_documents'
  | 'images'
  | 'cad_metadata';

export interface KnowledgeSource {
  id: string;
  name: string;
  description: string;
  ownerModule: string;
  category: KnowledgeCategory;
  permissions: {
    roles: string[];
    visibility: KnowledgeVisibility;
  };
  version: string;
  status: 'Active' | 'Inactive' | 'Degraded';
  tags: string[];
}

export interface KnowledgeRelationship {
  sourceId: string;
  targetId: string;
  relationshipType:
    | 'Document_To_Project'
    | 'Project_To_Customer'
    | 'Meeting_To_Project'
    | 'Drawing_To_Packaging'
    | 'Lesson_To_Standard'
    | 'Customer_To_Documents'
    | 'Derived_From'
    | 'References';
  description: string;
}

export interface KnowledgeObject {
  id: string;
  title: string;
  description: string;
  type: KnowledgeSourceType;
  owner: string;
  workspace: string;
  project?: string;
  category: KnowledgeCategory;
  tags: string[];
  status: 'Draft' | 'Published' | 'Archived';
  version: string;
  metadata: Record<string, any>;
  permissions: {
    visibility: KnowledgeVisibility;
    allowedRoles: string[];
  };
  source: string;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeSearchQuery {
  keyword?: string;
  categories?: KnowledgeCategory[];
  types?: KnowledgeSourceType[];
  tags?: string[];
  project?: string;
  owner?: string;
  workspace?: string;
  visibility?: KnowledgeVisibility;
}

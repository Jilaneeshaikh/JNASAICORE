/**
 * JNAS Document Center Domain Models & Types
 */

export type DocumentType =
  | 'pdf'
  | 'word'
  | 'excel'
  | 'powerpoint'
  | 'markdown'
  | 'text'
  | 'csv'
  | 'json'
  | 'image'
  | 'cad'
  | 'archive'
  | 'other';

export type DocumentCategory =
  | 'CRM'
  | 'Projects'
  | 'Engineering'
  | 'Packaging'
  | 'Knowledge'
  | 'LMS'
  | 'HR'
  | 'Finance'
  | 'Procurement'
  | 'Quality'
  | 'Administration'
  | 'General';

export type DocumentStatus =
  | 'Draft'
  | 'Review'
  | 'Approved'
  | 'Released'
  | 'Archived'
  | 'Deprecated';

export type ConfidentialityLevel =
  | 'Unclassified'
  | 'Internal'
  | 'Confidential'
  | 'StrictlyConfidential'
  | 'Secret';

export type FolderType =
  | 'workspace'
  | 'customer'
  | 'project'
  | 'engineering'
  | 'packaging'
  | 'knowledge'
  | 'personal'
  | 'shared'
  | 'favorites'
  | 'archive';

export interface DocumentPermissions {
  roles: string[];
  users: string[];
  departments: string[];
}

export interface DocumentAuditInfo {
  createdBy: string;
  createdDepartment: string;
  updatedBy: string;
  approvedBy?: string;
}

export interface Document {
  id: string;
  title: string;
  displayName: string;
  description?: string;
  type: DocumentType;
  category: DocumentCategory;
  owner: string; // User who owns the record
  workspace: 'personal' | 'engineering' | 'learning' | 'business' | 'admin';
  project?: string; // Target project ID if mapped
  customer?: string; // Target customer ID if mapped
  contact?: string; // Target contact ID if mapped
  module: string; // Originating Module/Platform (e.g. 'CRM', 'Projects')
  status: DocumentStatus;
  tags: string[];
  permissions: DocumentPermissions;
  version: number;
  checksum: string;
  size: number; // File size in bytes
  fileExtension: string;
  mimeType: string;
  storageLocation: string; // e.g., 'jnas://s3-us-west-2/docs/doc_481.pdf'
  createdDate: string;
  updatedDate: string;
  archiveStatus: boolean;
  softDelete: boolean;
  isFavorite: boolean;

  // Metadata Fields
  author: string;
  department: string;
  revision: string; // e.g. 'Rev A', 'Rev 1.2'
  approvalStatus: 'Pending' | 'Approved' | 'Rejected';
  confidentiality: ConfidentialityLevel;
  keywords: string[];
  labels: Record<string, string>; // Key-Value attributes
  customProperties: Record<string, string>;

  // Relational Links
  customerLinks: string[];   // Linked customer IDs
  projectLinks: string[];    // Linked project IDs
  contactLinks: string[];    // Linked contact IDs
  knowledgeLinks: string[];  // Linked KMS Document/Article IDs
  memoryLinks: string[];     // Linked memory blocks
}

export interface DocumentActivityLog {
  id: string;
  documentId: string;
  timestamp: string;
  actionType:
    | 'Created'
    | 'Updated'
    | 'Archived'
    | 'Deleted'
    | 'Restored'
    | 'Linked'
    | 'Unlinked'
    | 'Viewed'
    | 'Downloaded'
    | 'PermissionsChanged'
    | 'Approved'
    | 'Rejected';
  operator: string;
  details: string;
}

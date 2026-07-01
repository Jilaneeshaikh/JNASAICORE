export type ContactStatus = 'Active' | 'Inactive' | 'On Hold' | 'Archived';
export type ContactRole = 'Executive' | 'Engineering' | 'Procurement' | 'Logistics' | 'Quality' | 'Legal' | 'Compliance' | 'Consultant' | 'Operations' | 'Finance' | 'HR' | 'Vendor Lead';

export interface ContactAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface ContactActivityLog {
  id: string;
  timestamp: string;
  contactId: string;
  userId: string;
  actionType: 'Created' | 'Updated' | 'Archived' | 'Restored' | 'Deleted' | 'Merged' | 'Linked' | 'Unlinked' | 'AIContextQueried';
  details: string;
}

export interface Contact {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  displayName: string;
  company: string; // Master company mapping (links to Customer or other corporate entities)
  department: string;
  designation: string;
  role: ContactRole;
  email: string;
  alternativeEmail?: string;
  phone: string;
  alternativePhone?: string;
  whatsappNumber?: string;
  website?: string;
  linkedIn?: string;
  address: ContactAddress;
  language: string; // e.g., 'English', 'German', 'Spanish'
  timeZone: string; // e.g., 'EST', 'PST', 'UTC', 'CET'
  status: ContactStatus;
  tags: string[];
  notes?: string;
  
  // Linkages to prevent duplication
  customerLinks: string[]; // Linked Customer IDs (e.g. 'cust-jda')
  projectLinks: string[]; // Linked Project IDs (e.g. 'prj-jet-propulsion')
  knowledgeLinks: string[]; // Linked KMS doc IDs (e.g. 'doc-as9100-standards')
  memoryLinks: string[]; // Linked Memory IDs (e.g. 'mem-thrust-hinge-fix')
  
  // Relationships
  managerId?: string; // Links to manager's Contact ID
  assistantId?: string; // Links to assistant's Contact ID
  reportingManagerId?: string; // Links to reporting manager's Contact ID
  workspace: string; // Security and data isolation boundary (e.g., 'engineering', 'business', 'learning', 'admin')

  createdDate: string;
  updatedDate: string;
  archiveStatus: boolean;
  isDeleted: boolean; // Soft delete toggle
  version: number;
  auditMetadata: {
    createdBy: string;
    updatedBy: string;
  };
}

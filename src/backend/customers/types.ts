export type CustomerStatus = 'Active' | 'Inactive' | 'On Hold' | 'Archived';
export type CustomerPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type BusinessType = 'Enterprise' | 'SMB' | 'Government' | 'Academic' | 'Distributor';

export interface CustomerAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface CustomerContact {
  id: string;
  name: string;
  designation: string;
  department: string;
  email: string;
  phone: string;
  isPrimary: boolean;
  notes?: string;
}

export interface Customer {
  id: string;
  companyName: string;
  displayName: string;
  legalName: string;
  customerCode: string;
  industry: string;
  businessType: BusinessType;
  gstNumber?: string;
  taxInformation?: string;
  website: string;
  email: string;
  phone: string;
  billingAddress: CustomerAddress;
  shippingAddress: CustomerAddress;
  contacts: CustomerContact[];
  status: CustomerStatus;
  priority: CustomerPriority;
  tags: string[];
  owner: string;
  workspace: string; // Isolation boundaries
  projects: string[]; // Linked project IDs
  knowledgeLinks: string[]; // Linked KMS doc IDs
  memoryLinks: string[]; // Linked memory logs IDs
  createdDate: string;
  updatedDate: string;
  archiveStatus: boolean;
  isDeleted: boolean; // Soft delete
  version: number;
  auditMetadata: {
    createdBy: string;
    updatedBy: string;
  };
}

export interface CustomerActivityLog {
  id: string;
  timestamp: string;
  customerId: string;
  userId: string;
  actionType:
    | 'Created'
    | 'Updated'
    | 'Archived'
    | 'Restored'
    | 'Deleted'
    | 'ContactAdded'
    | 'ContactRemoved'
    | 'ProjectLinked'
    | 'DocumentLinked'
    | 'MemoryLinked'
    | 'Merged'
    | 'AIContextQueried';
  details: string;
}

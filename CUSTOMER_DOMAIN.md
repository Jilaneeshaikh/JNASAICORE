# JNAS Customer Domain Model Blueprint

This document defines the core structural schema, data invariants, and relational mappings for the unified client records. In the JNAS architecture, there is exactly **one** customer master record referenced across all functional platform services (CRM, Projects, KMS, Memory, and AI Gateways).

---

## 1. Core Structural Interface

The customer record schema is implemented as a strict TypeScript interface in `src/backend/customers/types.ts`:

```typescript
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
```

---

## 2. Invariants & Business Constraints

1. **Identifier Uniqueness**: The `customerCode` (e.g., `CUST-JDA`) and `companyName` must be unique. Attempting to register a duplicate will throw a validation error in the Customer Registry.
2. **Single Primary Contact**: A customer must have at least one contact marked as `isPrimary: true`. When adding a new primary contact, existing representatives are demoted.
3. **Workspace Boundary**: The `workspace` tag defines data isolation rules. An operator cannot bind projects outside their active security clearance boundary.
4. **Soft Deletions Only**: Deletion requests are processed as soft deletes (`isDeleted: true`), preserving historical audit records and project linkages.

---

## 3. Relational Mapping

- **Customer to Projects**: Mapped via `projects` (matching standard JNAS project IDs).
- **Customer to KMS**: Mapped via `knowledgeLinks` (matching standard KMS document IDs).
- **Customer to Memory Logs**: Mapped via `memoryLinks` (matching standard memory vector entries).

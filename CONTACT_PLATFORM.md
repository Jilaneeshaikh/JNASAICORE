# JNAS Enterprise Contact Management Platform
## Master Specifications (v0.3)

The Contact Management Platform (Sprint 18) acts as the unified master records domain for all individuals, suppliers, consultants, external personnel, and partners in the JNAS ecosystem.

---

## 1. Core Architectural Guidelines
In compliance with enterprise data-source mandates, **no duplication of contact profiles** is permitted. A single individual exists exactly once in the registry, but can hold distinct relational links to multiple departments, customers, suppliers, internal teams, or active projects.

### Unified Domain Model
All contacts are defined by the strict `Contact` interface (`/src/backend/contacts/types.ts`):
```typescript
export interface Contact {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  displayName: string;
  email: string;
  phone: string;
  company: string;
  department: string;
  designation: string;
  role: ContactRole;
  status: ContactStatus;
  avatarUrl?: string;
  isFavorite: boolean;
  notes?: string;
  tags: string[];
  language: string;
  timeZone: string;
  workspace: 'personal' | 'engineering' | 'learning' | 'business' | 'admin';
  createdDate: string;
  updatedDate: string;
  version: number;

  // Cross-Module Domain References
  customerLinks: string[];   // Associated Customer IDs (Customer Workspace)
  projectLinks: string[];    // Associated Project IDs (Projects Engine)
  knowledgeLinks: string[];  // Associated KMS Document IDs (Knowledge Engine)
  memoryLinks: string[];     // Associated Memory Block IDs (Memory Engine)
}
```

---

## 2. Singleton Service Registry (`ContactRegistry`)
The backend is governed by the `ContactRegistry` singleton class located in `/src/backend/contacts/registry.ts`.

### Core Capabilities
- **CRUD Operations**: Secure creation, retrieval, updates, and archival/deletion.
- **Relational Links Management**: Utilities to link/unlink project cards and KMS documents.
- **Recents and Favorites**: Cache buffers tracking the last 5 accessed personnel.
- **Merge Engine (Duplicate Profiler)**: Reconciles redundant files into a single master contact. Combines tags, history arrays, and linkages seamlessly.
- **PubSub Event Dispatcher**: Publishes structured events to the central `eventBus`:
  - `contact.created`
  - `contact.updated`
  - `contact.merged`
  - `contact.archived`
  - `contact.restored`

---

## 3. Contact Workspace Directory UI
The interface (created under `/src/pages/ContactsPage.tsx`) implements a Swiss Minimal, high-contrast, master-detail layout:

1. **Analytical Header Hub**: Displays high-level KPIs including:
   - *Total Directory Size*
   - *Active Mapped Partners*
   - *Recent Interactions*
   - *Platform Event Heartbeat*
2. **Search & Filter Panel**: Real-time filtering by role, operational status, query text, and favorites.
3. **Workspace View Tabsheets**:
   - **Overview**: Core profile metrics, tags, metadata, and operational controls.
   - **Projects Mapping**: Real-time visual cards of projects associated with the contact's firm or directly linked.
   - **KMS Document Links**: Interacts directly with the KMS Registry to list and associate documents.
   - **Core Memory Log**: Add preference keys to guide AI operations (Memory Engine).
   - **AI Context Sandbox**: Dynamically compiles the contact's multi-module dataset into a comprehensive XML prompt, ready for evaluation by the JNAS AI Gateway.
   - **Activity History Logs**: Interactive audit trail records.
   - **Workflows & Debug**: PubSub simulator allowing operators to test event-based integrations.
   - **Admin Settings**: Control status adjustments, hard deletions, and execute profile merging of duplicate records.

---

## 4. Platform Integration Touchpoints

### Command Center
Registered palette shortcuts within `AppShell.tsx` and `DSDialog.tsx`:
- `contact-registry` -> Navigates to Contacts Hub
- `create-contact` -> Opens the registration wizard modal
- `search-contact` -> Focuses search filter in real-time

### EventBus Events
Subscribers can listen to changes using the following signature:
```typescript
import { eventBus } from '../core';

eventBus.subscribe('contact.created', (event) => {
  console.log(`New contact profile registered: ${event.payload.displayName}`);
});
```

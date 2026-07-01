# JNAS Document Center — Developer Module Integration Guide

This guide describes how core developers can connect external JNAS modules to the unified Document Center.

## 1. Establishing Linkages

To link a custom object (e.g., a customer, milestone task, or safety course) to a document, use the `linkEntity` API:

```typescript
import { DocumentRegistry } from '../backend/documents/registry';

// Link a newly created contact to an existing quality manual
DocumentRegistry.getInstance().linkEntity(
  "doc-as9100-manual",
  "contact",
  "con-elena-new"
);
```

---

## 2. Dynamic Fetching within Other Modules

Rather than replicating metadata schemas, other pages should dynamically list documents linked to their respective entities.

### Example: Rendering Linked Documents inside the CRM Portal
```typescript
import { useEffect, useState } from 'react';
import { DocumentRegistry } from '../backend/documents/registry';
import { Document } from '../backend/documents/types';

export const CRMProjectDocuments: React.FC<{ customerId: string }> = ({ customerId }) => {
  const [docs, setDocs] = useState<Document[]>([]);

  useEffect(() => {
    // Dynamic query search on customer link indices
    const matched = DocumentRegistry.getInstance().searchDocuments({
      customer: customerId
    });
    setDocs(matched);
  }, [customerId]);

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-mono uppercase text-slate-500">Linked Customer Documents</h3>
      {docs.length === 0 ? (
        <p className="text-xs text-slate-500 italic">No files associated with this client profile.</p>
      ) : (
        docs.map(doc => (
          <div key={doc.id} className="p-2 border border-slate-900 bg-slate-950/40 text-xs rounded">
            <span className="font-semibold text-slate-300">{doc.title}</span>
            <span className="text-[10px] text-slate-500 font-mono block mt-0.5">{doc.displayName}</span>
          </div>
        ))
      )}
    </div>
  );
};
```

---

## 3. Subscribing to Document LifeCycle Events

Platform services can listen to Document events to sync indices, trigger workflows, or update compliance registries:

```typescript
import { eventBus } from '../core';

// Listen to new document creation events across the JNAS EventBus
const sub = eventBus.subscribe('DOCUMENT_CREATED', (event) => {
  const { documentId, log } = event.payload;
  console.log(`Compliance Audit: New document added with ID: ${documentId}. Details: ${log.details}`);
});

// To clean up later
// sub.unsubscribe();
```

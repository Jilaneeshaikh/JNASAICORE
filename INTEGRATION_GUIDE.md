# JNAS Customer Platform Integration Guide

The Customer Registry interacts with core platform modules without duplicating service code.

---

## 1. JNAS Event Bus (`eventBus`)
The Customer Registry publishes state changes using the central event bus:

```typescript
import { eventBus, EventPriority } from '../core';

eventBus.publish('CUSTOMER_CREATED', customer, {
  emitter: 'CustomerRegistry',
  priority: EventPriority.HIGH
});
```

Supported platform hooks:
- `CUSTOMER_CREATED`: Dispatched when a client profile is registered.
- `CUSTOMER_UPDATED`: Dispatched when metadata or linkages change.
- `CUSTOMER_ARCHIVED`: Dispatched when a profile is archived.
- `CUSTOMER_RESTORED`: Dispatched when an archived profile is restored.
- `CUSTOMER_DELETED`: Dispatched when a profile is soft deleted.

---

## 2. Projects Platform (`ProjectRegistry`)
Associated JNAS projects are resolved in real-time by querying the `ProjectRegistry`:

```typescript
const linkedProjects = ProjectRegistry.getInstance()
  .getProjects()
  .filter(p => p.client === customer.companyName || customer.projects.includes(p.id));
```

This prevents database duplication, ensuring project states update automatically.

---

## 3. Knowledge Management System (`KnowledgeRegistry`)
To display contract SLAs or CAD blueprints, the Customer detailed view queries objects from `KnowledgeRegistry`:

```typescript
const linkedDocs = KnowledgeRegistry.getInstance()
  .getObjects()
  .filter(doc => customer.knowledgeLinks.includes(doc.id));
```

Operators can attach standard KMS files directly from the customer workspace.

---

## 4. JNAS AI Provider Gateway (`registry`)
The Co-Pilot compiler retrieves the resolved AI model:

```typescript
import { registry as providerRegistry } from '../registry';

const resolvedProvider = providerRegistry.resolveProvider('gemini');
const result = await resolvedProvider.generate({
  messages: [{ role: 'user', content: compiledRAGPrompt }]
});
```

If the `GEMINI_API_KEY` is missing, the gateway falls back to an offline specialist simulation model, reporting execution latency and parameters correctly.

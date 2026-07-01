# JNAS Engineering Workspace - API & Service Integration Guide

This guide details the underlying TypeScript data services and integration paths supporting the JNAS Engineering Workspace.

---

## 1. State Engine: `EngineeringRegistry`

The central singleton managing all engineering drawings, projects, specifications, favorites, and audit trails is located in `/src/backend/engineering/registry.ts`.

### Interface Signature

```typescript
import { EngineeringRegistry } from '../backend/engineering/registry';

// Retrieve singleton instance
const registry = EngineeringRegistry.getInstance();
```

### Core Service Methods

#### Drawing Retrieval & Mutation
*   `getDrawings(): Drawing[]`: Returns all drawings.
*   `getDrawingById(id: string): Drawing | undefined`: Fetches a single drawing.
*   `createDrawing(drawing: Omit<Drawing, 'id' | 'revision' | 'updatedAt'>): Drawing`: Commits a new drawing to state, generating unique IDs and revision records. Triggers audit ledger event.
*   `updateDrawing(id: string, updates: Partial<Drawing>): Drawing`: Mutates drawing fields. Increments revision number on status transition and logs changes.
*   `deleteDrawing(id: string): void`: Removes drawing. restricted to `Lead Engineer`.

#### Favorites & Auditing
*   `isFavorite(id: string): boolean`: Checks star status.
*   `toggleFavorite(id: string): void`: Swaps star status.
*   `getAuditLogs(): EngineeringAuditLog[]`: Returns historical compliance timeline events.
*   `addAuditLog(action: string, targetId: string, targetType: string, details: string): void`: Appends a new, signed event record.
*   `clearAuditLogs(): void`: Purges entire history.
*   `resetToDefaults(): void`: Restores pristine initial seeds.

---

## 2. Event Bus Subscriptions & Commands

The workspace integrates with the global JNAS Event Bus using `'CMD_ENGINEERING'` channels. This connects terminal commands, workflows, or AI agents to interactive worksheet triggers.

### Dispatch Signature

```typescript
import { eventBus } from '../core';

// Remote transition trigger example
eventBus.publish('CMD_ENGINEERING', { command: 'open-drawing' }, { emitter: 'AppShell' });
```

### Supported Command Set

| Command String | Component Action |
| :--- | :--- |
| `open-engineering-workspace` | Swaps active worksheet view to Dashboard. |
| `open-drawing` | Navigates directly to the Drawings list. |
| `open-engineering-project` | Navigates directly to the Sub-Projects explorer. |
| `search-drawings` | Resets active filter parameters and opens Drawings list. |
| `search-standards` | Navigates directly to the technical Documents view. |
| `recent-drawings` | Swaps view to Dashboard. |
| `engineering-dashboard` | Swaps view to Dashboard. |

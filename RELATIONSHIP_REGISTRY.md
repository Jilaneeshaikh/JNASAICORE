# JNAS Enterprise Relationship Registry Guide
## Schema, Weights, and Bidirectional Traversal Manual
### Document Code: JNAS-DTP-REG-36-B

---

## 1. Registry Data Schema

Every relationship in the JNAS Digital Thread is structured with precise mathematical attributes to ensure reliable recursive traversals without loop degradation.

### 1.1. Core Interface Fields

| Property | Type | Description |
| :--- | :--- | :--- |
| `relationshipId` | `string` | Unique identifier (e.g. `rel-thread-001`). |
| `sourceId` | `string` | Source JNAS Object identifier. |
| `sourceType` | `ThreadObjectType` | Classification of the source record. |
| `targetId` | `string` | Target JNAS Object identifier. |
| `targetType` | `ThreadObjectType` | Classification of the target record. |
| `relationshipType` | `string` | Human-readable lineage label. |
| `direction` | `'bidirectional' \| 'source_to_target' \| 'target_to_source'` | Directionality constraints on traversal. |
| `strength` | `'Strong' \| 'Medium' \| 'Weak'` | Impact weight multiplier used in Risk indices. |
| `status` | `'Active' \| 'Draft' \| 'Deprecated'` | Operational standing. |
| `owner` | `string` | Authorized administrator. |
| `workspace` | `string` | Role-Based Workspace Isolation scope. |
| `createdDate` | `string` | ISO timestamp of link creation. |
| `updatedDate` | `string` | ISO timestamp of last update. |
| `metadata` | `Record<string, string>` | Custom key-values including rationale. |

---

## 2. Supported Connections

The registry seeds and secures the following relationship paths:

- **Customer ──> Project**
- **Project ──> Engineering Asset**
- **Engineering Asset ──> BOM**
- **BOM ──> Packaging Design**
- **Packaging Design ──> Validation**
- **Packaging Design ──> Cost Profile**
- **Packaging Design ──> Logistics Plan**
- **Logistics Plan ──> Returnable Asset**
- **Returnable Asset ──> Inspection**
- **Customer ──> Documents**
- **Project ──> Knowledge**
- **Knowledge ──> Memory**
- **Workflow ──> Activities**
- **AI Session ──> Sources**

---

## 3. Loop Mitigation Strategy

To prevent endless loops in cyclic graphs (e.g., A ──> B ──> C ──> A), JNAS utilizes an internal thread-safe set within its Depth-First Search (`DFS`) solver:

```typescript
const visitedIds = new Set<string>();

const dfs = (currId: string, depth: number) => {
  if (visitedIds.has(currId) || depth > 8) return;
  visitedIds.add(currId);
  // Traverse adjacent nodes...
};
```
This guarantees high-fidelity, high-performance querying in the client canvas layer.

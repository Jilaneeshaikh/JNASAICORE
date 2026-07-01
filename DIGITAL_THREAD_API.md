# JNAS Digital Thread API Reference
## Developer Integration & Future Mesh Protocol
### Document Code: JNAS-DTP-API-36-D

---

## 1. Local JS/TS API

Modules across JNAS query the thread registry using stateful singleton patterns.

### 1.1. Get Node Detail
```typescript
import { threadRegistry } from './src/backend/thread/registry';

const node = threadRegistry.getNode('cust-alpha');
console.log(node);
```

### 1.2. Register a Connection
```typescript
import { threadRegistry } from './src/backend/thread/registry';

const link = threadRegistry.createRelationship({
  sourceId: 'eng-cad-09',
  sourceType: 'EngineeringAsset',
  targetId: 'bom-structural-4',
  targetType: 'BOM',
  relationshipType: 'Engineering Asset -> BOM',
  direction: 'source_to_target',
  strength: 'Strong',
  status: 'Active',
  owner: 'Tony Stark',
  workspace: 'global',
  metadata: { rationale: 'Validated blueprint assembly binding' }
});
```

### 1.3. Execute Trace Solver
```typescript
import { threadRegistry } from './src/backend/thread/registry';

const trace = threadRegistry.performTrace('pkg-design-twilight', 'impact');
console.log(`Risk levels identified across ${trace.maxDepthReached} bounds.`);
```

---

## 2. Future REST Integrations (ERP / MES)

When expanding JNAS to physical cloud systems, these standard endpoint routing structures are pre-mapped:

### 2.1. `POST /api/v1/thread/relationship`
- **Payload**:
  ```json
  {
    "sourceId": "mes-mfg-run-222",
    "sourceType": "ExternalMES",
    "targetId": "ret-rack-82",
    "targetType": "ReturnableAsset",
    "strength": "Strong",
    "rationale": "MES production line allocation"
  }
  ```

### 2.2. `GET /api/v1/thread/trace/:id`
- **Query Params**: `direction=forward|backward|impact`
- **Response**: Trace result containing dependency matrices.

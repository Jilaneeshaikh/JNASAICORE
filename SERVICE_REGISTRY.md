# JNAS Service Registry Platform

The `ServiceRegistry` acts as a central lookup authority to allow core platform services to coordinate with each other without compiling direct, tightly-coupled dependencies.

---

## 1. Architectural Concept

Without a service registry, services import each other directly, leading to circular dependency graphs:

```
[AI Gateway] <───────> [KMS Engine] <───────> [Memory Engine]
```

With the `ServiceRegistry`, services decouple by registering themselves at startup. They reference other engines purely by runtime lookups:

```
                  ┌────────────────────┐
                  │  Service Registry  │
                  └──────────┬─────────┘
          ┌──────────────────┼──────────────────┐
          ▼                  ▼                  ▼
    [AI Gateway]       [KMS Engine]       [Memory Engine]
```

---

## 2. Registering a Service

To participate in the registry, a service must implement the `IService` interface:

```typescript
import { IService, serviceRegistry } from './src/core';

class KnowledgeEngine implements IService {
  public serviceId = 'KnowledgeEngine';

  public async initialize(): Promise<void> {
    console.log('KMS Index seeded and active.');
  }

  public async shutdown(): Promise<void> {
    console.log('KMS Index written to disk.');
  }
}

// Register the service at application bootstrap
const kms = new KnowledgeEngine();
await kms.initialize();
serviceRegistry.register(kms);
```

---

## 3. Resolving a Service

Other services can retrieve reference engines dynamically without direct static imports:

```typescript
import { serviceRegistry } from './src/core';

// Retrieve KMS at runtime
const kms = serviceRegistry.get<KnowledgeEngine>('KnowledgeEngine');
const doc = kms.findDocument('doc_32918');
```

---

## 4. Lifecycle Management

- **Bootstrapping**: The main application server loops through registry components, invoking `.initialize()` sequentially.
- **Graceful Shutdown**: Upon process termination (e.g. SIGTERM signal), the server iterates through all services in reverse registration order, calling `.shutdown()` to commit active states and release open ports cleanly.

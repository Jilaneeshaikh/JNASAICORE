# JNAS Core Event Bus System

The JNAS Core Event Bus provides a robust PubSub interface allowing disconnected platform modules to interact asynchronously.

---

## 1. Core Mechanics

The Event Bus operates entirely on type-safe Event objects containing payload structures and metadata (emitter details, creation timestamps, and tracing identifiers).

```
[Publisher Module] ─(Publish Event)─> [Event Bus] ───> [Subscribers Callback Roster]
                                          │
                                   [History Logs]
```

### Event Interface
```typescript
export interface Event<TPayload = any> {
  type: string;
  metadata: {
    id: string;
    timestamp: string;
    emitter: string;
    priority: EventPriority;
    traceId?: string;
  };
  payload: TPayload;
}
```

---

## 2. Usage Guide

### Publishing an Event
Any service can dispatch an event dynamically:
```typescript
import { eventBus, EventPriority } from './src/core';

await eventBus.publish('CUSTOMER_CREATED', {
  id: 'cust_8293',
  name: 'Acme Corp',
  manager: 'Elena Rostova'
}, {
  emitter: 'CustomerRegistry',
  priority: EventPriority.HIGH
});
```

### Subscribing to Events
To react to specific operations:
```typescript
import { eventBus } from './src/core';

const subscription = eventBus.subscribe('CUSTOMER_CREATED', (event) => {
  console.log(`Processing customer: ${event.payload.name}`);
});

// To unsubscribe later:
subscription.unsubscribe();
```

---

## 3. Reliability and Fault Tolerance

- **Retry Policies**: If a subscriber callback throws an error, the Event Bus triggers exponential backoff (up to 3 automatic attempts) to resolve temporary disruptions.
- **Subscriber Isolation**: An uncaught error inside one subscriber's execution callback will never prevent other registered subscribers from receiving the same event.
- **Memory History Guard**: Keeps a rotating chronological list of the last 250 triggered events to prevent heap memory exhaustion while assisting with tracing and audit logs.

# JNAS Customer Registry API Reference

The `CustomerRegistry` singleton is the programmatic master interface managing client profiles, contact histories, and integrations with core platform modules.

---

## 1. Registry Lifecycle Methods

To fetch the singleton instance, run:
```typescript
import { CustomerRegistry } from './src/backend/customers/registry';
const registry = CustomerRegistry.getInstance();
```

### `createCustomer(payload: Omit<Customer, 'id' | ...>)`
Registers a new customer. Automatically performs duplicate checks against company names and codes. Emits a `CUSTOMER_CREATED` event on the Event Bus.

### `getCustomers(includeDeleted?: boolean)`
Retrieves all customer records. Excludes soft-deleted profiles by default.

### `getCustomerById(id: string)`
Queries the registry for a specific customer. Returns `undefined` if deleted or inactive.

### `updateCustomer(id: string, updates: Partial<Customer>)`
Updates profile metadata. Version tags are incremented (`version = version + 1`) and a `CUSTOMER_UPDATED` event is dispatched.

### `deleteCustomer(id: string)`
Soft deletes a customer record, removing it from active queries while retaining audits.

---

## 2. Advanced Operations

### `mergeCustomers(sourceId: string, targetId: string)`
Merges two customer accounts.
- **Actions**:
  - Unifies associated projects, tags, documents (KMS), and preferences (Memory Engine).
  - Appends contact representatives safely.
  - Soft deletes the `sourceId` profile and appends a `Merged` activity log entry.
  - Emits `CUSTOMER_DELETED` for the source and `CUSTOMER_UPDATED` for the target.

### `toggleFavorite(id: string)`
Toggles the favorite state of a client account. Returns the new favorite status (boolean).

### `trackRecentView(id: string)`
Pushes a customer ID to a recently consulted stack, automatically pruning items beyond a size of 10. Used for dashboard widgets.

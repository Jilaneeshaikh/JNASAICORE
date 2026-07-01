# Validation Service API Reference

The validation engine operations are exposed through the central `PackagingRegistry` service.

## Core API Endpoints & Service Methods

### `getRules(): ValidationRule[]`
Returns an array of all active and registered validation rules in the system.

### `getRuleById(id: string): ValidationRule | undefined`
Retrieves a specific validation rule by its database ID.

### `createRule(rule: Omit<ValidationRule, 'id' | 'createdAt' | 'updatedAt'>): ValidationRule`
Creates and registers a new engineering rule. Publishes `Rule Created` activity events to the workspace ledger and registers an audit log.

### `updateRule(id: string, updates: Partial<ValidationRule>): ValidationRule`
Modifies an existing rule's properties. Generates modification logs and dispatches system notifications.

### `deleteRule(id: string): void`
Retires a rule from active evaluations and registers compliance archival trails.

### `executeValidation(designId: string): ValidationRun`
Runs the deterministic rules engine suite on a targeted physical packaging design layout.
*   **Calculations**: Evaluates linked component BOM parts, weights, category codes, and static material specifications.
*   **Event Pipeline**: Dispatches `Validation Executed`, `Validation Passed`, or `Validation Failed` events based on results.
*   **Audit Trail**: Logs transaction metadata under design activity sheets.

### `getValidationRuns(): ValidationRun[]`
Retrieves history log list of executed validation sessions.

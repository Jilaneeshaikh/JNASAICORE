# JNAS Error Handling & Resilience Guide

The JNAS Error Platform provides a uniform structure to categorize, process, and gracefully recover from execution anomalies.

---

## 1. The `AppError` Base Class

Every error thrown across the JNAS platform must extend the base `AppError` class. This guarantees that all exceptions contain necessary diagnostic telemetry.

### Error Structure:
- **`code`**: Upper-case, alphanumeric unique identifier (e.g. `ERR_VALIDATION_FAILED`).
- **`message`**: Readable explanation detailing the issue.
- **`severity`**: Diagnostic priority level (`LOW`, `MEDIUM`, `HIGH`, or `CRITICAL`).
- **`recoveryStrategy`**: Direct instructions advising the system or user how to resolve the anomaly.
- **`timestamp`**: Time when the exception was instantiated.
- **`context`**: Object dictionary containing related parameters (IDs, IP, user email, payload snapshot).

---

## 2. Specialized Subclasses

| Exception Subclass | Error Code | Default Severity | Default Recovery Strategy |
| :--- | :--- | :--- | :--- |
| `ValidationError` | `ERR_VALIDATION_FAILED` | `LOW` | Verify input format and re-submit. |
| `AuthenticationError`| `ERR_AUTHENTICATION_FAILED` | `HIGH` | Clear cache, verify session credentials, and log in again. |
| `AIError` | `ERR_AI_OPERATION_FAILED` | `HIGH` | Check API parameters or prompt length and try again. |
| `ProviderError` | `ERR_PROVIDER_UNAVAILABLE` | `CRITICAL` | Check API key configuration, quotas, and third-party status. |
| `WorkflowError` | `ERR_WORKFLOW_ABORTED` | `MEDIUM` | Inspect active step status, trace workflow dependencies, or rerun state transition. |
| `KnowledgeError` | `ERR_KNOWLEDGE_NOT_FOUND` | `LOW` | Verify document references or query string. |
| `SearchError` | `ERR_SEARCH_INDEX_STALE` | `LOW` | Trigger re-index of documents or try simplified search term. |
| `ConfigurationError` | `ERR_INVALID_CONFIGURATION` | `CRITICAL` | Ensure .env variables match .env.example definitions. |
| `NetworkError` | `ERR_NETWORK_DISRUPTED` | `HIGH` | Verify client connection or backend ingress connectivity. |

---

## 3. Best Practices for Developers

### Throwing standard exceptions
```typescript
import { ValidationError } from './src/core';

if (!customerName) {
  throw new ValidationError('Customer name cannot be empty', { field: 'customerName' });
}
```

### Catching and processing errors
```typescript
import { AppError, loggers } from './src/core';

try {
  await dispatchAiRequest();
} catch (err) {
  if (err instanceof AppError) {
    loggers.ai.error(`Operation failed with code: ${err.code}`, err, { strategy: err.recoveryStrategy });
    showNotification(err.message, err.recoveryStrategy);
  } else {
    // Unexpected error fallback
    loggers.app.error('An unexpected runtime crash occurred', err as Error);
  }
}
```

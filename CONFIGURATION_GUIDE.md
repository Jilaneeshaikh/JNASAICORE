# JNAS Centralized Configuration Guide

All environment, database, and system variables inside the JNAS platform are loaded, verified, and exposed by the unified Configuration service.

---

## 1. Directory Structure

```
src/core/config/index.ts  <-- The single source of configuration truth
```

All other files **must** read properties through this module. Direct execution of `process.env.SOME_VAR` outside of the configuration layer is **strictly prohibited**.

---

## 2. Configuration Settings Schema

The configuration payload is partitioned into isolated system scopes:

- **`app`**: Generic application name, active version, environment, and debug flags.
- **`env`**: Low-level environment metrics like server ports, hosting addresses, and Node environment parameters.
- **`firebase`**: Firebase project IDs, API Keys, databases URLs, and authentication realms.
- **`gemini`**: Parameters controlling Google Gemini integration, default models, temperature defaults, and safety thresholds.
- **`providers`**: List of enabled model vendors (Gemini, local mock sandbox).
- **`featureFlags`**: System-wide feature gates (enableWorkflowEngine, enableRAG, etc.).
- **`security`**: Configuration for CORS origins, JWT expiration timelines, and rate limiters.
- **`deployment`**: Hosting platform definitions (Cloud Run, Kubernetes, or Local).

---

## 3. Basic Code Example

To utilize configuration settings anywhere in the application code:

```typescript
import { config } from './src/core';

// Check if a feature is enabled
if (config.featureFlags.enableWorkflowEngine) {
  console.log('Booting workflow pipeline...');
}

// Fetch Gemini settings
const modelName = config.gemini.defaultModel;
const maxTokens = config.gemini.defaultMaxTokens;
```

---

## 4. Multi-Environment Support

The configuration layer detects whether it is running on a Node.js container (e.g. Cloud Run) or a browser framework (e.g. Vite SPA) and automatically adjusts its resolution hierarchy to look up either standard Node environment variables or Vite client-side variables prefixed with `VITE_`.

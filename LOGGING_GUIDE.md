# JNAS Logging Platform Guide

JNAS AI Core incorporates a structured logging layer to trace system state, track metrics, and diagnose disruptions across multiple systems cleanly.

---

## 1. Domain-Specific Loggers

We avoid mixing logs in a single generic output stream by exposing domain-specific specialized loggers matching key platform systems:

| Logger | System Target | Use Cases |
| :--- | :--- | :--- |
| `loggers.app` | Core Application | Startup, general events, lifecycle states |
| `loggers.ai` | AI-Gateway Service | LLM requests, token usage, latency, API status |
| `loggers.auth` | Authentication Checks | Logins, workspace permission updates |
| `loggers.workflow` | Active Pipelines | Pipeline step transitions, automation triggers |
| `loggers.knowledge` | KMS / Documents | File uploads, vector lookups, document index states |
| `loggers.memory` | Memory Engine | Ephemeral context reads, recall state triggers |
| `loggers.search` | Universal Search | Search terms, search latency, index refreshes |
| `loggers.security` | Access Auditing | Rate limit alerts, authorization breaches |
| `loggers.audit` | Compliance Trail | Project creation, workspace deletes, role changes |
| `loggers.performance`| Engine Metrics | Request processing times, memory metrics |

---

## 2. Using the Logger Interface

All loggers adhere strictly to the type-safe `ILogger` interface supporting levels: `debug`, `info`, `warn`, `error`, and `fatal`.

```typescript
import { loggers } from './src/core';

// Information logs with context
loggers.ai.info('Sending generation prompt to Gemini Pro API', {
  model: 'gemini-1.5-flash',
  temperature: 0.7,
});

// Warning logs
loggers.security.warn('Rapid customer registry lookup detected', { ip: '10.0.4.15' });

// Exception tracking
try {
  throw new Error('API key has expired or is invalid.');
} catch (err: any) {
  loggers.ai.error('Gemini connection failed.', err, { code: 'ERR_KEY_EXPIRED' });
}
```

---

## 3. Production Readiness

In development mode, logs print readable ANSI-colored styles with embedded JS objects. In production, logs output structured JSON formats, optimized for ingestion by cloud logging engines (like Google Cloud Logging, Datadog, or Elasticsearch).

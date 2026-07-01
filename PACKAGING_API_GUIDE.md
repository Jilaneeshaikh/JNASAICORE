# JNAS Packaging API Reference Guide

The core state of the Packaging module is controlled by the `PackagingRegistry` singleton.

## Service Registry Endpoint
- **Import Statement**: `import { packagingRegistry } from './src/backend/packaging/registry';`
- **Instantiation Pattern**: Standard `IService` registered under the main enterprise Service Registry.

## Key APIs
- `getProjects()`: Returns all active structural shipping container specifications.
- `createProject(data)`: Spawns a new container specification, increments serial index, and publishes `ACTIVITY_CREATED` events.
- `updateProject(id, data)`: Modifies dimensional and dunnage specs, and updates audit files.
- `createRevision(id, notes)`: Standard R+1 lineage promoter that locks past designs and opens new review drafts.
- `addMaterial(data)`: Registers custom cushioning compounds in the master list.
- `getAuditLogs()`: Fetches compliance logs.

## Event Bus Pub/Sub Topics
The service publishes the following events under the unified JNAS Event Bus:
- `ACTIVITY_CREATED` (for creating, updating, and approving project sheets).
- Listens for `CMD_PACKAGING` events broadcast from the global Command Palette.

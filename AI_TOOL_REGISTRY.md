# AI Tool Registry

## Registered Tools
The Enterprise Co-pilot has access to several functional, server-executable tools:

### 1. Materials Search Tool
- **Identifier**: `search_materials`
- **Arguments**: `query: string, category?: string`
- **Execution**: Queries the platform's material database for matches and returns properties.

### 2. Physical Weight/Volume Calculator
- **Identifier**: `calculate_load`
- **Arguments**: `length: number, width: number, height: number, materialCode: string`
- **Execution**: Performs structural load, density, and volume-capacity calculations.

### 3. Compliance Standard Lookups
- **Identifier**: `lookup_standards`
- **Arguments**: `code: string`
- **Execution**: Searches and retrieves detailed rules and clauses from registered ASTM/ISO/ISTA documents.

# Enterprise Packaging AI Assistant

## Overview
The Enterprise Packaging AI Assistant is a specialized, context-aware co-pilot designed for packaging engineers. It operates as a mechanical and materials engineering specialist, assisting with package safety, dimensional compliance, material selection, standard alignment, and rule-based validations. It is built to leverage real platform metadata in real-time, completely bypassing standard chat boundaries.

## Core Directives
1. **Never Hallucinate Specs**: Responses are grounded in physical parameters from the `Context Builder`.
2. **Contextual Integration**: Integrates directly with active designs, materials registry, and validation runs.
3. **ASTM/ISO Standard Compliance**: Evaluates answers against verified standards (e.g., ASTM D6199, ISTA 3A).
4. **Interactive Validation**: Executes rules engine runs to verify design revisions directly through conversational prompts.

## Key Subsystems
- **Context Builder**: Gathers and maps real-time database contexts.
- **Prompt Composer**: Builds layered, structured prompts (system, workspace, module, context, user).
- **Tool Registry**: Operates tools like Search, Calculator, and Materials databases.
- **Response Inspector**: Audits safety compliance, confidence scores, and token counts.

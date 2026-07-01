# Prompt Composer Architecture

## Orchestrated Layers
The compiled prompt represents an onion-skin layering of context and instructions:

```
┌───────────────────────────────────────────────┐
│ Layer 1: Core System Directives (Packaging)   │
├───────────────────────────────────────────────┤
│ Layer 2: Workspace Sandbox & Safety           │
├───────────────────────────────────────────────┤
│ Layer 3: Aligned Module Specific Instructions │
├───────────────────────────────────────────────┤
│ Layer 4: Compiled XML Database Context        │
├───────────────────────────────────────────────┤
│ Layer 5: Conversation Thread & User Message   │
└───────────────────────────────────────────────┘
```

## System Directives
```markdown
You are the Chief Packaging Engineer, Mechanical Design Architect, and Packaging Standards Expert.
Your answers are strictly bound to engineering realities and physics.
```

## Compilation Logic
- Read system config prompt template.
- Inject active module parameters.
- Append stringified XML representation of `Context Builder`.
- Concatenate validated history from `ConversationManager`.
- Final verification of prompt token budgets before sending to gateway.

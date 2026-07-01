# Context Builder Specs

## Purpose
The Context Builder (`src/backend/ai/contextBuilder.ts`) compiles active session entities, customer profiles, project constraints, CAD model statuses, and materials definitions into an organized, structured XML block that can be safely read and parsed by the Gemini model.

## Context XML Schemas
The context compiles into the following XML tags:
```xml
<context>
  <user>
    <role>Packaging Engineer</role>
    <department>Industrial Packaging</department>
  </user>
  <active_project>
    <id>pkg-proj-01</id>
    <name>Avionics Cradle Box</name>
    <dimensions_outer>L: 1200, W: 800, H: 1000 mm</dimensions_outer>
    <capacity>150 kg</capacity>
    <dunnage>EVA-FOAM-45, Antistatic: COMPLIANT</dunnage>
  </active_project>
  <materials_registry>
    <material>
      <code>EVA-FOAM-45</code>
      <name>High Density EVA Foam</name>
      <density>45 kg/m³</density>
    </material>
  </materials_registry>
</context>
```

## Gather Routine
1. Scans memory registers and local session states.
2. Identifies selected customer, project, drawing, or design IDs.
3. Queries registries to populate the exact database states.
4. Wraps in XML blocks for high-token precision extraction.

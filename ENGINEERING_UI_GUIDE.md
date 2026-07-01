# JNAS Engineering Workspace - UI & Component Guide

The JNAS Engineering Workspace uses high-contrast, modern layout elements that provide an elegant, professional user experience.

---

## 1. Design Tokens & Styling Tokens

Styling is built with **Tailwind CSS**.
*   **Background Canvas**: Primary containers use `#0C111E` with subtle slate borders `#152033` to give an elegant feeling.
*   **Nested Elements**: Nested item cards use `#080B13` to establish deep contrast.
*   **Typography**: Displays paired with "Inter" for UI controls and "JetBrains Mono" for part IDs, serial codes, and status markers.
*   **Color Meanings**:
    *   `Cyan` (`text-cyan-400`): Active targets, system markers, CAD-related metadata.
    *   `Emerald` (`text-emerald-400`): Approved status, released designs, active milestones.
    *   `Amber` (`text-amber-400`): Pending reviews, warning flags, on-hold tasks.
    *   `Rose` (`text-rose-400`): Rejected status, deleted trails, system resets.

---

## 2. Component Composition Tree

The page hierarchy in `/src/pages/EngineeringPage.tsx` manages layout coordination:

```
┌────────────────────────────────────────────────────────┐
│                   EngineeringPage                      │
├────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────┐ │
│ │                  EngineeringHeader                 │ │
│ └────────────────────────────────────────────────────┘ │
│ ┌──────────────────────┐ ┌───────────────────────────┐ │
│ │  EngineeringSidebar  │ │   [Dynamic Viewsheets]    │ │
│ │                      │ │                           │ │
│ │ * Dashboard          │ │ * EngineeringDashboard    │ │
│ │ * Drawings           │ │ * DrawingList             │ │
│ │ * Projects           │ │ * ProjectExplorer         │ │
│ │ * Documents          │ │ * Technical Specifications│ │
│ │ * Compliance Ledger  │ │ * EngineeringTimeline     │ │
│ │ * Settings           │ │                           │ │
│ └──────────────────────┘ └───────────────────────────┘ │
└────────────────────────────────────────────────────────┘
```

---

## 3. Interactive Modal Drawers & Details

### Revision Explorer
*   Accessible by clicking any drawing row in the Drawing Registry.
*   Shows a visual list of previous drawing revisions.
*   Allows designers to view changes and review notes.

### Bill of Materials (BOM) Explorer
*   Details mechanical raw materials, quantities, sourcing channels, and estimated cost figures.
*   Color-coded badges reflect subcontractor classifications.

### Drawing Creation Drawer
*   Provides a simple wizard form.
*   Integrates validation: requires precise title definitions, standard codes, and parent project associations.

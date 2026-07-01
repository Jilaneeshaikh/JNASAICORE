# JNAS Engineering Dashboard

The **Engineering Dashboard** is the landing worksheet of the workspace. It functions as a high-density dashboard showing critical status counts, recent modifications, pending QA clearances, and active drawing contexts.

---

## 1. Metric Telemetry (KPI Blocks)

At the top of the worksheet, four responsive KPI badges summarize real-time ledger states:
*   **Total Blueprints**: Sum of all recorded drawings across the active department tenant.
*   **Released Systems**: Active drawings currently deployed to physical assembly pipelines.
*   **QA Pending Audit**: Total number of drawings waiting for physical review or approval.
*   **Active Isolation Block**: Displays your active role profile (`Lead Engineer`, `CAD Designer`, `QA Inspector`) and isolated department tenant.

---

## 2. Dynamic Target Workspace Panel

A core feature of the workspace is the **Active CAD Workspace Target**.
*   Selecting a drawing or project anywhere in the workspace establishes a **centralized system target**.
*   This target is serialized directly to local storage cache (`jnas-active-drawing-id`).
*   **Centralized Prompt Builder Integration**: The active target is automatically detected and injected into prompt builders, so when you consult the platform's AI, it immediately understands which drawing number, revision, and technical standard you are currently inspecting without manual copy-pasting.

---

## 3. High-Density Bento Widgets

The page uses a three-column grid to maximize visible telemetry on desktop monitors:

### Pending QA Compliance Reviews (Left Column)
*   Lists all drawings currently in a `Pending` or `In Review` state.
*   If the user has `Lead Engineer` or `QA Inspector` permissions, they can approve or reject drawing records directly from the dashboard card.

### Saved Blueprints / Favorites (Right Column)
*   Quick bookmark list enabling one-click focus target swaps.
*   Synchronizes with starred drawings in the Drawings Registry.

### Recent Modifications (Right Column)
*   Sorted timeline showing the last four drawings updated in the workspace.
*   Includes shortcuts to the full compliance audit log trail.

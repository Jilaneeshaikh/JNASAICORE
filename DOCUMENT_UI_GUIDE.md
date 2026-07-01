# JNAS Document Center — UI & UX Component Guide

The JNAS Document Center is built on the **JNAS Swiss Minimal Design System** guidelines. It stresses typography hierarchy, high contrast, clean cyberpunk grid lines, and responsive layouts.

## 1. Primary Components

*   **Logical Directories (Sidebar Rail)**: Displays virtual folder trees (Workspace, Customers, Projects, Engineering, Favorites, Archive) using lightweight `Folder`, `HardDrive`, or `Calendar` icons.
*   **Search and Filter Drawer**: An expandable multi-faceted widget to prune active files instantly using types, categories, statuses, and security clearance.
*   **Grid vs. List View Toggles**:
    *   **List View**: Best for detailed ledger views with file paths, sizes, versions, and direct action icons (Star, Download).
    *   **Grid View**: Clean card layouts displaying titles, file extensions, and descriptions.
*   **Inspector Workspace Drawer**: A multi-tab inspector showing comprehensive file data:
    *   **Overview**: Essential details (Owner, size, MD5 checksum, file path).
    *   **Meta**: Department ownership, revisions, and approval status.
    *   **Links**: Dynamic link tags with click-to-delete association toggles.
    *   **Audit Logs**: Detailed event timelines.
    *   **AI Context**: High-fidelity XML copy sandbox.

---

## 2. Interactive Dialog Modals

The Document Center includes several action-driven modal forms:
1.  **Logical Upload Form**: Contains full drag-and-drop boundary validation, mime-type deduction, and custom properties mapping.
2.  **Metadata Revision Modal**: Prompts administrators to advance file revisions and modify keywords.
3.  **Relinking Modal**: Uses conditional dropdown select grids to associate files to active Projects, Client Accounts, KMS articles, or Contact personnel.

# JNAS Packaging UI Component Guide

The user interface is designed using **Tailwind CSS** with high contrast slate typography and dark borders.

## Component Architecture
- `PackagingPage`: Master view controller that hosts the sidebar and binds standard event-bus listeners.
- `PackagingSidebar`: Standard vertical directory menu.
- `PackagingHeader`: Holds search fields, faceted category filters, active CAD target indicators, and profile selectors.
- `PackagingDashboard`: High-density bento grid widgets.
- `PackagingProjectCard`: Dynamic card rendering dimensions and dunnage specs.
- `PackagingWorkspace`: The central hub holding search results, creation modals, compound wizards, and the audit logs spreadsheet.

## User Interactions
- **Context Synchronization**: Clicking "Synchronize Prompt Context" in any project card locks its drawings to the central prompt builder, allowing the integrated AI Workspace to auto-suggest custom transit safety plans.
- **Wizard Modal Forms**: Create specifications or register materials securely with instant input validations.

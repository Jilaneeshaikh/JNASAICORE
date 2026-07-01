# Validation Cockpit User Interface Guide

The compliance interface is styled using tailwind with dark high-contrast themes.

## UI Module Structure

The view is separated into two primary interactive sections:

### 1. Interactive Validation Engine Workspace (`runs`)
*   **Design Selector Dropdown**: Mounts any packaging design specification registered in the platform database.
*   **Run Trigger Button**: Triggers the rules engine program. Features animated physical stress calculation status indicator.
*   **Faceted Checklist Cards**: Renders status results (Passed, Warning, Failed, Skipped) alongside rule codes, detailed explanations, and linked industrial references.
*   **Export to AI Link**: Press to serialise the evaluation dataset directly into the AI assistant prompt context for instant workspace chat.
*   **Historical Audit Panel**: Lists past validation run history logs with color-coded badges to easily spot failure trends.

### 2. Engineering Rules Registry (`registry`)
*   **Rules Grid Cards**: Displays active guidelines containing rule numbers, owner contacts, departments, and active standards reference codes.
*   **Rule Creation Modal**: Form controls allowing managers to easily register custom business safety regulations.
*   **Rule Retirement Control**: Lets administrators archive outdated compliance items with single click.

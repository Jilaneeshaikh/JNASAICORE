# JNAS Customer Registry UI Guide

This guide details the JNAS Customer Registry Hub dashboard interface.

---

## 1. Top-Level Metric Panels
- **Total Registers**: Displays the total number of non-deleted customer profiles.
- **Active Workspace**: Quantifies clients currently in an `Active` operational state.
- **High/Critical SLA**: Tallies clients flagged as high-priority, alerting operations of critical obligations.
- **Corporate Favorites**: List size of favorites.

---

## 2. Master-Detail Dashboard
The interface uses a split-screen design:
- **Left Panel (Master List)**:
  - Supports query searches by Company Name, Customer Code, Owner, and Tags.
  - Dropdown filters for Status, Priority, and Industry Verticals.
  - Quick Toggle to show "Favorites Only" or review "Recently Consulted" files.
- **Right Panel (Detailed Client Workspace)**:
  - Renders a multi-tab workspace dedicated to the selected client:
    - **Overview**: Core legal directories, websites, billing/shipping depot locations, and tax attributes.
    - **Projects**: Lists linked active, paused, or at-risk projects from the central JNAS Projects registry with real-time status.
    - **Contacts**: Manages representative contacts, allowing engineers to add new department leads and designate a primary contact.
    - **Documents (KMS)**: Lists linked Standard Operating Procedures, Contracts, and SLAs. Allows linking new documents.
    - **Memories**: Commits client choices and operational constraints to the JNAS Memory Engine database.
    - **AI Co-Pilot**: An interactive sandbox compiling prompts (Profile, Milestones, KMS Docs, and Preferences) to evaluate client statuses using Gemini.
    - **Timeline**: A clean chronological event board capturing registration logs and operator dispatches.
    - **Settings**: Houses system event simulator actions, profile status adjustments, and soft delete controls.

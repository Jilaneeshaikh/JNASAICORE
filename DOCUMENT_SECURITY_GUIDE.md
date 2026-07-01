# JNAS Document Center — Security & Audit Guide

Information security and compliance audit trails are critical components of the JNAS Enterprise Document platform.

## 1. Confidentiality Classifications

Every document registered must carry a clearance level:

*   **Secret**: Top-clearance parameters (e.g., active SLAs, core financial ledgers).
*   **StrictlyConfidential**: Restricted to specific department leads (e.g., Titanium nozzle STEP coordinates).
*   **Confidential**: Accessible only to registered personnel associated with the project or client.
*   **Internal**: Default level. Accessible to all authenticated corporate employees.
*   **Unclassified**: Public domain assets (e.g., safety training guides).

---

## 2. Event-Driven Audit Engine

Every major lifecycle action publishes onto JNAS EventBus and writes to a central chronological ledger:

*   **DOCUMENT_CREATED**: Fires when a document is first added.
*   **DOCUMENT_UPDATED**: Fires on metadata changes, bumping the document's version number.
*   **DOCUMENT_ARCHIVED**: Fires when a file is marked read-only.
*   **DOCUMENT_DELETED**: Triggers a soft delete (moving the document to the recycle bin).
*   **DOCUMENT_RESTORED**: Triggers a recovery of a soft-deleted file.
*   **DOCUMENT_LINKED**: Triggers when a link relationship with an external entity is established.
*   **DOCUMENT_VIEWED**: Logged when the document is selected or opened.
*   **DOCUMENT_DOWNLOADED**: Logged when a user pulls the physical raw payload stream.

---

## 3. Safe Soft-Delete Policies

*   Users are prevented from permanently deleting records. The default `Trash` action simply activates `softDelete: true`.
*   Soft-deleted files are automatically hidden from all primary logical folders and search queries.
*   Only designated Administrators or Archivists have access to the `Archive & Trash` workspace, from which they can either **Restore** the file to active service or **Hard Purge** (physically wipe from registry memory).

import { Contact, ContactActivityLog, ContactStatus, ContactRole } from './types';
import { eventBus, loggers, serviceRegistry, IService, EventPriority } from '../../core';

export class ContactRegistry implements IService {
  private static instance: ContactRegistry;
  public serviceId = 'ContactRegistry';

  private contacts: Map<string, Contact> = new Map();
  private activityLogs: ContactActivityLog[] = [];
  private favoriteIds: Set<string> = new Set();
  private recentIds: string[] = [];
  private maxRecentCount = 10;

  private constructor() {}

  public static getInstance(): ContactRegistry {
    if (!this.instance) {
      this.instance = new ContactRegistry();
      // Register with the Core Service Registry
      serviceRegistry.register(this.instance);
    }
    return this.instance;
  }

  public async initialize(): Promise<void> {
    loggers.app.info('Contact Registry Service initializing...');
  }

  public async shutdown(): Promise<void> {
    loggers.app.info('Contact Registry Service shutting down...');
  }

  private generateId(): string {
    return 'con-' + Math.random().toString(36).substring(2, 11);
  }

  public logActivity(contactId: string, actionType: ContactActivityLog['actionType'], details: string) {
    const log: ContactActivityLog = {
      id: 'conlog-' + Math.random().toString(36).substring(2, 11),
      timestamp: new Date().toISOString(),
      contactId,
      userId: 'usr-operator', // standard sandbox operator
      actionType,
      details,
    };
    this.activityLogs.unshift(log);
    loggers.audit.info(`Contact Registry Log: [${actionType}] on ${contactId}: ${details}`);
  }

  // ============================================================================
  // Core Contact Registry APIs
  // ============================================================================

  public createContact(payload: Omit<Contact, 'id' | 'createdDate' | 'updatedDate' | 'version' | 'isDeleted'>): Contact {
    // Basic Duplicate Check
    const emailExists = Array.from(this.contacts.values()).some(
      (c) => !c.isDeleted && c.email.toLowerCase() === payload.email.toLowerCase()
    );
    if (emailExists) {
      throw new Error(`A contact with the email "${payload.email}" already exists in the registry.`);
    }

    const timestamp = new Date().toISOString();
    const contact: Contact = {
      ...payload,
      id: this.generateId(),
      createdDate: timestamp,
      updatedDate: timestamp,
      version: 1,
      isDeleted: false,
    };

    this.contacts.set(contact.id, contact);
    this.logActivity(contact.id, 'Created', `Registered enterprise contact: ${contact.displayName} (${contact.company})`);

    // Publish to System Event Bus
    eventBus.publish('CONTACT_CREATED', contact, {
      emitter: 'ContactRegistry',
      priority: EventPriority.HIGH,
    });

    return contact;
  }

  public getContacts(includeDeleted = false): Contact[] {
    return Array.from(this.contacts.values())
      .filter((c) => includeDeleted || !c.isDeleted)
      .sort((a, b) => b.createdDate.localeCompare(a.createdDate));
  }

  public getContactById(id: string): Contact | undefined {
    const contact = this.contacts.get(id);
    if (contact && !contact.isDeleted) {
      return contact;
    }
    return undefined;
  }

  public updateContact(id: string, updates: Partial<Contact>): Contact {
    const contact = this.contacts.get(id);
    if (!contact || contact.isDeleted) {
      throw new Error(`Contact with ID "${id}" does not exist or has been deleted.`);
    }

    // Email duplicate check
    if (updates.email && updates.email.toLowerCase() !== contact.email.toLowerCase()) {
      const emailExists = Array.from(this.contacts.values()).some(
        (c) => c.id !== id && !c.isDeleted && c.email.toLowerCase() === updates.email!.toLowerCase()
      );
      if (emailExists) {
        throw new Error(`Another contact with email "${updates.email}" already exists.`);
      }
    }

    const timestamp = new Date().toISOString();
    const updatedContact: Contact = {
      ...contact,
      ...updates,
      updatedDate: timestamp,
      version: contact.version + 1,
      auditMetadata: {
        ...contact.auditMetadata,
        updatedBy: 'usr-operator',
      },
    };

    this.contacts.set(id, updatedContact);
    this.logActivity(id, 'Updated', `Contact profile updated. Version advanced to v${updatedContact.version}`);

    // Publish to System Event Bus
    eventBus.publish('CONTACT_UPDATED', updatedContact, {
      emitter: 'ContactRegistry',
      priority: EventPriority.NORMAL,
    });

    return updatedContact;
  }

  public archiveContact(id: string): Contact {
    const contact = this.getContactById(id);
    if (!contact) throw new Error(`Contact with ID "${id}" not found.`);

    const updated = this.updateContact(id, {
      status: 'Archived',
      archiveStatus: true,
    });

    this.logActivity(id, 'Archived', 'Contact marked as archived.');
    eventBus.publish('CONTACT_ARCHIVED', updated, { emitter: 'ContactRegistry' });

    return updated;
  }

  public restoreContact(id: string): Contact {
    const contact = this.contacts.get(id);
    if (!contact || contact.isDeleted) throw new Error(`Contact with ID "${id}" not found.`);

    const updated = this.updateContact(id, {
      status: 'Active',
      archiveStatus: false,
    });

    this.logActivity(id, 'Restored', 'Contact profile reactivated.');
    eventBus.publish('CONTACT_RESTORED', updated, { emitter: 'ContactRegistry' });

    return updated;
  }

  public deleteContact(id: string): boolean {
    const contact = this.contacts.get(id);
    if (!contact || contact.isDeleted) return false;

    contact.isDeleted = true;
    contact.updatedDate = new Date().toISOString();
    this.contacts.set(id, contact);

    this.logActivity(id, 'Deleted', 'Contact record soft deleted from registries.');
    
    eventBus.publish('CONTACT_DELETED', contact, {
      emitter: 'ContactRegistry',
      priority: EventPriority.HIGH,
    });

    return true;
  }

  public mergeContacts(sourceId: string, targetId: string): Contact {
    const source = this.getContactById(sourceId);
    const target = this.getContactById(targetId);

    if (!source || !target) {
      throw new Error('Both source and target contacts must exist and be active to merge.');
    }

    loggers.app.info(`Merging contact ${sourceId} into ${targetId}`);

    // Combine distinct listings
    const combinedCustomers = Array.from(new Set([...target.customerLinks, ...source.customerLinks]));
    const combinedProjects = Array.from(new Set([...target.projectLinks, ...source.projectLinks]));
    const combinedKnowledge = Array.from(new Set([...target.knowledgeLinks, ...source.knowledgeLinks]));
    const combinedMemories = Array.from(new Set([...target.memoryLinks, ...source.memoryLinks]));
    const combinedTags = Array.from(new Set([...target.tags, ...source.tags]));

    // Update target contact
    const updatedTarget = this.updateContact(targetId, {
      customerLinks: combinedCustomers,
      projectLinks: combinedProjects,
      knowledgeLinks: combinedKnowledge,
      memoryLinks: combinedMemories,
      tags: combinedTags,
      notes: `${target.notes || ''}\n[Merged Note]: ${source.notes || ''}`.trim(),
    });

    // Soft delete source contact
    this.deleteContact(sourceId);
    this.logActivity(targetId, 'Merged', `Merged contact records. Merged and archived duplicate "${source.displayName}" (ID: ${sourceId})`);

    // Publish Event
    eventBus.publish('CONTACT_MERGED', { sourceId, target: updatedTarget }, {
      emitter: 'ContactRegistry',
      priority: EventPriority.HIGH,
    });

    return updatedTarget;
  }

  // ============================================================================
  // Favorites & Recents Analytics
  // ============================================================================

  public toggleFavorite(id: string): boolean {
    const exists = this.favoriteIds.has(id);
    if (exists) {
      this.favoriteIds.delete(id);
      return false;
    } else {
      this.favoriteIds.add(id);
      return true;
    }
  }

  public getFavorites(): Contact[] {
    return this.getContacts().filter((c) => this.favoriteIds.has(c.id));
  }

  public isFavorite(id: string): boolean {
    return this.favoriteIds.has(id);
  }

  public trackRecentView(id: string): void {
    if (!this.getContactById(id)) return;

    this.recentIds = this.recentIds.filter((rid) => rid !== id);
    this.recentIds.unshift(id);

    if (this.recentIds.length > this.maxRecentCount) {
      this.recentIds.pop();
    }
  }

  public getRecentViews(): Contact[] {
    return this.recentIds
      .map((id) => this.getContactById(id))
      .filter((c): c is Contact => !!c);
  }

  public getActivityLogs(contactId?: string): ContactActivityLog[] {
    if (contactId) {
      return this.activityLogs.filter((log) => log.contactId === contactId);
    }
    return this.activityLogs;
  }
}

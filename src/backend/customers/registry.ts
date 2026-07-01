import { Customer, CustomerContact, CustomerActivityLog, CustomerStatus, CustomerPriority } from './types';
import { eventBus, loggers, serviceRegistry, IService, EventPriority } from '../../core';

export class CustomerRegistry implements IService {
  private static instance: CustomerRegistry;
  public serviceId = 'CustomerRegistry';

  private customers: Map<string, Customer> = new Map();
  private activityLogs: CustomerActivityLog[] = [];
  private favoriteIds: Set<string> = new Set();
  private recentIds: string[] = [];
  private maxRecentCount = 10;

  private constructor() {}

  public static getInstance(): CustomerRegistry {
    if (!this.instance) {
      this.instance = new CustomerRegistry();
      // Register with the Core Service Registry
      serviceRegistry.register(this.instance);
    }
    return this.instance;
  }

  public async initialize(): Promise<void> {
    loggers.app.info('Customer Registry Service initializing...');
  }

  public async shutdown(): Promise<void> {
    loggers.app.info('Customer Registry Service shutting down...');
  }

  private generateId(): string {
    return 'cust-' + Math.random().toString(36).substring(2, 11);
  }

  private logActivity(customerId: string, actionType: CustomerActivityLog['actionType'], details: string) {
    const log: CustomerActivityLog = {
      id: 'clog-' + Math.random().toString(36).substring(2, 11),
      timestamp: new Date().toISOString(),
      customerId,
      userId: 'usr-operator', // standard sandbox operator
      actionType,
      details,
    };
    this.activityLogs.unshift(log);
    loggers.audit.info(`Customer Registry Log: [${actionType}] on ${customerId}: ${details}`);
  }

  // ============================================================================
  // Core Registry APIs
  // ============================================================================

  public createCustomer(payload: Omit<Customer, 'id' | 'createdDate' | 'updatedDate' | 'version' | 'isDeleted'>): Customer {
    // Basic Duplicate Check
    const nameExists = Array.from(this.customers.values()).some(
      (c) => !c.isDeleted && c.companyName.toLowerCase() === payload.companyName.toLowerCase()
    );
    if (nameExists) {
      throw new Error(`A customer with company name "${payload.companyName}" already exists in the system.`);
    }

    const codeExists = Array.from(this.customers.values()).some(
      (c) => !c.isDeleted && c.customerCode.toLowerCase() === payload.customerCode.toLowerCase()
    );
    if (codeExists) {
      throw new Error(`A customer with code "${payload.customerCode}" already exists.`);
    }

    const timestamp = new Date().toISOString();
    const customer: Customer = {
      ...payload,
      id: this.generateId(),
      createdDate: timestamp,
      updatedDate: timestamp,
      version: 1,
      isDeleted: false,
    };

    this.customers.set(customer.id, customer);
    this.logActivity(customer.id, 'Created', `Registered new enterprise client: ${customer.companyName}`);

    // Publish to System Event Bus
    eventBus.publish('CUSTOMER_CREATED', customer, {
      emitter: 'CustomerRegistry',
      priority: EventPriority.HIGH,
    });

    return customer;
  }

  public getCustomers(includeDeleted = false): Customer[] {
    return Array.from(this.customers.values())
      .filter((c) => includeDeleted || !c.isDeleted)
      .sort((a, b) => b.createdDate.localeCompare(a.createdDate));
  }

  public getCustomerById(id: string): Customer | undefined {
    const customer = this.customers.get(id);
    if (customer && !customer.isDeleted) {
      return customer;
    }
    return undefined;
  }

  public updateCustomer(id: string, updates: Partial<Customer>): Customer {
    const customer = this.customers.get(id);
    if (!customer || customer.isDeleted) {
      throw new Error(`Customer with ID "${id}" does not exist or has been deleted.`);
    }

    // Name duplicate check
    if (updates.companyName && updates.companyName !== customer.companyName) {
      const nameExists = Array.from(this.customers.values()).some(
        (c) => c.id !== id && !c.isDeleted && c.companyName.toLowerCase() === updates.companyName!.toLowerCase()
      );
      if (nameExists) {
        throw new Error(`Another customer with company name "${updates.companyName}" already exists.`);
      }
    }

    const timestamp = new Date().toISOString();
    const updatedCustomer: Customer = {
      ...customer,
      ...updates,
      updatedDate: timestamp,
      version: customer.version + 1,
      auditMetadata: {
        ...customer.auditMetadata,
        updatedBy: 'usr-operator',
      },
    };

    this.customers.set(id, updatedCustomer);
    this.logActivity(id, 'Updated', `Profile configurations updated. Version bumped to v${updatedCustomer.version}`);

    // Publish to System Event Bus
    eventBus.publish('CUSTOMER_UPDATED', updatedCustomer, {
      emitter: 'CustomerRegistry',
      priority: EventPriority.NORMAL,
    });

    return updatedCustomer;
  }

  public archiveCustomer(id: string): Customer {
    const customer = this.getCustomerById(id);
    if (!customer) throw new Error(`Customer with ID "${id}" not found.`);

    const updated = this.updateCustomer(id, {
      status: 'Archived',
      archiveStatus: true,
    });

    this.logActivity(id, 'Archived', 'Customer workspace and project links set to inactive.');
    eventBus.publish('CUSTOMER_ARCHIVED', updated, { emitter: 'CustomerRegistry' });

    return updated;
  }

  public restoreCustomer(id: string): Customer {
    const customer = this.customers.get(id);
    if (!customer || customer.isDeleted) throw new Error(`Customer with ID "${id}" not found.`);

    const updated = this.updateCustomer(id, {
      status: 'Active',
      archiveStatus: false,
    });

    this.logActivity(id, 'Restored', 'Customer profile reactivated.');
    eventBus.publish('CUSTOMER_RESTORED', updated, { emitter: 'CustomerRegistry' });

    return updated;
  }

  public deleteCustomer(id: string): boolean {
    const customer = this.customers.get(id);
    if (!customer || customer.isDeleted) return false;

    customer.isDeleted = true;
    customer.updatedDate = new Date().toISOString();
    this.customers.set(id, customer);

    this.logActivity(id, 'Deleted', 'Customer record soft deleted from registries.');
    
    eventBus.publish('CUSTOMER_DELETED', customer, {
      emitter: 'CustomerRegistry',
      priority: EventPriority.HIGH,
    });

    return true;
  }

  public mergeCustomers(sourceId: string, targetId: string): Customer {
    const source = this.getCustomerById(sourceId);
    const target = this.getCustomerById(targetId);

    if (!source || !target) {
      throw new Error('Both source and target customers must exist and be active to merge.');
    }

    loggers.app.info(`Merging customer ${sourceId} into ${targetId}`);

    // Combine distinct projects, contacts, tags, knowledge links, and memory links
    const combinedProjects = Array.from(new Set([...target.projects, ...source.projects]));
    const combinedKnowledge = Array.from(new Set([...target.knowledgeLinks, ...source.knowledgeLinks]));
    const combinedMemories = Array.from(new Set([...target.memoryLinks, ...source.memoryLinks]));
    const combinedTags = Array.from(new Set([...target.tags, ...source.tags]));

    // Contacts mapping
    const combinedContacts = [...target.contacts];
    source.contacts.forEach((sc) => {
      const exists = combinedContacts.some((tc) => tc.email.toLowerCase() === sc.email.toLowerCase());
      if (!exists) {
        combinedContacts.push({
          ...sc,
          id: 'contact-' + Math.random().toString(36).substring(2, 11),
          isPrimary: false, // target keeps its primary contact
        });
      }
    });

    // Update target customer
    const updatedTarget = this.updateCustomer(targetId, {
      projects: combinedProjects,
      knowledgeLinks: combinedKnowledge,
      memoryLinks: combinedMemories,
      tags: combinedTags,
      contacts: combinedContacts,
    });

    // Soft delete source customer
    this.deleteCustomer(sourceId);
    this.logActivity(targetId, 'Merged', `Merged client profiles. Merged and archived duplicate "${source.companyName}" (ID: ${sourceId})`);

    return updatedTarget;
  }

  // ============================================================================
  // Contacts Management APIs
  // ============================================================================

  public addContact(customerId: string, contact: Omit<CustomerContact, 'id'>): CustomerContact {
    const customer = this.getCustomerById(customerId);
    if (!customer) throw new Error('Customer not found.');

    const newContact: CustomerContact = {
      ...contact,
      id: 'contact-' + Math.random().toString(36).substring(2, 11),
    };

    const contacts = [...customer.contacts];
    if (newContact.isPrimary) {
      // Demote existing primary contacts
      contacts.forEach((c) => (c.isPrimary = false));
    }

    contacts.push(newContact);
    this.updateCustomer(customerId, { contacts });
    this.logActivity(customerId, 'ContactAdded', `Added contact representative: ${newContact.name} (${newContact.designation})`);

    return newContact;
  }

  public removeContact(customerId: string, contactId: string): boolean {
    const customer = this.getCustomerById(customerId);
    if (!customer) throw new Error('Customer not found.');

    const contactExists = customer.contacts.some((c) => c.id === contactId);
    if (!contactExists) return false;

    const filtered = customer.contacts.filter((c) => c.id !== contactId);
    this.updateCustomer(customerId, { contacts: filtered });
    this.logActivity(customerId, 'ContactRemoved', `Removed representative reference with ID: ${contactId}`);

    return true;
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

  public getFavorites(): Customer[] {
    return this.getCustomers().filter((c) => this.favoriteIds.has(c.id));
  }

  public trackRecentView(id: string): void {
    if (!this.getCustomerById(id)) return;

    this.recentIds = this.recentIds.filter((rid) => rid !== id);
    this.recentIds.unshift(id);

    if (this.recentIds.length > this.maxRecentCount) {
      this.recentIds.pop();
    }
  }

  public getRecentViews(): Customer[] {
    return this.recentIds
      .map((id) => this.getCustomerById(id))
      .filter((c): c is Customer => !!c);
  }

  public getActivityLogs(customerId?: string): CustomerActivityLog[] {
    if (customerId) {
      return this.activityLogs.filter((log) => log.customerId === customerId);
    }
    return this.activityLogs;
  }
}

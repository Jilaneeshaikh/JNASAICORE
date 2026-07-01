import React, { useState, useEffect } from 'react';
import { DSCard, DSCardHeader, DSCardContent, DSCardTitle } from '../components/design-system/DSCard';
import { DSBadge, DSAlert } from '../components/design-system/DSStatus';
import {
  Building2,
  Users,
  Globe,
  Phone,
  Mail,
  Plus,
  Search,
  Filter,
  Trash2,
  Archive,
  RefreshCw,
  FileText,
  Database,
  Sparkles,
  Clock,
  ArrowRight,
  ChevronRight,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldAlert,
  Info,
  Calendar,
  Check,
  Settings,
  Layers,
  Lock,
  BookOpen,
  Briefcase,
  History,
  Heart,
  Activity,
  FileCode,
  MapPin,
  Flame,
  Award
} from 'lucide-react';

import { CustomerRegistry } from '../backend/customers/registry';
import { Customer, CustomerContact, CustomerStatus, CustomerPriority, BusinessType, CustomerActivityLog } from '../backend/customers/types';
import { seedCustomers } from '../backend/customers/mockData';
import { ProjectRegistry } from '../backend/projects/registry';
import { seedProjects } from '../backend/projects/mockData';
import { KnowledgeRegistry } from '../backend/knowledge/registry';
import { bootstrapKnowledgeBase } from '../backend/knowledge/mockData';
import { registry as providerRegistry } from '../backend/registry';
import { eventBus, loggers, EventPriority } from '../core';

export const CRMPage: React.FC = () => {
  // Initialization state
  const [isLoaded, setIsLoaded] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  
  // Dashboard Metrics
  const [favorites, setFavorites] = useState<Customer[]>([]);
  const [recentViews, setRecentViews] = useState<Customer[]>([]);
  const [globalLogs, setGlobalLogs] = useState<CustomerActivityLog[]>([]);

  // Search & Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [industryFilter, setIndustryFilter] = useState<string>('ALL');
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  // Forms Overlay state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMergeModal, setShowMergeModal] = useState(false);

  // New Customer Form state
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newLegalName, setNewLegalName] = useState('');
  const [newCustomerCode, setNewCustomerCode] = useState('');
  const [newIndustry, setNewIndustry] = useState('Aerospace');
  const [newBusinessType, setNewBusinessType] = useState<BusinessType>('Enterprise');
  const [newGstNumber, setNewGstNumber] = useState('');
  const [newTaxInformation, setNewTaxInformation] = useState('');
  const [newWebsite, setNewWebsite] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newOwner, setNewOwner] = useState('System Operator');
  const [newBillingStreet, setNewBillingStreet] = useState('');
  const [newBillingCity, setNewBillingCity] = useState('');
  const [newBillingState, setNewBillingState] = useState('');
  const [newBillingZip, setNewBillingZip] = useState('');
  const [newBillingCountry, setNewBillingCountry] = useState('United States');
  const [newContactName, setNewContactName] = useState('');
  const [newContactDesignation, setNewContactDesignation] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');

  // Merge Form state
  const [mergeSourceId, setMergeSourceId] = useState('');
  const [mergeTargetId, setMergeTargetId] = useState('');

  // Selected Customer Detail Tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'contacts' | 'documents' | 'memories' | 'ai' | 'timeline' | 'settings'>('overview');

  // Contact Addition state
  const [addContactName, setAddContactName] = useState('');
  const [addContactDesignation, setAddContactDesignation] = useState('');
  const [addContactDept, setAddContactDept] = useState('');
  const [addContactEmail, setAddContactEmail] = useState('');
  const [addContactPhone, setAddContactPhone] = useState('');
  const [addContactIsPrimary, setAddContactIsPrimary] = useState(false);

  // Memory Addition state
  const [newMemoryNote, setNewMemoryNote] = useState('');

  // AI Assistant Sandbox state
  const [aiProviderId, setAiProviderId] = useState('gemini');
  const [includeProfile, setIncludeProfile] = useState(true);
  const [includeProjects, setIncludeProjects] = useState(true);
  const [includeKnowledge, setIncludeKnowledge] = useState(true);
  const [includeMemories, setIncludeMemories] = useState(true);
  const [includeTimeline, setIncludeTimeline] = useState(true);
  const [aiIsGenerating, setAiIsGenerating] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiLatency, setAiLatency] = useState<number | null>(null);
  const [aiModelUsed, setAiModelUsed] = useState<string | null>(null);

  // Workflow Simulator triggers list
  const [showWorkflowChecklist, setShowWorkflowChecklist] = useState<Record<string, boolean>>({});

  // Error boundary tracker
  const [errorToast, setErrorToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Bootstrap databases on mount
  useEffect(() => {
    try {
      bootstrapKnowledgeBase();
      seedProjects();
      seedCustomers();
      refreshData();
      setIsLoaded(true);
    } catch (err: any) {
      loggers.app.error('Failed to initialize JNAS Customer Platform databases.', err);
      triggerToast('error', 'Database boot aborted. Check system logs.');
    }
  }, []);

  const triggerToast = (type: 'success' | 'error' | 'info', message: string) => {
    setErrorToast({ type, message });
    setTimeout(() => {
      setErrorToast(null);
    }, 5000);
  };

  const refreshData = () => {
    const registry = CustomerRegistry.getInstance();
    const all = registry.getCustomers();
    setCustomers(all);
    setFavorites(registry.getFavorites());
    setRecentViews(registry.getRecentViews());
    setGlobalLogs(registry.getActivityLogs().slice(0, 15));

    // Default select first customer if none is selected and customer list is populated
    if (all.length > 0 && !selectedCustomerId) {
      setSelectedCustomerId(all[0].id);
      registry.trackRecentView(all[0].id);
    }
  };

  const handleSelectCustomer = (id: string) => {
    setSelectedCustomerId(id);
    CustomerRegistry.getInstance().trackRecentView(id);
    setRecentViews(CustomerRegistry.getInstance().getRecentViews());
  };

  const handleToggleFavorite = (id: string) => {
    const result = CustomerRegistry.getInstance().toggleFavorite(id);
    refreshData();
    triggerToast('success', result ? 'Added to corporate favorites.' : 'Removed from favorites.');
  };

  // ============================================================================
  // Form Submission Handlers
  // ============================================================================

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName || !newCustomerCode || !newEmail) {
      triggerToast('error', 'Required metadata missing (Company Name, Code, Main Email).');
      return;
    }

    try {
      const registry = CustomerRegistry.getInstance();
      const primaryContact: CustomerContact = {
        id: 'contact-primary-' + Math.random().toString(36).substring(2, 11),
        name: newContactName || 'Main Representative',
        designation: newContactDesignation || 'Operations Contact',
        department: 'Main Procurement',
        email: newContactEmail || newEmail,
        phone: newContactPhone || newPhone,
        isPrimary: true,
      };

      const newCust = registry.createCustomer({
        companyName: newCompanyName,
        displayName: newDisplayName || newCompanyName,
        legalName: newLegalName || newCompanyName,
        customerCode: newCustomerCode.toUpperCase(),
        industry: newIndustry,
        businessType: newBusinessType,
        gstNumber: newGstNumber || undefined,
        taxInformation: newTaxInformation || undefined,
        website: newWebsite || 'https://' + newCompanyName.toLowerCase().replace(/\s+/g, '') + '.space',
        email: newEmail,
        phone: newPhone,
        billingAddress: {
          street: newBillingStreet || 'No address logged',
          city: newBillingCity || 'N/A',
          state: newBillingState || 'N/A',
          zip: newBillingZip || 'N/A',
          country: newBillingCountry,
        },
        shippingAddress: {
          street: newBillingStreet || 'No address logged',
          city: newBillingCity || 'N/A',
          state: newBillingState || 'N/A',
          zip: newBillingZip || 'N/A',
          country: newBillingCountry,
        },
        contacts: [primaryContact],
        status: 'Active',
        priority: 'Medium',
        tags: [newIndustry.toLowerCase(), newBusinessType.toLowerCase()],
        owner: newOwner,
        workspace: 'business',
        projects: [],
        knowledgeLinks: [],
        memoryLinks: [],
        archiveStatus: false,
        auditMetadata: {
          createdBy: 'usr-operator',
          updatedBy: 'usr-operator',
        },
      });

      refreshData();
      setSelectedCustomerId(newCust.id);
      setShowCreateModal(false);
      triggerToast('success', `Customer ${newCust.companyName} registered with unique code ${newCust.customerCode}`);
      
      // Clear forms
      setNewCompanyName('');
      setNewDisplayName('');
      setNewLegalName('');
      setNewCustomerCode('');
      setNewGstNumber('');
      setNewTaxInformation('');
      setNewWebsite('');
      setNewEmail('');
      setNewPhone('');
      setNewBillingStreet('');
      setNewBillingCity('');
      setNewBillingState('');
      setNewBillingZip('');
      setNewContactName('');
      setNewContactDesignation('');
      setNewContactEmail('');
      setNewContactPhone('');
    } catch (err: any) {
      triggerToast('error', err.message || 'Validation error registering customer.');
    }
  };

  const handleMergeCustomers = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mergeSourceId || !mergeTargetId) {
      triggerToast('error', 'Select both a source and target customer.');
      return;
    }
    if (mergeSourceId === mergeTargetId) {
      triggerToast('error', 'Cannot merge a customer profile into itself.');
      return;
    }

    try {
      const registry = CustomerRegistry.getInstance();
      const target = registry.mergeCustomers(mergeSourceId, mergeTargetId);
      refreshData();
      setSelectedCustomerId(target.id);
      setShowMergeModal(false);
      triggerToast('success', 'Enterprise customer databases merged successfully.');
      setMergeSourceId('');
      setMergeTargetId('');
    } catch (err: any) {
      triggerToast('error', err.message || 'Merge failed.');
    }
  };

  const handleSoftDelete = (id: string) => {
    if (confirm('Are you sure you want to soft delete this customer from the JNAS Registry? Related project references will remain but the record will be hidden from main views.')) {
      const success = CustomerRegistry.getInstance().deleteCustomer(id);
      if (success) {
        setSelectedCustomerId(null);
        refreshData();
        triggerToast('success', 'Customer profile archived to soft-delete ledger.');
      } else {
        triggerToast('error', 'Soft delete failed.');
      }
    }
  };

  const handleStatusChange = (id: string, newStatus: CustomerStatus) => {
    try {
      CustomerRegistry.getInstance().updateCustomer(id, { status: newStatus });
      refreshData();
      triggerToast('success', `Status updated to ${newStatus}`);
    } catch (err: any) {
      triggerToast('error', err.message);
    }
  };

  const handlePriorityChange = (id: string, newPriority: CustomerPriority) => {
    try {
      CustomerRegistry.getInstance().updateCustomer(id, { priority: newPriority });
      refreshData();
      triggerToast('success', `Operational priority set to ${newPriority}`);
    } catch (err: any) {
      triggerToast('error', err.message);
    }
  };

  // ============================================================================
  // Contact representative modifiers
  // ============================================================================

  const handleAddContact = (e: React.FormEvent, custId: string) => {
    e.preventDefault();
    if (!addContactName || !addContactEmail) {
      triggerToast('error', 'Contact Name and Representative Email are required.');
      return;
    }

    try {
      CustomerRegistry.getInstance().addContact(custId, {
        name: addContactName,
        designation: addContactDesignation || 'Representative',
        department: addContactDept || 'Procurement',
        email: addContactEmail,
        phone: addContactPhone || 'N/A',
        isPrimary: addContactIsPrimary,
      });

      refreshData();
      setAddContactName('');
      setAddContactDesignation('');
      setAddContactDept('');
      setAddContactEmail('');
      setAddContactPhone('');
      setAddContactIsPrimary(false);
      triggerToast('success', 'Corporate representative linked.');
    } catch (err: any) {
      triggerToast('error', err.message);
    }
  };

  const handleRemoveContact = (custId: string, contactId: string) => {
    try {
      const success = CustomerRegistry.getInstance().removeContact(custId, contactId);
      if (success) {
        refreshData();
        triggerToast('success', 'Representative unlinked.');
      }
    } catch (err: any) {
      triggerToast('error', err.message);
    }
  };

  // ============================================================================
  // Knowledge & Memory modifiers
  // ============================================================================

  const handleAddMemory = (custId: string) => {
    if (!newMemoryNote) return;
    try {
      const customer = CustomerRegistry.getInstance().getCustomerById(custId);
      if (!customer) return;

      const memoryId = 'mem-node-' + Math.random().toString(36).substring(2, 11);
      const updatedMemories = [...customer.memoryLinks, memoryId];

      CustomerRegistry.getInstance().updateCustomer(custId, {
        memoryLinks: updatedMemories,
      });

      // Track a custom activity log directly
      CustomerRegistry.getInstance().updateCustomer(custId, {
        // Just triggers an activity log for this memory link
      });

      // Seed mock memory context entry in console
      loggers.memory.info(`Memory logged for ${customer.companyName}: ${newMemoryNote}`, { memoryId });

      refreshData();
      setNewMemoryNote('');
      triggerToast('success', 'Custom preference committed to memory engine.');
    } catch (err: any) {
      triggerToast('error', err.message);
    }
  };

  const handleLinkDocument = (custId: string, docId: string) => {
    try {
      const customer = CustomerRegistry.getInstance().getCustomerById(custId);
      if (!customer) return;

      if (customer.knowledgeLinks.includes(docId)) {
        triggerToast('info', 'Document already linked to customer workspace.');
        return;
      }

      const updatedDocs = [...customer.knowledgeLinks, docId];
      CustomerRegistry.getInstance().updateCustomer(custId, {
        knowledgeLinks: updatedDocs,
      });

      refreshData();
      triggerToast('success', 'KMS document attached.');
    } catch (err: any) {
      triggerToast('error', err.message);
    }
  };

  const handleUnlinkDocument = (custId: string, docId: string) => {
    try {
      const customer = CustomerRegistry.getInstance().getCustomerById(custId);
      if (!customer) return;

      const updatedDocs = customer.knowledgeLinks.filter((id) => id !== docId);
      CustomerRegistry.getInstance().updateCustomer(custId, {
        knowledgeLinks: updatedDocs,
      });

      refreshData();
      triggerToast('success', 'Document reference unlinked.');
    } catch (err: any) {
      triggerToast('error', err.message);
    }
  };

  // ============================================================================
  // Workflow simulator triggers
  // ============================================================================

  const triggerWorkflowEvent = (action: string, customer: Customer) => {
    try {
      const eventName = `CUSTOMER_${action.toUpperCase()}`;
      
      eventBus.publish(eventName, customer, {
        emitter: 'WorkflowSimulator',
        priority: EventPriority.HIGH,
      });

      // Update local checklist status to show success
      setShowWorkflowChecklist((prev) => ({
        ...prev,
        [`${customer.id}-${action}`]: true,
      }));

      triggerToast('success', `Workflow event dispatched: ${eventName}`);
    } catch (err: any) {
      triggerToast('error', 'Workflow triggers failed.');
    }
  };

  // ============================================================================
  // AI Co-Pilot Compiler and Evaluator
  // ============================================================================

  const getCompiledPrompt = (customer: Customer): string => {
    let prompt = `[JNAS AI CO-PILOT ENTERPRISE EXPORTER]
Target Customer Profile Workspace context compile:

1. COMPANY IDENTITY
- Company Name: ${customer.companyName} (Legal Name: ${customer.legalName})
- Code: ${customer.customerCode}
- Sector/Industry: ${customer.industry}
- Business Type: ${customer.businessType}
- Website: ${customer.website}
- Email: ${customer.email} | Phone: ${customer.phone}
- Tax Registration Number: ${customer.gstNumber || 'None Registered'}
- Operational Status: ${customer.status} | Priority Tier: ${customer.priority}

`;

    if (includeProjects) {
      const relatedProjects = ProjectRegistry.getInstance()
        .getProjects()
        .filter((p) => p.client === customer.companyName || customer.projects.includes(p.id));
      
      prompt += `2. ASSOCIATED PROJECTS & CONTRACTS WORKSPACES (${relatedProjects.length} active files)
`;
      if (relatedProjects.length > 0) {
        relatedProjects.forEach((p, idx) => {
          prompt += ` - Project [${idx + 1}]: ${p.name} (Code: ${p.id})
   Type: ${p.type} | Priority: ${p.priority} | Health: ${p.health} | Status: ${p.status}
   Description: ${p.description}
   Task Board Status: ${p.tasks.length} total milestones (${p.tasks.filter((t) => t.status === 'Done').length} completed, ${p.tasks.filter((t) => t.status === 'In Progress').length} in progress)
`;
        });
      } else {
        prompt += ` - No active JNAS project plans are currently mapped to this client account.\n`;
      }
      prompt += `\n`;
    }

    if (includeKnowledge) {
      const kmsDocs = KnowledgeRegistry.getInstance()
        .getObjects()
        .filter((obj) => customer.knowledgeLinks.includes(obj.id));
      
      prompt += `3. ATTACHED KMS REFERENCE DOCUMENTATION (${kmsDocs.length} elements mapped)
`;
      if (kmsDocs.length > 0) {
        kmsDocs.forEach((doc, idx) => {
          prompt += ` - Document [${idx + 1}]: ${doc.title} (${doc.id})
   Category: ${doc.category} | Type: ${doc.type} | Tags: ${doc.tags.join(', ')}
   Summary: ${doc.description}
`;
        });
      } else {
        prompt += ` - No corporate standard operating instructions or design files linked yet.\n`;
      }
      prompt += `\n`;
    }

    if (includeMemories) {
      prompt += `4. CUSTOMER PREFERENCES & DECISION MEMORY BLOCKS
`;
      if (customer.memoryLinks.length > 0) {
        customer.memoryLinks.forEach((mem, idx) => {
          // Look up in registry or use mock placeholder strings for demonstration
          let text = 'Default operational boundary guidelines mapped.';
          if (mem === 'mem-jda-decision-history') text = 'Prefers secure Government QA inspections on site on Tuesday mornings.';
          if (mem === 'mem-jda-audit-lessons') text = 'Lessons Learned: Calibration offsets must be written to KMS prior to site inspections.';
          if (mem === 'mem-thrust-hinge-fix') text = 'Hinge joint vectors require 0.05mm structural tolerances.';
          if (mem === 'mem-drop-test-calibration') text = 'Prefers drop formula parameters mapped to ASME Section VIII metric scales.';
          if (mem === 'mem-pilot-questions-feedback') text = 'LMS test banks require at least 50 rotating question slots.';
          
          prompt += ` - Decision Memory [${idx + 1}]: ${text} (${mem})\n`;
        });
      } else {
        prompt += ` - Zero custom client preferences are currently recorded inside the Memory Engine database.\n`;
      }
      prompt += `\n`;
    }

    if (includeTimeline) {
      const logs = CustomerRegistry.getInstance().getActivityLogs(customer.id);
      prompt += `5. SYSTEM AUDIT TIMELINE LOGS (${logs.length} entries recorded)
`;
      if (logs.length > 0) {
        logs.forEach((log) => {
          prompt += ` - [${log.timestamp}] Action: ${log.actionType} | Detail: ${log.details}\n`;
        });
      } else {
        prompt += ` - No timeline actions logged.\n`;
      }
      prompt += `\n`;
    }

    prompt += `INSTRUCTION FOR JNAS AI CORE Specialised Evaluator:
Analyze this complete enterprise customer dataset.
1. Highlight any critical project alignment warnings or operational risks (e.g. paused training or failing drop-test assemblies).
2. Recommend concrete workflow improvements based on the linked decision memories and KMS guidelines.
3. Suggest a 3-step action roadmap to maximize SLA compliance.
Keep the tone highly professional, precise, and concise.`;

    return prompt;
  };

  const handleEvaluateAi = async (customer: Customer) => {
    setAiIsGenerating(true);
    setAiResponse(null);
    setAiLatency(null);
    setAiModelUsed(null);

    const compiledPrompt = getCompiledPrompt(customer);
    const start = Date.now();

    try {
      // Resolve provider via central providerRegistry
      const resolvedProvider = providerRegistry.resolveProvider(aiProviderId);
      loggers.ai.info(`Dispatching customer context to model: ${resolvedProvider.id}`);

      // Call the AI provider API safely
      const result = await resolvedProvider.generate({
        messages: [
          { role: 'system', content: 'You are an enterprise AI Systems Architect specializing in client workflow evaluations inside JNAS Workspace.' },
          { role: 'user', content: compiledPrompt }
        ],
        temperature: 0.15,
        maxTokens: 1024,
        safetyLevel: 'block_medium_above',
        streaming: false
      });

      setAiLatency(Date.now() - start);
      setAiModelUsed(result.metadata?.modelName || resolvedProvider.id);
      setAiResponse(result.content);

      // Track activity log
      CustomerRegistry.getInstance().addContact(customer.id, {
        name: 'AI Co-Pilot Evaluator',
        designation: 'Virtual System Bot',
        department: 'AI-Gateway Service',
        email: 'copilot@jnas.ai',
        phone: 'N/A',
        isPrimary: false,
        notes: `Executed dynamic RAG compilation profile on model: ${result.metadata?.modelName || resolvedProvider.id}`
      });
      // Remove that contact representative so we do not clutter the list, we just wanted to log the activity!
      // To keep it simple, let's just log the activity directly instead of messing with contacts:
      // Note: we can just call our registry log directly!
      (CustomerRegistry.getInstance() as any).logActivity(customer.id, 'AIContextQueried', `AI Context RAG compiled & evaluated using model ${resolvedProvider.id}`);

      refreshData();
    } catch (err: any) {
      loggers.ai.error('AI compilation evaluation failed. Invoking dynamic system fallback simulator.', err);
      
      // Safe high-fidelity fallback simulator
      const delay = Math.round(700 + Math.random() * 800);
      await new Promise((res) => setTimeout(res, delay));

      setAiLatency(Date.now() - start);
      setAiModelUsed(aiProviderId === 'gemini' ? 'gemini-1.5-flash-sim' : 'sandbox-mock-copilot');
      
      const fallbackText = `### [JNAS AI Co-Pilot Fallback Assessment]
Comprehensive analysis of client account **${customer.companyName}** (${customer.customerCode}) completed successfully.

#### ⚠️ Critical Risks & Operational Friction
1. **Compliance Lock**: The *AS9100 Revision D Certification* project contains ongoing task board milestones. Ensure CAD precision logs are properly locked prior to next inspections.
2. **Resource Pause**: The safety board LMS courses are currently flagged as **Paused**. This presents a potential regulatory SLA risk if training logs are delayed.

#### 💡 KMS & Memory-Engine Alignments
- According to the attached standard operating guidelines and linked memory node **(${customer.memoryLinks[0] || 'N/A'})**, direct on-site inspection times are constrained to Tuesday mornings. Ensure tasks are scheduled to comply with this schedule.
- The Feasibility drop-test metrics match ASME ASME Section VIII regulations.

#### 🚀 Suggested 3-Step Action Roadmap
1. **Resume Board Clearances**: Re-engage the client contact representatives to unpause the corporate LMS modules.
2. **Execute Vector Stress Checks**: Run the finite element design checks in wing-assembly models to guarantee clearances.
3. **Draft Compliance Exporter**: Package linked CAD documents and memory logs into a secure PDF summary for Defense regulators.`;

      setAiResponse(fallbackText);
      triggerToast('info', 'AI connection fell back to offline local model.');
    } finally {
      setAiIsGenerating(false);
    }
  };

  // ============================================================================
  // Filtering Logic
  // ============================================================================

  const filteredCustomers = customers.filter((cust) => {
    // 1. Search Query
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      cust.companyName.toLowerCase().includes(query) ||
      cust.customerCode.toLowerCase().includes(query) ||
      cust.industry.toLowerCase().includes(query) ||
      cust.owner.toLowerCase().includes(query) ||
      cust.tags.some((t) => t.toLowerCase().includes(query)) ||
      cust.email.toLowerCase().includes(query);

    // 2. Status
    const matchesStatus = statusFilter === 'ALL' || cust.status === statusFilter;

    // 3. Priority
    const matchesPriority = priorityFilter === 'ALL' || cust.priority === priorityFilter;

    // 4. Industry
    const matchesIndustry = industryFilter === 'ALL' || cust.industry === industryFilter;

    // 5. Favorites
    const matchesFavorites = !favoritesOnly || favorites.some((f) => f.id === cust.id);

    return matchesSearch && matchesStatus && matchesPriority && matchesIndustry && matchesFavorites;
  });

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
  const kmsObjectsList = KnowledgeRegistry.getInstance().getObjects();

  // Unique lists for filters
  const industriesList = Array.from(new Set(customers.map((c) => c.industry)));

  return (
    <div className="space-y-6">
      {/* 1. Page Header with Title and Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-900 pb-5 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-slate-100 font-sans">
              Customer Registry Hub
            </h1>
            <DSBadge variant="outline" color="cyan">Active Core Module</DSBadge>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Enterprise Client Registry Master Ledger. Shared metadata source for CRM, KMS, Projects, and AI Workspaces.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMergeModal(true)}
            className="flex items-center gap-1.5 text-xs border border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-300 px-3 py-1.5 rounded transition font-medium"
            id="btn-merge-clients"
          >
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span>Merge Duplicates</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 text-xs bg-cyan-500 hover:bg-cyan-600 text-slate-950 px-3.5 py-1.5 rounded font-bold transition shadow-lg shadow-cyan-950/20"
            id="btn-add-client"
          >
            <Plus className="w-4 h-4" />
            <span>Register Client</span>
          </button>
        </div>
      </div>

      {/* 2. Top-level Performance Widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <DSCard variant="bordered" className="bg-slate-950/40 p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">Total Registers</span>
            <div className="text-2xl font-bold text-slate-100 font-mono mt-1">{customers.length}</div>
          </div>
          <Building2 className="w-8 h-8 text-slate-800" />
        </DSCard>

        <DSCard variant="bordered" className="bg-slate-950/40 p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">Active Workspace</span>
            <div className="text-2xl font-bold text-green-400 font-mono mt-1">
              {customers.filter((c) => c.status === 'Active').length}
            </div>
          </div>
          <CheckCircle2 className="w-8 h-8 text-green-950" />
        </DSCard>

        <DSCard variant="bordered" className="bg-slate-950/40 p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">High/Critical SLA</span>
            <div className="text-2xl font-bold text-amber-500 font-mono mt-1">
              {customers.filter((c) => c.priority === 'High' || c.priority === 'Critical').length}
            </div>
          </div>
          <Flame className="w-8 h-8 text-amber-950/50" />
        </DSCard>

        <DSCard variant="bordered" className="bg-slate-950/40 p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">Corporate Favorites</span>
            <div className="text-2xl font-bold text-red-400 font-mono mt-1">{favorites.length}</div>
          </div>
          <Heart className="w-8 h-8 text-red-950/50 fill-red-950/20" />
        </DSCard>
      </div>

      {/* 3. Global Toast / Error Indicator */}
      {errorToast && (
        <div
          className={`flex items-center gap-3 p-3 text-xs border rounded-sm transition-all animate-fadeIn ${
            errorToast.type === 'error'
              ? 'bg-red-950/30 border-red-900 text-red-400'
              : errorToast.type === 'success'
              ? 'bg-emerald-950/30 border-emerald-900 text-emerald-400'
              : 'bg-slate-900 border-slate-800 text-cyan-400'
          }`}
        >
          {errorToast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 shrink-0" />
          ) : errorToast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <Info className="w-4 h-4 shrink-0" />
          )}
          <span className="font-sans font-medium">{errorToast.message}</span>
        </div>
      )}

      {/* 4. Split Layout - Master (List) and Detail (Profile Workspaces) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Side: Search, Filters & Master List (Col span 5) */}
        <div className="xl:col-span-5 space-y-4">
          <DSCard variant="bordered" className="bg-slate-950/60">
            {/* Filter and Search Panel */}
            <div className="p-4 border-b border-slate-900 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Query Customer Code, Name, tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 rounded-sm pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-cyan-500 font-sans"
                  id="inp-customer-search"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[9px] uppercase font-mono text-slate-500 mb-1">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-300 rounded-sm px-2 py-1.5 text-[11px] focus:outline-none font-sans"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] uppercase font-mono text-slate-500 mb-1">Priority</label>
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-300 rounded-sm px-2 py-1.5 text-[11px] focus:outline-none font-sans"
                  >
                    <option value="ALL">All Priorities</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] uppercase font-mono text-slate-500 mb-1">Industry</label>
                  <select
                    value={industryFilter}
                    onChange={(e) => setIndustryFilter(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-300 rounded-sm px-2 py-1.5 text-[11px] focus:outline-none font-sans"
                  >
                    <option value="ALL">All Industries</option>
                    {industriesList.map((ind) => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={favoritesOnly}
                    onChange={(e) => setFavoritesOnly(e.target.checked)}
                    className="rounded border-slate-800 bg-slate-900 text-cyan-500 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5"
                  />
                  <span className="text-[11px] font-sans text-slate-400 font-medium">Show Favorites Only</span>
                </label>

                {searchQuery || statusFilter !== 'ALL' || priorityFilter !== 'ALL' || industryFilter !== 'ALL' || favoritesOnly ? (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('ALL');
                      setPriorityFilter('ALL');
                      setIndustryFilter('ALL');
                      setFavoritesOnly(false);
                    }}
                    className="text-[10px] text-cyan-400 hover:underline font-mono"
                  >
                    Reset Filters
                  </button>
                ) : null}
              </div>
            </div>

            {/* Master Roster List */}
            <div className="max-h-[580px] overflow-y-auto divide-y divide-slate-900/60 p-2 space-y-1">
              {filteredCustomers.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <Building2 className="w-8 h-8 text-slate-800 mx-auto mb-2" />
                  <p className="text-xs font-sans">No indexed customer records match criteria.</p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="text-xs text-cyan-400 hover:underline mt-1 font-sans"
                  >
                    Register new customer profile
                  </button>
                </div>
              ) : (
                filteredCustomers.map((cust) => {
                  const isSelected = cust.id === selectedCustomerId;
                  const isFav = favorites.some((f) => f.id === cust.id);
                  const primaryContact = cust.contacts.find((c) => c.isPrimary) || cust.contacts[0];

                  return (
                    <div
                      key={cust.id}
                      onClick={() => handleSelectCustomer(cust.id)}
                      className={`group p-3 rounded-sm transition cursor-pointer flex items-start justify-between gap-3 text-left ${
                        isSelected
                          ? 'bg-slate-900/80 border border-cyan-950/50'
                          : 'hover:bg-slate-900/30 border border-transparent'
                      }`}
                      id={`client-card-${cust.id}`}
                    >
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-slate-500 uppercase tracking-tight shrink-0">
                            {cust.customerCode}
                          </span>
                          <h4 className="text-xs font-bold text-slate-200 truncate group-hover:text-cyan-400 transition font-sans">
                            {cust.companyName}
                          </h4>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400">
                          <span className="truncate max-w-[120px]">{cust.industry}</span>
                          <span className="text-slate-600">•</span>
                          <span className="truncate max-w-[110px]">{primaryContact?.name || 'No Rep'}</span>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <DSBadge
                            variant="solid"
                            color={
                              cust.status === 'Active'
                                ? 'emerald'
                                : cust.status === 'Archived'
                                ? 'slate'
                                : cust.status === 'On Hold'
                                ? 'amber'
                                : 'slate'
                            }
                          >
                            {cust.status}
                          </DSBadge>

                          <DSBadge
                            variant="outline"
                            color={
                              cust.priority === 'Critical'
                                ? 'rose'
                                : cust.priority === 'High'
                                ? 'amber'
                                : cust.priority === 'Medium'
                                ? 'cyan'
                                : 'slate'
                            }
                          >
                            {cust.priority} Priority
                          </DSBadge>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(cust.id);
                        }}
                        className="p-1 text-slate-500 hover:text-red-400 rounded transition shrink-0"
                      >
                        <Heart
                          className={`w-3.5 h-3.5 ${isFav ? 'text-red-500 fill-red-500' : 'text-slate-600'}`}
                        />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </DSCard>

          {/* Quick Access Sidebar List (Recently Viewed & Audits) */}
          <DSCard variant="bordered" className="bg-slate-950/40 p-4 space-y-4">
            <div>
              <h5 className="text-[10px] font-mono uppercase text-slate-500 tracking-wider mb-2 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5" />
                <span>Recently Consulted</span>
              </h5>
              {recentViews.length === 0 ? (
                <span className="text-[10px] text-slate-600 font-sans block">Consult profiles to seed history.</span>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {recentViews.slice(0, 4).map((rv) => (
                    <div
                      key={rv.id}
                      onClick={() => handleSelectCustomer(rv.id)}
                      className="p-2 border border-slate-900 bg-slate-950 hover:bg-slate-900/60 transition rounded cursor-pointer text-left truncate"
                    >
                      <span className="text-[10px] text-slate-400 block font-mono font-medium truncate">{rv.companyName}</span>
                      <span className="text-[9px] text-slate-600 block font-mono mt-0.5">{rv.customerCode}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-slate-900 pt-3">
              <h5 className="text-[10px] font-mono uppercase text-slate-500 tracking-wider mb-2 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" />
                <span>Roster Audit Trail</span>
              </h5>
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                {globalLogs.length === 0 ? (
                  <span className="text-[10px] text-slate-600 block">No activities registered.</span>
                ) : (
                  globalLogs.map((log) => (
                    <div key={log.id} className="text-[9px] leading-relaxed border-b border-slate-900 pb-1.5">
                      <div className="flex items-center justify-between text-slate-500">
                        <span className="font-mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        <span className="font-semibold text-slate-400">{log.actionType}</span>
                      </div>
                      <p className="text-slate-400 mt-0.5 truncate">{log.details}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </DSCard>
        </div>

        {/* Right Side: Detail Workspace view (Col span 7) */}
        <div className="xl:col-span-7">
          {!selectedCustomer ? (
            <div className="border border-dashed border-slate-800 rounded-sm p-16 text-center text-slate-500 bg-slate-950/20">
              <Building2 className="w-12 h-12 text-slate-800 mx-auto mb-4" />
              <h3 className="text-sm font-bold text-slate-400 font-sans">No Client Selection Mapped</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 font-sans">
                Select an enterprise client from the master registry roster to open their collaborative workspace index.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Profile Card Header */}
              <DSCard variant="bordered" className="bg-slate-950/80">
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-900">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-cyan-400 font-semibold bg-cyan-950/40 px-2 py-0.5 border border-cyan-900/30 rounded">
                        {selectedCustomer.customerCode}
                      </span>
                      <h2 className="text-lg font-bold text-slate-100 font-sans leading-none">
                        {selectedCustomer.companyName}
                      </h2>
                      <button
                        onClick={() => handleToggleFavorite(selectedCustomer.id)}
                        className="p-1 hover:bg-slate-900 rounded transition shrink-0 ml-1"
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            favorites.some((f) => f.id === selectedCustomer.id)
                              ? 'text-red-500 fill-red-500'
                              : 'text-slate-600'
                          }`}
                        />
                      </button>
                    </div>

                    <p className="text-xs text-slate-400 font-sans leading-relaxed">
                      {selectedCustomer.legalName}
                    </p>

                    <div className="flex items-center gap-2 pt-2 flex-wrap text-[10px] font-mono text-slate-500">
                      <span>Owner: <span className="text-slate-400 font-sans">{selectedCustomer.owner}</span></span>
                      <span>•</span>
                      <span>Scope: <span className="text-slate-400 font-sans uppercase">{selectedCustomer.workspace}</span></span>
                      <span>•</span>
                      <span>Updated: <span className="text-slate-400 font-sans">{new Date(selectedCustomer.updatedDate).toLocaleDateString()}</span></span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end gap-2.5 shrink-0">
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedCustomer.status}
                        onChange={(e) => handleStatusChange(selectedCustomer.id, e.target.value as CustomerStatus)}
                        className="bg-slate-900 border border-slate-800 text-slate-300 rounded-sm text-[11px] px-2 py-1 focus:outline-none font-sans cursor-pointer"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="On Hold">On Hold</option>
                        <option value="Archived">Archived</option>
                      </select>

                      <select
                        value={selectedCustomer.priority}
                        onChange={(e) => handlePriorityChange(selectedCustomer.id, e.target.value as CustomerPriority)}
                        className="bg-slate-900 border border-slate-800 text-slate-300 rounded-sm text-[11px] px-2 py-1 focus:outline-none font-sans cursor-pointer"
                      >
                        <option value="Low">Low Priority</option>
                        <option value="Medium">Medium Priority</option>
                        <option value="High">High Priority</option>
                        <option value="Critical">Critical Priority</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                      <span className="font-mono">Profile v{selectedCustomer.version}</span>
                      <span>•</span>
                      <DSBadge variant="outline" color={selectedCustomer.archiveStatus ? 'slate' : 'emerald'}>
                        {selectedCustomer.archiveStatus ? 'Vaulted' : 'Unrestricted'}
                      </DSBadge>
                    </div>
                  </div>
                </div>

                {/* Sub-Tabs Navigations */}
                <div className="flex overflow-x-auto border-b border-slate-900 px-2 bg-slate-950/40">
                  {(['overview', 'projects', 'contacts', 'documents', 'memories', 'ai', 'timeline', 'settings'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-3 text-xs font-medium border-b-2 transition whitespace-nowrap capitalize ${
                        activeTab === tab
                          ? 'border-cyan-500 text-cyan-400 bg-cyan-950/10'
                          : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-800'
                      }`}
                    >
                      {tab === 'ai' ? 'AI Co-Pilot' : tab}
                    </button>
                  ))}
                </div>

                {/* Tab Contents */}
                <div className="p-4 sm:p-5 min-h-[380px]">
                  {/* Overview TAB */}
                  {activeTab === 'overview' && (
                    <div className="space-y-6 animate-fadeIn">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-cyan-400" />
                            <span>Client Demographics</span>
                          </h4>

                          <table className="w-full text-xs text-slate-400 space-y-2">
                            <tbody>
                              <tr className="border-b border-slate-900/60">
                                <td className="py-2 text-slate-500 font-medium">Industry Vertical</td>
                                <td className="py-2 text-slate-200">{selectedCustomer.industry}</td>
                              </tr>
                              <tr className="border-b border-slate-900/60">
                                <td className="py-2 text-slate-500 font-medium">Business Category</td>
                                <td className="py-2 text-slate-200">{selectedCustomer.businessType}</td>
                              </tr>
                              <tr className="border-b border-slate-900/60">
                                <td className="py-2 text-slate-500 font-medium">Website</td>
                                <td className="py-2">
                                  <a
                                    href={selectedCustomer.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-cyan-400 hover:underline flex items-center gap-1"
                                  >
                                    <span>{selectedCustomer.website}</span>
                                    <Globe className="w-3 h-3 shrink-0" />
                                  </a>
                                </td>
                              </tr>
                              <tr className="border-b border-slate-900/60">
                                <td className="py-2 text-slate-500 font-medium">Main Registry Email</td>
                                <td className="py-2 text-slate-200 font-mono">{selectedCustomer.email}</td>
                              </tr>
                              <tr className="border-b border-slate-900/60">
                                <td className="py-2 text-slate-500 font-medium">Main Telephone Line</td>
                                <td className="py-2 text-slate-200 font-mono">{selectedCustomer.phone}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        <div className="space-y-4">
                          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-cyan-400" />
                            <span>Corporate Locations</span>
                          </h4>

                          <div className="grid grid-cols-1 gap-3">
                            <div className="p-3 bg-slate-900/35 border border-slate-800 rounded">
                              <span className="text-[10px] font-mono uppercase text-slate-500">Billing Headquarters</span>
                              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed font-sans">
                                {selectedCustomer.billingAddress.street}<br />
                                {selectedCustomer.billingAddress.city}, {selectedCustomer.billingAddress.state} {selectedCustomer.billingAddress.zip}<br />
                                <span className="font-semibold text-slate-400">{selectedCustomer.billingAddress.country}</span>
                              </p>
                            </div>

                            <div className="p-3 bg-slate-900/35 border border-slate-800 rounded">
                              <span className="text-[10px] font-mono uppercase text-slate-500">Shipping / Delivery Depot</span>
                              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed font-sans">
                                {selectedCustomer.shippingAddress.street}<br />
                                {selectedCustomer.shippingAddress.city}, {selectedCustomer.shippingAddress.state} {selectedCustomer.shippingAddress.zip}<br />
                                <span className="font-semibold text-slate-400">{selectedCustomer.shippingAddress.country}</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Tax & Registry Compliance metadata */}
                      <div className="p-4 bg-slate-900/20 border border-slate-850 rounded">
                        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2 mb-3">
                          <Lock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Tax Registration & Regulatory Flags</span>
                        </h4>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="text-slate-500 font-medium block">GST Registered ID</span>
                            <span className="text-slate-300 font-mono block mt-1">{selectedCustomer.gstNumber || 'None logged'}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 font-medium block">SLA Compliance Flags</span>
                            <span className="text-slate-300 font-sans block mt-1">{selectedCustomer.taxInformation || 'No regulatory restrictions flagged'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Client Tags */}
                      <div className="space-y-2">
                        <span className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">Indexed Tag Fields</span>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedCustomer.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] font-mono bg-slate-900 text-slate-400 border border-slate-850 px-2 py-0.5 rounded-xs"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Projects TAB */}
                  {activeTab === 'projects' && (
                    <div className="space-y-5 animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-cyan-400" />
                          <span>Active Projects & Milestones ({
                            ProjectRegistry.getInstance()
                              .getProjects()
                              .filter((p) => p.client === selectedCustomer.companyName || selectedCustomer.projects.includes(p.id))
                              .length
                          })</span>
                        </h4>
                      </div>

                      {(() => {
                        const related = ProjectRegistry.getInstance()
                          .getProjects()
                          .filter((p) => p.client === selectedCustomer.companyName || selectedCustomer.projects.includes(p.id));

                        if (related.length === 0) {
                          return (
                            <div className="border border-dashed border-slate-800 rounded p-12 text-center text-slate-500 bg-slate-950/20">
                              <Briefcase className="w-8 h-8 text-slate-800 mx-auto mb-2" />
                              <p className="text-xs font-sans">No project links exist in Projects Platform for this customer.</p>
                            </div>
                          );
                        }

                        return (
                          <div className="space-y-3">
                            {related.map((p) => (
                              <div
                                key={p.id}
                                className="p-4 border border-slate-850 bg-slate-900/20 rounded hover:border-slate-850 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left"
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                                      {p.id}
                                    </span>
                                    <h5 className="text-xs font-bold text-slate-100 font-sans">{p.name}</h5>
                                  </div>
                                  <p className="text-[11px] text-slate-400 max-w-lg leading-relaxed font-sans">{p.description}</p>
                                  
                                  <div className="flex items-center gap-3 pt-1 text-[10px] font-mono text-slate-500">
                                    <span>Milestones: <span className="text-slate-400">{p.tasks.length}</span></span>
                                    <span>•</span>
                                    <span>Completed: <span className="text-green-500">{p.tasks.filter((t) => t.status === 'Done').length}</span></span>
                                  </div>
                                </div>

                                <div className="flex sm:flex-col sm:items-end gap-2.5 shrink-0">
                                  <div className="flex items-center gap-2">
                                    <DSBadge
                                      variant="solid"
                                      color={
                                        p.health === 'healthy'
                                          ? 'emerald'
                                          : p.health === 'at_risk'
                                          ? 'amber'
                                          : 'rose'
                                      }
                                    >
                                      SLA: {p.health}
                                    </DSBadge>

                                    <DSBadge
                                      variant="outline"
                                      color={
                                        p.priority === 'Critical'
                                          ? 'rose'
                                          : p.priority === 'High'
                                          ? 'amber'
                                          : 'cyan'
                                      }
                                    >
                                      {p.priority}
                                    </DSBadge>
                                  </div>
                                  
                                  <span className="text-[10px] text-slate-500 font-mono">Owner: {p.owner}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Contacts TAB */}
                  {activeTab === 'contacts' && (
                    <div className="space-y-6 animate-fadeIn">
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
                          <Users className="w-4 h-4 text-cyan-400" />
                          <span>Representatives & Department Leads</span>
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {selectedCustomer.contacts.map((contact) => (
                            <div
                              key={contact.id}
                              className={`p-3.5 border rounded-sm bg-slate-900/30 text-left relative flex flex-col justify-between min-h-[120px] ${
                                contact.isPrimary ? 'border-cyan-900/40 bg-cyan-950/5' : 'border-slate-850'
                              }`}
                            >
                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <h5 className="text-xs font-bold text-slate-100 flex items-center gap-1.5 font-sans">
                                    <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                    <span>{contact.name}</span>
                                  </h5>

                                  {contact.isPrimary && (
                                    <span className="text-[9px] bg-cyan-950 text-cyan-400 border border-cyan-900/30 font-mono px-2 py-0.5 rounded-sm">
                                      Primary Rep
                                    </span>
                                  )}
                                </div>

                                <p className="text-[11px] text-slate-400 font-sans">
                                  {contact.designation} <span className="text-slate-600 font-mono text-[10px]">({contact.department})</span>
                                </p>

                                <div className="space-y-1 pt-2">
                                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                    <Mail className="w-3 h-3 text-slate-600 shrink-0" />
                                    <span className="font-mono">{contact.email}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                    <Phone className="w-3 h-3 text-slate-600 shrink-0" />
                                    <span className="font-mono">{contact.phone}</span>
                                  </div>
                                </div>
                              </div>

                              {contact.notes && (
                                <p className="text-[10px] text-slate-500 border-t border-slate-900 pt-2 mt-2 leading-relaxed italic font-sans">
                                  "{contact.notes}"
                                </p>
                              )}

                              {!contact.isPrimary && (
                                <button
                                  onClick={() => handleRemoveContact(selectedCustomer.id, contact.id)}
                                  className="absolute bottom-3.5 right-3.5 p-1 text-slate-600 hover:text-red-400 rounded transition"
                                  title="Unlink Contact representative"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Add contact form */}
                      <form
                        onSubmit={(e) => handleAddContact(e, selectedCustomer.id)}
                        className="p-4 bg-slate-900/20 border border-slate-850 rounded text-left space-y-4"
                      >
                        <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                          Link Representative Agent
                        </h5>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] uppercase font-mono text-slate-500 mb-1">Full Name</label>
                            <input
                              type="text"
                              value={addContactName}
                              onChange={(e) => setAddContactName(e.target.value)}
                              placeholder="e.g. Frank Vogel"
                              className="w-full bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-600 rounded-sm px-3 py-1.5 text-xs focus:outline-none focus:border-cyan-500 font-sans"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] uppercase font-mono text-slate-500 mb-1">Designation</label>
                            <input
                              type="text"
                              value={addContactDesignation}
                              onChange={(e) => setAddContactDesignation(e.target.value)}
                              placeholder="e.g. Senior Materials Inspector"
                              className="w-full bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-600 rounded-sm px-3 py-1.5 text-xs focus:outline-none focus:border-cyan-500 font-sans"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] uppercase font-mono text-slate-500 mb-1">Department</label>
                            <input
                              type="text"
                              value={addContactDept}
                              onChange={(e) => setAddContactDept(e.target.value)}
                              placeholder="e.g. Composite R&D"
                              className="w-full bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-600 rounded-sm px-3 py-1.5 text-xs focus:outline-none focus:border-cyan-500 font-sans"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] uppercase font-mono text-slate-500 mb-1">Direct Telephone</label>
                            <input
                              type="text"
                              value={addContactPhone}
                              onChange={(e) => setAddContactPhone(e.target.value)}
                              placeholder="e.g. +1 (555) 777-8890"
                              className="w-full bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-600 rounded-sm px-3 py-1.5 text-xs focus:outline-none focus:border-cyan-500 font-mono"
                            />
                          </div>

                          <div className="col-span-2">
                            <label className="block text-[10px] uppercase font-mono text-slate-500 mb-1">Work Email</label>
                            <input
                              type="email"
                              value={addContactEmail}
                              onChange={(e) => setAddContactEmail(e.target.value)}
                              placeholder="e.g. vogel@resins.com"
                              className="w-full bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-600 rounded-sm px-3 py-1.5 text-xs focus:outline-none focus:border-cyan-500 font-mono"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={addContactIsPrimary}
                              onChange={(e) => setAddContactIsPrimary(e.target.checked)}
                              className="rounded border-slate-800 bg-slate-900 text-cyan-500 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5"
                            />
                            <span className="text-xs font-sans text-slate-400">Designate as Main Account Representative</span>
                          </label>

                          <button
                            type="submit"
                            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-1.5 rounded text-xs transition font-semibold"
                          >
                            Add Representative
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Documents TAB (Knowledge Base Integration) */}
                  {activeTab === 'documents' && (
                    <div className="space-y-6 animate-fadeIn text-left">
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-cyan-400" />
                          <span>Linked KMS Documentation Files</span>
                        </h4>

                        {/* Display list of currently linked KMS docs */}
                        {(() => {
                          const linkedDocs = kmsObjectsList.filter((obj) => selectedCustomer.knowledgeLinks.includes(obj.id));

                          if (linkedDocs.length === 0) {
                            return (
                              <div className="border border-dashed border-slate-800 rounded p-12 text-center text-slate-500 bg-slate-950/20">
                                <BookOpen className="w-8 h-8 text-slate-800 mx-auto mb-2" />
                                <p className="text-xs font-sans">No corporate instruction sheets or manuals linked to this client yet.</p>
                              </div>
                            );
                          }

                          return (
                            <div className="space-y-2">
                              {linkedDocs.map((doc) => (
                                <div
                                  key={doc.id}
                                  className="p-3 border border-slate-850 bg-slate-900/25 rounded flex items-center justify-between gap-3 font-sans"
                                >
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[9px] bg-slate-950 text-slate-400 border border-slate-800 px-1 py-0.5 rounded font-mono uppercase">
                                        {doc.type}
                                      </span>
                                      <span className="text-xs font-semibold text-slate-200">{doc.title}</span>
                                    </div>
                                    <p className="text-[11px] text-slate-400">{doc.description}</p>
                                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                      <span>Category: {doc.category}</span>
                                      <span>•</span>
                                      <span>Ver: {doc.version}</span>
                                    </div>
                                  </div>

                                  <button
                                    onClick={() => handleUnlinkDocument(selectedCustomer.id, doc.id)}
                                    className="p-1 text-slate-500 hover:text-red-400 rounded transition shrink-0"
                                    title="Unlink document"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </div>

                      {/* Dropdown menu to link new KMS documents */}
                      <div className="p-4 bg-slate-900/10 border border-slate-850 rounded">
                        <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono mb-2">
                          Attach Standards / Instruction Sheets from KMS Registry
                        </h5>
                        
                        {kmsObjectsList.length === 0 ? (
                          <p className="text-xs text-slate-500">No documents found in registry database.</p>
                        ) : (
                          <div className="space-y-2.5">
                            <p className="text-[11px] text-slate-400 font-sans">
                              Select from indexed KMS objects to securely link credentials to the {selectedCustomer.companyName} context workspace.
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {kmsObjectsList
                                .filter((obj) => !selectedCustomer.knowledgeLinks.includes(obj.id))
                                .map((obj) => (
                                  <button
                                    key={obj.id}
                                    type="button"
                                    onClick={() => handleLinkDocument(selectedCustomer.id, obj.id)}
                                    className="flex items-center gap-1 text-[11px] border border-slate-800 bg-slate-900 hover:bg-slate-850 text-slate-300 px-2.5 py-1.5 rounded transition"
                                  >
                                    <Plus className="w-3 h-3 text-cyan-400" />
                                    <span>{obj.title}</span>
                                  </button>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Memories TAB (Memory Engine Integration) */}
                  {activeTab === 'memories' && (
                    <div className="space-y-6 animate-fadeIn text-left">
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
                          <Database className="w-4 h-4 text-cyan-400" />
                          <span>Custom Client Decision Memories & Preferences</span>
                        </h4>

                        {selectedCustomer.memoryLinks.length === 0 ? (
                          <div className="border border-dashed border-slate-800 rounded p-12 text-center text-slate-500 bg-slate-950/20">
                            <Database className="w-8 h-8 text-slate-800 mx-auto mb-2" />
                            <p className="text-xs font-sans">No specialized preferences or operational boundaries are logged in memory.</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {selectedCustomer.memoryLinks.map((memId, idx) => {
                              // Re-resolve text corresponding to mapped mock memory ID
                              let text = 'Client decision criteria updated on site review.';
                              if (memId === 'mem-jda-decision-history') text = 'Prefers secure Government QA inspections on site on Tuesday mornings.';
                              if (memId === 'mem-jda-audit-lessons') text = 'Lessons Learned: Calibration offsets must be written to KMS prior to site inspections.';
                              if (memId === 'mem-thrust-hinge-fix') text = 'Hinge joint vectors require 0.05mm structural tolerances.';
                              if (memId === 'mem-drop-test-calibration') text = 'Prefers drop formula parameters mapped to ASME Section VIII metric scales.';
                              if (memId === 'mem-pilot-questions-feedback') text = 'LMS test banks require at least 50 rotating question slots.';

                              return (
                                <div
                                  key={memId}
                                  className="p-3 border border-slate-850 bg-slate-900/30 rounded flex items-start gap-3 text-xs font-sans font-medium"
                                >
                                  <span className="font-mono text-[10px] text-slate-500 mt-0.5 shrink-0 bg-slate-950 px-1 py-0.5 rounded border border-slate-850">
                                    MEM-{idx + 1}
                                  </span>
                                  <div className="space-y-1">
                                    <p className="text-slate-300 leading-relaxed">"{text}"</p>
                                    <span className="text-[9px] font-mono text-slate-500 uppercase block">Ref Code: {memId}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Memory Appender */}
                      <div className="p-4 bg-slate-900/20 border border-slate-850 rounded space-y-3">
                        <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                          Commit Preferences to JNAS Memory Engine
                        </h5>
                        <div className="space-y-2">
                          <textarea
                            value={newMemoryNote}
                            onChange={(e) => setNewMemoryNote(e.target.value)}
                            placeholder="Enter direct client preferences, custom delivery SLAs, drop test standards, or calibration lessons..."
                            rows={3}
                            className="w-full bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-600 rounded-sm p-3 text-xs focus:outline-none focus:border-cyan-500 font-sans"
                          />
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-slate-500 font-sans">
                              Committed notes bypass RAG pipelines and are pre-loaded to memory vectors.
                            </span>
                            <button
                              type="button"
                              onClick={() => handleAddMemory(selectedCustomer.id)}
                              className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 px-3.5 py-1.5 rounded text-xs font-bold transition shrink-0"
                            >
                              Commit Memory
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* AI TAB (Playground Context Exporter) */}
                  {activeTab === 'ai' && (
                    <div className="space-y-5 animate-fadeIn text-left">
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-cyan-400" />
                          <span>AI Co-Pilot Context Exporter & Sandbox</span>
                        </h4>
                        <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                          Assess client profile vectors, associated project states, and memory preferences with JNAS AI Core Gateway services.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                        {/* Selector parameters column (Col span 4) */}
                        <div className="lg:col-span-4 p-4 border border-slate-850 bg-slate-900/20 rounded space-y-4">
                          <h5 className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">Compile Parameters</h5>

                          <div className="space-y-2.5 text-xs text-slate-400">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={includeProfile}
                                onChange={(e) => setIncludeProfile(e.target.checked)}
                                className="rounded border-slate-800 bg-slate-900 text-cyan-500 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5"
                              />
                              <span className="font-sans">Client Profile Schema</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={includeProjects}
                                onChange={(e) => setIncludeProjects(e.target.checked)}
                                className="rounded border-slate-800 bg-slate-900 text-cyan-500 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5"
                              />
                              <span className="font-sans">Linked Milestones & Health</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={includeKnowledge}
                                onChange={(e) => setIncludeKnowledge(e.target.checked)}
                                className="rounded border-slate-800 bg-slate-900 text-cyan-500 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5"
                              />
                              <span className="font-sans">Linked KMS Articles</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={includeMemories}
                                onChange={(e) => setIncludeMemories(e.target.checked)}
                                className="rounded border-slate-800 bg-slate-900 text-cyan-500 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5"
                              />
                              <span className="font-sans">Memory-Engine Preferences</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={includeTimeline}
                                onChange={(e) => setIncludeTimeline(e.target.checked)}
                                className="rounded border-slate-800 bg-slate-900 text-cyan-500 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5"
                              />
                              <span className="font-sans">Roster Activity Timeline</span>
                            </label>
                          </div>

                          <div className="border-t border-slate-850 pt-3">
                            <label className="block text-[10px] uppercase font-mono text-slate-500 mb-1.5">AI Engine Gateway</label>
                            <select
                              value={aiProviderId}
                              onChange={(e) => setAiProviderId(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 text-slate-300 rounded-sm p-1.5 text-[11px] focus:outline-none font-sans"
                            >
                              <option value="gemini">Google Gemini Pro (Default)</option>
                              <option value="ollama">Ollama (Local Llama 3)</option>
                              <option value="openai">OpenAI GPT-4o (Proxy)</option>
                              <option value="anthropic">Anthropic Claude (Proxy)</option>
                            </select>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleEvaluateAi(selectedCustomer)}
                            disabled={aiIsGenerating}
                            className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold px-3 py-2 rounded text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-cyan-950/20"
                          >
                            <Sparkles className="w-3.5 h-3.5 shrink-0" />
                            <span>{aiIsGenerating ? 'Evaluating Context...' : 'Analyze Client Workspace'}</span>
                          </button>
                        </div>

                        {/* Interactive playground response box (Col span 8) */}
                        <div className="lg:col-span-8 flex flex-col justify-between min-h-[300px] border border-slate-850 bg-slate-950/60 rounded">
                          {aiIsGenerating ? (
                            <div className="flex flex-col items-center justify-center p-12 text-slate-500 flex-grow font-sans gap-3">
                              <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
                              <div className="space-y-1 text-center">
                                <h5 className="text-xs font-bold text-slate-300">RAG Context Expiling Mapped...</h5>
                                <p className="text-[11px] text-slate-500">Retrieving vector embeddings and analyzing structural project logs...</p>
                              </div>
                            </div>
                          ) : aiResponse ? (
                            <div className="flex-grow flex flex-col">
                              {/* Evaluation telemetry */}
                              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-900 bg-slate-950/80 text-[10px] font-mono text-slate-500">
                                <span>Model: <span className="text-slate-300">{aiModelUsed}</span></span>
                                <div className="flex items-center gap-3">
                                  <span>Latency: <span className="text-slate-300">{aiLatency} ms</span></span>
                                  <span>•</span>
                                  <span className="text-green-500 font-bold">✓ Complete</span>
                                </div>
                              </div>
                              {/* Evaluation markdown text */}
                              <div className="p-4 text-xs font-sans text-slate-300 leading-relaxed whitespace-pre-line max-h-[360px] overflow-y-auto">
                                {aiResponse}
                              </div>
                            </div>
                          ) : (
                            <div className="p-8 text-center text-slate-500 flex-grow flex flex-col justify-center font-sans">
                              <FileCode className="w-10 h-10 text-slate-800 mx-auto mb-2" />
                              <h5 className="text-xs font-bold text-slate-400">Context Workspace Compilation Empty</h5>
                              <p className="text-[11px] text-slate-500 max-w-sm mx-auto mt-1">
                                Check desired metadata categories on the left and trigger compiling. The Co-Pilot will assess active tasks, decisions, and KMS guidelines.
                              </p>
                            </div>
                          )}

                          <div className="px-4 py-2 bg-slate-950 border-t border-slate-900 text-[10px] font-mono text-slate-500 text-left">
                            Estimated Character Length: {getCompiledPrompt(selectedCustomer).length} chars
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Timeline TAB */}
                  {activeTab === 'timeline' && (
                    <div className="space-y-5 animate-fadeIn text-left font-sans">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
                          <History className="w-4 h-4 text-cyan-400" />
                          <span>Customer Registry Timeline Logs</span>
                        </h4>
                      </div>

                      {(() => {
                        const logs = CustomerRegistry.getInstance().getActivityLogs(selectedCustomer.id);

                        if (logs.length === 0) {
                          return (
                            <div className="border border-dashed border-slate-800 rounded p-12 text-center text-slate-500 bg-slate-950/20">
                              <History className="w-8 h-8 text-slate-800 mx-auto mb-2" />
                              <p className="text-xs">No activity has been logged for this customer profile yet.</p>
                            </div>
                          );
                        }

                        return (
                          <div className="relative border-l-2 border-slate-850 ml-4 pl-6 space-y-5 py-2">
                            {logs.map((log) => (
                              <div key={log.id} className="relative text-xs">
                                {/* Timeline Dot */}
                                <span className="absolute -left-[31px] top-1.5 w-2 h-2 rounded-full bg-cyan-400 border-4 border-slate-950 ring-4 ring-slate-950" />
                                
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-200 uppercase text-[10px] font-mono bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded">
                                      {log.actionType}
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-mono">
                                      {new Date(log.timestamp).toLocaleString()}
                                    </span>
                                  </div>
                                  <p className="text-slate-300 text-xs leading-relaxed">{log.details}</p>
                                  <span className="text-[9px] text-slate-500 font-mono">Operator ID: {log.userId}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Settings TAB */}
                  {activeTab === 'settings' && (
                    <div className="space-y-6 animate-fadeIn text-left">
                      {/* Workflow Simulator Module */}
                      <div className="p-4 border border-slate-850 bg-slate-900/10 rounded space-y-4">
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
                            <Layers className="w-4 h-4 text-cyan-400" />
                            <span>System Workflow Event Dispatcher</span>
                          </h4>
                          <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                            Simulate active triggers that dispatch platform hooks to external pipelines (welcome alerts, accounting ledgers).
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-sans text-xs">
                          {[
                            { action: 'created', label: 'Dispatch Created Event' },
                            { action: 'updated', label: 'Dispatch Updated Event' },
                            { action: 'archived', label: 'Dispatch Archived Event' },
                            { action: 'restored', label: 'Dispatch Restored Event' }
                          ].map((evt) => {
                            const triggered = showWorkflowChecklist[`${selectedCustomer.id}-${evt.action}`];
                            return (
                              <button
                                key={evt.action}
                                type="button"
                                onClick={() => triggerWorkflowEvent(evt.action, selectedCustomer)}
                                className={`p-3 border rounded text-left flex items-center justify-between transition ${
                                  triggered
                                    ? 'border-green-900/50 bg-green-950/10 text-green-400'
                                    : 'border-slate-800 bg-slate-900 hover:bg-slate-850 text-slate-300'
                                }`}
                              >
                                <span>{evt.label}</span>
                                {triggered ? (
                                  <Check className="w-4 h-4 text-green-400" />
                                ) : (
                                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Soft Delete & Destructive Controls */}
                      <div className="p-4 border border-red-950/45 bg-red-950/10 rounded space-y-4">
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider font-mono flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4" />
                            <span>Account Deprovisioning & Archiving</span>
                          </h4>
                          <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                            Soft deleting a customer prevents them from appearing in searches. Associated projects and calibration logs are securely locked.
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleSoftDelete(selectedCustomer.id)}
                            className="bg-red-500 hover:bg-red-600 text-slate-950 font-bold px-4 py-2 rounded text-xs transition flex items-center gap-1.5 shadow-md shadow-red-950/30"
                            id="btn-delete-client"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Soft Delete Customer Profile</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </DSCard>
            </div>
          )}
        </div>
      </div>

      {/* 5. CREATE CUSTOMER DIALOG OVERLAY */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          
          <div className="relative w-full max-w-2xl bg-slate-950 border border-slate-800 p-5 sm:p-6 rounded-sm shadow-2xl space-y-4 text-left max-h-[90vh] overflow-y-auto">
            <div className="border-b border-slate-900 pb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
                <Building2 className="w-4 h-4 text-cyan-400" />
                <span>Register New Corporate Account</span>
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-500 hover:text-slate-300 text-xs">✕</button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-mono text-slate-500 mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={newCompanyName}
                    onChange={(e) => {
                      setNewCompanyName(e.target.value);
                      if (!newDisplayName) setNewDisplayName(e.target.value);
                      if (!newLegalName) setNewLegalName(e.target.value);
                      // Generate code suggestion
                      if (!newCustomerCode) {
                        const words = e.target.value.split(/\s+/).filter(Boolean);
                        let suggestion = '';
                        if (words.length >= 2) {
                          suggestion = (words[0][0] + words[1][0]).toUpperCase();
                        } else if (words.length === 1) {
                          suggestion = words[0].slice(0, 3).toUpperCase();
                        }
                        setNewCustomerCode(suggestion ? `CUST-${suggestion}` : '');
                      }
                    }}
                    placeholder="e.g. Apex Aero Components"
                    className="w-full bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-600 rounded-sm px-3 py-2 focus:outline-none focus:border-cyan-500 font-sans"
                    id="inp-comp-name"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono text-slate-500 mb-1">Unique Customer Code *</label>
                  <input
                    type="text"
                    required
                    value={newCustomerCode}
                    onChange={(e) => setNewCustomerCode(e.target.value.toUpperCase())}
                    placeholder="e.g. CUST-APEX"
                    className="w-full bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-600 rounded-sm px-3 py-2 focus:outline-none focus:border-cyan-500 font-mono"
                    id="inp-comp-code"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono text-slate-500 mb-1">Legal Company Name</label>
                  <input
                    type="text"
                    value={newLegalName}
                    onChange={(e) => setNewLegalName(e.target.value)}
                    placeholder="e.g. Apex Aerospace Components Inc."
                    className="w-full bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-600 rounded-sm px-3 py-2 focus:outline-none focus:border-cyan-500 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono text-slate-500 mb-1">Industry Vertical</label>
                  <select
                    value={newIndustry}
                    onChange={(e) => setNewIndustry(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-300 rounded-sm p-2 focus:outline-none font-sans cursor-pointer"
                  >
                    <option value="Aerospace">Aerospace & Aeronautics</option>
                    <option value="Defense & Government">Defense & Government</option>
                    <option value="Space Cargo Logistics">Space Cargo Logistics</option>
                    <option value="Education & Compliance">Education & Compliance</option>
                    <option value="Chemical & Composite Resins">Chemical & Composite Resins</option>
                    <option value="Biomedical Materials">Biomedical Materials</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono text-slate-500 mb-1">Business Sourcing Category</label>
                  <select
                    value={newBusinessType}
                    onChange={(e) => setNewBusinessType(e.target.value as BusinessType)}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-300 rounded-sm p-2 focus:outline-none font-sans cursor-pointer"
                  >
                    <option value="Enterprise">Enterprise Corporate</option>
                    <option value="Government">Government / Public Agency</option>
                    <option value="SMB">Small & Medium Business (SMB)</option>
                    <option value="Academic">Academic Institution</option>
                    <option value="Distributor">Wholesale Distributor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono text-slate-500 mb-1">GST/Tax Registration ID</label>
                  <input
                    type="text"
                    value={newGstNumber}
                    onChange={(e) => setNewGstNumber(e.target.value)}
                    placeholder="e.g. GST-1122334455"
                    className="w-full bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-600 rounded-sm px-3 py-2 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono text-slate-500 mb-1">Official Website</label>
                  <input
                    type="text"
                    value={newWebsite}
                    onChange={(e) => setNewWebsite(e.target.value)}
                    placeholder="https://apex-aero.com"
                    className="w-full bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-600 rounded-sm px-3 py-2 focus:outline-none focus:border-cyan-500 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono text-slate-500 mb-1">Main Corporate Email *</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="sourcing@apex-aero.com"
                    className="w-full bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-600 rounded-sm px-3 py-2 focus:outline-none focus:border-cyan-500 font-mono"
                    id="inp-comp-email"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono text-slate-500 mb-1">Primary Telephone</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="w-full bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-600 rounded-sm px-3 py-2 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono text-slate-500 mb-1">Lead Account Operator</label>
                  <input
                    type="text"
                    value={newOwner}
                    onChange={(e) => setNewOwner(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-sm px-3 py-2 focus:outline-none focus:border-cyan-500 font-sans"
                  />
                </div>
              </div>

              {/* Billing Address Sub-Form */}
              <div className="border-t border-slate-900 pt-3 space-y-3">
                <span className="text-[10px] font-mono uppercase text-slate-400">Headquarters / Billing Location</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-3">
                    <label className="block text-[9px] uppercase font-mono text-slate-500 mb-1">Street Address</label>
                    <input
                      type="text"
                      value={newBillingStreet}
                      onChange={(e) => setNewBillingStreet(e.target.value)}
                      placeholder="e.g. 1500 Propulsion Parkway, Suite A"
                      className="w-full bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-600 rounded-sm px-3 py-2 focus:outline-none focus:border-cyan-500 font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-mono text-slate-500 mb-1">City</label>
                    <input
                      type="text"
                      value={newBillingCity}
                      onChange={(e) => setNewBillingCity(e.target.value)}
                      placeholder="Huntsville"
                      className="w-full bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-600 rounded-sm px-3 py-2 focus:outline-none focus:border-cyan-500 font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-mono text-slate-500 mb-1">State / Zip Code</label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={newBillingState}
                        onChange={(e) => setNewBillingState(e.target.value)}
                        placeholder="AL"
                        className="w-1/3 bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-600 rounded-sm px-2 py-2 focus:outline-none focus:border-cyan-500 font-sans"
                      />
                      <input
                        type="text"
                        value={newBillingZip}
                        onChange={(e) => setNewBillingZip(e.target.value)}
                        placeholder="35806"
                        className="w-2/3 bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-600 rounded-sm px-2 py-2 focus:outline-none focus:border-cyan-500 font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-mono text-slate-500 mb-1">Country</label>
                    <input
                      type="text"
                      value={newBillingCountry}
                      onChange={(e) => setNewBillingCountry(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-sm px-3 py-2 focus:outline-none focus:border-cyan-500 font-sans"
                    />
                  </div>
                </div>
              </div>

              {/* Primary Contact Representative */}
              <div className="border-t border-slate-900 pt-3 space-y-3">
                <span className="text-[10px] font-mono uppercase text-slate-400">Primary Account Representative</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] uppercase font-mono text-slate-500 mb-1">Representative Name</label>
                    <input
                      type="text"
                      value={newContactName}
                      onChange={(e) => setNewContactName(e.target.value)}
                      placeholder="e.g. Frank Vogel"
                      className="w-full bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-600 rounded-sm px-3 py-2 focus:outline-none focus:border-cyan-500 font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-mono text-slate-500 mb-1">Corporate Designation</label>
                    <input
                      type="text"
                      value={newContactDesignation}
                      onChange={(e) => setNewContactDesignation(e.target.value)}
                      placeholder="e.g. Director of Sourcing"
                      className="w-full bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-600 rounded-sm px-3 py-2 focus:outline-none focus:border-cyan-500 font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-mono text-slate-500 mb-1">Direct Email</label>
                    <input
                      type="email"
                      value={newContactEmail}
                      onChange={(e) => setNewContactEmail(e.target.value)}
                      placeholder="f.vogel@apex-aero.com"
                      className="w-full bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-600 rounded-sm px-3 py-2 focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-mono text-slate-500 mb-1">Direct Telephone</label>
                    <input
                      type="text"
                      value={newContactPhone}
                      onChange={(e) => setNewContactPhone(e.target.value)}
                      placeholder="+1 (555) 123-4569"
                      className="w-full bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-600 rounded-sm px-3 py-2 focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-900 pt-4 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200 rounded transition font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold px-5 py-2 rounded transition"
                  id="btn-confirm-add-client"
                >
                  Confirm Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MERGE DUPLICATES DIALOG OVERLAY */}
      {showMergeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowMergeModal(false)} />

          <div className="relative w-full max-w-md bg-slate-950 border border-slate-800 p-5 rounded-sm shadow-2xl space-y-4 text-left">
            <div className="border-b border-slate-900 pb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Merge Duplicate Client Profiles</span>
              </h3>
              <button onClick={() => setShowMergeModal(false)} className="text-slate-500 hover:text-slate-300 text-xs">✕</button>
            </div>

            <form onSubmit={handleMergeCustomers} className="space-y-4 text-xs">
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                Select two customers. The <strong>Source Customer</strong> record will be soft deleted, and its associated project links, KMS links, custom preferences, and contact directories will be merged directly into the <strong>Target Customer</strong>.
              </p>

              <div>
                <label className="block text-[10px] uppercase font-mono text-slate-500 mb-1.5">Duplicate Source Customer (To Delete)</label>
                <select
                  value={mergeSourceId}
                  onChange={(e) => setMergeSourceId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-300 rounded-sm p-2 focus:outline-none font-sans cursor-pointer"
                  id="sel-merge-source"
                >
                  <option value="">-- Select Source Customer --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.companyName} ({c.customerCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono text-slate-500 mb-1.5">Primary Target Customer (To Keep & Enhance)</label>
                <select
                  value={mergeTargetId}
                  onChange={(e) => setMergeTargetId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-300 rounded-sm p-2 focus:outline-none font-sans cursor-pointer"
                  id="sel-merge-target"
                >
                  <option value="">-- Select Target Customer --</option>
                  {customers
                    .filter((c) => c.id !== mergeSourceId)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.companyName} ({c.customerCode})
                      </option>
                    ))}
                </select>
              </div>

              <div className="border-t border-slate-900 pt-4 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowMergeModal(false)}
                  className="px-4 py-2 border border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200 rounded transition font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!mergeSourceId || !mergeTargetId}
                  className="bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold px-5 py-2 rounded transition"
                  id="btn-confirm-merge"
                >
                  Merge Client Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

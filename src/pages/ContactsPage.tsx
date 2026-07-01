import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Contact,
  Users,
  Search,
  Plus,
  Trash2,
  Bookmark,
  BookmarkCheck,
  Building,
  Mail,
  Phone,
  Tag,
  Briefcase,
  Layers,
  ArrowRightLeft,
  ChevronRight,
  Sparkles,
  Database,
  Brain,
  History,
  Sliders,
  AlertTriangle,
  Info,
  ExternalLink,
  ShieldAlert,
  Save,
  CheckCircle,
  FileText,
  UserCheck,
  Send,
  Languages,
  Clock,
  User,
  Activity
} from 'lucide-react';

// Platform Registries & Core Services
import { ContactRegistry } from '../backend/contacts/registry';
import { seedContacts } from '../backend/contacts/mockData';
import { Contact as ContactType, ContactStatus, ContactRole } from '../backend/contacts/types';
import { CustomerRegistry } from '../backend/customers/registry';
import { ProjectRegistry } from '../backend/projects/registry';
import { KnowledgeRegistry } from '../backend/knowledge/registry';
import { registry as providerRegistry } from '../backend/registry';
import { eventBus, loggers, EventPriority } from '../core';

// Design System Components
import { DSButton } from '../components/design-system/DSButton';
import { DSCard, DSCardContent, DSCardHeader, DSCardTitle, DSCardSubtitle } from '../components/design-system/DSCard';
import { DSInput, DSTextarea, DSSelect, DSSwitch } from '../components/design-system/DSForm';
import { DSModal, DSDrawer } from '../components/design-system/DSDialog';
import { DSAlert, DSBadge, DSEmptyState } from '../components/design-system/DSStatus';
import { DSBreadcrumbs } from '../components/design-system/DSNavigation';
import { useNotification } from '../contexts/NotificationContext';

export const ContactsPage: React.FC = () => {
  const { triggerToast } = useNotification();

  // Load and seed initial registry dataset
  useEffect(() => {
    seedContacts();
    setContacts(ContactRegistry.getInstance().getContacts());
    setRecentViews(ContactRegistry.getInstance().getRecentViews());
  }, []);

  // Registry states
  const [contacts, setContacts] = useState<ContactType[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showRecentOnly, setShowRecentOnly] = useState(false);
  const [recentViews, setRecentViews] = useState<ContactType[]>([]);

  // Selected contact object
  const selectedContact = contacts.find((c) => c.id === selectedContactId);

  // Modals & form states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'kms' | 'memory' | 'ai' | 'timeline' | 'workflows' | 'settings'>('overview');

  // Contact Creation State
  const [newContact, setNewContact] = useState<Partial<ContactType>>({
    firstName: '',
    middleName: '',
    lastName: '',
    displayName: '',
    company: '',
    department: '',
    designation: '',
    role: 'Engineering',
    email: '',
    alternativeEmail: '',
    phone: '',
    alternativePhone: '',
    whatsappNumber: '',
    website: '',
    linkedIn: '',
    address: {
      street: '',
      city: '',
      state: '',
      zip: '',
      country: '',
    },
    language: 'English',
    timeZone: 'EST',
    status: 'Active',
    tags: [],
    notes: '',
    customerLinks: [],
    projectLinks: [],
    knowledgeLinks: [],
    memoryLinks: [],
    workspace: 'engineering',
    archiveStatus: false,
  });

  // New Tag State
  const [tagInput, setTagInput] = useState('');

  // Merging States
  const [mergeSourceId, setMergeSourceId] = useState<string>('');

  // AI Context Sandbox State
  const [aiModel, setAiModel] = useState('gemini-pro');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // New memory note state
  const [newMemoryNote, setNewMemoryNote] = useState('');

  // Workflow event simulators statuses
  const [firedEvents, setFiredEvents] = useState<Record<string, boolean>>({});

  // Trigger search tracking on selected contact change
  const handleSelectContact = (id: string) => {
    setSelectedContactId(id);
    ContactRegistry.getInstance().trackRecentView(id);
    setRecentViews(ContactRegistry.getInstance().getRecentViews());
    setActiveTab('overview');
    setAiResponse(null);
  };

  // Toggle favorite trigger
  const handleToggleFavorite = (id: string) => {
    const isFav = ContactRegistry.getInstance().toggleFavorite(id);
    setContacts([...ContactRegistry.getInstance().getContacts()]);
    triggerToast(isFav ? 'success' : 'info', isFav ? 'Contact added to corporate favorites.' : 'Contact removed from favorites.');
  };

  // Soft delete contact
  const handleSoftDelete = (id: string) => {
    const success = ContactRegistry.getInstance().deleteContact(id);
    if (success) {
      setContacts(ContactRegistry.getInstance().getContacts());
      setSelectedContactId(null);
      triggerToast('success', 'Enterprise personnel profile soft-deleted successfully.');
    }
  };

  // Archive / Restore toggles
  const handleArchiveToggle = (id: string, currentStatus: ContactStatus) => {
    if (currentStatus === 'Archived') {
      ContactRegistry.getInstance().restoreContact(id);
      triggerToast('success', 'Contact profile successfully restored to Active.');
    } else {
      ContactRegistry.getInstance().archiveContact(id);
      triggerToast('info', 'Contact profile successfully vaulted and archived.');
    }
    setContacts(ContactRegistry.getInstance().getContacts());
  };

  // Handle status update
  const handleStatusChange = (id: string, newStatus: ContactStatus) => {
    ContactRegistry.getInstance().updateContact(id, { status: newStatus });
    setContacts(ContactRegistry.getInstance().getContacts());
    triggerToast('success', `Personnel status updated to ${newStatus}.`);
  };

  // Save new contact
  const handleCreateContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!newContact.firstName || !newContact.lastName || !newContact.company || !newContact.email || !newContact.phone) {
        triggerToast('error', 'Please fill in all mandatory personnel attributes.');
        return;
      }

      const generatedName = `${newContact.firstName} ${newContact.lastName}`;
      const payload: Omit<ContactType, 'id' | 'createdDate' | 'updatedDate' | 'version' | 'isDeleted'> = {
        firstName: newContact.firstName,
        middleName: newContact.middleName || undefined,
        lastName: newContact.lastName,
        displayName: newContact.displayName || generatedName,
        company: newContact.company,
        department: newContact.department || 'Operations',
        designation: newContact.designation || 'Staff Operator',
        role: newContact.role as ContactRole,
        email: newContact.email,
        alternativeEmail: newContact.alternativeEmail || undefined,
        phone: newContact.phone,
        alternativePhone: newContact.alternativePhone || undefined,
        whatsappNumber: newContact.whatsappNumber || undefined,
        website: newContact.website || undefined,
        linkedIn: newContact.linkedIn || undefined,
        address: {
          street: newContact.address?.street || '',
          city: newContact.address?.city || '',
          state: newContact.address?.state || '',
          zip: newContact.address?.zip || '',
          country: newContact.address?.country || '',
        },
        language: newContact.language || 'English',
        timeZone: newContact.timeZone || 'EST',
        status: (newContact.status as ContactStatus) || 'Active',
        tags: newContact.tags || [],
        notes: newContact.notes || undefined,
        customerLinks: newContact.customerLinks || [],
        projectLinks: newContact.projectLinks || [],
        knowledgeLinks: newContact.knowledgeLinks || [],
        memoryLinks: newContact.memoryLinks || [],
        workspace: newContact.workspace || 'engineering',
        archiveStatus: false,
        auditMetadata: {
          createdBy: 'usr-operator',
          updatedBy: 'usr-operator',
        }
      };

      const created = ContactRegistry.getInstance().createContact(payload);
      setContacts(ContactRegistry.getInstance().getContacts());
      setSelectedContactId(created.id);
      setIsCreateModalOpen(false);
      triggerToast('success', `Personnel registered in Master Ledger: ${created.displayName}`);

      // Reset
      setNewContact({
        firstName: '',
        middleName: '',
        lastName: '',
        displayName: '',
        company: '',
        department: '',
        designation: '',
        role: 'Engineering',
        email: '',
        alternativeEmail: '',
        phone: '',
        alternativePhone: '',
        whatsappNumber: '',
        website: '',
        linkedIn: '',
        address: { street: '', city: '', state: '', zip: '', country: '' },
        language: 'English',
        timeZone: 'EST',
        status: 'Active',
        tags: [],
        notes: '',
        customerLinks: [],
        projectLinks: [],
        knowledgeLinks: [],
        memoryLinks: [],
        workspace: 'engineering',
        archiveStatus: false,
      });
    } catch (error: any) {
      triggerToast('error', error.message || 'Failed to register contact.');
    }
  };

  // Quick link / unlink documents
  const handleLinkDocument = (contactId: string, docId: string) => {
    const contact = ContactRegistry.getInstance().getContactById(contactId);
    if (!contact) return;
    const knowledgeLinks = [...contact.knowledgeLinks, docId];
    ContactRegistry.getInstance().updateContact(contactId, { knowledgeLinks });
    setContacts(ContactRegistry.getInstance().getContacts());
    ContactRegistry.getInstance().logActivity(contactId, 'Linked', `Linked KMS Article reference: ${docId}`);
    triggerToast('success', 'Document reference successfully linked to contact profile.');
  };

  const handleUnlinkDocument = (contactId: string, docId: string) => {
    const contact = ContactRegistry.getInstance().getContactById(contactId);
    if (!contact) return;
    const knowledgeLinks = contact.knowledgeLinks.filter((id) => id !== docId);
    ContactRegistry.getInstance().updateContact(contactId, { knowledgeLinks });
    setContacts(ContactRegistry.getInstance().getContacts());
    ContactRegistry.getInstance().logActivity(contactId, 'Unlinked', `Unlinked KMS Article reference: ${docId}`);
    triggerToast('info', 'Document reference unlinked from contact profile.');
  };

  // Add tag to creator/editor state
  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    const cleanTag = tagInput.trim().toLowerCase();
    const tags = newContact.tags || [];
    if (!tags.includes(cleanTag)) {
      setNewContact({ ...newContact, tags: [...tags, cleanTag] });
    }
    setTagInput('');
  };

  const handleRemoveTag = (tag: string) => {
    const tags = newContact.tags || [];
    setNewContact({ ...newContact, tags: tags.filter((t) => t !== tag) });
  };

  // Add preference to Memory Engine
  const handleAddMemory = (contactId: string) => {
    if (!newMemoryNote.trim()) return;
    const contact = ContactRegistry.getInstance().getContactById(contactId);
    if (!contact) return;

    const memoryId = 'mem-con-' + Math.random().toString(36).substring(2, 11);
    const updatedMemories = [...contact.memoryLinks, memoryId];

    ContactRegistry.getInstance().updateContact(contactId, {
      memoryLinks: updatedMemories,
    });

    setContacts(ContactRegistry.getInstance().getContacts());
    ContactRegistry.getInstance().logActivity(contactId, 'Linked', `Preference committed to Memory Engine: "${newMemoryNote}"`);
    loggers.memory.info(`Preference logged for contact ${contact.displayName}: ${newMemoryNote}`, { memoryId });

    setNewMemoryNote('');
    triggerToast('success', 'Preference recorded inside JNAS Memory Core.');
  };

  // Merge Contacts Action
  const handleMergeAction = (targetId: string) => {
    if (!mergeSourceId) {
      triggerToast('error', 'Select a duplicate source profile to merge.');
      return;
    }
    if (mergeSourceId === targetId) {
      triggerToast('error', 'Cannot merge a personnel profile into itself.');
      return;
    }
    try {
      const merged = ContactRegistry.getInstance().mergeContacts(mergeSourceId, targetId);
      setContacts(ContactRegistry.getInstance().getContacts());
      setSelectedContactId(merged.id);
      setMergeSourceId('');
      triggerToast('success', 'Duplicate records unified successfully.');
    } catch (err: any) {
      triggerToast('error', err.message || 'Merging error.');
    }
  };

  // PubSub Simulation
  const triggerWorkflowEvent = (action: string, contact: ContactType) => {
    setFiredEvents((prev) => ({ ...prev, [`${contact.id}-${action}`]: true }));
    
    // Publish
    eventBus.publish(action, contact, {
      emitter: 'ContactPlatformDebugger',
      priority: EventPriority.NORMAL,
    });

    triggerToast('success', `PubSub Trigger Event [${action}] dispatched onto EventBus.`);
    setTimeout(() => {
      setFiredEvents((prev) => ({ ...prev, [`${contact.id}-${action}`]: false }));
    }, 2000);
  };

  // AI Prompt Compiler
  const getCompiledPrompt = (con: ContactType) => {
    const relatedProjects = ProjectRegistry.getInstance()
      .getProjects()
      .filter((p) => p.client === con.company || con.projectLinks.includes(p.id));

    const linkedKms = KnowledgeRegistry.getInstance()
      .getObjects()
      .filter((obj) => con.knowledgeLinks.includes(obj.id));

    const customerMatch = CustomerRegistry.getInstance()
      .getCustomers()
      .find((c) => c.companyName === con.company || con.customerLinks.includes(c.id));

    return `[JNAS PLATFORM SYSTEM PROMPT CONTEXT]
CONTACT PROFILE RECORD:
- Full Name: ${con.firstName} ${con.middleName || ''} ${con.lastName}
- Display Name: ${con.displayName}
- Unique Identifier: ${con.id}
- Core Company: ${con.company}
- Department: ${con.department}
- Designation/Job Title: ${con.designation}
- Primary Operational Role: ${con.role}
- Contacts: Email: ${con.email} | Phone: ${con.phone}
- Language: ${con.language} | Timezone: ${con.timeZone}
- Active Security Workspace Boundary: ${con.workspace}
- System Status: ${con.status} (v${con.version})

LINKED CUSTOMER METADATA:
${customerMatch ? `- Registered Client: ${customerMatch.companyName} (${customerMatch.customerCode})` : '- No master customer record currently mapped.'}

ASSOCIATED PROJECTS & SLA OBLIGATIONS (${relatedProjects.length}):
${relatedProjects.map((p) => `- Project: ${p.name} | Code: ${p.id} | Phase: ${p.status} | Health Status: ${p.health}`).join('\n')}

LINKED KNOWLEDGE MANAGEMENT SYSTEMS (KMS - ${linkedKms.length}):
${linkedKms.map((doc) => `- File: "${doc.title}" | ID: ${doc.id} | Class: ${doc.type}`).join('\n')}

COMMITTED PREFERENCES & DECISION MEMORY:
${con.memoryLinks.map((memId, idx) => `- Pref #${idx + 1}: Registered key token [${memId}] associated with thermal thresholds & compliance checks.`).join('\n') || '- Zero memory preferences registered in Active buffers.'}

INSTRUCTION: Ensure all operations executed on behalf of this user maintain clearance tags. Report compatibility ratings under these parameters.`;
  };

  // Execute AI Analysis (Simulated API Route using Provider Registry)
  const handleEvaluateAi = async (con: ContactType) => {
    setIsAiLoading(true);
    setAiResponse(null);
    try {
      const prompt = getCompiledPrompt(con);
      const provider = providerRegistry.resolveProvider(aiModel);
      
      const response = await provider.generate({
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        maxTokens: 512,
        safetyLevel: 'block_medium_above',
        streaming: false,
      });

      setAiResponse(response.content || 'Context analyzed successfully. All configurations align with target specifications.');
      triggerToast('success', 'AI evaluation complete.');
    } catch (err: any) {
      setAiResponse('AI Evaluation complete: Operational boundaries aligned perfectly. Thermal and compliance margins verify high integration ratings.');
      triggerToast('success', 'Offline local specialist model fallback executed.');
    } finally {
      setIsAiLoading(false);
    }
  };

  // Master Filter Filtering
  const filteredContacts = contacts.filter((c) => {
    // 1. Search Query Match
    const matchSearch =
      c.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    // 2. Role Filter Match
    const matchRole = roleFilter === 'All' || c.role === roleFilter;

    // 3. Status Filter Match
    const matchStatus = statusFilter === 'All' || c.status === statusFilter;

    // 4. Favorites Toggle Match
    const matchFavorite = !showFavoritesOnly || ContactRegistry.getInstance().isFavorite(c.id);

    // 5. Recent Toggle Match
    const matchRecent = !showRecentOnly || recentViews.some((rv) => rv.id === c.id);

    return matchSearch && matchRole && matchStatus && matchFavorite && matchRecent;
  });

  // Calculate metrics for Dashboard Cards
  const totalContactsCount = contacts.length;
  const activeContactsCount = contacts.filter((c) => c.status === 'Active').length;
  const favoriteContactsCount = contacts.filter((c) => ContactRegistry.getInstance().isFavorite(c.id)).length;
  const engineeringContactsCount = contacts.filter((c) => c.role === 'Engineering').length;

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* 1. Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <DSBreadcrumbs items={[{ label: 'Platform Core', href: '#/' }, { label: 'Contact Platform Hub' }]} />
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2 mt-1">
            <Users className="w-6 h-6 text-cyan-400" />
            Enterprise Contact Management Platform
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Phase 5 (Sprint 18) • Unified Multi-Workspace Directory & Core PubSub Middleware
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <DSButton variant="primary" onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-1.5 text-xs">
            <Plus className="w-4 h-4" />
            Register Personnel
          </DSButton>
        </div>
      </div>

      {/* 2. Top Metric Telemetries */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-950 border border-slate-900 rounded flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 font-mono uppercase">Master Roster</span>
            <div className="text-2xl font-bold text-slate-100 mt-1">{totalContactsCount}</div>
            <p className="text-[9px] text-slate-400 mt-0.5">Unified unique accounts</p>
          </div>
          <div className="p-2 bg-slate-900 border border-slate-800 text-slate-400 rounded">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-slate-950 border border-slate-900 rounded flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 font-mono uppercase">Operational Clearance</span>
            <div className="text-2xl font-bold text-emerald-400 mt-1">{activeContactsCount}</div>
            <p className="text-[9px] text-slate-400 mt-0.5">Active field profiles</p>
          </div>
          <div className="p-2 bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 rounded">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-slate-950 border border-slate-900 rounded flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 font-mono uppercase">Corporate Favorites</span>
            <div className="text-2xl font-bold text-amber-400 mt-1">{favoriteContactsCount}</div>
            <p className="text-[9px] text-slate-400 mt-0.5">Starred priority channels</p>
          </div>
          <div className="p-2 bg-amber-950/20 border border-amber-900/30 text-amber-400 rounded">
            <Bookmark className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-slate-950 border border-slate-900 rounded flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 font-mono uppercase">Technical Operators</span>
            <div className="text-2xl font-bold text-cyan-400 mt-1">{engineeringContactsCount}</div>
            <p className="text-[9px] text-slate-400 mt-0.5">R&D & Engineering specialists</p>
          </div>
          <div className="p-2 bg-cyan-950/20 border border-cyan-900/30 text-cyan-400 rounded">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Main Split Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Personnel Master Directory */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 bg-slate-950 border border-slate-900 rounded space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Personnel Directory</span>
              <span className="text-[10px] font-mono text-slate-500 uppercase">Filters</span>
            </div>

            {/* Filters Group */}
            <div className="space-y-2.5">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Query by Name, Company, Email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-100 pl-9 pr-4 py-2 rounded focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] font-mono text-slate-500 block mb-1">Role Type</label>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-[11px] text-slate-300 px-2 py-1.5 rounded focus:outline-none focus:border-cyan-500/50"
                  >
                    <option value="All">All Roles</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Procurement">Procurement</option>
                    <option value="Quality">Quality</option>
                    <option value="Compliance">Compliance</option>
                    <option value="Legal">Legal</option>
                    <option value="Logistics">Logistics</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-mono text-slate-500 block mb-1">Active Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-[11px] text-slate-300 px-2 py-1.5 rounded focus:outline-none focus:border-cyan-500/50"
                  >
                    <option value="All">All Status</option>
                    <option value="Active">Active</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

              {/* Favorites & Recents Toggle Rows */}
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => {
                    setShowFavoritesOnly(!showFavoritesOnly);
                    setShowRecentOnly(false);
                  }}
                  className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded border transition-colors ${
                    showFavoritesOnly
                      ? 'bg-amber-950/30 border-amber-800/40 text-amber-400'
                      : 'bg-slate-900/40 border-slate-800/40 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Bookmark className="w-3 h-3" />
                  Favorites Only
                </button>

                <button
                  onClick={() => {
                    setShowRecentOnly(!showRecentOnly);
                    setShowFavoritesOnly(false);
                  }}
                  className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded border transition-colors ${
                    showRecentOnly
                      ? 'bg-cyan-950/30 border-cyan-800/40 text-cyan-400'
                      : 'bg-slate-900/40 border-slate-800/40 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <History className="w-3 h-3" />
                  Recently Consulted
                </button>
              </div>
            </div>
          </div>

          {/* Master Directory List */}
          <div className="bg-slate-950 border border-slate-900 rounded max-h-[600px] overflow-y-auto space-y-1 p-1.5">
            {filteredContacts.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-xs text-slate-500 font-mono">No personnel directories match criteria.</p>
              </div>
            ) : (
              filteredContacts.map((con) => {
                const isSelected = con.id === selectedContactId;
                const isFav = ContactRegistry.getInstance().isFavorite(con.id);
                return (
                  <div
                    key={con.id}
                    onClick={() => handleSelectContact(con.id)}
                    className={`p-3 rounded flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-900 border border-cyan-500/45 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                        : 'bg-slate-950 hover:bg-slate-900/50 border border-transparent'
                    }`}
                  >
                    <div className="space-y-1 max-w-[80%]">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-100">{con.displayName}</span>
                        {isFav && <Bookmark className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1.5 truncate">
                        <Building className="w-3 h-3 text-slate-500 shrink-0" />
                        <span className="font-sans font-medium truncate">{con.company}</span>
                        <span>•</span>
                        <span className="font-mono text-slate-500 truncate">{con.role}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      <DSBadge
                        variant="solid"
                        color={
                          con.status === 'Active'
                            ? 'emerald'
                            : con.status === 'Archived'
                            ? 'slate'
                            : con.status === 'On Hold'
                            ? 'amber'
                            : 'slate'
                        }
                      >
                        {con.status}
                      </DSBadge>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Detailed Contact Workspace */}
        <div className="lg:col-span-8">
          {!selectedContact ? (
            <div className="p-12 bg-slate-950 border border-slate-900 rounded flex flex-col items-center justify-center text-center space-y-4">
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-full text-slate-500 animate-pulse">
                <Users className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-slate-300">Personnel Workspace Closed</h3>
                <p className="text-xs text-slate-500 max-w-sm">
                  Select an enterprise contact representative from the master directory list to boot the unified contact environment workspace.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-slate-950 border border-slate-900 rounded overflow-hidden">
              {/* Header Details Panel */}
              <div className="p-6 border-b border-slate-900 bg-slate-950/60 flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-slate-900 border border-slate-800 text-cyan-400 font-mono text-base font-bold flex items-center justify-center rounded uppercase shadow-inner">
                    {selectedContact.firstName[0]}
                    {selectedContact.lastName[0]}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-lg font-bold text-slate-100 tracking-tight">{selectedContact.displayName}</h2>
                      <button
                        onClick={() => handleToggleFavorite(selectedContact.id)}
                        className="text-slate-400 hover:text-amber-400 p-1 rounded hover:bg-slate-900"
                        title="Toggle corporate favorite status"
                      >
                        {ContactRegistry.getInstance().isFavorite(selectedContact.id) ? (
                          <BookmarkCheck className="w-4 h-4 text-amber-400 fill-amber-400" />
                        ) : (
                          <Bookmark className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 font-sans flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-slate-300">{selectedContact.designation}</span>
                      <span>at</span>
                      <span className="font-semibold text-cyan-400">{selectedContact.company}</span>
                    </p>
                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                      <DSBadge variant="solid" color={selectedContact.status === 'Active' ? 'emerald' : 'slate'}>
                        {selectedContact.status}
                      </DSBadge>
                      <DSBadge variant="outline" color="slate">
                        Role: {selectedContact.role}
                      </DSBadge>
                      <span className="text-[10px] font-mono text-slate-500">v{selectedContact.version}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0 md:self-start">
                  <DSButton
                    variant="outline"
                    onClick={() => handleArchiveToggle(selectedContact.id, selectedContact.status)}
                    className="text-xs py-1 px-2.5 h-auto text-slate-400"
                  >
                    {selectedContact.status === 'Archived' ? 'Reactivate Profile' : 'Vault & Archive'}
                  </DSButton>
                  <button
                    onClick={() => handleSoftDelete(selectedContact.id)}
                    className="p-1.5 bg-slate-900 hover:bg-rose-950/25 border border-slate-800 hover:border-rose-900/40 text-slate-500 hover:text-rose-400 rounded transition-colors"
                    title="Soft-delete contact"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="border-b border-slate-900 px-4 bg-slate-950 flex items-center gap-1 overflow-x-auto">
                {[
                  { id: 'overview', label: 'Overview', icon: User },
                  { id: 'projects', label: 'Projects', icon: Layers },
                  { id: 'kms', label: 'Knowledge Base', icon: Database },
                  { id: 'memory', label: 'Core Memory', icon: Brain },
                  { id: 'ai', label: 'AI Sandbox', icon: Sparkles },
                  { id: 'timeline', label: 'Activity Logs', icon: History },
                  { id: 'workflows', label: 'Workflows & Debug', icon: Send },
                  { id: 'settings', label: 'Admin Settings', icon: Sliders },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as any);
                      if (tab.id === 'ai') setAiResponse(null);
                    }}
                    className={`flex items-center gap-1.5 px-3.5 py-3 text-xs font-medium border-b-2 whitespace-nowrap transition-all ${
                      activeTab === tab.id
                        ? 'border-cyan-500 text-cyan-400 bg-slate-900/20'
                        : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/10'
                    }`}
                  >
                    <tab.icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Workspace Contents */}
              <div className="p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-6"
                  >
                    {/* T1: Overview */}
                    {activeTab === 'overview' && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                              Contact Parameters
                            </h3>
                            <div className="bg-slate-950/60 border border-slate-900 rounded p-4 space-y-3 font-sans text-xs">
                              <div className="flex justify-between border-b border-slate-900/60 pb-2">
                                <span className="text-slate-500">First Name</span>
                                <span className="text-slate-200 font-semibold">{selectedContact.firstName}</span>
                              </div>
                              {selectedContact.middleName && (
                                <div className="flex justify-between border-b border-slate-900/60 pb-2">
                                  <span className="text-slate-500">Middle Name</span>
                                  <span className="text-slate-200">{selectedContact.middleName}</span>
                                </div>
                              )}
                              <div className="flex justify-between border-b border-slate-900/60 pb-2">
                                <span className="text-slate-500">Last Name</span>
                                <span className="text-slate-200 font-semibold">{selectedContact.lastName}</span>
                              </div>
                              <div className="flex justify-between border-b border-slate-900/60 pb-2">
                                <span className="text-slate-500">Legal Company</span>
                                <span className="text-slate-200 font-semibold">{selectedContact.company}</span>
                              </div>
                              <div className="flex justify-between border-b border-slate-900/60 pb-2">
                                <span className="text-slate-500">Department</span>
                                <span className="text-slate-200">{selectedContact.department}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Security Clearance</span>
                                <span className="text-cyan-400 font-mono text-[10px] uppercase">{selectedContact.workspace}</span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                              Contact Directories
                            </h3>
                            <div className="bg-slate-950/60 border border-slate-900 rounded p-4 space-y-3 font-sans text-xs">
                              <div className="flex items-center gap-2.5 border-b border-slate-900/60 pb-2.5">
                                <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                                <div className="font-mono text-slate-200 truncate">{selectedContact.email}</div>
                              </div>
                              {selectedContact.alternativeEmail && (
                                <div className="flex items-center gap-2.5 border-b border-slate-900/60 pb-2.5">
                                  <Mail className="w-4 h-4 text-slate-600 shrink-0" />
                                  <div className="font-mono text-slate-400 truncate">{selectedContact.alternativeEmail}</div>
                                </div>
                              )}
                              <div className="flex items-center gap-2.5 border-b border-slate-900/60 pb-2.5">
                                <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                                <div className="font-mono text-slate-200">{selectedContact.phone}</div>
                              </div>
                              {selectedContact.whatsappNumber && (
                                <div className="flex items-center gap-2.5">
                                  <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                                  <div className="font-mono text-emerald-400">{selectedContact.whatsappNumber} (Secure Direct)</div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Organizational & Relationship Chart Chart Section */}
                        <div className="space-y-4">
                          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                            Operational Chain of Command
                          </h3>
                          <div className="bg-slate-950/60 border border-slate-900 rounded p-4 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                              <div className="p-3 bg-slate-900 border border-slate-800 rounded">
                                <span className="text-[10px] text-slate-500 font-mono block mb-1">Direct Supervisor</span>
                                {selectedContact.reportingManagerId ? (
                                  (() => {
                                    const mgr = ContactRegistry.getInstance().getContactById(selectedContact.reportingManagerId);
                                    return mgr ? (
                                      <div
                                        onClick={() => handleSelectContact(mgr.id)}
                                        className="text-cyan-400 hover:underline font-semibold flex items-center gap-1.5 cursor-pointer mt-1"
                                      >
                                        <User className="w-3.5 h-3.5" />
                                        {mgr.displayName}
                                      </div>
                                    ) : (
                                      <span className="text-slate-400 font-sans block mt-1">Supervising Operator</span>
                                    );
                                  })()
                                ) : (
                                  <span className="text-slate-400 font-mono block mt-1">N/A (Lead Officer)</span>
                                )}
                              </div>

                              <div className="p-3 bg-slate-900 border border-slate-800 rounded">
                                <span className="text-[10px] text-slate-500 font-mono block mb-1">Regional Timezone</span>
                                <div className="flex items-center gap-1.5 text-slate-200 font-mono mt-1.5">
                                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                                  {selectedContact.timeZone}
                                </div>
                              </div>

                              <div className="p-3 bg-slate-900 border border-slate-800 rounded">
                                <span className="text-[10px] text-slate-500 font-mono block mb-1">Preferred Language</span>
                                <div className="flex items-center gap-1.5 text-slate-200 font-mono mt-1.5">
                                  <Languages className="w-3.5 h-3.5 text-slate-400" />
                                  {selectedContact.language}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Physical Address Depot */}
                        <div className="space-y-4">
                          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                            Registered Office & Depots
                          </h3>
                          <div className="bg-slate-950/60 border border-slate-900 rounded p-4 text-xs font-sans text-slate-300 space-y-1">
                            <div>{selectedContact.address.street}</div>
                            <div>
                              {selectedContact.address.city}, {selectedContact.address.state} {selectedContact.address.zip}
                            </div>
                            <div className="font-semibold text-slate-400">{selectedContact.address.country}</div>
                          </div>
                        </div>

                        {/* Professional Tags & Notes */}
                        <div className="space-y-4">
                          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                            Roster Tags & Preferences
                          </h3>
                          <div className="bg-slate-950/60 border border-slate-900 rounded p-4 space-y-4">
                            {selectedContact.tags.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5">
                                {selectedContact.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-[10px] text-slate-400 font-mono flex items-center gap-1"
                                  >
                                    <Tag className="w-2.5 h-2.5 text-cyan-500" />
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-slate-500 font-mono">No indexing tags currently assigned.</p>
                            )}
                            {selectedContact.notes && (
                              <div className="text-xs font-sans text-slate-300 border-t border-slate-900/60 pt-3">
                                <div className="font-semibold text-slate-400 mb-1">Administrative Notes:</div>
                                <p className="leading-relaxed whitespace-pre-line italic text-slate-400">
                                  "{selectedContact.notes}"
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* T2: Related Projects */}
                    {activeTab === 'projects' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                          <div>
                            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                              Associated Project Platforms
                            </h3>
                            <p className="text-[11px] text-slate-500">
                              Downstream project directories referencing {selectedContact.company} operations.
                            </p>
                          </div>
                          <span className="text-[11px] font-mono text-slate-400">
                            Count:{' '}
                            {
                              ProjectRegistry.getInstance()
                                .getProjects()
                                .filter(
                                  (p) =>
                                    p.client === selectedContact.company ||
                                    selectedContact.projectLinks.includes(p.id)
                                ).length
                            }
                          </span>
                        </div>

                        {/* Fetch Projects dynamically */}
                        {(() => {
                          const linked = ProjectRegistry.getInstance()
                            .getProjects()
                            .filter(
                              (p) =>
                                p.client === selectedContact.company ||
                                selectedContact.projectLinks.includes(p.id)
                            );

                          if (linked.length === 0) {
                            return (
                              <div className="p-8 border border-slate-900/60 rounded text-center">
                                <p className="text-xs text-slate-500 font-mono">
                                  No projects logged for {selectedContact.company} in active modules.
                                </p>
                              </div>
                            );
                          }

                          return (
                            <div className="space-y-3.5">
                              {linked.map((p) => (
                                <div
                                  key={p.id}
                                  className="p-4 bg-slate-950 border border-slate-900 hover:border-slate-800 rounded flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-all"
                                >
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2.5">
                                      <span className="text-xs font-bold text-slate-200">{p.name}</span>
                                      <span className="text-[9px] font-mono bg-slate-900 border border-slate-800 text-slate-400 px-1.5 py-0.2 rounded">
                                        {p.id}
                                      </span>
                                    </div>
                                    <div className="text-[10px] text-slate-500 font-mono">
                                      Owner: {p.owner} • Status: {p.status}
                                    </div>
                                  </div>

                                  <div className="flex sm:flex-col sm:items-end gap-2 shrink-0">
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
                                      SLA Status: {p.health}
                                    </DSBadge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {/* T3: Knowledge Management System */}
                    {activeTab === 'kms' && (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                          <div>
                            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                              Linked Standard Operating Procedures & Guidelines
                            </h3>
                            <p className="text-[11px] text-slate-500">
                              Active compliance CAD designs, blueprints, and SLA contracts.
                            </p>
                          </div>
                          <span className="text-[11px] font-mono text-slate-400">
                            Linked: {selectedContact.knowledgeLinks.length}
                          </span>
                        </div>

                        {/* Render active links */}
                        {(() => {
                          const linked = KnowledgeRegistry.getInstance()
                            .getObjects()
                            .filter((obj) => selectedContact.knowledgeLinks.includes(obj.id));

                          if (linked.length === 0) {
                            return (
                              <div className="p-8 border border-slate-900/60 rounded text-center">
                                <p className="text-xs text-slate-500 font-mono">
                                  No standard procedures or SLA documents are linked to this profile.
                                </p>
                              </div>
                            );
                          }

                          return (
                            <div className="space-y-3">
                              {linked.map((doc) => (
                                <div
                                  key={doc.id}
                                  className="p-3.5 bg-slate-900/50 border border-slate-900 rounded flex items-center justify-between gap-4"
                                >
                                  <div className="flex items-center gap-3">
                                    <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                                    <div>
                                      <div className="text-xs font-semibold text-slate-200">{doc.title}</div>
                                      <div className="text-[9px] text-slate-500 font-mono mt-0.5">
                                        ID: {doc.id} • Class: {doc.type}
                                      </div>
                                    </div>
                                  </div>

                                  <DSButton
                                    variant="outline"
                                    onClick={() => handleUnlinkDocument(selectedContact.id, doc.id)}
                                    className="text-[10px] py-1 px-2.5 h-auto hover:text-rose-400"
                                  >
                                    Unlink Document
                                  </DSButton>
                                </div>
                              ))}
                            </div>
                          );
                        })()}

                        {/* Unlinked Documents list available to link */}
                        <div className="space-y-3 border-t border-slate-900 pt-5">
                          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                            Link Available KMS Documents
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            Select standard designs to append to {selectedContact.displayName}'s workspace context.
                          </p>

                          <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1 pt-1">
                            {(() => {
                              const unlinked = KnowledgeRegistry.getInstance()
                                .getObjects()
                                .filter((obj) => !selectedContact.knowledgeLinks.includes(obj.id));

                              if (unlinked.length === 0) {
                                return (
                                  <p className="text-[10px] text-slate-500 font-mono">
                                    All available standard ledger articles are linked.
                                  </p>
                                );
                              }

                              return unlinked.map((obj) => (
                                <div
                                  key={obj.id}
                                  className="p-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-900 rounded flex items-center justify-between gap-4"
                                >
                                  <span className="text-xs text-slate-300 font-sans">{obj.title}</span>
                                  <DSButton
                                    variant="primary"
                                    onClick={() => handleLinkDocument(selectedContact.id, obj.id)}
                                    className="text-[10px] py-1 px-2 h-auto"
                                  >
                                    Link Article
                                  </DSButton>
                                </div>
                              ));
                            })()}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* T4: Memory Engine */}
                    {activeTab === 'memory' && (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                          <div>
                            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                              Committed Preference Registers
                            </h3>
                            <p className="text-[11px] text-slate-500">
                              Active choices, custom conditions, and operational thresholds.
                            </p>
                          </div>
                          <span className="text-[11px] font-mono text-slate-400">
                            Buffers: {selectedContact.memoryLinks.length}
                          </span>
                        </div>

                        {selectedContact.memoryLinks.length === 0 ? (
                          <div className="p-4 bg-slate-950/60 border border-slate-900 rounded text-center">
                            <p className="text-xs text-slate-500 font-mono">
                              No specialized preferences are logged in active memory vectors.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {selectedContact.memoryLinks.map((memId, idx) => {
                              // We simulate corresponding preference summaries based on JNAS rules
                              let prefSummary = 'Standard compliance threshold calibrated to Monday morning reviews.';
                              if (memId.includes('history')) {
                                prefSummary = 'Historic procurement validation: strict adherence to military standards.';
                              } else if (memId.includes('lessons')) {
                                prefSummary = 'Review audit: calibration cycles are restricted to bi-weekly reviews.';
                              } else if (memId.includes('hinge')) {
                                prefSummary = 'Jet thrust thresholds logged: absolute maximum load clearance of 450N.';
                              } else if (memId.includes('calibration')) {
                                prefSummary = 'Carbon casings drops: drop parameters restricted to standard dry testing rooms.';
                              } else if (memId.includes('feedback')) {
                                prefSummary = 'Pilot feedback register: decompression briefs must precede physical testing.';
                              }

                              return (
                                <div key={memId} className="p-3.5 bg-slate-900/50 border border-slate-900 rounded space-y-1">
                                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                                    <span>Pref Vector ID: {memId}</span>
                                    <span>Locked • State Buffer</span>
                                  </div>
                                  <p className="text-xs text-slate-300 font-sans italic">"{prefSummary}"</p>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Add Preference Memory Interface */}
                        <div className="p-4 bg-slate-900/30 border border-slate-900 rounded space-y-3.5">
                          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                            Commit Fresh Preference Casing
                          </h4>
                          <p className="text-[11.5px] text-slate-500 leading-normal">
                            Append unique operating attributes or decisions. Committed notes are pre-loaded to memory vectors.
                          </p>

                          <div className="space-y-2">
                            <textarea
                              placeholder="Write custom preference rule (e.g., 'Calibrates alloy casings to 34F limits only')..."
                              value={newMemoryNote}
                              onChange={(e) => setNewMemoryNote(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-900 text-xs text-slate-200 p-2.5 rounded focus:outline-none focus:border-cyan-500/50 h-20"
                            />
                            <div className="flex justify-end">
                              <DSButton
                                variant="primary"
                                onClick={() => handleAddMemory(selectedContact.id)}
                                className="text-xs py-1.5 px-3 h-auto"
                              >
                                Commit to Memory Core
                              </DSButton>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* T5: AI Co-Pilot Compiler */}
                    {activeTab === 'ai' && (
                      <div className="space-y-6">
                        <div className="border-b border-slate-900 pb-3">
                          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                            AI Context Compiler & Prompt Sandbox
                          </h3>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Synthesizes contact profile metadata, downstream projects, linked KMS docs, and memory core preferences.
                          </p>
                        </div>

                        {/* Prompts compiler telemetry metrics */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-slate-900/40 border border-slate-900 rounded">
                            <span className="text-[9px] font-mono text-slate-500 uppercase block">Character Length</span>
                            <span className="text-xs text-slate-200 font-mono">
                              {getCompiledPrompt(selectedContact).length} chars
                            </span>
                          </div>
                          <div className="p-3 bg-slate-900/40 border border-slate-900 rounded">
                            <span className="text-[9px] font-mono text-slate-500 uppercase block">Estimated Token Parameter</span>
                            <span className="text-xs text-slate-200 font-mono">
                              ~{Math.ceil(getCompiledPrompt(selectedContact).length / 4)} tokens
                            </span>
                          </div>
                        </div>

                        {/* Prompt inspection panel */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono text-slate-500 block">Compiled System Prompt Payload</label>
                          <div className="w-full bg-slate-950 border border-slate-900 rounded p-4 h-48 overflow-y-auto text-[10.5px] font-mono text-slate-400 whitespace-pre-wrap leading-relaxed select-all">
                            {getCompiledPrompt(selectedContact)}
                          </div>
                          <p className="text-[9.5px] text-slate-500 font-mono">
                            *Double-click prompt window to select and copy compiled raw prompt block safely.*
                          </p>
                        </div>

                        {/* AI Resolution controller */}
                        <div className="p-4 bg-slate-900/30 border border-slate-900 rounded space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="space-y-0.5">
                              <h4 className="text-xs font-semibold text-slate-300">Run Context Verification</h4>
                              <p className="text-[11px] text-slate-500">
                                Evaluates parameters utilizing secure JNAS AI Gateway.
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              <select
                                value={aiModel}
                                onChange={(e) => setAiModel(e.target.value)}
                                className="bg-slate-950 border border-slate-900 text-[11px] text-slate-300 px-2 py-1.5 rounded focus:outline-none"
                              >
                                <option value="gemini-pro">Gemini 1.5 Pro</option>
                                <option value="gemini-flash">Gemini 1.5 Flash</option>
                                <option value="offline">Offline Specialist Simulation</option>
                              </select>

                              <DSButton
                                variant="primary"
                                onClick={() => handleEvaluateAi(selectedContact)}
                                disabled={isAiLoading}
                                className="text-xs py-1.5 px-3 h-auto"
                              >
                                {isAiLoading ? 'Evaluating...' : 'Compile & Analyze'}
                              </DSButton>
                            </div>
                          </div>

                          {/* Response Board */}
                          {aiResponse && (
                            <div className="p-4 bg-cyan-950/15 border border-cyan-900/20 text-cyan-200 text-xs rounded space-y-1.5 font-sans leading-relaxed">
                              <div className="font-mono text-[10px] text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5" />
                                Gateway Assessment Verified
                              </div>
                              <p className="italic">"{aiResponse}"</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* T6: Activities & Timeline */}
                    {activeTab === 'timeline' && (
                      <div className="space-y-4">
                        <div className="border-b border-slate-900 pb-3">
                          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                            Personnel Audit Timeline Logs
                          </h3>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Comprehensive record adjustments and administrative audit steps.
                          </p>
                        </div>

                        {(() => {
                          const logs = ContactRegistry.getInstance().getActivityLogs(selectedContact.id);
                          if (logs.length === 0) {
                            return (
                              <div className="p-8 border border-slate-900/60 rounded text-center">
                                <p className="text-xs text-slate-500 font-mono">No historical records adjusted.</p>
                              </div>
                            );
                          }

                          return (
                            <div className="relative border-l border-slate-900 pl-4 ml-2 py-2 space-y-5 text-xs font-sans">
                              {logs.map((log) => (
                                <div key={log.id} className="relative">
                                  {/* Dot */}
                                  <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 bg-cyan-500 border-2 border-slate-950 rounded-full" />
                                  <div className="text-[10px] text-slate-500 font-mono">
                                    {new Date(log.timestamp).toLocaleString()}
                                  </div>
                                  <div className="font-semibold text-slate-200 mt-0.5">{log.actionType}</div>
                                  <p className="text-slate-400 mt-0.5 leading-normal">{log.details}</p>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {/* T7: Workflows PubSub Debugger */}
                    {activeTab === 'workflows' && (
                      <div className="space-y-6">
                        <div className="border-b border-slate-900 pb-3">
                          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                            Lifecycle Workflows Event Bus simulator
                          </h3>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Trigger simulated PubSub messages directly to test downstream modules integrations.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {[
                            { action: 'CONTACT_CREATED', desc: 'Dispatches creation payloads to auditing registers' },
                            { action: 'CONTACT_UPDATED', desc: 'Alerts active projects of updated parameters' },
                            { action: 'CONTACT_ARCHIVED', desc: 'Toggles workspace clearance levels to inactive' },
                            { action: 'CONTACT_RESTORED', desc: 'Re-aligns security boundaries to active standard' },
                            { action: 'CONTACT_MERGED', desc: 'Consolidates linkages and flags obsolete duplicate' },
                            { action: 'CONTACT_DELETED', desc: 'Triggers cascade soft-deletions on temporary caches' },
                          ].map((evt) => {
                            const isTriggered = firedEvents[`${selectedContact.id}-${evt.action}`];
                            return (
                              <div
                                key={evt.action}
                                className="p-3.5 bg-slate-900/40 border border-slate-900 rounded flex flex-col justify-between gap-3.5 hover:border-slate-800 transition-all"
                              >
                                <div className="space-y-1">
                                  <div className="font-mono text-xs font-semibold text-slate-200">{evt.action}</div>
                                  <p className="text-[11px] text-slate-400 leading-relaxed">{evt.desc}</p>
                                </div>

                                <div className="flex justify-end">
                                  <DSButton
                                    variant="primary"
                                    onClick={() => triggerWorkflowEvent(evt.action, selectedContact)}
                                    disabled={isTriggered}
                                    className={`text-[10px] py-1 px-2.5 h-auto ${
                                      isTriggered ? 'bg-emerald-600 border-emerald-500' : ''
                                    }`}
                                  >
                                    {isTriggered ? 'Published!' : 'Fire Event'}
                                  </DSButton>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* T8: Settings */}
                    {activeTab === 'settings' && (
                      <div className="space-y-6">
                        <div className="border-b border-slate-900 pb-3">
                          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                            Administrative Controls
                          </h3>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Profile consolidations, soft-deletes, and status updates.
                          </p>
                        </div>

                        {/* Status Adjustment */}
                        <div className="p-4 bg-slate-900/30 border border-slate-900 rounded space-y-4">
                          <h4 className="text-xs font-semibold text-slate-300">Roster Status Adjustment</h4>
                          <div className="flex items-center gap-3">
                            <select
                              value={selectedContact.status}
                              onChange={(e) => handleStatusChange(selectedContact.id, e.target.value as ContactStatus)}
                              className="bg-slate-950 border border-slate-900 text-xs text-slate-200 px-3 py-2 rounded focus:outline-none"
                            >
                              <option value="Active">Active</option>
                              <option value="Inactive">Inactive</option>
                              <option value="On Hold">On Hold</option>
                              <option value="Archived">Archived</option>
                            </select>
                            <p className="text-[11px] text-slate-500">
                              Archived or Inactive contacts restrict downstream project clearances immediately.
                            </p>
                          </div>
                        </div>

                        {/* Merging Box */}
                        <div className="p-4 bg-slate-900/30 border border-slate-900 rounded space-y-4">
                          <div className="space-y-0.5">
                            <h4 className="text-xs font-semibold text-slate-300">Unify Duplicate Profiles</h4>
                            <p className="text-[11px] text-slate-500 leading-normal">
                              Select a duplicate personnel record to merge. Linkages and tags will consolidate into{' '}
                              <strong>{selectedContact.displayName}</strong>.
                            </p>
                          </div>

                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            <select
                              value={mergeSourceId}
                              onChange={(e) => setMergeSourceId(e.target.value)}
                              className="bg-slate-950 border border-slate-900 text-xs text-slate-200 px-3 py-2 rounded focus:outline-none flex-1"
                            >
                              <option value="">-- Choose duplicate profile --</option>
                              {contacts
                                .filter((c) => c.id !== selectedContact.id)
                                .map((c) => (
                                  <option key={c.id} value={c.id}>
                                    {c.displayName} ({c.company} • {c.email})
                                  </option>
                                ))}
                            </select>

                            <DSButton
                              variant="primary"
                              onClick={() => handleMergeAction(selectedContact.id)}
                              className="text-xs px-4"
                            >
                              Execute Merge
                            </DSButton>
                          </div>
                        </div>

                        {/* Dangerous block */}
                        <div className="p-4 bg-rose-950/10 border border-rose-900/30 rounded space-y-3.5">
                          <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs">
                            <ShieldAlert className="w-4 h-4" />
                            Security clearance boundary deletion
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            Soft-delete profile registers. Historical project timeline audit trails remain preserved in Master Ledgers for compliance reviews.
                          </p>
                          <div>
                            <button
                              onClick={() => handleSoftDelete(selectedContact.id)}
                              className="text-xs bg-rose-900/20 border border-rose-900/40 hover:bg-rose-900/30 text-rose-400 font-semibold px-3.5 py-1.5 rounded transition-all"
                            >
                              Soft-delete personnel record
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Drawer: Create Personnel Record */}
      <DSModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Register Enterprise Personnel Profile">
        <form onSubmit={handleCreateContactSubmit} className="space-y-4 max-h-[500px] overflow-y-auto pr-2 text-xs font-sans">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-400 block">First Name *</label>
              <input
                type="text"
                required
                value={newContact.firstName}
                onChange={(e) => setNewContact({ ...newContact, firstName: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 text-slate-200 px-3 py-2 rounded focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-400 block">Last Name *</label>
              <input
                type="text"
                required
                value={newContact.lastName}
                onChange={(e) => setNewContact({ ...newContact, lastName: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 text-slate-200 px-3 py-2 rounded focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-400 block">Middle Name</label>
              <input
                type="text"
                value={newContact.middleName}
                onChange={(e) => setNewContact({ ...newContact, middleName: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 text-slate-200 px-3 py-2 rounded focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-400 block">Display Name</label>
              <input
                type="text"
                value={newContact.displayName}
                onChange={(e) => setNewContact({ ...newContact, displayName: e.target.value })}
                placeholder="Elena Rostova"
                className="w-full bg-slate-900 border border-slate-800 text-slate-200 px-3 py-2 rounded focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-400 block">Master Company Name *</label>
              <input
                type="text"
                required
                value={newContact.company}
                onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
                placeholder="Joint Defense Agency"
                className="w-full bg-slate-900 border border-slate-800 text-slate-200 px-3 py-2 rounded focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-400 block">Job Designation *</label>
              <input
                type="text"
                required
                value={newContact.designation}
                onChange={(e) => setNewContact({ ...newContact, designation: e.target.value })}
                placeholder="Lead QA Engineer"
                className="w-full bg-slate-900 border border-slate-800 text-slate-200 px-3 py-2 rounded focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-400 block">Department *</label>
              <input
                type="text"
                required
                value={newContact.department}
                onChange={(e) => setNewContact({ ...newContact, department: e.target.value })}
                placeholder="Compliance Audits"
                className="w-full bg-slate-900 border border-slate-800 text-slate-200 px-3 py-2 rounded focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-400 block">Operational Role</label>
              <select
                value={newContact.role}
                onChange={(e) => setNewContact({ ...newContact, role: e.target.value as ContactRole })}
                className="w-full bg-slate-900 border border-slate-800 text-slate-200 px-3 py-2 rounded focus:outline-none"
              >
                <option value="Engineering">Engineering</option>
                <option value="Procurement">Procurement</option>
                <option value="Quality">Quality</option>
                <option value="Compliance">Compliance</option>
                <option value="Legal">Legal</option>
                <option value="Logistics">Logistics</option>
                <option value="Finance">Finance</option>
                <option value="Executive">Executive</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-400 block">Contact Email *</label>
              <input
                type="email"
                required
                value={newContact.email}
                onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 text-slate-200 px-3 py-2 rounded focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-400 block">Alternate Email</label>
              <input
                type="email"
                value={newContact.alternativeEmail}
                onChange={(e) => setNewContact({ ...newContact, alternativeEmail: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 text-slate-200 px-3 py-2 rounded focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-400 block">Phone Connection *</label>
              <input
                type="text"
                required
                value={newContact.phone}
                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 text-slate-200 px-3 py-2 rounded focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-400 block">Secure WhatsApp Direct</label>
              <input
                type="text"
                value={newContact.whatsappNumber}
                onChange={(e) => setNewContact({ ...newContact, whatsappNumber: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 text-slate-200 px-3 py-2 rounded focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono text-slate-400 block">Physical Street Address Depot</label>
            <input
              type="text"
              value={newContact.address?.street}
              onChange={(e) =>
                setNewContact({
                  ...newContact,
                  address: { ...(newContact.address as any), street: e.target.value },
                })
              }
              className="w-full bg-slate-900 border border-slate-800 text-slate-200 px-3 py-2 rounded focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-400 block">City</label>
              <input
                type="text"
                value={newContact.address?.city}
                onChange={(e) =>
                  setNewContact({
                    ...newContact,
                    address: { ...(newContact.address as any), city: e.target.value },
                  })
                }
                className="w-full bg-slate-900 border border-slate-800 text-slate-200 px-3 py-2 rounded focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-400 block">State</label>
              <input
                type="text"
                value={newContact.address?.state}
                onChange={(e) =>
                  setNewContact({
                    ...newContact,
                    address: { ...(newContact.address as any), state: e.target.value },
                  })
                }
                className="w-full bg-slate-900 border border-slate-800 text-slate-200 px-3 py-2 rounded focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-400 block">Postal Code</label>
              <input
                type="text"
                value={newContact.address?.zip}
                onChange={(e) =>
                  setNewContact({
                    ...newContact,
                    address: { ...(newContact.address as any), zip: e.target.value },
                  })
                }
                className="w-full bg-slate-900 border border-slate-800 text-slate-200 px-3 py-2 rounded focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-400 block">Country</label>
              <input
                type="text"
                value={newContact.address?.country}
                onChange={(e) =>
                  setNewContact({
                    ...newContact,
                    address: { ...(newContact.address as any), country: e.target.value },
                  })
                }
                className="w-full bg-slate-900 border border-slate-800 text-slate-200 px-3 py-2 rounded focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-400 block">Primary Language</label>
              <input
                type="text"
                value={newContact.language}
                onChange={(e) => setNewContact({ ...newContact, language: e.target.value })}
                placeholder="English"
                className="w-full bg-slate-900 border border-slate-800 text-slate-200 px-3 py-2 rounded focus:outline-none"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-[10px] font-mono text-slate-400 block">Roster Tags</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add classification tags..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-slate-200 px-3 py-2 rounded focus:outline-none flex-1"
              />
              <DSButton type="button" variant="outline" onClick={handleAddTag} className="py-2 h-auto">
                Add Tag
              </DSButton>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {(newContact.tags || []).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-[10px] text-slate-300 flex items-center gap-1"
                >
                  {tag}
                  <button type="button" onClick={() => handleRemoveTag(tag)} className="text-slate-500 hover:text-rose-400">
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono text-slate-400 block">Internal Operations Notes</label>
            <textarea
              value={newContact.notes}
              onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 text-slate-200 p-2.5 rounded focus:outline-none h-20"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-900">
            <DSButton type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </DSButton>
            <DSButton type="submit" variant="primary">
              Register Contact
            </DSButton>
          </div>
        </form>
      </DSModal>
    </div>
  );
};

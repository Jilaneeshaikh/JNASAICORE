import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Folder,
  FileText,
  Plus,
  Search,
  Filter,
  Tag,
  Link,
  Calendar,
  Shield,
  Activity,
  Sparkles,
  Download,
  Edit,
  Trash2,
  Archive,
  RotateCcw,
  Check,
  Grid,
  List,
  Copy,
  FileCode,
  SlidersHorizontal,
  X,
  PlusCircle,
  FolderClosed,
  ChevronRight,
  User,
  Hash,
  Share2,
  Lock,
  Globe,
  Star,
  RefreshCw,
  HardDrive
} from 'lucide-react';

// Platform Registries & Domain Entities
import { DocumentRegistry } from '../backend/documents/registry';
import {
  Document as DocType,
  DocumentType,
  DocumentCategory,
  DocumentStatus,
  ConfidentialityLevel,
  FolderType
} from '../backend/documents/types';
import { CustomerRegistry } from '../backend/customers/registry';
import { ProjectRegistry } from '../backend/projects/registry';
import { ContactRegistry } from '../backend/contacts/registry';
import { KnowledgeRegistry } from '../backend/knowledge/registry';
import { eventBus } from '../core';

// JNAS Swiss Design System Components
import { DSButton } from '../components/design-system/DSButton';
import { DSCard, DSCardContent, DSCardHeader, DSCardTitle, DSCardSubtitle } from '../components/design-system/DSCard';
import { DSInput, DSTextarea, DSSelect, DSSwitch } from '../components/design-system/DSForm';
import { DSModal } from '../components/design-system/DSDialog';
import { DSBadge, DSEmptyState, DSAlert } from '../components/design-system/DSStatus';
import { DSBreadcrumbs } from '../components/design-system/DSNavigation';
import { useNotification } from '../contexts/NotificationContext';

export const DocumentsPage: React.FC = () => {
  const { triggerToast } = useNotification();
  const registry = DocumentRegistry.getInstance();

  // Primary State
  const [documents, setDocuments] = useState<DocType[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [activeFolder, setActiveFolder] = useState<FolderType>('workspace');
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('list');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterConfidentiality, setFilterConfidentiality] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isRelinkOpen, setIsRelinkOpen] = useState(false);

  // Detail View Sub-Tabs
  const [detailTab, setDetailTab] = useState<'overview' | 'metadata' | 'relationships' | 'activity' | 'ai'>('overview');

  // Upload Form State
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadFilename, setUploadFilename] = useState('');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadType, setUploadType] = useState<DocumentType>('pdf');
  const [uploadCategory, setUploadCategory] = useState<DocumentCategory>('General');
  const [uploadWorkspace, setUploadWorkspace] = useState<'personal' | 'engineering' | 'learning' | 'business' | 'admin'>('personal');
  const [uploadConfidentiality, setUploadConfidentiality] = useState<ConfidentialityLevel>('Internal');
  const [uploadAuthor, setUploadAuthor] = useState('System Operator');
  const [uploadDepartment, setUploadDepartment] = useState('Operations');
  const [uploadRevision, setUploadRevision] = useState('Rev A');
  const [uploadTags, setUploadTags] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Edit Form State
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editCategory, setEditCategory] = useState<DocumentCategory>('General');
  const [editConfidentiality, setEditConfidentiality] = useState<ConfidentialityLevel>('Internal');
  const [editStatus, setEditStatus] = useState<DocumentStatus>('Draft');
  const [editRevision, setEditRevision] = useState('Rev A');
  const [editTags, setEditTags] = useState('');

  // Relationship Linking State
  const [linkType, setLinkType] = useState<'customer' | 'project' | 'contact' | 'kms'>('customer');
  const [linkTargetId, setLinkTargetId] = useState('');

  // File Input Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Refresh lists helper
  const refreshDocumentsList = () => {
    // Get non-deleted items
    const all = registry.getDocuments(true, true); // Get all, then we apply folder constraint
    setDocuments(all);
  };

  // Initial Load & Event Listener
  useEffect(() => {
    // Initialize Registry and load data
    registry.initialize();
    refreshDocumentsList();

    // Check for incoming commands from deep links
    const handleCommand = () => {
      const cmd = (window as any).__lastDocCommand;
      if (cmd) {
        if (cmd === 'upload-document') {
          setIsUploadOpen(true);
        } else if (cmd === 'search-document') {
          const searchInput = document.getElementById('doc-search-input');
          if (searchInput) searchInput.focus();
        } else if (cmd === 'favorite-documents') {
          setActiveFolder('favorites');
        } else if (cmd === 'archive-document') {
          setActiveFolder('archive');
        } else if (cmd === 'recent-documents') {
          setActiveFolder('personal');
        }
        (window as any).__lastDocCommand = null;
      }
    };

    handleCommand();
    const interval = setInterval(handleCommand, 500);

    return () => clearInterval(interval);
  }, []);

  // Set initial selected document if none is active
  useEffect(() => {
    if (documents.length > 0 && !selectedDocId) {
      // Pick first non-deleted matching document
      const currentFiltered = filteredDocs;
      if (currentFiltered.length > 0) {
        setSelectedDocId(currentFiltered[0].id);
      }
    }
  }, [documents]);

  const selectedDoc = useMemo(() => {
    if (!selectedDocId) return null;
    return registry.getDocument(selectedDocId);
  }, [selectedDocId, documents]);

  // Load Edit States
  useEffect(() => {
    if (selectedDoc) {
      setEditTitle(selectedDoc.title);
      setEditDesc(selectedDoc.description || '');
      setEditCategory(selectedDoc.category);
      setEditConfidentiality(selectedDoc.confidentiality);
      setEditStatus(selectedDoc.status);
      setEditRevision(selectedDoc.revision);
      setEditTags(selectedDoc.tags.join(', '));
    }
  }, [selectedDocId]);

  // Fetch available entities for linking dropdowns
  const customersList = useMemo(() => CustomerRegistry.getInstance().getCustomers(), []);
  const projectsList = useMemo(() => ProjectRegistry.getInstance().getProjects(), []);
  const contactsList = useMemo(() => ContactRegistry.getInstance().getContacts(), []);
  const kmsList = useMemo(() => KnowledgeRegistry.getInstance().getObjects(), []);

  // Filter documents by Active Folder Structure (Logical Only)
  const filteredDocsByFolder = useMemo(() => {
    return documents.filter(doc => {
      // Soft Delete check first
      if (doc.softDelete) return activeFolder === 'archive'; // Deleted documents show in archive/recycle-bin

      // logical directory mappings
      switch (activeFolder) {
        case 'favorites':
          return doc.isFavorite && !doc.archiveStatus;
        case 'archive':
          return doc.archiveStatus || doc.softDelete;
        case 'personal':
          return doc.workspace === 'personal' && !doc.archiveStatus;
        case 'shared':
          return doc.workspace === 'business' && !doc.archiveStatus;
        case 'engineering':
          return doc.workspace === 'engineering' && !doc.archiveStatus;
        case 'packaging':
          return doc.category === 'Packaging' && !doc.archiveStatus;
        case 'knowledge':
          return doc.category === 'Knowledge' && !doc.archiveStatus;
        case 'customer':
          return !!doc.customer && !doc.archiveStatus;
        case 'project':
          return !!doc.project && !doc.archiveStatus;
        case 'workspace':
        default:
          return !doc.archiveStatus; // Show all non-archived in universal workspace
      }
    });
  }, [documents, activeFolder]);

  // Apply Live Search Criteria
  const filteredDocs = useMemo(() => {
    return filteredDocsByFolder.filter(doc => {
      // Dropdown filters
      if (filterType !== 'all' && doc.type !== filterType) return false;
      if (filterCategory !== 'all' && doc.category !== filterCategory) return false;
      if (filterConfidentiality !== 'all' && doc.confidentiality !== filterConfidentiality) return false;
      if (filterStatus !== 'all' && doc.status !== filterStatus) return false;

      // Text query search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = doc.title.toLowerCase().includes(q);
        const matchesFilename = doc.displayName.toLowerCase().includes(q);
        const matchesDesc = doc.description?.toLowerCase().includes(q) || false;
        const matchesAuthor = doc.author.toLowerCase().includes(q);
        const matchesDept = doc.department.toLowerCase().includes(q);
        const matchesTags = doc.tags.some(t => t.toLowerCase().includes(q));

        return matchesTitle || matchesFilename || matchesDesc || matchesAuthor || matchesDept || matchesTags;
      }

      return true;
    });
  }, [filteredDocsByFolder, searchQuery, filterType, filterCategory, filterConfidentiality, filterStatus]);

  // File Upload Handlers (Logical Only)
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploadFilename(file.name);
      setUploadTitle(file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " "));
      
      // Attempt to map type
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext) {
        if (['pdf'].includes(ext)) setUploadType('pdf');
        else if (['doc', 'docx'].includes(ext)) setUploadType('word');
        else if (['xls', 'xlsx'].includes(ext)) setUploadType('excel');
        else if (['ppt', 'pptx'].includes(ext)) setUploadType('powerpoint');
        else if (['md'].includes(ext)) setUploadType('markdown');
        else if (['csv'].includes(ext)) setUploadType('csv');
        else if (['json'].includes(ext)) setUploadType('json');
        else if (['png', 'jpg', 'jpeg'].includes(ext)) setUploadType('image');
        else if (['step'].includes(ext)) setUploadType('cad');
        else if (['zip'].includes(ext)) setUploadType('archive');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadFilename(file.name);
      setUploadTitle(file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " "));
    }
  };

  const executeUpload = () => {
    if (!uploadTitle.trim() || !uploadFilename.trim()) {
      triggerToast('warning', 'Please provide a Document Title and Select or drop a file.');
      return;
    }

    setIsUploading(true);

    // Mock network lag
    setTimeout(() => {
      const tagArr = uploadTags.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
      
      const newDoc = registry.createDocument({
        title: uploadTitle,
        displayName: uploadFilename,
        description: uploadDesc,
        type: uploadType,
        category: uploadCategory,
        workspace: uploadWorkspace,
        confidentiality: uploadConfidentiality,
        author: uploadAuthor,
        department: uploadDepartment,
        revision: uploadRevision,
        tags: tagArr,
        size: Math.floor(Math.random() * 5000000) + 50000, // Random bytes size
      });

      refreshDocumentsList();
      setSelectedDocId(newDoc.id);
      setIsUploading(false);
      setIsUploadOpen(false);
      triggerToast('success', `Document "${uploadTitle}" registered successfully inside JNAS Registry.`);

      // Reset form
      setUploadTitle('');
      setUploadFilename('');
      setUploadDesc('');
      setUploadTags('');
    }, 1500);
  };

  // Metadata Updates
  const executeEdit = () => {
    if (!selectedDocId || !editTitle.trim()) return;

    const tagArr = editTags.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    registry.updateDocument(selectedDocId, {
      title: editTitle,
      description: editDesc,
      category: editCategory,
      confidentiality: editConfidentiality,
      status: editStatus,
      revision: editRevision,
      tags: tagArr
    });

    refreshDocumentsList();
    setIsEditOpen(false);
    triggerToast('success', 'Document metadata committed successfully.');
  };

  // State Transitions
  const toggleFav = (id: string) => {
    const nextVal = registry.toggleFavorite(id);
    refreshDocumentsList();
    triggerToast('success', nextVal ? 'Added file to Favorites rail.' : 'Removed from Favorites.');
  };

  const archiveDoc = (id: string) => {
    registry.archiveDocument(id);
    refreshDocumentsList();
    triggerToast('info', 'Document isolated to Archive folder.');
  };

  const restoreDoc = (id: string) => {
    registry.unarchiveDocument(id);
    registry.restoreDocument(id);
    refreshDocumentsList();
    triggerToast('success', 'Document recovered back to active workspace.');
  };

  const deleteDoc = (id: string) => {
    if (confirm('Are you sure you want to transfer this file to the trash bin? It will remain flagged for soft-delete.')) {
      registry.deleteDocument(id);
      refreshDocumentsList();
      triggerToast('rose' as any, 'Document moved to recycle bin.');
    }
  };

  const hardWipeDoc = (id: string) => {
    if (confirm('CRITICAL ACTION: Permanently wipe this document from JNAS master registry ledger? This action cannot be undone.')) {
      registry.hardWipeDocument(id);
      setSelectedDocId(null);
      refreshDocumentsList();
      triggerToast('error', 'Document purged permanently from platform memory.');
    }
  };

  // Relations Linking Handlers
  const executeLink = () => {
    if (!selectedDocId || !linkTargetId) return;

    const linked = registry.linkEntity(selectedDocId, linkType, linkTargetId);
    if (linked) {
      refreshDocumentsList();
      setIsRelinkOpen(false);
      triggerToast('success', `Linked document to entity ID: ${linkTargetId}`);
    } else {
      triggerToast('warning', 'Link already exists or document reference error.');
    }
  };

  const executeUnlink = (type: 'customer' | 'project' | 'contact' | 'kms' | 'memory', val: string) => {
    if (!selectedDocId) return;
    registry.unlinkEntity(selectedDocId, type, val);
    refreshDocumentsList();
    triggerToast('info', `Severed link to entity ID: ${val}`);
  };

  // Mock Download File
  const triggerMockDownload = (doc: DocType) => {
    registry.logActivity(doc.id, 'Downloaded', `Dispatched package payload stream to client. Package MD5: ${doc.checksum}`);
    refreshDocumentsList();
    
    // Animate standard file fetch
    triggerToast('info', `Downloading stream: ${doc.displayName}...`);
    setTimeout(() => {
      triggerToast('success', `Download completed: ${doc.displayName} (${(doc.size / 1024 / 1024).toFixed(2)} MB)`);
    }, 1200);
  };

  // Format Helper
  const formatSize = (bytes: number) => {
    if (bytes >= 1048576) {
      return (bytes / 1048576).toFixed(2) + ' MB';
    }
    return (bytes / 1024).toFixed(1) + ' KB';
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Structured AI Context Generator XML Schema representation
  const aiContextXML = useMemo(() => {
    if (!selectedDoc) return '';
    return `<JNAS_DOCUMENT_CONTEXT>
  <ID>${selectedDoc.id}</ID>
  <TITLE>${selectedDoc.title}</TITLE>
  <FILENAME>${selectedDoc.displayName}</FILENAME>
  <DESCRIPTION>${selectedDoc.description || 'No descriptive context available.'}</DESCRIPTION>
  <TYPE>${selectedDoc.type.toUpperCase()}</TYPE>
  <CATEGORY>${selectedDoc.category}</CATEGORY>
  <MODULE>${selectedDoc.module}</MODULE>
  <VERSION>${selectedDoc.version}.0</VERSION>
  <METADATA>
    <AUTHOR>${selectedDoc.author}</AUTHOR>
    <DEPARTMENT>${selectedDoc.department}</DEPARTMENT>
    <REVISION>${selectedDoc.revision}</REVISION>
    <CONFIDENTIALITY>${selectedDoc.confidentiality}</CONFIDENTIALITY>
    <APPROVAL_STATUS>${selectedDoc.approvalStatus}</APPROVAL_STATUS>
    <CREATED_DATE>${selectedDoc.createdDate}</CREATED_DATE>
    <UPDATED_DATE>${selectedDoc.updatedDate}</UPDATED_DATE>
    <STORAGE_PATH>${selectedDoc.storageLocation}</STORAGE_PATH>
  </METADATA>
  <RELATIONSHIPS>
    <CUSTOMER_IDS>${selectedDoc.customerLinks.join(', ') || 'None'}</CUSTOMER_IDS>
    <PROJECT_IDS>${selectedDoc.projectLinks.join(', ') || 'None'}</PROJECT_IDS>
    <CONTACT_IDS>${selectedDoc.contactLinks.join(', ') || 'None'}</CONTACT_IDS>
    <KNOWLEDGE_IDS>${selectedDoc.knowledgeLinks.join(', ') || 'None'}</KNOWLEDGE_IDS>
    <MEMORY_LOG_IDS>${selectedDoc.memoryLinks.join(', ') || 'None'}</MEMORY_LOG_IDS>
  </RELATIONSHIPS>
</JNAS_DOCUMENT_CONTEXT>`;
  }, [selectedDoc]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    triggerToast('success', 'Structured document AI context copied to host clipboard.');
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#07090e] border-l border-slate-900 overflow-hidden font-sans">
      
      {/* Upper Action Rail / Breadcrumbs */}
      <div className="px-6 py-4 border-b border-slate-900 bg-slate-950/60 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <DSBreadcrumbs
            items={[
              { label: 'System Dashboard', href: '#/dashboard' },
              { label: 'Document Platform' }
            ]}
          />
          <h1 className="text-xl font-semibold tracking-tight text-slate-100 mt-1 flex items-center gap-2">
            <Folder className="w-5 h-5 text-cyan-400" />
            Enterprise Document Center
            <span className="text-[10px] bg-cyan-950/40 border border-cyan-500/20 text-cyan-400 font-mono px-2 py-0.5 rounded-xs tracking-wider uppercase font-semibold">
              V0.2 Core
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <DSButton
            variant="outline"
            size="sm"
            onClick={() => setShowFiltersPanel(!showFiltersPanel)}
            leftIcon={<SlidersHorizontal className="w-4 h-4 text-cyan-400" />}
          >
            Filters
          </DSButton>
          <DSButton
            variant="primary"
            size="sm"
            onClick={() => setIsUploadOpen(true)}
            leftIcon={<Plus className="w-4 h-4 text-slate-950" />}
          >
            Upload Document
          </DSButton>
        </div>
      </div>

      {/* Main Split Layout: Sidebar Directories + Main Roster + Detail Inspection Workspace */}
      <div className="flex-1 flex min-h-0 divide-x divide-slate-900 relative">
        
        {/* Left Column: Logical Organization Folder Tree (Swiss Styled) */}
        <aside className="hidden lg:flex flex-col w-56 shrink-0 bg-slate-950/40 p-3 select-none">
          <div className="px-2.5 py-1.5 text-[10px] text-slate-500 font-mono font-bold tracking-wider uppercase">
            Platform Directories
          </div>
          
          <nav className="mt-2 space-y-1">
            <button
              onClick={() => setActiveFolder('workspace')}
              className={`w-full text-left flex items-center justify-between p-2 text-xs rounded-xs transition-colors group ${activeFolder === 'workspace' ? 'bg-cyan-950/30 border-l-2 border-cyan-500 text-cyan-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'}`}
            >
              <div className="flex items-center gap-2.5">
                <Folder className="w-4 h-4 text-cyan-500" />
                <span>All Documents</span>
              </div>
              <span className="text-[10px] font-mono text-slate-600 group-hover:text-slate-400">
                {documents.filter(d => !d.archiveStatus && !d.softDelete).length}
              </span>
            </button>

            <button
              onClick={() => setActiveFolder('favorites')}
              className={`w-full text-left flex items-center justify-between p-2 text-xs rounded-xs transition-colors group ${activeFolder === 'favorites' ? 'bg-cyan-950/30 border-l-2 border-cyan-500 text-cyan-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'}`}
            >
              <div className="flex items-center gap-2.5">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400/10" />
                <span>Favorites</span>
              </div>
              <span className="text-[10px] font-mono text-slate-600 group-hover:text-slate-400">
                {documents.filter(d => d.isFavorite && !docArchiveCheck(d)).length}
              </span>
            </button>
          </nav>

          <div className="mt-6 px-2.5 py-1.5 text-[10px] text-slate-500 font-mono font-bold tracking-wider uppercase">
            Workspaces & Folders
          </div>

          <nav className="mt-2 space-y-1">
            {[
              { id: 'personal', label: 'Personal Folders', icon: FolderClosed },
              { id: 'shared', label: 'Corporate Shared', icon: FolderClosed },
              { id: 'engineering', label: 'Engineering Assets', icon: HardDrive },
              { id: 'packaging', label: 'Packaging Specs', icon: Hash },
              { id: 'knowledge', label: 'KMS Library Links', icon: FileCode },
              { id: 'customer', label: 'Client Accounts Documents', icon: Share2 },
              { id: 'project', label: 'Milestone Records', icon: Calendar },
            ].map(f => {
              const count = documents.filter(d => {
                if (d.softDelete || d.archiveStatus) return false;
                if (f.id === 'personal') return d.workspace === 'personal';
                if (f.id === 'shared') return d.workspace === 'business';
                if (f.id === 'engineering') return d.workspace === 'engineering';
                if (f.id === 'packaging') return d.category === 'Packaging';
                if (f.id === 'knowledge') return d.category === 'Knowledge';
                if (f.id === 'customer') return !!d.customer;
                if (f.id === 'project') return !!d.project;
                return false;
              }).length;

              return (
                <button
                  key={f.id}
                  onClick={() => setActiveFolder(f.id as FolderType)}
                  className={`w-full text-left flex items-center justify-between p-2 text-xs rounded-xs transition-colors group ${activeFolder === f.id ? 'bg-cyan-950/30 border-l-2 border-cyan-500 text-cyan-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'}`}
                >
                  <div className="flex items-center gap-2.5">
                    <f.icon className="w-4 h-4 text-slate-500 group-hover:text-cyan-400" />
                    <span>{f.label}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-600 group-hover:text-slate-400">
                    {count}
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="mt-auto pt-4 border-t border-slate-900/40">
            <button
              onClick={() => setActiveFolder('archive')}
              className={`w-full text-left flex items-center justify-between p-2.5 text-xs rounded-xs transition-colors group ${activeFolder === 'archive' ? 'bg-rose-950/10 border-l-2 border-rose-500 text-rose-400' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/20'}`}
            >
              <div className="flex items-center gap-2.5">
                <Archive className="w-4 h-4" />
                <span>Archive & Trash</span>
              </div>
              <span className="text-[10px] font-mono text-slate-600">
                {documents.filter(d => d.archiveStatus || d.softDelete).length}
              </span>
            </button>
          </div>
        </aside>

        {/* Middle Column: Search + Live Filter Controls + Grid / List Files Roster */}
        <section className="flex-1 flex flex-col min-h-0 bg-slate-950/20">
          
          {/* Quick Search & Filters drawer bar */}
          <div className="p-4 border-b border-slate-900 bg-slate-950/40 flex flex-col gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-900 border border-slate-800 rounded-sm flex items-center px-3 py-1.5 focus-within:border-cyan-500/30 transition-all">
                <Search className="w-4 h-4 text-slate-500 mr-2 shrink-0" />
                <input
                  id="doc-search-input"
                  type="text"
                  placeholder={`Search in [${activeFolder.toUpperCase()}] directory (e.g., nozzle, as9100)...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none text-xs text-slate-200 focus:outline-none w-full placeholder-slate-500"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="p-0.5 text-slate-500 hover:text-slate-300">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center bg-slate-900 border border-slate-800 rounded-sm p-0.5">
                <button
                  onClick={() => setLayoutMode('list')}
                  className={`p-1.5 rounded-sm transition-colors ${layoutMode === 'list' ? 'bg-cyan-950/40 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setLayoutMode('grid')}
                  className={`p-1.5 rounded-sm transition-colors ${layoutMode === 'grid' ? 'bg-cyan-950/40 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  <Grid className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Advanced Filters Overlay panel */}
            {showFiltersPanel && (
              <div className="p-3 bg-slate-950 border border-slate-900 rounded-sm grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-xs animate-in fade-in-50 duration-200">
                <div>
                  <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-1">
                    File Type
                  </label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs px-2.5 py-1 focus:outline-none focus:border-cyan-500/30 font-mono"
                  >
                    <option value="all">ALL TYPES</option>
                    <option value="pdf">PDF</option>
                    <option value="word">Word</option>
                    <option value="excel">Excel</option>
                    <option value="powerpoint">PowerPoint</option>
                    <option value="markdown">Markdown</option>
                    <option value="text">Text</option>
                    <option value="csv">CSV</option>
                    <option value="json">JSON</option>
                    <option value="image">Image</option>
                    <option value="cad">STEP Metadata</option>
                    <option value="archive">ZIP Archive</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-1">
                    Doc Category
                  </label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs px-2.5 py-1 focus:outline-none focus:border-cyan-500/30"
                  >
                    <option value="all">ALL CATEGORIES</option>
                    <option value="CRM">CRM</option>
                    <option value="Projects">Projects</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Packaging">Packaging</option>
                    <option value="Knowledge">Knowledge Base</option>
                    <option value="LMS">LMS Learning</option>
                    <option value="HR">HR & Roster</option>
                    <option value="Finance">Finance</option>
                    <option value="Procurement">Procurement</option>
                    <option value="Quality">Quality Control</option>
                    <option value="Administration">Administration</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-1">
                    Confidentiality
                  </label>
                  <select
                    value={filterConfidentiality}
                    onChange={(e) => setFilterConfidentiality(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs px-2.5 py-1 focus:outline-none focus:border-cyan-500/30"
                  >
                    <option value="all">ALL LEVELS</option>
                    <option value="Unclassified">Unclassified</option>
                    <option value="Internal">Internal</option>
                    <option value="Confidential">Confidential</option>
                    <option value="StrictlyConfidential">Strictly Confidential</option>
                    <option value="Secret">Secret</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-1">
                    Status Flag
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs px-2.5 py-1 focus:outline-none focus:border-cyan-500/30"
                  >
                    <option value="all">ALL STATUSES</option>
                    <option value="Draft">Draft</option>
                    <option value="Review">In Review</option>
                    <option value="Approved">Approved</option>
                    <option value="Released">Released</option>
                    <option value="Archived">Archived</option>
                    <option value="Deprecated">Deprecated</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Core Files Directory Display */}
          <div className="flex-1 p-4 overflow-y-auto">
            {filteredDocs.length === 0 ? (
              <div className="py-16">
                <DSEmptyState
                  title={`No Documents in ${activeFolder.toUpperCase()}`}
                  description="No registered files matched your active folder location, text queries, or filter settings."
                  action={
                    <DSButton
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSearchQuery('');
                        setFilterType('all');
                        setFilterCategory('all');
                        setFilterConfidentiality('all');
                        setFilterStatus('all');
                      }}
                    >
                      Reset Filter Criteria
                    </DSButton>
                  }
                />
              </div>
            ) : layoutMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredDocs.map(doc => {
                  const isSel = doc.id === selectedDocId;
                  const TypeIcon = getFileIcon(doc.type);
                  return (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDocId(doc.id)}
                      className={`p-4 border rounded-sm flex flex-col gap-3 cursor-pointer transition-all ${isSel ? 'bg-cyan-950/20 border-cyan-500/60 shadow-lg shadow-cyan-950/10' : 'bg-slate-950/40 border-slate-900 hover:border-slate-800'}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="p-2 bg-slate-900 border border-slate-800 rounded-sm">
                          <TypeIcon className={`w-5 h-5 ${isSel ? 'text-cyan-400 animate-pulse' : 'text-slate-400'}`} />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleFav(doc.id); }}
                            className="p-1 hover:bg-slate-900 rounded-xs text-slate-500 hover:text-amber-400"
                          >
                            <Star className={`w-3.5 h-3.5 ${doc.isFavorite ? 'text-amber-400 fill-amber-400/20' : ''}`} />
                          </button>
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-xs font-semibold text-slate-200 truncate leading-tight">
                          {doc.title}
                        </h3>
                        <p className="text-[10px] text-slate-400 font-mono mt-1 truncate">
                          {doc.displayName}
                        </p>
                        <p className="text-[10px] text-slate-500 leading-normal mt-1.5 line-clamp-2">
                          {doc.description || 'No summary registered.'}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[9px] font-mono text-slate-500">
                        <span>{formatSize(doc.size)}</span>
                        <span>{doc.revision}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="border border-slate-900 rounded-sm overflow-hidden bg-slate-950/30">
                <table className="w-full text-left border-collapse text-xs font-sans">
                  <thead>
                    <tr className="border-b border-slate-900 bg-slate-950 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                      <th className="p-3 w-8"></th>
                      <th className="p-3">Title / Path</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Confidentiality</th>
                      <th className="p-3">Updated</th>
                      <th className="p-3 text-right">Size</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/60">
                    {filteredDocs.map(doc => {
                      const isSel = doc.id === selectedDocId;
                      const TypeIcon = getFileIcon(doc.type);
                      return (
                        <tr
                          key={doc.id}
                          onClick={() => setSelectedDocId(doc.id)}
                          className={`group cursor-pointer hover:bg-slate-900/40 transition-colors ${isSel ? 'bg-cyan-950/10' : ''}`}
                        >
                          <td className="p-3 text-center">
                            <TypeIcon className="w-4 h-4 text-slate-400" />
                          </td>
                          <td className="p-3">
                            <div className="flex flex-col min-w-0">
                              <span className="font-semibold text-slate-200 group-hover:text-cyan-400 truncate">
                                {doc.title}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">
                                {doc.displayName} (v{doc.version}.0)
                              </span>
                            </div>
                          </td>
                          <td className="p-3">
                            <DSBadge variant="outline" color={getCategoryColor(doc.category)}>
                              {doc.category}
                            </DSBadge>
                          </td>
                          <td className="p-3 font-mono text-[10px]">
                            <span className={getConfidentialityClass(doc.confidentiality)}>
                              {doc.confidentiality}
                            </span>
                          </td>
                          <td className="p-3 text-slate-400 font-mono text-[10px]">
                            {doc.updatedDate.split('T')[0]}
                          </td>
                          <td className="p-3 text-right text-slate-400 font-mono text-[10px]">
                            {formatSize(doc.size)}
                          </td>
                          <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => toggleFav(doc.id)}
                                className="p-1 hover:bg-slate-900 rounded-xs text-slate-500 hover:text-amber-400 transition-colors"
                              >
                                <Star className={`w-3.5 h-3.5 ${doc.isFavorite ? 'text-amber-400 fill-amber-400/20' : ''}`} />
                              </button>
                              <button
                                onClick={() => triggerMockDownload(doc)}
                                className="p-1 hover:bg-slate-900 rounded-xs text-slate-500 hover:text-cyan-400 transition-colors"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* Right Column: Detailed Inspector Workspace Panel */}
        {selectedDoc && (
          <aside className="hidden xl:flex flex-col w-[420px] bg-slate-950 border-l border-slate-900 p-4 shrink-0 overflow-y-auto">
            
            {/* Header / Meta properties */}
            <div className="pb-4 border-b border-slate-900">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded">
                  DOC ID: {selectedDoc.id}
                </span>
                
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => toggleFav(selectedDoc.id)}
                    className="p-1.5 bg-slate-900 border border-slate-800 hover:border-amber-500/30 text-slate-400 hover:text-amber-400 rounded-sm"
                  >
                    <Star className={`w-3.5 h-3.5 ${selectedDoc.isFavorite ? 'text-amber-400 fill-amber-400/10' : ''}`} />
                  </button>
                  <button
                    onClick={() => setIsEditOpen(true)}
                    className="p-1.5 bg-slate-900 border border-slate-800 hover:border-cyan-500/30 text-slate-400 hover:text-cyan-400 rounded-sm"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  {selectedDoc.archiveStatus || selectedDoc.softDelete ? (
                    <button
                      onClick={() => restoreDoc(selectedDoc.id)}
                      className="p-1.5 bg-slate-900 border border-slate-800 hover:border-emerald-500/30 text-slate-400 hover:text-emerald-400 rounded-sm"
                      title="Restore File"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => archiveDoc(selectedDoc.id)}
                      className="p-1.5 bg-slate-900 border border-slate-800 hover:border-amber-500/30 text-slate-400 hover:text-amber-400 rounded-sm"
                      title="Archive File"
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {selectedDoc.softDelete ? (
                    <button
                      onClick={() => hardWipeDoc(selectedDoc.id)}
                      className="p-1.5 bg-slate-900 border border-slate-800 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 rounded-sm"
                      title="Purge Permanently"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => deleteDoc(selectedDoc.id)}
                      className="p-1.5 bg-slate-900 border border-slate-800 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 rounded-sm"
                      title="Move to Trash"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <h2 className="text-sm font-semibold text-slate-100 mt-2 tracking-tight line-clamp-2 leading-relaxed">
                {selectedDoc.title}
              </h2>
              <p className="text-xs text-slate-400 mt-1 font-mono break-all leading-normal">
                {selectedDoc.displayName}
              </p>
            </div>

            {/* Sub-tab selections within inspector panel */}
            <div className="flex border-b border-slate-900 mt-3 text-[10px] font-mono">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'metadata', label: 'Meta' },
                { id: 'relationships', label: 'Links' },
                { id: 'activity', label: 'Audit Logs' },
                { id: 'ai', label: 'AI Context' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setDetailTab(t.id as any)}
                  className={`flex-1 text-center py-2 transition-colors border-b-2 ${detailTab === t.id ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Selected Tab content */}
            <div className="flex-1 mt-4 space-y-4">
              
              {/* Overview Tab */}
              {detailTab === 'overview' && (
                <div className="space-y-4 text-xs font-sans">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
                      File Synopsis / Description
                    </span>
                    <p className="text-slate-300 bg-slate-900/40 p-3 border border-slate-900/60 rounded-xs leading-relaxed">
                      {selectedDoc.description || 'No master synopsis recorded for this ledger file. Configure descriptive bounds in metadata.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 bg-slate-900/20 p-3 border border-slate-900/40 rounded-xs">
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 block">FILE SIZE</span>
                      <span className="font-mono text-slate-200 block mt-0.5">{formatSize(selectedDoc.size)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 block">VERSION</span>
                      <span className="font-mono text-slate-200 block mt-0.5">v{selectedDoc.version}.0</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 block">EXTENSION</span>
                      <span className="font-mono text-slate-200 uppercase block mt-0.5">{selectedDoc.fileExtension}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 block">CATEGORY</span>
                      <span className="text-slate-200 block mt-0.5">{selectedDoc.category}</span>
                    </div>
                  </div>

                  <div className="space-y-2 font-sans">
                    <div className="flex justify-between py-1.5 border-b border-slate-900/40">
                      <span className="text-slate-500">Master Owner</span>
                      <span className="text-slate-300 font-mono">{selectedDoc.owner}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-900/40">
                      <span className="text-slate-500">MIME Type</span>
                      <span className="text-slate-300 font-mono text-[10px]">{selectedDoc.mimeType}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-900/40">
                      <span className="text-slate-500">Storage Location</span>
                      <span className="text-slate-300 font-mono text-[10px] truncate max-w-[200px]" title={selectedDoc.storageLocation}>
                        {selectedDoc.storageLocation}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-900/40">
                      <span className="text-slate-500">Checksum (MD5)</span>
                      <span className="text-slate-300 font-mono text-[10px] truncate max-w-[180px]" title={selectedDoc.checksum}>
                        {selectedDoc.checksum}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-900/40">
                      <span className="text-slate-500">Created Date</span>
                      <span className="text-slate-400 font-mono text-[10px]">{formatDate(selectedDoc.createdDate)}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-900/40">
                      <span className="text-slate-500">Updated Date</span>
                      <span className="text-slate-400 font-mono text-[10px]">{formatDate(selectedDoc.updatedDate)}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <DSButton
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => triggerMockDownload(selectedDoc)}
                      leftIcon={<Download className="w-4 h-4 text-cyan-400" />}
                    >
                      Fetch File Stream (Download)
                    </DSButton>
                  </div>
                </div>
              )}

              {/* Metadata Tab */}
              {detailTab === 'metadata' && (
                <div className="space-y-4 text-xs font-sans">
                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="bg-slate-900/40 p-2.5 border border-slate-900 rounded-xs">
                      <span className="text-[9px] font-mono text-slate-500 uppercase block">AUTHOR</span>
                      <span className="text-slate-200 mt-1 block font-medium">{selectedDoc.author}</span>
                    </div>
                    <div className="bg-slate-900/40 p-2.5 border border-slate-900 rounded-xs">
                      <span className="text-[9px] font-mono text-slate-500 uppercase block">DEPARTMENT</span>
                      <span className="text-slate-200 mt-1 block font-medium">{selectedDoc.department}</span>
                    </div>
                    <div className="bg-slate-900/40 p-2.5 border border-slate-900 rounded-xs">
                      <span className="text-[9px] font-mono text-slate-500 uppercase block">REVISION</span>
                      <span className="text-slate-200 mt-1 block font-mono">{selectedDoc.revision}</span>
                    </div>
                    <div className="bg-slate-900/40 p-2.5 border border-slate-900 rounded-xs">
                      <span className="text-[9px] font-mono text-slate-500 uppercase block">APPROVAL</span>
                      <span className="text-emerald-400 mt-1 block font-medium">{selectedDoc.approvalStatus}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
                      Audit Flags / Keywords
                    </span>
                    <div className="flex flex-wrap gap-1.5 bg-slate-900/20 p-2.5 border border-slate-900/60 rounded-xs">
                      {selectedDoc.keywords.length === 0 ? (
                        <span className="text-slate-600 text-[10px] font-mono italic">No analytical index keywords.</span>
                      ) : (
                        selectedDoc.keywords.map(k => (
                          <span key={k} className="px-2 py-0.5 bg-slate-900 text-slate-400 border border-slate-800 rounded-xs text-[10px] font-mono">
                            {k}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
                      Document Security Level
                    </span>
                    <div className="p-3 bg-slate-900 border border-slate-800 rounded-sm flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-red-400" />
                        <span className="font-semibold text-slate-200">{selectedDoc.confidentiality}</span>
                      </div>
                      <span className="text-[9px] bg-red-950/20 border border-red-500/20 text-red-400 font-mono px-2 py-0.5 rounded-xs uppercase">
                        SLA Restricted
                      </span>
                    </div>
                  </div>

                  {/* Dynamic Labels block */}
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
                      Platform Indexed Attributes
                    </span>
                    <div className="space-y-1.5 bg-slate-900/20 p-3 border border-slate-900/60 rounded-xs font-mono text-[10px]">
                      {Object.keys(selectedDoc.labels).length === 0 ? (
                        <div className="text-slate-600 italic">No indexed label attributes.</div>
                      ) : (
                        Object.entries(selectedDoc.labels).map(([k, v]) => (
                          <div key={k} className="flex justify-between items-center py-1">
                            <span className="text-slate-500">{k}</span>
                            <span className="text-slate-300 font-semibold">{v}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Relationships Linkages Tab */}
              {detailTab === 'relationships' && (
                <div className="space-y-4 text-xs font-sans animate-in fade-in-50 duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-900/40">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">
                      Dynamic Linkage Indexes
                    </span>
                    <DSButton
                      size="sm"
                      variant="outline"
                      onClick={() => setIsRelinkOpen(true)}
                      leftIcon={<PlusCircle className="w-3.5 h-3.5 text-cyan-400" />}
                    >
                      Add Connection
                    </DSButton>
                  </div>

                  {/* Customer Links */}
                  <div className="space-y-1.5">
                    <h4 className="text-[10px] font-mono text-slate-500 uppercase flex items-center gap-1.5">
                      <Share2 className="w-3.5 h-3.5 text-indigo-400" />
                      Linked Customer Roster
                    </h4>
                    {selectedDoc.customerLinks.length === 0 ? (
                      <p className="text-[10px] text-slate-600 font-mono italic px-2">No customer links defined.</p>
                    ) : (
                      <div className="space-y-1">
                        {selectedDoc.customerLinks.map(cid => {
                          const c = customersList.find(x => x.id === cid);
                          return (
                            <div key={cid} className="flex items-center justify-between p-2 bg-slate-900/40 border border-slate-900 rounded-xs text-[11px]">
                              <span className="text-slate-300 font-semibold">{c ? c.companyName : cid}</span>
                              <button
                                onClick={() => executeUnlink('customer', cid)}
                                className="text-slate-500 hover:text-rose-400 p-1"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Project Links */}
                  <div className="space-y-1.5 mt-3">
                    <h4 className="text-[10px] font-mono text-slate-500 uppercase flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                      Linked Project Milestones
                    </h4>
                    {selectedDoc.projectLinks.length === 0 ? (
                      <p className="text-[10px] text-slate-600 font-mono italic px-2">No active project links mapped.</p>
                    ) : (
                      <div className="space-y-1">
                        {selectedDoc.projectLinks.map(pid => {
                          const p = projectsList.find(x => x.id === pid);
                          return (
                            <div key={pid} className="flex items-center justify-between p-2 bg-slate-900/40 border border-slate-900 rounded-xs text-[11px]">
                              <span className="text-slate-300 font-semibold">{p ? p.name : pid}</span>
                              <button
                                onClick={() => executeUnlink('project', pid)}
                                className="text-slate-500 hover:text-rose-400 p-1"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Contact Links */}
                  <div className="space-y-1.5 mt-3">
                    <h4 className="text-[10px] font-mono text-slate-500 uppercase flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-emerald-400" />
                      Associated Contacts
                    </h4>
                    {selectedDoc.contactLinks.length === 0 ? (
                      <p className="text-[10px] text-slate-600 font-mono italic px-2">No corporate contacts associated.</p>
                    ) : (
                      <div className="space-y-1">
                        {selectedDoc.contactLinks.map(conId => {
                          const co = contactsList.find(x => x.id === conId);
                          return (
                            <div key={conId} className="flex items-center justify-between p-2 bg-slate-900/40 border border-slate-900 rounded-xs text-[11px]">
                              <span className="text-slate-300 font-semibold">{co ? co.displayName : conId}</span>
                              <button
                                onClick={() => executeUnlink('contact', conId)}
                                className="text-slate-500 hover:text-rose-400 p-1"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* KMS Article Links */}
                  <div className="space-y-1.5 mt-3">
                    <h4 className="text-[10px] font-mono text-slate-500 uppercase flex items-center gap-1.5">
                      <FileCode className="w-3.5 h-3.5 text-amber-400" />
                      KMS Articles Linked
                    </h4>
                    {selectedDoc.knowledgeLinks.length === 0 ? (
                      <p className="text-[10px] text-slate-600 font-mono italic px-2">No related KMS pages compiled.</p>
                    ) : (
                      <div className="space-y-1">
                        {selectedDoc.knowledgeLinks.map(kid => {
                          const km = kmsList.find(x => x.id === kid);
                          return (
                            <div key={kid} className="flex items-center justify-between p-2 bg-slate-900/40 border border-slate-900 rounded-xs text-[11px]">
                              <span className="text-slate-300 font-semibold">{km ? km.title : kid}</span>
                              <button
                                onClick={() => executeUnlink('kms', kid)}
                                className="text-slate-500 hover:text-rose-400 p-1"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Activity / Audit Logs Tab */}
              {detailTab === 'activity' && (
                <div className="space-y-3 font-mono text-[10px] animate-in fade-in-50 duration-150 max-h-[400px] overflow-y-auto pr-1">
                  <div className="flex items-center justify-between border-b border-slate-900/40 pb-2">
                    <span className="text-slate-500 uppercase">EVENT HISTORIC LEDGER</span>
                    <span className="text-slate-600">{registry.getActivityLogs(selectedDoc.id).length} Entries</span>
                  </div>
                  {registry.getActivityLogs(selectedDoc.id).length === 0 ? (
                    <div className="text-center py-6 text-slate-600 italic">No access records logged.</div>
                  ) : (
                    registry.getActivityLogs(selectedDoc.id).map(log => (
                      <div key={log.id} className="p-2.5 bg-slate-900/40 border border-slate-900 rounded-xs leading-normal">
                        <div className="flex justify-between items-center text-slate-500 text-[9px] mb-1">
                          <span className="text-cyan-400 uppercase font-semibold">{log.actionType}</span>
                          <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-slate-300 font-sans mt-1 text-xs">{log.details}</p>
                        <div className="mt-1.5 text-right text-[8px] text-slate-600">
                          OPERATOR: {log.operator}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* AI Context tab: Structured text block (Do NOT summarize) */}
              {detailTab === 'ai' && (
                <div className="space-y-3 font-sans text-xs animate-in fade-in-50 duration-150">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-indigo-400 uppercase flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      Structured AI Context API
                    </span>
                    <button
                      onClick={() => copyToClipboard(aiContextXML)}
                      className="text-[10px] font-mono bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 px-2 py-1 rounded flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      Copy Context
                    </button>
                  </div>
                  
                  <p className="text-slate-400 leading-relaxed text-xs">
                    This formatted XML payload contains deep relational bounds, custom metadata properties, and linkage indexes designed to feed directly into external LLM prompts as precise contextual reference.
                  </p>

                  <pre className="bg-slate-950 border border-slate-900 rounded-sm p-3 font-mono text-[9px] text-cyan-400/90 leading-relaxed overflow-x-auto max-h-[280px]">
                    {aiContextXML}
                  </pre>
                </div>
              )}

            </div>
          </aside>
        )}

      </div>

      {/* MODAL 1: Upload Logical Document Form */}
      <DSModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title="Register New Master Document"
        size="lg"
      >
        <div className="space-y-4 font-sans text-xs max-h-[70vh] overflow-y-auto p-1">
          
          {/* File Dropzone */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-sm p-8 text-center cursor-pointer transition-all ${dragActive ? 'border-cyan-500 bg-cyan-950/10' : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'}`}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="p-3 bg-slate-900 border border-slate-800 rounded text-slate-400 w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <Download className="w-6 h-6 rotate-180 text-cyan-400" />
            </div>
            {uploadFilename ? (
              <div>
                <span className="text-cyan-400 font-mono font-semibold break-all text-xs">{uploadFilename}</span>
                <p className="text-[10px] text-slate-500 mt-1">Click or drag another file to replace</p>
              </div>
            ) : (
              <div>
                <span className="font-semibold text-slate-200">Drag & drop your file here</span>
                <p className="text-slate-400 text-[10px] mt-1">Supports PDF, Word, Excel, Markdown, STEP, STL Metadata up to 100MB</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DSInput
              label="Document Title"
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
              placeholder="e.g. Laser Calibration Specs"
              required
            />

            <DSInput
              label="Author / Owner Name"
              value={uploadAuthor}
              onChange={(e) => setUploadAuthor(e.target.value)}
              placeholder="Elena Rostova"
            />

            <DSSelect
              label="File Extension Type Architecture"
              value={uploadType}
              onChange={(e) => setUploadType(e.target.value as DocumentType)}
              options={[
                { value: 'pdf', label: 'PDF Portable Document' },
                { value: 'word', label: 'Word Processing Doc' },
                { value: 'excel', label: 'Spreadsheet Ledger' },
                { value: 'powerpoint', label: 'Presentation Slides' },
                { value: 'markdown', label: 'Markdown Readme' },
                { value: 'text', label: 'Plain Text Note' },
                { value: 'csv', label: 'CSV Dataset' },
                { value: 'json', label: 'JSON Master Schema' },
                { value: 'image', label: 'Asset Raster Image' },
                { value: 'cad', label: 'STEP Metadata Model' },
                { value: 'archive', label: 'ZIP Container' }
              ]}
            />

            <DSSelect
              label="Enterprise Module Domain"
              value={uploadCategory}
              onChange={(e) => setUploadCategory(e.target.value as DocumentCategory)}
              options={[
                { value: 'CRM', label: 'CRM & Client' },
                { value: 'Projects', label: 'Projects & Milestones' },
                { value: 'Engineering', label: 'Engineering' },
                { value: 'Packaging', label: 'Packaging' },
                { value: 'Knowledge', label: 'Knowledge Base' },
                { value: 'LMS', label: 'LMS Training' },
                { value: 'HR', label: 'HR Platform' },
                { value: 'Finance', label: 'Finance & Ledgers' },
                { value: 'Procurement', label: 'Procurement Bids' },
                { value: 'Quality', label: 'Quality Assurance' },
                { value: 'Administration', label: 'Administration' },
                { value: 'General', label: 'General / Miscellaneous' }
              ]}
            />

            <DSSelect
              label="Workspace Isolation State"
              value={uploadWorkspace}
              onChange={(e) => setUploadWorkspace(e.target.value as any)}
              options={[
                { value: 'personal', label: 'Personal Sandbox' },
                { value: 'business', label: 'Corporate Shared Workspace' },
                { value: 'engineering', label: 'Engineering Isolated' },
                { value: 'learning', label: 'LMS Knowledge' },
                { value: 'admin', label: 'Administrative Console' }
              ]}
            />

            <DSSelect
              label="Confidentiality Clearance Level"
              value={uploadConfidentiality}
              onChange={(e) => setUploadConfidentiality(e.target.value as ConfidentialityLevel)}
              options={[
                { value: 'Unclassified', label: 'Unclassified / Public' },
                { value: 'Internal', label: 'Internal Use Only' },
                { value: 'Confidential', label: 'Confidential Client Assets' },
                { value: 'StrictlyConfidential', label: 'Strictly Confidential Department Key' },
                { value: 'Secret', label: 'Secret Aerospace Core Keys' }
              ]}
            />

            <DSInput
              label="Originating Department"
              value={uploadDepartment}
              onChange={(e) => setUploadDepartment(e.target.value)}
              placeholder="e.g. QA Compliance"
            />

            <DSInput
              label="Revision Index / Version Tag"
              value={uploadRevision}
              onChange={(e) => setUploadRevision(e.target.value)}
              placeholder="e.g. Rev 1.0"
            />
          </div>

          <DSInput
            label="Tags (Comma separated)"
            value={uploadTags}
            onChange={(e) => setUploadTags(e.target.value)}
            placeholder="e.g. laser, calibration, step"
          />

          <DSTextarea
            label="Synoptic Document Description"
            value={uploadDesc}
            onChange={(e) => setUploadDesc(e.target.value)}
            placeholder="Detail operational constraints or ledger associations here..."
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-900">
            <DSButton variant="outline" onClick={() => setIsUploadOpen(false)} disabled={isUploading}>
              Cancel
            </DSButton>
            <DSButton
              variant="primary"
              onClick={executeUpload}
              loading={isUploading}
            >
              Commit Upload
            </DSButton>
          </div>

        </div>
      </DSModal>

       {/* MODAL 2: Edit Metadata Form */}
      <DSModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Configure Document Metadata"
        size="md"
      >
        <div className="space-y-4 font-sans text-xs p-1">
          <DSInput
            label="Document Title"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="e.g. Laser Calibration Specs"
            required
          />

          <DSSelect
            label="Category"
            value={editCategory}
            onChange={(e) => setEditCategory(e.target.value as DocumentCategory)}
            options={[
              { value: 'CRM', label: 'CRM & Client' },
              { value: 'Projects', label: 'Projects & Milestones' },
              { value: 'Engineering', label: 'Engineering' },
              { value: 'Packaging', label: 'Packaging' },
              { value: 'Knowledge', label: 'Knowledge Base' },
              { value: 'LMS', label: 'LMS Training' },
              { value: 'HR', label: 'HR Platform' },
              { value: 'Finance', label: 'Finance & Ledgers' },
              { value: 'Procurement', label: 'Procurement Bids' },
              { value: 'Quality', label: 'Quality Assurance' },
              { value: 'Administration', label: 'Administration' },
              { value: 'General', label: 'General / Miscellaneous' }
            ]}
          />

          <DSSelect
            label="Confidentiality Level"
            value={editConfidentiality}
            onChange={(e) => setEditConfidentiality(e.target.value as ConfidentialityLevel)}
            options={[
              { value: 'Unclassified', label: 'Unclassified / Public' },
              { value: 'Internal', label: 'Internal Use Only' },
              { value: 'Confidential', label: 'Confidential Client Assets' },
              { value: 'StrictlyConfidential', label: 'Strictly Confidential Department Key' },
              { value: 'Secret', label: 'Secret Aerospace Core Keys' }
            ]}
          />

          <DSSelect
            label="Document State Status"
            value={editStatus}
            onChange={(e) => setEditStatus(e.target.value as DocumentStatus)}
            options={[
              { value: 'Draft', label: 'Draft' },
              { value: 'Review', label: 'In Review' },
              { value: 'Approved', label: 'Approved' },
              { value: 'Released', label: 'Released' },
              { value: 'Archived', label: 'Archived' },
              { value: 'Deprecated', label: 'Deprecated Obsolete' }
            ]}
          />

          <DSInput
            label="Revision Code"
            value={editRevision}
            onChange={(e) => setEditRevision(e.target.value)}
            placeholder="Rev A"
          />

          <DSInput
            label="Keywords / Tags"
            value={editTags}
            onChange={(e) => setEditTags(e.target.value)}
            placeholder="laser, calibration, step"
          />

          <DSTextarea
            label="Description Summary"
            value={editDesc}
            onChange={(e) => setEditDesc(e.target.value)}
            placeholder="Provide context regarding this record..."
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-900">
            <DSButton variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </DSButton>
            <DSButton variant="primary" onClick={executeEdit}>
              Save Configurations
            </DSButton>
          </div>
        </div>
      </DSModal>

      {/* MODAL 3: Relationship Relinking manager */}
      <DSModal
        isOpen={isRelinkOpen}
        onClose={() => setIsRelinkOpen(false)}
        title="Establish Entity Association Linkage"
        size="sm"
      >
        <div className="space-y-4 font-sans text-xs p-1">
          <DSSelect
            label="Association Type Domain"
            value={linkType}
            onChange={(e) => {
              setLinkType(e.target.value as any);
              setLinkTargetId('');
            }}
            options={[
              { value: 'customer', label: 'Client Accounts (CRM)' },
              { value: 'project', label: 'Milestone Projects' },
              { value: 'contact', label: 'Operational Personnel' },
              { value: 'kms', label: 'KMS Knowledge Articles' }
            ]}
          />

          {linkType === 'customer' && (
            <DSSelect
              label="Select Target Corporate Client"
              value={linkTargetId}
              onChange={(e) => setLinkTargetId(e.target.value)}
              options={customersList.map(c => ({ value: c.id, label: c.companyName }))}
            />
          )}

          {linkType === 'project' && (
            <DSSelect
              label="Select Project Milestone Target"
              value={linkTargetId}
              onChange={(e) => setLinkTargetId(e.target.value)}
              options={projectsList.map(p => ({ value: p.id, label: p.name }))}
            />
          )}

          {linkType === 'contact' && (
            <DSSelect
              label="Select Target Personnel"
              value={linkTargetId}
              onChange={(e) => setLinkTargetId(e.target.value)}
              options={contactsList.map(co => ({ value: co.id, label: `${co.displayName} (${co.company})` }))}
            />
          )}

          {linkType === 'kms' && (
            <DSSelect
              label="Select KMS Document Base"
              value={linkTargetId}
              onChange={(e) => setLinkTargetId(e.target.value)}
              options={kmsList.map(km => ({ value: km.id, label: km.title }))}
            />
          )}

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-900">
            <DSButton variant="outline" onClick={() => setIsRelinkOpen(false)}>
              Cancel
            </DSButton>
            <DSButton variant="primary" onClick={executeLink} disabled={!linkTargetId}>
              Bind Reference Link
            </DSButton>
          </div>
        </div>
      </DSModal>

    </div>
  );
};

// Pure utilities inside UI module
function getFileIcon(type: DocumentType) {
  switch (type) {
    case 'pdf':
      return FileText;
    case 'word':
    case 'text':
      return FileText;
    case 'excel':
    case 'csv':
      return SlidersHorizontal;
    case 'powerpoint':
      return Calendar;
    case 'markdown':
    case 'json':
      return FileCode;
    case 'image':
      return Share2;
    case 'cad':
      return HardDrive;
    case 'archive':
      return FolderClosed;
    default:
      return FileText;
  }
}

function getCategoryColor(category: DocumentCategory): 'cyan' | 'emerald' | 'amber' | 'rose' | 'slate' {
  switch (category) {
    case 'CRM':
      return 'cyan';
    case 'Projects':
      return 'emerald';
    case 'Engineering':
      return 'amber';
    case 'Packaging':
      return 'rose';
    case 'Knowledge':
    case 'LMS':
      return 'cyan';
    default:
      return 'slate';
  }
}

function getConfidentialityClass(level: ConfidentialityLevel) {
  switch (level) {
    case 'Secret':
      return 'text-red-400 font-bold';
    case 'StrictlyConfidential':
      return 'text-rose-400 font-semibold';
    case 'Confidential':
      return 'text-amber-400';
    case 'Internal':
      return 'text-slate-300';
    case 'Unclassified':
    default:
      return 'text-slate-500';
  }
}

function docArchiveCheck(doc: DocType) {
  return doc.archiveStatus || doc.softDelete;
}

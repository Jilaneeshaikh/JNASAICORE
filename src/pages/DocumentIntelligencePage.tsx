import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText,
  Brain,
  Database,
  Search,
  Settings,
  Activity,
  Cpu,
  Layers,
  Shield,
  Trash2,
  Lock,
  Unlock,
  Clock,
  List,
  Upload,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Play,
  ArrowRight,
  ChevronRight,
  BookOpen,
  Terminal,
  Sliders,
  Eye,
  Info,
  Check,
  Power,
  SlidersHorizontal,
  FolderDot
} from 'lucide-react';

import { useNotification } from '../contexts/NotificationContext';
import { useSettings } from '../contexts/SettingsContext';

// Core registries and pipeline services
import { documentRegistry } from '../backend/document-intelligence/documentRegistry';
import { parserRegistry } from '../backend/document-intelligence/parserRegistry';
import { processDocument, ProcessingResult } from '../backend/document-intelligence/pipeline';
import { retrieveChunks } from '../backend/document-intelligence/retrieval';
import { buildUnifiedContext } from '../backend/document-intelligence/contextBuilder';
import { seedDocumentRegistry } from '../backend/document-intelligence/mockData';
import { 
  DocumentMetadata, 
  DocumentChunk, 
  DocumentFormat, 
  SecurityClassification, 
  PipelineState, 
  AuditLogEntry, 
  DocumentParser 
} from '../backend/document-intelligence/types';

import { DSBadge, DSAlert } from '../components/design-system/DSStatus';
import { DSButton } from '../components/design-system/DSButton';
import { DSCard, DSCardContent, DSCardHeader, DSCardTitle, DSCardSubtitle } from '../components/design-system/DSCard';

export const DocumentIntelligencePage: React.FC = () => {
  const { triggerToast } = useNotification();
  const { settings: globalSettings } = useSettings();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'explorer' | 'playground' | 'parsers' | 'documentation'>('dashboard');
  
  // Data States
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [parsers, setParsers] = useState<DocumentParser[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<DocumentMetadata | null>(null);
  const [selectedDocChunks, setSelectedDocChunks] = useState<DocumentChunk[]>([]);
  const [activeChunkIndex, setActiveChunkIndex] = useState<number>(0);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterWorkspace, setFilterWorkspace] = useState<string>('all');
  const [filterFormat, setFilterFormat] = useState<string>('all');
  const [filterSecurity, setFilterSecurity] = useState<string>('all');

  // Ingestion Form States
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadContent, setUploadContent] = useState('');
  const [uploadFormat, setUploadFormat] = useState<DocumentFormat>('pdf');
  const [uploadWorkspace, setUploadWorkspace] = useState('engineering');
  const [uploadProject, setUploadProject] = useState('JNAS Core Pipeline');
  const [uploadCategory, setUploadCategory] = useState('Standards');
  const [uploadTags, setUploadTags] = useState('aerospace, safety');
  const [uploadSecurity, setUploadSecurity] = useState<SecurityClassification>('internal');

  // Ingestion Pipeline Simulation State
  const [isProcessing, setIsProcessing] = useState(false);
  const [pipelineState, setPipelineState] = useState<PipelineState | null>(null);
  const [processingLogs, setProcessingLogs] = useState<{ timestamp: string; message: string; stage: string; status: string }[]>([]);

  // RAG Playground States
  const [ragQuery, setRagQuery] = useState('vibrations');
  const [configIncludeDocs, setConfigIncludeDocs] = useState(true);
  const [configIncludeKms, setConfigIncludeKms] = useState(true);
  const [configIncludeMemory, setConfigIncludeMemory] = useState(true);
  const [configIncludeSearch, setConfigIncludeSearch] = useState(true);
  const [ragPayload, setRagPayload] = useState<any>(null);

  // Initialize page & seed data
  useEffect(() => {
    const initializeData = async () => {
      const existingDocs = documentRegistry.getDocuments();
      if (existingDocs.length === 0) {
        await seedDocumentRegistry();
      }
      refreshLists();
    };
    initializeData();
  }, []);

  const refreshLists = () => {
    const docs = documentRegistry.getDocuments();
    setDocuments(docs);
    setAuditLogs(documentRegistry.getAuditLogs());
    setParsers(parserRegistry.getAllParsers());
    
    // Auto-select first document for explorer if nothing is selected
    if (docs.length > 0 && !selectedDoc) {
      setSelectedDoc(docs[0]);
      setSelectedDocChunks(documentRegistry.getChunksForDocument(docs[0].id));
      setActiveChunkIndex(0);
    }
  };

  // Start processing custom uploaded document
  const handleIngestDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim() || !uploadContent.trim()) {
      triggerToast('error', 'Please provide a valid document title and textual contents.');
      return;
    }

    setIsProcessing(true);
    setProcessingLogs([]);
    
    const tagsArray = uploadTags.split(',').map(t => t.trim()).filter(Boolean);

    try {
      const res = await processDocument(
        {
          title: uploadTitle,
          description: uploadDesc,
          content: uploadContent,
          format: uploadFormat,
          owner: 'Operator Console',
          workspace: uploadWorkspace,
          project: uploadProject || undefined,
          category: uploadCategory,
          tags: tagsArray,
          classification: uploadSecurity,
          module: 'DocIntel'
        },
        (state) => {
          setPipelineState(state);
          // Accumulate logs in local display stream
          if (state.logs.length > 0) {
            const lastLog = state.logs[state.logs.length - 1];
            setProcessingLogs(prev => [
              ...prev,
              {
                timestamp: new Date().toLocaleTimeString(),
                message: lastLog.message,
                stage: lastLog.stage,
                status: lastLog.status
              }
            ]);
          }
        }
      );

      triggerToast('success', `Successfully processed and chunked "${res.document.title}" into ${res.chunks.length} vectors!`);
      
      // Reset form fields
      setUploadTitle('');
      setUploadDesc('');
      setUploadContent('');
      
      // Refresh state
      refreshLists();
      setSelectedDoc(res.document);
      setSelectedDocChunks(res.chunks);
      setActiveChunkIndex(0);
      setActiveTab('explorer');
    } catch (err: any) {
      triggerToast('error', `Extraction Failure: ${err.message || 'Unknown processing halt'}`);
    } finally {
      setIsProcessing(false);
      setPipelineState(null);
    }
  };

  // Execute RAG Context aggregation
  const handleExecuteRag = () => {
    if (!ragQuery.trim()) {
      triggerToast('info', 'Please input a retrieval query term.');
      return;
    }

    const payload = buildUnifiedContext(ragQuery, globalSettings.activeWorkspace || 'engineering', {
      includeDocuments: configIncludeDocs,
      includeKnowledge: configIncludeKms,
      includeMemory: configIncludeMemory,
      includeSearchResults: configIncludeSearch,
      maxTokens: 4096,
      diversityWeight: 0.7
    });

    setRagPayload(payload);
    triggerToast('success', 'Context builder successfully compiled custom contextual framework.');
  };

  // Document security alteration
  const handleUpdateSecurity = (docId: string, value: SecurityClassification) => {
    const success = documentRegistry.updateDocumentClassification(docId, value);
    if (success) {
      triggerToast('success', `Security clearance for document modified to ${value.toUpperCase()}`);
      refreshLists();
      if (selectedDoc?.id === docId) {
        setSelectedDoc(prev => prev ? { ...prev, classification: value } : null);
      }
    }
  };

  // Document deletion
  const handleDeleteDoc = (docId: string) => {
    const success = documentRegistry.deleteDocument(docId);
    if (success) {
      triggerToast('success', 'Document node and associated overlapping chunks purged.');
      refreshLists();
      if (selectedDoc?.id === docId) {
        setSelectedDoc(null);
        setSelectedDocChunks([]);
        setActiveChunkIndex(0);
      }
    }
  };

  // Filters application
  const filteredDocuments = documents.filter((doc) => {
    if (filterWorkspace !== 'all' && doc.workspace !== filterWorkspace) return false;
    if (filterFormat !== 'all' && doc.format !== filterFormat) return false;
    if (filterSecurity !== 'all' && doc.classification !== filterSecurity) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchTitle = doc.title.toLowerCase().includes(q);
      const matchDesc = doc.description.toLowerCase().includes(q);
      const matchTags = doc.tags.some(t => t.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchTags) return false;
    }
    return true;
  });

  // Render format badge helper
  const renderFormatBadge = (format: DocumentFormat) => {
    const colors: Record<string, string> = {
      pdf: 'bg-red-950/40 text-red-400 border-red-900/30',
      docx: 'bg-blue-950/40 text-blue-400 border-blue-900/30',
      xlsx: 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30',
      pptx: 'bg-amber-950/40 text-amber-400 border-amber-900/30',
      md: 'bg-cyan-950/40 text-cyan-400 border-cyan-900/30',
      txt: 'bg-slate-800 text-slate-300 border-slate-700',
      csv: 'bg-teal-950/40 text-teal-400 border-teal-900/30',
      dwg: 'bg-violet-950/40 text-violet-400 border-violet-900/30',
      zip: 'bg-purple-950/40 text-purple-400 border-purple-900/30',
    };
    return (
      <span className={`px-2 py-0.5 border text-[10px] font-mono rounded uppercase font-bold ${colors[format] || 'bg-slate-900 text-slate-400'}`}>
        {format}
      </span>
    );
  };

  // Render classification badge helper
  const renderSecurityBadge = (classification: SecurityClassification) => {
    const colors: Record<string, string> = {
      public: 'text-emerald-400 bg-emerald-950/30 border-emerald-900/40',
      internal: 'text-cyan-400 bg-cyan-950/30 border-cyan-900/40',
      confidential: 'text-amber-400 bg-amber-950/30 border-amber-900/40',
      restricted: 'text-rose-400 bg-rose-950/30 border-rose-900/40',
    };
    return (
      <span className={`px-2 py-0.5 border text-[9px] font-mono uppercase tracking-widest font-extrabold rounded flex items-center gap-1.5 ${colors[classification]}`}>
        <Lock className="w-2.5 h-2.5" />
        {classification}
      </span>
    );
  };

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Portal Header */}
      <div className="border-b border-slate-900 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-slate-100 font-sans">
              DocIntel — Document Intelligence & RAG Platform
            </h1>
            <DSBadge variant="outline" color="cyan">SPRINT 12 COMPLETE</DSBadge>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Central orchestration layer parsing corporate metadata and Technical Drawings into secured, isolated prompt context chunks.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-slate-950 border border-slate-900 p-0.5 rounded-sm self-start md:self-center font-mono text-[10px] shrink-0 overflow-x-auto max-w-full">
          {[
            { id: 'dashboard', label: 'Console Home', icon: Cpu },
            { id: 'explorer', label: 'Document Registry', icon: Database },
            { id: 'playground', label: 'RAG Playground', icon: Brain },
            { id: 'parsers', label: 'Parser Engines', icon: Settings },
            { id: 'documentation', label: 'Developer Guide', icon: BookOpen },
          ].map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  if (tab.id === 'playground' && !ragPayload) {
                    handleExecuteRag();
                  }
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xs font-bold transition-all uppercase cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
                }`}
              >
                <TabIcon className="w-3 h-3" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Interactive Workspace Screens */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
          className="min-h-[500px]"
        >
          {/* ========================================================= */}
          {/* SCREEN A: CONSOLE HOME / PIPELINE CONTROLS */}
          {/* ========================================================= */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Quick Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-slate-950 border border-slate-900 p-4 rounded-sm flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Documents Registered</span>
                    <h3 className="text-xl font-bold font-mono text-slate-100">{documents.length}</h3>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded border border-slate-800 text-cyan-400">
                    <Database className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-900 p-4 rounded-sm flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Total Text Chunks</span>
                    <h3 className="text-xl font-bold font-mono text-cyan-400">
                      {documents.reduce((acc, d) => acc + documentRegistry.getChunksForDocument(d.id).length, 0)}
                    </h3>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded border border-slate-800 text-indigo-400">
                    <Layers className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-900 p-4 rounded-sm flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Parser Engines Online</span>
                    <h3 className="text-xl font-bold font-mono text-slate-100">
                      {parsers.filter(p => p.status === 'online').length}/{parsers.length}
                    </h3>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded border border-slate-800 text-emerald-400">
                    <Activity className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-900 p-4 rounded-sm flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Active Isolation</span>
                    <h3 className="text-xl font-bold font-mono text-amber-400 uppercase leading-tight text-xs">
                      {globalSettings.activeWorkspace || 'personal'} node
                    </h3>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded border border-slate-800 text-amber-400">
                    <Shield className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-900 p-4 rounded-sm flex items-center justify-between col-span-1 sm:col-span-2 lg:col-span-1">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Pipeline Integrity</span>
                    <h3 className="text-sm font-bold font-mono text-emerald-400 uppercase">AS9100 COMPLIANT</h3>
                  </div>
                  <div className="p-2.5 bg-emerald-950/25 rounded border border-emerald-900/30 text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Main Split: Upload & Active Progress logs */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Form column */}
                <div className="lg:col-span-7">
                  <DSCard className="bg-[#0D0F16] border-slate-900">
                    <DSCardHeader className="border-b border-slate-900/50 pb-4">
                      <div className="flex items-center gap-2">
                        <Upload className="w-4 h-4 text-cyan-400" />
                        <DSCardTitle className="text-sm font-bold font-sans text-slate-100">Secure File Ingestion Sandbox</DSCardTitle>
                      </div>
                      <DSCardSubtitle className="text-[10px] font-mono text-slate-500">
                        Upload custom documentation data to partition text blocks into context buffers.
                      </DSCardSubtitle>
                    </DSCardHeader>
                    <DSCardContent className="pt-5">
                      <form onSubmit={handleIngestDocument} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Document Title</label>
                            <input
                              type="text"
                              value={uploadTitle}
                              onChange={(e) => setUploadTitle(e.target.value)}
                              placeholder="e.g. Jet Propeller Overhaul guidelines"
                              className="w-full bg-slate-950 text-slate-100 border border-slate-800 focus:border-cyan-500/50 rounded-sm px-3 py-2 text-xs focus:outline-hidden"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Format Extension</label>
                            <select
                              value={uploadFormat}
                              onChange={(e) => setUploadFormat(e.target.value as DocumentFormat)}
                              className="w-full bg-slate-950 text-slate-100 border border-slate-800 focus:border-cyan-500/50 rounded-sm px-3 py-2 text-xs focus:outline-hidden font-mono"
                            >
                              <option value="pdf">PDF Specification</option>
                              <option value="docx">DOCX Structured Document</option>
                              <option value="xlsx">XLSX Tabular Audit</option>
                              <option value="md">Markdown Playbook</option>
                              <option value="txt">Plain Text Stream</option>
                              <option value="dwg">DWG CAD Vector Metadata</option>
                              <option value="zip">ZIP Multi-Archive</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Short Description</label>
                          <input
                            type="text"
                            value={uploadDesc}
                            onChange={(e) => setUploadDesc(e.target.value)}
                            placeholder="Provide structural annotations and overview for indexing index..."
                            className="w-full bg-slate-950 text-slate-100 border border-slate-800 focus:border-cyan-500/50 rounded-sm px-3 py-2 text-xs focus:outline-hidden"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Isolation Workspace</label>
                            <select
                              value={uploadWorkspace}
                              onChange={(e) => setUploadWorkspace(e.target.value)}
                              className="w-full bg-slate-950 text-slate-100 border border-slate-800 focus:border-cyan-500/50 rounded-sm px-3 py-2 text-xs focus:outline-hidden font-mono"
                            >
                              <option value="personal">Personal Workspace</option>
                              <option value="engineering">Engineering Workspace</option>
                              <option value="learning">Learning Workspace</option>
                              <option value="business">Business Workspace</option>
                              <option value="admin">Administration Workspace</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Milestone/Project</label>
                            <input
                              type="text"
                              value={uploadProject}
                              onChange={(e) => setUploadProject(e.target.value)}
                              placeholder="e.g. JNAS Core Pipeline"
                              className="w-full bg-slate-950 text-slate-100 border border-slate-800 focus:border-cyan-500/50 rounded-sm px-3 py-2 text-xs focus:outline-hidden font-mono"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Category</label>
                            <input
                              type="text"
                              value={uploadCategory}
                              onChange={(e) => setUploadCategory(e.target.value)}
                              placeholder="e.g. Quality Standards"
                              className="w-full bg-slate-950 text-slate-100 border border-slate-800 focus:border-cyan-500/50 rounded-sm px-3 py-2 text-xs focus:outline-hidden font-mono"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Tags (comma separated)</label>
                            <input
                              type="text"
                              value={uploadTags}
                              onChange={(e) => setUploadTags(e.target.value)}
                              placeholder="aerospace, wings, turbine"
                              className="w-full bg-slate-950 text-slate-100 border border-slate-800 focus:border-cyan-500/50 rounded-sm px-3 py-2 text-xs focus:outline-hidden font-mono"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Security Level</label>
                            <select
                              value={uploadSecurity}
                              onChange={(e) => setUploadSecurity(e.target.value as SecurityClassification)}
                              className="w-full bg-slate-950 text-slate-100 border border-slate-800 focus:border-cyan-500/50 rounded-sm px-3 py-2 text-xs focus:outline-hidden font-mono"
                            >
                              <option value="public">Public (Full Visibility)</option>
                              <option value="internal">Internal Only</option>
                              <option value="confidential">Confidential (Operator Grade)</option>
                              <option value="restricted">Restricted (System Clearance)</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Document Content (Raw Text Payload)</label>
                          <textarea
                            value={uploadContent}
                            onChange={(e) => setUploadContent(e.target.value)}
                            rows={6}
                            placeholder="Paste text contents or blueprint raw metadata here..."
                            className="w-full bg-slate-950 text-slate-100 border border-slate-800 focus:border-cyan-500/50 rounded-sm px-3 py-2 text-xs focus:outline-hidden font-mono leading-relaxed"
                          />
                        </div>

                        <div className="pt-2">
                          <DSButton
                            variant="primary"
                            disabled={isProcessing}
                            className="w-full cursor-pointer flex items-center justify-center gap-2"
                            type="submit"
                          >
                            {isProcessing ? (
                              <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                INGESTING DOCUMENT...
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4" />
                                DISPATCH SECURE PIPELINE INGESTION
                              </>
                            )}
                          </DSButton>
                        </div>
                      </form>
                    </DSCardContent>
                  </DSCard>
                </div>

                {/* Processing Monitor column */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="bg-slate-950 border border-slate-900 rounded-sm p-4">
                    <div className="flex items-center justify-between border-b border-slate-900 pb-2.5 mb-3">
                      <div className="flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-cyan-400" />
                        <span className="text-xs font-bold font-mono uppercase text-slate-200">Ingestion Terminal Status</span>
                      </div>
                      <span className={`h-2.5 w-2.5 rounded-full ${isProcessing ? 'bg-cyan-500 animate-pulse' : 'bg-emerald-500'}`} />
                    </div>

                    {isProcessing ? (
                      <div className="space-y-4">
                        {/* Interactive Steps Visualizer */}
                        <div className="space-y-2 font-mono text-[10px] text-slate-400">
                          {[
                            { name: 'Upload Check', key: 'Upload' },
                            { name: 'Schema Validation', key: 'Validation' },
                            { name: 'Antivirus Scan', key: 'Virus Scan' },
                            { name: 'Content Extraction', key: 'Extraction' },
                            { name: 'Chunking Segmentation', key: 'Chunking' },
                            { name: 'Cross-Module Indexing', key: 'Index Preparation' }
                          ].map((step, idx) => {
                            const isCurrent = pipelineState?.currentStage === step.key;
                            const isDone = pipelineState 
                              ? idx < ['Upload', 'Validation', 'Virus Scan', 'Extraction', 'Chunking', 'Index Preparation'].indexOf(pipelineState.currentStage)
                              : false;

                            return (
                              <div key={step.key} className="flex items-center justify-between border-b border-slate-900/30 py-1">
                                <span className={isCurrent ? 'text-cyan-400 font-extrabold' : isDone ? 'text-emerald-500 line-through' : 'text-slate-500'}>
                                  {idx + 1}. {step.name}
                                </span>
                                {isCurrent ? (
                                  <span className="text-cyan-400 font-bold animate-pulse">PROCESSING...</span>
                                ) : isDone ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                                ) : (
                                  <span className="text-slate-700">AWAITING</span>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-mono">
                            <span className="text-slate-500">PIPELINE EXECUTION PROGRESS</span>
                            <span className="text-cyan-400 font-bold">{pipelineState?.progressPercentage || 0}%</span>
                          </div>
                          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
                            <div 
                              className="bg-cyan-500 h-full transition-all duration-300"
                              style={{ width: `${pipelineState?.progressPercentage || 0}%` }}
                            />
                          </div>
                        </div>

                        {/* Scrolling Logs */}
                        <div className="h-44 bg-black/60 border border-slate-900 p-2 rounded-sm font-mono text-[9px] text-slate-400 overflow-y-auto space-y-1">
                          {processingLogs.map((log, idx) => (
                            <div key={idx} className="flex gap-2">
                              <span className="text-slate-600">[{log.timestamp}]</span>
                              <span className="text-slate-500">[{log.stage}]</span>
                              <span className={log.status === 'error' ? 'text-rose-500' : log.status === 'success' ? 'text-emerald-500' : 'text-cyan-400'}>
                                {log.message}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="py-8 text-center text-slate-500 space-y-2">
                        <Activity className="w-8 h-8 mx-auto text-slate-800 animate-pulse" />
                        <p className="text-[10px] font-mono uppercase tracking-wider">Awaiting Stream Dispatch</p>
                        <p className="text-xs max-w-xs mx-auto text-slate-600">
                          Submit a file to the secure sandbox. You will see real-time sub-stage logs and extraction durations manifest here.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Audit Logs Quickview */}
                  <div className="bg-slate-950 border border-slate-900 rounded-sm p-4 space-y-3">
                    <span className="text-[10px] font-mono text-slate-500 uppercase font-bold block">Ecosystem Ingestion Audit Trail</span>
                    <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1 font-mono text-[9px]">
                      {auditLogs.slice(0, 5).map((log) => (
                        <div key={log.id} className="border-b border-slate-900/60 pb-2 space-y-1">
                          <div className="flex items-center justify-between text-[8px]">
                            <span className="text-slate-600">{new Date(log.timestamp).toLocaleString()}</span>
                            <span className="text-cyan-400 uppercase tracking-widest text-[7px] border border-cyan-900/30 px-1 rounded">
                              {log.action}
                            </span>
                          </div>
                          <p className="text-slate-300 font-bold leading-normal">{log.details}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SCREEN B: DOCUMENT EXPLORER & METADATA INSPECTOR */}
          {/* ========================================================= */}
          {activeTab === 'explorer' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left sidebar: Filter panel and List */}
              <div className="lg:col-span-4 space-y-4">
                {/* Search & Filter Options */}
                <div className="bg-slate-950 border border-slate-900 p-3.5 rounded-sm space-y-3.5">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Filter directory..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-100 text-xs px-3 py-1.5 pl-8 rounded-sm focus:outline-hidden font-mono"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[9px] font-mono text-slate-400">
                    <div className="space-y-1">
                      <label className="uppercase">Workspace</label>
                      <select
                        value={filterWorkspace}
                        onChange={(e) => setFilterWorkspace(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 p-1 text-[9px] focus:outline-hidden"
                      >
                        <option value="all">ALL</option>
                        <option value="engineering">ENGINEERING</option>
                        <option value="business">BUSINESS</option>
                        <option value="personal">PERSONAL</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="uppercase">Format</label>
                      <select
                        value={filterFormat}
                        onChange={(e) => setFilterFormat(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 p-1 text-[9px] focus:outline-hidden"
                      >
                        <option value="all">ALL</option>
                        <option value="pdf">PDF</option>
                        <option value="dwg">DWG/CAD</option>
                        <option value="md">MARKDOWN</option>
                        <option value="xlsx">XLSX/CSV</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="uppercase">Clearance</label>
                      <select
                        value={filterSecurity}
                        onChange={(e) => setFilterSecurity(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 p-1 text-[9px] focus:outline-hidden"
                      >
                        <option value="all">ALL</option>
                        <option value="public">PUBLIC</option>
                        <option value="internal">INTERNAL</option>
                        <option value="confidential">CONFIDENTIAL</option>
                        <option value="restricted">RESTRICTED</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Documents list */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 border-b border-slate-900 pb-1 px-1">
                    <span className="uppercase">Directory ({filteredDocuments.length} Registered)</span>
                    <span>Order: Creation</span>
                  </div>

                  <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
                    {filteredDocuments.length > 0 ? (
                      filteredDocuments.map((doc) => {
                        const isSelected = selectedDoc?.id === doc.id;
                        return (
                          <div
                            key={doc.id}
                            onClick={() => {
                              setSelectedDoc(doc);
                              setSelectedDocChunks(documentRegistry.getChunksForDocument(doc.id));
                              setActiveChunkIndex(0);
                            }}
                            className={`p-3 rounded-sm border cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-cyan-950/20 border-cyan-500 text-slate-100'
                                : 'bg-slate-950 border-slate-900 hover:border-slate-800 text-slate-400'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              {renderFormatBadge(doc.format)}
                              <span className="text-[8px] font-mono uppercase bg-slate-900 text-slate-500 px-1 rounded">
                                {doc.workspace}
                              </span>
                            </div>
                            <h4 className="text-xs font-bold leading-snug line-clamp-1 text-slate-200">
                              {doc.title}
                            </h4>
                            <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5 leading-relaxed">
                              {doc.description}
                            </p>
                            <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-900 text-[8px] font-mono">
                              <span>v{doc.version}</span>
                              <span className="text-slate-600">{new Date(doc.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="border border-slate-900 border-dashed rounded p-8 text-center text-slate-500">
                        <p className="text-[10px] font-mono italic">No registered files match active filters.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right column: Main Detailed Document Inspector */}
              <div className="lg:col-span-8">
                {selectedDoc ? (
                  <div className="bg-slate-950 border border-slate-900 rounded-sm">
                    {/* Panel Header */}
                    <div className="p-4 border-b border-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {renderFormatBadge(selectedDoc.format)}
                          {renderSecurityBadge(selectedDoc.classification)}
                        </div>
                        <h2 className="text-sm font-bold text-slate-100 leading-normal">{selectedDoc.title}</h2>
                        <p className="text-xs text-slate-400 leading-normal">{selectedDoc.description}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Change security settings selector */}
                        <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-sm gap-1">
                          <label className="text-[8px] font-mono text-slate-500 uppercase px-1">SECURITY: </label>
                          <select
                            value={selectedDoc.classification}
                            onChange={(e) => handleUpdateSecurity(selectedDoc.id, e.target.value as SecurityClassification)}
                            className="bg-slate-950 text-slate-300 border-0 text-[9px] font-mono focus:outline-hidden p-0.5"
                          >
                            <option value="public">PUBLIC</option>
                            <option value="internal">INTERNAL</option>
                            <option value="confidential">CONFIDENTIAL</option>
                            <option value="restricted">RESTRICTED</option>
                          </select>
                        </div>

                        {/* Purge document action */}
                        <button
                          onClick={() => handleDeleteDoc(selectedDoc.id)}
                          className="p-1.5 border border-rose-900/30 bg-rose-950/25 hover:bg-rose-950/60 rounded-sm text-rose-400 cursor-pointer transition-colors"
                          title="Purge Document"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Meta summary cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-slate-900 text-[10px] font-mono">
                      <div className="p-3 border-r border-slate-900 space-y-1">
                        <span className="text-slate-500 text-[8px] uppercase">Owner / Author</span>
                        <p className="text-slate-300 font-bold truncate">{selectedDoc.owner}</p>
                      </div>
                      <div className="p-3 border-r border-slate-900 space-y-1">
                        <span className="text-slate-500 text-[8px] uppercase">Registered File Size</span>
                        <p className="text-slate-300 font-bold">{(selectedDoc.sizeBytes / 1024).toFixed(2)} KB</p>
                      </div>
                      <div className="p-3 border-r border-slate-900 space-y-1">
                        <span className="text-slate-500 text-[8px] uppercase">Workspace Boundary</span>
                        <p className="text-slate-300 font-bold uppercase">{selectedDoc.workspace}</p>
                      </div>
                      <div className="p-3 space-y-1">
                        <span className="text-slate-500 text-[8px] uppercase">Checksum Verification</span>
                        <p className="text-[9px] text-cyan-400 font-bold font-mono truncate" title={selectedDoc.checksum}>
                          {selectedDoc.checksum}
                        </p>
                      </div>
                    </div>

                    {/* Split View: Outline (left) vs Chunks Segment Explorer (right) */}
                    <div className="grid grid-cols-1 md:grid-cols-12 min-h-[400px]">
                      {/* Outline Tree (Left 4 cols) */}
                      <div className="md:col-span-4 border-r border-slate-900 p-4 space-y-4 bg-slate-950/40">
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 uppercase font-bold border-b border-slate-900 pb-2">
                          <List className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Extracted Headers</span>
                        </div>

                        <div className="space-y-1">
                          {selectedDoc.customFields?.linesCount ? (
                            <div className="text-[9px] font-mono text-slate-500 bg-slate-900 p-2 rounded">
                              <span className="font-bold">Plaintext Stream Info</span>
                              <ul className="mt-1 space-y-0.5">
                                <li>Lines Count: {selectedDoc.customFields.linesCount}</li>
                                <li>Ingestion: Normalized Plaintext</li>
                              </ul>
                            </div>
                          ) : selectedDoc.customFields?.rows ? (
                            <div className="text-[9px] font-mono text-slate-500 bg-slate-900 p-2 rounded">
                              <span className="font-bold">Grid Schema Metatables</span>
                              <ul className="mt-1 space-y-0.5">
                                <li>Excel Rows Ingested: {selectedDoc.customFields.rows}</li>
                                <li>Columns Count: {selectedDoc.customFields.columns}</li>
                                <li>Sheets Detected: {selectedDoc.customFields.sheetNames?.join(', ')}</li>
                              </ul>
                            </div>
                          ) : selectedDoc.customFields?.projection ? (
                            <div className="text-[9px] font-mono text-slate-500 bg-slate-900 p-2 rounded">
                              <span className="font-bold">CAD Layer Specifications</span>
                              <ul className="mt-1 space-y-0.5">
                                <li>Projection Mode: {selectedDoc.customFields.projection}</li>
                                <li>Measurement Units: {selectedDoc.customFields.units}</li>
                                <li>Layers Map: {selectedDoc.customFields.layerNames?.join(', ')}</li>
                              </ul>
                            </div>
                          ) : (
                            <div className="text-[9px] font-mono text-slate-500 bg-slate-900 p-2 rounded">
                              <span className="font-bold">Aviation Parser Details</span>
                              <ul className="mt-1 space-y-0.5">
                                <li>Page Extracted: {selectedDoc.customFields?.pages || 'Unknown'}</li>
                                <li>Format Profile: {selectedDoc.format.toUpperCase()} Engine v2.0</li>
                              </ul>
                            </div>
                          )}
                        </div>

                        {/* Custom extracted Outline headers hierarchy mock-rendering */}
                        <div className="space-y-2 font-mono text-[10px]">
                          <span className="text-[8px] text-slate-600 font-bold block uppercase">Document Layout Tree</span>
                          <div className="space-y-1 bg-[#090B0F] border border-slate-900 p-2.5 rounded-sm max-h-[220px] overflow-y-auto">
                            {(selectedDoc.format === 'pdf' 
                              ? [
                                  { title: '1. Executive Summary', level: 1 },
                                  { title: '2. Environmental Testing Constraints', level: 1 },
                                  { title: '2.1 Temperature Shock Resistance', level: 2 },
                                  { title: '3. Compliance Protocols', level: 1 }
                                ]
                              : selectedDoc.format === 'dwg'
                              ? [
                                  { title: 'Layer Schema Definition', level: 1 },
                                  { title: 'Coordinate Bounds Inspection', level: 1 },
                                  { title: 'Component Assemblies', level: 2 }
                                ]
                              : selectedDoc.format === 'md'
                              ? [
                                  { title: '1. Authentication Handshake', level: 1 },
                                  { title: '2. Customer Ledger Ingestion', level: 1 },
                                  { title: '3. Contact Record Sync', level: 1 }
                                ]
                              : [
                                  { title: 'Ingested File Payload Header', level: 1 }
                                ]
                            ).map((hdr, hIdx) => (
                              <div
                                key={hIdx}
                                className={`flex items-center gap-1.5 py-0.5 truncate ${
                                  hdr.level === 2 ? 'pl-3.5 text-slate-500' : 'text-slate-300 font-semibold'
                                }`}
                              >
                                <ChevronRight className="w-2.5 h-2.5 text-cyan-400 shrink-0" />
                                <span className="truncate">{hdr.title}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Chunks Directory Explorer (Right 8 cols) */}
                      <div className="md:col-span-8 p-4 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 uppercase font-bold">
                            <Layers className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Segment Chunks list ({selectedDocChunks.length} nodes)</span>
                          </div>
                          <span className="text-[8px] font-mono text-slate-500 uppercase">Mean Size: 300 Chars</span>
                        </div>

                        {/* Chunk segments horizontal scroll buttons */}
                        <div className="flex gap-2 overflow-x-auto pb-1 text-[9px] font-mono scrollbar-thin">
                          {selectedDocChunks.map((chunk, idx) => (
                            <button
                              key={chunk.id}
                              onClick={() => setActiveChunkIndex(idx)}
                              className={`px-3 py-1.5 rounded-sm font-bold border whitespace-nowrap cursor-pointer transition-all ${
                                activeChunkIndex === idx
                                  ? 'bg-indigo-500 text-slate-950 border-indigo-400'
                                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              CHUNK #{chunk.chunkNumber}
                            </button>
                          ))}
                        </div>

                        {/* Active Selected Chunk Inspector Frame */}
                        {selectedDocChunks[activeChunkIndex] ? (
                          <div className="bg-[#090C12] border border-slate-900 rounded p-4 space-y-4">
                            {/* Chunk Metadata Panel */}
                            <div className="grid grid-cols-2 border-b border-slate-900/60 pb-3 text-[10px] font-mono text-slate-400">
                              <div className="space-y-1">
                                <span className="text-[8px] text-slate-600 uppercase">Chunk ID vector</span>
                                <p className="text-indigo-400 font-bold font-mono">{selectedDocChunks[activeChunkIndex].id}</p>
                              </div>
                              <div className="space-y-1">
                                <span className="text-[8px] text-slate-600 uppercase">Text Limits Range</span>
                                <p className="text-slate-300">
                                  Char {selectedDocChunks[activeChunkIndex].startCharIndex} - {selectedDocChunks[activeChunkIndex].endCharIndex}
                                </p>
                              </div>
                            </div>

                            {/* Content Block */}
                            <div className="space-y-2">
                              <span className="text-[8px] font-mono text-slate-600 uppercase block">Extracted Content Fragment</span>
                              <div className="bg-slate-950/70 p-3.5 rounded border border-slate-900/80 font-mono text-xs text-slate-100 leading-relaxed max-h-[160px] overflow-y-auto whitespace-pre-wrap select-text">
                                {selectedDocChunks[activeChunkIndex].content}
                              </div>
                            </div>

                            {/* Sibling Linkage Vectors */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-[10px] font-mono text-slate-500">
                              <div className="bg-slate-900/40 p-2 rounded-sm border border-slate-900 space-y-1">
                                <span className="text-[8px] uppercase text-slate-600 font-bold block">Sibling Relationships</span>
                                <div className="space-y-0.5 text-[9px] text-slate-400">
                                  {selectedDocChunks[activeChunkIndex].relationships.siblingIds.map((sibId) => (
                                    <div key={sibId} className="flex items-center gap-1.5">
                                      <ArrowRight className="w-2.5 h-2.5 text-indigo-400" />
                                      <span className="font-bold">{sibId.split('-').slice(-2).join('-')}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="bg-slate-900/40 p-2 rounded-sm border border-slate-900 space-y-1">
                                <span className="text-[8px] uppercase text-slate-600 font-bold block">Category / Tags Linked</span>
                                <div className="flex flex-wrap gap-1">
                                  {selectedDocChunks[activeChunkIndex].metadata.tags?.map((tag) => (
                                    <span key={tag} className="text-[8px] bg-slate-950 text-slate-400 border border-slate-900 px-1 py-0.5 rounded uppercase font-bold">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="py-12 border border-dashed border-slate-900 rounded text-center text-slate-500">
                            <Layers className="w-8 h-8 text-slate-800 mx-auto animate-pulse mb-2" />
                            <p className="text-[10px] font-mono uppercase">No Active chunk selected</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border border-slate-900 bg-slate-950/20 rounded-sm min-h-[480px] flex flex-col items-center justify-center text-center p-8">
                    <Activity className="w-8 h-8 text-slate-700 animate-pulse mb-3" />
                    <h4 className="text-sm font-semibold text-slate-400 mb-1">No Document Selected</h4>
                    <p className="text-xs text-slate-600 max-w-sm leading-normal">
                      Select any document asset from the left-hand index list to inspect meta configurations, custom fields, coordinate layer outlines, and partitioned text chunks.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SCREEN C: RAG RETRIEVAL & CONTEXT BUILDER PLAYGROUND */}
          {/* ========================================================= */}
          {activeTab === 'playground' && (
            <div className="space-y-6">
              {/* Controls panel */}
              <DSCard className="bg-[#0D0F16] border-slate-900">
                <DSCardHeader className="border-b border-slate-900 pb-3">
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-cyan-400" />
                    <DSCardTitle className="text-sm font-bold font-sans text-slate-100">JNAS Context Builder Workspace</DSCardTitle>
                  </div>
                  <DSCardSubtitle className="text-[10px] font-mono text-slate-500">
                    Input query variables to extract corporate vectors, KMS files, and global indexes into a compiled context payload.
                  </DSCardSubtitle>
                </DSCardHeader>

                <DSCardContent className="pt-4 space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
                    {/* Text box query */}
                    <div className="lg:col-span-8 space-y-1.5">
                      <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Semantic Search/RAG query string</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={ragQuery}
                          onChange={(e) => setRagQuery(e.target.value)}
                          placeholder="e.g. Temperature shock, calibrations audit..."
                          className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/50 text-slate-100 text-xs px-3.5 py-2.5 rounded-sm focus:outline-hidden font-mono"
                        />
                        <DSButton
                          variant="primary"
                          onClick={handleExecuteRag}
                          className="cursor-pointer shrink-0 uppercase text-[10px] font-mono font-bold flex items-center gap-1.5"
                        >
                          <Search className="w-3.5 h-3.5" />
                          Compile Context
                        </DSButton>
                      </div>
                    </div>

                    {/* Checkbox context config limits */}
                    <div className="lg:col-span-4 bg-[#08090F] border border-slate-900 p-2.5 rounded-sm">
                      <span className="text-[8px] font-mono text-slate-600 uppercase font-bold block mb-2">Synthesis Source Inclusions</span>
                      <div className="grid grid-cols-2 gap-2 text-[9px] font-mono text-slate-400">
                        <label className="flex items-center gap-1.5 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={configIncludeDocs}
                            onChange={(e) => setConfigIncludeDocs(e.target.checked)}
                            className="bg-slate-950 border-slate-800 rounded-xs text-cyan-500 focus:ring-0 cursor-pointer"
                          />
                          <span>RAG Chunks</span>
                        </label>

                        <label className="flex items-center gap-1.5 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={configIncludeKms}
                            onChange={(e) => setConfigIncludeKms(e.target.checked)}
                            className="bg-slate-950 border-slate-800 rounded-xs text-cyan-500 focus:ring-0 cursor-pointer"
                          />
                          <span>KMS catalog</span>
                        </label>

                        <label className="flex items-center gap-1.5 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={configIncludeMemory}
                            onChange={(e) => setConfigIncludeMemory(e.target.checked)}
                            className="bg-slate-950 border-slate-800 rounded-xs text-cyan-500 focus:ring-0 cursor-pointer"
                          />
                          <span>Core Recall</span>
                        </label>

                        <label className="flex items-center gap-1.5 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={configIncludeSearch}
                            onChange={(e) => setConfigIncludeSearch(e.target.checked)}
                            className="bg-slate-950 border-slate-800 rounded-xs text-cyan-500 focus:ring-0 cursor-pointer"
                          />
                          <span>Search Hits</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </DSCardContent>
              </DSCard>

              {/* RAG Compilation Outputs Split */}
              {ragPayload ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left panel: Retrieved source nodes detail */}
                  <div className="lg:col-span-4 space-y-4">
                    <div className="bg-slate-950 border border-slate-900 p-4 rounded-sm space-y-3.5">
                      <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                        <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Source references (ranked)</span>
                        <span className="text-[8px] font-mono text-cyan-400 font-bold border border-cyan-900/30 px-1 rounded">
                          {ragPayload.sources.length} sources linked
                        </span>
                      </div>

                      <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
                        {ragPayload.sources.map((src: any, idx: number) => (
                          <div key={idx} className="bg-[#090B0F] border border-slate-900/80 p-3 rounded-sm space-y-1.5">
                            <div className="flex items-center justify-between text-[8px] font-mono">
                              <span className={`px-1 py-0.5 rounded font-extrabold uppercase ${
                                src.type === 'document' ? 'bg-indigo-950 text-indigo-400 border border-indigo-900/30' :
                                src.type === 'knowledge' ? 'bg-cyan-950 text-cyan-400 border border-cyan-900/30' :
                                src.type === 'memory' ? 'bg-amber-950 text-amber-400 border border-amber-900/30' :
                                'bg-violet-950 text-violet-400 border border-violet-900/30'
                              }`}>
                                {src.type}
                              </span>
                              <span className="text-slate-500">SRC #{idx + 1}</span>
                            </div>
                            <h4 className="text-xs font-bold text-slate-200 leading-normal line-clamp-1">{src.title}</h4>
                            <p className="text-[9px] text-slate-500 font-mono">Node ID: {src.id}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right panel: Raw Context Prompt compilation */}
                  <div className="lg:col-span-8 bg-slate-950 border border-slate-900 rounded-sm p-4 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-900 pb-2.5">
                      <div className="flex items-center gap-1.5">
                        <FileCode className="w-4 h-4 text-cyan-400" />
                        <span className="text-xs font-bold font-mono uppercase text-slate-200">Unified Prompt Context Frame</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                        <span>ESTIMATED TOKENS: </span>
                        <span className="text-cyan-400 font-bold font-mono">{ragPayload.tokenCount} tokens</span>
                      </div>
                    </div>

                    <div className="relative">
                      {/* Read-only formatted prompt payload */}
                      <pre className="bg-black/60 text-emerald-400 p-4 rounded font-mono text-[10px] leading-relaxed max-h-[480px] overflow-y-auto whitespace-pre-wrap select-all border border-slate-900">
                        {ragPayload.contextString}
                      </pre>
                      
                      <div className="absolute top-2.5 right-2.5 bg-slate-900/80 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white px-2 py-1 rounded text-[9px] font-mono uppercase font-bold cursor-pointer transition-all select-none"
                        onClick={() => {
                          navigator.clipboard.writeText(ragPayload.contextString);
                          triggerToast('success', 'Context payload copied to clipboard.');
                        }}
                      >
                        Copy Payload
                      </div>
                    </div>

                    <div className="text-[10px] font-mono text-slate-500 flex items-center gap-2">
                      <Info className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                      <p>
                        This payload structure enforces security barriers and workspace boundaries. The JNAS AI Gateway receives this sanitized frame for model synthesis.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border border-slate-900 bg-slate-950/20 rounded p-12 text-center text-slate-500">
                  <Brain className="w-10 h-10 mx-auto text-slate-800 animate-pulse mb-3" />
                  <p className="text-xs font-mono uppercase tracking-widest">No Context Compiled</p>
                  <p className="text-xs max-w-sm mx-auto text-slate-600 mt-1">
                    Input a keyword matching aerospace guidelines or standard operational playbooks and click "Compile Context".
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* SCREEN D: PARSER ENGINES MANAGEMENT */}
          {/* ========================================================= */}
          {activeTab === 'parsers' && (
            <div className="space-y-6">
              <DSCard className="bg-[#0D0F16] border-slate-900">
                <DSCardHeader className="border-b border-slate-900 pb-3">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-cyan-400" />
                    <DSCardTitle className="text-sm font-bold font-sans text-slate-100">Parser Ingestion Engines</DSCardTitle>
                  </div>
                  <DSCardSubtitle className="text-[10px] font-mono text-slate-500">
                    Control active parser pipelines, tweak execution priorities, and monitor extractor versioning.
                  </DSCardSubtitle>
                </DSCardHeader>

                <DSCardContent className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {parsers.map((parser) => {
                      const isOnline = parser.status === 'online';
                      return (
                        <div key={parser.id} className="bg-slate-950 border border-slate-900 rounded p-4 space-y-4 relative overflow-hidden">
                          {/* Top Status Indicators */}
                          <div className="flex items-start justify-between gap-2 border-b border-slate-900 pb-3">
                            <div className="space-y-0.5">
                              <h4 className="text-xs font-extrabold text-slate-200">{parser.name}</h4>
                              <p className="text-[9px] font-mono text-slate-500">ID: {parser.id}</p>
                            </div>
                            <div className="flex flex-col items-end gap-1 shrink-0 font-mono text-[8px]">
                              <span className="text-slate-600">v{parser.version}</span>
                              <span className={`px-1.5 py-0.5 rounded font-extrabold uppercase ${
                                isOnline ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/30' : 'bg-slate-900 text-slate-500'
                              }`}>
                                {parser.status}
                              </span>
                            </div>
                          </div>

                          {/* Formats supported */}
                          <div className="space-y-1">
                            <span className="text-[8px] font-mono text-slate-600 uppercase font-bold block">Supported formats</span>
                            <div className="flex flex-wrap gap-1.5">
                              {parser.supportedFormats.map((f) => (
                                <span key={f} className="text-[9px] font-mono bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800">
                                  .{f}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Slider / Controls */}
                          <div className="space-y-2 text-[10px] font-mono text-slate-400">
                            <div className="flex justify-between items-center">
                              <span>Ingestion Priority:</span>
                              <span className="text-cyan-400 font-bold">{parser.priority}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <input
                                type="range"
                                min="1"
                                max="100"
                                value={parser.priority}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value);
                                  parserRegistry.setParserPriority(parser.id, val);
                                  refreshLists();
                                }}
                                className="w-full accent-cyan-500 h-1 bg-slate-900 rounded-lg cursor-pointer"
                              />
                            </div>
                          </div>

                          {/* Bottom controls */}
                          <div className="flex items-center justify-between pt-3 border-t border-slate-900 text-[10px] font-mono">
                            <div className="flex items-center gap-1.5">
                              <Power className={`w-3.5 h-3.5 ${isOnline ? 'text-emerald-500' : 'text-slate-600'}`} />
                              <span>Active Pipeline</span>
                            </div>

                            <button
                              onClick={() => {
                                const nextStatus = isOnline ? 'disabled' : 'online';
                                parserRegistry.setParserStatus(parser.id, nextStatus);
                                triggerToast('success', `${parser.name} status updated to ${nextStatus.toUpperCase()}`);
                                refreshLists();
                              }}
                              className={`px-2 py-1 rounded-sm border cursor-pointer font-bold text-[9px] uppercase transition-all ${
                                isOnline 
                                  ? 'bg-rose-950/25 border-rose-900/30 text-rose-400 hover:bg-rose-950/55' 
                                  : 'bg-emerald-950/25 border-emerald-900/30 text-emerald-400 hover:bg-emerald-950/55'
                              }`}
                            >
                              {isOnline ? 'Disable' : 'Enable'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </DSCardContent>
              </DSCard>
            </div>
          )}

          {/* ========================================================= */}
          {/* SCREEN E: SYSTEM SPECIFICATIONS / DEVELOPER GUIDES */}
          {/* ========================================================= */}
          {activeTab === 'documentation' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Table of contents (Left) */}
              <div className="md:col-span-4 bg-[#0D0F16] border border-slate-900 p-4 rounded-sm space-y-4 font-mono text-xs">
                <div className="flex items-center gap-2 text-slate-100 border-b border-slate-900 pb-2.5">
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold uppercase tracking-wider">Table of Contents</span>
                </div>

                <ul className="space-y-1.5">
                  {[
                    { id: 'arch', label: '1. Document Intelligence Architecture' },
                    { id: 'pipeline', label: '2. Processing Pipeline Guide' },
                    { id: 'parser', label: '3. Parser Development Guide' },
                    { id: 'context', label: '4. Context Builder Guide' },
                    { id: 'retrieval', label: '5. Retrieval Guide' },
                    { id: 'security', label: '6. Security Guide' },
                    { id: 'rag_guide', label: '7. Future RAG Expansion Guide' },
                    { id: 'dev', label: '8. Developer Guide' }
                  ].map((guide) => (
                    <li key={guide.id}>
                      <a
                        href={`#doc-${guide.id}`}
                        className="flex items-center gap-2 p-1.5 rounded-sm hover:bg-slate-900/50 text-slate-400 hover:text-slate-100 transition-colors"
                      >
                        <ChevronRight className="w-3 h-3 text-cyan-400 shrink-0" />
                        <span className="leading-snug">{guide.label}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Scrollable documentation text (Right) */}
              <div className="md:col-span-8 bg-slate-950 border border-slate-900 rounded-sm p-6 space-y-8 select-text overflow-y-auto max-h-[720px] scroll-smooth leading-relaxed text-sm text-slate-300">
                
                {/* 1. ARCHITECTURE */}
                <section id="doc-arch" className="space-y-3.5 border-b border-slate-900 pb-6">
                  <h3 className="text-base font-bold text-slate-100 border-l-2 border-cyan-500 pl-2">
                    1. Document Intelligence Architecture
                  </h3>
                  <p>
                    The Document Intelligence & RAG Platform is modeled as a decoupled system service within the JNAS ecosystem. It registers files into isolated workspace directories, processes text content, and fragments long textual records into overlapping, search-ready chunks.
                  </p>
                  <p className="font-mono text-xs text-cyan-400 bg-slate-900/60 p-3 rounded">
                    Architecture Boundaries:<br/>
                    - All files are bound strictly to their source isolation workspace.<br/>
                    - Downstream synthesis operations occur strictly within secure context bounds.<br/>
                    - Direct file stream access is prohibited; all engines fetch via the Context Builder.
                  </p>
                </section>

                {/* 2. PIPELINE GUIDE */}
                <section id="doc-pipeline" className="space-y-3.5 border-b border-slate-900 pb-6">
                  <h3 className="text-base font-bold text-slate-100 border-l-2 border-cyan-500 pl-2">
                    2. Processing Pipeline Guide
                  </h3>
                  <p>
                    The Pipeline handles uploaded data sequentially across isolated filters. The pipeline ensures full validation, antivirus safety check, metadata and content extraction, language detection, overlap partitioning, and inverse indexing.
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-400 font-mono">
                    <li>Stage 1 (Upload): Ingests the raw document stream into the sandbox context.</li>
                    <li>Stage 2 (Validation): Checks format support against online parser configurations.</li>
                    <li>Stage 3 (Virus Scan): Simulates anti-malware clearance gates (Threat Score target: 0.00).</li>
                    <li>Stage 4 (Extraction): Invokes format-specific parsers to extract plain text and layouts.</li>
                    <li>Stage 5 (Localization): Detects source language for processing alignments.</li>
                    <li>Stage 6 (Chunking): Segments character streams (Default: 300 characters, 15% overlap).</li>
                    <li>Stage 7 (Cross-Module): Dispatches reference catalog nodes to KMS and Search modules.</li>
                  </ul>
                </section>

                {/* 3. PARSER DEVELOPMENT GUIDE */}
                <section id="doc-parser" className="space-y-3.5 border-b border-slate-900 pb-6">
                  <h3 className="text-base font-bold text-slate-100 border-l-2 border-cyan-500 pl-2">
                    3. Parser Development Guide
                  </h3>
                  <p>
                    New parsers must adhere to the <code>DocumentParser</code> interface contract defined within <code>types.ts</code>. Parsers must provide priority ranking metadata, a list of supported formats, and execute an async <code>parse()</code> routine.
                  </p>
                  <pre className="bg-black/50 p-3 rounded font-mono text-[10px] text-emerald-400 border border-slate-900">
{`interface DocumentParser {
  id: string;
  name: string;
  version: string;
  supportedFormats: DocumentFormat[];
  priority: number;
  parse: (content: any) => Promise<{
    text: string;
    metadata: Record<string, any>;
    outline: OutlineHeader[];
  }>;
}`}
                  </pre>
                </section>

                {/* 4. CONTEXT BUILDER GUIDE */}
                <section id="doc-context" className="space-y-3.5 border-b border-slate-900 pb-6">
                  <h3 className="text-base font-bold text-slate-100 border-l-2 border-cyan-500 pl-2">
                    4. Context Builder Guide
                  </h3>
                  <p>
                    The Context Builder is the only interface through which the AI Provider accesses information. It aggregates text segments, KMS articles, recent core memory recall files, and universal search matches. It calculates estimated tokens, filters by workspace, and wraps everything into a secure, read-only markdown payload.
                  </p>
                </section>

                {/* 5. RETRIEVAL GUIDE */}
                <section id="doc-retrieval" className="space-y-3.5 border-b border-slate-900 pb-6">
                  <h3 className="text-base font-bold text-slate-100 border-l-2 border-cyan-500 pl-2">
                    5. Retrieval Guide
                  </h3>
                  <p>
                    Retrieval queries utilize keyword proximity algorithms. A chunk's final score is calculated based on exact terms matches, heading boosts, and title overlaps, capped strictly between 0.1 and 0.99 for robust sorting without embedding dependency.
                  </p>
                </section>

                {/* 6. SECURITY GUIDE */}
                <section id="doc-security" className="space-y-3.5 border-b border-slate-900 pb-6">
                  <h3 className="text-base font-bold text-slate-100 border-l-2 border-cyan-500 pl-2">
                    6. Security Guide
                  </h3>
                  <p>
                    Workspace and tenant isolation is strictly enforced. Chunks belonging to a workspace are blocked from surfacing in queries issued from another workspace. Documents can carry classified levels: Public, Internal, Confidential, and Restricted.
                  </p>
                </section>

                {/* 7. FUTURE RAG EXPANSION GUIDE */}
                <section id="doc-rag_guide" className="space-y-3.5 border-b border-slate-900 pb-6">
                  <h3 className="text-base font-bold text-slate-100 border-l-2 border-cyan-500 pl-2">
                    7. Future RAG Expansion Guide
                  </h3>
                  <p>
                    For future iterations implementing vector database indices, the <code>relationships</code> object on each <code>DocumentChunk</code> carries placeholder fields for embedding vectors. A simple cosine-similarity function will plug directly into <code>retrieval.ts</code> without altering pipeline or parser registries.
                  </p>
                </section>

                {/* 8. DEVELOPER GUIDE */}
                <section id="doc-dev" className="space-y-3.5">
                  <h3 className="text-base font-bold text-slate-100 border-l-2 border-cyan-500 pl-2">
                    8. Developer Guide
                  </h3>
                  <p>
                    To seed or query files programmatically, import the registry singletons into your modules:
                  </p>
                  <pre className="bg-black/50 p-3 rounded font-mono text-[10px] text-emerald-400 border border-slate-900">
{`import { documentRegistry } from '../backend/document-intelligence/documentRegistry';
import { retrieveChunks } from '../backend/document-intelligence/retrieval';

// Ingest query results
const matchedChunks = retrieveChunks({
  text: 'vibrations',
  workspace: 'engineering',
  limit: 5
});`}
                  </pre>
                </section>

              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

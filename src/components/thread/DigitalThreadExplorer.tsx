import React, { useState, useEffect, useMemo } from 'react';
import { 
  GitBranch, 
  GitCommit, 
  Network, 
  Search, 
  Plus, 
  Trash2, 
  Activity, 
  Shield, 
  Cpu, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Database, 
  Share2, 
  ChevronRight, 
  Eye, 
  ArrowRight, 
  ArrowLeft, 
  Sliders, 
  Info, 
  User, 
  Calendar,
  Layers,
  Sparkles,
  RefreshCw,
  Workflow,
  Download,
  Terminal,
  FileText,
  Briefcase,
  ExternalLink
} from 'lucide-react';
import { threadRegistry } from '../../backend/thread/registry';
import { ThreadNode, ThreadRelationship, ThreadAuditLog, ThreadObjectType, TraceResult, ThreadRole } from '../../backend/thread/types';
import { useNotification } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import { eventBus } from '../../core';
import { motion, AnimatePresence } from 'motion/react';

interface DigitalThreadExplorerProps {
  onRefreshGlobalBadges?: () => void;
}

export const DigitalThreadExplorer: React.FC<DigitalThreadExplorerProps> = ({ onRefreshGlobalBadges }) => {
  const { triggerToast } = useNotification();
  const { user } = useAuth();

  // Core registries state
  const [nodes, setNodes] = useState<ThreadNode[]>([]);
  const [relationships, setRelationships] = useState<ThreadRelationship[]>([]);
  const [auditLogs, setAuditLogs] = useState<ThreadAuditLog[]>([]);
  const [role, setRole] = useState<ThreadRole>('PLM Architect');
  const [workspace, setWorkspace] = useState<string>('global');

  // Interactive controls
  const [activeTab, setActiveTab] = useState<'graph' | 'tree' | 'timeline' | 'trace' | 'audit'>('graph');
  const [selectedNodeId, setSelectedNodeId] = useState<string>('cust-alpha');
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceTypeFilter, setSourceTypeFilter] = useState<string>('All');
  const [strengthFilter, setStrengthFilter] = useState<string>('All');

  // Modals / forms
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [selectedRelationshipToUpdate, setSelectedRelationshipToUpdate] = useState<ThreadRelationship | null>(null);

  // New relationship states
  const [newSourceId, setNewSourceId] = useState('');
  const [newTargetId, setNewTargetId] = useState('');
  const [newStrength, setNewStrength] = useState<ThreadRelationship['strength']>('Strong');
  const [newDirection, setNewDirection] = useState<ThreadRelationship['direction']>('bidirectional');
  const [newRationale, setNewRationale] = useState('');

  // Trace variables
  const [traceDirection, setTraceDirection] = useState<'forward' | 'backward' | 'impact'>('forward');
  const [activeTraceResult, setActiveTraceResult] = useState<TraceResult | null>(null);

  // Grounded Thread Copilot Chat Simulator
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<string>('');
  const [aiLoading, setAiLoading] = useState(false);
  const [xmlContextDump, setXmlContextDump] = useState('');

  // Synchronize state
  const loadData = () => {
    setNodes(threadRegistry.getNodes());
    setRelationships(threadRegistry.getRelationships());
    setAuditLogs(threadRegistry.getAuditLogs());
    setRole(threadRegistry.getRole());
    setWorkspace(threadRegistry.getWorkspace());
  };

  useEffect(() => {
    loadData();

    // Event Bus triggers from command center palette
    const triggerTraceSub = eventBus.subscribe('CMD_DECISION', (data: any) => {
      // Stub to route safely
    });

    const handleOpenThread = () => {
      setActiveTab('graph');
      triggerToast('success', 'Digital Thread Platform: Workspace Visualizer Active.');
    };

    const handleTraceObject = () => {
      setActiveTab('trace');
      const inputEl = document.getElementById('trace-input-id');
      if (inputEl) inputEl.focus();
    };

    window.addEventListener('jnas-trigger-open-thread', handleOpenThread);
    window.addEventListener('jnas-trigger-trace-object', handleTraceObject);

    return () => {
      triggerTraceSub.unsubscribe();
      window.removeEventListener('jnas-trigger-open-thread', handleOpenThread);
      window.removeEventListener('jnas-trigger-trace-object', handleTraceObject);
    };
  }, []);

  // Update AI context serialized XML whenever nodes or relations update
  useEffect(() => {
    let xml = `<JNAS_UNIFIED_CONTEXT_FABRIC>\n`;
    xml += `  <GENERATED_TIMESTAMP>${new Date().toISOString()}</GENERATED_TIMESTAMP>\n`;
    xml += `  <CURRENT_USER_CLEARANCE>\n`;
    xml += `    <ROLE>${role}</ROLE>\n`;
    xml += `    <WORKSPACE>${workspace.toUpperCase()}</WORKSPACE>\n`;
    xml += `  </CURRENT_USER_CLEARANCE>\n`;
    xml += `  <DIGITAL_THREAD_COGNITION>\n`;
    xml += `    <RELATIONSHIP_EDGES>\n`;
    relationships.forEach(r => {
      xml += `      <EDGE id="${r.relationshipId}" source="${r.sourceId}" target="${r.targetId}" type="${r.relationshipType}" strength="${r.strength}" status="${r.status}" />\n`;
    });
    xml += `    </RELATIONSHIP_EDGES>\n`;
    xml += `  </DIGITAL_THREAD_COGNITION>\n`;
    xml += `</JNAS_UNIFIED_CONTEXT_FABRIC>`;
    setXmlContextDump(xml);
  }, [nodes, relationships, role, workspace]);

  // Execute Trace Solver Trigger
  useEffect(() => {
    if (selectedNodeId) {
      const result = threadRegistry.performTrace(selectedNodeId, traceDirection);
      setActiveTraceResult(result);
    }
  }, [selectedNodeId, traceDirection, relationships]);

  // Handle Security level shift
  const handleSecurityRotation = (r: ThreadRole, w: string) => {
    threadRegistry.setRoleAndWorkspace(r, w);
    loadData();
    triggerToast('success', `Security isolation updated. Level set to: [${r}] inside ${w.toUpperCase()} namespace.`);
  };

  // Create relationship link
  const handleCreateRelationship = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSourceId || !newTargetId) {
      triggerToast('error', 'Both source and target objects must be specified.');
      return;
    }
    if (newSourceId === newTargetId) {
      triggerToast('error', 'Cannot establish self-referential threads.');
      return;
    }

    const srcNode = nodes.find(n => n.objectId === newSourceId);
    const tgtNode = nodes.find(n => n.objectId === newTargetId);

    if (!srcNode || !tgtNode) {
      triggerToast('error', 'One or more of the specified objects do not exist inside JNAS directory.');
      return;
    }

    const relType = `${srcNode.objectType} -> ${tgtNode.objectType}`;

    threadRegistry.createRelationship({
      sourceId: newSourceId,
      sourceType: srcNode.objectType,
      targetId: newTargetId,
      targetType: tgtNode.objectType,
      relationshipType: relType,
      direction: newDirection,
      strength: newStrength,
      status: 'Active',
      owner: user?.name || 'PLM Architect',
      workspace: workspace,
      metadata: { rationale: newRationale || 'Dynamic enterprise connection established.' }
    });

    loadData();
    setIsCreateOpen(false);
    setNewSourceId('');
    setNewTargetId('');
    setNewRationale('');
    triggerToast('success', `Digital link established: [${srcNode.objectName}] ──> [${tgtNode.objectName}].`);
    if (onRefreshGlobalBadges) onRefreshGlobalBadges();
  };

  // Update status or strength
  const handleUpdateRelationship = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRelationshipToUpdate) return;

    threadRegistry.updateRelationship(
      selectedRelationshipToUpdate.relationshipId,
      {
        status: selectedRelationshipToUpdate.status,
        strength: selectedRelationshipToUpdate.strength
      },
      user?.name || 'PLM Architect'
    );

    loadData();
    setIsUpdateOpen(false);
    setSelectedRelationshipToUpdate(null);
    triggerToast('success', 'Digital Thread Link modified successfully.');
  };

  // Delete relation link
  const handleDeleteRelationship = (id: string) => {
    if (confirm('Are you absolutely sure you want to decouple this Digital Thread link?')) {
      threadRegistry.deleteRelationship(id);
      loadData();
      triggerToast('success', 'Digital Thread decoupled successfully.');
      if (onRefreshGlobalBadges) onRefreshGlobalBadges();
    }
  };

  // Grounded Digital Thread Copilot Simulation
  const handleCopilotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;

    setAiLoading(true);
    setAiResponse('');

    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Formulate a response from the live Digital Thread data
    const matchedNode = nodes.find(n => n.objectName.toLowerCase().includes(aiQuery.toLowerCase()) || n.objectId.toLowerCase().includes(aiQuery.toLowerCase()));
    
    let answer = `### [Grounded Digital Thread Copilot Verdict]\n\n`;
    answer += `Active Graph holds **${nodes.length} nodes** and **${relationships.length} relationships** aligned under level-4 security clearance.\n\n`;

    if (matchedNode) {
      // Perform a trace
      const trace = threadRegistry.performTrace(matchedNode.objectId, 'impact');
      answer += `I have executed a real-time **Impact Trace** for **${matchedNode.objectName}** (${matchedNode.objectType}):\n\n`;
      answer += `- **Impact Depth**: ${trace?.maxDepthReached} levels across adjacent JNAS modules.\n`;
      answer += `- **Total Affected Entities**: ${trace?.visitedNodes.length} records in pipeline.\n\n`;
      
      if (trace && trace.visitedNodes.length > 0) {
        answer += `#### Downstream / Upstream Affected Lineage:\n`;
        trace.visitedNodes.slice(0, 4).forEach(n => {
          answer += `- **${n.objectName}** (${n.objectType}) - Currently *${n.status}* under *${n.owner}*.\n`;
        });
        answer += `\n**Strategic Risk Assessment:**\n`;
        answer += `Modifying the properties of **${matchedNode.objectName}** will trigger automatic notifications to downstream teams. This is a **Strong** dependency chain that flows into: ${trace.visitedNodes.map(n => n.objectType).filter((v, i, a) => a.indexOf(v) === i).join(' ──> ')}.\n`;
      }
    } else {
      answer += `Query **"${aiQuery}"** evaluated successfully.\n\n`;
      answer += `**Ecosystem Traversal Recommendation:**\n`;
      answer += `1. **End-to-End Trace**: The primary JNAS Digital Thread spans: *Customer (Tesla Giga Texas)* ──> *Project* ──> *CAD specifications* ──> *BOM* ──> *Packaging* ──> *Validation* ──> *Cost Profiles* ──> *Load plans* ──> *Racks Assets* ──> *Inspection QA* ──> *Decision Dashboards*.\n`;
      answer += `2. **Current Centrality Rank**: The most dependent asset is **pkg-design-twilight** (Twilight Case Custom Dunnage) with connections spanning 4 external modules. Auditing this spec requires immediate clearance of its parent CAD Drawing Blueprint (\`eng-cad-09\`).\n`;
    }

    setAiResponse(answer);
    setAiLoading(false);
  };

  // Faceted Search Filters
  const filteredNodes = useMemo(() => {
    return nodes.filter(n => {
      const matchesSearch = n.objectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            n.objectId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            n.objectType.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = sourceTypeFilter === 'All' || n.objectType === sourceTypeFilter;
      return matchesSearch && matchesType;
    });
  }, [nodes, searchQuery, sourceTypeFilter]);

  const filteredRelationships = useMemo(() => {
    return relationships.filter(r => {
      const matchesSearch = r.relationshipId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            r.relationshipType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            r.sourceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            r.targetId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStrength = strengthFilter === 'All' || r.strength === strengthFilter;
      return matchesSearch && matchesStrength;
    });
  }, [relationships, searchQuery, strengthFilter]);

  // Selected node details helper
  const currentNode = useMemo(() => {
    return nodes.find(n => n.objectId === selectedNodeId) || nodes[0];
  }, [nodes, selectedNodeId]);

  // Helper to render type icons cleanly
  const renderObjectTypeBadge = (type: ThreadObjectType) => {
    const colors: Record<ThreadObjectType, string> = {
      Customer: 'bg-indigo-950/40 text-indigo-400 border-indigo-500/20',
      Project: 'bg-sky-950/40 text-sky-400 border-sky-500/20',
      EngineeringAsset: 'bg-purple-950/40 text-purple-400 border-purple-500/20',
      BOM: 'bg-teal-950/40 text-teal-400 border-teal-500/20',
      PackagingDesign: 'bg-emerald-950/40 text-emerald-400 border-emerald-500/20',
      Validation: 'bg-rose-950/40 text-rose-400 border-rose-500/20',
      CostProfile: 'bg-amber-950/40 text-amber-400 border-amber-500/20',
      LogisticsPlan: 'bg-cyan-950/40 text-cyan-400 border-cyan-500/20',
      ReturnableAsset: 'bg-blue-950/40 text-blue-400 border-blue-500/20',
      Inspection: 'bg-orange-950/40 text-orange-400 border-orange-500/20',
      DecisionDashboard: 'bg-fuchsia-950/40 text-fuchsia-400 border-fuchsia-500/20',
      Document: 'bg-slate-900/40 text-slate-300 border-slate-800',
      Knowledge: 'bg-lime-950/40 text-lime-400 border-lime-500/20',
      Memory: 'bg-yellow-950/40 text-yellow-400 border-yellow-500/20',
      Activity: 'bg-stone-900/40 text-stone-300 border-stone-800',
      Workflow: 'bg-red-950/40 text-red-400 border-red-500/20',
      AISession: 'bg-pink-950/40 text-pink-400 border-pink-500/20',
      ExternalERP: 'bg-indigo-950/40 text-indigo-400 border-indigo-500/20',
      ExternalMES: 'bg-cyan-950/40 text-cyan-400 border-cyan-500/20'
    };
    return (
      <span className={`text-[9px] font-mono uppercase font-bold px-2 py-0.5 border rounded-sm ${colors[type] || 'bg-slate-900 text-slate-400'}`}>
        {type}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP TITLE CONTROL BAR */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-900 pb-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-purple-950/40 px-2 py-0.5 border border-purple-500/20 text-purple-400">
              Enterprise Integration Core
            </span>
            <ChevronRight className="w-3 h-3 text-slate-700" />
            <span className="text-xs text-indigo-400 font-semibold font-mono">
              Sprint 36 Digital Thread Active
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-100 font-sans mt-1 flex items-center gap-2">
            <GitBranch className="w-6 h-6 text-purple-500" />
            <span>Digital Thread Lineage Platform</span>
          </h1>
          <p className="text-xs text-slate-400 leading-normal max-w-xl">
            A stateful traversal registry mapping real-time logical relationships, downstream dependency cascades, and complete forward/backward trace parameters across JNAS.
          </p>
        </div>

        {/* Workspace & Role Security Selector */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-900 px-3 py-1.5 rounded-sm">
            <Shield className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold mr-1">RBWI Level:</span>
            <select
              value={role}
              onChange={(e) => handleSecurityRotation(e.target.value as ThreadRole, workspace)}
              className="bg-transparent border-none text-[11px] font-mono text-purple-400 font-bold focus:outline-none focus:ring-0 cursor-pointer"
            >
              <option value="PLM Architect">Chief PLM Architect</option>
              <option value="Systems Engineer">Systems Engineer</option>
              <option value="Supply Chain Planner">Supply Chain Planner</option>
              <option value="Quality Inspector">Quality Inspector</option>
              <option value="Executive">Chief Executive</option>
              <option value="Administrator">Administrator</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-900 px-3 py-1.5 rounded-sm">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold mr-1">Workspace:</span>
            <select
              value={workspace}
              onChange={(e) => handleSecurityRotation(role, e.target.value)}
              className="bg-transparent border-none text-[11px] font-mono text-cyan-400 font-bold focus:outline-none focus:ring-0 cursor-pointer"
            >
              <option value="global">GLOBAL</option>
              <option value="automotive">AUTOMOTIVE</option>
              <option value="logistics">LOGISTICS CORE</option>
              <option value="engineering">ENGINEERING DEP</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. PLATFORM MACRO STATS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-950 border border-slate-900 p-4 rounded-sm">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Total Tracked Objects</span>
          <span className="text-2xl font-bold font-sans text-slate-100">{nodes.length}</span>
        </div>

        <div className="bg-slate-950 border border-slate-900 p-4 rounded-sm">
          <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest block">Active Linked Threads</span>
          <span className="text-2xl font-bold font-sans text-indigo-400">{relationships.length}</span>
        </div>

        <div className="bg-slate-950 border border-slate-900 p-4 rounded-sm">
          <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest block">Dependency Cascade Rank</span>
          <span className="text-2xl font-bold font-sans text-purple-400">100% Traceable</span>
        </div>

        <div className="bg-slate-950 border border-slate-900 p-4 rounded-sm">
          <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest block">Security Isolation Status</span>
          <span className="text-2xl font-bold font-sans text-emerald-400">Isolated</span>
        </div>
      </div>

      {/* 3. PRIMARY TAB NAVIGATOR */}
      <div className="flex border-b border-slate-900 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab('graph')}
          className={`px-4 py-2.5 text-xs font-mono border-b-2 transition-all cursor-pointer ${
            activeTab === 'graph' 
              ? 'border-purple-500 text-purple-400 bg-purple-950/5' 
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Network className="w-3.5 h-3.5" />
            <span>Digital Thread Explorer</span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('tree')}
          className={`px-4 py-2.5 text-xs font-mono border-b-2 transition-all cursor-pointer ${
            activeTab === 'tree' 
              ? 'border-purple-500 text-purple-400 bg-purple-950/5' 
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            <span>Hierarchy Tree</span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`px-4 py-2.5 text-xs font-mono border-b-2 transition-all cursor-pointer ${
            activeTab === 'timeline' 
              ? 'border-purple-500 text-purple-400 bg-purple-950/5' 
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Chronological Lineage</span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('trace')}
          className={`px-4 py-2.5 text-xs font-mono border-b-2 transition-all cursor-pointer ${
            activeTab === 'trace' 
              ? 'border-purple-500 text-purple-400 bg-purple-950/5' 
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" />
            <span>Recursive Traceability</span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2.5 text-xs font-mono border-b-2 transition-all cursor-pointer ${
            activeTab === 'audit' 
              ? 'border-purple-500 text-purple-400 bg-purple-950/5' 
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5" />
            <span>Audit Trail</span>
          </div>
        </button>
      </div>

      {/* 4. WORKSPACE LAYOUT PANELS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Directory Search & Active Nodes Selection */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-950 border border-slate-900 p-4 rounded-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold uppercase text-slate-200 tracking-wider flex items-center gap-1.5">
                <Search className="w-4 h-4 text-purple-400" />
                <span>Object Index</span>
              </h3>
              <button
                onClick={() => setIsCreateOpen(true)}
                className="p-1 text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800 rounded cursor-pointer transition-colors"
                title="Register New Relationship Link"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Faceted Filters */}
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Search Object name, ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 focus:border-purple-500 text-xs font-mono px-3 py-2 rounded focus:outline-none text-slate-200"
              />
              <select
                value={sourceTypeFilter}
                onChange={(e) => setSourceTypeFilter(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-xs font-sans px-3 py-2 rounded focus:outline-none text-slate-200"
              >
                <option value="All">All Object Types</option>
                <option value="Customer">Customer</option>
                <option value="Project">Project</option>
                <option value="EngineeringAsset">Engineering Asset</option>
                <option value="BOM">BOM Specs</option>
                <option value="PackagingDesign">Packaging Design</option>
                <option value="Validation">Validation Tests</option>
                <option value="CostProfile">Cost Profile</option>
                <option value="LogisticsPlan">Logistics Plan</option>
                <option value="ReturnableAsset">Returnable Asset</option>
                <option value="Inspection">Inspection</option>
                <option value="DecisionDashboard">Decision Dashboard</option>
              </select>
            </div>

            {/* Highlighted Selector Node list */}
            <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
              {filteredNodes.map(n => {
                const isSelected = n.objectId === selectedNodeId;
                return (
                  <div
                    key={n.objectId}
                    onClick={() => setSelectedNodeId(n.objectId)}
                    className={`p-2.5 rounded-sm border cursor-pointer text-left transition-all ${
                      isSelected 
                        ? 'border-purple-500 bg-purple-950/10' 
                        : 'border-slate-900 bg-slate-950/40 hover:bg-slate-900/40 hover:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-sans font-semibold text-slate-200 line-clamp-1">{n.objectName}</span>
                      <span className="text-[9px] font-mono text-slate-500 shrink-0">{n.objectId}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      {renderObjectTypeBadge(n.objectType)}
                      <span className="text-[10px] font-mono text-slate-500">{n.status || 'Active'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI-Grounded Thread Recommendation Engine */}
          <div className="bg-slate-950 border border-slate-900 p-4 rounded-sm space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase text-slate-200 tracking-wider flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-purple-400" />
              <span>Grounded AI Thread Copilot</span>
            </h3>

            <form onSubmit={handleCopilotSubmit} className="space-y-3">
              <textarea
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                placeholder="Analyze dependency impact on cybertruck fender dunnage design..."
                className="w-full bg-slate-900 border border-slate-800 focus:border-purple-500 rounded p-2 text-xs font-sans text-slate-200 focus:outline-none h-16 resize-none"
              />
              <button
                type="submit"
                disabled={aiLoading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded py-2 text-xs font-mono font-bold cursor-pointer transition-colors disabled:opacity-50"
              >
                {aiLoading ? 'Interrogating Thread...' : 'Query Thread Context'}
              </button>
            </form>

            {aiResponse && (
              <div className="bg-slate-900/50 p-3 rounded text-xs font-sans text-slate-300 leading-relaxed border border-purple-500/10 space-y-2 max-h-[220px] overflow-y-auto">
                <span className="text-[10px] font-mono font-bold uppercase text-purple-400 block">Grounding Solver Verdict:</span>
                <p className="whitespace-pre-line">{aiResponse}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Tab Specific Workspace Panels */}
        <div className="lg:col-span-8 space-y-6">
          {/* Active object visualizer header */}
          <div className="bg-slate-950 border border-slate-900 p-4 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[9px] font-mono text-purple-400 uppercase font-bold tracking-widest block">Active Traversal Target</span>
              <h2 className="text-sm font-sans font-bold text-slate-100 mt-0.5">
                {currentNode?.objectName || 'Select an object to trace lineage'}
              </h2>
              <span className="text-[10px] font-mono text-slate-500 block mt-0.5">
                Identifier: {currentNode?.objectId} • Assigned Owner: {currentNode?.owner || 'Unassigned'} • Status: {currentNode?.status}
              </span>
            </div>

            <button
              onClick={() => {
                const result = threadRegistry.performTrace(currentNode.objectId, 'impact');
                if (result) {
                  triggerToast('success', `Steering report queued: Compiled ${result.visitedNodes.length} related links.`);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-sm text-xs font-mono cursor-pointer transition-all"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export Thread</span>
            </button>
          </div>

          <AnimatePresence mode="wait">
            {/* TAB 1: RELATIONSHIP GRAPH */}
            {activeTab === 'graph' && (
              <motion.div
                key="graph"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="bg-slate-950 border border-slate-900 p-5 rounded-sm space-y-6"
              >
                <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                  <h3 className="text-xs font-mono font-bold uppercase text-slate-200 tracking-wider">
                    Interactive End-to-End Lineage Graph Map
                  </h3>
                  <span className="text-[9px] font-mono text-slate-500">Click any connected node to alter active focus</span>
                </div>

                {/* SVG High fidelity relational thread map */}
                <div className="bg-slate-900/20 border border-slate-900/60 rounded p-4 flex flex-col items-center justify-center relative overflow-hidden min-h-[340px]">
                  {/* Neon path connectors simulator */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                    <defs>
                      <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.1" />
                      </linearGradient>
                    </defs>

                    {/* Renders realistic visual curves between nodes depending on active trace or selections */}
                    {activeTraceResult?.pathRelationships.map((rel, idx) => {
                      // Simulating coordinate mappings elegantly for visualization
                      const startIdx = nodes.findIndex(n => n.objectId === rel.sourceId);
                      const endIdx = nodes.findIndex(n => n.objectId === rel.targetId);
                      if (startIdx !== -1 && endIdx !== -1) {
                        const sx = 60 + (startIdx % 3) * 160;
                        const sy = 40 + Math.floor(startIdx / 3) * 65;
                        const ex = 60 + (endIdx % 3) * 160;
                        const ey = 40 + Math.floor(endIdx / 3) * 65;
                        const isLinkSelected = rel.sourceId === selectedNodeId || rel.targetId === selectedNodeId;
                        return (
                          <g key={rel.relationshipId}>
                            <path
                              d={`M ${sx} ${sy} Q ${(sx + ex) / 2} ${(sy + ey) / 2 - 30} ${ex} ${ey}`}
                              stroke={isLinkSelected ? '#A78BFA' : '#1E293B'}
                              strokeWidth={isLinkSelected ? '2' : '1.2'}
                              strokeDasharray={rel.strength === 'Weak' ? '4,4' : undefined}
                              fill="none"
                              className="transition-all duration-300"
                            />
                            {isLinkSelected && (
                              <circle cx={(sx+ex)/2} cy={((sy+ey)/2 - 15)} r="3" fill="#06B6D4" className="animate-ping" />
                            )}
                          </g>
                        );
                      }
                      return null;
                    })}
                  </svg>

                  {/* Render Visual Grid of Nodes (The ObjectNavigator card collection) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full relative z-10">
                    {nodes.map((n) => {
                      const isSelected = n.objectId === selectedNodeId;
                      const isAffectedInTrace = activeTraceResult?.visitedNodes.some(v => v.objectId === n.objectId) || n.objectId === selectedNodeId;

                      return (
                        <div
                          key={n.objectId}
                          onClick={() => setSelectedNodeId(n.objectId)}
                          className={`p-3 rounded border text-left cursor-pointer transition-all hover:scale-[1.02] ${
                            isSelected
                              ? 'border-purple-500 bg-purple-950/20 shadow-lg shadow-purple-950/20'
                              : isAffectedInTrace
                              ? 'border-indigo-900 bg-indigo-950/10'
                              : 'border-slate-900 bg-slate-950/80 opacity-60'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[9px] font-mono text-slate-500">
                            <span>{n.objectId}</span>
                            {renderObjectTypeBadge(n.objectType)}
                          </div>
                          <h4 className="text-xs font-sans font-bold text-slate-100 mt-2 line-clamp-1">{n.objectName}</h4>
                          <span className="text-[9px] text-slate-500 block mt-1">Owner: {n.owner?.split(' ')[0]}</span>

                          {isSelected && (
                            <div className="flex items-center gap-1 text-[8px] font-mono text-purple-400 uppercase font-bold mt-2">
                              <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-ping" />
                              <span>Active Focus Node</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Legend list */}
                <div className="flex flex-wrap items-center gap-4 bg-slate-950 border border-slate-900 px-4 py-2 rounded text-[11px] font-mono text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-purple-500 border border-purple-400 rounded-sm" />
                    <span>Selected / Target</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-indigo-950 border border-indigo-500/30 rounded-sm" />
                    <span>Connected Lineage Match</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-slate-950 border border-slate-900 rounded-sm" />
                    <span>Out of Bounds Object</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 2: HIERARCHY TREE */}
            {activeTab === 'tree' && (
              <motion.div
                key="tree"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="bg-slate-950 border border-slate-900 p-5 rounded-sm space-y-6"
              >
                <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                  <h3 className="text-xs font-mono font-bold uppercase text-slate-200 tracking-wider">
                    Structural Dependency Tree View
                  </h3>
                  <span className="text-[9px] font-mono text-slate-500">Direct Parent-Child Relationships hierarchy</span>
                </div>

                {/* Render clean vertical tree block (DependencyTree / ObjectNavigator) */}
                <div className="space-y-4">
                  <div className="p-3 bg-slate-900/30 border border-slate-900 rounded-sm flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-purple-400" />
                      <span className="text-xs font-sans font-bold text-slate-200">Root Active Spec Target</span>
                    </div>
                    <span className="text-[10px] font-mono text-purple-400">{currentNode.objectId}</span>
                  </div>

                  {/* Render simulated vertical stack showing lineage cascades */}
                  <div className="pl-6 border-l border-slate-900 space-y-4 relative">
                    {activeTraceResult?.visitedNodes.length === 0 ? (
                      <span className="text-slate-500 font-mono text-xs italic">No adjacent hierarchical children mapped inside registry.</span>
                    ) : (
                      activeTraceResult?.visitedNodes.map((node, i) => {
                        return (
                          <div key={node.objectId} className="relative flex items-center gap-4 group">
                            {/* Horizontal connector line */}
                            <span className="w-4 h-px bg-slate-900 absolute -left-6 top-1/2" />
                            
                            <div className="bg-slate-900/40 border border-slate-900 group-hover:border-purple-500/40 p-3 rounded-sm flex items-center justify-between w-full transition-all">
                              <div className="flex items-center gap-2.5">
                                <span className="text-[10px] font-mono text-slate-500">0{i + 1}.</span>
                                <div className="space-y-0.5">
                                  <span className="text-xs font-sans font-semibold text-slate-200">{node.objectName}</span>
                                  <span className="text-[9px] font-mono text-slate-500 block">Assigned Owner: {node.owner}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {renderObjectTypeBadge(node.objectType)}
                                <button
                                  onClick={() => setSelectedNodeId(node.objectId)}
                                  className="p-1 text-slate-500 hover:text-white"
                                  title="Reposition Core View Node"
                                >
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 3: TIMELINE VIEW */}
            {activeTab === 'timeline' && (
              <motion.div
                key="timeline"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="bg-slate-950 border border-slate-900 p-5 rounded-sm space-y-6"
              >
                <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                  <h3 className="text-xs font-mono font-bold uppercase text-slate-200 tracking-wider">
                    Digital Thread Timeline Lineage Ledger
                  </h3>
                  <span className="text-[9px] font-mono text-slate-500">Chronological object setup timeline</span>
                </div>

                {/* Vertical timeline timeline component */}
                <div className="space-y-6 pl-4 border-l border-slate-900 relative">
                  {nodes
                    .sort((a, b) => new Date(a.createdDate || '').getTime() - new Date(b.createdDate || '').getTime())
                    .map((node, idx) => {
                      return (
                        <div key={node.objectId} className="relative flex items-start gap-4">
                          {/* Dot indicator */}
                          <span className={`w-3.5 h-3.5 rounded-full border border-slate-950 absolute -left-[23px] top-0.5 ${
                            node.objectId === selectedNodeId ? 'bg-purple-500 animate-pulse' : 'bg-slate-800'
                          }`} />

                          <div className="space-y-1 w-full">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                              <span className="text-xs font-sans font-semibold text-slate-200">{node.objectName}</span>
                              <span className="text-[10px] font-mono text-slate-500">
                                {node.createdDate ? new Date(node.createdDate).toLocaleDateString() : 'Unspecified Date'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {renderObjectTypeBadge(node.objectType)}
                              <span className="text-[10px] font-mono text-slate-500">Owner: {node.owner}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </motion.div>
            )}

            {/* TAB 4: RECURSIVE TRACEABILITY */}
            {activeTab === 'trace' && (
              <motion.div
                key="trace"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="bg-slate-950 border border-slate-900 p-5 rounded-sm space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-4">
                  <div>
                    <h3 className="text-xs font-mono font-bold uppercase text-slate-200 tracking-wider">
                      Recursive Lineage Traversal Engine
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">Determine upstream/downstream impact paths for strategic JNAS objects.</p>
                  </div>

                  {/* Traversal Direction Toggle */}
                  <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded">
                    <button
                      onClick={() => setTraceDirection('forward')}
                      className={`px-3 py-1 text-[10px] font-mono rounded-sm transition-all cursor-pointer ${
                        traceDirection === 'forward' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Forward Trace
                    </button>
                    <button
                      onClick={() => setTraceDirection('backward')}
                      className={`px-3 py-1 text-[10px] font-mono rounded-sm transition-all cursor-pointer ${
                        traceDirection === 'backward' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Backward Trace
                    </button>
                    <button
                      onClick={() => setTraceDirection('impact')}
                      className={`px-3 py-1 text-[10px] font-mono rounded-sm transition-all cursor-pointer ${
                        traceDirection === 'impact' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Both (Impact)
                    </button>
                  </div>
                </div>

                {/* Show trace solver metadata report */}
                {activeTraceResult ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-slate-900/40 p-3 border border-slate-900 rounded-sm">
                        <span className="text-[9px] font-mono text-slate-500 uppercase">Start Traversal Node</span>
                        <div className="text-xs font-sans font-bold text-slate-200 mt-0.5">{activeTraceResult.startNode.objectName}</div>
                      </div>

                      <div className="bg-slate-900/40 p-3 border border-slate-900 rounded-sm">
                        <span className="text-[9px] font-mono text-slate-500 uppercase">Depth Achieved</span>
                        <div className="text-xs font-sans font-bold text-slate-200 mt-0.5">{activeTraceResult.maxDepthReached} Mapped Levels</div>
                      </div>

                      <div className="bg-slate-900/40 p-3 border border-slate-900 rounded-sm">
                        <span className="text-[9px] font-mono text-slate-500 uppercase">Impact Boundary Node Sum</span>
                        <div className="text-xs font-sans font-bold text-slate-200 mt-0.5">{activeTraceResult.visitedNodes.length} Linked Records</div>
                      </div>
                    </div>

                    {/* Path Ledger */}
                    <div className="space-y-3">
                      <span className="text-[10px] font-mono font-bold uppercase text-purple-400 block">Path Traversal Records:</span>
                      
                      {activeTraceResult.visitedNodes.length === 0 ? (
                        <div className="py-4 text-center bg-slate-900/20 border border-slate-900 rounded border-dashed">
                          <span className="text-slate-500 font-mono text-xs italic">No matching downstream dependencies detected in this direction.</span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {activeTraceResult.visitedNodes.map((v, i) => {
                            // Calculate simple risk index based on strength and centrality scores
                            const riskFactor = activeTraceResult.dependencyScores[v.objectId] || 5;
                            const isHighRisk = riskFactor > 7;

                            return (
                              <div key={v.objectId} className="bg-slate-900/20 border border-slate-900 p-3 rounded-sm flex items-center justify-between text-xs">
                                <div className="flex items-center gap-3">
                                  <span className="font-mono text-slate-500">#{i + 1}</span>
                                  <div className="space-y-0.5">
                                    <span className="font-sans font-bold text-slate-200">{v.objectName}</span>
                                    <span className="text-[9px] font-mono text-slate-500 block">Object ID: {v.objectId} • Assigned: {v.owner}</span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-4">
                                  {renderObjectTypeBadge(v.objectType)}
                                  
                                  <div className="text-right shrink-0">
                                    <span className="text-[9px] font-mono text-slate-500 block">Dependency Rating</span>
                                    <span className={`text-[10px] font-mono uppercase font-bold ${isHighRisk ? 'text-rose-400' : 'text-emerald-400'}`}>
                                      {isHighRisk ? 'Critical' : 'Moderate'} ({riskFactor})
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <span className="text-slate-500 font-mono text-xs italic">Select a node from the left index directory to initialize traversal.</span>
                )}
              </motion.div>
            )}

            {/* TAB 5: AUDIT TRAIL */}
            {activeTab === 'audit' && (
              <motion.div
                key="audit"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="bg-slate-950 border border-slate-900 p-5 rounded-sm space-y-6"
              >
                <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                  <h3 className="text-xs font-mono font-bold uppercase text-slate-200 tracking-wider">
                    Traceability & System Configuration Audit Ledger
                  </h3>
                  <span className="text-[9px] font-mono text-slate-500">Log of configuration alterations</span>
                </div>

                <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                  {auditLogs.map(log => {
                    return (
                      <div key={log.logId} className="bg-slate-900/30 border border-slate-900/60 p-3 rounded-sm text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className={`text-[9px] font-mono uppercase font-bold px-1.5 rounded-sm ${
                            log.action === 'Relationship Created' 
                              ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/10'
                              : log.action === 'Relationship Removed'
                              ? 'bg-rose-950/40 text-rose-400 border border-rose-500/10'
                              : 'bg-indigo-950/40 text-indigo-400 border border-indigo-500/10'
                          }`}>
                            {log.action}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        </div>

                        <p className="text-slate-300 font-sans leading-relaxed">{log.details}</p>

                        <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 border-t border-slate-900/80 pt-1.5">
                          <span>Operator: {log.operator} ({log.role})</span>
                          <span>Verified IP: {log.ipAddress}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 5. RELATIONSHIPS LEDGER GRID (The RelationshipCard Render) */}
      <div className="bg-slate-950 border border-slate-900 p-5 rounded-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-4">
          <div>
            <h3 className="text-xs font-mono font-bold uppercase text-slate-200 tracking-wider">
              Thread Registry Database Connections
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">CRUD, configure, and inspect individual physical-to-digital edge weights in the database.</p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={strengthFilter}
              onChange={(e) => setStrengthFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-xs font-sans px-3 py-1.5 rounded focus:outline-none text-slate-300"
            >
              <option value="All">All Strengths</option>
              <option value="Strong">Strong Weight</option>
              <option value="Medium">Medium Weight</option>
              <option value="Weak">Weak Weight</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRelationships.length === 0 ? (
            <div className="col-span-full py-8 text-center bg-slate-900/20 border border-slate-900 rounded border-dashed">
              <span className="text-slate-500 font-mono text-xs italic">No matching threads detected inside active registry search bounds.</span>
            </div>
          ) : (
            filteredRelationships.map((rel) => {
              const src = nodes.find(n => n.objectId === rel.sourceId);
              const tgt = nodes.find(n => n.objectId === rel.targetId);

              return (
                <div
                  key={rel.relationshipId}
                  className="bg-slate-900/20 hover:bg-slate-900/40 border border-slate-900 p-4 rounded-sm flex flex-col justify-between space-y-4 transition-all"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[9px] font-mono text-slate-500">
                      <span>{rel.relationshipId}</span>
                      <span className={`uppercase font-bold ${rel.strength === 'Strong' ? 'text-purple-400' : 'text-cyan-400'}`}>
                        {rel.strength} Connection
                      </span>
                    </div>

                    <h4 className="text-xs font-sans font-bold text-slate-200">{rel.relationshipType}</h4>
                    
                    {/* Visual connected cards */}
                    <div className="flex items-center justify-between gap-1.5 bg-slate-950 p-2.5 rounded border border-slate-900">
                      <div className="text-left max-w-[45%]">
                        <span className="text-[8px] font-mono text-slate-500 uppercase block">Source</span>
                        <span className="text-[10px] font-sans font-semibold text-slate-300 line-clamp-1">{src?.objectName}</span>
                        <span className="text-[8px] font-mono text-slate-500 block truncate">{rel.sourceId}</span>
                      </div>

                      <ArrowRight className="w-3.5 h-3.5 text-purple-400 shrink-0" />

                      <div className="text-right max-w-[45%]">
                        <span className="text-[8px] font-mono text-slate-500 uppercase block">Target</span>
                        <span className="text-[10px] font-sans font-semibold text-slate-300 line-clamp-1">{tgt?.objectName}</span>
                        <span className="text-[8px] font-mono text-slate-500 block truncate">{rel.targetId}</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed italic mt-1">
                      "{rel.metadata.rationale || 'No rationale logged.'}"
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-900/60">
                    <span>Owner: {rel.owner.split(' ')[0]}</span>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedRelationshipToUpdate(rel);
                          setIsUpdateOpen(true);
                        }}
                        className="text-purple-400 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteRelationship(rel.relationshipId)}
                        className="text-rose-400 hover:text-rose-500"
                        title="Decouple link"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 6. CREATE RELATIONSHIP SLIDE-OVER MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-950 border border-slate-800 p-6 rounded-sm w-full max-w-md space-y-4">
            <h3 className="text-sm font-sans font-bold text-slate-100 flex items-center gap-2">
              <Plus className="w-4 h-4 text-purple-400" />
              <span>Register New Thread Relationship</span>
            </h3>

            <form onSubmit={handleCreateRelationship} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Source JNAS Object ID</label>
                <select
                  value={newSourceId}
                  onChange={(e) => setNewSourceId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-xs font-sans text-slate-200 focus:outline-none"
                  required
                >
                  <option value="">Select Source Object...</option>
                  {nodes.map(n => (
                    <option key={n.objectId} value={n.objectId}>{n.objectName} [{n.objectType}]</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Target JNAS Object ID</label>
                <select
                  value={newTargetId}
                  onChange={(e) => setNewTargetId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-xs font-sans text-slate-200 focus:outline-none"
                  required
                >
                  <option value="">Select Target Object...</option>
                  {nodes.map(n => (
                    <option key={n.objectId} value={n.objectId}>{n.objectName} [{n.objectType}]</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Strength Weight</label>
                  <select
                    value={newStrength}
                    onChange={(e) => setNewStrength(e.target.value as ThreadRelationship['strength'])}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-xs font-sans text-slate-200 focus:outline-none"
                  >
                    <option value="Strong">Strong Weight</option>
                    <option value="Medium">Medium Weight</option>
                    <option value="Weak">Weak Weight</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Traversal Direction</label>
                  <select
                    value={newDirection}
                    onChange={(e) => setNewDirection(e.target.value as ThreadRelationship['direction'])}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-xs font-sans text-slate-200 focus:outline-none"
                  >
                    <option value="bidirectional">Bidirectional</option>
                    <option value="source_to_target">{"Source ──> Target"}</option>
                    <option value="target_to_source">{"Target ──> Source"}</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Relationship Rationale</label>
                <textarea
                  value={newRationale}
                  onChange={(e) => setNewRationale(e.target.value)}
                  placeholder="E.g., Engineering specification CD-09 dictates material allocations for drop testing verification"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-purple-500 rounded p-2 text-xs font-sans text-slate-200 focus:outline-none h-20 resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-900">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white rounded px-4 py-2 text-xs font-mono font-bold cursor-pointer transition-colors"
                >
                  Confirm Thread
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. EDIT RELATIONSHIP MODAL */}
      {isUpdateOpen && selectedRelationshipToUpdate && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-950 border border-slate-800 p-6 rounded-sm w-full max-w-md space-y-4">
            <h3 className="text-sm font-sans font-bold text-slate-100">
              Modify Thread Connection [{selectedRelationshipToUpdate.relationshipId}]
            </h3>

            <form onSubmit={handleUpdateRelationship} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Status Link State</label>
                <select
                  value={selectedRelationshipToUpdate.status}
                  onChange={(e) => setSelectedRelationshipToUpdate({
                    ...selectedRelationshipToUpdate,
                    status: e.target.value as ThreadRelationship['status']
                  })}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-xs font-sans text-slate-200 focus:outline-none"
                >
                  <option value="Active">Active</option>
                  <option value="Draft">Draft</option>
                  <option value="Deprecated">Deprecated</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Strength Weight</label>
                <select
                  value={selectedRelationshipToUpdate.strength}
                  onChange={(e) => setSelectedRelationshipToUpdate({
                    ...selectedRelationshipToUpdate,
                    strength: e.target.value as ThreadRelationship['strength']
                  })}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-xs font-sans text-slate-200 focus:outline-none"
                >
                  <option value="Strong">Strong Weight</option>
                  <option value="Medium">Medium Weight</option>
                  <option value="Weak">Weak Weight</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-900">
                <button
                  type="button"
                  onClick={() => {
                    setIsUpdateOpen(false);
                    setSelectedRelationshipToUpdate(null);
                  }}
                  className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white rounded px-4 py-2 text-xs font-mono font-bold cursor-pointer transition-colors"
                >
                  Save Modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Shield,
  FileCode,
  Layers,
  FileText,
  Clock,
  ShieldCheck,
  Settings,
  Database,
  ArrowRight,
  Download,
  AlertTriangle,
  Flame,
  CheckCircle2,
  RefreshCw,
  Search,
  Filter,
  Layers3
} from 'lucide-react';
import { eventBus } from '../core';
import { DSBadge } from '../components/design-system/DSStatus';
import { DSCard, DSCardHeader, DSCardContent, DSCardTitle } from '../components/design-system/DSCard';

// Component imports
import { EngineeringHeader } from '../components/engineering/EngineeringHeader';
import { EngineeringSidebar, SidebarTab } from '../components/engineering/EngineeringSidebar';
import { EngineeringDashboard } from '../components/engineering/EngineeringDashboard';
import { DrawingList } from '../components/engineering/DrawingList';
import { ProjectExplorer } from '../components/engineering/ProjectExplorer';
import { EngineeringTimeline } from '../components/engineering/EngineeringTimeline';

// Services
import { EngineeringRegistry } from '../backend/engineering/registry';
import { Drawing } from '../backend/engineering/types';

export const EngineeringPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SidebarTab>('dashboard');
  const [updateNonce, setUpdateNonce] = useState(0);

  // Search & Filter parameters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedApproval, setSelectedApproval] = useState('All');

  // Multi-profile isolation states
  const [activeRole, setActiveRole] = useState('Lead Engineer');
  const [activeDept, setActiveDept] = useState('R&D Propulsion');

  const registry = EngineeringRegistry.getInstance();

  // Sync role configuration changes with registry permissions
  useEffect(() => {
    registry.setCurrentRole(activeRole);
    registry.setCurrentDepartment(activeDept);
    registry.addAuditLog(
      'Security Role Swapped',
      'IAM-MAPPED-UID',
      'Security',
      `Swapped operational profile permissions matrix to: ${activeRole} inside department: ${activeDept}`
    );
    setUpdateNonce((prev) => prev + 1);
  }, [activeRole, activeDept]);

  // Command Center dispatch listener for real-time remote commands
  useEffect(() => {
    const sub = eventBus.subscribe('CMD_ENGINEERING', (data: any) => {
      const cmd = data?.command;
      if (!cmd) return;

      registry.addAuditLog(
        'Command Center Dispatch',
        cmd,
        'Security',
        `Remote command received from physical shell: /${cmd}`
      );

      if (cmd === 'open-engineering-workspace') {
        setActiveTab('dashboard');
      } else if (cmd === 'open-drawing') {
        setActiveTab('drawings');
      } else if (cmd === 'open-engineering-project') {
        setActiveTab('projects');
      } else if (cmd === 'search-drawings') {
        setActiveTab('drawings');
        setSearchQuery('');
        setSelectedCategory('All');
        setSelectedStatus('All');
        setSelectedApproval('All');
      } else if (cmd === 'search-standards') {
        setActiveTab('documents');
      } else if (cmd === 'recent-drawings') {
        setActiveTab('dashboard');
      } else if (cmd === 'engineering-dashboard') {
        setActiveTab('dashboard');
      }
      setUpdateNonce((prev) => prev + 1);
    });

    return () => sub.unsubscribe();
  }, []);

  const handleUpdate = () => {
    setUpdateNonce((prev) => prev + 1);
  };

  const handleClearTimeline = () => {
    registry.clearAuditLogs();
    handleUpdate();
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedStatus('All');
    setSelectedApproval('All');
  };

  // Filter Drawings list dynamically
  const rawDrawings = registry.getDrawings();
  const filteredDrawings = rawDrawings.filter((d) => {
    // 1. Faceted query lookup (Title, Drawing number, or Standard reference)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const matchesTitle = d.title.toLowerCase().includes(query);
      const matchesNumber = d.drawingNumber.toLowerCase().includes(query);
      const matchesSpecs = d.relatedStandards.some((s) => s.toLowerCase().includes(query));
      const matchesCategory = d.category.toLowerCase().includes(query);
      if (!matchesTitle && !matchesNumber && !matchesSpecs && !matchesCategory) {
        return false;
      }
    }

    // 2. Category Filter
    if (selectedCategory !== 'All' && d.category !== selectedCategory) {
      return false;
    }

    // 3. Status Filter
    if (selectedStatus !== 'All' && d.status !== selectedStatus) {
      return false;
    }

    // 4. Approval status Filter
    if (selectedApproval !== 'All' && d.approvalStatus !== selectedApproval) {
      return false;
    }

    return true;
  });

  // Calculate live injection token approximations
  const totalInjectedCount = 
    (localStorage.getItem('jnas-active-drawing-id') ? 1 : 0) + 
    (localStorage.getItem('jnas-active-project-id') ? 1 : 0) + 
    (selectedCategory !== 'All' ? 1 : 0) + 
    (selectedStatus !== 'All' ? 1 : 0);

  return (
    <div className="space-y-6">
      
      {/* Dynamic Top Bar with System State and AI-Context Token counter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#141F33] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-slate-100 font-sans">
              Engineering Workspace
            </h1>
            <DSBadge variant="solid" color="cyan">
              v1.2.0-Production
            </DSBadge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Master engineering ledger, technical CAD blueprint control, team sub-projects, and secure revision audits.
          </p>
        </div>

        {/* Real-time AI Context Status */}
        <div className="flex items-center gap-2.5 bg-[#0C1222] border border-cyan-900/40 p-2.5 rounded-lg shadow-inner">
          <div className="p-1 bg-cyan-950/50 rounded text-cyan-400 shrink-0">
            <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
          </div>
          <div className="text-left font-mono">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wide flex items-center gap-1.5">
              <span>AI CONTEXT ACTIVE</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
            </div>
            <div className="text-[9px] text-slate-500 mt-0.5">
              Injected Parameters: <span className="text-cyan-400 font-bold">{totalInjectedCount} Dimensions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Workspace Layout (Sidebar Navigation + Dynamic Worksheets) */}
      <div className="flex flex-col lg:flex-row items-start gap-6">
        
        {/* Left Hand: Operations Switch Board */}
        <div className="w-full lg:w-64 shrink-0">
          <EngineeringSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        {/* Right Hand: Workspace Interactive Content Panels */}
        <div className="flex-1 w-full space-y-4 min-w-0">
          
          {/* Universal Header (Search, Security Gating and Isolation profiles) */}
          <EngineeringHeader
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            selectedApproval={selectedApproval}
            setSelectedApproval={setSelectedApproval}
            activeRole={activeRole}
            setActiveRole={setActiveRole}
            activeDept={activeDept}
            setActiveDept={setActiveDept}
            onClearFilters={handleClearFilters}
          />

          {/* Worksheet Switchboard */}
          <div className="transition-all duration-300">
            {activeTab === 'dashboard' && (
              <EngineeringDashboard
                drawings={filteredDrawings}
                onUpdate={handleUpdate}
                activeRole={activeRole}
                activeDept={activeDept}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === 'drawings' && (
              <DrawingList
                drawings={filteredDrawings}
                onUpdate={handleUpdate}
                activeRole={activeRole}
              />
            )}

            {activeTab === 'projects' && (
              <ProjectExplorer onUpdate={handleUpdate} />
            )}

            {/* Custom Tab: Documents & Technical Specifications Explorer */}
            {activeTab === 'documents' && (
              <div className="bg-[#0C111E] border border-[#152033] rounded-lg p-5 space-y-4 shadow-xl">
                <div className="border-b border-[#141F33] pb-2 flex items-center justify-between">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-cyan-400" />
                    <span>Technical Documents & Specification Rules</span>
                  </h3>
                  <DSBadge variant="outline" color="cyan">
                    ASTM / Aviation Standards
                  </DSBadge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Item 1 */}
                  <div className="p-4 bg-[#080B13] border border-[#142036] rounded-md space-y-2.5 hover:border-[#1F304E] transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-cyan-400 font-bold bg-[#131D2F] px-2 py-0.5 rounded border border-cyan-800/30">
                        ASTM-B348-TI
                      </span>
                      <span className="text-[9px] font-mono text-slate-500">Released</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-100 font-sans">
                      Standard Specification for Titanium and Titanium Alloy Bars and Billets
                    </h4>
                    <p className="text-[11px] text-slate-400 font-light leading-normal">
                      Specifies chemical composite vectors, tensile yield constraints, and physical stress tolerances for aerospace Grade 5 titanium alloys.
                    </p>
                    <div className="pt-2 border-t border-[#131D2E] flex justify-between items-center text-[10px] font-mono">
                      <span className="text-slate-500">Weight: 4.8MB</span>
                      <button
                        onClick={() => alert('Simulating high precision technical standard download.')}
                        className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                      >
                        <span>Download PDF</span>
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div className="p-4 bg-[#080B13] border border-[#142036] rounded-md space-y-2.5 hover:border-[#1F304E] transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-cyan-400 font-bold bg-[#131D2F] px-2 py-0.5 rounded border border-cyan-800/30">
                        JNAS-MECH-ST-02
                      </span>
                      <span className="text-[9px] font-mono text-slate-500">Approved</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-100 font-sans">
                      Pressure Vessel Nozzle Interface Geometric Tolerance Standards
                    </h4>
                    <p className="text-[11px] text-slate-400 font-light leading-normal">
                      Geometric dimensioning & tolerancing rules mapped against jet propulsion exhaust interfaces for liquid/solid propellants.
                    </p>
                    <div className="pt-2 border-t border-[#131D2E] flex justify-between items-center text-[10px] font-mono">
                      <span className="text-slate-500">Weight: 2.1MB</span>
                      <button
                        onClick={() => alert('Simulating CAD specification schema verification.')}
                        className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                      >
                        <span>Inspect CAD</span>
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* Custom Tab: Compliance Auditing Trail */}
            {activeTab === 'timeline' && (
              <EngineeringTimeline onClear={handleClearTimeline} />
            )}

            {/* Custom Tab: Security and Gating policies */}
            {activeTab === 'security' && (
              <div className="bg-[#0C111E] border border-[#152033] rounded-lg p-5 space-y-4 shadow-xl">
                <div className="border-b border-[#141F33] pb-2">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    <span>Compliance IAM Security & Isolation Profile Policy</span>
                  </h3>
                </div>

                <div className="space-y-3.5">
                  <DSCard variant="bordered" className="bg-[#080B13]/60">
                    <DSCardHeader>
                      <DSCardTitle className="text-xs font-mono font-bold text-slate-300">
                        Ecosystem Department Isolation Model (Multi-Tenancy)
                      </DSCardTitle>
                    </DSCardHeader>
                    <DSCardContent className="text-xs text-slate-400 leading-relaxed space-y-2.5">
                      <p>
                        Drawings and technical blueprint data structures are isolated into specific department tenants. Selected tenant: <span className="text-cyan-400 font-bold uppercase">{activeDept}</span>.
                      </p>
                      <p>
                        Your active role, <span className="text-cyan-400 font-bold uppercase">{activeRole}</span>, determines the operations available on drawing blueprints within the selected tenant:
                      </p>
                      <ul className="list-disc list-inside space-y-1.5 text-slate-400 font-mono text-[10px]">
                        <li><span className="text-cyan-400">Lead Engineer:</span> Full permissions (CreateDraft, UpdateRevision, ApproveDrawing, DeleteDraft).</li>
                        <li><span className="text-cyan-400">CAD Designer:</span> Read/Write Draft permissions (CreateDraft, UpdateRevision). Can not delete or approve.</li>
                        <li><span className="text-cyan-400">QA Inspector:</span> Approval and Compliance checks only (ApproveDrawing). Can not modify draft vectors.</li>
                      </ul>
                    </DSCardContent>
                  </DSCard>

                  <div className="p-3 bg-cyan-950/20 border border-cyan-800/40 rounded flex items-start gap-2.5">
                    <Shield className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-slate-400 leading-normal font-sans">
                      All role mutations trigger real-time, tamper-proof logs into the compliance blockchain audit trail. Unapproved access dispatches are automatically reported back to the security platform.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Custom Tab: Local Workspace Settings */}
            {activeTab === 'settings' && (
              <div className="bg-[#0C111E] border border-[#152033] rounded-lg p-5 space-y-4 shadow-xl">
                <div className="border-b border-[#141F33] pb-2">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                    <Settings className="w-4 h-4 text-cyan-400" />
                    <span>Workspace Settings & Parameters Calibration</span>
                  </h3>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="p-4 bg-[#080B13] border border-[#142036] rounded-md space-y-3">
                    <h4 className="text-xs font-bold text-slate-200 font-mono">Dynamic AI State Mapping</h4>
                    <p className="text-slate-400 font-light leading-normal">
                      Calibration options for the active environment state vectors mapped into the Master context builder tool.
                    </p>

                    <div className="space-y-2 pt-2 border-t border-[#131D2F] font-mono text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Active Blueprint Mapping ID:</span>
                        <span className="text-cyan-400 font-bold">{localStorage.getItem('jnas-active-drawing-id') || 'None Selected'}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Active Project Mapping ID:</span>
                        <span className="text-cyan-400 font-bold">{localStorage.getItem('jnas-active-project-id') || 'None Selected'}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Active Tenant Scope:</span>
                        <span className="text-cyan-400 font-bold">{activeDept} / {activeRole}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2.5">
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to restore default initial CAD/BOM seed datasets? Custom updates will be reset.')) {
                          registry.resetToDefaults();
                          handleUpdate();
                        }
                      }}
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-slate-300 font-mono text-[11px]"
                    >
                      Restore Seed Datasets
                    </button>
                    <button
                      onClick={() => {
                        localStorage.removeItem('jnas-active-drawing-id');
                        localStorage.removeItem('jnas-active-project-id');
                        alert('Active context targets successfully detached.');
                        handleUpdate();
                      }}
                      className="px-3.5 py-1.5 bg-rose-950/20 hover:bg-rose-900/30 border border-rose-900/40 text-rose-400 rounded font-mono text-[11px]"
                    >
                      Detach Context Targets
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

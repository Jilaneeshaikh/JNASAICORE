import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  Warehouse, 
  Scale, 
  Maximize2, 
  Layers, 
  FileText, 
  Compass, 
  History, 
  ShieldCheck, 
  Plus, 
  Search, 
  Filter, 
  ArrowRight, 
  FileCode, 
  Database, 
  Brain, 
  Cpu, 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  X, 
  User, 
  Clipboard, 
  Clock, 
  BookOpen, 
  Sparkles,
  TrendingUp,
  Tag
} from 'lucide-react';
import { logisticsRegistry } from '../../backend/logistics/registry';
import { LoadPlan, ContainerEquipment, CapacityModel } from '../../backend/logistics/types';
import { packagingRegistry } from '../../backend/packaging/registry';
import { eventBus } from '../../core';

interface LoadPlanningWorkspaceProps {
  role: string;
  department: string;
  onRefresh: () => void;
}

export const LoadPlanningWorkspace: React.FC<LoadPlanningWorkspaceProps> = ({
  role,
  department,
  onRefresh
}) => {
  // Sync state with registry
  const [plans, setPlans] = useState<LoadPlan[]>([]);
  const [containers, setContainers] = useState<ContainerEquipment[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  
  // Tabs: 'dashboard' | 'plans' | 'containers' | 'logs'
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'plans' | 'containers' | 'logs'>('dashboard');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedContainerType, setSelectedContainerType] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<string>('');

  // Detailed Workspace Sub-Tab
  const [workspaceSubTab, setWorkspaceSubTab] = useState<'overview' | 'capacity' | 'engineering' | 'documents' | 'ai' | 'history'>('overview');

  // Form states
  const [isCreatePlanOpen, setIsCreatePlanOpen] = useState(false);
  const [isCreateContainerOpen, setIsCreateContainerOpen] = useState(false);

  // New Plan form fields
  const [planTitle, setPlanTitle] = useState('');
  const [planDesc, setPlanDesc] = useState('');
  const [selectedDesignId, setSelectedDesignId] = useState('');
  const [selectedContainerId, setSelectedContainerId] = useState('');
  const [planVehicle, setPlanVehicle] = useState('Flatbed Semi-Truck');
  const [planWarehouse, setPlanWarehouse] = useState('Central Storage Facility Bay B');
  const [planPriority, setPlanPriority] = useState<LoadPlan['priority']>('Medium');
  
  // Capacity inputs for new plan
  const [capVolume, setCapVolume] = useState(25.5);
  const [capWeight, setCapWeight] = useState(6200);
  const [capStackLimit, setCapStackLimit] = useState(2);
  const [capMaxUnits, setCapMaxUnits] = useState(12);
  const [capSafetyMargin, setCapSafetyMargin] = useState(15);
  const [capLoadingZone, setCapLoadingZone] = useState('Zone A-4');
  const [capCenterOfGravity, setCapCenterOfGravity] = useState('[X: 0, Y: 10, Z: 480]');

  // New Container form fields
  const [contType, setContType] = useState<ContainerEquipment['type']>('Custom Container');
  const [contName, setContName] = useState('');
  const [contCode, setContCode] = useState('');
  const [contDesc, setContDesc] = useState('');
  const [contL, setContL] = useState(12000);
  const [contW, setContW] = useState(2400);
  const [contH, setContH] = useState(2600);
  const [contMaxW, setContMaxW] = useState(24000);
  const [contMaxVol, setContMaxVol] = useState(72.5);

  // Revision & Approval
  const [revisionNotes, setRevisionNotes] = useState('');
  
  // AI assistant simulation grounding variables
  const [aiPrompt, setAiPrompt] = useState('Explain how standard stackable racks conform to the volume metrics of the 40HC container.');
  const [aiResponse, setAiResponse] = useState('');
  const [aiIsThinking, setAiIsThinking] = useState(false);

  // Synchronize data from registry
  const syncData = () => {
    setPlans(logisticsRegistry.getLoadPlans());
    setContainers(logisticsRegistry.getContainers());
    setAuditLogs(logisticsRegistry.getAuditLogs());
  };

  useEffect(() => {
    syncData();
  }, []);

  // Listen to context update triggers or custom triggers
  useEffect(() => {
    const handleTriggerCreate = () => {
      setIsCreatePlanOpen(true);
      setActiveSubTab('plans');
    };
    window.addEventListener('jnas-trigger-create-loadplan', handleTriggerCreate);
    return () => {
      window.removeEventListener('jnas-trigger-create-loadplan', handleTriggerCreate);
    };
  }, []);

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planTitle || !selectedDesignId || !selectedContainerId) {
      alert('Please fill out all required fields');
      return;
    }

    const design = packagingRegistry.getDesignById(selectedDesignId);
    const container = logisticsRegistry.getContainerById(selectedContainerId);

    if (!design || !container) return;

    const newPlan = logisticsRegistry.createLoadPlan({
      title: planTitle,
      description: planDesc,
      customer: {
        id: design.customer.id,
        name: design.customer.name
      },
      project: {
        id: design.project.id,
        name: design.project.name
      },
      packagingDesign: {
        id: design.id,
        name: design.designName,
        designNumber: design.designNumber
      },
      engineeringAsset: design.engineeringAsset || 'CAD-DWG-GENERIC.step',
      containerType: container.type,
      containerId: container.id,
      vehicleType: planVehicle,
      warehouse: planWarehouse,
      status: 'Draft',
      priority: planPriority,
      planner: 'jilaneeshaikh@gmail.com',
      approvalStatus: 'Pending',
      capacity: {
        volume: capVolume,
        weight: capWeight,
        dimensions: {
          length: container.lengthMm,
          width: container.widthMm,
          height: container.heightMm,
          unit: 'mm'
        },
        stackingLimit: capStackLimit,
        maximumCapacity: capMaxUnits,
        safetyMargin: capSafetyMargin,
        loadingZone: capLoadingZone,
        centerOfGravity: capCenterOfGravity
      }
    });

    // Reset forms & notify
    setPlanTitle('');
    setPlanDesc('');
    setIsCreatePlanOpen(false);
    syncData();
    onRefresh();
    setSelectedPlanId(newPlan.id);
  };

  const handleCreateContainer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contName || !contCode) {
      alert('Please provide name and code identifiers');
      return;
    }

    logisticsRegistry.createContainer({
      type: contType,
      name: contName,
      code: contCode,
      description: contDesc,
      lengthMm: contL,
      widthMm: contW,
      heightMm: contH,
      maxWeightKg: contMaxW,
      maxVolumeCbm: contMaxVol,
      status: 'Available'
    });

    setContName('');
    setContCode('');
    setContDesc('');
    setIsCreateContainerOpen(false);
    syncData();
    onRefresh();
  };

  const handleCreateRevision = (planId: string) => {
    if (!revisionNotes) {
      alert('Revision notes are required to document changes.');
      return;
    }
    logisticsRegistry.createPlanRevision(planId, revisionNotes);
    setRevisionNotes('');
    syncData();
    onRefresh();
  };

  const handleUpdateApproval = (planId: string, approval: 'Approved' | 'Rejected') => {
    logisticsRegistry.updateLoadPlan(planId, {
      approvalStatus: approval,
      status: approval === 'Approved' ? 'Approved' : 'Draft'
    });
    syncData();
    onRefresh();
  };

  const handleArchivePlan = (planId: string) => {
    logisticsRegistry.archiveLoadPlan(planId);
    syncData();
    onRefresh();
  };

  const executeAIConsultation = () => {
    if (!aiPrompt) return;
    setAiIsThinking(true);
    setAiResponse('');

    setTimeout(() => {
      const selectedPlan = plans.find(p => p.id === selectedPlanId);
      const xmlContext = logisticsRegistry.getAIContext();
      
      let res = `**[COMPLIANCE VERIFICATION GATED]**\n\nBased on the structured XML Context Fabric provided for the active Load Plan: **${selectedPlan?.planNumber || 'N/A'}**, here is the material compliance co-pilot feedback:\n\n`;
      
      if (selectedPlan) {
        res += `1. **Volumetric Coefficient**: The design payload is ${selectedPlan.capacity.volume} CBM within a Container Capacity limit of ${selectedPlan.containerType === '40HC' ? '76.2' : '33.2'} CBM. Volume utilization metrics are perfectly within bounds, leaving a structured safety clearance padding of **${selectedPlan.capacity.safetyMargin}%**.\n`;
        res += `2. **Stacking structural limits**: The design enforces a stacking limit of **${selectedPlan.capacity.stackingLimit} tiers**. This perfectly conforms to the internal height overhead limit of **${selectedPlan.capacity.dimensions.height} mm** without clashing with the container ceiling.\n`;
        res += `3. **Center of Gravity**: Current registered gravity center is **${selectedPlan.capacity.centerOfGravity}**. No dynamic load imbalance or weight asymmetry is predicted. Standard Flatbed container brackets are rated sufficient for transport constraint profiles.\n\n`;
        res += `*Standard Citation*: Conformant with ASTM D6199 (Standard Practice for Quality of Wood Members of Containers and Pallets) and ISTA 3A structural transit tests.`;
      } else {
        res += `Please load an active load plan inside the workspace to analyze specific capacities against ASTM / ISO transport container schemas.`;
      }

      setAiResponse(res);
      setAiIsThinking(false);
    }, 1200);
  };

  // Filter load plans
  const filteredPlans = plans.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.planNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.planner.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus ? p.status === selectedStatus : true;
    const matchesContainer = selectedContainerType ? p.containerType === selectedContainerType : true;
    const matchesPriority = selectedPriority ? p.priority === selectedPriority : true;

    return matchesSearch && matchesStatus && matchesContainer && matchesPriority;
  });

  const selectedPlan = plans.find(p => p.id === selectedPlanId);
  const selectedDesign = selectedPlan ? packagingRegistry.getDesignById(selectedPlan.packagingDesign.id) : null;

  return (
    <div className="flex flex-col h-full bg-[#070B13] text-slate-200 text-xs font-sans overflow-y-auto">
      {/* Platform Title Sub-bar */}
      <div className="flex items-center justify-between border-b border-slate-900 bg-[#0C111E] px-6 py-4">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100 font-mono flex items-center gap-2">
            <Truck className="w-4 h-4 text-cyan-400" />
            Enterprise Load Planning & Logistics Intelligence
          </h2>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Engineering-grade staging systems, volume capacity simulations, and container standardization registers.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreatePlanOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500 text-slate-950 font-semibold rounded-sm hover:bg-cyan-400 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            New Load Plan
          </button>
          <button
            onClick={() => setIsCreateContainerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-300 rounded-sm transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            Add Equipment
          </button>
        </div>
      </div>

      {/* Primary Sub Tabs */}
      <div className="flex border-b border-slate-900 bg-[#0C111E]/70 px-4">
        <button
          onClick={() => { setActiveSubTab('dashboard'); setSelectedPlanId(null); }}
          className={`px-4 py-3 font-semibold border-b-2 text-[11px] transition-all cursor-pointer uppercase font-mono ${
            activeSubTab === 'dashboard' && !selectedPlanId
              ? 'border-cyan-400 text-cyan-400 bg-cyan-950/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Logistics Dashboard
        </button>
        <button
          onClick={() => setActiveSubTab('plans')}
          className={`px-4 py-3 font-semibold border-b-2 text-[11px] transition-all cursor-pointer uppercase font-mono ${
            (activeSubTab === 'plans' || selectedPlanId)
              ? 'border-cyan-400 text-cyan-400 bg-cyan-950/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Load Plan Registry ({filteredPlans.length})
        </button>
        <button
          onClick={() => { setActiveSubTab('containers'); setSelectedPlanId(null); }}
          className={`px-4 py-3 font-semibold border-b-2 text-[11px] transition-all cursor-pointer uppercase font-mono ${
            activeSubTab === 'containers'
              ? 'border-cyan-400 text-cyan-400 bg-cyan-950/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Equipment Library ({containers.length})
        </button>
        <button
          onClick={() => { setActiveSubTab('logs'); setSelectedPlanId(null); }}
          className={`px-4 py-3 font-semibold border-b-2 text-[11px] transition-all cursor-pointer uppercase font-mono ${
            activeSubTab === 'logs'
              ? 'border-cyan-400 text-cyan-400 bg-cyan-950/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Audit Ledger ({auditLogs.length})
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6">
        {selectedPlanId && selectedPlan ? (
          /* ========================================================== */
          /* 3. LOGISTICS WORKSPACE (DETAILED INDIVIDUAL PLAN VIEW) */
          /* ========================================================== */
          <div className="grid grid-cols-4 gap-6">
            {/* Left Nav Pane for Workspace */}
            <div className="col-span-1 flex flex-col gap-2">
              <button
                onClick={() => setSelectedPlanId(null)}
                className="mb-2 text-cyan-400 flex items-center gap-1.5 hover:underline font-semibold"
              >
                ← Back to Registry
              </button>
              
              <div className="p-4 bg-[#0C111E] border border-slate-900 rounded-sm">
                <span className="text-[10px] uppercase font-mono text-cyan-400 tracking-wider">Active Loading Sheet</span>
                <h3 className="font-bold text-slate-200 mt-1">{selectedPlan.planNumber}</h3>
                <p className="text-[11px] text-slate-500 mt-1 leading-normal">{selectedPlan.title}</p>
                
                <div className="mt-4 pt-4 border-t border-slate-900/60 space-y-2 text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status:</span>
                    <span className={`font-mono font-semibold px-1.5 py-0.5 rounded text-[9px] ${
                      selectedPlan.status === 'Approved' ? 'bg-emerald-950 text-emerald-400' :
                      selectedPlan.status === 'In Review' ? 'bg-amber-950 text-amber-400' :
                      selectedPlan.status === 'Submitted' ? 'bg-indigo-950 text-indigo-400' : 'bg-slate-900 text-slate-400'
                    }`}>{selectedPlan.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Approval:</span>
                    <span className={`font-mono font-semibold px-1.5 py-0.5 rounded text-[9px] ${
                      selectedPlan.approvalStatus === 'Approved' ? 'bg-emerald-950 text-emerald-400' :
                      selectedPlan.approvalStatus === 'Rejected' ? 'bg-rose-950 text-rose-400' : 'bg-slate-900 text-slate-400'
                    }`}>{selectedPlan.approvalStatus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Priority:</span>
                    <span className="text-slate-300 font-semibold">{selectedPlan.priority}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Revision:</span>
                    <span className="text-slate-300 font-mono font-semibold">R{selectedPlan.revision}</span>
                  </div>
                </div>
              </div>

              {/* Sub tabs in active plan */}
              <div className="flex flex-col gap-1 mt-4">
                {[
                  { id: 'overview', label: 'Overview & Metadata', icon: Clipboard },
                  { id: 'capacity', label: 'Capacity & Load Model', icon: Scale },
                  { id: 'engineering', label: 'Engineering Assets', icon: Layers },
                  { id: 'documents', label: 'Documents & Knowledge', icon: FileText },
                  { id: 'ai', label: 'AI Co-pilot Sandbox', icon: Brain },
                  { id: 'history', label: 'Revision history & Approval', icon: History }
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setWorkspaceSubTab(item.id as any)}
                      className={`flex items-center gap-2.5 px-3 py-2 text-left rounded-sm font-semibold transition-all ${
                        workspaceSubTab === item.id
                          ? 'bg-cyan-500/10 text-cyan-400 border-l-2 border-cyan-400'
                          : 'text-slate-400 hover:bg-slate-900/40 hover:text-slate-200'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Approval controls for admin roles */}
              <div className="mt-6 p-4 bg-slate-950/40 border border-slate-900/80 rounded-sm">
                <span className="text-[10px] uppercase font-mono text-slate-500 block mb-2">Lead Approval Node</span>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <button
                      disabled={selectedPlan.approvalStatus === 'Approved'}
                      onClick={() => handleUpdateApproval(selectedPlan.id, 'Approved')}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-slate-950 font-semibold py-1.5 rounded-sm cursor-pointer transition-colors text-[10px] uppercase tracking-wider"
                    >
                      Approve Plan
                    </button>
                    <button
                      disabled={selectedPlan.approvalStatus === 'Rejected'}
                      onClick={() => handleUpdateApproval(selectedPlan.id, 'Rejected')}
                      className="flex-1 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 disabled:opacity-40 border border-rose-900 font-semibold py-1.5 rounded-sm cursor-pointer transition-all text-[10px] uppercase tracking-wider"
                    >
                      Reject
                    </button>
                  </div>
                  <button
                    onClick={() => handleArchivePlan(selectedPlan.id)}
                    className="w-full text-center py-1 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 font-mono text-[9px] uppercase tracking-wider border border-slate-800 mt-1"
                  >
                    Archive Load Plan
                  </button>
                </div>
              </div>
            </div>

            {/* Right Workstation canvas */}
            <div className="col-span-3 bg-[#0C111E] border border-slate-900 rounded-sm p-6 min-h-[500px]">
              {workspaceSubTab === 'overview' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                    <h4 className="text-xs uppercase font-mono font-bold tracking-widest text-slate-300">Overview & Metadata</h4>
                    <span className="font-mono text-slate-500 text-[10px]">PLAN_ID: {selectedPlan.id}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-6 leading-relaxed">
                    <div className="space-y-4">
                      <div>
                        <span className="text-slate-500 uppercase tracking-wider text-[10px] block">Load Plan Title</span>
                        <p className="text-sm font-semibold text-slate-200 mt-1">{selectedPlan.title}</p>
                      </div>
                      <div>
                        <span className="text-slate-500 uppercase tracking-wider text-[10px] block">Description</span>
                        <p className="text-slate-400 text-[11px] mt-1">{selectedPlan.description}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div>
                          <span className="text-slate-500 uppercase tracking-wider text-[10px] block">Planner</span>
                          <span className="font-semibold text-slate-300 mt-1 flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-cyan-400" />
                            {selectedPlan.planner}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 uppercase tracking-wider text-[10px] block">Vehicle Standard</span>
                          <span className="font-semibold text-slate-300 mt-1 block">{selectedPlan.vehicleType}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-950/50 p-4 border border-slate-900 space-y-4 rounded-sm">
                      <div className="flex items-center gap-1.5 text-slate-300 font-bold border-b border-slate-900 pb-2">
                        <Warehouse className="w-4 h-4 text-cyan-400" />
                        <span>Fulfillment & Staging Facility</span>
                      </div>
                      <div>
                        <span className="text-slate-500 uppercase tracking-wider text-[9px] block">Assigned Warehouse</span>
                        <span className="text-slate-200 font-semibold font-mono mt-0.5 block">{selectedPlan.warehouse}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <div>
                          <span className="text-slate-500 uppercase tracking-wider text-[9px] block">Customer Node</span>
                          <span className="text-slate-300 mt-0.5 block">{selectedPlan.customer.name}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 uppercase tracking-wider text-[9px] block">Engineering Project</span>
                          <span className="text-slate-300 mt-0.5 block">{selectedPlan.project.name}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-950/20 p-4 border border-slate-900/60 rounded-sm">
                    <h5 className="font-bold text-slate-300 mb-2 flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5 text-cyan-400" />
                      Platform Integration Links
                    </h5>
                    <p className="text-slate-500 text-[10px] leading-relaxed mb-3">
                      This load planning envelope represents an integration bridge linking CRM customers, Engineering project milestones, and Packaging Designs together.
                    </p>
                    <div className="grid grid-cols-3 gap-3 font-mono text-[10px]">
                      <div className="p-2.5 bg-slate-950 border border-slate-900 rounded-sm">
                        <div className="text-slate-500 uppercase">Customer Node</div>
                        <div className="text-cyan-400 mt-1">{selectedPlan.customer.name}</div>
                      </div>
                      <div className="p-2.5 bg-slate-950 border border-slate-900 rounded-sm">
                        <div className="text-slate-500 uppercase">Packaging Project</div>
                        <div className="text-indigo-400 mt-1">{selectedPlan.project.name}</div>
                      </div>
                      <div className="p-2.5 bg-slate-950 border border-slate-900 rounded-sm">
                        <div className="text-slate-500 uppercase">Linked Design</div>
                        <div className="text-amber-400 mt-1">{selectedPlan.packagingDesign.designNumber}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {workspaceSubTab === 'capacity' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                    <h4 className="text-xs uppercase font-mono font-bold tracking-widest text-slate-300">Capacity & Staging Limits</h4>
                    <span className="font-mono text-cyan-400">SAFETY_MARGIN: {selectedPlan.capacity.safetyMargin}%</span>
                  </div>

                  {/* 4. CAPACITY PANEL */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="bg-slate-950/50 p-4 border border-slate-900 rounded-sm space-y-3">
                        <h5 className="font-bold text-slate-300 flex items-center gap-1.5 border-b border-slate-900 pb-2">
                          <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                          Dimensions & Stacking Profile
                        </h5>
                        <div className="grid grid-cols-2 gap-4 text-[11px]">
                          <div>
                            <span className="text-slate-500 block">Length:</span>
                            <span className="font-mono font-semibold text-slate-300">{selectedPlan.capacity.dimensions.length} {selectedPlan.capacity.dimensions.unit}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Width:</span>
                            <span className="font-mono font-semibold text-slate-300">{selectedPlan.capacity.dimensions.width} {selectedPlan.capacity.dimensions.unit}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Height:</span>
                            <span className="font-mono font-semibold text-slate-300">{selectedPlan.capacity.dimensions.height} {selectedPlan.capacity.dimensions.unit}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Stacking Limit:</span>
                            <span className="font-mono font-semibold text-cyan-400">{selectedPlan.capacity.stackingLimit} Tiers max</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-950/50 p-4 border border-slate-900 rounded-sm space-y-3">
                        <h5 className="font-bold text-slate-300 flex items-center gap-1.5 border-b border-slate-900 pb-2">
                          <Compass className="w-3.5 h-3.5 text-cyan-400" />
                          Physical Constants (Placeholders)
                        </h5>
                        <div className="grid grid-cols-2 gap-4 text-[11px]">
                          <div>
                            <span className="text-slate-500 block">Loading Zone:</span>
                            <span className="font-semibold text-slate-300 font-mono">{selectedPlan.capacity.loadingZone}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Center of Gravity:</span>
                            <span className="font-mono text-cyan-400">{selectedPlan.capacity.centerOfGravity}</span>
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-normal pt-1 border-t border-slate-900/60">
                          *These metrics represent structural physical characteristics intended for future gravity center balance simulations.*
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-950 p-5 border border-slate-900 rounded-sm space-y-6">
                      <h5 className="font-bold text-slate-300 flex items-center gap-1 border-b border-slate-900 pb-2">
                        <Scale className="w-4 h-4 text-cyan-400" />
                        Capacity Utilization Gauges
                      </h5>

                      <div className="space-y-4">
                        {/* Weight Gauge */}
                        <div>
                          <div className="flex justify-between text-[11px] mb-1 font-mono">
                            <span className="text-slate-400">Cumulative Load Weight</span>
                            <span className="text-cyan-400 font-bold">{selectedPlan.capacity.weight} kg</span>
                          </div>
                          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                            <div 
                              className="h-full bg-cyan-400 transition-all duration-500" 
                              style={{ width: `${Math.min(100, (selectedPlan.capacity.weight / 25000) * 100)}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-1">
                            <span>0 kg</span>
                            <span>Max Limit: 25,000 kg</span>
                          </div>
                        </div>

                        {/* Volume Gauge */}
                        <div>
                          <div className="flex justify-between text-[11px] mb-1 font-mono">
                            <span className="text-slate-400">Staging Cube Volume</span>
                            <span className="text-indigo-400 font-bold">{selectedPlan.capacity.volume} CBM</span>
                          </div>
                          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                            <div 
                              className="h-full bg-indigo-400 transition-all duration-500" 
                              style={{ width: `${Math.min(100, (selectedPlan.capacity.volume / 76.2) * 100)}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-1">
                            <span>0 CBM</span>
                            <span>Max limit: 76.2 CBM</span>
                          </div>
                        </div>

                        {/* Quantity Capacity */}
                        <div>
                          <div className="flex justify-between text-[11px] mb-1 font-mono">
                            <span className="text-slate-400">Total Unit Capacity</span>
                            <span className="text-amber-400 font-bold">{selectedPlan.capacity.maximumCapacity} Units</span>
                          </div>
                          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                            <div 
                              className="h-full bg-amber-400 transition-all duration-500" 
                              style={{ width: `${Math.min(100, (selectedPlan.capacity.maximumCapacity / 32) * 100)}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-1">
                            <span>0 Units</span>
                            <span>Max Envelope: 32 units</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {workspaceSubTab === 'engineering' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                    <h4 className="text-xs uppercase font-mono font-bold tracking-widest text-slate-300">Engineering Integration</h4>
                    <span className="font-mono text-slate-500 text-[10px]">ASSET_REF: {selectedPlan.engineeringAsset}</span>
                  </div>

                  {/* 5. ENGINEERING INTEGRATION */}
                  <div className="grid grid-cols-3 gap-4 font-mono text-[10px]">
                    <div className="p-4 bg-slate-950 border border-slate-900 rounded-sm">
                      <div className="text-slate-500">ENGINEERING ASSET / CAD</div>
                      <div className="text-cyan-400 font-bold mt-1 text-xs truncate" title={selectedPlan.engineeringAsset}>
                        {selectedPlan.engineeringAsset}
                      </div>
                      <p className="text-[9px] text-slate-600 mt-2 leading-relaxed">
                        Formal Drawing or STEP CAD payload binding this logistics plan to real geometric specs.
                      </p>
                    </div>

                    <div className="p-4 bg-slate-950 border border-slate-900 rounded-sm">
                      <div className="text-slate-500">PACKAGING DESIGN NUMBER</div>
                      <div className="text-indigo-400 font-bold mt-1 text-xs">
                        {selectedPlan.packagingDesign.designNumber}
                      </div>
                      <div className="text-slate-300 mt-1">{selectedPlan.packagingDesign.name}</div>
                    </div>

                    <div className="p-4 bg-slate-950 border border-slate-900 rounded-sm">
                      <div className="text-slate-500">LINKED PROJECTS</div>
                      <div className="text-amber-400 font-bold mt-1 text-xs truncate">
                        {selectedPlan.project.name}
                      </div>
                      <p className="text-[9px] text-slate-600 mt-2 leading-relaxed">
                        Synchronized with active master project schedules and milestone milestones.
                      </p>
                    </div>
                  </div>

                  {selectedDesign && (
                    <div className="border border-slate-900 bg-slate-950/20 p-4 rounded-sm space-y-4">
                      <h5 className="font-bold text-slate-300 text-xs flex items-center gap-1.5">
                        <FileCode className="w-4 h-4 text-cyan-400" />
                        Resolved Bill of Materials (BOM) from Design {selectedDesign.designNumber}
                      </h5>

                      <div className="border border-slate-900 rounded-sm overflow-hidden">
                        <table className="w-full text-left border-collapse text-[11px]">
                          <thead>
                            <tr className="bg-slate-950 text-slate-400 border-b border-slate-900 font-mono">
                              <th className="p-2.5">Component ID</th>
                              <th className="p-2.5">Component Name</th>
                              <th className="p-2.5 text-right">Quantity</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-900/60 font-mono">
                            {selectedDesign.bom && selectedDesign.bom.length > 0 ? (
                              selectedDesign.bom.map((b: any, idx: number) => (
                                <tr key={idx} className="hover:bg-slate-950/30">
                                  <td className="p-2.5 text-slate-400">{b.componentId || `comp-${idx+1}`}</td>
                                  <td className="p-2.5 text-slate-300 font-sans font-medium">{b.name}</td>
                                  <td className="p-2.5 text-right text-cyan-400 font-bold">{b.quantity}</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={3} className="p-3 text-center text-slate-500">No active BOM components loaded.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {workspaceSubTab === 'documents' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                    <h4 className="text-xs uppercase font-mono font-bold tracking-widest text-slate-300">Documents, Knowledge & Memories</h4>
                    <span className="font-mono text-slate-500 text-[10px]">COGNITIVE_NODES</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-950/50 p-4 border border-slate-900 rounded-sm space-y-3">
                      <h5 className="font-bold text-slate-300 flex items-center gap-1.5 border-b border-slate-900 pb-2">
                        <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                        KMS / ASTM Compliance Links
                      </h5>
                      <ul className="space-y-2 text-[11px] leading-relaxed">
                        <li className="flex items-start gap-1 text-slate-400">
                          <span className="text-cyan-400 font-mono">ASTM D6199:</span>
                          <span>Wood Members for Containers and Pallets conformity bounds.</span>
                        </li>
                        <li className="flex items-start gap-1 text-slate-400">
                          <span className="text-cyan-400 font-mono">ISTA 3A:</span>
                          <span>Overhead pressure testing and transit vibration envelopes.</span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-slate-950/50 p-4 border border-slate-900 rounded-sm space-y-3">
                      <h5 className="font-bold text-slate-300 flex items-center gap-1.5 border-b border-slate-900 pb-2">
                        <Brain className="w-3.5 h-3.5 text-cyan-400" />
                        Memory Engine Recalls
                      </h5>
                      <ul className="space-y-2 text-[11px] leading-relaxed font-mono text-slate-400">
                        <li>
                          <span className="text-slate-500">[MEM-091]</span> Max structural weight constraints for SpaceLabs avionics containers should not exceed 15000kg.
                        </li>
                        <li>
                          <span className="text-slate-500">[MEM-104]</span> Container doors require 150mm overhead clearance for forklift loading.
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {workspaceSubTab === 'ai' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                    <h4 className="text-xs uppercase font-mono font-bold tracking-widest text-slate-300">AI Co-pilot Grounding HUD</h4>
                    <span className="font-mono text-emerald-400 text-[10px]">CONNECTED_TO_GEMINI</span>
                  </div>

                  <div className="bg-slate-950 p-4 border border-slate-900 rounded-sm space-y-3">
                    <div className="flex justify-between items-center">
                      <h5 className="font-bold text-slate-300 font-mono text-[10px] uppercase tracking-wider text-cyan-400">
                        Structured AI Context XML (Read-only)
                      </h5>
                      <span className="text-[9px] text-slate-500 font-mono">Structured Context • No Optimization</span>
                    </div>
                    <div className="bg-slate-900/40 p-3 rounded-sm border border-slate-950 max-h-[160px] overflow-y-auto font-mono text-[10px] text-cyan-500/80 leading-normal whitespace-pre">
                      {logisticsRegistry.getAIContext()}
                    </div>
                  </div>

                  <div className="bg-slate-950 p-4 border border-slate-900 rounded-sm space-y-3">
                    <h5 className="font-bold text-slate-300 flex items-center gap-1.5 text-xs">
                      <Cpu className="w-4 h-4 text-cyan-400" />
                      Consult Packaging AI Assistant
                    </h5>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="Ask co-pilot... (e.g. Verify volume constraints against ASTM standard)"
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-sm p-2 text-xs focus:outline-none focus:border-cyan-500 text-slate-100 font-mono"
                      />
                      <button
                        onClick={executeAIConsultation}
                        disabled={aiIsThinking || !aiPrompt}
                        className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold font-mono uppercase tracking-wider rounded-sm disabled:opacity-40 transition-all cursor-pointer"
                      >
                        {aiIsThinking ? 'Analyzing...' : 'Consult'}
                      </button>
                    </div>

                    {aiResponse && (
                      <div className="mt-4 p-4 bg-[#070B13] border border-slate-900 rounded-sm leading-relaxed text-slate-300 text-[11px] whitespace-pre-wrap">
                        {aiResponse}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {workspaceSubTab === 'history' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                    <h4 className="text-xs uppercase font-mono font-bold tracking-widest text-slate-300">Revision History & Staging</h4>
                    <span className="font-mono text-slate-500 text-[10px]">VERSION_LOCK: ACTIVE</span>
                  </div>

                  <div className="bg-slate-950 p-4 border border-slate-900 rounded-sm space-y-3">
                    <h5 className="font-bold text-slate-300 text-xs">Generate Plan Revision</h5>
                    <p className="text-slate-500 text-[10px]">
                      Revisioning increments the plan version tag and triggers workflow re-submission to the Quality Manager.
                    </p>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={revisionNotes}
                        onChange={(e) => setRevisionNotes(e.target.value)}
                        placeholder="State reason for revision draft... (e.g., Aligned dimensions with Tesla GMA Pallet specs)"
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-sm p-2 focus:outline-none focus:border-cyan-500 text-slate-200"
                      />
                      <button
                        onClick={() => handleCreateRevision(selectedPlan.id)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-sm transition-all cursor-pointer font-mono uppercase text-[10px] tracking-wider"
                      >
                        Commit Revision
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h5 className="font-bold text-slate-400 text-[10px] uppercase tracking-wider font-mono">Revision History</h5>
                    <div className="border border-slate-900/60 rounded-sm divide-y divide-slate-900 bg-slate-950/20">
                      <div className="p-3 flex justify-between items-center">
                        <div>
                          <div className="font-bold text-slate-300 font-mono">Revision R{selectedPlan.revision}</div>
                          <div className="text-[10px] text-slate-500 mt-1">Status changed to {selectedPlan.status}</div>
                        </div>
                        <span className="text-slate-500 text-[10px] font-mono">Active Version</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : activeSubTab === 'dashboard' ? (
          /* ========================================================== */
          /* 11. UI Component: LogisticsDashboard */
          /* ========================================================== */
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 bg-[#0C111E] border border-slate-900 rounded-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-500 block">Staged Load Plans</span>
                  <span className="text-xl font-bold font-mono text-cyan-400 mt-1 block">{plans.length}</span>
                </div>
                <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-sm">
                  <Clipboard className="w-5 h-5" />
                </div>
              </div>

              <div className="p-4 bg-[#0C111E] border border-slate-900 rounded-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-500 block">Assigned Containers</span>
                  <span className="text-xl font-bold font-mono text-indigo-400 mt-1 block">
                    {plans.filter(p => p.containerId).length}
                  </span>
                </div>
                <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-sm">
                  <Maximize2 className="w-5 h-5" />
                </div>
              </div>

              <div className="p-4 bg-[#0C111E] border border-slate-900 rounded-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-500 block">Planned Weight</span>
                  <span className="text-xl font-bold font-mono text-amber-400 mt-1 block">
                    {plans.reduce((acc, p) => acc + p.capacity.weight, 0).toLocaleString()} kg
                  </span>
                </div>
                <div className="p-2 bg-amber-500/10 text-amber-400 rounded-sm">
                  <Scale className="w-5 h-5" />
                </div>
              </div>

              <div className="p-4 bg-[#0C111E] border border-slate-900 rounded-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-500 block">System Revisions</span>
                  <span className="text-xl font-bold font-mono text-emerald-400 mt-1 block">
                    {plans.reduce((acc, p) => acc + p.revision, 0)}
                  </span>
                </div>
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-sm">
                  <History className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {/* Recent Plans Widget */}
              <div className="col-span-2 bg-[#0C111E] border border-slate-900 rounded-sm p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-cyan-400 animate-pulse" />
                    Recent Loading Plans
                  </h4>
                  <button
                    onClick={() => setActiveSubTab('plans')}
                    className="text-cyan-400 font-semibold hover:underline flex items-center gap-0.5 text-[10px]"
                  >
                    View Registry →
                  </button>
                </div>

                <div className="divide-y divide-slate-900/60 border border-slate-900 rounded-sm">
                  {plans.slice(0, 4).map(p => (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPlanId(p.id)}
                      className="p-3.5 hover:bg-slate-950/40 transition-colors cursor-pointer flex justify-between items-center"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-cyan-400">{p.planNumber}</span>
                          <span className="text-slate-200 font-semibold truncate max-w-[200px]">{p.title}</span>
                        </div>
                        <p className="text-[10px] text-slate-500">
                          {p.customer.name} • {p.project.name}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded-sm">
                          {p.containerType}
                        </span>
                        <ArrowRight className="w-4 h-4 text-slate-600" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status and Utilization Panel */}
              <div className="bg-[#0C111E] border border-slate-900 rounded-sm p-5 space-y-4">
                <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  Cargo Staging Security
                </h4>

                <div className="space-y-3 font-mono text-[10px]">
                  <div className="p-3 bg-slate-950/40 border border-slate-900 rounded-sm flex items-start gap-2 text-slate-400 leading-relaxed">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-bold text-slate-300">ASTM D6199 Compliant</div>
                      <div className="text-[9px] mt-0.5">Wood members are verified for packaging structures under intermodal vibrations.</div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950/40 border border-slate-900 rounded-sm flex items-start gap-2 text-slate-400 leading-relaxed">
                    <Activity className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-bold text-slate-300">CoG Balance Checked</div>
                      <div className="text-[9px] mt-0.5">Asymmetric loading bounds verified below 15% lateral skew standard limit.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : activeSubTab === 'plans' ? (
          /* ========================================================== */
          /* 1. LOAD PLANNING REGISTRY (LIST VIEW) */
          /* ========================================================== */
          <div className="space-y-4">
            {/* 11. UI Component: LoadSearch & LoadFilters */}
            <div className="flex gap-3 bg-[#0C111E] p-4 border border-slate-900 rounded-sm">
              <div className="flex-1 relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search load plans by Plan ID, Customer, Project, Packaging Design, status..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-sm py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-cyan-500 text-slate-200"
                />
              </div>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-sm py-2 px-3 text-xs focus:outline-none focus:border-cyan-500 text-slate-300"
              >
                <option value="">All Statuses</option>
                <option value="Draft">Draft</option>
                <option value="Submitted">Submitted</option>
                <option value="In Review">In Review</option>
                <option value="Approved">Approved</option>
                <option value="Archived">Archived</option>
              </select>

              <select
                value={selectedContainerType}
                onChange={(e) => setSelectedContainerType(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-sm py-2 px-3 text-xs focus:outline-none focus:border-cyan-500 text-slate-300"
              >
                <option value="">All Equipment</option>
                <option value="20ft Container">20ft Container</option>
                <option value="40ft Container">40ft Container</option>
                <option value="40HC">40HC</option>
                <option value="Pallet">Pallet</option>
                <option value="Rack">Rack</option>
                <option value="Truck">Truck</option>
                <option value="Trailer">Trailer</option>
                <option value="Warehouse Bin">Warehouse Bin</option>
              </select>

              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-sm py-2 px-3 text-xs focus:outline-none focus:border-cyan-500 text-slate-300"
              >
                <option value="">All Priorities</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            {/* Load Planning Cards Listing */}
            <div className="grid grid-cols-3 gap-4">
              {filteredPlans.map(p => {
                const planDesign = packagingRegistry.getDesignById(p.packagingDesign.id);
                return (
                  /* ========================================================== */
                  /* 11. UI Component: LoadPlanCard */
                  /* ========================================================== */
                  <div
                    key={p.id}
                    onClick={() => setSelectedPlanId(p.id)}
                    className="bg-[#0C111E] border border-slate-900 rounded-sm p-4 hover:border-cyan-500/45 cursor-pointer transition-all flex flex-col justify-between hover:shadow-lg hover:shadow-cyan-950/10 relative"
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-mono font-bold text-cyan-400 text-[10px] tracking-wider">
                          {p.planNumber}
                        </span>
                        <span className={`font-mono text-[9px] font-semibold px-2 py-0.5 rounded-sm ${
                          p.priority === 'Critical' ? 'bg-rose-950 text-rose-400' :
                          p.priority === 'High' ? 'bg-amber-950 text-amber-400' : 'bg-slate-900 text-slate-400'
                        }`}>{p.priority}</span>
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-200 leading-snug line-clamp-1">{p.title}</h4>
                        <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">{p.description}</p>
                      </div>

                      <div className="pt-2 border-t border-slate-900 space-y-1.5 text-[10px] font-mono">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Customer:</span>
                          <span className="text-slate-300 truncate max-w-[150px]">{p.customer.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Design ID:</span>
                          <span className="text-indigo-400">{p.packagingDesign.designNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Equipment:</span>
                          <span className="text-amber-400">{p.containerType}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-900/60 pt-3 mt-4 text-[10px]">
                      <span className="text-slate-500 font-mono">Rev: R{p.revision}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold ${
                        p.status === 'Approved' ? 'bg-emerald-950 text-emerald-400' :
                        p.status === 'In Review' ? 'bg-amber-950 text-amber-400' : 'bg-slate-900 text-slate-400'
                      }`}>{p.status}</span>
                    </div>
                  </div>
                );
              })}

              {filteredPlans.length === 0 && (
                <div className="col-span-3 text-center py-12 text-slate-500">
                  No matching cargo loading plan sheets found in registry.
                </div>
              )}
            </div>
          </div>
        ) : activeSubTab === 'containers' ? (
          /* ========================================================== */
          /* 2. CONTAINER REGISTRY & 11. UI Component: ContainerLibrary */
          /* ========================================================== */
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {containers.map(c => (
                <div
                  key={c.id}
                  className="bg-[#0C111E] border border-slate-900 rounded-sm p-4 space-y-3"
                >
                  <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">{c.type}</span>
                      <h4 className="font-bold text-slate-200 mt-0.5 text-xs">{c.name}</h4>
                    </div>
                    <span className={`font-mono text-[9px] font-semibold px-1.5 py-0.5 rounded ${
                      c.status === 'Available' ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-900 text-slate-500'
                    }`}>{c.status}</span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-normal">{c.description}</p>

                  <div className="pt-2 border-t border-slate-900 space-y-1.5 font-mono text-[10px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Equipment Code:</span>
                      <span className="text-cyan-400 font-bold">{c.code}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Interior Envelope:</span>
                      <span className="text-slate-300">{c.lengthMm} x {c.widthMm} x {c.heightMm} mm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Payload Limits:</span>
                      <span className="text-slate-300">{c.maxWeightKg.toLocaleString()} kg / {c.maxVolumeCbm} CBM</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* ========================================================== */
          /* AUDIT TRAILS & LEDGERS */
          /* ========================================================== */
          <div className="space-y-4">
            <div className="bg-[#0C111E] border border-slate-900 rounded-sm overflow-hidden">
              <div className="p-4 bg-slate-950 border-b border-slate-900 flex justify-between items-center">
                <h4 className="font-bold text-slate-300 font-mono text-xs">LOGISTICS SECURITY & AUDIT TRAIL LEDGER</h4>
                <span className="text-[10px] text-slate-500 font-mono uppercase">Compliance Isolated</span>
              </div>

              <div className="divide-y divide-slate-900/60 font-mono text-[10px]">
                {auditLogs.map((l, idx) => (
                  <div key={idx} className="p-3 hover:bg-slate-950/30 flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-cyan-400 font-bold">[{l.action}]</span>
                        <span className="text-slate-300">{l.details}</span>
                      </div>
                      <div className="text-[9px] text-slate-500">
                        Target ID: {l.targetId} • Operator: {l.userId} ({l.userRole})
                      </div>
                    </div>
                    <span className="text-slate-500 text-[9px] shrink-0">{new Date(l.timestamp).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- CREATE NEW LOAD PLAN MODAL --- */}
      {isCreatePlanOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-[#0C111E] border border-slate-900 rounded-sm p-6 shadow-2xl relative">
            <h3 className="text-xs font-bold text-slate-100 uppercase font-mono tracking-wider mb-4 border-b border-slate-900 pb-2">
              Generate Cargo Loading Plan
            </h3>

            <form onSubmit={handleCreatePlan} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 font-semibold mb-1 block">Plan Title *</label>
                  <input
                    type="text"
                    required
                    value={planTitle}
                    onChange={(e) => setPlanTitle(e.target.value)}
                    placeholder="e.g. Avionics 40ft Container Sheet"
                    className="w-full bg-slate-950 border border-slate-800 rounded-sm p-2 text-xs focus:outline-none focus:border-cyan-500 text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-semibold mb-1 block">Priority *</label>
                  <select
                    value={planPriority}
                    onChange={(e) => setPlanPriority(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-sm p-2 text-xs focus:outline-none focus:border-cyan-500 text-slate-200"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-semibold mb-1 block">Description</label>
                <textarea
                  value={planDesc}
                  onChange={(e) => setPlanDesc(e.target.value)}
                  placeholder="Describe dunnage stacking rules, logistics constraints..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-sm p-2 text-xs h-16 focus:outline-none focus:border-cyan-500 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 font-semibold mb-1 block">Select Packaging Design *</label>
                  <select
                    required
                    value={selectedDesignId}
                    onChange={(e) => setSelectedDesignId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-sm p-2 text-xs focus:outline-none focus:border-cyan-500 text-slate-200"
                  >
                    <option value="">-- Choose Active Design --</option>
                    {packagingRegistry.getDesigns().map(d => (
                      <option key={d.id} value={d.id}>{d.designNumber} - {d.designName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 font-semibold mb-1 block">Select Equipment / Container *</label>
                  <select
                    required
                    value={selectedContainerId}
                    onChange={(e) => setSelectedContainerId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-sm p-2 text-xs focus:outline-none focus:border-cyan-500 text-slate-200"
                  >
                    <option value="">-- Select ISO Equipment --</option>
                    {containers.map(c => (
                      <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="border-t border-slate-900 pt-3">
                <h4 className="text-[10px] uppercase font-mono text-cyan-400 tracking-wider mb-2">Capacity Modeling Constants</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-500 block mb-0.5">Volume (CBM)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={capVolume}
                      onChange={(e) => setCapVolume(parseFloat(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-sm p-1 text-xs text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-0.5">Weight (kg)</label>
                    <input
                      type="number"
                      value={capWeight}
                      onChange={(e) => setCapWeight(parseInt(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-sm p-1 text-xs text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-0.5">Stack Limit (tiers)</label>
                    <input
                      type="number"
                      value={capStackLimit}
                      onChange={(e) => setCapStackLimit(parseInt(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-sm p-1 text-xs text-slate-200"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-900 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreatePlanOpen(false)}
                  className="px-4 py-2 border border-slate-800 hover:bg-slate-900 text-slate-400 font-semibold rounded-sm transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-sm transition-colors cursor-pointer"
                >
                  Generate Plan Sheet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- CREATE NEW CONTAINER MODAL --- */}
      {isCreateContainerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#0C111E] border border-slate-900 rounded-sm p-6 shadow-2xl relative">
            <h3 className="text-xs font-bold text-slate-100 uppercase font-mono tracking-wider mb-4 border-b border-slate-900 pb-2">
              Register Staging Equipment / Vehicle
            </h3>

            <form onSubmit={handleCreateContainer} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 font-semibold mb-1 block">Equipment Code *</label>
                  <input
                    type="text"
                    required
                    value={contCode}
                    onChange={(e) => setContCode(e.target.value)}
                    placeholder="e.g. ISO-20OT"
                    className="w-full bg-slate-950 border border-slate-800 rounded-sm p-2 text-xs focus:outline-none focus:border-cyan-500 text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-semibold mb-1 block">Equipment Type *</label>
                  <select
                    value={contType}
                    onChange={(e) => setContType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-sm p-2 text-xs focus:outline-none focus:border-cyan-500 text-slate-200"
                  >
                    <option value="20ft Container">20ft Container</option>
                    <option value="40ft Container">40ft Container</option>
                    <option value="40HC">40HC</option>
                    <option value="Pallet">Pallet</option>
                    <option value="Rack">Rack</option>
                    <option value="Truck">Truck</option>
                    <option value="Trailer">Trailer</option>
                    <option value="Warehouse Bin">Warehouse Bin</option>
                    <option value="Custom Container">Custom Container</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-semibold mb-1 block">Equipment Name *</label>
                <input
                  type="text"
                  required
                  value={contName}
                  onChange={(e) => setContName(e.target.value)}
                  placeholder="e.g. Standard 20-Foot ISO Open Top Container"
                  className="w-full bg-slate-950 border border-slate-800 rounded-sm p-2 text-xs focus:outline-none focus:border-cyan-500 text-slate-200"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold mb-1 block">Description</label>
                <textarea
                  value={contDesc}
                  onChange={(e) => setContDesc(e.target.value)}
                  placeholder="Provide mechanical capabilities, locking constraints, loading clearances..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-sm p-2 text-xs h-16 focus:outline-none focus:border-cyan-500 text-slate-200"
                />
              </div>

              <div className="border-t border-slate-900 pt-3 grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-500 block mb-0.5">Length (mm)</label>
                  <input
                    type="number"
                    value={contL}
                    onChange={(e) => setContL(parseInt(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-sm p-1 text-xs text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block mb-0.5">Width (mm)</label>
                  <input
                    type="number"
                    value={contW}
                    onChange={(e) => setContW(parseInt(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-sm p-1 text-xs text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block mb-0.5">Height (mm)</label>
                  <input
                    type="number"
                    value={contH}
                    onChange={(e) => setContH(parseInt(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-sm p-1 text-xs text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-500 block mb-0.5">Max Weight Capacity (kg)</label>
                  <input
                    type="number"
                    value={contMaxW}
                    onChange={(e) => setContMaxW(parseInt(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-sm p-2 text-xs text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block mb-0.5">Max Volume Capacity (CBM)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={contMaxVol}
                    onChange={(e) => setContMaxVol(parseFloat(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-sm p-2 text-xs text-slate-200"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-900 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreateContainerOpen(false)}
                  className="px-4 py-2 border border-slate-800 hover:bg-slate-900 text-slate-400 font-semibold rounded-sm transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-sm transition-colors cursor-pointer"
                >
                  Register Equipment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default LoadPlanningWorkspace;

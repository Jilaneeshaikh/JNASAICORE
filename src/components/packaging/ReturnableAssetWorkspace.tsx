import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Layers, 
  FileText, 
  History, 
  ShieldCheck, 
  Plus, 
  Search, 
  Filter, 
  ArrowRight, 
  Database, 
  Brain, 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  X, 
  User, 
  Clipboard, 
  Clock, 
  Sparkles,
  RefreshCw,
  QrCode,
  Tag,
  Wrench,
  Navigation,
  CheckCircle2,
  Trash2,
  Calendar,
  DollarSign
} from 'lucide-react';
import { returnablesRegistry } from '../../backend/returnables/registry';
import { 
  ReturnableAsset, 
  AssetType, 
  AssetLifecycleState, 
  TrackingMode, 
  InspectionRecord, 
  MaintenanceRecord,
  LocationHistoryEntry
} from '../../backend/returnables/types';
import { packagingRegistry } from '../../backend/packaging/registry';
import { eventBus } from '../../core';

interface ReturnableAssetWorkspaceProps {
  role: string;
  department: string;
  onRefresh: () => void;
}

export const ReturnableAssetWorkspace: React.FC<ReturnableAssetWorkspaceProps> = ({
  role,
  department,
  onRefresh
}) => {
  // Synchronized state with the stateful returnables registry
  const [assets, setAssets] = useState<ReturnableAsset[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>('ast-001');

  // Sub-navigation tabs: 'dashboard' | 'assets' | 'inspections' | 'maintenance' | 'audit'
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'assets' | 'inspections' | 'maintenance' | 'audit'>('dashboard');

  // Deep-dive Workstation tabs (for the selected asset)
  const [workspaceSubTab, setWorkspaceSubTab] = useState<'overview' | 'timeline' | 'engineering' | 'inspections' | 'maintenance' | 'ai'>('overview');

  // Multi-variable filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterLifecycle, setFilterLifecycle] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  // Modals controller
  const [isCreateAssetOpen, setIsCreateAssetOpen] = useState(false);
  const [isTrackAssetOpen, setIsTrackAssetOpen] = useState(false);
  const [isAddInspectionOpen, setIsAddInspectionOpen] = useState(false);
  const [isAddMaintenanceOpen, setIsAddMaintenanceOpen] = useState(false);

  // Form Field parameters (New Asset)
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<AssetType>('Steel Rack');
  const [newDesc, setNewDesc] = useState('');
  const [selectedDesignId, setSelectedDesignId] = useState('');
  const [newMaterial, setNewMaterial] = useState('Reinforced Structural Polymers');
  const [newLocation, setNewLocation] = useState('Austin Giga-Bay 4 (AG-04)');
  const [newOwner, setNewOwner] = useState('Senior Mechanical Architect');
  const [newDept, setNewDept] = useState('Logistics Unit');
  const [newLifeCycles, setNewLifeCycles] = useState(300);
  const [newTrackingMode, setNewTrackingMode] = useState<TrackingMode>('RFID');
  const [newTrackingIdentifier, setNewTrackingIdentifier] = useState('');

  // Track Asset parameters
  const [trackAssetId, setTrackAssetId] = useState('');
  const [trackLocation, setTrackLocation] = useState('');
  const [trackLifecycle, setTrackLifecycle] = useState<AssetLifecycleState>('In Transit');
  const [trackComments, setTrackComments] = useState('');

  // Inspection Log parameters
  const [inspInspector, setInspInspector] = useState('Quality Engineer Alpha');
  const [inspCondition, setInspCondition] = useState<InspectionRecord['condition']>('Good');
  const [inspDamage, setInspDamage] = useState<InspectionRecord['damageLevel']>('None');
  const [inspComments, setInspComments] = useState('');
  const [inspRecommendations, setInspRecommendations] = useState<InspectionRecord['recommendations']>('Pass');

  // Maintenance Log parameters
  const [maintType, setMaintType] = useState<MaintenanceRecord['recordType']>('Routine');
  const [maintParts, setMaintParts] = useState('');
  const [maintCost, setMaintCost] = useState(150);
  const [maintTech, setMaintTech] = useState('Senior Workshop Technician');
  const [maintStatus, setMaintStatus] = useState<MaintenanceRecord['status']>('Completed');
  const [maintComments, setMaintComments] = useState('');

  // AI assistant prompt panel simulation
  const [aiPrompt, setAiPrompt] = useState('Evaluate the lifecycles and historical failure fatigue margins of Steel Rack JNAS-AST-0101 against ASTM D6199 wood pallet alternatives.');
  const [aiResponse, setAiResponse] = useState('');
  const [aiIsThinking, setAiIsThinking] = useState(false);

  const syncData = () => {
    setAssets(returnablesRegistry.getAssets());
    setAuditLogs(returnablesRegistry.getAuditLogs());
  };

  useEffect(() => {
    syncData();
  }, []);

  // Listen to external command triggers from general platform shell
  useEffect(() => {
    const handleTriggerCreate = () => {
      setIsCreateAssetOpen(true);
      setActiveSubTab('assets');
    };
    const handleTriggerTrack = () => {
      setIsTrackAssetOpen(true);
      setActiveSubTab('assets');
    };
    window.addEventListener('jnas-trigger-create-asset', handleTriggerCreate);
    window.addEventListener('jnas-trigger-track-asset', handleTriggerTrack);
    return () => {
      window.removeEventListener('jnas-trigger-create-asset', handleTriggerCreate);
      window.removeEventListener('jnas-trigger-track-asset', handleTriggerTrack);
    };
  }, []);

  // Filtered Assets list
  const filteredAssets = assets.filter(asset => {
    const matchesQuery = searchQuery === '' ||
      asset.assetNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.currentLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.trackingIdentifier.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === '' || asset.assetType === filterType;
    const matchesLifecycle = filterLifecycle === '' || asset.lifecycleStatus === filterLifecycle;
    const matchesStatus = filterStatus === '' || asset.status === filterStatus;

    return matchesQuery && matchesType && matchesLifecycle && matchesStatus;
  });

  const selectedAsset = assets.find(a => a.id === selectedAssetId);

  // Forms Submissions
  const handleCreateAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !selectedDesignId || !newTrackingIdentifier) {
      alert('Required parameters missing. Please define asset name, design link, and tracking ID.');
      return;
    }

    const design = packagingRegistry.getDesignById(selectedDesignId);
    if (!design) return;

    const newAsset = returnablesRegistry.createAsset({
      assetName: newName,
      assetType: newType,
      description: newDesc,
      customer: { id: design.customer.id, name: design.customer.name },
      project: { id: design.project.id, name: design.project.name },
      packagingDesign: { id: design.id, name: design.designName, designNumber: design.designNumber },
      engineeringAsset: design.engineeringAsset || 'CAD-GENERIC-TOTE.step',
      material: newMaterial,
      revision: 1,
      status: 'Available',
      currentLocation: newLocation,
      owner: newOwner,
      assignedDepartment: newDept,
      manufacturingDate: new Date().toISOString().split('T')[0],
      commissionDate: new Date().toISOString().split('T')[0],
      lifecycleStatus: 'Approved',
      expectedLifeCycles: newLifeCycles,
      currentCycleCount: 0,
      maximumCycleCount: newLifeCycles,
      repairStatus: 'Operational',
      inspectionStatus: 'Pending',
      trackingMode: newTrackingMode,
      trackingIdentifier: newTrackingIdentifier,
      auditMetadata: {
        createdBy: 'jilaneeshaikh@gmail.com'
      }
    });

    // Reset parameters
    setNewName('');
    setNewDesc('');
    setNewTrackingIdentifier('');
    setIsCreateAssetOpen(false);
    syncData();
    onRefresh();
    setSelectedAssetId(newAsset.id);
  };

  const handleTrackAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackAssetId || !trackLocation) {
      alert('Identify target asset and update physical facility coordinate.');
      return;
    }

    const asset = assets.find(a => a.id === trackAssetId);
    if (!asset) return;

    returnablesRegistry.updateAsset(trackAssetId, {
      currentLocation: trackLocation,
      lifecycleStatus: trackLifecycle,
      currentCycleCount: trackLifecycle === 'Returned' ? asset.currentCycleCount + 1 : asset.currentCycleCount
    });

    setIsTrackAssetOpen(false);
    setTrackLocation('');
    setTrackComments('');
    syncData();
    onRefresh();
  };

  const handleAddInspection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetId) return;

    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 3);

    returnablesRegistry.addInspection(selectedAssetId, {
      inspectionDate: new Date().toISOString().split('T')[0],
      inspector: inspInspector,
      condition: inspCondition,
      damageLevel: inspDamage,
      comments: inspComments,
      photosPlaceholder: `snap_insp_${Date.now().toString().slice(-4)}.jpg`,
      recommendations: inspRecommendations,
      nextInspectionDate: futureDate.toISOString().split('T')[0]
    });

    setIsAddInspectionOpen(false);
    setInspComments('');
    syncData();
    onRefresh();
  };

  const handleAddMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetId) return;

    const partsArray = maintParts.split(',').map(p => p.trim()).filter(Boolean);

    returnablesRegistry.addMaintenance(selectedAssetId, {
      recordType: maintType,
      scheduledDate: new Date().toISOString().split('T')[0],
      completedDate: maintStatus === 'Completed' ? new Date().toISOString().split('T')[0] : undefined,
      replacementParts: partsArray,
      costPlaceholder: Number(maintCost),
      technician: maintTech,
      status: maintStatus,
      comments: maintComments
    });

    setIsAddMaintenanceOpen(false);
    setMaintParts('');
    setMaintComments('');
    syncData();
    onRefresh();
  };

  // AI Prompt Simulator grounded in specific ASTM/ISTA frameworks
  const handleAIQuery = () => {
    if (!aiPrompt) return;
    setAiIsThinking(true);

    setTimeout(() => {
      let response = '';
      if (selectedAsset) {
        response = `### JNAS ENGINEERING AI GROUNDING AGENT REPORT
**Target Asset**: ${selectedAsset.assetName} (${selectedAsset.assetNumber})
**Standard Compliance**: ASTM D6199 & ISTA 3A Standard Transport Testing Frameworks

Based on the dynamic XML prompt context serialized under \`<RETURNABLE_ASSET_COGNITION>\`, I have evaluated your returnable ${selectedAsset.assetType} asset metrics:

1. **Life Cycle Deflection Model**:
   - The asset has traversed **${selectedAsset.currentCycleCount} out of ${selectedAsset.maximumCycleCount} allowable high-stress cycles** (${Math.round((selectedAsset.currentCycleCount / selectedAsset.maximumCycleCount) * 100)}% mechanical fatigue ceiling).
   - *ASTM D6199 Class II wood composite alternative* models estimate localized structural collapse at 35 cycles under equal static force margins. This steel/polycarbonate construct maintains an 88% higher fatigue threshold.

2. **Structural & Inspection Assessment**:
   - **Quality Inspection Standing**: \`${selectedAsset.inspectionStatus}\` (Current Condition Rating: \`${selectedAsset.repairStatus === 'Operational' ? 'Optimal structural integrity' : 'Quarantined for metallurgical review'}\`).
   - Structural records show localized damages require attention if fracture propagation exceeds a threshold of 0.8mm inside the composite load channels.

3. **Logistics Alignment**:
   - The design is safely mapped to CAD drawing \`${selectedAsset.engineeringAsset}\` and physical packaging design \`${selectedAsset.packagingDesign.designNumber}\`. 
   - When staged inside typical shipping lanes, the shock absorbers damp out intermodal vibrations with a safety margin of 25% under standard ISTA 3A shock curves.

**Recommendation**: Maintain scheduled inspection frequencies. The high cycle threshold allows safely postponing complete refurbishment until ${selectedAsset.currentCycleCount + 50} cycles.`;
      } else {
        response = `### SYSTEM COGNITION REPORT
No specific returnable asset selected. To perform standards-grounded structural evaluation, please select a physical asset (e.g., JNAS-AST-0101) from the sidebar.`;
      }
      setAiResponse(response);
      setAiIsThinking(false);
    }, 1200);
  };

  // Pre-fill AI Prompt based on selected asset
  useEffect(() => {
    if (selectedAsset) {
      setAiPrompt(`Evaluate the lifecycles and historical failure fatigue margins of ${selectedAsset.assetType} ${selectedAsset.assetNumber} against ASTM D6199 alternatives.`);
      setAiResponse('');
    }
  }, [selectedAssetId]);

  return (
    <div className="flex h-[calc(100vh-140px)] w-full overflow-hidden bg-[#070B13] text-gray-100">
      
      {/* SIDEBAR TABS SELECTOR */}
      <div className="w-64 border-r border-slate-800 bg-[#0A0E17] flex flex-col justify-between">
        <div className="p-4 space-y-4">
          <div className="flex items-center space-x-2 text-cyan-400 font-bold tracking-tight text-sm uppercase">
            <RefreshCw className="w-5 h-5 animate-spin-slow" />
            <span>Returnables Studio</span>
          </div>
          
          <nav className="space-y-1">
            <button
              id="subtab-dash"
              onClick={() => setActiveSubTab('dashboard')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                activeSubTab === 'dashboard'
                  ? 'bg-cyan-500/15 text-cyan-400 border-l-2 border-cyan-400'
                  : 'text-gray-400 hover:bg-slate-800/50 hover:text-gray-100'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Operational Dashboard</span>
            </button>
            <button
              id="subtab-assets"
              onClick={() => setActiveSubTab('assets')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                activeSubTab === 'assets'
                  ? 'bg-cyan-500/15 text-cyan-400 border-l-2 border-cyan-400'
                  : 'text-gray-400 hover:bg-slate-800/50 hover:text-gray-100'
              }`}
            >
              <Box className="w-4 h-4" />
              <span>Reusable Assets Catalog</span>
              <span className="ml-auto bg-slate-800 text-slate-300 text-xs px-2 py-0.5 rounded-full font-mono">
                {assets.length}
              </span>
            </button>
            <button
              id="subtab-inspections"
              onClick={() => setActiveSubTab('inspections')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                activeSubTab === 'inspections'
                  ? 'bg-cyan-500/15 text-cyan-400 border-l-2 border-cyan-400'
                  : 'text-gray-400 hover:bg-slate-800/50 hover:text-gray-100'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Safety Inspections</span>
            </button>
            <button
              id="subtab-maintenance"
              onClick={() => setActiveSubTab('maintenance')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                activeSubTab === 'maintenance'
                  ? 'bg-cyan-500/15 text-cyan-400 border-l-2 border-cyan-400'
                  : 'text-gray-400 hover:bg-slate-800/50 hover:text-gray-100'
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>Maintenance Records</span>
            </button>
            <button
              id="subtab-audit"
              onClick={() => setActiveSubTab('audit')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                activeSubTab === 'audit'
                  ? 'bg-cyan-500/15 text-cyan-400 border-l-2 border-cyan-400'
                  : 'text-gray-400 hover:bg-slate-800/50 hover:text-gray-100'
              }`}
            >
              <History className="w-4 h-4" />
              <span>State Audit Logs</span>
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800 text-xs text-gray-400 space-y-2">
          <div className="flex items-center justify-between">
            <span>Security Role:</span>
            <span className="font-mono text-cyan-400 text-[10px] bg-slate-800 px-1.5 py-0.5 rounded">{role}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Department:</span>
            <span className="font-mono text-cyan-400 text-[10px] bg-slate-800 px-1.5 py-0.5 rounded">{department}</span>
          </div>
        </div>
      </div>

      {/* WORKSPACE CENTRAL WORKSTATION */}
      <div className="flex-1 overflow-y-auto bg-[#070B13] p-6">
        
        {/* TAB 1: OPERATIONAL DASHBOARD */}
        {activeSubTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white font-sans">Returnable Assets Executive Overview</h1>
                <p className="text-sm text-gray-400">Engineering lifecycle tracking and condition auditing for high-value reusable packaging rigs.</p>
              </div>
              <div className="flex space-x-3">
                <button
                  id="btn-track-asset-top"
                  onClick={() => setIsTrackAssetOpen(true)}
                  className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-gray-100 text-sm font-semibold px-4 py-2 rounded-md border border-slate-700 transition"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Update Location / State</span>
                </button>
                <button
                  id="btn-create-asset-top"
                  onClick={() => setIsCreateAssetOpen(true)}
                  className="flex items-center space-x-2 bg-cyan-500 hover:bg-cyan-400 text-[#070B13] text-sm font-bold px-4 py-2 rounded-md transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Commission New Asset</span>
                </button>
              </div>
            </div>

            {/* KPI GRID CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-[#0C1220] p-4 rounded-lg border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-400 uppercase font-bold tracking-wider block">Total Fleet Assets</span>
                  <span className="text-2xl font-bold text-white font-mono mt-1 block">{assets.length}</span>
                  <span className="text-[10px] text-emerald-400 flex items-center mt-1">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    100% Registered
                  </span>
                </div>
                <div className="p-3 bg-cyan-500/10 rounded-lg text-cyan-400">
                  <Box className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-[#0C1220] p-4 rounded-lg border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-400 uppercase font-bold tracking-wider block">Currently In Service</span>
                  <span className="text-2xl font-bold text-white font-mono mt-1 block">
                    {assets.filter(a => a.lifecycleStatus === 'In Service' || a.lifecycleStatus === 'In Transit' || a.lifecycleStatus === 'At Customer').length}
                  </span>
                  <span className="text-[10px] text-cyan-400 mt-1 block font-mono">
                    Active cycle rotations
                  </span>
                </div>
                <div className="p-3 bg-indigo-500/10 rounded-lg text-indigo-400">
                  <Navigation className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-[#0C1220] p-4 rounded-lg border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-400 uppercase font-bold tracking-wider block">Maintenance & Repairs</span>
                  <span className="text-2xl font-bold text-yellow-500 font-mono mt-1 block">
                    {assets.filter(a => a.lifecycleStatus === 'Maintenance' || a.lifecycleStatus === 'Repair').length}
                  </span>
                  <span className="text-[10px] text-yellow-500 flex items-center mt-1">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Requires mechanical review
                  </span>
                </div>
                <div className="p-3 bg-yellow-500/10 rounded-lg text-yellow-500">
                  <Wrench className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-[#0C1220] p-4 rounded-lg border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-400 uppercase font-bold tracking-wider block">Failed Inspections</span>
                  <span className="text-2xl font-bold text-red-500 font-mono mt-1 block">
                    {assets.filter(a => a.inspectionStatus === 'Failed').length}
                  </span>
                  <span className="text-[10px] text-red-400 mt-1 block">
                    Quarantined / Defective
                  </span>
                </div>
                <div className="p-3 bg-red-500/10 rounded-lg text-red-500">
                  <ShieldCheck className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* HIGH-VALUE RECENT ENGAGEMENT TIMELINE */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-[#0C1220] p-5 rounded-lg border border-slate-800 space-y-4">
                <h3 className="text-sm font-semibold text-white tracking-tight uppercase flex items-center">
                  <Box className="w-4 h-4 mr-2 text-cyan-400" />
                  Asset Performance & Life Cycle Counters
                </h3>
                
                <div className="space-y-4 overflow-y-auto max-h-96">
                  {assets.map(asset => {
                    const pct = Math.round((asset.currentCycleCount / asset.maximumCycleCount) * 100);
                    return (
                      <div key={asset.id} className="p-3 bg-slate-900/50 rounded-lg border border-slate-800 flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs font-bold text-cyan-400">{asset.assetNumber}</span>
                            <span className="text-sm font-semibold text-white">{asset.assetName}</span>
                          </div>
                          <div className="flex items-center space-x-4 text-xs text-gray-400">
                            <span>Type: {asset.assetType}</span>
                            <span>Loc: {asset.currentLocation}</span>
                          </div>
                        </div>

                        <div className="w-48 text-right space-y-1">
                          <div className="flex justify-between text-xs font-mono">
                            <span className="text-gray-400">Cycles: {asset.currentCycleCount}/{asset.maximumCycleCount}</span>
                            <span className={`${pct > 80 ? 'text-red-400' : 'text-emerald-400'}`}>{pct}%</span>
                          </div>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${pct > 80 ? 'bg-red-500' : 'bg-cyan-500'}`}
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* STATS BREAKDOWN */}
              <div className="bg-[#0C1220] p-5 rounded-lg border border-slate-800 space-y-4">
                <h3 className="text-sm font-semibold text-white tracking-tight uppercase flex items-center">
                  <QrCode className="w-4 h-4 mr-2 text-cyan-400" />
                  Fleet Tracking Modes
                </h3>
                
                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800 flex items-center justify-between">
                    <span className="text-gray-300">RFID Heavy Racks</span>
                    <span className="bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded">
                      {assets.filter(a => a.trackingMode === 'RFID').length} units
                    </span>
                  </div>
                  <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800 flex items-center justify-between">
                    <span className="text-gray-300">BLE High-Value Carts</span>
                    <span className="bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded">
                      {assets.filter(a => a.trackingMode === 'BLE Beacon').length} units
                    </span>
                  </div>
                  <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800 flex items-center justify-between">
                    <span className="text-gray-300">QR Code Light Totes</span>
                    <span className="bg-pink-500/10 text-pink-400 px-2 py-0.5 rounded">
                      {assets.filter(a => a.trackingMode === 'QR Code').length} units
                    </span>
                  </div>
                  <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800 flex items-center justify-between">
                    <span className="text-gray-300">GPS / Satellite Tracked</span>
                    <span className="bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded">
                      {assets.filter(a => a.trackingMode === 'GPS Placeholder').length} units
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: REUSABLE ASSETS CATALOG */}
        {activeSubTab === 'assets' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white">Returnable Assets Catalog</h1>
                <p className="text-sm text-gray-400">Engineering specifications, locations, and interactive validation sandbox logs.</p>
              </div>
              <div className="flex space-x-3">
                <button
                  id="btn-track-asset-assets-tab"
                  onClick={() => setIsTrackAssetOpen(true)}
                  className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-gray-100 text-sm font-semibold px-4 py-2 rounded-md border border-slate-700 transition"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Track Asset Movement</span>
                </button>
                <button
                  id="btn-create-asset-assets-tab"
                  onClick={() => setIsCreateAssetOpen(true)}
                  className="flex items-center space-x-2 bg-cyan-500 hover:bg-cyan-400 text-[#070B13] text-sm font-bold px-4 py-2 rounded-md transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Register Asset</span>
                </button>
              </div>
            </div>

            {/* MULTI-VARIABLE SEARCH & FILTER SHEETS */}
            <div className="bg-[#0C1220] p-4 rounded-lg border border-slate-800 flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Query by Asset #, Name, location coordinate, or barcode identifier..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-[#070B13] border border-slate-800 rounded-md pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-400 transition"
                />
              </div>

              <div className="flex gap-2">
                <select
                  value={filterType}
                  onChange={e => setFilterType(e.target.value)}
                  className="bg-[#070B13] border border-slate-800 text-gray-300 text-xs rounded-md px-3 py-2 focus:outline-none focus:border-cyan-400 font-sans"
                >
                  <option value="">All Types</option>
                  <option value="Steel Rack">Steel Rack</option>
                  <option value="Plastic Tote">Plastic Tote</option>
                  <option value="Metal Bin">Metal Bin</option>
                  <option value="Kit Cart">Kit Cart</option>
                  <option value="Pallet">Pallet</option>
                  <option value="Custom Fixture">Custom Fixture</option>
                  <option value="Returnable Crate">Returnable Crate</option>
                </select>

                <select
                  value={filterLifecycle}
                  onChange={e => setFilterLifecycle(e.target.value)}
                  className="bg-[#070B13] border border-slate-800 text-gray-300 text-xs rounded-md px-3 py-2 focus:outline-none focus:border-cyan-400 font-sans"
                >
                  <option value="">All Lifecycles</option>
                  <option value="Designed">Designed</option>
                  <option value="Manufactured">Manufactured</option>
                  <option value="Approved">Approved</option>
                  <option value="Released">Released</option>
                  <option value="In Service">In Service</option>
                  <option value="In Transit">In Transit</option>
                  <option value="At Customer">At Customer</option>
                  <option value="Returned">Returned</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Repair">Repair</option>
                  <option value="Retired">Retired</option>
                </select>

                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  className="bg-[#070B13] border border-slate-800 text-gray-300 text-xs rounded-md px-3 py-2 focus:outline-none focus:border-cyan-400 font-sans"
                >
                  <option value="">All Statuses</option>
                  <option value="Available">Available</option>
                  <option value="Assigned">Assigned</option>
                  <option value="Staged">Staged</option>
                  <option value="Quarantined">Quarantined</option>
                  <option value="Retired">Retired</option>
                </select>
              </div>
            </div>

            {/* SPLIT VIEW WORKSTATION CONTROLS */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              
              {/* LEFT SIDE LIST (4 cols) */}
              <div className="xl:col-span-5 space-y-3 overflow-y-auto max-h-[550px] pr-2">
                {filteredAssets.length === 0 ? (
                  <div className="bg-[#0C1220] p-8 text-center rounded-lg border border-slate-800 text-gray-400">
                    No matching reusable assets in current isolation sandbox.
                  </div>
                ) : (
                  filteredAssets.map(asset => (
                    <div
                      key={asset.id}
                      onClick={() => setSelectedAssetId(asset.id)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all flex justify-between items-start ${
                        selectedAssetId === asset.id
                          ? 'bg-[#121A2E] border-cyan-500/60 shadow-lg'
                          : 'bg-[#0C1220] border-slate-800 hover:bg-slate-900/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-bold text-cyan-400">{asset.assetNumber}</span>
                          <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded uppercase font-bold tracking-wider">{asset.assetType}</span>
                        </div>
                        <h4 className="text-sm font-semibold text-white">{asset.assetName}</h4>
                        <div className="flex items-center text-xs text-gray-400 space-x-3">
                          <span className="flex items-center">
                            <Clock className="w-3.5 h-3.5 mr-1" />
                            {asset.lifecycleStatus}
                          </span>
                          <span>|</span>
                          <span className="font-mono">{asset.currentLocation}</span>
                        </div>
                      </div>

                      <div className="text-right flex flex-col justify-between h-full space-y-4">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                          asset.status === 'Available' ? 'bg-emerald-500/10 text-emerald-400' :
                          asset.status === 'Assigned' ? 'bg-cyan-500/10 text-cyan-400' :
                          asset.status === 'Quarantined' ? 'bg-red-500/10 text-red-400' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {asset.status}
                        </span>
                        
                        <div className="text-[10px] text-gray-400 font-mono">
                          {asset.currentCycleCount}/{asset.maximumCycleCount} Cyc
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* RIGHT SIDE DETAILED WORKSPACE PANEL (7 cols) */}
              <div className="xl:col-span-7 bg-[#0C1220] rounded-lg border border-slate-800 overflow-hidden">
                {selectedAsset ? (
                  <div>
                    {/* Header bar */}
                    <div className="bg-[#121A2E] px-6 py-4 border-b border-slate-800 flex justify-between items-center">
                      <div>
                        <div className="flex items-center space-x-2 text-xs text-cyan-400 font-mono">
                          <span>{selectedAsset.assetNumber}</span>
                          <span>•</span>
                          <span>Owner: {selectedAsset.owner}</span>
                        </div>
                        <h2 className="text-base font-bold text-white mt-1">{selectedAsset.assetName}</h2>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs px-2 py-1 rounded font-mono ${
                          selectedAsset.lifecycleStatus === 'In Service' ? 'bg-emerald-500/15 text-emerald-400' :
                          selectedAsset.lifecycleStatus === 'In Transit' ? 'bg-indigo-500/15 text-indigo-400' :
                          selectedAsset.lifecycleStatus === 'Maintenance' ? 'bg-yellow-500/15 text-yellow-400' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {selectedAsset.lifecycleStatus}
                        </span>
                      </div>
                    </div>

                    {/* Sub-tabs within asset workspace */}
                    <div className="flex border-b border-slate-800 bg-slate-900/60 px-6 font-sans text-xs">
                      <button
                        onClick={() => setWorkspaceSubTab('overview')}
                        className={`py-3 px-4 font-semibold border-b-2 transition-all ${
                          workspaceSubTab === 'overview'
                            ? 'border-cyan-400 text-cyan-400'
                            : 'border-transparent text-gray-400 hover:text-gray-200'
                        }`}
                      >
                        Technical Spec
                      </button>
                      <button
                        onClick={() => setWorkspaceSubTab('timeline')}
                        className={`py-3 px-4 font-semibold border-b-2 transition-all ${
                          workspaceSubTab === 'timeline'
                            ? 'border-cyan-400 text-cyan-400'
                            : 'border-transparent text-gray-400 hover:text-gray-200'
                        }`}
                      >
                        Lifecycle History
                      </button>
                      <button
                        onClick={() => setWorkspaceSubTab('engineering')}
                        className={`py-3 px-4 font-semibold border-b-2 transition-all ${
                          workspaceSubTab === 'engineering'
                            ? 'border-cyan-400 text-cyan-400'
                            : 'border-transparent text-gray-400 hover:text-gray-200'
                        }`}
                      >
                        CAD & BOM Linked
                      </button>
                      <button
                        onClick={() => setWorkspaceSubTab('inspections')}
                        className={`py-3 px-4 font-semibold border-b-2 transition-all ${
                          workspaceSubTab === 'inspections'
                            ? 'border-cyan-400 text-cyan-400'
                            : 'border-transparent text-gray-400 hover:text-gray-200'
                        }`}
                      >
                        Inspections ({returnablesRegistry.getInspections(selectedAsset.id).length})
                      </button>
                      <button
                        onClick={() => setWorkspaceSubTab('maintenance')}
                        className={`py-3 px-4 font-semibold border-b-2 transition-all ${
                          workspaceSubTab === 'maintenance'
                            ? 'border-cyan-400 text-cyan-400'
                            : 'border-transparent text-gray-400 hover:text-gray-200'
                        }`}
                      >
                        Service & Repair ({returnablesRegistry.getMaintenance(selectedAsset.id).length})
                      </button>
                      <button
                        onClick={() => setWorkspaceSubTab('ai')}
                        className={`py-3 px-4 font-semibold border-b-2 transition-all text-purple-400 hover:text-purple-300 flex items-center space-x-1 ${
                          workspaceSubTab === 'ai'
                            ? 'border-purple-400 text-purple-300'
                            : 'border-transparent'
                        }`}
                      >
                        <Brain className="w-3.5 h-3.5" />
                        <span>AI Co-Pilot</span>
                      </button>
                    </div>

                    {/* Content layout sheets based on tabs */}
                    <div className="p-6 overflow-y-auto max-h-[380px]">
                      
                      {/* SUBTAB 1: TECHNICAL SPEC */}
                      {workspaceSubTab === 'overview' && (
                        <div className="space-y-4">
                          <p className="text-sm text-gray-300 font-sans">{selectedAsset.description}</p>
                          <div className="grid grid-cols-2 gap-4 font-sans text-xs">
                            <div className="p-3 bg-slate-900/60 rounded-md border border-slate-800 space-y-1">
                              <span className="text-gray-400 block font-semibold uppercase tracking-wider text-[9px]">Material Matrix</span>
                              <span className="text-white font-medium block">{selectedAsset.material}</span>
                            </div>
                            <div className="p-3 bg-slate-900/60 rounded-md border border-slate-800 space-y-1">
                              <span className="text-gray-400 block font-semibold uppercase tracking-wider text-[9px]">Current Location Coordinate</span>
                              <span className="text-white font-medium block font-mono">{selectedAsset.currentLocation}</span>
                            </div>
                            <div className="p-3 bg-slate-900/60 rounded-md border border-slate-800 space-y-1">
                              <span className="text-gray-400 block font-semibold uppercase tracking-wider text-[9px]">Tracking Mode / Identifier</span>
                              <span className="text-cyan-400 font-bold block font-mono">{selectedAsset.trackingMode}: {selectedAsset.trackingIdentifier}</span>
                            </div>
                            <div className="p-3 bg-slate-900/60 rounded-md border border-slate-800 space-y-1">
                              <span className="text-gray-400 block font-semibold uppercase tracking-wider text-[9px]">Commission Date</span>
                              <span className="text-white font-medium block">{selectedAsset.commissionDate}</span>
                            </div>
                          </div>

                          <div className="p-4 bg-slate-900/40 rounded-lg border border-slate-800 flex items-center justify-between text-xs font-sans">
                            <div>
                              <span className="text-gray-300 font-medium block">Inspection Standing</span>
                              <span className={`text-[11px] font-bold block mt-1 uppercase ${
                                selectedAsset.inspectionStatus === 'Passed' ? 'text-emerald-400' :
                                selectedAsset.inspectionStatus === 'Pending' ? 'text-cyan-400' : 'text-red-500'
                              }`}>{selectedAsset.inspectionStatus}</span>
                            </div>
                            <div>
                              <span className="text-gray-300 font-medium block">Mechanical Quality</span>
                              <span className={`text-[11px] font-bold block mt-1 uppercase ${
                                selectedAsset.repairStatus === 'Operational' ? 'text-emerald-400' : 'text-yellow-500'
                              }`}>{selectedAsset.repairStatus}</span>
                            </div>
                            <div>
                              <span className="text-gray-300 font-medium block">Revision Log</span>
                              <span className="text-white font-mono block mt-1">v{selectedAsset.revision}.0</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* SUBTAB 2: LIFECYCLE HISTORY */}
                      {workspaceSubTab === 'timeline' && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                            <h3 className="text-xs uppercase font-bold text-gray-400">Chronological Location Registry</h3>
                            <button
                              id="btn-track-asset-history-subtab"
                              onClick={() => {
                                setTrackAssetId(selectedAsset.id);
                                setIsTrackAssetOpen(true);
                              }}
                              className="text-xs text-cyan-400 hover:underline flex items-center font-sans font-semibold"
                            >
                              <Plus className="w-3 h-3 mr-1" /> Update Telemetry
                            </button>
                          </div>

                          <div className="relative pl-6 border-l-2 border-slate-800 space-y-6">
                            {returnablesRegistry.getLocationHistory(selectedAsset.id).map(lh => (
                              <div key={lh.id} className="relative">
                                {/* bullet dot */}
                                <div className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-cyan-400 border border-[#070B13]"></div>
                                
                                <div className="space-y-1 font-sans text-xs">
                                  <div className="flex items-center justify-between text-gray-400">
                                    <span className="font-mono">{new Date(lh.timestamp).toLocaleString()}</span>
                                    <span className="text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded font-mono text-[10px] uppercase font-bold">{lh.stateTransition}</span>
                                  </div>
                                  <h4 className="font-semibold text-white">{lh.location}</h4>
                                  <p className="text-gray-400">{lh.comments}</p>
                                  <div className="text-[10px] text-gray-500">Logger: {lh.updatedBy}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* SUBTAB 3: CAD & BOM LINKED */}
                      {workspaceSubTab === 'engineering' && (
                        <div className="space-y-4 font-sans text-xs">
                          <div className="p-3 bg-slate-900/60 rounded-md border border-slate-800">
                            <span className="text-gray-400 font-semibold block uppercase tracking-wider text-[9px]">Linked CAD Engineering Drawing</span>
                            <span className="text-white font-medium text-sm font-mono mt-1 block">{selectedAsset.engineeringAsset}</span>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-slate-900/60 rounded-md border border-slate-800">
                              <span className="text-gray-400 font-semibold block uppercase tracking-wider text-[9px]">Active Packaging Project</span>
                              <span className="text-white font-medium block mt-1">{selectedAsset.project.name}</span>
                            </div>
                            <div className="p-3 bg-slate-900/60 rounded-md border border-slate-800">
                              <span className="text-gray-400 font-semibold block uppercase tracking-wider text-[9px]">Linked Client CRM</span>
                              <span className="text-white font-medium block mt-1">{selectedAsset.customer.name}</span>
                            </div>
                          </div>

                          <div className="border border-slate-800 rounded-lg overflow-hidden space-y-2">
                            <div className="bg-slate-900/80 px-4 py-2 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                              Materials Specification Matrix
                            </div>
                            <div className="p-3 space-y-2">
                              <div className="flex justify-between">
                                <span className="text-gray-300">Target Envelope Material:</span>
                                <span className="text-white font-semibold font-mono">{selectedAsset.material}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-300">Primary Mechanical Design:</span>
                                <span className="text-cyan-400 font-bold font-mono">{selectedAsset.packagingDesign.designNumber}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-300">Draft Revision:</span>
                                <span className="text-white font-mono">Rev-{selectedAsset.revision}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* SUBTAB 4: INSPECTIONS LIST */}
                      {workspaceSubTab === 'inspections' && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                            <h3 className="text-xs uppercase font-bold text-gray-400">Quality Inspection Logs</h3>
                            <button
                              id="btn-add-inspection"
                              onClick={() => setIsAddInspectionOpen(true)}
                              className="text-xs text-cyan-400 hover:underline flex items-center font-sans font-semibold"
                            >
                              <Plus className="w-3 h-3 mr-1" /> Log Audit Report
                            </button>
                          </div>

                          <div className="space-y-3">
                            {returnablesRegistry.getInspections(selectedAsset.id).length === 0 ? (
                              <p className="text-center py-6 text-gray-500 text-xs">No mechanical quality inspections on file for this asset.</p>
                            ) : (
                              returnablesRegistry.getInspections(selectedAsset.id).map(insp => (
                                <div key={insp.id} className="p-3 bg-slate-900/60 rounded-md border border-slate-800 space-y-2 font-sans text-xs">
                                  <div className="flex justify-between text-gray-400 font-mono">
                                    <span>Date: {insp.inspectionDate}</span>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                      insp.recommendations === 'Pass' ? 'bg-emerald-500/10 text-emerald-400' :
                                      insp.recommendations === 'Quarantine' ? 'bg-red-500/10 text-red-400' : 'bg-yellow-500/10 text-yellow-500'
                                    }`}>
                                      {insp.recommendations}
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-300">
                                    <span>Inspector: <strong className="text-white">{insp.inspector}</strong></span>
                                    <span>Damage Limit: <strong className="text-white">{insp.damageLevel}</strong></span>
                                  </div>

                                  <p className="text-gray-400 leading-relaxed italic">"{insp.comments}"</p>
                                  <div className="text-[10px] text-gray-500 flex justify-between font-mono">
                                    <span>Audit Snap: {insp.photosPlaceholder}</span>
                                    <span>Next Audit Due: {insp.nextInspectionDate}</span>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}

                      {/* SUBTAB 5: MAINTENANCE LIST */}
                      {workspaceSubTab === 'maintenance' && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                            <h3 className="text-xs uppercase font-bold text-gray-400">Service Maintenance Sheets</h3>
                            <button
                              id="btn-add-maintenance"
                              onClick={() => setIsAddMaintenanceOpen(true)}
                              className="text-xs text-cyan-400 hover:underline flex items-center font-sans font-semibold"
                            >
                              <Plus className="w-3 h-3 mr-1" /> Add Service Card
                            </button>
                          </div>

                          <div className="space-y-3">
                            {returnablesRegistry.getMaintenance(selectedAsset.id).length === 0 ? (
                              <p className="text-center py-6 text-gray-500 text-xs">No maintenance or structural repair history logged for this rig.</p>
                            ) : (
                              returnablesRegistry.getMaintenance(selectedAsset.id).map(m => (
                                <div key={m.id} className="p-3 bg-slate-900/60 rounded-md border border-slate-800 space-y-2 font-sans text-xs">
                                  <div className="flex justify-between text-gray-400 font-mono">
                                    <span className="font-bold text-slate-300">{m.recordType} Procedure</span>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                      m.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-500'
                                    }`}>
                                      {m.status}
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-300">
                                    <span>Technician: <strong className="text-white">{m.technician}</strong></span>
                                    <span>Procedure Cost: <strong className="text-white">${m.costPlaceholder}</strong></span>
                                  </div>

                                  {m.replacementParts.length > 0 && (
                                    <div className="text-[10px] bg-slate-800/40 p-2 rounded border border-slate-800">
                                      <span className="text-gray-400 uppercase tracking-wider block font-bold text-[8px] mb-1">Replacement Components Replaced</span>
                                      <div className="flex flex-wrap gap-1">
                                        {m.replacementParts.map((p, i) => (
                                          <span key={i} className="bg-slate-800 text-gray-300 px-1.5 py-0.5 rounded font-mono text-[9px]">{p}</span>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  <p className="text-gray-400 italic">"{m.comments}"</p>
                                  <div className="text-[10px] text-gray-500 font-mono text-right">
                                    Assoc Revision: Rev-{m.revision}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}

                      {/* SUBTAB 6: AI CO-PILOT SANDBOX */}
                      {workspaceSubTab === 'ai' && (
                        <div className="space-y-4">
                          <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20 flex items-center space-x-3 text-xs text-purple-300 font-sans">
                            <Sparkles className="w-5 h-5 text-purple-400" />
                            <div>
                              <strong className="block text-white">Engineering Decision Context Grounding active</strong>
                              Standard context parsed from returnables registry. Evaluates lifecycle failure metrics against ASTM D6199 wood pallet alternatives and ISTA transit standards.
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block font-sans">Ask technical AI Co-pilot:</label>
                            <div className="flex space-x-2">
                              <input
                                type="text"
                                value={aiPrompt}
                                onChange={e => setAiPrompt(e.target.value)}
                                className="flex-1 bg-[#070B13] border border-slate-800 rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400 font-sans"
                              />
                              <button
                                onClick={handleAIQuery}
                                disabled={aiIsThinking}
                                className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-4 py-2 rounded-md transition disabled:opacity-50"
                              >
                                {aiIsThinking ? 'Analyzing...' : 'Execute'}
                              </button>
                            </div>
                          </div>

                          {aiResponse && (
                            <div className="p-4 bg-slate-900 rounded-lg border border-slate-800 max-h-56 overflow-y-auto">
                              <pre className="text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-wrap">{aiResponse}</pre>
                            </div>
                          )}
                        </div>
                      )}

                    </div>
                  </div>
                ) : (
                  <div className="p-12 text-center text-gray-400">
                    Select a packaging asset from the directory list to examine its detailed engineering workstation.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SAFETY INSPECTIONS CENTRAL DESK */}
        {activeSubTab === 'inspections' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white">Safety Inspections central desk</h1>
                <p className="text-sm text-gray-400">Complete fleet quality inspections logs sorted by timestamp.</p>
              </div>
            </div>

            <div className="bg-[#0C1220] rounded-lg border border-slate-800 overflow-hidden font-sans">
              <div className="bg-slate-900 px-6 py-3 border-b border-slate-800 grid grid-cols-12 text-xs font-bold uppercase text-gray-400 tracking-wider">
                <span className="col-span-2">Asset ID</span>
                <span className="col-span-2">Inspector</span>
                <span className="col-span-2">Date Completed</span>
                <span className="col-span-2">Condition</span>
                <span className="col-span-2">Recommendation</span>
                <span className="col-span-2 text-right">Next Due</span>
              </div>

              <div className="divide-y divide-slate-800 text-xs">
                {assets.map(a => {
                  const insps = returnablesRegistry.getInspections(a.id);
                  if (insps.length === 0) return null;
                  return insps.map(insp => (
                    <div key={insp.id} className="px-6 py-4 grid grid-cols-12 text-gray-300 hover:bg-slate-900/40">
                      <span className="col-span-2 font-mono font-bold text-cyan-400">{a.assetNumber}</span>
                      <span className="col-span-2 text-white">{insp.inspector}</span>
                      <span className="col-span-2 font-mono">{insp.inspectionDate}</span>
                      <span className="col-span-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                          insp.condition === 'Excellent' || insp.condition === 'Good' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                        }`}>
                          {insp.condition}
                        </span>
                      </span>
                      <span className="col-span-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                          insp.recommendations === 'Pass' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-500'
                        }`}>
                          {insp.recommendations}
                        </span>
                      </span>
                      <span className="col-span-2 text-right font-mono text-gray-400">{insp.nextInspectionDate}</span>
                    </div>
                  ));
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: MAINTENANCE REGISTRY SHEET */}
        {activeSubTab === 'maintenance' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white">Mechanical Maintenance Registry</h1>
                <p className="text-sm text-gray-400">Log of repair procedures, technical revisions, and estimated maintenance budgets.</p>
              </div>
            </div>

            <div className="bg-[#0C1220] rounded-lg border border-slate-800 overflow-hidden font-sans">
              <div className="bg-slate-900 px-6 py-3 border-b border-slate-800 grid grid-cols-12 text-xs font-bold uppercase text-gray-400 tracking-wider">
                <span className="col-span-2">Asset #</span>
                <span className="col-span-2">Type</span>
                <span className="col-span-2">Technician</span>
                <span className="col-span-2">Scheduled Date</span>
                <span className="col-span-2">Parts Cost</span>
                <span className="col-span-2">Status</span>
                <span className="col-span-2 text-right">Parts Exchanged</span>
              </div>

              <div className="divide-y divide-slate-800 text-xs">
                {assets.map(a => {
                  const maintList = returnablesRegistry.getMaintenance(a.id);
                  if (maintList.length === 0) return null;
                  return maintList.map(m => (
                    <div key={m.id} className="px-6 py-4 grid grid-cols-12 text-gray-300 hover:bg-slate-900/40 align-middle">
                      <span className="col-span-2 font-mono font-bold text-cyan-400">{a.assetNumber}</span>
                      <span className="col-span-2 text-white font-medium">{m.recordType}</span>
                      <span className="col-span-2">{m.technician}</span>
                      <span className="col-span-2 font-mono">{m.scheduledDate}</span>
                      <span className="col-span-2 font-mono font-bold text-slate-100">${m.costPlaceholder}</span>
                      <span className="col-span-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase ${
                          m.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-500'
                        }`}>
                          {m.status}
                        </span>
                      </span>
                      <span className="col-span-2 text-right font-mono text-gray-400 truncate">
                        {m.replacementParts.join(', ') || 'None'}
                      </span>
                    </div>
                  ));
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: STATE AUDIT LOGS */}
        {activeSubTab === 'audit' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white">Security Compliance Audit Trail</h1>
                <p className="text-sm text-gray-400">Full tamper-evident compliance logs recording physical tracking triggers, inspection overrides, and registrations.</p>
              </div>
            </div>

            <div className="bg-[#0C1220] rounded-lg border border-slate-800 overflow-hidden font-sans">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900 text-gray-400 uppercase tracking-wider font-bold border-b border-slate-800">
                    <th className="px-6 py-3">Timestamp</th>
                    <th className="px-6 py-3">User Role</th>
                    <th className="px-6 py-3">Action Class</th>
                    <th className="px-6 py-3">Audit Details</th>
                    <th className="px-6 py-3 text-right">Target Asset ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-gray-300 font-mono">
                  {auditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-900/40">
                      <td className="px-6 py-4 text-gray-400">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="px-6 py-4 text-cyan-400">{log.userRole}</td>
                      <td className="px-6 py-4">
                        <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded uppercase font-bold text-[10px]">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-sans text-white">{log.details}</td>
                      <td className="px-6 py-4 text-right text-gray-400 font-bold">{log.targetId}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* --- CREATE REUSABLE ASSET DIALOG MODAL --- */}
      {isCreateAssetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#0C1220] border border-slate-800 rounded-lg shadow-2xl overflow-hidden text-gray-100 font-sans">
            <div className="bg-slate-900/80 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
              <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-400">Commission Returnable Packaging Asset</h2>
              <button onClick={() => setIsCreateAssetOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleCreateAsset} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Asset Name Identifier *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SpaceX Avionics Box Steel Rack"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="w-full bg-[#070B13] border border-slate-800 rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Asset Type *</label>
                  <select
                    value={newType}
                    onChange={e => setNewType(e.target.value as AssetType)}
                    className="w-full bg-[#070B13] border border-slate-800 rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Steel Rack">Steel Rack</option>
                    <option value="Plastic Tote">Plastic Tote</option>
                    <option value="Metal Bin">Metal Bin</option>
                    <option value="Kit Cart">Kit Cart</option>
                    <option value="Pallet">Pallet</option>
                    <option value="Custom Fixture">Custom Fixture</option>
                    <option value="Returnable Crate">Returnable Crate</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Link to Packaging Design Studio Node *</label>
                <select
                  required
                  value={selectedDesignId}
                  onChange={e => setSelectedDesignId(e.target.value)}
                  className="w-full bg-[#070B13] border border-slate-800 rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="">Select Packaging Design Layout...</option>
                  {packagingRegistry.getDesigns().map(d => (
                    <option key={d.id} value={d.id}>
                      {d.designNumber} - {d.designName} ({d.customer.name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Primary Structural Material</label>
                  <input
                    type="text"
                    value={newMaterial}
                    onChange={e => setNewMaterial(e.target.value)}
                    className="w-full bg-[#070B13] border border-slate-800 rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Facility Location Coordinate</label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={e => setNewLocation(e.target.value)}
                    className="w-full bg-[#070B13] border border-slate-800 rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Assigned Logistics Manager</label>
                  <input
                    type="text"
                    value={newOwner}
                    onChange={e => setNewOwner(e.target.value)}
                    className="w-full bg-[#070B13] border border-slate-800 rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Expected Lifetime Cycles</label>
                  <input
                    type="number"
                    value={newLifeCycles}
                    onChange={e => setNewLifeCycles(Number(e.target.value))}
                    className="w-full bg-[#070B13] border border-slate-800 rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Tracking Mode</label>
                  <select
                    value={newTrackingMode}
                    onChange={e => setNewTrackingMode(e.target.value as TrackingMode)}
                    className="w-full bg-[#070B13] border border-slate-800 rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="RFID">RFID</option>
                    <option value="BLE Beacon">BLE Beacon</option>
                    <option value="QR Code">QR Code</option>
                    <option value="Barcode">Barcode</option>
                    <option value="GPS Placeholder">GPS Satellite</option>
                    <option value="Manual Tracking">Manual Sheet</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Tracking Tag Identifier *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. RFID-HEX-49221C"
                    value={newTrackingIdentifier}
                    onChange={e => setNewTrackingIdentifier(e.target.value)}
                    className="w-full bg-[#070B13] border border-slate-800 rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Asset Description & Usage Bounds</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  className="w-full bg-[#070B13] border border-slate-800 rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                  placeholder="Explain structural loads, limitations, or testing limits..."
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCreateAssetOpen(false)}
                  className="bg-slate-800 hover:bg-slate-750 text-white text-xs font-semibold px-4 py-2 rounded transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-cyan-500 hover:bg-cyan-400 text-[#070B13] text-xs font-bold px-4 py-2 rounded transition"
                >
                  Confirm Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- UPDATE TRACKING TELEMETRY DIALOG MODAL --- */}
      {isTrackAssetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-[#0C1220] border border-slate-800 rounded-lg shadow-2xl overflow-hidden text-gray-100 font-sans">
            <div className="bg-slate-900/80 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
              <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-400 flex items-center">
                <Navigation className="w-4 h-4 mr-2" /> Update Telemetry Location
              </h2>
              <button onClick={() => setIsTrackAssetOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleTrackAsset} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Select Target Fleet Asset</label>
                <select
                  required
                  value={trackAssetId}
                  onChange={e => setTrackAssetId(e.target.value)}
                  className="w-full bg-[#070B13] border border-slate-800 rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                >
                  <option value="">Choose Asset...</option>
                  {assets.map(a => (
                    <option key={a.id} value={a.id}>{a.assetNumber} - {a.assetName}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Physical Facility Location Coordinate</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Austin Giga-Bay 4 Loading Zone 2"
                  value={trackLocation}
                  onChange={e => setTrackLocation(e.target.value)}
                  className="w-full bg-[#070B13] border border-slate-800 rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Transition Lifecycle State</label>
                <select
                  value={trackLifecycle}
                  onChange={e => setTrackLifecycle(e.target.value as AssetLifecycleState)}
                  className="w-full bg-[#070B13] border border-slate-800 rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-sans"
                >
                  <option value="Released">Released (Cleared for Service)</option>
                  <option value="In Transit">In Transit (Shipping)</option>
                  <option value="At Customer">At Customer (Delivered)</option>
                  <option value="Returned">Returned (Arrived at Dock, Cycle counter +1)</option>
                  <option value="Maintenance">Maintenance (Review Stacking)</option>
                  <option value="Repair">Repair (Active Refurbish)</option>
                  <option value="Retired">Retired (De-commissioned)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Telemetry Registry Notes</label>
                <textarea
                  rows={2}
                  value={trackComments}
                  onChange={e => setTrackComments(e.target.value)}
                  className="w-full bg-[#070B13] border border-slate-800 rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                  placeholder="e.g. Scanning RFID tag complete via Gateway RX-8..."
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsTrackAssetOpen(false)}
                  className="bg-slate-800 hover:bg-slate-750 text-white text-xs font-semibold px-4 py-2 rounded transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-cyan-500 hover:bg-cyan-400 text-[#070B13] text-xs font-bold px-4 py-2 rounded transition"
                >
                  Publish Telemetry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ADD INSPECTION RECORD MODAL --- */}
      {isAddInspectionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-[#0C1220] border border-slate-800 rounded-lg shadow-2xl overflow-hidden text-gray-100 font-sans">
            <div className="bg-slate-900/80 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
              <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-400 flex items-center">
                <ShieldCheck className="w-4 h-4 mr-2" /> Log Asset Inspection
              </h2>
              <button onClick={() => setIsAddInspectionOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddInspection} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Inspector Name</label>
                  <input
                    type="text"
                    required
                    value={inspInspector}
                    onChange={e => setInspInspector(e.target.value)}
                    className="w-full bg-[#070B13] border border-slate-800 rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Asset Condition</label>
                  <select
                    value={inspCondition}
                    onChange={e => setInspCondition(e.target.value as any)}
                    className="w-full bg-[#070B13] border border-slate-800 rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Damaged">Damaged (Faulty)</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Damage Severity</label>
                  <select
                    value={inspDamage}
                    onChange={e => setInspDamage(e.target.value as any)}
                    className="w-full bg-[#070B13] border border-slate-800 rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="None">None</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Structural">Structural Failure</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Recommendation</label>
                  <select
                    value={inspRecommendations}
                    onChange={e => setInspRecommendations(e.target.value as any)}
                    className="w-full bg-[#070B13] border border-slate-800 rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Pass">Pass (Released)</option>
                    <option value="Monitor">Monitor State</option>
                    <option value="Schedule Repair">Schedule Repair</option>
                    <option value="Quarantine">Quarantine Asset</option>
                    <option value="Scrap">Scrap</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Inspection Comments & Stress Reviews</label>
                <textarea
                  rows={3}
                  required
                  value={inspComments}
                  onChange={e => setInspComments(e.target.value)}
                  className="w-full bg-[#070B13] border border-slate-800 rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                  placeholder="Analyze base composite structures, weld spots, casing cracks, caster tracking, etc..."
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddInspectionOpen(false)}
                  className="bg-slate-800 hover:bg-slate-755 text-white text-xs font-semibold px-4 py-2 rounded transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-cyan-500 hover:bg-cyan-400 text-[#070B13] text-xs font-bold px-4 py-2 rounded transition"
                >
                  Publish Audit Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ADD MAINTENANCE RECORD MODAL --- */}
      {isAddMaintenanceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-[#0C1220] border border-slate-800 rounded-lg shadow-2xl overflow-hidden text-gray-100 font-sans">
            <div className="bg-slate-900/80 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
              <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-400 flex items-center">
                <Wrench className="w-4 h-4 mr-2" /> Log Maintenance Card
              </h2>
              <button onClick={() => setIsAddMaintenanceOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMaintenance} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Record Type</label>
                  <select
                    value={maintType}
                    onChange={e => setMaintType(e.target.value as any)}
                    className="w-full bg-[#070B13] border border-slate-800 rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Routine">Routine Service</option>
                    <option value="Repair">Structural Repair</option>
                    <option value="Refurbishment">Refurbishment</option>
                    <option value="Calibration">Sensor Calibration</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Lead Technician</label>
                  <input
                    type="text"
                    required
                    value={maintTech}
                    onChange={e => setMaintTech(e.target.value)}
                    className="w-full bg-[#070B13] border border-slate-800 rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Repair Cost Placeholder ($)</label>
                  <input
                    type="number"
                    required
                    value={maintCost}
                    onChange={e => setMaintCost(Number(e.target.value))}
                    className="w-full bg-[#070B13] border border-slate-800 rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Procedure Status</label>
                  <select
                    value={maintStatus}
                    onChange={e => setMaintStatus(e.target.value as any)}
                    className="w-full bg-[#070B13] border border-slate-800 rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Completed">Completed (Ready for service)</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Deferred">Deferred</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Replacement Components Exchanged</label>
                <input
                  type="text"
                  placeholder="e.g. Swivel caster, Damping springs, structural bolt (comma separated)"
                  value={maintParts}
                  onChange={e => setMaintParts(e.target.value)}
                  className="w-full bg-[#070B13] border border-slate-800 rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Maintenance Comments</label>
                <textarea
                  rows={2}
                  required
                  value={maintComments}
                  onChange={e => setMaintComments(e.target.value)}
                  className="w-full bg-[#070B13] border border-[#1E293B] rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                  placeholder="Specify parts welded, bolts tensioned, ESD checks executed, etc..."
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddMaintenanceOpen(false)}
                  className="bg-slate-800 hover:bg-slate-750 text-white text-xs font-semibold px-4 py-2 rounded transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-cyan-500 hover:bg-cyan-400 text-[#070B13] text-xs font-bold px-4 py-2 rounded transition"
                >
                  Submit Maintenance Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

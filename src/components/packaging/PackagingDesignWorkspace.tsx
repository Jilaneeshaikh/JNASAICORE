import React, { useState, useEffect } from 'react';
import { 
  PackagingDesign, 
  PackagingMaterial, 
  PackagingComponent, 
  DesignCategory, 
  DesignLifecycleStatus, 
  PackagingRole 
} from '../../backend/packaging/types';
import { packagingRegistry } from '../../backend/packaging/registry';
import { 
  Search, 
  Filter, 
  Plus, 
  Layers, 
  Box, 
  GitCommit, 
  FileText, 
  ShieldCheck, 
  Activity, 
  Tag, 
  Bookmark, 
  BookmarkCheck, 
  Cpu, 
  HelpCircle, 
  ExternalLink, 
  Sparkles, 
  Send, 
  AlertCircle,
  FileCheck2,
  ListCollapse,
  Wrench,
  Trash2,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { eventBus } from '../../core';

interface PackagingDesignWorkspaceProps {
  designs: PackagingDesign[];
  materials: PackagingMaterial[];
  components: PackagingComponent[];
  role: PackagingRole;
  department: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onRefresh: () => void;
}

export const PackagingDesignWorkspace: React.FC<PackagingDesignWorkspaceProps> = ({
  designs,
  materials,
  components,
  role,
  department,
  searchQuery,
  setSearchQuery,
  onRefresh
}) => {
  const [selectedDesignId, setSelectedDesignId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isPromoteOpen, setIsPromoteOpen] = useState(false);
  const [isLinkMaterialOpen, setIsLinkMaterialOpen] = useState(false);
  const [isAddComponentOpen, setIsAddComponentOpen] = useState(false);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedLifecycle, setSelectedLifecycle] = useState<string>('');
  const [selectedApproval, setSelectedApproval] = useState<string>('');
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  // Form states
  const [newDesignName, setNewDesignName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCustomer, setNewCustomer] = useState('NASA Glenn Research Center');
  const [newProject, setNewProject] = useState('Propulsion Assembly Project');
  const [newCategory, setNewCategory] = useState<DesignCategory>('Steel Rack');
  const [newType, setNewType] = useState('Rack');
  const [newAsset, setNewAsset] = useState('');
  
  // Promote Revision states
  const [promoteNotes, setPromoteNotes] = useState('');

  // Link Material State
  const [linkMatId, setLinkMatId] = useState('');

  // Add Component State
  const [addComponentId, setAddComponentId] = useState('');
  const [addComponentQty, setAddComponentQty] = useState(1);

  // AI Assistant Chat State
  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'system' | 'ai'; text: string; time: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [aiIsTyping, setAiIsTyping] = useState(false);

  // Lookups
  const selectedDesign = designs.find(d => d.id === selectedDesignId);

  // Seed default chat messages when design changes
  useEffect(() => {
    if (selectedDesign) {
      setChatMessages([
        {
          sender: 'system',
          text: `AI Context initialized for Design: ${selectedDesign.designNumber} - ${selectedDesign.designName}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        {
          sender: 'ai',
          text: `Greetings Chief Engineer. I have compiled the structured context fabric for design ${selectedDesign.designNumber}. You can query physical specs, BOM components, connected compliance materials, or risk parameters. How can I assist your review today?`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } else {
      setChatMessages([
        {
          sender: 'ai',
          text: `Welcome to the Enterprise AI Co-Pilot. Select a packaging design from the registry to mount its full context, or query general materials and standards.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [selectedDesignId]);

  // Command center listeners
  useEffect(() => {
    const handleCreateDesign = () => {
      setIsCreateOpen(true);
    };
    const handleSearchDesigns = () => {
      setSearchQuery('');
    };
    const handleFavDesigns = () => {
      setOnlyFavorites(true);
    };

    window.addEventListener('jnas-trigger-create-design', handleCreateDesign);
    window.addEventListener('jnas-trigger-search-designs', handleSearchDesigns);
    window.addEventListener('jnas-trigger-fav-designs', handleFavDesigns);

    return () => {
      window.removeEventListener('jnas-trigger-create-design', handleCreateDesign);
      window.removeEventListener('jnas-trigger-search-designs', handleSearchDesigns);
      window.removeEventListener('jnas-trigger-fav-designs', handleFavDesigns);
    };
  }, []);

  // Filter application
  const filteredDesigns = designs.filter(d => {
    const matchesSearch = 
      d.designName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.designNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.packagingEngineer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.lifecycleStatus.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory ? d.category === selectedCategory : true;
    const matchesLifecycle = selectedLifecycle ? d.lifecycleStatus === selectedLifecycle : true;
    const matchesApproval = selectedApproval ? d.approvalStatus === selectedApproval : true;
    const matchesFav = onlyFavorites ? packagingRegistry.isDesignFavorite(d.id) : true;

    return matchesSearch && matchesCategory && matchesLifecycle && matchesApproval && matchesFav;
  });

  // Categories & statuses list for filters
  const categories: DesignCategory[] = [
    'Steel Rack', 'Returnable Rack', 'Kit Cart', 'Pallet', 
    'Plastic Tote', 'Wooden Crate', 'Corrugated Box', 'Foam Packaging', 
    'Export Packaging', 'Domestic Packaging', 'Custom Packaging'
  ];

  const lifecycles: DesignLifecycleStatus[] = [
    'Draft', 'In Review', 'Approved', 'Released', 'Obsolete', 'Archived', 'Future Manufacturing Release'
  ];

  // Handlers
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesignName || !newDescription) return;

    const customerObj = newCustomer === 'NASA Glenn Research Center' 
      ? { id: 'cust-nasa-01', name: 'NASA Glenn Research Center' }
      : newCustomer === 'SpaceX Falcon Core Group'
      ? { id: 'cust-spacex-02', name: 'SpaceX Falcon Core Group' }
      : { id: 'cust-blue-03', name: 'Blue Origin New Glenn Systems' };

    const projectObj = newProject === 'Propulsion Assembly Project'
      ? { id: 'proj-prop-01', name: 'Propulsion Assembly Project' }
      : newProject === 'Avionics Flight Hardware'
      ? { id: 'proj-avion-02', name: 'Avionics Flight Hardware' }
      : { id: 'proj-gimbal-03', name: 'Gimbal Vector Controls' };

    packagingRegistry.createDesign({
      designName: newDesignName,
      description: newDescription,
      customer: customerObj,
      project: projectObj,
      category: newCategory,
      packagingType: newType as any,
      lifecycleStatus: 'Draft',
      approvalStatus: 'Pending',
      packagingEngineer: 'Alex Mercer',
      owner: role === 'Engineering Manager' ? 'Elena Rostova' : 'Alex Mercer',
      engineeringAsset: newAsset || 'N/A',
      bom: [],
      materials: [],
      knowledgeLinks: [],
      memoryLinks: [],
      documents: []
    });

    setNewDesignName('');
    setNewDescription('');
    setNewAsset('');
    setIsCreateOpen(false);
    onRefresh();
  };

  const handlePromoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDesignId || !promoteNotes) return;

    packagingRegistry.promoteDesignRevision(selectedDesignId, promoteNotes);
    setPromoteNotes('');
    setIsPromoteOpen(false);
    onRefresh();
  };

  const handleLinkMaterialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDesignId || !linkMatId) return;

    const design = packagingRegistry.getDesignById(selectedDesignId);
    if (design) {
      const currentMats = design.materials || [];
      if (!currentMats.includes(linkMatId)) {
        const mat = materials.find(m => m.id === linkMatId);
        const updatedMats = [...currentMats, linkMatId];
        const updatedActivities = [
          {
            id: `act-${Date.now()}`,
            timestamp: new Date().toISOString(),
            user: 'jilaneeshaikh@gmail.com',
            action: 'Material Linked',
            details: `Linked material ${mat ? mat.code : linkMatId} to design specifications.`
          },
          ...design.activities
        ];
        packagingRegistry.updateDesign(selectedDesignId, { 
          materials: updatedMats,
          activities: updatedActivities
        });
      }
    }

    setLinkMatId('');
    setIsLinkMaterialOpen(false);
    onRefresh();
  };

  const handleAddComponentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDesignId || !addComponentId) return;

    const design = packagingRegistry.getDesignById(selectedDesignId);
    if (design) {
      const comp = components.find(c => c.id === addComponentId);
      if (comp) {
        const currentBOM = design.bom || [];
        const existingIdx = currentBOM.findIndex(item => item.componentId === addComponentId);
        
        let updatedBOM = [...currentBOM];
        if (existingIdx > -1) {
          updatedBOM[existingIdx].quantity += addComponentQty;
        } else {
          updatedBOM.push({
            componentId: comp.id,
            code: comp.code,
            name: comp.name,
            quantity: addComponentQty
          });
        }

        const updatedActivities = [
          {
            id: `act-${Date.now()}`,
            timestamp: new Date().toISOString(),
            user: 'jilaneeshaikh@gmail.com',
            action: 'BOM Item Added',
            details: `Added component ${comp.code} (Qty: ${addComponentQty}) to Bill of Materials.`
          },
          ...design.activities
        ];

        packagingRegistry.updateDesign(selectedDesignId, {
          bom: updatedBOM,
          activities: updatedActivities
        });
      }
    }

    setAddComponentId('');
    setAddComponentQty(1);
    setIsAddComponentOpen(false);
    onRefresh();
  };

  const handleApproveDesign = () => {
    if (!selectedDesignId) return;
    const design = packagingRegistry.getDesignById(selectedDesignId);
    if (design) {
      const updatedActivities = [
        {
          id: `act-${Date.now()}`,
          timestamp: new Date().toISOString(),
          user: 'jilaneeshaikh@gmail.com',
          action: 'Design Released',
          details: `Design status elevated from Draft/Approved to Released for active manufacturing.`
        },
        ...design.activities
      ];
      packagingRegistry.updateDesign(selectedDesignId, {
        lifecycleStatus: 'Released',
        approvalStatus: 'Approved',
        activities: updatedActivities,
        auditMetadata: {
          ...design.auditMetadata,
          approvedBy: 'jilaneeshaikh@gmail.com',
          lastAuditedAt: new Date().toISOString()
        }
      });
      onRefresh();
    }
  };

  const handleDeleteDesign = (id: string) => {
    if (window.confirm('Are you absolutely sure you want to delete this design? This will permanently remove its collaboration records.')) {
      packagingRegistry.deleteDesign(id);
      setSelectedDesignId(null);
      onRefresh();
    }
  };

  // AI assistant messaging logic
  const handleSendChatMessage = () => {
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatMessages(prev => [
      ...prev,
      {
        sender: 'user',
        text: userMsg,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setChatInput('');
    setAiIsTyping(true);

    setTimeout(() => {
      let replyText = '';
      if (!selectedDesign) {
        replyText = `Please select a specific design in the list first to feed its structured context sheet (BOM, materials, revision logs) into my cognitive module.`;
      } else {
        const query = userMsg.toLowerCase();
        if (query.includes('bom') || query.includes('component') || query.includes('part')) {
          const bomList = selectedDesign.bom.map(item => `- ${item.name} (${item.code}) x${item.quantity}`).join('\n');
          replyText = `### Current Bill of Materials (BOM):\n\nThe design **${selectedDesign.designNumber}** currently registers ${selectedDesign.bom.length} engineering component assemblies:\n\n${bomList || '*No components connected to BOM yet.*'}\n\nIs there a specific drawing alignment or weight limit we should review?`;
        } else if (query.includes('material') || query.includes('grade')) {
          const matList = selectedDesign.materials.map(mid => {
            const m = materials.find(mat => mat.id === mid);
            return m ? `- **${m.name}** [Grade: ${m.grade}, Code: ${m.code}]` : `- Unknown Material [ID: ${mid}]`;
          }).join('\n');
          replyText = `### Connected Materials Specifications:\n\nThis container incorporates the following specialized materials from our compliance database:\n\n${matList || '*No materials linked to specifications.*'}\n\nAll materials conform strictly to NASA and ASTM packaging standards. Let me know if you need to run density audits.`;
        } else if (query.includes('revision') || query.includes('rev') || query.includes('history')) {
          replyText = `### Revision Control Audit:\n\n- **Current Rev**: R${selectedDesign.revision}\n- **Version Control**: v${selectedDesign.version}\n- **Lifecycle**: ${selectedDesign.lifecycleStatus}\n\n**History Event Log**:\n${selectedDesign.activities.filter(a => a.action.includes('Revision') || a.action.includes('Design Approved')).map(a => `* [${new Date(a.timestamp).toLocaleDateString()}] **${a.action}**: ${a.details}`).join('\n')}\n\nRevision locking is active. Promote to next major release when engineering change requests are formally approved.`;
        } else if (query.includes('approve') || query.includes('manager') || query.includes('security')) {
          replyText = `### Security Clearance Status:\n\nYour current logged profile is **${role}** within **${department}**.\n\n- **Revision Lock**: Active\n- **Manager Gate**: Required for Status "Released"\n- **Authorized Approver**: Elena Rostova / Marcus Aurelius\n\nDesigns cannot be edited once released without triggering an official ECR/ECO.`;
        } else {
          replyText = `### Design Specifications Sheet for ${selectedDesign.designNumber}:\n\n- **Customer**: ${selectedDesign.customer.name}\n- **Ecosystem Project**: ${selectedDesign.project.name}\n- **Category/Type**: ${selectedDesign.category} (${selectedDesign.packagingType})\n- **Engineering CAD Asset**: \`${selectedDesign.engineeringAsset}\`\n\nI have locked this structured context. Let me know if you would like me to summarize connected standards or fetch active activities.`;
        }
      }

      setChatMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: replyText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setAiIsTyping(false);
    }, 1200);
  };

  return (
    <div id="packaging-design-workspace" className="space-y-6">
      
      {/* Design Header & Sub-Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border border-slate-900 bg-[#0A0E1A]/80 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <FolderOpen className="w-5 h-5" />
            </span>
            <h2 className="text-base font-bold text-slate-100 font-mono tracking-tight uppercase">
              Packaging Design Registry
            </h2>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 max-w-xl">
            Single-source engineering registry where individual container designs are constructed, version-locked, and integrated with CAD assemblies, compliance materials, and workflow signoffs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              packagingRegistry.resetToDefaults();
              setSelectedDesignId(null);
              onRefresh();
            }}
            className="px-3 py-1.5 text-xs font-mono font-medium rounded-lg border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition flex items-center gap-1.5"
            title="Reset to database blueprint seeds"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Seed Defaults
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-1.5 text-xs font-mono font-semibold rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 hover:shadow-cyan-950/20 hover:shadow-lg transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Create Design
          </button>
        </div>
      </div>

      {/* Main Grid: Left List (Registry) | Right Detail (Workspace) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Hand Registry Pane */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* DesignSearch & DesignFilters */}
          <div className="p-4 rounded-xl border border-slate-900 bg-[#0A0E1A]/90 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-cyan-400" />
                Search & Filter Panel
              </span>
              <button
                onClick={() => {
                  setSelectedCategory('');
                  setSelectedLifecycle('');
                  setSelectedApproval('');
                  setOnlyFavorites(false);
                }}
                className="text-[10px] text-cyan-400 font-mono hover:underline"
              >
                Clear Filters
              </button>
            </div>

            {/* Category selection filter */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[9px] uppercase font-mono text-slate-500 block mb-1">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full text-xs font-mono bg-slate-950 border border-slate-900 rounded px-2 py-1 text-slate-300 focus:outline-none focus:border-cyan-500"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[9px] uppercase font-mono text-slate-500 block mb-1">Lifecycle</label>
                <select
                  value={selectedLifecycle}
                  onChange={(e) => setSelectedLifecycle(e.target.value)}
                  className="w-full text-xs font-mono bg-slate-950 border border-slate-900 rounded px-2 py-1 text-slate-300 focus:outline-none focus:border-cyan-500"
                >
                  <option value="">All Lifecycles</option>
                  {lifecycles.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-slate-400 select-none">
                <input
                  type="checkbox"
                  checked={onlyFavorites}
                  onChange={(e) => setOnlyFavorites(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-950 text-cyan-400 focus:ring-0 focus:ring-offset-0"
                />
                <span>Only Bookmarks</span>
              </label>
            </div>
          </div>

          {/* List of Design Cards */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {filteredDesigns.length === 0 ? (
              <div className="p-8 text-center rounded-xl border border-dashed border-slate-900 bg-slate-950/20 text-slate-500 font-mono text-xs">
                No matching designs registered. Click 'Create Design' to launch a new template.
              </div>
            ) : (
              filteredDesigns.map(d => {
                const isSelected = d.id === selectedDesignId;
                const isFav = packagingRegistry.isDesignFavorite(d.id);
                return (
                  <div
                    key={d.id}
                    id={`design-card-${d.id}`}
                    onClick={() => setSelectedDesignId(d.id)}
                    className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer text-left relative ${
                      isSelected 
                        ? 'border-cyan-500/40 bg-cyan-950/10 shadow-md shadow-cyan-950/15' 
                        : 'border-slate-900 bg-[#080B13]/90 hover:border-slate-800'
                    }`}
                  >
                    {/* Floating Bookmarking Toggle */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        packagingRegistry.toggleDesignFavorite(d.id);
                        onRefresh();
                      }}
                      className="absolute top-4 right-4 text-slate-500 hover:text-cyan-400 transition"
                    >
                      {isFav ? <BookmarkCheck className="w-4 h-4 text-cyan-400" /> : <Bookmark className="w-4 h-4" />}
                    </button>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border bg-slate-950 border-slate-900 text-slate-400">
                        {d.designNumber}
                      </span>
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-cyan-500/80">
                        Rev R{d.revision}
                      </span>
                      {(() => {
                        const designRuns = packagingRegistry.getValidationRunsByDesign(d.id);
                        const latestRun = designRuns.length > 0 ? designRuns[0] : null;
                        if (!latestRun) return null;
                        return (
                          <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold uppercase tracking-wider ${
                            latestRun.overallStatus === 'Passed'
                              ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-950'
                              : latestRun.overallStatus === 'Failed'
                              ? 'bg-rose-950/40 text-rose-400 border border-rose-950'
                              : latestRun.overallStatus === 'Warning'
                              ? 'bg-amber-950/40 text-amber-400 border border-amber-950'
                              : 'bg-cyan-950/40 text-cyan-400 border border-cyan-950'
                          }`}>
                            {latestRun.overallStatus}
                          </span>
                        );
                      })()}
                    </div>

                    <h3 className="text-xs font-bold text-slate-200 mt-2 font-sans line-clamp-1">
                      {d.designName}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                      {d.description}
                    </p>

                    <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-900/60 text-[10px] font-mono">
                      <div>
                        <span className="text-slate-600 uppercase block text-[9px]">Category:</span>
                        <span className="text-slate-300 font-semibold">{d.category}</span>
                      </div>
                      <div>
                        <span className="text-slate-600 uppercase block text-[9px]">Lifecycle:</span>
                        <span className={`font-semibold ${
                          d.lifecycleStatus === 'Released' ? 'text-blue-400' :
                          d.lifecycleStatus === 'Approved' ? 'text-emerald-400' :
                          d.lifecycleStatus === 'In Review' ? 'text-amber-500' : 'text-slate-400'
                        }`}>{d.lifecycleStatus}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-slate-900/40 text-[9px] font-mono text-slate-500">
                      <span>Eng: {d.packagingEngineer}</span>
                      <div className="flex items-center gap-2">
                        <span>BOM: {d.bom.length} items</span>
                        <span>•</span>
                        <span>Mats: {d.materials.length}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Hand Design Workspace Detail View */}
        <div className="lg:col-span-7">
          {!selectedDesign ? (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed border-slate-900 bg-[#0A0E1A]/40">
              <FolderOpen className="w-10 h-10 text-slate-600 animate-pulse mb-3" />
              <h3 className="text-sm font-bold text-slate-400 uppercase font-mono tracking-wider">
                Workspace Inactive
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 max-w-xs font-mono">
                Select an active packaging design from the registry panel to mount its engineering workspace, parts BOM, activities, and AI Co-Pilot context.
              </p>
            </div>
          ) : (
            <div id="design-workspace-sheet" className="space-y-6">
              
              {/* DesignHeader */}
              <div className="p-5 rounded-xl border border-slate-900 bg-[#0A0E1A]/95 relative">
                
                {/* Delete button absolute */}
                <button
                  onClick={() => handleDeleteDesign(selectedDesign.id)}
                  className="absolute top-5 right-5 p-1.5 rounded-lg border border-red-900/30 bg-red-950/20 text-red-400 hover:bg-red-900 hover:text-slate-950 transition"
                  title="Delete design"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-900 text-slate-300 font-semibold">
                    {selectedDesign.designNumber}
                  </span>
                  <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                    selectedDesign.lifecycleStatus === 'Released' ? 'border-blue-900/30 bg-blue-950/20 text-blue-400' :
                    selectedDesign.lifecycleStatus === 'Approved' ? 'border-emerald-900/30 bg-emerald-950/20 text-emerald-400' :
                    selectedDesign.lifecycleStatus === 'In Review' ? 'border-amber-900/30 bg-amber-950/20 text-amber-500' :
                    'border-slate-800 bg-slate-900/40 text-slate-400'
                  }`}>
                    {selectedDesign.lifecycleStatus}
                  </span>
                  <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                    selectedDesign.approvalStatus === 'Approved' ? 'border-emerald-900/30 bg-emerald-950/20 text-emerald-400' :
                    'border-slate-800 bg-slate-900/40 text-slate-400'
                  }`}>
                    {selectedDesign.approvalStatus === 'Approved' ? 'Released-Ready' : 'Pending Signoff'}
                  </span>
                </div>

                <h1 className="text-base font-extrabold text-slate-100 mt-3 font-sans leading-snug">
                  {selectedDesign.designName}
                </h1>
                <p className="text-xs text-slate-400 mt-2 font-mono leading-relaxed">
                  {selectedDesign.description}
                </p>

                {/* Meta details block */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-900/50 text-[10px] font-mono">
                  <div>
                    <span className="text-slate-500 block uppercase text-[9px]">Client Sponsor:</span>
                    <span className="text-slate-200 font-semibold">{selectedDesign.customer.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase text-[9px]">Linked Project:</span>
                    <span className="text-slate-200 font-semibold">{selectedDesign.project.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase text-[9px]">CAD Asset ID:</span>
                    <span className="text-slate-400 font-semibold block truncate" title={selectedDesign.engineeringAsset}>
                      {selectedDesign.engineeringAsset}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase text-[9px]">Revision Version:</span>
                    <span className="text-slate-200 font-semibold">R{selectedDesign.revision} (v{selectedDesign.version})</span>
                  </div>
                </div>

                {/* Workspace Collaboration Actions */}
                <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-slate-900/50">
                  <button
                    onClick={() => setIsPromoteOpen(true)}
                    className="px-3 py-1.5 text-[11px] font-mono font-semibold rounded bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 transition flex items-center gap-1.5"
                  >
                    <GitCommit className="w-3.5 h-3.5 text-cyan-400" />
                    Promote Rev Lock
                  </button>
                  <button
                    onClick={() => setIsLinkMaterialOpen(true)}
                    className="px-3 py-1.5 text-[11px] font-mono font-semibold rounded bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 transition flex items-center gap-1.5"
                  >
                    <Wrench className="w-3.5 h-3.5 text-emerald-400" />
                    Link Material
                  </button>
                  <button
                    onClick={() => setIsAddComponentOpen(true)}
                    className="px-3 py-1.5 text-[11px] font-mono font-semibold rounded bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 transition flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5 text-indigo-400" />
                    Add BOM Item
                  </button>

                  {/* Manager and Approver Quick Approve gate */}
                  {selectedDesign.lifecycleStatus !== 'Released' && (role === 'Engineering Manager' || role === 'Quality Inspector') && (
                    <button
                      onClick={handleApproveDesign}
                      className="px-4 py-1.5 text-[11px] font-mono font-bold rounded bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition ml-auto flex items-center gap-1"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Approve Release Gate
                    </button>
                  )}
                </div>
              </div>

              {/* Grid: Material Panel & Component BOM Panel */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* MaterialPanel */}
                <div id="material-panel" className="p-4 rounded-xl border border-slate-900 bg-[#080B13]/95 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-900/60 pb-2">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-slate-300 font-bold flex items-center gap-1.5">
                      <Cpu className="w-4 h-4 text-emerald-400" />
                      Compliance Materials
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-1.5 py-0.5 rounded">
                      {selectedDesign.materials.length} standard(s)
                    </span>
                  </div>

                  <div className="space-y-2.5 max-h-[220px] overflow-y-auto">
                    {selectedDesign.materials.length === 0 ? (
                      <p className="text-[11px] text-slate-500 font-mono text-center py-4">
                        No materials linked. Click "Link Material" to connect physical compliance metrics.
                      </p>
                    ) : (
                      selectedDesign.materials.map(mid => {
                        const mat = materials.find(m => m.id === mid);
                        if (!mat) return null;
                        return (
                          <div key={mid} className="p-2.5 rounded bg-slate-950 border border-slate-900 text-left">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono text-emerald-400 font-semibold">{mat.code}</span>
                              <span className="text-[9px] font-mono text-slate-500 bg-slate-900/40 px-1 py-0.2 rounded">
                                {mat.grade}
                              </span>
                            </div>
                            <h4 className="text-[11px] font-bold text-slate-300 mt-1">{mat.name}</h4>
                            <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono mt-1.5 pt-1 border-t border-slate-900/40">
                              <span>Thick: {mat.thickness || 'N/A'}</span>
                              <span>Dens: {mat.density}</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* ComponentPanel (BOM) */}
                <div id="component-panel" className="p-4 rounded-xl border border-slate-900 bg-[#080B13]/95 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-900/60 pb-2">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-slate-300 font-bold flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-indigo-400" />
                      BOM Components (Bill of Materials)
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-1.5 py-0.5 rounded">
                      {selectedDesign.bom.length} component(s)
                    </span>
                  </div>

                  <div className="space-y-2.5 max-h-[220px] overflow-y-auto">
                    {selectedDesign.bom.length === 0 ? (
                      <p className="text-[11px] text-slate-500 font-mono text-center py-4">
                        BOM is currently empty. Add structural components or dunnage parts.
                      </p>
                    ) : (
                      selectedDesign.bom.map(item => (
                        <div key={item.componentId} className="p-2.5 rounded bg-slate-950 border border-slate-900 text-left flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-mono text-indigo-400 font-semibold">{item.code}</span>
                            <h4 className="text-[11px] font-bold text-slate-300 mt-0.5">{item.name}</h4>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-mono text-slate-400">Qty:</span>
                            <span className="text-xs font-mono font-extrabold text-slate-200 block">
                              {item.quantity}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Grid: EngineeringLinks & RevisionTimeline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* EngineeringLinks */}
                <div id="engineering-links" className="p-4 rounded-xl border border-slate-900 bg-[#080B13]/95 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-900/60 pb-2">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-slate-300 font-bold flex items-center gap-1.5">
                      <Wrench className="w-4 h-4 text-cyan-400" />
                      Vault & PLM Integrations
                    </span>
                  </div>

                  <div className="space-y-2 text-[11px] font-mono">
                    <div className="p-2.5 rounded bg-slate-950/80 border border-slate-900 flex justify-between items-center">
                      <span className="text-slate-500">CAD Drawing Reference:</span>
                      <span className="text-cyan-400 flex items-center gap-1">
                        \vault\drawings\pkg-301.dwg
                        <ExternalLink className="w-3 h-3" />
                      </span>
                    </div>
                    <div className="p-2.5 rounded bg-slate-950/80 border border-slate-900 flex justify-between items-center">
                      <span className="text-slate-500">Engineering Vault State:</span>
                      <span className="text-emerald-400 font-bold">Checked In / Locked</span>
                    </div>
                    <div className="p-2.5 rounded bg-slate-950/80 border border-slate-900 flex justify-between items-center">
                      <span className="text-slate-500">Active Change Notice (ECO):</span>
                      <span className="text-amber-500 font-semibold">ECO-104 (In Review)</span>
                    </div>
                  </div>
                </div>

                {/* RevisionTimeline */}
                <div id="revision-timeline" className="p-4 rounded-xl border border-slate-900 bg-[#080B13]/95 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-900/60 pb-2">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-slate-300 font-bold flex items-center gap-1.5">
                      <GitCommit className="w-4 h-4 text-indigo-400" />
                      Revision Control Timeline
                    </span>
                  </div>

                  <div className="space-y-3 max-h-[140px] overflow-y-auto pr-1">
                    {selectedDesign.activities.filter(a => a.action === 'Revision Created' || a.action === 'Design Created').map(act => (
                      <div key={act.id} className="text-left relative pl-4 border-l border-indigo-900/40 text-[11px]">
                        <div className="absolute w-2 h-2 rounded-full bg-indigo-500 -left-[4.5px] top-1" />
                        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                          <span>{act.user}</span>
                          <span>{new Date(act.timestamp).toLocaleDateString()}</span>
                        </div>
                        <p className="text-slate-300 font-semibold mt-0.5">{act.action}</p>
                        <p className="text-slate-500 text-[10px] mt-0.5 leading-snug">{act.details}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ActivityFeed, KnowledgePanel, & MemoryPanel Combined */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* KnowledgePanel */}
                <div className="p-4 rounded-xl border border-slate-900 bg-[#080B13]/95 text-left space-y-3">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
                    Knowledge Links
                  </span>
                  <div className="space-y-1.5 text-[10px] font-mono">
                    <a href="#std" className="block text-slate-400 hover:text-cyan-400 truncate flex items-center gap-1">
                      <span>• ASTM-D3951 (Practice)</span>
                      <ExternalLink className="w-2.5 h-2.5 text-slate-600" />
                    </a>
                    <a href="#std" className="block text-slate-400 hover:text-cyan-400 truncate flex items-center gap-1">
                      <span>• MIL-STD-2073 (Preservation)</span>
                      <ExternalLink className="w-2.5 h-2.5 text-slate-600" />
                    </a>
                  </div>
                </div>

                {/* MemoryPanel */}
                <div className="p-4 rounded-xl border border-slate-900 bg-[#080B13]/95 text-left space-y-3">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold flex items-center gap-1">
                    <Bookmark className="w-3.5 h-3.5 text-indigo-400" />
                    Memory Engine Logs
                  </span>
                  <p className="text-[10px] font-mono text-slate-500 leading-normal">
                    Lessons: Avoid using antistatic dunnage materials without carbon fiber coating under space vacuum conditions.
                  </p>
                </div>

                {/* ActivityFeed */}
                <div className="p-4 rounded-xl border border-slate-900 bg-[#080B13]/95 text-left space-y-3">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    Activity Engine Feed
                  </span>
                  <div className="space-y-2 max-h-[80px] overflow-y-auto">
                    {selectedDesign.activities.slice(0, 3).map(act => (
                      <p key={act.id} className="text-[9px] font-mono text-slate-500 truncate" title={act.details}>
                        [{new Date(act.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}] {act.action}: {act.details}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              {/* Inline AI Assistant grounder */}
              <div className="p-4 rounded-xl border border-slate-900 bg-[#0A0D18]/95 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-900/60 pb-2">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                    <span className="text-xs uppercase font-mono tracking-wider text-slate-200 font-bold">
                      Design AI Co-Pilot
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-slate-500 uppercase">
                    Model: Gemini-3.5-Flash (Cognitive Layer Active)
                  </span>
                </div>

                {/* Message Log */}
                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                  {chatMessages.map((msg, idx) => (
                    <div 
                      key={idx} 
                      className={`p-2.5 rounded-lg text-xs leading-normal max-w-[90%] ${
                        msg.sender === 'user' 
                          ? 'bg-cyan-500/10 border border-cyan-900/30 text-cyan-100 ml-auto text-right'
                          : msg.sender === 'system'
                          ? 'bg-slate-950/80 border border-slate-900 text-slate-500 font-mono text-[10px] mx-auto text-center'
                          : 'bg-slate-900/60 border border-slate-900/40 text-slate-300 mr-auto text-left'
                      }`}
                    >
                      {msg.sender !== 'system' && (
                        <div className="flex items-center gap-1 mb-1 text-[9px] font-mono text-slate-500">
                          <span>{msg.sender === 'user' ? 'Chief Engineer' : 'AI Companion'}</span>
                          <span>•</span>
                          <span>{msg.time}</span>
                        </div>
                      )}
                      <div className="whitespace-pre-line font-sans prose-invert">
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {aiIsTyping && (
                    <div className="bg-slate-900/60 border border-slate-900/40 p-2.5 rounded-lg text-xs text-slate-400 mr-auto max-w-[80%] text-left font-mono">
                      Cognizing structured design fabric...
                    </div>
                  )}
                </div>

                {/* Chat input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSendChatMessage(); }}
                    placeholder="Ask about design BOM, links, specifications, revision log..."
                    className="flex-1 text-xs font-mono bg-slate-950 border border-slate-900 rounded-lg px-3 py-2 text-slate-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    onClick={handleSendChatMessage}
                    className="p-2 rounded-lg bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          )}
        </div>

      </div>

      {/* CREATE MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[#0C101E] border border-slate-900 rounded-xl shadow-2xl p-6 text-left space-y-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase font-mono tracking-wider flex items-center gap-1.5">
              <FolderOpen className="text-cyan-400 w-4 h-4" />
              Register New Packaging Design
            </h3>
            
            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs font-mono">
              <div>
                <label className="text-slate-500 block mb-1">DESIGN NAME</label>
                <input
                  type="text"
                  required
                  value={newDesignName}
                  onChange={(e) => setNewDesignName(e.target.value)}
                  placeholder="e.g. Flight Avionics Stat-Kon Box v3"
                  className="w-full bg-slate-950 border border-slate-900 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-500 block mb-1">DESCRIPTION & SPEC NARRATIVE</label>
                <textarea
                  required
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Summarize the core container structure, dunnage characteristics, and vibration mitigation properties..."
                  className="w-full bg-slate-950 border border-slate-900 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-500 block mb-1">CLIENT SPONSOR</label>
                  <select
                    value={newCustomer}
                    onChange={(e) => setNewCustomer(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-900 rounded px-2.5 py-1.5 text-slate-300"
                  >
                    <option value="NASA Glenn Research Center">NASA Glenn Research Center</option>
                    <option value="SpaceX Falcon Core Group">SpaceX Falcon Core Group</option>
                    <option value="Blue Origin New Glenn Systems">Blue Origin New Glenn Systems</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-500 block mb-1">ASSOCIATED PROJECT</label>
                  <select
                    value={newProject}
                    onChange={(e) => setNewProject(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-900 rounded px-2.5 py-1.5 text-slate-300"
                  >
                    <option value="Propulsion Assembly Project">Propulsion Assembly Project</option>
                    <option value="Avionics Flight Hardware">Avionics Flight Hardware</option>
                    <option value="Gimbal Vector Controls">Gimbal Vector Controls</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-500 block mb-1">DESIGN CATEGORY</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as DesignCategory)}
                    className="w-full bg-slate-950 border border-slate-900 rounded px-2.5 py-1.5 text-slate-300"
                  >
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-slate-500 block mb-1">PACKAGING TYPE</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-900 rounded px-2.5 py-1.5 text-slate-300"
                  >
                    <option value="Steel Rack">Steel Rack</option>
                    <option value="Returnable Rack">Returnable Rack</option>
                    <option value="Kit Cart">Kit Cart</option>
                    <option value="Pallet">Pallet</option>
                    <option value="Plastic Tote">Plastic Tote</option>
                    <option value="Wooden Crate">Wooden Crate</option>
                    <option value="Corrugated Box">Corrugated Box</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-500 block mb-1">CAD DRAWING ASSEMBLY REFERENCE</label>
                <input
                  type="text"
                  value={newAsset}
                  onChange={(e) => setNewAsset(e.target.value)}
                  placeholder="e.g. Assy-Avion-Tote-401"
                  className="w-full bg-slate-950 border border-slate-900 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 border border-slate-800 text-slate-400 hover:text-slate-200 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-500 text-slate-950 font-bold rounded"
                >
                  Register Design
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROMOTE REVISION MODAL */}
      {isPromoteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#0C101E] border border-slate-900 rounded-xl shadow-2xl p-6 text-left space-y-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase font-mono tracking-wider flex items-center gap-1.5">
              <GitCommit className="text-cyan-400 w-4 h-4" />
              Promote Major Design Revision
            </h3>
            
            <form onSubmit={handlePromoteSubmit} className="space-y-4 text-xs font-mono">
              <div className="p-3 rounded border border-amber-900/20 bg-amber-950/10 text-amber-500 leading-normal">
                <AlertCircle className="w-4 h-4 inline mr-1 -mt-0.5" />
                This action increases the revision counter and shifts the lifecycle status to 'In Review'. Standard revision locks prevent downstream manufacturing from pulling unreleased revisions.
              </div>

              <div>
                <label className="text-slate-500 block mb-1">CHANGE ORDER NOTES (REQUIRED)</label>
                <textarea
                  required
                  rows={4}
                  value={promoteNotes}
                  onChange={(e) => setPromoteNotes(e.target.value)}
                  placeholder="Outline the detailed mechanical design edits, structural updates, or cushioning dimension shifts that warrant this engineering change order..."
                  className="w-full bg-slate-950 border border-slate-900 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPromoteOpen(false)}
                  className="px-4 py-2 border border-slate-800 text-slate-400 hover:text-slate-200 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-500 text-slate-950 font-bold rounded"
                >
                  Promote Revision Lock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LINK MATERIAL MODAL */}
      {isLinkMaterialOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-[#0C101E] border border-slate-900 rounded-xl shadow-2xl p-6 text-left space-y-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase font-mono tracking-wider flex items-center gap-1.5">
              <Wrench className="text-cyan-400 w-4 h-4" />
              Link Compliance Material
            </h3>
            
            <form onSubmit={handleLinkMaterialSubmit} className="space-y-4 text-xs font-mono">
              <div>
                <label className="text-slate-500 block mb-1">SELECT MASTER MATERIAL</label>
                <select
                  required
                  value={linkMatId}
                  onChange={(e) => setLinkMatId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900 rounded px-2.5 py-2 text-slate-300"
                >
                  <option value="">-- Choose Material --</option>
                  {materials.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.code} - {m.name} ({m.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLinkMaterialOpen(false)}
                  className="px-4 py-2 border border-slate-800 text-slate-400 hover:text-slate-200 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!linkMatId}
                  className="px-5 py-2 bg-cyan-500 text-slate-950 font-bold rounded disabled:opacity-50"
                >
                  Link Material Spec
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD COMPONENT BOM MODAL */}
      {isAddComponentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-[#0C101E] border border-slate-900 rounded-xl shadow-2xl p-6 text-left space-y-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase font-mono tracking-wider flex items-center gap-1.5">
              <Layers className="text-cyan-400 w-4 h-4" />
              Add Component Assembly to BOM
            </h3>
            
            <form onSubmit={handleAddComponentSubmit} className="space-y-4 text-xs font-mono">
              <div>
                <label className="text-slate-500 block mb-1">SELECT CATALOG COMPONENT</label>
                <select
                  required
                  value={addComponentId}
                  onChange={(e) => setAddComponentId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900 rounded px-2.5 py-2 text-slate-300"
                >
                  <option value="">-- Choose Component --</option>
                  {components.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-500 block mb-1">QUANTITY</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={addComponentQty}
                  onChange={(e) => setAddComponentQty(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-950 border border-slate-900 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddComponentOpen(false)}
                  className="px-4 py-2 border border-slate-800 text-slate-400 hover:text-slate-200 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!addComponentId}
                  className="px-5 py-2 bg-cyan-500 text-slate-950 font-bold rounded disabled:opacity-50"
                >
                  Add Part to BOM
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

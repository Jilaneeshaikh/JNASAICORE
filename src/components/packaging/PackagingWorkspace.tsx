import React, { useState, useEffect } from 'react';
import { 
  PackagingProject, 
  PackagingMaterial, 
  PackagingAuditLog, 
  PackagingType, 
  PackagingPriority, 
  PackagingRole,
  PackagingComponent,
  MaterialStandard,
  PackagingDesign,
  ValidationRule,
  ValidationRun
} from '../../backend/packaging/types';
import { PackagingDashboard } from './PackagingDashboard';
import { PackagingProjectCard } from './PackagingProjectCard';
import { PackagingDesignWorkspace } from './PackagingDesignWorkspace';
import { PackagingValidationWorkspace } from './PackagingValidationWorkspace';
import { LoadPlanningWorkspace } from './LoadPlanningWorkspace';
import { ReturnableAssetWorkspace } from './ReturnableAssetWorkspace';
import { 
  Box, 
  Layers, 
  Database, 
  ShieldAlert, 
  Star, 
  Settings, 
  Plus, 
  Sparkles, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw,
  Search,
  FileText,
  Tag,
  Link as LinkIcon,
  ChevronRight,
  Info
} from 'lucide-react';
import { packagingRegistry } from '../../backend/packaging/registry';

interface PackagingWorkspaceProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  projects: PackagingProject[];
  materials: PackagingMaterial[];
  components: PackagingComponent[];
  standards: MaterialStandard[];
  auditLogs: PackagingAuditLog[];
  role: PackagingRole;
  department: string;
  searchQuery: string;
  selectedType: string;
  selectedStatus: string;
  designs: PackagingDesign[];
  rules: ValidationRule[];
  validationRuns: ValidationRun[];
  onRefresh: () => void;
}

export const PackagingWorkspace: React.FC<PackagingWorkspaceProps> = ({
  activeTab,
  setActiveTab,
  projects,
  materials,
  components,
  standards,
  auditLogs,
  role,
  department,
  searchQuery,
  selectedType,
  selectedStatus,
  designs,
  rules,
  validationRuns,
  onRefresh
}) => {
  // State for Create Project Form
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newProjName, setNewProjName] = useState('');
  const [newProjCustomer, setNewProjCustomer] = useState('');
  const [newProjType, setNewProjType] = useState<PackagingType>('Wooden Crate');
  const [newProjPriority, setNewProjPriority] = useState<PackagingPriority>('Medium');
  const [newProjEngineer, setNewProjEngineer] = useState('Alex Mercer');
  const [newProjDwgRef, setNewProjDwgRef] = useState('');
  const [newProjWeight, setNewProjWeight] = useState(150);
  const [newProjDimL, setNewProjDimL] = useState(1200);
  const [newProjDimW, setNewProjDimW] = useState(800);
  const [newProjDimH, setNewProjDimH] = useState(1000);
  const [newProjDunnageMat, setNewProjDunnageMat] = useState('EVA-FOAM-45');
  const [newProjDunnagePockets, setNewProjDunnagePockets] = useState(2);
  const [newProjDunnageAntiStatic, setNewProjDunnageAntiStatic] = useState(true);

  // State for Selected Project Details Drawer
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [revisionNotes, setRevisionNotes] = useState('');

  // State for Material Library
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null);
  const [isCreateMaterialOpen, setIsCreateMaterialOpen] = useState(false);
  const [selectedMaterialCategory, setSelectedMaterialCategory] = useState<string>('');
  const [onlyFavMaterials, setOnlyFavMaterials] = useState<boolean>(false);

  // State for Create Material Form
  const [matCode, setMatCode] = useState('');
  const [matName, setMatName] = useState('');
  const [matCat, setMatCat] = useState('Plastic');
  const [matSubcat, setMatSubcat] = useState('');
  const [matDesc, setMatDesc] = useState('');
  const [matTypeStr, setMatTypeStr] = useState('Polymer');
  const [matGrade, setMatGrade] = useState('ESD');
  const [matDensity, setMatDensity] = useState('1.2 g/cm³');
  const [matWeight, setMatWeight] = useState('');
  const [matThickness, setMatThickness] = useState('');
  const [matDimensions, setMatDimensions] = useState('');
  const [matColor, setMatColor] = useState('');
  const [matFinish, setMatFinish] = useState('');
  const [matTreatment, setMatTreatment] = useState('');
  const [matMfg, setMatMfg] = useState('');
  const [matSupplier, setMatSupplier] = useState('');
  const [matUnit, setMatUnit] = useState('sheet');
  const [matCost, setMatCost] = useState(100);
  const [matLifecycle, setMatLifecycle] = useState<'Candidate' | 'Approved' | 'Obsolete' | 'Suspended'>('Approved');
  const [matRev, setMatRev] = useState('A');
  const [matApproval, setMatApproval] = useState<'Draft' | 'Submitted' | 'In Review' | 'Approved'>('Approved');
  const [matTagsStr, setMatTagsStr] = useState('');

  // State for Component Registry
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [isCreateComponentOpen, setIsCreateComponentOpen] = useState(false);
  
  // State for Create Component Form
  const [compCode, setCompCode] = useState('');
  const [compName, setCompName] = useState('');
  const [compDesc, setCompDesc] = useState('');
  const [compCat, setCompCat] = useState<'Cushion' | 'Divider' | 'Spacer' | 'Brace' | 'Fastener' | 'Label' | 'Handle' | 'Caster' | 'Lid' | 'Base' | 'Dunnage Insert' | 'Other'>('Dunnage Insert');
  const [compMatId, setCompMatId] = useState('');
  const [compRev, setCompRev] = useState('R1');
  const [compStatus, setCompStatus] = useState<'Active' | 'In Design' | 'Under Review' | 'Obsolete'>('Active');
  const [compAsset, setCompAsset] = useState('');
  const [compDrawing, setCompDrawing] = useState('');
  const [compPart, setCompPart] = useState('');
  const [compProjectId, setCompProjectId] = useState('');
  const [compCustId, setCompCustId] = useState('');
  const [compSupplier, setCompSupplier] = useState('');

  // Link Standards State
  const [isLinkStandardOpen, setIsLinkStandardOpen] = useState(false);
  const [linkMaterialId, setLinkMaterialId] = useState('');
  const [linkStandardId, setLinkStandardId] = useState('');

  // Selected project, material & component lookups
  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const selectedMaterial = materials.find(m => m.id === selectedMaterialId);
  const selectedComponent = components.find(c => c.id === selectedComponentId);

  // Command listeners triggered from page level
  useEffect(() => {
    const handleCreateProjTrigger = () => {
      setIsCreateOpen(true);
    };
    const handleCreateMatTrigger = () => {
      setIsCreateMaterialOpen(true);
    };
    const handleFavMatsTrigger = () => {
      setOnlyFavMaterials(true);
    };

    window.addEventListener('jnas-trigger-create-packaging', handleCreateProjTrigger);
    window.addEventListener('jnas-trigger-create-material', handleCreateMatTrigger);
    window.addEventListener('jnas-trigger-fav-materials', handleFavMatsTrigger);

    return () => {
      window.removeEventListener('jnas-trigger-create-packaging', handleCreateProjTrigger);
      window.removeEventListener('jnas-trigger-create-material', handleCreateMatTrigger);
      window.removeEventListener('jnas-trigger-fav-materials', handleFavMatsTrigger);
    };
  }, []);

  // Filtered lists based on search, filter selectors
  const filteredProjects = projects.filter(proj => {
    const matchesSearch =
      proj.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proj.projectNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proj.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proj.packagingType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proj.packagingEngineer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proj.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = selectedType ? proj.packagingType === selectedType : true;
    const matchesStatus = selectedStatus ? proj.status === selectedStatus : true;

    return matchesSearch && matchesType && matchesStatus;
  });

  const filteredMaterials = materials.filter(mat => {
    const matchesSearch =
      mat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mat.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mat.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mat.grade.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (mat.tags && mat.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesCategory = selectedMaterialCategory ? mat.category === selectedMaterialCategory : true;
    const matchesFav = onlyFavMaterials ? packagingRegistry.isMaterialFavorite(mat.id) : true;

    return matchesSearch && matchesCategory && matchesFav;
  });

  const filteredComponents = components.filter(comp => {
    const matchesSearch =
      comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (comp.drawingRef && comp.drawingRef.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (comp.partNumber && comp.partNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesSearch;
  });

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName || !newProjCustomer) return;

    packagingRegistry.createProject({
      projectName: newProjName,
      customerId: `cust-${newProjCustomer.toLowerCase().replace(/\s+/g, '-')}`,
      customerName: newProjCustomer,
      engineeringProjectId: 'proj-prop-01',
      engineeringProjectName: 'Propulsion Assembly Project',
      packagingType: newProjType,
      industry: 'Aerospace Engineering',
      status: 'Draft',
      priority: newProjPriority,
      owner: 'jilaneeshaikh@gmail.com',
      packagingEngineer: newProjEngineer,
      startDate: new Date().toISOString().split('T')[0],
      targetDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
      approvalStatus: 'Pending',
      tags: ['Custom', newProjType],
      knowledgeLinks: [],
      memoryLinks: [],
      documentRefs: [],
      drawingRefs: newProjDwgRef ? [newProjDwgRef] : [],
      changeRefs: [],
      dunnageSpecs: {
        materialCode: newProjDunnageMat,
        thickness: '50mm',
        customCavities: Number(newProjDunnagePockets),
        antistatic: newProjDunnageAntiStatic
      },
      weightCapacityKg: Number(newProjWeight),
      dimensionsOuter: {
        length: Number(newProjDimL),
        width: Number(newProjDimW),
        height: Number(newProjDimH),
        unit: 'mm'
      }
    });

    setIsCreateOpen(false);
    onRefresh();
  };

  const handleCreateMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matCode || !matName) return;

    const tagsArr = matTagsStr.split(',').map(t => t.trim()).filter(Boolean);

    packagingRegistry.createMaterial({
      code: matCode,
      name: matName,
      category: matCat,
      subcategory: matSubcat || undefined,
      description: matDesc,
      materialType: matTypeStr,
      grade: matGrade,
      density: matDensity,
      weight: matWeight || undefined,
      thickness: matThickness || undefined,
      dimensions: matDimensions || undefined,
      color: matColor || undefined,
      finish: matFinish || undefined,
      surfaceTreatment: matTreatment || undefined,
      manufacturer: matMfg,
      supplierPlaceholder: matSupplier || undefined,
      standardIds: [],
      unit: matUnit,
      costPlaceholder: Number(matCost) || undefined,
      lifecycleStatus: matLifecycle,
      revision: matRev,
      approvalStatus: matApproval,
      tags: tagsArr,
      auditMetadata: {
        createdBy: 'jilaneeshaikh@gmail.com'
      }
    });

    // Reset fields
    setMatCode('');
    setMatName('');
    setMatDesc('');
    setMatTagsStr('');
    setIsCreateMaterialOpen(false);
    onRefresh();
  };

  const handleCreateComponent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!compCode || !compName || !compMatId) return;

    packagingRegistry.createComponent({
      code: compCode,
      name: compName,
      description: compDesc,
      category: compCat,
      materialId: compMatId,
      revision: compRev,
      status: compStatus,
      engineeringAsset: compAsset || undefined,
      drawingRef: compDrawing || undefined,
      partNumber: compPart || undefined,
      projectId: compProjectId || undefined,
      customerId: compCustId || undefined,
      futureSupplierPlaceholder: compSupplier || undefined,
      knowledgeLinks: [],
      memoryLinks: [],
      activities: [],
      documentRefs: []
    });

    setCompCode('');
    setCompName('');
    setCompDesc('');
    setCompMatId('');
    setIsCreateComponentOpen(false);
    onRefresh();
  };

  const handleLinkStandardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkMaterialId || !linkStandardId) return;
    packagingRegistry.linkStandardToMaterial(linkMaterialId, linkStandardId);
    setIsLinkStandardOpen(false);
    onRefresh();
  };

  const handlePromoteRevision = () => {
    if (!selectedProjectId) return;
    packagingRegistry.createRevision(selectedProjectId, revisionNotes || 'Standard parameters optimization upgrade.');
    setRevisionNotes('');
    onRefresh();
  };

  const handleUpdateStatus = (status: 'Approved' | 'Rejected') => {
    if (!selectedProjectId) return;
    packagingRegistry.updateProject(selectedProjectId, {
      approvalStatus: status,
      status: status === 'Approved' ? 'Active' : 'Draft'
    });
    onRefresh();
  };

  // Material Categories for visual Filter lists
  const availableCategories = [
    'Steel', 'Aluminium', 'Plastic', 'HDPE', 'PP', 'ABS', 
    'Foam', 'Wood', 'Plywood', 'Corrugated', 'Paper', 'Rubber', 
    'Fabric', 'Fasteners', 'Labels', 'Dunnage', 'Protective Material'
  ];

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-slate-950/20 max-h-[calc(100vh-130px)]">
      
      {/* 1. DASHBOARD TAB */}
      {activeTab === 'dashboard' && (
        <PackagingDashboard
          projects={projects}
          materials={materials}
          auditLogs={auditLogs}
          role={role}
          department={department}
          onSelectProject={(id) => {
            setSelectedProjectId(id);
            setActiveTab('projects');
          }}
          onCreateTrigger={() => setIsCreateOpen(true)}
          onNavigateTab={setActiveTab}
          onToggleFavorite={(id) => {
            packagingRegistry.toggleFavorite(id);
            onRefresh();
          }}
          isFavorite={(id) => packagingRegistry.isFavorite(id)}
        />
      )}

      {/* 2. PROJECTS TAB */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-200 uppercase font-mono tracking-wider">
                Packaging Assembly Registry
              </h2>
              <p className="text-[11px] text-slate-500 mt-1">
                Faceted filter grid showing {filteredProjects.length} of {projects.length} recorded packages.
              </p>
            </div>

            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-cyan-500 text-slate-950 font-semibold rounded font-sans hover:bg-cyan-400 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create Packaging Spec</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredProjects.map(proj => (
              <PackagingProjectCard
                key={proj.id}
                project={proj}
                onSelect={setSelectedProjectId}
                onToggleFavorite={(id) => {
                  packagingRegistry.toggleFavorite(id);
                  onRefresh();
                }}
                isStarred={packagingRegistry.isFavorite(proj.id)}
              />
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <div className="p-12 text-center bg-slate-950/20 border border-slate-900 rounded-lg">
              <Box className="w-8 h-8 text-slate-600 mx-auto mb-3" />
              <h3 className="text-xs font-semibold text-slate-300">No projects found matching the criteria</h3>
              <p className="text-[10px] text-slate-500 mt-1">Adjust your search strings or filter configurations above.</p>
            </div>
          )}

          {/* PROJECT DETAIL SHEET DRAWER */}
          {selectedProject && (
            <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-xs">
              <div className="w-full max-w-2xl bg-[#0C111E] border-l border-slate-900 h-full flex flex-col p-6 shadow-2xl relative animate-slide-in">
                
                <button
                  onClick={() => setSelectedProjectId(null)}
                  className="absolute top-6 right-6 p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-900/60 rounded font-mono text-sm"
                >
                  ✕
                </button>

                <div className="flex-1 overflow-y-auto space-y-6 pr-2">
                  <div className="border-b border-slate-900 pb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-cyan-400 font-semibold uppercase bg-cyan-950/30 px-2 py-0.5 rounded border border-cyan-900/30">
                        {selectedProject.projectNumber}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">R{selectedProject.revision}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-200 mt-2 font-sans">{selectedProject.projectName}</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-sans">Customer: {selectedProject.customerName}</p>
                  </div>

                  {/* General Specs */}
                  <div className="grid grid-cols-2 gap-4 text-xs font-sans">
                    <div className="space-y-1">
                      <span className="text-slate-500 uppercase block font-mono text-[10px]">Type / Classification:</span>
                      <span className="text-slate-300 font-medium">{selectedProject.packagingType}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-500 uppercase block font-mono text-[10px]">Industry Vertical:</span>
                      <span className="text-slate-300 font-medium">{selectedProject.industry}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-500 uppercase block font-mono text-[10px]">Ecosystem Project ID:</span>
                      <span className="text-slate-300 font-medium font-mono">{selectedProject.engineeringProjectId}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-500 uppercase block font-mono text-[10px]">Target Date:</span>
                      <span className="text-slate-300 font-medium font-mono">{selectedProject.targetDate}</span>
                    </div>
                  </div>

                  {/* Physical Dimensions */}
                  {selectedProject.dimensionsOuter && (
                    <div className="p-4 bg-slate-950/40 rounded border border-slate-900/30 space-y-3">
                      <span className="text-xs font-bold font-mono text-slate-300 block uppercase">Container Physical Dimensions</span>
                      <div className="grid grid-cols-4 gap-3 text-center text-xs font-mono">
                        <div className="bg-[#070B13]/80 p-2 rounded border border-slate-900/40">
                          <span className="text-slate-500 block text-[9px]">L (mm)</span>
                          <span className="text-slate-300 font-semibold">{selectedProject.dimensionsOuter.length}</span>
                        </div>
                        <div className="bg-[#070B13]/80 p-2 rounded border border-slate-900/40">
                          <span className="text-slate-500 block text-[9px]">W (mm)</span>
                          <span className="text-slate-300 font-semibold">{selectedProject.dimensionsOuter.width}</span>
                        </div>
                        <div className="bg-[#070B13]/80 p-2 rounded border border-slate-900/40">
                          <span className="text-slate-500 block text-[9px]">H (mm)</span>
                          <span className="text-slate-300 font-semibold">{selectedProject.dimensionsOuter.height}</span>
                        </div>
                        <div className="bg-[#070B13]/80 p-2 rounded border border-slate-900/40">
                          <span className="text-slate-500 block text-[9px]">Capacity</span>
                          <span className="text-cyan-400 font-semibold">{selectedProject.weightCapacityKg || 'N/A'} kg</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Dunnage */}
                  {selectedProject.dunnageSpecs && (
                    <div className="p-4 bg-slate-950/40 rounded border border-slate-900/30 space-y-2.5">
                      <span className="text-xs font-bold font-mono text-slate-300 block uppercase">CAD Integrated Dunnage Specs</span>
                      <div className="grid grid-cols-2 gap-4 text-xs font-sans">
                        <div>
                          <span className="text-slate-500 block text-[10px] font-mono">Dunnage Compound:</span>
                          <span className="text-emerald-400 font-mono font-medium">{selectedProject.dunnageSpecs.materialCode}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px] font-mono">Cavity Capacity:</span>
                          <span className="text-slate-300 font-medium">{selectedProject.dunnageSpecs.customCavities} Pockets</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px] font-mono">Thickness:</span>
                          <span className="text-slate-300 font-medium">{selectedProject.dunnageSpecs.thickness}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px] font-mono">ESD Antistatic Coating:</span>
                          <span className={selectedProject.dunnageSpecs.antistatic ? 'text-cyan-400 font-mono font-semibold' : 'text-slate-500 font-mono'}>
                            {selectedProject.dunnageSpecs.antistatic ? 'COMPLIANT' : 'NONE'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CAD Drawings Linked */}
                  {selectedProject.drawingRefs && selectedProject.drawingRefs.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold font-mono text-slate-300 block uppercase">Linked CAD Drawings</span>
                      <div className="flex gap-2.5 flex-wrap">
                        {selectedProject.drawingRefs.map(ref => (
                          <div key={ref} className="bg-slate-950/60 px-3 py-1.5 rounded border border-slate-900 flex items-center gap-2 text-xs font-mono text-slate-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                            <span>{ref}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions / approvals gating based on role */}
                  <div className="p-4 bg-slate-950 border border-slate-900 rounded space-y-4">
                    <span className="text-xs font-mono font-bold text-slate-400 uppercase block">Gated Approval Clearances</span>
                    
                    {role === 'Quality Inspector' ? (
                      <div className="space-y-3">
                        <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                          Your profile is authenticated as <strong className="text-cyan-400">Quality Inspector</strong>. You possess permissions to submit stress-test passes and sign off approvals.
                        </p>
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleUpdateStatus('Approved')}
                            className="px-3 py-1.5 text-xs bg-emerald-500 text-slate-950 font-bold rounded font-sans hover:bg-emerald-400 transition"
                          >
                            Sign Off & Release Design
                          </button>
                          <button
                            onClick={() => handleUpdateStatus('Rejected')}
                            className="px-3 py-1.5 text-xs bg-slate-900 text-rose-400 font-semibold rounded font-sans border border-rose-950/30 hover:bg-slate-850 transition"
                          >
                            Reject & Reset to Draft
                          </button>
                        </div>
                      </div>
                    ) : role === 'Engineering Manager' ? (
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-slate-500 block text-[10px] font-mono">Sprint R+1 Revision Change Notes *</label>
                          <input
                            type="text"
                            value={revisionNotes}
                            onChange={(e) => setRevisionNotes(e.target.value)}
                            placeholder="Optimizing dunnage cavity tolerances to prevent mechanical rattling."
                            className="w-full p-2 bg-slate-950 border border-slate-900 rounded text-slate-300 focus:outline-none focus:border-cyan-500 text-xs placeholder-slate-700 font-sans"
                          />
                        </div>
                        <button
                          onClick={handlePromoteRevision}
                          className="px-3 py-1.5 text-xs bg-cyan-500 text-slate-950 font-bold rounded font-sans hover:bg-cyan-400 transition"
                        >
                          Promote R+1 Revision
                        </button>
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-500 font-sans italic leading-relaxed">
                        Read-only approvals state. Elevate role profile context to Quality Inspector or Engineering Manager to perform sign-offs or revise parameters.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. MATERIALS MASTER LIBRARY TAB */}
      {activeTab === 'materials' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-200 uppercase font-mono tracking-wider">
                Materials Registry Catalog
              </h2>
              <p className="text-[11px] text-slate-500 mt-1">
                Approved thermoformed polymers, rigid structural metals, and cushioning dunnage.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsLinkStandardOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-900 border border-slate-800 text-slate-300 font-semibold rounded hover:bg-slate-800 transition font-sans"
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Link Standard</span>
              </button>

              <button
                onClick={() => setIsCreateMaterialOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-emerald-500 text-slate-950 font-semibold rounded hover:bg-emerald-400 transition font-sans"
              >
                <Plus className="w-4 h-4" />
                <span>Register Material Compound</span>
              </button>
            </div>
          </div>

          {/* Quick categories row */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 select-none">
            <button
              onClick={() => setSelectedMaterialCategory('')}
              className={`px-2.5 py-1 text-[11px] font-mono rounded shrink-0 border transition ${
                selectedMaterialCategory === ''
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-semibold'
                  : 'bg-slate-950/40 text-slate-400 border-slate-900 hover:text-slate-200'
              }`}
            >
              All Compounds
            </button>
            {availableCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedMaterialCategory(cat)}
                className={`px-2.5 py-1 text-[11px] font-mono rounded shrink-0 border transition ${
                  selectedMaterialCategory === cat
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-semibold'
                    : 'bg-slate-950/40 text-slate-400 border-slate-900 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex gap-2 items-center text-xs font-mono text-slate-500">
            <input
              type="checkbox"
              id="fav_mats_only"
              checked={onlyFavMaterials}
              onChange={(e) => setOnlyFavMaterials(e.target.checked)}
              className="rounded border-slate-900 bg-slate-950 text-emerald-500 focus:ring-0 cursor-pointer"
            />
            <label htmlFor="fav_mats_only" className="cursor-pointer hover:text-slate-400">Show Bookmarked Material Standards Only</label>
          </div>

          {/* Material Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredMaterials.map(mat => {
              const isFav = packagingRegistry.isMaterialFavorite(mat.id);
              return (
                <div 
                  key={mat.id} 
                  onClick={() => setSelectedMaterialId(mat.id)}
                  className="bg-[#0C111E]/80 border border-slate-900 hover:border-slate-800 rounded-lg p-5 space-y-4 cursor-pointer hover:shadow-lg transition duration-250 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-emerald-400 font-semibold uppercase bg-emerald-950/30 px-1.5 py-0.5 rounded border border-emerald-900/30">
                            {mat.code}
                          </span>
                          <span className="text-[9px] font-mono text-slate-500">R{mat.revision}</span>
                        </div>
                        <h3 className="text-xs font-bold text-slate-200 mt-1.5 font-sans">{mat.name}</h3>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          packagingRegistry.toggleMaterialFavorite(mat.id);
                          onRefresh();
                        }}
                        className="p-1 text-slate-500 hover:text-yellow-400 rounded transition"
                      >
                        <Star className={`w-4 h-4 ${isFav ? 'text-yellow-500 fill-yellow-500' : 'text-slate-600'}`} />
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-400 font-sans leading-relaxed line-clamp-2">
                      {mat.description}
                    </p>

                    <div className="grid grid-cols-2 gap-3 text-[10px] font-mono bg-slate-950/40 p-3 rounded border border-slate-900/30">
                      <div>
                        <span className="text-slate-500 block uppercase">Category:</span>
                        <span className="text-slate-300 font-medium">{mat.category}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block uppercase">Density:</span>
                        <span className="text-slate-300 font-medium">{mat.density}</span>
                      </div>
                      <div className="pt-1">
                        <span className="text-slate-500 block uppercase">Grade Type:</span>
                        <span className="text-slate-300 font-medium">{mat.grade}</span>
                      </div>
                      <div className="pt-1">
                        <span className="text-slate-500 block uppercase">Cert Status:</span>
                        <span className={mat.lifecycleStatus === 'Approved' ? 'text-emerald-400' : 'text-amber-500'}>
                          {mat.lifecycleStatus.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-slate-900/40 text-[10px] font-mono text-slate-500">
                    <span>MFG: {mat.manufacturer}</span>
                    <span className="text-slate-400 hover:text-emerald-400 font-medium flex items-center gap-0.5">
                      View Datasheet <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredMaterials.length === 0 && (
            <div className="p-12 text-center bg-slate-950/20 border border-slate-900 rounded-lg">
              <Database className="w-8 h-8 text-slate-600 mx-auto mb-3" />
              <h3 className="text-xs font-semibold text-slate-300">No material compounds match parameters</h3>
              <p className="text-[10px] text-slate-500 mt-1">Adjust search metrics or change filters.</p>
            </div>
          )}

          {/* MATERIAL SPECIFICATIONS SIDEBAR DRAWER */}
          {selectedMaterial && (
            <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-xs">
              <div className="w-full max-w-xl bg-[#0C111E] border-l border-slate-900 h-full flex flex-col p-6 shadow-2xl relative animate-slide-in">
                
                <button
                  onClick={() => setSelectedMaterialId(null)}
                  className="absolute top-6 right-6 p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-900/60 rounded text-sm font-mono"
                >
                  ✕
                </button>

                <div className="flex-1 overflow-y-auto space-y-5 pr-2">
                  <div className="border-b border-slate-900 pb-4">
                    <span className="text-xs font-mono text-emerald-400 font-semibold uppercase bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-900/30">
                      {selectedMaterial.code}
                    </span>
                    <h3 className="text-sm font-bold text-slate-200 mt-2 font-sans">{selectedMaterial.name}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5 font-mono">Master Compound ID: {selectedMaterial.id}</p>
                  </div>

                  <div className="space-y-1.5 font-sans text-xs">
                    <span className="text-slate-500 font-mono text-[10px] uppercase block">Material Description Narrative</span>
                    <p className="text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded border border-slate-900/50">
                      {selectedMaterial.description || 'No detailed technical documentation is recorded for this compound.'}
                    </p>
                  </div>

                  {/* Physical attributes */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold font-mono text-slate-400 block uppercase">Physical & Mechanical Specs</span>
                    <div className="grid grid-cols-2 gap-4 text-xs font-sans p-4 bg-slate-950/40 border border-slate-900/40 rounded">
                      <div>
                        <span className="text-slate-500 block text-[10px] font-mono">Category:</span>
                        <span className="text-slate-300 font-medium">{selectedMaterial.category}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] font-mono">Subcategory:</span>
                        <span className="text-slate-300 font-medium">{selectedMaterial.subcategory || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] font-mono">Type Class:</span>
                        <span className="text-slate-300 font-medium">{selectedMaterial.materialType}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] font-mono">Grade standard:</span>
                        <span className="text-slate-300 font-medium">{selectedMaterial.grade}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] font-mono">Density rating:</span>
                        <span className="text-slate-300 font-medium font-mono">{selectedMaterial.density}</span>
                      </div>
                      {selectedMaterial.thickness && (
                        <div>
                          <span className="text-slate-500 block text-[10px] font-mono">Nominal Thickness:</span>
                          <span className="text-slate-300 font-medium font-mono">{selectedMaterial.thickness}</span>
                        </div>
                      )}
                      {selectedMaterial.dimensions && (
                        <div>
                          <span className="text-slate-500 block text-[10px] font-mono">Enclosing Envelope:</span>
                          <span className="text-slate-300 font-medium font-mono">{selectedMaterial.dimensions}</span>
                        </div>
                      )}
                      {selectedMaterial.color && (
                        <div>
                          <span className="text-slate-500 block text-[10px] font-mono">Finish Color:</span>
                          <span className="text-slate-300 font-medium">{selectedMaterial.color}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Procurement references */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold font-mono text-slate-400 block uppercase">Procurement & Manufacturer Information</span>
                    <div className="grid grid-cols-2 gap-4 text-xs font-sans p-4 bg-slate-950/40 border border-slate-900/40 rounded">
                      <div>
                        <span className="text-slate-500 block text-[10px] font-mono">Primary Manufacturer:</span>
                        <span className="text-slate-300 font-medium">{selectedMaterial.manufacturer}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] font-mono">Supplier Reference (Placeholder):</span>
                        <span className="text-slate-300 font-medium">{selectedMaterial.supplierPlaceholder || 'Not allocated'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] font-mono">Estimated cost standard:</span>
                        <span className="text-cyan-400 font-medium font-mono">${selectedMaterial.costPlaceholder || '0.00'} per {selectedMaterial.unit}</span>
                      </div>
                    </div>
                  </div>

                  {/* Linked Compliance Standards */}
                  <div className="space-y-3.5">
                    <span className="text-xs font-bold font-mono text-slate-400 block uppercase">Linked ASTM / ISO Standards</span>
                    <div className="space-y-2">
                      {selectedMaterial.standardIds && selectedMaterial.standardIds.length > 0 ? (
                        selectedMaterial.standardIds.map(sid => {
                          const std = standards.find(s => s.id === sid);
                          if (!std) return null;
                          return (
                            <div key={std.id} className="p-3 bg-[#070B13] border border-slate-900 rounded flex items-center justify-between text-xs font-sans">
                              <div>
                                <span className="font-mono text-cyan-400 font-semibold uppercase">{std.code}</span>
                                <p className="text-slate-400 text-[11px] mt-0.5">{std.name}</p>
                              </div>
                              <span className="text-[10px] bg-slate-900 px-1.5 py-0.5 rounded text-slate-500 font-mono">R:{std.revision}</span>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-[10px] text-slate-500 italic">No formal ASTM/ISO compliance standards are mapped to this compound.</p>
                      )}
                    </div>
                  </div>

                  {/* Components utilizing this material */}
                  <div className="space-y-3">
                    <span className="text-xs font-bold font-mono text-slate-400 block uppercase">Active Components Utilizing Material</span>
                    <div className="space-y-2">
                      {components.filter(c => c.materialId === selectedMaterial.id).length > 0 ? (
                        components.filter(c => c.materialId === selectedMaterial.id).map(comp => (
                          <div 
                            key={comp.id} 
                            onClick={() => {
                              setSelectedMaterialId(null);
                              setSelectedComponentId(comp.id);
                              setActiveTab('components');
                            }}
                            className="p-3 bg-[#070B13] border border-slate-900 hover:border-slate-800 rounded flex items-center justify-between text-xs cursor-pointer font-sans"
                          >
                            <div>
                              <span className="font-mono text-slate-300 font-semibold">{comp.code}</span>
                              <p className="text-slate-400 text-[11px] mt-0.5">{comp.name}</p>
                            </div>
                            <span className="text-[10px] text-cyan-400 font-mono uppercase bg-cyan-950/20 px-1.5 py-0.5 rounded border border-cyan-900/20">{comp.category}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-[10px] text-slate-500 italic">No registered design components are currently utilizing this compound.</p>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. COMPONENTS CATALOG TAB */}
      {activeTab === 'components' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-200 uppercase font-mono tracking-wider">
                Components Registry Catalog
              </h2>
              <p className="text-[11px] text-slate-500 mt-1">
                Engineered custom inserts, dunnage cushions, slide rails, and locking assemblies.
              </p>
            </div>

            <button
              onClick={() => setIsCreateComponentOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-cyan-500 text-slate-950 font-semibold rounded hover:bg-cyan-400 transition font-sans"
            >
              <Plus className="w-4 h-4" />
              <span>Register Component</span>
            </button>
          </div>

          <div className="bg-[#0C111E]/80 border border-slate-900 rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-slate-950/60 border-b border-slate-900 grid grid-cols-5 text-[10px] font-mono text-slate-500 uppercase">
              <span className="col-span-1">Component</span>
              <span className="col-span-1">Category</span>
              <span className="col-span-1">Material compound</span>
              <span className="col-span-1">CAD drawing ref</span>
              <span className="col-span-1 text-right">Part Number</span>
            </div>

            <div className="divide-y divide-slate-900/45">
              {filteredComponents.map(comp => {
                const mat = materials.find(m => m.id === comp.materialId);
                return (
                  <div 
                    key={comp.id} 
                    onClick={() => setSelectedComponentId(comp.id)}
                    className="px-4 py-3.5 grid grid-cols-5 text-xs text-slate-300 hover:bg-slate-950/30 transition cursor-pointer"
                  >
                    <div className="col-span-1 flex flex-col justify-center">
                      <span className="font-mono text-cyan-400 font-semibold">{comp.code}</span>
                      <span className="text-[11px] text-slate-300 mt-0.5 line-clamp-1">{comp.name}</span>
                    </div>
                    <div className="col-span-1 flex items-center text-slate-400 font-mono text-[11px]">
                      {comp.category}
                    </div>
                    <div className="col-span-1 flex items-center text-emerald-400 font-mono text-[11px]">
                      {mat ? mat.code : 'UNKNOWN'}
                    </div>
                    <div className="col-span-1 flex items-center text-slate-500 font-mono text-[11px]">
                      {comp.drawingRef || 'None linked'}
                    </div>
                    <div className="col-span-1 flex items-center justify-end font-mono text-[11px] text-slate-400 text-right">
                      {comp.partNumber || 'N/A'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {filteredComponents.length === 0 && (
            <div className="p-12 text-center bg-slate-950/20 border border-slate-900 rounded-lg">
              <Layers className="w-8 h-8 text-slate-600 mx-auto mb-3" />
              <h3 className="text-xs font-semibold text-slate-300">No packaging components found</h3>
              <p className="text-[10px] text-slate-500 mt-1">Refine search values.</p>
            </div>
          )}

          {/* COMPONENT SPECTRAL DRAWING SHEET DRAWER */}
          {selectedComponent && (
            <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-xs">
              <div className="w-full max-w-xl bg-[#0C111E] border-l border-slate-900 h-full flex flex-col p-6 shadow-2xl relative animate-slide-in">
                
                <button
                  onClick={() => setSelectedComponentId(null)}
                  className="absolute top-6 right-6 p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-900/60 rounded text-sm font-mono"
                >
                  ✕
                </button>

                <div className="flex-1 overflow-y-auto space-y-5 pr-2">
                  <div className="border-b border-slate-900 pb-4">
                    <span className="text-xs font-mono text-cyan-400 font-semibold uppercase bg-cyan-950/30 px-2 py-0.5 rounded border border-cyan-900/30">
                      {selectedComponent.code}
                    </span>
                    <h3 className="text-sm font-bold text-slate-200 mt-2 font-sans">{selectedComponent.name}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5 font-mono">Component ID: {selectedComponent.id}</p>
                  </div>

                  <div className="space-y-1.5 font-sans text-xs">
                    <span className="text-slate-500 font-mono text-[10px] uppercase block">Engineering Narrative Description</span>
                    <p className="text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded border border-slate-900/50">
                      {selectedComponent.description || 'No detailed technical documentation is recorded for this component.'}
                    </p>
                  </div>

                  {/* Component Details */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold font-mono text-slate-400 block uppercase">Product Specifications</span>
                    <div className="grid grid-cols-2 gap-4 text-xs font-sans p-4 bg-slate-950/40 border border-slate-900/40 rounded">
                      <div>
                        <span className="text-slate-500 block text-[10px] font-mono">Category classification:</span>
                        <span className="text-slate-300 font-medium">{selectedComponent.category}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] font-mono">Revision count:</span>
                        <span className="text-slate-300 font-medium font-mono">{selectedComponent.revision}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] font-mono">Ecosystem component Status:</span>
                        <span className="text-slate-300 font-medium">{selectedComponent.status}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] font-mono">Engineering CAD part number:</span>
                        <span className="text-slate-300 font-medium font-mono">{selectedComponent.partNumber || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Material composition link */}
                  <div className="space-y-3 p-4 bg-slate-950/30 border border-slate-900 rounded">
                    <span className="text-xs font-bold font-mono text-slate-400 block uppercase">Material Composition Link</span>
                    {(() => {
                      const mat = materials.find(m => m.id === selectedComponent.materialId);
                      if (!mat) return <p className="text-[10px] text-slate-500">No linked material compound.</p>;
                      return (
                        <div 
                          onClick={() => {
                            setSelectedComponentId(null);
                            setSelectedMaterialId(mat.id);
                            setActiveTab('materials');
                          }}
                          className="p-3 bg-[#070B13] hover:border-slate-800 border border-slate-900 rounded flex items-center justify-between text-xs cursor-pointer font-sans"
                        >
                          <div>
                            <span className="font-mono text-emerald-400 font-semibold uppercase">{mat.code}</span>
                            <p className="text-slate-300 font-medium mt-0.5">{mat.name}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-500" />
                        </div>
                      );
                    })()}
                  </div>

                  {/* Integration Assets */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold font-mono text-slate-400 block uppercase">Engineering & CAD Integration Reference</span>
                    <div className="grid grid-cols-2 gap-4 text-xs font-sans p-4 bg-slate-950/40 border border-slate-900/40 rounded">
                      <div>
                        <span className="text-slate-500 block text-[10px] font-mono">CAD Assembly model:</span>
                        <span className="text-slate-300 font-medium">{selectedComponent.engineeringAsset || 'None mapped'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] font-mono">Mechanical drawing reference:</span>
                        <span className="text-slate-300 font-medium font-mono">{selectedComponent.drawingRef || 'None mapped'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] font-mono">Target Logistics Project ID:</span>
                        <span className="text-slate-300 font-medium font-mono">{selectedComponent.projectId || 'None mapped'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] font-mono">Target Client ID:</span>
                        <span className="text-slate-300 font-medium font-mono">{selectedComponent.customerId || 'None mapped'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Future supplier */}
                  {selectedComponent.futureSupplierPlaceholder && (
                    <div className="p-3 bg-cyan-950/10 border border-cyan-900/20 rounded flex items-center gap-2.5 text-xs text-cyan-400 leading-normal font-sans">
                      <Info className="w-4.5 h-4.5 shrink-0" />
                      <div>
                        <strong className="block mb-0.5">Procurement Allocation:</strong>
                        Standardized production for this CAD component is pre-allocated under <span className="font-semibold text-slate-200">{selectedComponent.futureSupplierPlaceholder}</span>.
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. AUDIT LOGS LEDGER TAB */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-200 uppercase font-mono tracking-wider">
                Compliance & Quality Control Ledger
              </h2>
              <p className="text-[11px] text-slate-500 mt-1">
                A tamper-proof audit log detailing system actions, role switches, and container clearances.
              </p>
            </div>

            <button
              onClick={() => {
                packagingRegistry.clearAuditLogs();
                onRefresh();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-950 border border-slate-900 hover:border-slate-800 text-rose-400 hover:bg-slate-900 rounded font-mono transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Purge Audit Trail</span>
            </button>
          </div>

          <div className="bg-[#0C111E]/80 border border-slate-900 rounded-lg overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-950/60 border-b border-slate-900 grid grid-cols-5 text-[10px] font-mono text-slate-500 uppercase">
              <span className="col-span-1">Action & Date</span>
              <span className="col-span-1">Tenant Role</span>
              <span className="col-span-1">Department</span>
              <span className="col-span-2">Details Narrative</span>
            </div>

            <div className="divide-y divide-slate-900/45 max-h-[500px] overflow-y-auto">
              {auditLogs.map(log => (
                <div key={log.id} className="px-4 py-3.5 grid grid-cols-5 text-xs font-sans text-slate-300 hover:bg-slate-950/20 transition">
                  <div className="col-span-1 flex flex-col justify-center">
                    <span className="font-mono text-cyan-400 font-semibold">{log.action}</span>
                    <span className="text-[9px] text-slate-500 font-mono mt-0.5">
                      {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="col-span-1 flex items-center text-slate-400 font-mono text-[11px]">
                    {log.userRole}
                  </div>
                  <div className="col-span-1 flex items-center text-slate-500 text-[11px]">
                    {log.department}
                  </div>
                  <div className="col-span-2 flex items-center pr-4 leading-normal text-slate-300 text-[11px]">
                    {log.details}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. SECURITY POLICY MATRIX TAB */}
      {activeTab === 'security' && (
        <div className="bg-[#0C111E]/80 border border-slate-900 rounded-lg p-6 space-y-6">
          <div>
            <h2 className="text-sm font-bold text-slate-200 uppercase font-mono tracking-wider">
              IAM Security & Sandbox Isolation Policy
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              JNAS Multi-Profile Gatekeeping security policies applied across R&D, Packaging, and QA.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-slate-950/40 rounded border border-slate-900/40 space-y-3.5">
              <h3 className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Active Isolation Role Matrix</span>
              </h3>
              
              <div className="space-y-2.5 text-[11px] leading-relaxed text-slate-400">
                <div className="flex items-start justify-between border-b border-slate-900/60 pb-2">
                  <div>
                    <span className="text-slate-300 block font-semibold">Packaging Engineer Profile:</span>
                    <span>Granted permissions to create and edit custom packaging assemblies, specify materials, and promote revision numbers.</span>
                  </div>
                  <span className="text-emerald-400 font-mono text-[10px] bg-emerald-950/20 px-1 py-0.2 rounded border border-emerald-900/30">Active</span>
                </div>

                <div className="flex items-start justify-between border-b border-slate-900/60 pb-2">
                  <div>
                    <span className="text-slate-300 block font-semibold">Engineering Manager Profile:</span>
                    <span>Granted unrestricted write permissions across materials and design processes. Authorized to sign off and approve designs.</span>
                  </div>
                  <span className="text-emerald-400 font-mono text-[10px] bg-emerald-950/20 px-1 py-0.2 rounded border border-emerald-900/30">Active</span>
                </div>

                <div className="flex items-start justify-between pb-1">
                  <div>
                    <span className="text-slate-300 block font-semibold">Quality Inspector Profile:</span>
                    <span>Authorized to perform physical stress review clearances. Exclusively restricted from modifying dimensional drawings.</span>
                  </div>
                  <span className="text-emerald-400 font-mono text-[10px] bg-emerald-950/20 px-1 py-0.2 rounded border border-emerald-900/30">Active</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-rose-950/10 rounded border border-rose-900/30 flex gap-3 text-xs leading-normal text-rose-300">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              <div>
                <span className="font-semibold block mb-0.5">Physical Revision Locks Imposed:</span>
                Once a design has been approved by the quality inspector, it enters a "Released" state lock. Any subsequent alterations require a require a formal R+1 revision promotion, preserving complete digital lineage.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. PACKAGING DESIGNS TAB */}
      {activeTab === 'designs' && (
        <PackagingDesignWorkspace
          designs={designs}
          materials={materials}
          components={components}
          role={role}
          department={department}
          searchQuery={searchQuery}
          setSearchQuery={(q) => {}}
          onRefresh={onRefresh}
        />
      )}

      {/* 8. VALIDATION RULES & ENGINE TAB */}
      {activeTab === 'rules' && (
        <PackagingValidationWorkspace
          designs={designs}
          rules={rules}
          validationRuns={validationRuns}
          role={role}
          department={department}
          onRefresh={onRefresh}
        />
      )}

      {/* 9. LOGISTICS & LOAD PLANNING TAB */}
      {activeTab === 'logistics' && (
        <LoadPlanningWorkspace
          role={role}
          department={department}
          onRefresh={onRefresh}
        />
      )}

      {/* 10. RETURNABLE LIFECYCLE ASSET TRACKING TAB */}
      {activeTab === 'returnables' && (
        <ReturnableAssetWorkspace
          role={role}
          department={department}
          onRefresh={onRefresh}
        />
      )}

      {/* --- CREATE NEW PROJECT WIZARD MODAL --- */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#0C111E] border border-slate-900 rounded-lg p-6 shadow-2xl relative">
            <h3 className="text-sm font-bold text-slate-100 uppercase font-mono tracking-wider mb-4">
              Create Packaging Specification
            </h3>

            <form onSubmit={handleCreateProject} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-500 block">Assembly Name *</label>
                  <input
                    type="text"
                    required
                    value={newProjName}
                    onChange={(e) => setNewProjName(e.target.value)}
                    placeholder="Thrust Chamber Transport Skids"
                    className="w-full p-2 bg-slate-950 border border-slate-900 rounded text-slate-300 placeholder-slate-700 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 block">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={newProjCustomer}
                    onChange={(e) => setNewProjCustomer(e.target.value)}
                    placeholder="SpaceX Falcon Team"
                    className="w-full p-2 bg-slate-950 border border-slate-900 rounded text-slate-300 placeholder-slate-700 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-500 block">Packaging Classification</label>
                  <select
                    value={newProjType}
                    onChange={(e) => setNewProjType(e.target.value as PackagingType)}
                    className="w-full p-2 bg-slate-950 border border-slate-900 rounded text-slate-300 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Wooden Crate">Wooden Crate</option>
                    <option value="Plastic Tote">Plastic Tote</option>
                    <option value="Steel Rack">Steel Rack</option>
                    <option value="Kit Cart">Kit Cart</option>
                    <option value="Corrugated Box">Corrugated Box</option>
                    <option value="Pallet">Pallet</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 block">Priority Level</label>
                  <select
                    value={newProjPriority}
                    onChange={(e) => setNewProjPriority(e.target.value as PackagingPriority)}
                    className="w-full p-2 bg-slate-950 border border-slate-900 rounded text-slate-300 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-500 block">Max Weight Rating (kg)</label>
                  <input
                    type="number"
                    value={newProjWeight}
                    onChange={(e) => setNewProjWeight(Number(e.target.value))}
                    className="w-full p-2 bg-slate-950 border border-slate-900 rounded text-slate-300 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 block">Linked CAD Drawing Number</label>
                  <input
                    type="text"
                    value={newProjDwgRef}
                    onChange={(e) => setNewProjDwgRef(e.target.value)}
                    placeholder="JNAS-PROP-002"
                    className="w-full p-2 bg-slate-950 border border-slate-900 rounded text-slate-300 placeholder-slate-700 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              {/* Dimensional measurements */}
              <div className="space-y-1">
                <label className="text-slate-500 block">Dimensions Outer (L x W x H mm)</label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="number"
                    value={newProjDimL}
                    onChange={(e) => setNewProjDimL(Number(e.target.value))}
                    className="w-full p-2 bg-slate-950 border border-slate-900 rounded text-slate-300 focus:outline-none focus:border-cyan-500 font-mono text-center"
                    placeholder="Length"
                  />
                  <input
                    type="number"
                    value={newProjDimW}
                    onChange={(e) => setNewProjDimW(Number(e.target.value))}
                    className="w-full p-2 bg-slate-950 border border-slate-900 rounded text-slate-300 focus:outline-none focus:border-cyan-500 font-mono text-center"
                    placeholder="Width"
                  />
                  <input
                    type="number"
                    value={newProjDimH}
                    onChange={(e) => setNewProjDimH(Number(e.target.value))}
                    className="w-full p-2 bg-slate-950 border border-slate-900 rounded text-slate-300 focus:outline-none focus:border-cyan-500 font-mono text-center"
                    placeholder="Height"
                  />
                </div>
              </div>

              <div className="p-3.5 bg-slate-950/40 border border-slate-900 rounded space-y-3">
                <span className="font-semibold block text-slate-400">Integrated Custom Dunnage Configurator</span>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-500 block">Dunnage Compound</label>
                    <select
                      value={newProjDunnageMat}
                      onChange={(e) => setNewProjDunnageMat(e.target.value)}
                      className="w-full p-2 bg-slate-950 border border-slate-900 rounded text-slate-300 focus:outline-none focus:border-cyan-500"
                    >
                      {materials.map(m => (
                        <option key={m.id} value={m.code}>{m.name} ({m.code})</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-500 block">Cavities Pockets</label>
                    <input
                      type="number"
                      value={newProjDunnagePockets}
                      onChange={(e) => setNewProjDunnagePockets(Number(e.target.value))}
                      className="w-full p-2 bg-slate-950 border border-slate-900 rounded text-slate-300 focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newProjDunnageAntiStatic}
                    onChange={(e) => setNewProjDunnageAntiStatic(e.target.checked)}
                    className="rounded border-slate-900 bg-slate-950 text-cyan-500 focus:ring-0"
                    id="antistatic_opt"
                  />
                  <label htmlFor="antistatic_opt" className="text-slate-400 cursor-pointer select-none">ESD Anti-Static Dissipative coating</label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-500 text-slate-950 font-semibold rounded hover:bg-cyan-400 transition"
                >
                  Create Specification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- REGISTER NEW MATERIAL MODAL (DETAILED) --- */}
      {isCreateMaterialOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#0C111E] border border-slate-900 rounded-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-sm font-bold text-slate-100 uppercase font-mono tracking-wider mb-4">
              Register Material Compound
            </h3>

            <form onSubmit={handleCreateMaterial} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-500 block">Material Standard Code *</label>
                  <input
                    type="text"
                    required
                    value={matCode}
                    onChange={(e) => setMatCode(e.target.value)}
                    placeholder="ESD-HDPE-10"
                    className="w-full p-2 bg-slate-950 border border-slate-900 rounded text-slate-300 placeholder-slate-700 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 block">Compound Commercial Name *</label>
                  <input
                    type="text"
                    required
                    value={matName}
                    onChange={(e) => setMatName(e.target.value)}
                    placeholder="Stat-Kon High Dissipative Polymer"
                    className="w-full p-2 bg-slate-950 border border-slate-900 rounded text-slate-300 placeholder-slate-700 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-500 block">Material Category</label>
                  <select
                    value={matCat}
                    onChange={(e) => setMatCat(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-900 rounded text-slate-300 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Steel">Steel</option>
                    <option value="Aluminium">Aluminium</option>
                    <option value="Plastic">Plastic</option>
                    <option value="HDPE">HDPE</option>
                    <option value="PP">PP</option>
                    <option value="ABS">ABS</option>
                    <option value="Foam">Foam</option>
                    <option value="Wood">Wood</option>
                    <option value="Plywood">Plywood</option>
                    <option value="Corrugated">Corrugated</option>
                    <option value="Paper">Paper</option>
                    <option value="Rubber">Rubber</option>
                    <option value="Fabric">Fabric</option>
                    <option value="Fasteners">Fasteners</option>
                    <option value="Labels">Labels</option>
                    <option value="Dunnage">Dunnage</option>
                    <option value="Protective Material">Protective Material</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 block">Subcategory</label>
                  <input
                    type="text"
                    value={matSubcat}
                    onChange={(e) => setMatSubcat(e.target.value)}
                    placeholder="Extruded Poly Sheet"
                    className="w-full p-2 bg-slate-950 border border-slate-900 rounded text-slate-300 placeholder-slate-700 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 block">Material Description Narrative</label>
                <textarea
                  value={matDesc}
                  onChange={(e) => setMatDesc(e.target.value)}
                  placeholder="High reliability electrostatic dissipative compound configured for thermoforming custom tray inserts."
                  rows={2}
                  className="w-full p-2 bg-slate-950 border border-slate-900 rounded text-slate-300 placeholder-slate-700 focus:outline-none focus:border-cyan-500 text-xs resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-500 block">Material Type Class</label>
                  <input
                    type="text"
                    value={matTypeStr}
                    onChange={(e) => setMatTypeStr(e.target.value)}
                    placeholder="Polymer, Metal, Composite, Organic"
                    className="w-full p-2 bg-slate-950 border border-slate-900 rounded text-slate-300 placeholder-slate-700 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 block">Grade standard</label>
                  <input
                    type="text"
                    value={matGrade}
                    onChange={(e) => setMatGrade(e.target.value)}
                    placeholder="ESD, Food-Grade, Structural"
                    className="w-full p-2 bg-slate-950 border border-slate-900 rounded text-slate-300 placeholder-slate-700 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-slate-500 block">Density Standard</label>
                  <input
                    type="text"
                    value={matDensity}
                    onChange={(e) => setMatDensity(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-900 rounded text-slate-300 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 block">Thickness (Nominal)</label>
                  <input
                    type="text"
                    value={matThickness}
                    onChange={(e) => setMatThickness(e.target.value)}
                    placeholder="3.2 mm"
                    className="w-full p-2 bg-slate-950 border border-slate-900 rounded text-slate-300 placeholder-slate-750 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 block">Nominal Envelope</label>
                  <input
                    type="text"
                    value={matDimensions}
                    onChange={(e) => setMatDimensions(e.target.value)}
                    placeholder="1220mm x 2440mm"
                    className="w-full p-2 bg-slate-950 border border-slate-900 rounded text-slate-300 placeholder-slate-750 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-slate-500 block">Color Finish</label>
                  <input
                    type="text"
                    value={matColor}
                    onChange={(e) => setMatColor(e.target.value)}
                    placeholder="Opaque Black"
                    className="w-full p-2 bg-slate-950 border border-slate-900 rounded text-slate-300 placeholder-slate-750 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 block">Finish Texture</label>
                  <input
                    type="text"
                    value={matFinish}
                    onChange={(e) => setMatFinish(e.target.value)}
                    placeholder="Sanded, Matte, Gloss"
                    className="w-full p-2 bg-slate-950 border border-slate-900 rounded text-slate-300 placeholder-slate-750 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 block">Surface Treatment</label>
                  <input
                    type="text"
                    value={matTreatment}
                    onChange={(e) => setMatTreatment(e.target.value)}
                    placeholder="ESD Coating"
                    className="w-full p-2 bg-slate-950 border border-slate-900 rounded text-slate-300 placeholder-slate-750 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-slate-500 block">Manufacturer</label>
                  <input
                    type="text"
                    required
                    value={matMfg}
                    onChange={(e) => setMatMfg(e.target.value)}
                    placeholder="Sabic Polymers"
                    className="w-full p-2 bg-slate-950 border border-slate-900 rounded text-slate-300 placeholder-slate-750 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 block">Supplier Reference</label>
                  <input
                    type="text"
                    value={matSupplier}
                    onChange={(e) => setMatSupplier(e.target.value)}
                    placeholder="Allied Plastics"
                    className="w-full p-2 bg-slate-950 border border-slate-900 rounded text-slate-300 placeholder-slate-750 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 block">Revision Code</label>
                  <input
                    type="text"
                    value={matRev}
                    onChange={(e) => setMatRev(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-900 rounded text-slate-300 focus:outline-none focus:border-cyan-500 font-mono text-center"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-slate-950/40 p-3 rounded border border-slate-900">
                <div className="space-y-1">
                  <label className="text-slate-500 block">Billing Unit</label>
                  <input
                    type="text"
                    value={matUnit}
                    onChange={(e) => setMatUnit(e.target.value)}
                    placeholder="sheet, kg, roll"
                    className="w-full p-2 bg-[#070B13] border border-slate-900 rounded text-slate-300 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 block">Cost per Unit ($)</label>
                  <input
                    type="number"
                    value={matCost}
                    onChange={(e) => setMatCost(Number(e.target.value))}
                    className="w-full p-2 bg-[#070B13] border border-slate-900 rounded text-slate-300 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 block">Lifecycle Status</label>
                  <select
                    value={matLifecycle}
                    onChange={(e) => setMatLifecycle(e.target.value as any)}
                    className="w-full p-2 bg-[#070B13] border border-slate-900 rounded text-slate-300 focus:outline-none focus:border-cyan-500 text-xs"
                  >
                    <option value="Candidate">Candidate</option>
                    <option value="Approved">Approved</option>
                    <option value="Obsolete">Obsolete</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 block">Tags (Comma separated) *</label>
                <input
                  type="text"
                  value={matTagsStr}
                  onChange={(e) => setMatTagsStr(e.target.value)}
                  placeholder="ESD, HDPE, Cushion, Protective"
                  className="w-full p-2 bg-slate-950 border border-slate-900 rounded text-slate-300 placeholder-slate-700 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateMaterialOpen(false)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 text-slate-950 font-semibold rounded hover:bg-emerald-400 transition"
                >
                  Register Compound
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- REGISTER NEW COMPONENT MODAL --- */}
      {isCreateComponentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#0C111E] border border-slate-900 rounded-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-sm font-bold text-slate-100 uppercase font-mono tracking-wider mb-4">
              Register Packaging Component
            </h3>

            <form onSubmit={handleCreateComponent} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-500 block">Component Code *</label>
                  <input
                    type="text"
                    required
                    value={compCode}
                    onChange={(e) => setCompCode(e.target.value)}
                    placeholder="CMP-TR-ESD-02"
                    className="w-full p-2 bg-slate-950 border border-slate-900 rounded text-slate-300 placeholder-slate-700 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 block">Component Name *</label>
                  <input
                    type="text"
                    required
                    value={compName}
                    onChange={(e) => setCompName(e.target.value)}
                    placeholder="PCB Thermoformed Slotted Tray"
                    className="w-full p-2 bg-slate-950 border border-slate-900 rounded text-slate-300 placeholder-slate-700 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 block">Component Description *</label>
                <textarea
                  value={compDesc}
                  onChange={(e) => setCompDesc(e.target.value)}
                  placeholder="Custom vacuum formed ESD protective slotted tray configured with 12 structural holding channels."
                  rows={2}
                  className="w-full p-2 bg-slate-950 border border-slate-900 rounded text-slate-300 placeholder-slate-700 focus:outline-none focus:border-cyan-500 text-xs resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-500 block">Component Category</label>
                  <select
                    value={compCat}
                    onChange={(e) => setCompCat(e.target.value as any)}
                    className="w-full p-2 bg-slate-950 border border-slate-900 rounded text-slate-300 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Cushion">Cushion</option>
                    <option value="Divider">Divider</option>
                    <option value="Spacer">Spacer</option>
                    <option value="Brace">Brace</option>
                    <option value="Fastener">Fastener</option>
                    <option value="Label">Label</option>
                    <option value="Handle">Handle</option>
                    <option value="Caster">Caster</option>
                    <option value="Lid">Lid</option>
                    <option value="Base">Base</option>
                    <option value="Dunnage Insert">Dunnage Insert</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 block">Select Material Compound *</label>
                  <select
                    required
                    value={compMatId}
                    onChange={(e) => setCompMatId(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-900 rounded text-slate-300 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">-- Choose Compound --</option>
                    {materials.map(m => (
                      <option key={m.id} value={m.id}>{m.name} ({m.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-500 block">Drawing Reference Code</label>
                  <input
                    type="text"
                    value={compDrawing}
                    onChange={(e) => setCompDrawing(e.target.value)}
                    placeholder="dwg-avion-402"
                    className="w-full p-2 bg-slate-950 border border-slate-900 rounded text-slate-300 placeholder-slate-700 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 block">CAD Model Asset Name</label>
                  <input
                    type="text"
                    value={compAsset}
                    onChange={(e) => setCompAsset(e.target.value)}
                    placeholder="Primary Structural Lid model"
                    className="w-full p-2 bg-slate-950 border border-slate-900 rounded text-slate-300 placeholder-slate-700 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-slate-500 block">Part Number</label>
                  <input
                    type="text"
                    value={compPart}
                    onChange={(e) => setCompPart(e.target.value)}
                    placeholder="PN-990-ESD"
                    className="w-full p-2 bg-slate-950 border border-slate-900 rounded text-slate-300 placeholder-slate-700 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 block">Revision</label>
                  <input
                    type="text"
                    value={compRev}
                    onChange={(e) => setCompRev(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-900 rounded text-slate-300 focus:outline-none focus:border-cyan-500 font-mono text-center"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 block">Ecosystem Status</label>
                  <select
                    value={compStatus}
                    onChange={(e) => setCompStatus(e.target.value as any)}
                    className="w-full p-2 bg-slate-950 border border-slate-900 rounded text-slate-300 focus:outline-none focus:border-cyan-500 text-xs"
                  >
                    <option value="Active">Active</option>
                    <option value="In Design">In Design</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Obsolete">Obsolete</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-slate-950/40 p-3 rounded border border-slate-900">
                <div className="space-y-1">
                  <label className="text-slate-500 block">Linked Project</label>
                  <select
                    value={compProjectId}
                    onChange={(e) => setCompProjectId(e.target.value)}
                    className="w-full p-2 bg-[#070B13] border border-slate-900 rounded text-slate-300 focus:outline-none focus:border-cyan-500 text-xs"
                  >
                    <option value="">-- Mapped Project --</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.projectName} ({p.projectNumber})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 block">Customer ID Link</label>
                  <input
                    type="text"
                    value={compCustId}
                    onChange={(e) => setCompCustId(e.target.value)}
                    placeholder="cust-spacex-02"
                    className="w-full p-2 bg-[#070B13] border border-slate-900 rounded text-slate-300 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 block">Supplier allocation</label>
                  <input
                    type="text"
                    value={compSupplier}
                    onChange={(e) => setCompSupplier(e.target.value)}
                    placeholder="Sabic Plastics"
                    className="w-full p-2 bg-[#070B13] border border-slate-900 rounded text-slate-300 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateComponentOpen(false)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-500 text-slate-950 font-semibold rounded hover:bg-cyan-400 transition"
                >
                  Register Component
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- LINK QUALITY STANDARDS DIALOG MODAL --- */}
      {isLinkStandardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#0C111E] border border-slate-900 rounded-lg p-6 shadow-2xl relative">
            <h3 className="text-sm font-bold text-slate-100 uppercase font-mono tracking-wider mb-4">
              Formal Compliance Standard Link
            </h3>

            <form onSubmit={handleLinkStandardSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-500 block">Select Material Compound *</label>
                <select
                  required
                  value={linkMaterialId}
                  onChange={(e) => setLinkMaterialId(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-900 rounded text-slate-300 focus:outline-none focus:border-cyan-500"
                >
                  <option value="">-- Choose Compound --</option>
                  {materials.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.code})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 block">Select Compliance Standard *</label>
                <select
                  required
                  value={linkStandardId}
                  onChange={(e) => setLinkStandardId(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-900 rounded text-slate-300 focus:outline-none focus:border-cyan-500"
                >
                  <option value="">-- Choose Standard --</option>
                  {standards.map(s => (
                    <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLinkStandardOpen(false)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-500 text-slate-950 font-semibold rounded hover:bg-cyan-400 transition"
                >
                  Establish Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

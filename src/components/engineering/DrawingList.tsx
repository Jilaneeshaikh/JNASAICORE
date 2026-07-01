import React, { useState } from 'react';
import {
  Grid,
  List,
  Plus,
  FileCode,
  LayoutList,
  FolderPlus,
  Compass,
  ArrowUpDown,
  X,
  AlertTriangle,
  FolderOpen,
  Trash2
} from 'lucide-react';
import { Drawing, DrawingCategory, DrawingStatus, ApprovalStatus } from '../../backend/engineering/types';
import { DrawingCard } from './DrawingCard';
import { EngineeringRegistry } from '../../backend/engineering/registry';
import { ProjectRegistry } from '../../backend/projects/registry';
import { CustomerRegistry } from '../../backend/customers/registry';
import { DSBadge, DSAlert } from '../design-system/DSStatus';

interface DrawingListProps {
  drawings: Drawing[];
  onUpdate: () => void;
  activeRole: string;
}

export const DrawingList: React.FC<DrawingListProps> = ({ drawings, onUpdate, activeRole }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'drawingNumber' | 'title' | 'updatedAt'>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Create Drawing Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Form fields
  const [drawingNumber, setDrawingNumber] = useState('');
  const [revision, setRevision] = useState('A.01');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<DrawingCategory>('Mechanical');
  const [projectId, setProjectId] = useState('prj-jet-propulsion');
  const [customerId, setCustomerId] = useState('cust-jda');
  const [standardsRaw, setStandardsRaw] = useState('');
  const [partsRaw, setPartsRaw] = useState('');
  const [cadName, setCadName] = useState('');

  const registry = EngineeringRegistry.getInstance();
  const projectRegistry = ProjectRegistry.getInstance();
  const customerRegistry = CustomerRegistry.getInstance();

  const projects = projectRegistry.getProjects();
  const customers = customerRegistry.getCustomers();

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const sortedDrawings = [...drawings].sort((a, b) => {
    let valA: string | number = a[sortBy] || '';
    let valB: string | number = b[sortBy] || '';

    if (sortBy === 'updatedAt') {
      valA = new Date(a.updatedAt).getTime();
      valB = new Date(b.updatedAt).getTime();
    }

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const handleDeleteDrawing = (id: string) => {
    if (confirm('Are you sure you want to delete this drawing blueprint? This action is irreversible.')) {
      try {
        registry.deleteDrawing(id);
        onUpdate();
      } catch (err: any) {
        alert(err.message || 'Deletion failed.');
      }
    }
  };

  const handleCreateDrawingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!drawingNumber.trim() || !title.trim() || !description.trim()) {
      setErrorMsg('Please complete all required fields (*).');
      return;
    }

    try {
      const standards = standardsRaw
        ? standardsRaw.split(',').map((s) => s.trim()).filter(Boolean)
        : [];
      const relatedParts = partsRaw
        ? partsRaw.split(',').map((p) => p.trim()).filter(Boolean)
        : [];

      const futureCADFile = cadName.trim()
        ? {
            format: cadName.toUpperCase().endsWith('.STEP') || cadName.toUpperCase().endsWith('.STP') ? 'STEP' :
                    cadName.toUpperCase().endsWith('.DWG') ? 'DWG' :
                    cadName.toUpperCase().endsWith('.DXF') ? 'DXF' : 'IGES' as any,
            fileName: cadName.trim(),
            fileSizeMb: parseFloat((Math.random() * 15 + 2).toFixed(2))
          }
        : undefined;

      // Default high quality BOM simulation based on category
      const relatedBOM = [
        { partNumber: `${drawingNumber}-P1`, name: `${title} core body composite`, quantity: 1, unit: 'pcs', material: 'Alloy Core', source: 'In-House' as const },
        { partNumber: 'FAST-M6-TI', name: 'M6 Titanium Hex fastener', quantity: 8, unit: 'pcs', material: 'Ti-6Al-4V', source: 'Purchased' as const }
      ];

      registry.createDrawing({
        drawingNumber: drawingNumber.toUpperCase().trim(),
        revision,
        title: title.trim(),
        description: description.trim(),
        category,
        owner: 'Operator Lead',
        projectId,
        customerId,
        status: 'Draft',
        approvalStatus: 'Pending',
        relatedDocuments: [],
        relatedParts,
        relatedBOM,
        relatedStandards: standards.length > 0 ? standards : ['AS9100 Rev D'],
        futureCADFile
      });

      // Reset form & close
      setDrawingNumber('');
      setTitle('');
      setDescription('');
      setStandardsRaw('');
      setPartsRaw('');
      setCadName('');
      setIsOpen(false);
      onUpdate();
    } catch (err: any) {
      setErrorMsg(err.message || 'Permission denied or creation failed.');
    }
  };

  const hasCreatePermission = registry.hasPermission('CreateDraft');

  return (
    <div className="space-y-4">
      {/* List Toolbar Panel */}
      <div className="flex items-center justify-between bg-[#0B0E17] border border-[#141F33] p-3 rounded-lg shadow">
        <div className="flex items-center gap-1">
          <FileCode className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
            BLUEPRINT LEDGER ({sortedDrawings.length} Drawings found)
          </h3>
        </div>

        <div className="flex items-center gap-3">
          {/* Sorters */}
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
            <span className="text-slate-500">Sort:</span>
            <button
              onClick={() => handleSort('drawingNumber')}
              className={`hover:text-cyan-400 flex items-center gap-0.5 px-1.5 py-0.5 rounded ${
                sortBy === 'drawingNumber' ? 'bg-[#162137] text-cyan-400 font-bold' : ''
              }`}
            >
              Number <ArrowUpDown className="w-3 h-3" />
            </button>
            <button
              onClick={() => handleSort('title')}
              className={`hover:text-cyan-400 flex items-center gap-0.5 px-1.5 py-0.5 rounded ${
                sortBy === 'title' ? 'bg-[#162137] text-cyan-400 font-bold' : ''
              }`}
            >
              Title <ArrowUpDown className="w-3 h-3" />
            </button>
            <button
              onClick={() => handleSort('updatedAt')}
              className={`hover:text-cyan-400 flex items-center gap-0.5 px-1.5 py-0.5 rounded ${
                sortBy === 'updatedAt' ? 'bg-[#162137] text-cyan-400 font-bold' : ''
              }`}
            >
              Recent <ArrowUpDown className="w-3 h-3" />
            </button>
          </div>

          <div className="h-4 w-px bg-slate-800" />

          {/* Grid/List View Toggles */}
          <div className="flex items-center bg-[#070B14] p-0.5 border border-[#162137] rounded">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded ${viewMode === 'grid' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}
              title="Grid View"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1 rounded ${viewMode === 'list' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add Drawing Trigger */}
          <button
            onClick={() => {
              if (!hasCreatePermission) {
                alert(`Permission Denied: Your active role [${activeRole}] is forbidden from drafting new blueprints.`);
                return;
              }
              setIsOpen(true);
            }}
            className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-slate-950 font-sans font-bold text-xs px-3 py-1.5 rounded transition-all shadow-lg active:scale-95"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            <span>Create Drawing</span>
          </button>
        </div>
      </div>

      {/* Main Listing Viewport */}
      {sortedDrawings.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed border-slate-800 bg-[#0B0E17]/30 rounded-lg text-center space-y-3">
          <FolderOpen className="w-10 h-10 text-slate-600" />
          <div>
            <h4 className="text-xs font-mono font-bold text-slate-300 uppercase">No matching blueprints found</h4>
            <p className="text-[11px] text-slate-500 max-w-sm mt-1">
              Adjust your filter configurations or check active search query variables in the header nodes.
            </p>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedDrawings.map((drawing) => (
            <DrawingCard
              key={drawing.id}
              drawing={drawing}
              onUpdate={onUpdate}
              onDelete={() => handleDeleteDrawing(drawing.id)}
              activeRole={activeRole}
            />
          ))}
        </div>
      ) : (
        /* List View Mode */
        <div className="bg-[#080C14] border border-[#141F33] rounded-lg overflow-hidden shadow-xl">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="bg-[#0B0F19] text-slate-400 border-b border-[#141F33]">
                <th className="p-3">Drawing Number</th>
                <th className="p-3">Title & Summary</th>
                <th className="p-3">Category</th>
                <th className="p-3">Owner</th>
                <th className="p-3">Lifecycle</th>
                <th className="p-3">Quality</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#141F33] text-slate-200">
              {sortedDrawings.map((drawing) => {
                const isSelected = localStorage.getItem('jnas-active-drawing-id') === drawing.id;
                return (
                  <tr
                    key={drawing.id}
                    onClick={() => {
                      localStorage.setItem('jnas-active-drawing-id', drawing.id);
                      registry.addAuditLog('Drawing Selected', drawing.id, 'Drawing', `Set active drawing workspace target to ${drawing.drawingNumber}`);
                      onUpdate();
                    }}
                    className={`hover:bg-[#121929]/40 cursor-pointer transition-colors ${isSelected ? 'bg-cyan-950/20 text-cyan-400 font-medium' : ''}`}
                  >
                    <td className="p-3 font-semibold text-cyan-400">
                      <span className="flex items-center gap-1.5">
                        <FileCode className="w-4 h-4 text-slate-400" />
                        <span>{drawing.drawingNumber}</span>
                        <span className="text-[9px] text-slate-500 font-bold">R{drawing.revision}</span>
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="font-sans font-bold text-xs text-slate-100">{drawing.title}</div>
                      <div className="text-[10px] text-slate-400 line-clamp-1 max-w-sm mt-0.5">{drawing.description}</div>
                    </td>
                    <td className="p-3 text-[10px] text-slate-300">{drawing.category}</td>
                    <td className="p-3 text-slate-400">{drawing.owner}</td>
                    <td className="p-3">
                      <span className={`font-bold ${drawing.status === 'Released' ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {drawing.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`font-bold ${drawing.approvalStatus === 'Approved' ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {drawing.approvalStatus}
                      </span>
                    </td>
                    <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            localStorage.setItem('jnas-active-drawing-id', drawing.id);
                            onUpdate();
                          }}
                          className="px-2 py-1 bg-slate-900 border border-slate-800 text-[10px] rounded hover:border-cyan-500 hover:text-cyan-400"
                        >
                          Select
                        </button>
                        {activeRole === 'Lead Engineer' && (
                          <button
                            onClick={() => handleDeleteDrawing(drawing.id)}
                            className="p-1 bg-transparent hover:bg-rose-950/20 text-slate-500 hover:text-rose-400 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE DRAWING MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0A0E17] border border-[#1A263E] rounded-lg w-full max-w-lg shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-[#141F33] bg-[#0C1221] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                  DRAFT NEW CAD SCHEMATIC
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-500 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form body */}
            <form onSubmit={handleCreateDrawingSubmit} className="p-4 space-y-4 text-xs">
              {errorMsg && (
                <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded font-mono text-[11px] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                {/* Drawing Number */}
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold font-mono">Drawing Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. JNAS-MECH-1002"
                    value={drawingNumber}
                    onChange={(e) => setDrawingNumber(e.target.value)}
                    className="w-full bg-[#070B14] border border-[#1A263E] rounded p-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
                  />
                </div>

                {/* Revision */}
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold font-mono">Revision Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. A.01"
                    value={revision}
                    onChange={(e) => setRevision(e.target.value)}
                    className="w-full bg-[#070B14] border border-[#1A263E] rounded p-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
                  />
                </div>
              </div>

              {/* Title */}
              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Blueprint Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Titanium Thrust Exhaust Cone Base Flange"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#070B14] border border-[#1A263E] rounded p-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-sans"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Technical Description & Design Specifications *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Summarize coordinates, thermal/stress tolerance vectors, and material composition limits..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#070B14] border border-[#1A263E] rounded p-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Category */}
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold font-mono">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-[#070B14] border border-[#1A263E] rounded p-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  >
                    <option value="Mechanical">Mechanical</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Structural">Structural</option>
                    <option value="Civil">Civil</option>
                    <option value="Simulation">Simulation</option>
                    <option value="Packaging">Packaging</option>
                    <option value="Automation">Automation</option>
                  </select>
                </div>

                {/* Simulated CAD Filename */}
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold font-mono">CAD File Package Mockup</label>
                  <input
                    type="text"
                    placeholder="e.g. JNAS_MECH_1002.stp"
                    value={cadName}
                    onChange={(e) => setCadName(e.target.value)}
                    className="w-full bg-[#070B14] border border-[#1A263E] rounded p-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Linked Project */}
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Project Association *</label>
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full bg-[#070B14] border border-[#1A263E] rounded p-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Linked Customer */}
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Customer / Sponsor *</label>
                  <select
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    className="w-full bg-[#070B14] border border-[#1A263E] rounded p-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.companyName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Related Standards comma list */}
                <div className="space-y-1">
                  <label className="text-slate-400 font-mono font-semibold">Linked Standards (comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. AS9100 Rev D, ASTM-B348"
                    value={standardsRaw}
                    onChange={(e) => setStandardsRaw(e.target.value)}
                    className="w-full bg-[#070B14] border border-[#1A263E] rounded p-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
                  />
                </div>

                {/* Related Parts comma list */}
                <div className="space-y-1">
                  <label className="text-slate-400 font-mono font-semibold">Related Parts (comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. CONE-BASE-02, SEAL-X9"
                    value={partsRaw}
                    onChange={(e) => setPartsRaw(e.target.value)}
                    className="w-full bg-[#070B14] border border-[#1A263E] rounded p-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-[#141F33] flex items-center justify-end gap-2 bg-[#0C1221] -mx-4 -mb-4 p-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-3.5 py-1.5 rounded bg-slate-900 border border-[#1A263E] hover:bg-slate-800 text-slate-300 font-sans"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold font-sans flex items-center gap-1 shadow-lg active:scale-95"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>Draft Blueprint</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

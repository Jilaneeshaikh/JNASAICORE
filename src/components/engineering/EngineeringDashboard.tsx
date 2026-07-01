import React from 'react';
import {
  FileCode,
  FileCheck,
  AlertTriangle,
  Star,
  Layers,
  Activity,
  UserCheck,
  Building,
  Compass,
  ArrowRight,
  TrendingUp,
  ExternalLink,
  ShieldAlert,
  FolderOpen
} from 'lucide-react';
import { Drawing } from '../../backend/engineering/types';
import { EngineeringRegistry } from '../../backend/engineering/registry';
import { ProjectRegistry } from '../../backend/projects/registry';
import { CustomerRegistry } from '../../backend/customers/registry';
import { DSBadge } from '../design-system/DSStatus';

interface EngineeringDashboardProps {
  drawings: Drawing[];
  onUpdate: () => void;
  activeRole: string;
  activeDept: string;
  onNavigateTab: (tab: 'dashboard' | 'drawings' | 'projects' | 'documents' | 'timeline' | 'security' | 'settings') => void;
}

export const EngineeringDashboard: React.FC<EngineeringDashboardProps> = ({
  drawings,
  onUpdate,
  activeRole,
  activeDept,
  onNavigateTab
}) => {
  const registry = EngineeringRegistry.getInstance();
  const projectRegistry = ProjectRegistry.getInstance();
  const customerRegistry = CustomerRegistry.getInstance();

  const totalDrawings = drawings.length;
  const releasedCount = drawings.filter((d) => d.status === 'Released').length;
  const pendingCount = drawings.filter((d) => d.approvalStatus === 'Pending').length;
  const inReviewCount = drawings.filter((d) => d.approvalStatus === 'In Review').length;

  // Favorites
  const favorites = drawings.filter((d) => registry.isFavorite(d.id));

  // Recents (last 4 modified)
  const recents = [...drawings]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 4);

  // Pending Actions
  const pendingActions = drawings.filter((d) => d.approvalStatus === 'Pending' || d.approvalStatus === 'In Review');

  const activeDrawingId = localStorage.getItem('jnas-active-drawing-id');
  const activeDrawing = activeDrawingId ? registry.getDrawingById(activeDrawingId) : null;

  const handleSelectDrawing = (id: string) => {
    localStorage.setItem('jnas-active-drawing-id', id);
    registry.addAuditLog('Drawing Selected', id, 'Drawing', `Set active drawing workspace target to ${id}`);
    onUpdate();
  };

  const handleApprovalChange = (id: string, appStatus: 'Approved' | 'Rejected') => {
    try {
      registry.updateDrawing(id, { approvalStatus: appStatus });
      onUpdate();
    } catch (err: any) {
      alert(err.message || 'Approval update failed.');
    }
  };

  const activeProjectId = localStorage.getItem('jnas-active-project-id');
  const activeProject = activeProjectId ? projectRegistry.getProject(activeProjectId) : null;

  return (
    <div className="space-y-6">
      
      {/* 1. Primary KPI Block (High Precision Badges) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Blueprints */}
        <div className="bg-[#0C111E] border border-[#152033] rounded-lg p-4 flex items-center gap-4 shadow-md">
          <div className="p-3 bg-cyan-950/40 rounded-lg text-cyan-400 border border-cyan-800/20">
            <FileCode className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-mono tracking-wider font-bold">TOTAL BLUEPRINTS</div>
            <div className="text-xl font-extrabold font-mono text-slate-100">{totalDrawings}</div>
            <div className="text-[9px] text-slate-400 font-sans mt-0.5">Tracked in master ledger</div>
          </div>
        </div>

        {/* Released Packages */}
        <div className="bg-[#0C111E] border border-[#152033] rounded-lg p-4 flex items-center gap-4 shadow-md">
          <div className="p-3 bg-emerald-950/40 rounded-lg text-emerald-400 border border-emerald-800/20">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-mono tracking-wider font-bold">RELEASED SYSTEMS</div>
            <div className="text-xl font-extrabold font-mono text-emerald-400">{releasedCount}</div>
            <div className="text-[9px] text-slate-400 font-sans mt-0.5">Active assembly pipelines</div>
          </div>
        </div>

        {/* Pending QA Signoffs */}
        <div className="bg-[#0C111E] border border-[#152033] rounded-lg p-4 flex items-center gap-4 shadow-md">
          <div className="p-3 bg-amber-950/40 rounded-lg text-amber-400 border border-amber-800/20">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-mono tracking-wider font-bold">QA PENDING AUDIT</div>
            <div className="text-xl font-extrabold font-mono text-amber-400">{pendingCount}</div>
            <div className="text-[9px] text-slate-400 font-sans mt-0.5">Awaiting physical compliance</div>
          </div>
        </div>

        {/* Active Dept Details */}
        <div className="bg-[#0C111E] border border-[#152033] rounded-lg p-4 flex items-center gap-4 shadow-md">
          <div className="p-3 bg-indigo-950/40 rounded-lg text-indigo-400 border border-indigo-800/20">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-mono tracking-wider font-bold">ACTIVE ISOLATION</div>
            <div className="text-xs font-bold text-slate-100 uppercase truncate max-w-[120px]">{activeDept}</div>
            <div className="text-[9px] font-mono text-cyan-400 font-semibold uppercase tracking-wider">{activeRole}</div>
          </div>
        </div>
      </div>

      {/* 2. Bento Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Active Drawing Context and Pending Reviews */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Target Panel */}
          <div className="bg-gradient-to-r from-cyan-950/30 via-indigo-950/10 to-transparent border border-cyan-800/40 rounded-lg p-5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Compass className="w-32 h-32 text-cyan-400" />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
                  </span>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-400">
                    ACTIVE CAD WORKSPACE target
                  </span>
                </div>

                <button
                  onClick={() => onNavigateTab('drawings')}
                  className="text-[10px] text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1 group"
                >
                  <span>Blueprint Registry</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </button>
              </div>

              {activeDrawing ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-2">
                    <div className="font-mono text-[10px] text-slate-500 font-bold uppercase">
                      {activeDrawing.category} / <span className="text-cyan-400">{activeDrawing.drawingNumber}</span>
                    </div>
                    <h3 className="text-sm font-extrabold text-slate-100 font-sans tracking-tight">
                      {activeDrawing.title}
                    </h3>
                    <p className="text-xs text-slate-400 font-light leading-relaxed max-w-md line-clamp-2">
                      {activeDrawing.description}
                    </p>
                  </div>

                  <div className="p-3 bg-[#080B13]/80 border border-[#162137] rounded-md font-mono text-[10px] space-y-2.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Revision:</span>
                      <span className="text-cyan-400 font-bold">R{activeDrawing.revision}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Status:</span>
                      <span className={`font-bold ${activeDrawing.status === 'Released' ? 'text-emerald-400' : 'text-amber-400'}`}>{activeDrawing.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Compliance:</span>
                      <span className={`font-bold ${activeDrawing.approvalStatus === 'Approved' ? 'text-emerald-400' : 'text-rose-400'}`}>{activeDrawing.approvalStatus}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-4 text-center text-slate-500 text-xs font-mono">
                  No active blueprint targeted. Click a drawing below or navigate to the Registry to establish the dynamic AI workspace context.
                </div>
              )}
            </div>
          </div>

          {/* Pending QA Compliance Reviews */}
          <div className="bg-[#0C111E] border border-[#152033] rounded-lg p-4 space-y-3.5 shadow-xl">
            <div className="border-b border-[#141F33] pb-2">
              <h4 className="text-xs font-mono font-bold text-slate-200 uppercase flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-cyan-400" />
                <span>Pending Compliance Reviews ({pendingActions.length})</span>
              </h4>
            </div>

            {pendingActions.length === 0 ? (
              <div className="p-8 text-center text-slate-500 font-mono text-[11px] bg-[#070B14] rounded">
                Ecosystem is perfectly synced with 100% QA clearance.
              </div>
            ) : (
              <div className="divide-y divide-slate-800 space-y-2 max-h-72 overflow-y-auto">
                {pendingActions.map((item) => (
                  <div key={item.id} className="pt-2.5 first:pt-0 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div onClick={() => handleSelectDrawing(item.id)} className="cursor-pointer group flex-1">
                      <div className="font-mono text-[10px] text-slate-500 font-semibold group-hover:text-cyan-400">
                        {item.drawingNumber} <span className="text-[#1D2E4D]">|</span> {item.category}
                      </div>
                      <div className="text-xs font-bold text-slate-200 mt-0.5 font-sans group-hover:text-white truncate max-w-[280px]">
                        {item.title}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        item.approvalStatus === 'In Review' ? 'bg-cyan-950/40 text-cyan-400' : 'bg-amber-950/40 text-amber-400'
                      }`}>
                        {item.approvalStatus}
                      </span>

                      {/* Quick Quality Controls if Lead/QA */}
                      {activeRole !== 'CAD Designer' && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleApprovalChange(item.id, 'Approved')}
                            className="bg-emerald-950 text-emerald-400 hover:bg-emerald-900 border border-emerald-800/40 text-[9px] font-mono px-2 py-1 rounded"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleApprovalChange(item.id, 'Rejected')}
                            className="bg-rose-950 text-rose-400 hover:bg-rose-900 border border-rose-800/40 text-[9px] font-mono px-2 py-1 rounded"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Recents and Favorites */}
        <div className="space-y-6">
          
          {/* Favorites blueprints */}
          <div className="bg-[#0C111E] border border-[#152033] rounded-lg p-4 space-y-3.5 shadow-xl">
            <div className="border-b border-[#141F33] pb-2 flex items-center justify-between">
              <h4 className="text-xs font-mono font-bold text-slate-200 uppercase flex items-center gap-1.5">
                <Star className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span>Saved Blueprints ({favorites.length})</span>
              </h4>
            </div>

            {favorites.length === 0 ? (
              <div className="p-6 text-center text-slate-500 font-mono text-[11px] bg-[#070B14] rounded">
                Star drawings in the registry for quick workspace access.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-56 overflow-y-auto">
                {favorites.map((fav) => (
                  <div
                    key={fav.id}
                    onClick={() => handleSelectDrawing(fav.id)}
                    className="p-2.5 bg-[#080B13] border border-[#142036] hover:border-[#1F2E4C] rounded-md cursor-pointer transition-colors"
                  >
                    <div className="font-mono text-[9px] text-cyan-400 font-semibold">{fav.drawingNumber}</div>
                    <div className="text-xs font-bold text-slate-200 mt-0.5 truncate">{fav.title}</div>
                    <div className="text-[9px] text-slate-500 font-mono mt-1.5 flex justify-between">
                      <span>R{fav.revision}</span>
                      <span>{fav.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recently Modified blueprints */}
          <div className="bg-[#0C111E] border border-[#152033] rounded-lg p-4 space-y-3.5 shadow-xl">
            <div className="border-b border-[#141F33] pb-2 flex items-center justify-between">
              <h4 className="text-xs font-mono font-bold text-slate-200 uppercase flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>Recent Modifications</span>
              </h4>
              <button
                onClick={() => onNavigateTab('timeline')}
                className="text-[9px] text-slate-500 hover:text-slate-300 font-mono flex items-center gap-0.5"
              >
                <span>Logs</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {recents.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectDrawing(item.id)}
                  className="p-2 bg-[#080B13]/60 border border-[#142036]/60 hover:border-cyan-800/40 rounded-md cursor-pointer transition-colors flex items-center justify-between gap-2"
                >
                  <div className="truncate">
                    <div className="font-mono text-[9px] text-slate-500">{item.drawingNumber}</div>
                    <div className="text-xs font-bold text-slate-300 truncate">{item.title}</div>
                  </div>
                  <span className="text-[8px] font-mono text-slate-500 shrink-0">
                    {new Date(item.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

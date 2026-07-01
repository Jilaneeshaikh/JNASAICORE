import React from 'react';
import { PackagingProject, PackagingMaterial, PackagingAuditLog, PackagingRole } from '../../backend/packaging/types';
import { Box, Layers, Database, ShieldAlert, FileSpreadsheet, Star, Activity, Sparkles, Plus, ArrowRight } from 'lucide-react';

interface PackagingDashboardProps {
  projects: PackagingProject[];
  materials: PackagingMaterial[];
  auditLogs: PackagingAuditLog[];
  role: PackagingRole;
  department: string;
  onSelectProject: (id: string) => void;
  onCreateTrigger: () => void;
  onNavigateTab: (tab: string) => void;
  onToggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

export const PackagingDashboard: React.FC<PackagingDashboardProps> = ({
  projects,
  materials,
  auditLogs,
  role,
  department,
  onSelectProject,
  onCreateTrigger,
  onNavigateTab,
  onToggleFavorite,
  isFavorite
}) => {
  // Stats calculations
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => ['Draft', 'Submitted', 'In Review', 'Active'].includes(p.status)).length;
  const approvedMaterialsCount = materials.filter(m => m.lifecycleStatus === 'Approved').length;
  const pendingAudits = projects.filter(p => p.approvalStatus === 'In Review' || p.approvalStatus === 'Pending').length;

  // Favorites list
  const starredProjects = projects.filter(p => isFavorite(p.id));

  return (
    <div className="space-y-6">
      {/* KPI Stats Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Widget 1 */}
        <div className="bg-slate-950/40 border border-slate-900 rounded-lg p-4 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl -mr-6 -mt-6" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Active Assemblies</span>
            <Box className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold font-mono text-cyan-400">{activeProjects}</h3>
            <p className="text-[10px] text-slate-500 mt-1">Of {totalProjects} total designs</p>
          </div>
        </div>

        {/* Widget 2 */}
        <div className="bg-slate-950/40 border border-slate-900 rounded-lg p-4 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl -mr-6 -mt-6" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Material Registry</span>
            <Database className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold font-mono text-emerald-400">{materials.length}</h3>
            <p className="text-[10px] text-slate-500 mt-1">{approvedMaterialsCount} aerospace-certified</p>
          </div>
        </div>

        {/* Widget 3 */}
        <div className="bg-slate-950/40 border border-slate-900 rounded-lg p-4 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl -mr-6 -mt-6" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">QA Gating Reviews</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold font-mono text-amber-400">{pendingAudits}</h3>
            <p className="text-[10px] text-slate-500 mt-1">Awaiting physical clearance</p>
          </div>
        </div>

        {/* Widget 4 */}
        <div className="bg-slate-950/40 border border-slate-900 rounded-lg p-4 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl -mr-6 -mt-6" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Isolation Policy</span>
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-4">
            <h3 className="text-xs font-bold font-sans text-indigo-400 truncate max-w-full">
              {role}
            </h3>
            <p className="text-[10px] text-slate-500 mt-1 truncate">{department}</p>
          </div>
        </div>
      </div>

      {/* Main Bento Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Active Projects list & Starred favorites */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Worksheets Widget */}
          <div className="bg-[#0C111E]/45 border border-slate-900 rounded-lg p-5">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Active Packaging Specifications
                </h2>
              </div>
              <button
                onClick={onCreateTrigger}
                className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] bg-cyan-500 text-slate-950 rounded font-sans hover:bg-cyan-400 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Specification</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {projects.slice(0, 4).map(proj => {
                const isStarred = isFavorite(proj.id);
                return (
                  <div
                    key={proj.id}
                    className="flex items-center justify-between p-3.5 bg-slate-950/30 hover:bg-slate-950/70 border border-slate-900/60 rounded-md transition duration-200 group"
                  >
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[11px] font-mono text-cyan-400 font-semibold">
                          {proj.projectNumber}
                        </span>
                        <span className="text-slate-600 font-mono text-[10px]">R{proj.revision}</span>
                        <span className={`px-1.5 py-0.5 text-[9px] font-mono rounded ${
                          proj.approvalStatus === 'Approved' ? 'bg-emerald-500/10 text-emerald-400' :
                          proj.approvalStatus === 'In Review' ? 'bg-amber-500/10 text-amber-400' :
                          'bg-slate-900 text-slate-500'
                        }`}>
                          {proj.approvalStatus}
                        </span>
                      </div>
                      <h4 className="text-xs font-sans font-medium text-slate-200 truncate">
                        {proj.projectName}
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                        Customer: <span className="text-slate-400">{proj.customerName}</span> | Type: <span className="text-slate-400">{proj.packagingType}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(proj.id);
                        }}
                        className={`p-1.5 rounded hover:bg-slate-900 transition ${
                          isStarred ? 'text-amber-400' : 'text-slate-600 hover:text-slate-400'
                        }`}
                        title="Pin to Favorites"
                      >
                        <Star className="w-3.5 h-3.5 fill-current" />
                      </button>
                      
                      <button
                        onClick={() => onSelectProject(proj.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] bg-slate-950 hover:bg-slate-900 border border-slate-900 hover:border-slate-800 text-slate-300 rounded font-mono group-hover:text-cyan-400 group-hover:border-cyan-900/30 transition-all duration-200"
                      >
                        <span>Open Studio</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-900/50 flex justify-end">
              <button
                onClick={() => onNavigateTab('projects')}
                className="text-[10px] text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1 hover:underline"
              >
                <span>View Full Packaging Registry</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Bookmarked Favorites List */}
          {starredProjects.length > 0 && (
            <div className="bg-[#0C111E]/45 border border-slate-900 rounded-lg p-5">
              <div className="flex items-center gap-2 border-b border-slate-900 pb-3 mb-4">
                <Star className="w-4 h-4 text-amber-400 fill-current" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Starred Assembly Blueprints
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {starredProjects.map(proj => (
                  <div
                    key={proj.id}
                    onClick={() => onSelectProject(proj.id)}
                    className="p-3 bg-slate-950/20 hover:bg-slate-950/50 border border-slate-900/40 hover:border-slate-800 rounded-md cursor-pointer transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono text-cyan-400 font-semibold">{proj.projectNumber}</span>
                        <span className="text-[10px] font-mono text-slate-600">R{proj.revision}</span>
                      </div>
                      <h4 className="text-xs font-sans font-semibold text-slate-300 truncate">{proj.projectName}</h4>
                      <p className="text-[10px] text-slate-500 mt-1 truncate">{proj.customerName}</p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-900/30 flex items-center justify-between text-[10px] text-slate-500">
                      <span>Type: {proj.packagingType}</span>
                      <span className="text-slate-400">{proj.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column: Audit ledgers & Materials index */}
        <div className="space-y-6">
          {/* Recent AI Context Sessions */}
          <div className="bg-[#0C111E]/45 border border-slate-900 rounded-lg p-5">
            <div className="flex items-center gap-2 border-b border-slate-900 pb-3 mb-3">
              <Sparkles className="w-4 h-4 text-purple-400 fill-current" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                AI Context Map Synced
              </h2>
            </div>
            <div className="p-3 bg-slate-950/40 rounded border border-slate-900/40 space-y-2 text-[11px] leading-relaxed text-slate-400">
              <p>
                The Packaging Registry is successfully bound to the server-side **JNAS Prompt Builder**.
              </p>
              <div className="border-t border-slate-900/50 pt-2.5 mt-2 space-y-1.5 font-mono text-[10px]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Module Status:</span>
                  <span className="text-emerald-400">SYNC_OK</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Data Boundaries:</span>
                  <span className="text-cyan-400">Material + Projects</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Context Channel:</span>
                  <span className="text-indigo-400">RESTRICTED_ENGINEERING</span>
                </div>
              </div>
            </div>
          </div>

          {/* Compliance Ledger Activities */}
          <div className="bg-[#0C111E]/45 border border-slate-900 rounded-lg p-5">
            <div className="flex items-center gap-2 border-b border-slate-900 pb-3 mb-4">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Compliance Log Actions
              </h2>
            </div>
            <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
              {auditLogs.slice(0, 5).map(log => (
                <div key={log.id} className="text-[11px] space-y-1 border-b border-slate-900/40 pb-2.5 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-cyan-400 text-[10px] font-semibold">{log.action}</span>
                    <span className="text-slate-600 text-[9px] font-mono">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-300 font-sans leading-normal">
                    {log.details}
                  </p>
                  <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono">
                    <span>Role: {log.userRole}</span>
                    <span>Target: {log.targetType}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-slate-900/50 flex justify-end">
              <button
                onClick={() => onNavigateTab('audit')}
                className="text-[10px] text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1 hover:underline"
              >
                <span>Full Audit Ledger</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

import React from 'react';
import {
  LayoutGrid,
  FileCode,
  Layers,
  FileText,
  Clock,
  ShieldCheck,
  Settings,
  Flame,
  Wrench,
  Sparkles
} from 'lucide-react';

export type SidebarTab =
  | 'dashboard'
  | 'drawings'
  | 'projects'
  | 'documents'
  | 'timeline'
  | 'security'
  | 'settings';

interface EngineeringSidebarProps {
  activeTab: SidebarTab;
  setActiveTab: (tab: SidebarTab) => void;
}

export const EngineeringSidebar: React.FC<EngineeringSidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid, desc: 'Ecosystem KPIs & overview' },
    { id: 'drawings', label: 'Drawing Registry', icon: FileCode, desc: 'Technical CAD blueprints' },
    { id: 'projects', label: 'Project Explorer', icon: Layers, desc: 'Milestones & team sub-projects' },
    { id: 'documents', label: 'Engineering Docs', icon: FileText, desc: 'Specs, calculations & rules' },
    { id: 'timeline', label: 'Audit Timeline', icon: Clock, desc: 'Ecosystem activity feed' },
    { id: 'security', label: 'Security & Roles', icon: ShieldCheck, desc: 'Access controls & departments' },
    { id: 'settings', label: 'Workspace Settings', icon: Settings, desc: 'Local environment options' }
  ] as const;

  return (
    <div className="w-full lg:w-64 bg-[#0A0D16] border border-[#141E30] rounded-lg p-3.5 flex flex-col justify-between shadow-lg h-full">
      <div className="space-y-6">
        {/* Core Brand Banner */}
        <div className="flex items-center gap-2.5 px-2.5 pb-3.5 border-b border-[#141E30]">
          <div className="p-1.5 bg-gradient-to-br from-cyan-500 to-indigo-600 rounded-md text-slate-950 flex items-center justify-center shadow-lg">
            <Wrench className="w-4 h-4 text-slate-100" />
          </div>
          <div>
            <div className="text-xs font-bold font-mono tracking-widest text-slate-100 uppercase">JNAS CAD-HQ</div>
            <div className="text-[9px] text-cyan-400 font-mono tracking-wider font-bold">ENGINEERING LAB</div>
          </div>
        </div>

        {/* Workspace Menu List */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-all text-left group border ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-950/40 to-indigo-950/20 border-cyan-800/60 text-cyan-400 font-medium'
                    : 'bg-transparent border-transparent text-slate-400 hover:bg-[#0F1424] hover:text-slate-100 hover:border-slate-800/40'
                }`}
              >
                <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-400'}`} />
                <div className="flex-1">
                  <div className="text-xs">{item.label}</div>
                  <div className="text-[9px] text-slate-500 font-light truncate group-hover:text-slate-400 transition-colors">
                    {item.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Banner */}
      <div className="pt-4 border-t border-[#141E30] mt-6 bg-gradient-to-b from-transparent to-cyan-950/10 rounded-b px-2.5 py-2.5 text-center space-y-2">
        <div className="flex items-center justify-center gap-1.5 text-cyan-400/90 font-mono text-[9px] uppercase tracking-widest font-bold">
          <Sparkles className="w-3 h-3 animate-pulse" />
          <span>Ecosystem Co-Pilot</span>
        </div>
        <p className="text-[10px] text-slate-400 leading-normal font-sans">
          Engineering context is auto-synced into your AI panel for live diagnostic queries.
        </p>
      </div>
    </div>
  );
};

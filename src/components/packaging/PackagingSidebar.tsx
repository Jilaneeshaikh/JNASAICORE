import React from 'react';
import { LayoutDashboard, Box, Database, ShieldAlert, FileText, Settings, Layers, FolderOpen, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

interface PackagingSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  projectCount: number;
  materialCount: number;
  componentCount: number;
  designCount: number;
  ruleCount: number;
  logisticsCount: number;
  returnablesCount: number;
}

export const PackagingSidebar: React.FC<PackagingSidebarProps> = ({
  activeTab,
  setActiveTab,
  projectCount,
  materialCount,
  componentCount,
  designCount,
  ruleCount,
  logisticsCount,
  returnablesCount
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'designs', label: 'Packaging Designs', icon: FolderOpen, badge: designCount },
    { id: 'projects', label: 'Packaging Projects', icon: Box, badge: projectCount },
    { id: 'materials', label: 'Materials Library', icon: Database, badge: materialCount },
    { id: 'components', label: 'Components Catalog', icon: Layers, badge: componentCount },
    { id: 'rules', label: 'Validation Engine', icon: ShieldCheck, badge: ruleCount },
    { id: 'logistics', label: 'Logistics Staging', icon: Truck, badge: logisticsCount },
    { id: 'returnables', label: 'Returnable Lifecycle', icon: RefreshCw, badge: returnablesCount },
    { id: 'audit', label: 'Compliance Ledger', icon: FileText },
    { id: 'security', label: 'Security Policies', icon: ShieldAlert }
  ];

  return (
    <div className="w-64 border-r border-slate-900 bg-[#0C111E]/95 flex flex-col h-[calc(100vh-130px)] select-none">
      <div className="px-4 py-4 border-b border-slate-900/50">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs uppercase font-mono tracking-wider text-cyan-400 font-semibold">
            Packaging Studio V1
          </span>
        </div>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-1">
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-md transition-all duration-200 ${
                isActive
                  ? 'bg-cyan-500/10 text-cyan-400 border-l-2 border-cyan-400 font-medium shadow-inner shadow-cyan-950/20'
                  : 'text-slate-400 hover:bg-slate-900/50 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className={`px-1.5 py-0.5 text-[10px] rounded font-mono ${
                  isActive ? 'bg-cyan-950 text-cyan-400' : 'bg-slate-900 text-slate-500'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-900 bg-slate-950/20">
        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
          <Settings className="w-3.5 h-3.5" />
          <span>Tenant Context Rooted</span>
        </div>
      </div>
    </div>
  );
};

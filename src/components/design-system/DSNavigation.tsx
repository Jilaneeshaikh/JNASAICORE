import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronRight, Layout, Sliders, FolderClosed, Users, BookOpen, GraduationCap, Server, HelpCircle, ShieldAlert, Sparkles, ChevronDown } from 'lucide-react';

// 1. Breadcrumbs
export interface DSBreadcrumbItem {
  label: string;
  href?: string;
}

export const DSBreadcrumbs: React.FC<{ items: DSBreadcrumbItem[] }> = ({ items }) => {
  return (
    <nav className="flex items-center gap-1.5 font-sans text-xs text-slate-500 font-medium select-none">
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <React.Fragment key={idx}>
            {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-700 shrink-0" />}
            {isLast ? (
              <span className="text-slate-300 font-semibold">{item.label}</span>
            ) : (
              <a
                href={item.href || '#'}
                onClick={(e) => !item.href && e.preventDefault()}
                className="hover:text-slate-300 transition-colors"
              >
                {item.label}
              </a>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

// 2. Section Tabs switcher
export interface DSTabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

export interface DSTabsProps {
  items: DSTabItem[];
  activeId: string;
  onChange: (id: string) => void;
  variant?: 'line' | 'pill';
  className?: string;
}

export const DSTabs: React.FC<DSTabsProps> = ({
  items,
  activeId,
  onChange,
  variant = 'line',
  className = '',
}) => {
  return (
    <div className={`flex border-b border-slate-900 ${className}`}>
      <div className="flex gap-2">
        {items.map((tab) => {
          const isActive = tab.id === activeId;
          
          if (variant === 'pill') {
            return (
              <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xs text-xs font-medium cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                {tab.icon && <span className="shrink-0">{tab.icon}</span>}
                <span>{tab.label}</span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className="relative px-4 py-3 text-xs font-medium text-slate-400 hover:text-slate-200 cursor-pointer flex items-center gap-2 transition-colors select-none"
            >
              {tab.icon && <span className="shrink-0">{tab.icon}</span>}
              <span className={isActive ? 'text-slate-100 font-semibold' : ''}>{tab.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// 3. Simulated Collapsible Left Navigation Sidebar
export interface DSSidebarProps {
  collapsed: boolean;
  setCollapsed: (col: boolean) => void;
  activeModuleId: string;
  setActiveModuleId: (id: string) => void;
}

export const DSSidebar: React.FC<DSSidebarProps> = ({
  collapsed,
  setCollapsed,
  activeModuleId,
  setActiveModuleId,
}) => {
  const [wsDropdownOpen, setWsDropdownOpen] = useState(false);
  const [activeWs, setActiveWs] = useState('jnas-enterprise-id');

  const workspaces = [
    { id: 'jnas-enterprise-id', name: 'JNAS Enterprise OS', role: 'Tenant Owner' },
    { id: 'jnas-engineering-id', name: 'Engineering Core', role: 'Architect' },
    { id: 'jnas-learning-id', name: 'Global LMS Center', role: 'Instructor' },
  ];

  const menuItems = [
    { id: 'dashboard', label: 'Platform Dashboard', icon: Layout },
    { id: 'ai-core', label: 'AI Cognitive Gateway', icon: Sparkles },
    { id: 'projects', label: 'Projects & Tasks', icon: FolderClosed },
    { id: 'crm', label: 'Customer Relations', icon: Users },
    { id: 'kms', label: 'Knowledge Base', icon: BookOpen },
    { id: 'engineering', label: 'Engineering Spec', icon: Sliders },
    { id: 'packaging', label: 'Packaging Studio', icon: GraduationCap },
    { id: 'admin', label: 'System Admin Console', icon: Server },
  ];

  const activeWorkspaceName = workspaces.find((w) => w.id === activeWs)?.name || '';

  return (
    <div
      className={`border-r border-slate-900 bg-slate-950 flex flex-col h-full transition-all duration-300 select-none ${
        collapsed ? 'w-[68px]' : 'w-60'
      }`}
    >
      {/* Workspace Switcher Header */}
      <div className="p-3 border-b border-slate-900 relative">
        <div
          onClick={() => !collapsed && setWsDropdownOpen(!wsDropdownOpen)}
          className={`flex items-center justify-between p-2 rounded-sm border border-slate-900 bg-slate-950/40 hover:bg-slate-900/60 transition-colors ${
            collapsed ? 'cursor-default' : 'cursor-pointer'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-6 h-6 bg-cyan-500 rounded-sm flex items-center justify-center font-bold text-slate-950 text-xs shrink-0">
              JN
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0 text-left">
                <span className="text-xs font-semibold text-slate-200 truncate">{activeWorkspaceName}</span>
                <span className="text-[9px] text-slate-500 uppercase tracking-widest font-mono truncate">Workspace Node</span>
              </div>
            )}
          </div>
          {!collapsed && <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-1" />}
        </div>

        {/* Switcher Dropdown */}
        {!collapsed && wsDropdownOpen && (
          <div className="absolute left-3 right-3 top-16 bg-slate-950 border border-slate-800 rounded-sm shadow-2xl z-20 overflow-hidden p-1 space-y-1">
            {workspaces.map((ws) => (
              <div
                key={ws.id}
                onClick={() => {
                  setActiveWs(ws.id);
                  setWsDropdownOpen(false);
                }}
                className={`p-2 rounded-sm cursor-pointer text-xs font-sans flex flex-col gap-0.5 ${
                  ws.id === activeWs
                    ? 'bg-cyan-950/20 border border-cyan-500/20 text-cyan-400'
                    : 'hover:bg-slate-900/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="font-semibold">{ws.name}</span>
                <span className="text-[9px] text-slate-500 font-mono">{ws.role}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Navigation Menu Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = item.id === activeModuleId;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setActiveModuleId(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-xs font-sans transition-all cursor-pointer relative group ${
                isActive
                  ? 'bg-cyan-950/10 text-cyan-400 border border-cyan-500/10'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
              {!collapsed && <span className="font-medium truncate">{item.label}</span>}
              
              {/* Collapse indicator dot / line */}
              {isActive && collapsed && (
                <div className="absolute right-1 w-1 h-3 bg-cyan-500 rounded-l-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Footer controls */}
      <div className="p-3 border-t border-slate-900 flex flex-col gap-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 rounded-sm border border-slate-900 text-slate-400 hover:text-slate-100 bg-slate-950/40 hover:bg-slate-900/30 transition-all cursor-pointer"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <span className="text-[10px] uppercase font-mono tracking-wider">Collapse Rail</span>
          )}
        </button>
      </div>
    </div>
  );
};

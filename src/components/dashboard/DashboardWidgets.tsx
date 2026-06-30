import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Cpu,
  RefreshCw,
  Layers,
  Shield,
  Sparkles,
  HelpCircle,
  Activity,
  LayoutGrid,
  ExternalLink,
  Lock,
  Star,
  Pin,
  Trash2,
  Users,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldAlert,
  Terminal,
  Box,
  Settings,
  FolderTree,
  Database,
  KeyRound,
  X,
  ChevronRight,
  Plus,
  CheckSquare,
  Square,
  Bell,
  Calendar,
  ListTodo,
  HardDrive,
  Clock,
  ArrowUpRight,
  FileText,
  Check,
  Zap,
  Play,
  FileCode,
  Gauge,
  Sliders,
  AlertCircle,
  GraduationCap
} from 'lucide-react';
import { DSCard, DSCardHeader, DSCardContent, DSCardFooter, DSCardTitle, DSCardSubtitle } from '../design-system/DSCard';
import { DSButton } from '../design-system/DSButton';
import { DSBadge, DSAlert } from '../design-system/DSStatus';
import { DSSparkline, DSProgressCircle } from '../design-system/DSChart';
import { UserSession } from '../../contexts/AuthContext';

// 1. Welcome Widget
export interface WelcomeWidgetProps {
  user: UserSession | null;
  activeWorkspace: string;
}

export const WelcomeWidget: React.FC<WelcomeWidgetProps> = ({ user, activeWorkspace }) => {
  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good Morning';
    if (hr < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const workspaceLabels: Record<string, string> = {
    personal: 'Personal Command Node',
    engineering: 'Engineering Workspace Core',
    learning: 'LMS Academic Center',
    business: 'Enterprise CRM Base',
    admin: 'Central Access Directory',
  };

  return (
    <DSCard variant="accent" accentColor="border-t-cyan-500" className="h-full">
      <DSCardContent className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/20">
              {workspaceLabels[activeWorkspace] || 'System Base Node'}
            </span>
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-tight">Active Connection Secure</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-100 tracking-tight font-sans">
            {getGreeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 font-extrabold">{user?.name || 'Chief Operator'}</span>
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
            Welcome back to the JNAS Enterprise Shell. Your role is authorized as <span className="text-cyan-400 font-semibold font-mono uppercase text-[11px]">{user?.role || 'Enterprise Admin'}</span>. Future module integrations, including AI models and cloud repositories, have been fully plumbed and are currently pending dispatch locks.
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0 bg-slate-900/40 border border-slate-800/60 p-4 rounded-sm font-mono text-[11px] w-full md:w-auto">
          <div className="space-y-1.5 text-slate-400">
            <div className="flex justify-between md:gap-8">
              <span>USER ID:</span>
              <span className="text-slate-200 font-bold">{user?.id || 'usr-4819'}</span>
            </div>
            <div className="flex justify-between md:gap-8">
              <span>LAST ACCESS:</span>
              <span className="text-slate-300">{user?.lastLogin || '11:26 AM'}</span>
            </div>
            <div className="flex justify-between md:gap-8">
              <span>GATEWAY IP:</span>
              <span className="text-cyan-400">10.128.4.200</span>
            </div>
          </div>
        </div>
      </DSCardContent>
    </DSCard>
  );
};

// 2. Quick Actions
export interface QuickActionsWidgetProps {
  onAction: (actionId: string, label: string) => void;
}

export const QuickActionsWidget: React.FC<QuickActionsWidgetProps> = ({ onAction }) => {
  const actions = [
    { id: 'telemetry_sync', label: 'Sync Telemetry', desc: 'Refresh CPU & latency buffers', icon: RefreshCw, variant: 'primary' as const },
    { id: 'heal_schemas', label: 'Heal Schemas', desc: 'Run SQL database repairs', icon: Shield, variant: 'outline' as const },
    { id: 'cognition_init', label: 'Initialize AI Synthesis', desc: 'Simulate neural network pipelines', icon: Sparkles, variant: 'outline' as const },
    { id: 'health_check', label: 'Audit Core Health', desc: 'System ping diagnostic test', icon: Activity, variant: 'outline' as const },
  ];

  return (
    <DSCard variant="bordered" className="h-full flex flex-col justify-between">
      <DSCardHeader>
        <div>
          <DSCardTitle>Operational Quick dispatches</DSCardTitle>
          <DSCardSubtitle>Direct instruction queues to underlying cluster micro-services</DSCardSubtitle>
        </div>
      </DSCardHeader>
      <DSCardContent className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.id}
              onClick={() => onAction(act.id, act.label)}
              className="group p-3 border border-slate-800 hover:border-cyan-500/40 bg-slate-950 hover:bg-slate-900/30 rounded-sm text-left transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
            >
              <div className="flex items-center gap-2.5 mb-1 text-slate-200 group-hover:text-cyan-400 transition-colors">
                <div className="p-1 bg-slate-900 border border-slate-800 rounded group-hover:border-cyan-500/20 group-hover:bg-cyan-950/20 text-slate-400 group-hover:text-cyan-400 transition-colors">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold">{act.label}</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-snug font-mono truncate">{act.desc}</p>
            </button>
          );
        })}
      </DSCardContent>
      <DSCardFooter className="text-[10px] text-slate-500 font-mono">
        All dispatches log directly to the telemetry console on your right.
      </DSCardFooter>
    </DSCard>
  );
};

// 3. Recent Projects
export const RecentProjectsWidget: React.FC = () => {
  const [projects, setProjects] = useState([
    { id: 'proj-01', name: 'Enterprise Cognet-X v4', status: 'In Progress', progress: 68, client: 'JNAS Corp', speed: '98 ms' },
    { id: 'proj-02', name: 'Secure Auth Shield Base', status: 'Completed', progress: 100, client: 'Aether Lab', speed: '12 ms' },
    { id: 'proj-03', name: 'KMS Vector Index Sync', status: 'Under Review', progress: 90, client: 'Internal Engineering', speed: '240 ms' },
    { id: 'proj-04', name: 'Multi-Tenant Sandbox Portal', status: 'In Progress', progress: 24, client: 'Client Review Group', speed: '50 ms' },
  ]);

  return (
    <DSCard variant="bordered" className="h-full flex flex-col justify-between">
      <DSCardHeader>
        <div>
          <DSCardTitle>Recent Projects & Milestones</DSCardTitle>
          <DSCardSubtitle>High-capacity workspace client trackers</DSCardSubtitle>
        </div>
        <DSBadge variant="outline" color="cyan">Active Tracker</DSBadge>
      </DSCardHeader>
      <DSCardContent className="p-0 overflow-x-auto">
        <table className="w-full text-left border-collapse table-auto text-xs">
          <thead>
            <tr className="border-b border-slate-900 bg-slate-950/40 text-slate-500 uppercase text-[9px] font-mono tracking-wider">
              <th className="px-5 py-3">Project Title</th>
              <th className="px-5 py-3">Client</th>
              <th className="px-5 py-3">Completion</th>
              <th className="px-5 py-3">State</th>
              <th className="px-5 py-3 text-right">Latency</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900/60 font-sans">
            {projects.map((proj) => {
              const stateColors: Record<string, string> = {
                'In Progress': 'text-cyan-400 bg-cyan-950/10 border-cyan-900/30',
                'Completed': 'text-emerald-400 bg-emerald-950/10 border-emerald-900/30',
                'Under Review': 'text-amber-400 bg-amber-950/10 border-amber-900/30',
              };

              return (
                <tr key={proj.id} className="hover:bg-slate-900/20 transition-colors">
                  <td className="px-5 py-3 font-semibold text-slate-200">{proj.name}</td>
                  <td className="px-5 py-3 text-slate-400 font-mono text-[11px]">{proj.client}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-[10px] text-slate-400 w-8">{proj.progress}%</span>
                      <div className="flex-1 max-w-[80px] h-1 bg-slate-900 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                          style={{ width: `${proj.progress}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 border rounded text-[9px] font-mono font-semibold ${stateColors[proj.status]}`}>
                      {proj.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right font-mono text-slate-400 text-[10px]">{proj.speed}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </DSCardContent>
      <DSCardFooter className="text-[10px] text-slate-500 font-mono">
        Integrates with the Projects module dynamically. No write capabilities in Sprint 3.
      </DSCardFooter>
    </DSCard>
  );
};

// 4. Recent Documents
export const RecentDocumentsWidget: React.FC = () => {
  const [docs, setDocs] = useState([
    { id: 'doc-1', name: 'JNAS_Core_Platform_SARD.md', type: 'Markdown', size: '48.4 KB', updated: '2 hours ago', pinned: true },
    { id: 'doc-2', name: 'Cognitive_Gateway_API_Specs.yaml', type: 'YAML Spec', size: '112.5 KB', updated: '4 hours ago', pinned: false },
    { id: 'doc-3', name: 'Client_Authentication_Clearances.pdf', type: 'Adobe PDF', size: '1.2 MB', updated: '1 day ago', pinned: true },
    { id: 'doc-4', name: 'Sprint_3_Enterprise_Telemetry.json', type: 'JSON Records', size: '14.8 KB', updated: 'Just now', pinned: false },
  ]);

  const togglePin = (id: string) => {
    setDocs(prev => prev.map(d => d.id === id ? { ...d, pinned: !d.pinned } : d));
  };

  return (
    <DSCard variant="bordered" className="h-full flex flex-col justify-between">
      <DSCardHeader>
        <div>
          <DSCardTitle>Recent Documents & Configuration</DSCardTitle>
          <DSCardSubtitle>Shared knowledge assets and design records</DSCardSubtitle>
        </div>
      </DSCardHeader>
      <DSCardContent className="p-0">
        <div className="divide-y divide-slate-900/60">
          {docs.map((doc) => (
            <div key={doc.id} className="px-5 py-3 flex items-center justify-between hover:bg-slate-900/20 transition-all">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-1.5 bg-slate-900 border border-slate-800 rounded text-slate-400 flex items-center justify-center shrink-0">
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <div className="min-w-0 flex flex-col">
                  <span className="text-xs font-semibold text-slate-200 truncate leading-snug">{doc.name}</span>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-0.5">
                    <span>{doc.type}</span>
                    <span>•</span>
                    <span>{doc.size}</span>
                    <span>•</span>
                    <span>{doc.updated}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => togglePin(doc.id)}
                  className={`p-1.5 rounded hover:bg-slate-900 cursor-pointer transition-colors ${doc.pinned ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'}`}
                  title={doc.pinned ? 'Unpin Document' : 'Pin Document'}
                >
                  <Pin className="w-3.5 h-3.5 transform rotate-45" />
                </button>
                <button
                  className="p-1.5 text-slate-500 hover:text-cyan-400 rounded hover:bg-slate-900 cursor-pointer"
                  title="View Document"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </DSCardContent>
      <DSCardFooter className="text-[10px] text-slate-500 font-mono">
        Sourced from KMS Knowledge and Engineering spec databases.
      </DSCardFooter>
    </DSCard>
  );
};

// 5. Pinned Items
export const PinnedItemsWidget: React.FC = () => {
  const [pinned, setPinned] = useState([
    { id: 'pin-1', label: 'OAuth 2.0 Client Handshake Endpoint', category: 'Authentication Code', link: '/api/auth/oauth' },
    { id: 'pin-2', label: 'JNAS Administrative Password Token Reset', category: 'IAM Spec', link: '/admin/keys' },
    { id: 'pin-3', label: 'VITE_FIREBASE_API_KEY environment binding', category: 'Config Variable', link: '.env.example' },
    { id: 'pin-4', label: 'Dev Kernel Router Simulator Trace logs', category: 'Core Diagnostics', link: '/telemetry' },
  ]);

  const removePin = (id: string) => {
    setPinned(prev => prev.filter(p => p.id !== id));
  };

  return (
    <DSCard variant="bordered" className="h-full flex flex-col justify-between">
      <DSCardHeader>
        <div>
          <DSCardTitle>Pinned Workspace Nodes</DSCardTitle>
          <DSCardSubtitle>Favorited resources and developer specifications</DSCardSubtitle>
        </div>
      </DSCardHeader>
      <DSCardContent className="p-0">
        {pinned.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs font-mono">
            No pinned resources found. Toggle pin icon on cards to pin items here.
          </div>
        ) : (
          <div className="divide-y divide-slate-900/60 font-sans text-xs">
            {pinned.map((item) => (
              <div key={item.id} className="px-5 py-3 flex items-center justify-between hover:bg-slate-900/20 transition-colors">
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="font-semibold text-slate-200 truncate">{item.label}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-mono text-cyan-400 font-semibold uppercase bg-cyan-950/10 px-1 py-0.5 rounded border border-cyan-900/20">{item.category}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{item.link}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 ml-4">
                  <button
                    onClick={() => removePin(item.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded hover:bg-slate-900 cursor-pointer transition-colors"
                    title="Remove Pin"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </DSCardContent>
      <DSCardFooter className="text-[10px] text-slate-500 font-mono">
        Pinned status is synced client-side per operational session.
      </DSCardFooter>
    </DSCard>
  );
};

// 6. Recent Activity
export const RecentActivityWidget: React.FC = () => {
  const activities = [
    { id: 'act-1', event: 'Administrative Session Key Granted', detail: 'Operator authenticated via SSO / Passkey', time: 'Just now', category: 'Login', icon: KeyRound, color: 'text-emerald-400 bg-emerald-950/20 border-emerald-900/30' },
    { id: 'act-2', event: 'Workspace State Shifted', detail: 'Transitioned workspace parameters to "Engineering Workspace"', time: '12 mins ago', category: 'Module Access', icon: Sliders, color: 'text-cyan-400 bg-cyan-950/20 border-cyan-900/30' },
    { id: 'act-3', event: 'Configuration File Uploaded', detail: 'Firebase Auth configurations synchronized with kernel', time: '1 hour ago', category: 'Document Uploaded', icon: FileCode, color: 'text-cyan-400 bg-cyan-950/20 border-cyan-900/30' },
    { id: 'act-4', event: 'Synthetic Agent Dispatch Completed', detail: 'Agent "Dev_Kernel_Router" processed 120k requests', time: '2 hours ago', category: 'AI Activity', icon: Sparkles, color: 'text-indigo-400 bg-indigo-950/20 border-indigo-900/30' },
    { id: 'act-5', event: 'Milestone "Secure Auth Shield" Compiled', detail: 'Security clearance level 3 verified successfully', time: 'Yesterday', category: 'Project Opened', icon: FolderTree, color: 'text-emerald-400 bg-emerald-950/20 border-emerald-900/30' },
  ];

  return (
    <DSCard variant="bordered" className="h-full flex flex-col justify-between">
      <DSCardHeader>
        <div>
          <DSCardTitle>Recent Operational Activity Log</DSCardTitle>
          <DSCardSubtitle>Cumulative execution timeline across cluster workspaces</DSCardSubtitle>
        </div>
      </DSCardHeader>
      <DSCardContent className="p-5 overflow-y-auto">
        <div className="relative border-l border-slate-900 ml-3.5 pl-5 space-y-5 py-1">
          {activities.map((act) => {
            const Icon = act.icon;
            return (
              <div key={act.id} className="relative group text-xs">
                {/* Timeline dot icon */}
                <span className={`absolute -left-[32px] top-0 p-1 rounded-sm border ${act.color} flex items-center justify-center`}>
                  <Icon className="w-3.5 h-3.5" />
                </span>

                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-semibold text-slate-200">{act.event}</span>
                    <span className="text-[10px] text-slate-500 font-mono shrink-0">{act.time}</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed mt-0.5">{act.detail}</p>
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-tight mt-1">{act.category}</span>
                </div>
              </div>
            );
          })}
        </div>
      </DSCardContent>
      <DSCardFooter className="text-[10px] text-slate-500 font-mono">
        Direct feed of kernel process audits. Logs persist locally.
      </DSCardFooter>
    </DSCard>
  );
};

// 7. Notification Center
export const NotificationsWidget: React.FC = () => {
  const [notifications, setNotifications] = useState([
    { id: 'not-1', title: 'Unauthorized IAM Handshake Attempt Rejected', message: 'IP 182.16.4.52 attempted password force-bind', priority: 'High', category: 'Security', read: false, time: '10 mins ago' },
    { id: 'not-2', title: 'Firebase Client Handshake Complete', message: 'Authentication configurations are bound properly', priority: 'Medium', category: 'Platform', read: false, time: '1 hour ago' },
    { id: 'not-3', title: 'Operational Log Thread Ingest at Capacity', message: 'Kernel log stream overflowed 500 ops thread pools', priority: 'Medium', category: 'Operations', read: true, time: '2 hours ago' },
    { id: 'not-4', title: 'LMS Academic Certification Approved', message: 'New user onboarding syllabus registered', priority: 'Low', category: 'Learning', read: true, time: '1 day ago' },
  ]);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const toggleRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: !n.read } : n));
  };

  return (
    <DSCard variant="bordered" className="h-full flex flex-col justify-between">
      <DSCardHeader>
        <div>
          <DSCardTitle>Notification Dispatch Center</DSCardTitle>
          <DSCardSubtitle>Prioritized security and platform alerts</DSCardSubtitle>
        </div>
        <button
          onClick={markAllRead}
          className="text-[10px] text-cyan-400 font-semibold font-mono hover:text-cyan-300 bg-cyan-950/20 border border-cyan-800/20 px-2 py-0.5 rounded cursor-pointer"
        >
          Mark All Read
        </button>
      </DSCardHeader>
      <DSCardContent className="p-0 select-none">
        <div className="divide-y divide-slate-900/60">
          {notifications.map((not) => {
            const prioColors: Record<string, string> = {
              'High': 'text-rose-400 bg-rose-950/20 border-rose-900/30',
              'Medium': 'text-amber-400 bg-amber-950/20 border-amber-900/30',
              'Low': 'text-slate-400 bg-slate-900 border-slate-800',
            };

            return (
              <div
                key={not.id}
                onClick={() => toggleRead(not.id)}
                className={`px-5 py-3 flex gap-3.5 cursor-pointer hover:bg-slate-900/20 transition-all ${not.read ? 'opacity-65' : ''}`}
              >
                <div className="pt-0.5">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${not.read ? 'bg-transparent' : 'bg-cyan-500 animate-pulse'}`} />
                </div>
                <div className="flex-1 min-w-0 text-xs">
                  <div className="flex items-center justify-between gap-3 mb-0.5">
                    <span className="font-semibold text-slate-200 truncate">{not.title}</span>
                    <span className="text-[9px] text-slate-500 font-mono shrink-0">{not.time}</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">{not.message}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-1.5 py-0.2 border rounded-[2px] text-[8px] font-semibold font-mono uppercase ${prioColors[not.priority]}`}>{not.priority}</span>
                    <span className="text-[10px] text-slate-500 font-mono uppercase tracking-tight">{not.category}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </DSCardContent>
      <DSCardFooter className="text-[10px] text-slate-500 font-mono">
        Sprint 3 notification simulator. Real-time WebSockets unlocked in Phase 2.
      </DSCardFooter>
    </DSCard>
  );
};

// 8. Tasks (placeholder checklist)
export const TasksWidget: React.FC = () => {
  const [tasks, setTasks] = useState([
    { id: 'tsk-1', text: 'Configure secure Firebase Auth login nodes', completed: true, tag: 'Sprint 2' },
    { id: 'tsk-2', text: 'Structure Enterprise Dashboard Layout Framework', completed: true, tag: 'Sprint 3' },
    { id: 'tsk-3', text: 'Implement visual Widget Customization system', completed: false, tag: 'Sprint 3' },
    { id: 'tsk-4', text: 'Verify multi-tenant switching state mapping', completed: false, tag: 'Sprint 3' },
    { id: 'tsk-5', text: 'Connect real-time AI modeling agents (Cognitive)', completed: false, tag: 'Future' },
  ]);

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  return (
    <DSCard variant="bordered" className="h-full flex flex-col justify-between">
      <DSCardHeader>
        <div>
          <DSCardTitle>Pending Checklist Tasks</DSCardTitle>
          <DSCardSubtitle>Target tasks for active platform development sprint</DSCardSubtitle>
        </div>
        <DSBadge variant="outline" color="cyan">SPRINT_3_BOARD</DSBadge>
      </DSCardHeader>
      <DSCardContent className="p-4 space-y-2.5 select-none">
        {tasks.map((task) => (
          <div
            key={task.id}
            onClick={() => toggleTask(task.id)}
            className="flex items-center justify-between p-2.5 border border-slate-900/60 bg-slate-950 hover:bg-slate-900/20 rounded-sm cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <button className="text-slate-500 hover:text-cyan-400 transition-colors">
                {task.completed ? (
                  <CheckSquare className="w-4.5 h-4.5 text-cyan-500" />
                ) : (
                  <Square className="w-4.5 h-4.5 text-slate-700 hover:text-slate-500" />
                )}
              </button>
              <span className={`text-xs font-medium text-slate-200 truncate ${task.completed ? 'line-through text-slate-500' : ''}`}>
                {task.text}
              </span>
            </div>
            <span className="text-[9px] font-mono font-semibold uppercase bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800 tracking-wider shrink-0 ml-4">
              {task.tag}
            </span>
          </div>
        ))}
      </DSCardContent>
      <DSCardFooter className="text-[10px] text-slate-500 font-mono">
        Checked tasks are remembered in active browser memory buffers.
      </DSCardFooter>
    </DSCard>
  );
};

// 9. AI Status (placeholder monitoring dashboard)
export const AIStatusWidget: React.FC = () => {
  const [pods, setPods] = useState([
    { id: 'pod-1', name: 'Synthetic_Router_X4', status: 'Online', cpu: '4.2%', ram: '128 MB', logs: 'Processing telemetry packet queue...' },
    { id: 'pod-2', name: 'Cognitive_Gateway_Model', status: 'Online', cpu: '1.8%', ram: '1.2 GB', logs: 'Sparsity matrix loaded.' },
    { id: 'pod-3', name: 'KMS_Deep_Embedding_Pod', status: 'Suspended', cpu: '0.0%', ram: '0 MB', logs: 'Awaiting database clearance...' },
  ]);

  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleOptimize = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      setPods(prev => prev.map(p => p.status === 'Online' ? { ...p, cpu: '0.8%', ram: '64 MB' } : p));
      setIsOptimizing(false);
    }, 1200);
  };

  return (
    <DSCard variant="bordered" className="h-full flex flex-col justify-between">
      <DSCardHeader>
        <div>
          <DSCardTitle>Cognitive AI Pod Executors</DSCardTitle>
          <DSCardSubtitle>Dynamic tracing parameters for background AI nodes</DSCardSubtitle>
        </div>
        <DSButton
          size="sm"
          variant="outline"
          loading={isOptimizing}
          onClick={handleOptimize}
          leftIcon={<Zap className="w-3.5 h-3.5 text-cyan-400" />}
        >
          Optimize Memory
        </DSButton>
      </DSCardHeader>
      <DSCardContent className="p-4 space-y-4">
        {pods.map((pod) => (
          <div key={pod.id} className="p-3 border border-slate-900 bg-slate-950/60 rounded-sm font-mono text-[10px]">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-200">{pod.name}</span>
              <span className={`px-1.5 py-0.2 border rounded-[2px] font-semibold text-[8px] uppercase ${pod.status === 'Online' ? 'text-emerald-400 bg-emerald-950/20 border-emerald-900/30' : 'text-slate-500 bg-slate-900 border-slate-800'}`}>
                {pod.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-2 text-slate-400">
              <div className="flex justify-between">
                <span>CPU Load:</span>
                <span className="text-cyan-400 font-semibold">{pod.cpu}</span>
              </div>
              <div className="flex justify-between">
                <span>RAM Occupied:</span>
                <span className="text-cyan-400 font-semibold">{pod.ram}</span>
              </div>
            </div>
            <div className="border-t border-slate-900/60 pt-2 text-slate-500 text-[9px] truncate">
              {pod.logs}
            </div>
          </div>
        ))}
      </DSCardContent>
      <DSCardFooter className="text-[10px] text-slate-500 font-mono">
        Pods execute Gemini API pipelines in server-only secure scope.
      </DSCardFooter>
    </DSCard>
  );
};

// 10. Storage Usage
export const StorageUsageWidget: React.FC = () => {
  const metrics = [
    { label: 'JNAS Workspace DB', size: '42.8 GB', color: 'bg-cyan-500', percent: 34 },
    { label: 'Shared KMS Documents', size: '15.2 GB', color: 'bg-indigo-500', percent: 12 },
    { label: 'System Kernel Base', size: '128.0 GB', color: 'bg-emerald-500', percent: 62 },
  ];

  return (
    <DSCard variant="bordered" className="h-full flex flex-col justify-between">
      <DSCardHeader>
        <div>
          <DSCardTitle>Allocated Storage & Memory Map</DSCardTitle>
          <DSCardSubtitle>Resource utilization limits of sandbox storage pools</DSCardSubtitle>
        </div>
      </DSCardHeader>
      <DSCardContent className="p-5 flex flex-col md:flex-row items-center gap-6">
        <div className="shrink-0 flex items-center justify-center">
          <DSProgressCircle value={68} label="Storage" size={120} strokeWidth={8} />
        </div>
        <div className="flex-1 w-full space-y-4 text-xs font-sans">
          {metrics.map((met, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-slate-300 font-medium">
                <span>{met.label}</span>
                <span className="font-mono text-slate-400 text-[11px]">{met.size} ({met.percent}%)</span>
              </div>
              <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                <div className={`h-full ${met.color} rounded-full`} style={{ width: `${met.percent}%` }} />
              </div>
            </div>
          ))}
        </div>
      </DSCardContent>
      <DSCardFooter className="text-[10px] text-slate-500 font-mono">
        Cluster storage is capped dynamically under tenant licensing bounds.
      </DSCardFooter>
    </DSCard>
  );
};

// 11. Workspace Summary
export interface WorkspaceSummaryWidgetProps {
  activeWorkspace: string;
}

export const WorkspaceSummaryWidget: React.FC<WorkspaceSummaryWidgetProps> = ({ activeWorkspace }) => {
  const summaryDetails: Record<string, { desc: string; stats: { label: string; count: string }[] }> = {
    personal: {
      desc: 'Private development and experimental operator tools.',
      stats: [
        { label: 'Private Sandboxes', count: '3 active' },
        { label: 'Pending Mock Tests', count: '4 units' },
        { label: 'Private Documents', count: '12 logs' },
      ],
    },
    engineering: {
      desc: 'Core specs, packaging studio pipelines, and system debugging consoles.',
      stats: [
        { label: 'Compiled Kernels', count: '2 healthy' },
        { label: 'Assigned Pods', count: '3 online' },
        { label: 'Dev Access Keys', count: '2 tokens' },
      ],
    },
    learning: {
      desc: 'LMS resources, user guides, interactive onboarding courses.',
      stats: [
        { label: 'Onboarding Modules', count: '6 courses' },
        { label: 'Class Clearances', count: 'Role 3' },
        { label: 'Knowledge Base PDF', count: '4 assets' },
      ],
    },
    business: {
      desc: 'Client CRM portals, subscription limits, and billing tiers.',
      stats: [
        { label: 'Enterprise Tenants', count: '2 active' },
        { label: 'SSO Accounts Bound', count: '8 users' },
        { label: 'Rate Cap Limit', count: '10k API' },
      ],
    },
    admin: {
      desc: 'Central security controls, IAM logs, and database backups.',
      stats: [
        { label: 'Secured Tunnels', count: '5 active' },
        { label: 'Backup Health', count: '100% OK' },
        { label: 'Role Clearances', count: 'Admin' },
      ],
    },
  };

  const activeDetails = summaryDetails[activeWorkspace] || summaryDetails.personal;

  return (
    <DSCard variant="bordered" className="h-full flex flex-col justify-between">
      <DSCardHeader>
        <div>
          <DSCardTitle className="capitalize">{activeWorkspace} Workspace Parameters</DSCardTitle>
          <DSCardSubtitle>Summary attributes of your selected platform context</DSCardSubtitle>
        </div>
      </DSCardHeader>
      <DSCardContent className="p-5 space-y-4">
        <p className="text-xs text-slate-400 leading-normal font-sans bg-slate-900/30 border border-slate-900 p-3 rounded-sm">
          {activeDetails.desc}
        </p>
        <div className="grid grid-cols-3 gap-4 font-mono text-[10px]">
          {activeDetails.stats.map((st, idx) => (
            <div key={idx} className="p-3 border border-slate-900 bg-slate-950/60 rounded-sm flex flex-col items-center justify-center text-center">
              <span className="text-cyan-400 font-bold text-xs mb-1 truncate max-w-full">{st.count}</span>
              <span className="text-slate-500 text-[9px] uppercase leading-snug tracking-tight">{st.label}</span>
            </div>
          ))}
        </div>
      </DSCardContent>
      <DSCardFooter className="text-[10px] text-slate-500 font-mono">
        Attributes auto-align upon switching your workspace context.
      </DSCardFooter>
    </DSCard>
  );
};

// 12. Calendar (placeholder scheduler calendar)
export const CalendarWidget: React.FC = () => {
  const events = [
    { day: '29', month: 'JUN', title: 'Sprint 3 Review Meeting', time: '11:30 AM', color: 'border-l-cyan-500 text-cyan-400' },
    { day: '02', month: 'JUL', title: 'Database Migration Prep', time: '02:00 PM', color: 'border-l-indigo-500 text-indigo-400' },
    { day: '05', month: 'JUL', title: 'Phase 2 Cloud Deployment', time: '10:00 AM', color: 'border-l-emerald-500 text-emerald-400' },
  ];

  return (
    <DSCard variant="bordered" className="h-full flex flex-col justify-between">
      <DSCardHeader>
        <div>
          <DSCardTitle>Workspace Events & Schedule</DSCardTitle>
          <DSCardSubtitle>Calendar tracking for upcoming enterprise integrations</DSCardSubtitle>
        </div>
      </DSCardHeader>
      <DSCardContent className="p-5 space-y-4">
        {events.map((ev, idx) => (
          <div key={idx} className={`p-3 border border-slate-900 bg-slate-950/60 rounded-sm border-l-2 ${ev.color} flex items-center justify-between gap-4 text-xs`}>
            <div className="flex items-center gap-3.5 font-sans">
              <div className="flex flex-col items-center justify-center bg-slate-900 border border-slate-800 p-1 rounded font-mono w-11 h-11 shrink-0">
                <span className="text-slate-200 font-bold text-sm leading-none">{ev.day}</span>
                <span className="text-[9px] text-slate-500 font-semibold tracking-wide uppercase mt-0.5">{ev.month}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-slate-200 leading-snug">{ev.title}</span>
                <span className="text-[10px] text-slate-500 font-mono">{ev.time}</span>
              </div>
            </div>
            <Calendar className="w-4 h-4 text-slate-700 shrink-0 hidden sm:block" />
          </div>
        ))}
      </DSCardContent>
      <DSCardFooter className="text-[10px] text-slate-500 font-mono">
        Sprint 3 scheduling core. Write capabilities scheduled for Phase 3.
      </DSCardFooter>
    </DSCard>
  );
};

// 13. Module Shortcuts Grid
interface ModuleShortcutsWidgetProps {
  onNavigate: (route: string) => void;
}

export const ModuleShortcutsWidget: React.FC<ModuleShortcutsWidgetProps> = ({ onNavigate }) => {
  const modules = [
    { id: 'ai-core', label: 'AI Core', icon: Cpu },
    { id: 'projects', label: 'Projects', icon: FolderTree },
    { id: 'crm', label: 'CRM Portal', icon: Users },
    { id: 'lms', label: 'LMS Train', icon: GraduationCap },
    { id: 'kms', label: 'KMS Database', icon: Database },
    { id: 'engineering', label: 'Engineering', icon: Terminal },
    { id: 'packaging', label: 'Packaging', icon: Box },
    { id: 'admin', label: 'Admin Key', icon: KeyRound },
  ];

  return (
    <DSCard variant="bordered" className="h-full flex flex-col justify-between">
      <DSCardHeader>
        <div>
          <DSCardTitle>Integrated Module Launch Grid</DSCardTitle>
          <DSCardSubtitle>Jump straight to target micro-application layouts</DSCardSubtitle>
        </div>
      </DSCardHeader>
      <DSCardContent className="p-4 grid grid-cols-4 gap-3">
        {modules.map((m) => {
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              onClick={() => onNavigate(m.id)}
              className="flex flex-col items-center justify-center p-3 border border-slate-900 hover:border-cyan-500/30 bg-slate-950/60 hover:bg-cyan-950/10 rounded-sm text-center cursor-pointer transition-colors group focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <Icon className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 mb-1.5 transition-colors" />
              <span className="text-[10px] text-slate-400 group-hover:text-slate-200 font-mono font-medium tracking-tight uppercase leading-none truncate max-w-full">
                {m.label}
              </span>
            </button>
          );
        })}
      </DSCardContent>
      <DSCardFooter className="text-[10px] text-slate-500 font-mono">
        Modules operate in isolation. Access permissions are verified.
      </DSCardFooter>
    </DSCard>
  );
};

// 14. System Health
export const SystemHealthWidget: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState({
    latency: '18 ms',
    throughput: '14,892 ops/sec',
    cpu: '4.2%',
    ram: '1.2 GB',
  });

  return (
    <DSCard variant="bordered" className="h-full flex flex-col justify-between">
      <DSCardHeader>
        <div>
          <DSCardTitle>Kernel Health & Cluster Telemetry</DSCardTitle>
          <DSCardSubtitle>Dynamic tracing data and network status parameters</DSCardSubtitle>
        </div>
        <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
      </DSCardHeader>
      <DSCardContent className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4 font-mono text-[11px]">
          <div className="p-3 border border-slate-900 bg-slate-950/60 rounded-sm flex flex-col gap-0.5">
            <span className="text-slate-500 text-[9px] uppercase">Ping Latency</span>
            <span className="text-cyan-400 font-bold text-sm">{healthStatus.latency}</span>
          </div>
          <div className="p-3 border border-slate-900 bg-slate-950/60 rounded-sm flex flex-col gap-0.5">
            <span className="text-slate-500 text-[9px] uppercase">Log Ingest Ratio</span>
            <span className="text-cyan-400 font-bold text-sm">{healthStatus.throughput}</span>
          </div>
          <div className="p-3 border border-slate-900 bg-slate-950/60 rounded-sm flex flex-col gap-0.5">
            <span className="text-slate-500 text-[9px] uppercase">Processor Ingest</span>
            <span className="text-cyan-400 font-bold text-sm">{healthStatus.cpu}</span>
          </div>
          <div className="p-3 border border-slate-900 bg-slate-950/60 rounded-sm flex flex-col gap-0.5">
            <span className="text-slate-500 text-[9px] uppercase">Memory Occupancy</span>
            <span className="text-cyan-400 font-bold text-sm">{healthStatus.ram}</span>
          </div>
        </div>

        <div className="p-4 border border-slate-900 bg-slate-950/60 rounded-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-300 font-medium font-sans">
            <span>Operational Log Buffer Flow</span>
            <span className="font-mono text-cyan-400 text-[10px]">68% Capacity</span>
          </div>
          <div className="flex items-center justify-between gap-1 mt-1 pt-1">
            <DSSparkline data={[34, 52, 45, 78, 62, 90, 85, 92, 105, 80, 110]} width={280} height={40} />
          </div>
        </div>
      </DSCardContent>
      <DSCardFooter className="text-[10px] text-slate-500 font-mono">
        Data updates are throttled to conserve processor ticks.
      </DSCardFooter>
    </DSCard>
  );
};

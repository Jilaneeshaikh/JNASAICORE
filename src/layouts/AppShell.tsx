import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useSettings } from '../contexts/SettingsContext';
import { useNotification } from '../contexts/NotificationContext';
import { DSButton } from '../components/design-system/DSButton';
import { DSCommandPalette } from '../components/design-system/DSDialog';
import { Route } from '../hooks/useRouter';
import {
  Cpu,
  Menu,
  ChevronRight,
  ChevronDown,
  Sun,
  Moon,
  Laptop,
  Search,
  Bell,
  Shield,
  Activity,
  LogOut,
  User,
  ExternalLink,
  Sliders,
  Sparkles,
  Command,
  LayoutGrid,
  Settings,
  FolderTree,
  Users,
  GraduationCap,
  Database,
  Terminal,
  Box,
  KeyRound,
  FileText,
  Contact,
  Folder,
  X,
  GitBranch
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { eventBus } from '../core';

interface AppShellProps {
  children: React.ReactNode;
  currentRoute: Route;
  onNavigate: (route: Route) => void;
}

export const AppShell: React.FC<AppShellProps> = ({ children, currentRoute, onNavigate }) => {
  const { user, logout } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { settings, updateSetting } = useSettings();
  const { triggerToast } = useNotification();

  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [cmdQuery, setCmdQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [isWorkspaceDropdownOpen, setIsWorkspaceDropdownOpen] = useState(false);

  const workspaces = [
    { id: 'personal' as const, label: 'Personal Workspace', icon: User, desc: 'Experimental developer tools', color: 'text-cyan-400' },
    { id: 'engineering' as const, label: 'Engineering Workspace', icon: Terminal, desc: 'Core spec & packaging pipelines', color: 'text-indigo-400' },
    { id: 'learning' as const, label: 'Learning Workspace', icon: GraduationCap, desc: 'LMS courses & onboarding guides', color: 'text-emerald-400' },
    { id: 'business' as const, label: 'Business Workspace', icon: Users, desc: 'CRM and customer accounts base', color: 'text-amber-400' },
    { id: 'admin' as const, label: 'Administration Workspace', icon: Shield, desc: 'IAM access clearances & audits', color: 'text-rose-400' },
  ];

  const activeWorkspaceObj = workspaces.find((w) => w.id === settings.activeWorkspace) || workspaces[0];
  const ActiveWorkspaceIcon = activeWorkspaceObj.icon;

  // Keyboard binding for Command Palette (Ctrl+K)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'ai-core', label: 'AI Core Platform', icon: Cpu },
    { id: 'decision', label: 'Decision Intelligence', icon: Activity },
    { id: 'thread', label: 'Digital Thread', icon: GitBranch },
    { id: 'projects', label: 'Projects & Milestones', icon: FolderTree },
    { id: 'crm', label: 'CRM Portal', icon: Users },
    { id: 'contacts', label: 'Contacts Directory', icon: Contact },
    { id: 'lms', label: 'LMS Training', icon: GraduationCap },
    { id: 'kms', label: 'KMS Database', icon: Database },
    { id: 'document-intelligence', label: 'Document RAG', icon: FileText },
    { id: 'documents', label: 'Document Center', icon: Folder },
    { id: 'engineering', label: 'Engineering', icon: Terminal },
    { id: 'packaging', label: 'Packaging Studio', icon: Box },
    { id: 'admin', label: 'Administration', icon: KeyRound },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  return (
    <div className={`min-h-screen ${resolvedTheme === 'dark' ? 'bg-[#0A0C12] text-slate-100' : 'bg-slate-50 text-slate-900'} flex flex-col font-sans antialiased relative transition-colors duration-200`}>
      {/* 1. Header Navigation */}
      <header className={`px-6 py-4 border-b ${resolvedTheme === 'dark' ? 'border-slate-900 bg-slate-950/80' : 'border-slate-200 bg-white/80'} backdrop-blur-md flex items-center justify-between sticky top-0 z-40`}>
        <div className="flex items-center gap-3">
          {/* Mobile Hamburguer Menu */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 -ml-2 text-slate-500 hover:text-slate-300 hover:bg-slate-900/40 rounded-sm cursor-pointer"
            id="mobile-nav-toggle"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onNavigate('dashboard')}>
            <div className="p-1.5 bg-cyan-500 text-slate-950 rounded-sm flex items-center justify-center font-bold">
              <Cpu className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight uppercase font-mono text-cyan-400">
                JNAS AI Core
              </span>
              <span className="text-[9px] text-slate-500 font-mono tracking-wider uppercase leading-none mt-0.5">
                Foundation Shell
              </span>
            </div>
          </div>

          {/* Workspace Switcher */}
          <div className="hidden sm:flex items-center gap-2 border-l border-slate-900/60 pl-4 relative">
            <button
              onClick={() => setIsWorkspaceDropdownOpen(!isWorkspaceDropdownOpen)}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-sm cursor-pointer transition-all ${isWorkspaceDropdownOpen ? 'border-cyan-500/30' : ''}`}
            >
              <ActiveWorkspaceIcon className={`w-3.5 h-3.5 ${activeWorkspaceObj.color}`} />
              <span className="font-semibold">{activeWorkspaceObj.label}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 ml-1 shrink-0" />
            </button>

            {isWorkspaceDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsWorkspaceDropdownOpen(false)} />
                <div className="absolute left-4 top-10 w-64 bg-slate-950 border border-slate-800 rounded-sm shadow-2xl z-50 p-1.5 space-y-1">
                  <div className="px-2.5 py-1.5 border-b border-slate-900 text-[9px] font-mono text-slate-500 uppercase tracking-widest font-semibold">
                    Switch Workspace Node
                  </div>
                  {workspaces.map((ws) => {
                    const WsIcon = ws.icon;
                    const isActive = ws.id === settings.activeWorkspace;
                    return (
                      <button
                        key={ws.id}
                        onClick={() => {
                          updateSetting('activeWorkspace', ws.id);
                          setIsWorkspaceDropdownOpen(false);
                          triggerToast('success', `Active workspace switched to: ${ws.label}`);
                        }}
                        className={`w-full text-left p-2 rounded-sm transition-all flex items-start gap-2.5 cursor-pointer ${isActive ? 'bg-cyan-950/25 border border-cyan-500/20 text-cyan-400' : 'hover:bg-slate-900/60 border border-transparent text-slate-400 hover:text-slate-200'}`}
                      >
                        <WsIcon className={`w-4 h-4 mt-0.5 shrink-0 ${ws.color}`} />
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-xs leading-none">{ws.label}</span>
                          <span className="text-[9px] text-slate-500 font-mono mt-1 leading-tight">{ws.desc}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Global Toolbar */}
        <div className="flex items-center gap-3">
          {/* Universal Search (Ctrl+K) */}
          <button
            onClick={() => setIsCommandOpen(true)}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs text-slate-500 bg-slate-950 hover:bg-slate-900/60 border border-slate-800 rounded-sm cursor-pointer transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search Workspace...</span>
            <span className="text-[9px] border border-slate-800 bg-slate-900 text-slate-400 px-1 py-0.5 rounded font-mono">
              Ctrl+K
            </span>
          </button>

          {/* Theme switcher */}
          <div className="flex items-center border border-slate-800 bg-slate-950 rounded-sm p-0.5">
            <button
              onClick={() => setTheme('light')}
              className={`p-1.5 rounded-sm cursor-pointer transition-colors ${theme === 'light' ? 'text-amber-400 bg-slate-900' : 'text-slate-500 hover:text-slate-300'}`}
              title="Light Theme"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`p-1.5 rounded-sm cursor-pointer transition-colors ${theme === 'dark' ? 'text-cyan-400 bg-slate-900' : 'text-slate-500 hover:text-slate-300'}`}
              title="Dark Theme"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('system')}
              className={`p-1.5 rounded-sm cursor-pointer transition-colors ${theme === 'system' ? 'text-slate-200 bg-slate-900' : 'text-slate-500 hover:text-slate-300'}`}
              title="System Default Theme"
            >
              <Laptop className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Right panel toggle */}
          <button
            onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
            className={`p-2 border border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200 rounded-sm cursor-pointer transition-colors hidden lg:block ${isRightPanelOpen ? 'border-cyan-500/20 text-cyan-400' : ''}`}
            title="Toggle Action Logs Drawer"
          >
            <Activity className="w-4 h-4" />
          </button>

          {/* Operator Profile dropdown */}
          {user && (
            <div className="border-l border-slate-800 pl-3 flex items-center gap-2.5">
              <button
                onClick={() => onNavigate('profile')}
                className="flex items-center gap-2.5 text-left hover:opacity-85 cursor-pointer"
              >
                <div className="w-7 h-7 rounded-sm border border-slate-800 bg-slate-900 flex items-center justify-center font-mono text-[11px] text-cyan-400 overflow-hidden font-bold">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    user.name.charAt(0)
                  )}
                </div>
                <div className="hidden md:flex flex-col">
                  <span className="text-xs font-semibold text-slate-200 truncate max-w-[110px] leading-none">
                    {user.name}
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono leading-none mt-0.5 uppercase tracking-wider">
                    {user.role}
                  </span>
                </div>
              </button>
              <button
                onClick={logout}
                className="text-slate-500 hover:text-red-400 p-1.5 rounded hover:bg-slate-900 cursor-pointer transition-colors"
                title="Revoke session key"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* 2. Workspace Body Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Collapsible Left Rail Sidebar */}
        <aside className={`hidden md:flex border-r ${resolvedTheme === 'dark' ? 'border-slate-900 bg-slate-950' : 'border-slate-200 bg-white'} flex-col transition-all duration-300 shrink-0 ${
          settings.sidebarCollapsed ? 'w-[72px]' : 'w-64'
        }`}>
          <div className="p-4 border-b border-slate-900 flex items-center justify-between">
            {!settings.sidebarCollapsed && (
              <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500 font-semibold">
                SYSTEM CORE SECTIONS
              </span>
            )}
            <button
              onClick={() => updateSetting('sidebarCollapsed', !settings.sidebarCollapsed)}
              className="text-slate-500 hover:text-slate-300 p-1 hover:bg-slate-900 rounded-sm cursor-pointer ml-auto"
              title={settings.sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              <ChevronRight className={`w-4 h-4 transform transition-transform ${settings.sidebarCollapsed ? '' : 'rotate-180'}`} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            {navItems.map((item) => {
              const isSelected = currentRoute === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full p-2.5 rounded-sm border transition-all cursor-pointer flex items-center gap-3 group relative ${
                    isSelected
                      ? 'bg-cyan-950/10 border-cyan-500/20 text-cyan-400 shadow-sm shadow-cyan-500/5'
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
                  }`}
                  style={{ minHeight: '44px' }} // Touch target size compliance
                >
                  <div className={`p-1.5 rounded-sm border shrink-0 ${
                    isSelected ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-slate-900 border-slate-900 text-slate-500 group-hover:text-slate-300'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {!settings.sidebarCollapsed && (
                    <span className="text-xs font-semibold truncate text-left">{item.label}</span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="p-3 border-t border-slate-950">
            {!settings.sidebarCollapsed && (
              <div className="p-3 bg-slate-900/40 border border-slate-900 rounded-sm text-[10px] text-slate-500 font-mono leading-relaxed">
                <div className="flex items-center gap-1.5 text-slate-400 font-semibold mb-1">
                  <Shield className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Cleared Node</span>
                </div>
                You are currently running the core staging layout.
              </div>
            )}
          </div>
        </aside>

        {/* 3. Central Canvas View */}
        <main className="flex-1 flex flex-col overflow-y-auto">
          {/* Sub-Header Breadcrumb Area */}
          <div className={`px-6 py-2 border-b ${resolvedTheme === 'dark' ? 'border-slate-900 bg-slate-950/40' : 'border-slate-200 bg-white'} flex items-center justify-between`}>
            <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500">
              <span className="hover:text-slate-300 cursor-pointer" onClick={() => onNavigate('dashboard')}>JNAS SYSTEM</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-cyan-400 capitalize">{currentRoute.replace('-', ' ')}</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono hidden sm:block">
              PLATFORM_STAGING • ID: 84312e • UTC: 2026-06-29
            </div>
          </div>

          {/* Main child viewport */}
          <div className={`p-6 max-w-7xl w-full mx-auto space-y-6 flex-1 ${settings.compactMode ? 'px-4 py-4 gap-4' : ''}`}>
            {children}
          </div>

          {/* Minimal footer */}
          <footer className={`px-6 py-3.5 border-t ${resolvedTheme === 'dark' ? 'border-slate-900 bg-slate-950/40' : 'border-slate-200 bg-white'} text-[10px] font-mono text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2.5`}>
            <span>JNAS AI CORE © 2026 • ALL PERMISSIONS BOUND SECURELY</span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                KERNEL_ONLINE
              </span>
              <span>ROLE: {user?.role.toUpperCase() || 'MOCK'}</span>
            </div>
          </footer>
        </main>

        {/* 4. Collapsible Right Utility Panel (Placeholder, Deliverable 5) */}
        <AnimatePresence>
          {isRightPanelOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className={`hidden lg:flex border-l ${resolvedTheme === 'dark' ? 'border-slate-900 bg-slate-950' : 'border-slate-200 bg-white'} flex-col transition-all duration-300 shrink-0 overflow-hidden`}
            >
              <div className="p-4.5 border-b border-slate-900 flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500 font-semibold flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  REAL-TIME DISPATCH LOGS
                </span>
                <button
                  onClick={() => setIsRightPanelOpen(false)}
                  className="text-slate-500 hover:text-slate-300 p-1 hover:bg-slate-900 rounded-sm cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Mock System Logs Console */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 font-mono text-[10px] leading-relaxed">
                <div className="p-3 bg-slate-950 border border-slate-900 rounded-sm text-slate-500 space-y-2">
                  <div className="text-cyan-500">// INITIALIZING HANDSHAKE</div>
                  <div>[11:26:02] ping router.jnas.internal</div>
                  <div className="text-emerald-500">[11:26:02] bound status: CONNECTED (18ms)</div>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-900 rounded-sm text-slate-500 space-y-2">
                  <div className="text-amber-500">// MEMORY GARBAGE COLLECTION</div>
                  <div>[11:26:15] heap audit: 82% occupied</div>
                  <div>[11:26:15] compact pool trigger: COMPLETE</div>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-900 rounded-sm text-slate-500 space-y-2">
                  <div className="text-cyan-500">// DISPATCH QUEUE EXECUTION</div>
                  <div>[11:26:30] dispatch command: ask-ai</div>
                  <div>[11:26:30] thread status: SUSPENDED (Sprint 2)</div>
                </div>
              </div>

              <div className="p-4 border-t border-slate-950 bg-slate-950/30 text-[9px] font-mono text-slate-500 text-center leading-relaxed">
                Active logs reflect live micro-process dispatches across workspace sub-nodes.
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* 5. Mobile Slide-over Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="relative w-full max-w-[280px] bg-slate-950 border-r border-slate-900 flex flex-col h-full z-10"
            >
              <div className="px-5 py-4 border-b border-slate-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-cyan-400" />
                  <span className="text-xs font-mono font-bold tracking-tight uppercase text-slate-200">
                    JNAS MODULES
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-slate-500 hover:text-slate-300 p-1.5 rounded-sm cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                {navItems.map((item) => {
                  const isSelected = currentRoute === item.id;
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onNavigate(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full p-3 rounded border transition-all cursor-pointer flex items-center gap-3.5 ${
                        isSelected
                          ? 'bg-cyan-950/15 border-cyan-500/20 text-cyan-400'
                          : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
                      }`}
                      style={{ minHeight: '48px' }} // Touch target size compliance
                    >
                      <Icon className="w-4 h-4 text-cyan-500" />
                      <span className="text-xs font-semibold">{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              {user && (
                <div className="p-4 border-t border-slate-900 flex items-center gap-3">
                  <div className="w-8 h-8 rounded border border-slate-800 bg-slate-900 flex items-center justify-center font-mono text-xs text-cyan-400 overflow-hidden font-bold">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      user.name.charAt(0)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-300 truncate">{user.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono truncate">{user.role}</div>
                  </div>
                  <button onClick={logout} className="text-slate-500 hover:text-red-400 p-1.5 rounded cursor-pointer">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. Command Palette Overlay */}
      <DSCommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        searchQuery={cmdQuery}
        setSearchQuery={setCmdQuery}
        onCommandSelect={(cmd) => {
          setIsCommandOpen(false);
          if (cmd === 'open-ai-workspace') {
            onNavigate('ai-core');
            triggerToast('success', 'Enterprise AI Workspace loaded.');
          } else if (cmd === 'new-ai-session') {
            onNavigate('ai-core');
            setTimeout(() => eventBus.publish('CMD_NEW_SESSION', {}, { emitter: 'AppShell' }), 100);
          } else if (cmd === 'search-ai-sessions') {
            onNavigate('ai-core');
            triggerToast('info', 'AI Session directory search active.');
          } else if (cmd === 'favorite-ai-session') {
            onNavigate('ai-core');
            triggerToast('info', 'Favorite toggle triggered.');
          } else if (cmd === 'open-context-inspector') {
            onNavigate('ai-core');
            setTimeout(() => eventBus.publish('CMD_OPEN_CONTEXT_INSPECTOR', {}, { emitter: 'AppShell' }), 100);
          } else if (cmd === 'refresh-ai-context') {
            onNavigate('ai-core');
            setTimeout(() => eventBus.publish('CMD_REFRESH_CONTEXT', {}, { emitter: 'AppShell' }), 100);
          } else if (cmd === 'switch-ai-provider') {
            onNavigate('ai-core');
            triggerToast('info', 'AI Gateway provider selection active.');
          } else if (cmd === 'ask-ai') {
            onNavigate('ai-core');
            triggerToast('info', 'AI Core platform route opened.');
          } else if (cmd === 'create-task') {
            onNavigate('projects');
            triggerToast('success', 'Workspace target shifted to milestone scheduler.');
          } else if (cmd === 'switch-workspace') {
            onNavigate('dashboard');
            triggerToast('success', 'Workspace parameters aligned.');
          } else if (cmd === 'system-status') {
            onNavigate('admin');
            triggerToast('info', 'IAM keys clearance page opened.');
          } else if (cmd === 'customer-registry' || cmd === 'create-customer') {
            onNavigate('crm');
            triggerToast('success', 'Enterprise customer workspace roster loaded.');
          } else if (cmd === 'contact-registry' || cmd === 'create-contact' || cmd === 'search-contact') {
            onNavigate('contacts');
            triggerToast('success', 'Enterprise contact workspace registry loaded.');
          } else if (
            cmd === 'document-center' ||
            cmd === 'upload-document' ||
            cmd === 'search-document' ||
            cmd === 'recent-documents' ||
            cmd === 'favorite-documents' ||
            cmd === 'archive-document'
          ) {
            onNavigate('documents');
            triggerToast('success', `Enterprise Document Center loaded. Action: ${cmd}`);
            (window as any).__lastDocCommand = cmd;
          } else if (
            cmd === 'open-engineering-workspace' ||
            cmd === 'open-drawing' ||
            cmd === 'open-engineering-project' ||
            cmd === 'search-drawings' ||
            cmd === 'search-standards' ||
            cmd === 'recent-drawings' ||
            cmd === 'engineering-dashboard'
          ) {
            onNavigate('engineering');
            triggerToast('success', `Engineering Workspace loaded. Action: ${cmd}`);
            (window as any).__lastEngineeringCommand = cmd;
            setTimeout(() => {
              eventBus.publish('CMD_ENGINEERING', { command: cmd }, { emitter: 'AppShell' });
            }, 150);
          } else if (
            cmd === 'open-packaging-studio' ||
            cmd === 'create-packaging-project' ||
            cmd === 'search-packaging' ||
            cmd === 'recent-packaging-projects' ||
            cmd === 'packaging-dashboard' ||
            cmd === 'material-library' ||
            cmd === 'create-material' ||
            cmd === 'open-material' ||
            cmd === 'search-material' ||
            cmd === 'recent-materials' ||
            cmd === 'favorite-materials' ||
            cmd === 'load-planning-registry' ||
            cmd === 'container-library' ||
            cmd === 'create-load-plan' ||
            cmd === 'logistics-dashboard' ||
            cmd === 'returnables-registry' ||
            cmd === 'returnables-dashboard' ||
            cmd === 'create-returnable-asset' ||
            cmd === 'track-returnable-asset'
          ) {
            onNavigate('packaging');
            triggerToast('success', `Packaging Studio loaded. Action: ${cmd}`);
            (window as any).__lastPackagingCommand = cmd;
            setTimeout(() => {
              eventBus.publish('CMD_PACKAGING', { command: cmd }, { emitter: 'AppShell' });
            }, 150);
          } else if (
            cmd === 'open-decision-intelligence' ||
            cmd === 'create-dashboard' ||
            cmd === 'search-kpi'
          ) {
            onNavigate('decision');
            triggerToast('success', `Decision Intelligence loaded. Action: ${cmd}`);
            setTimeout(() => {
              eventBus.publish('CMD_DECISION', { command: cmd }, { emitter: 'AppShell' });
            }, 150);
          } else if (
            cmd === 'open-digital-thread' ||
            cmd === 'trace-object' ||
            cmd === 'relationship-explorer' ||
            cmd === 'dependency-viewer'
          ) {
            onNavigate('thread');
            triggerToast('success', `Digital Thread Workspace loaded. Action: ${cmd}`);
            setTimeout(() => {
              eventBus.publish('CMD_THREAD', { command: cmd }, { emitter: 'AppShell' });
            }, 150);
          }
        }}
      />
    </div>
  );
};

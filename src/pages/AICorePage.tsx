import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Search,
  Sliders,
  Maximize2,
  Minimize2,
  Cpu,
  Trash2,
  FolderDot,
  UserCheck,
  Bookmark,
  Share2,
  Compass,
  Database,
  Layers,
  Activity,
  Terminal,
  HelpCircle,
  FileCode,
  AlertTriangle,
  PlayCircle,
  Plus,
  Send,
  Eye,
  Info,
  ExternalLink,
  ChevronRight,
  Clock,
  Pin,
  Star,
  CheckCircle,
  FileText,
  User,
  RefreshCw,
  FolderOpen,
  DollarSign
} from 'lucide-react';

import { useNotification } from '../contexts/NotificationContext';
import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';
import { eventBus } from '../core';

import { sessionRegistry } from '../backend/ai/sessionRegistry';
import { contextBuilder } from '../backend/ai/contextBuilder';
import { promptComposer } from '../backend/ai/promptComposer';
import { responseInspector } from '../backend/ai/responseInspector';
import { toolRegistry } from '../backend/ai/toolRegistry';
import { AISession, AIResponseMeta, ContextItem } from '../backend/ai/types';
import { PromptLayers } from '../backend/ai/promptComposer';

import { DSBadge, DSAlert } from '../components/design-system/DSStatus';
import { DSButton } from '../components/design-system/DSButton';
import { DSCard, DSCardContent } from '../components/design-system/DSCard';

export const AICorePage: React.FC = () => {
  const { triggerToast } = useNotification();
  const { settings, updateSetting } = useSettings();
  const { user } = useAuth();

  // Active Session and List States
  const [sessions, setSessions] = useState<AISession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');

  // Input states
  const [promptText, setPromptText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamContent, setStreamContent] = useState('');

  // UI Panels states
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);
  const [activeInspectorTab, setActiveInspectorTab] = useState<'context' | 'composer' | 'tools'>('context');
  const [isResponseInspectorOpen, setIsResponseInspectorOpen] = useState(false);
  const [activeResponseMeta, setActiveResponseMeta] = useState<AIResponseMeta | null>(null);
  
  // Custom execution properties
  const [activeProvider, setActiveProvider] = useState('gemini');
  const [temperature, setTemperature] = useState(0.5);

  // Scroll anchor ref
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load and refresh sessions list
  const refreshSessions = () => {
    const list = sessionRegistry.getSessions();
    setSessions(list);
    if (list.length > 0 && !activeSessionId) {
      setActiveSessionId(list[0].id);
    }
  };

  useEffect(() => {
    refreshSessions();

    // Listen to command center events
    const subNewSession = eventBus.subscribe('CMD_NEW_SESSION', () => handleNewSession());
    const subRefreshContext = eventBus.subscribe('CMD_REFRESH_CONTEXT', () => {
      triggerToast('success', 'Ecosystem dynamic context refreshed.');
      refreshSessions();
    });
    const subOpenInspector = eventBus.subscribe('CMD_OPEN_CONTEXT_INSPECTOR', () => {
      setIsInspectorOpen(true);
      setActiveInspectorTab('context');
    });

    return () => {
      subNewSession.unsubscribe();
      subRefreshContext.unsubscribe();
      subOpenInspector.unsubscribe();
    };
  }, []);

  // Sync scroll on conversation growth
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessions, streamContent, isStreaming]);

  // Active Session Object
  const activeSession = sessions.find(s => s.id === activeSessionId) || null;

  // Gather live runtime context from other modules
  const currentContext = contextBuilder.gatherContext(
    settings.activeWorkspace,
    'ai-core',
    user
  );

  // Dynamic context items list with individual toggle states
  const contextItems = contextBuilder.getContextItems(settings.activeWorkspace, 'ai-core');

  // Multi-tier compiled prompt layers based on active state and input
  const promptLayers = promptComposer.composeLayers(
    promptText || '[Awaiting query input]',
    currentContext,
    activeSession ? activeSession.messages.map(m => ({ role: m.role, content: m.content })) : []
  );
  const compiledFinalPrompt = promptComposer.compileFinalPrompt(promptLayers);
  const estimatedTokens = contextBuilder.estimateTokenCount(compiledFinalPrompt);

  // Handle New AI Session Creation
  const handleNewSession = (title?: string) => {
    const defaultTitle = `Intel Thread #${sessions.length + 1}`;
    const newSession = sessionRegistry.createSession({
      title: title || defaultTitle,
      workspace: settings.activeWorkspace,
      category: settings.activeWorkspace === 'engineering' ? 'Engineering R&D' : 'General Operations',
      providerId: activeProvider,
      temperature: temperature
    });
    refreshSessions();
    setActiveSessionId(newSession.id);
    setPromptText('');
    triggerToast('success', `Initialized AI Session: "${newSession.title}"`);
  };

  // Toggle Favorite
  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    sessionRegistry.toggleFavorite(id);
    refreshSessions();
    triggerToast('success', 'Session saved to favorites.');
  };

  // Toggle Pin Status (Archived / Active)
  const handleArchiveSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const s = sessionRegistry.getSession(id);
    if (!s) return;
    const nextStatus = s.status === 'active' ? 'archived' : 'active';
    sessionRegistry.setStatus(id, nextStatus);
    refreshSessions();
    triggerToast('success', nextStatus === 'archived' ? 'AI Session archived.' : 'AI Session restored to active.');
  };

  // Delete AI Session
  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    sessionRegistry.deleteSession(id);
    if (activeSessionId === id) {
      setActiveSessionId(null);
    }
    refreshSessions();
    triggerToast('success', 'AI Session permanently deleted.');
  };

  // Rename Session title
  const handleRenameSession = (id: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    sessionRegistry.updateSession(id, { title: newTitle });
    refreshSessions();
  };

  // Send Prompt with full SSE-Style streaming and non-streaming fallback
  const handleSendPrompt = async () => {
    if (!activeSessionId || !promptText.trim() || isStreaming) return;

    const userQuery = promptText;
    setPromptText('');

    // Append User Message Locally
    const userMsg = { role: 'user' as const, content: userQuery };
    const updatedMessages = [...(activeSession?.messages || []), userMsg];
    sessionRegistry.updateSession(activeSessionId, { messages: updatedMessages });
    refreshSessions();

    setIsStreaming(true);
    setStreamContent('');

    const startTime = Date.now();

    // Compile active prompt configuration
    const activeSystemInstruction = `You are the JNAS Enterprise Co-Pilot operating in workspace: ${settings.activeWorkspace.toUpperCase()}. Aligned to context guidelines.`;

    try {
      // Dispatch server SSE streaming request
      const response = await fetch('/api/ai/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId: activeProvider,
          messages: updatedMessages,
          temperature,
          maxTokens: 2048,
          systemInstruction: activeSystemInstruction
        })
      });

      if (!response.ok) {
        throw new Error(`SSE handshaking error: Status ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');

      if (!reader) {
        throw new Error('SSE Stream reading unsupported by environment container.');
      }

      let completeReply = '';
      let done = false;

      // Publish dynamic send event
      eventBus.publish('AI_PROMPT_SENT', { sessionId: activeSessionId, promptText: userQuery, estimatedTokens }, { emitter: 'AIWorkspace' });

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        if (readerDone) {
          done = true;
          break;
        }

        const chunkText = decoder.decode(value, { stream: true });
        // Server SSE streams events prefixed with 'data: '
        const lines = chunkText.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.substring(6));
              if (data.done) {
                done = true;
              } else if (data.text) {
                completeReply += data.text;
                setStreamContent(completeReply);
              } else if (data.error) {
                throw new Error(data.error);
              }
            } catch (e) {
              // Ignore partial chunk parsers
            }
          }
        }
      }

      // Finalize message append
      const assistantMsg = { role: 'assistant' as const, content: completeReply };
      const finalMsgList = [...updatedMessages, assistantMsg];
      
      // Calculate response inspect details
      const latency = Date.now() - startTime;
      const inspectMeta = responseInspector.analyzeResponse(
        completeReply,
        compiledFinalPrompt.length,
        latency,
        activeProvider,
        currentContext
      );

      sessionRegistry.updateSession(activeSessionId, { 
        messages: finalMsgList,
        providerId: activeProvider,
        temperature
      });

      refreshSessions();
      setActiveResponseMeta(inspectMeta);
      setIsResponseInspectorOpen(true);

      // Publish audit telemetry
      eventBus.publish('AI_RESPONSE_GENERATED', { 
        sessionId: activeSessionId, 
        tokensUsed: inspectMeta.inputTokens + inspectMeta.outputTokens, 
        latencyMs: latency, 
        providerId: activeProvider 
      }, { emitter: 'AIWorkspace' });

    } catch (err: any) {
      console.error('[AIWorkspace] Generation error:', err);
      // Fallback: non-streaming dispatch
      try {
        const fallbackRes = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            providerId: activeProvider,
            messages: updatedMessages,
            temperature,
            maxTokens: 2048,
            systemInstruction: activeSystemInstruction
          })
        });

        const fallbackData = await fallbackRes.json();
        if (fallbackData.success && fallbackData.response) {
          const content = fallbackData.response.content;
          const assistantMsg = { role: 'assistant' as const, content };
          sessionRegistry.updateSession(activeSessionId, { messages: [...updatedMessages, assistantMsg] });
          refreshSessions();

          const inspectMeta = responseInspector.analyzeResponse(
            content,
            compiledFinalPrompt.length,
            Date.now() - startTime,
            activeProvider,
            currentContext
          );
          setActiveResponseMeta(inspectMeta);
          setIsResponseInspectorOpen(true);
        } else {
          throw new Error(fallbackData.error || 'Server rejected non-streaming execution.');
        }
      } catch (fallbackErr: any) {
        triggerToast('error', `Model Service Failure: ${fallbackErr.message || err.message}`);
        // Append error notice in chat log
        const errorNoticeMsg = { 
          role: 'assistant' as const, 
          content: `⚠️ **AI GATEWAY TRANSACTION REFUSED**\n\nFailed to establish connection to model gateway:\n\`${fallbackErr.message || err.message}\`\n\nEnsure that \`GEMINI_API_KEY\` is fully declared and authorized.` 
        };
        sessionRegistry.updateSession(activeSessionId, { messages: [...updatedMessages, errorNoticeMsg] });
        refreshSessions();
      }
    } finally {
      setIsStreaming(false);
      setStreamContent('');
    }
  };

  // Keyboard shortcut for Cmd/Ctrl + Enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSendPrompt();
    }
  };

  // Filter sessions by query & category tab
  const filteredSessions = sessions.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (activeCategoryFilter === 'favorites') {
      return matchesSearch && s.favorite;
    }
    if (activeCategoryFilter === 'archived') {
      return matchesSearch && s.status === 'archived';
    }
    if (activeCategoryFilter !== 'all') {
      return matchesSearch && s.category.toLowerCase().includes(activeCategoryFilter.toLowerCase());
    }
    return matchesSearch && s.status === 'active';
  });

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-[#07090E] text-slate-100">
      
      {/* 1. SESSION SIDEBAR */}
      <AnimatePresence initial={false}>
        {isSidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 310, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="h-full bg-[#0B0E14] border-r border-[#151B26] flex flex-col shrink-0 overflow-hidden"
          >
            {/* Sidebar Search */}
            <div className="p-4 border-b border-[#151B26] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Bookmark className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-mono font-bold tracking-widest text-slate-300">
                    INTEL SESSION REPO
                  </span>
                </div>
                <DSButton
                  size="sm"
                  variant="primary"
                  onClick={() => handleNewSession()}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  New Thread
                </DSButton>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search Sessions or Tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#121824] border border-[#1C2638] rounded p-2 pl-9 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
                />
              </div>
            </div>

            {/* Faceted Filters */}
            <div className="px-3 py-2 bg-[#090C12] border-b border-[#151B26] flex gap-1 overflow-x-auto text-[10px] font-mono scrollbar-none">
              <button
                onClick={() => setActiveCategoryFilter('all')}
                className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
                  activeCategoryFilter === 'all' ? 'bg-cyan-950/40 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All Threads
              </button>
              <button
                onClick={() => setActiveCategoryFilter('favorites')}
                className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap flex items-center gap-1 ${
                  activeCategoryFilter === 'favorites' ? 'bg-cyan-950/40 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Star className="w-3 h-3 text-amber-400 fill-amber-400/20" /> Favorites
              </button>
              <button
                onClick={() => setActiveCategoryFilter('engineering')}
                className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
                  activeCategoryFilter === 'engineering' ? 'bg-cyan-950/40 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Engineering
              </button>
              <button
                onClick={() => setActiveCategoryFilter('archived')}
                className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
                  activeCategoryFilter === 'archived' ? 'bg-cyan-950/40 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Archived
              </button>
            </div>

            {/* Sessions List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredSessions.length === 0 ? (
                <div className="p-8 text-center text-slate-500 font-mono text-[11px] space-y-2">
                  <Compass className="w-6 h-6 mx-auto text-slate-600 animate-pulse" />
                  <div>No threads mapped under active criteria.</div>
                </div>
              ) : (
                filteredSessions.map((s) => {
                  const isActive = s.id === activeSessionId;
                  return (
                    <div
                      key={s.id}
                      onClick={() => setActiveSessionId(s.id)}
                      className={`group relative p-3 rounded border text-left transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#121926]/80 border-cyan-500/30 text-slate-100 shadow-[0_0_12px_rgba(6,182,212,0.05)]'
                          : 'bg-[#0E131F]/30 border-transparent text-slate-400 hover:bg-[#0E131F]/60 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div className="text-xs font-semibold truncate max-w-[190px]">
                          {s.title}
                        </div>
                        
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => handleToggleFavorite(s.id, e)}
                            className="text-slate-500 hover:text-amber-400 p-0.5 rounded"
                          >
                            <Star className={`w-3.5 h-3.5 ${s.favorite ? 'text-amber-400 fill-amber-400/20' : ''}`} />
                          </button>
                          <button
                            onClick={(e) => handleArchiveSession(s.id, e)}
                            className="text-slate-500 hover:text-cyan-400 p-0.5 rounded"
                          >
                            <FolderDot className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteSession(s.id, e)}
                            className="text-slate-500 hover:text-red-400 p-0.5 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-1.5 flex flex-wrap gap-1 items-center justify-between text-[9px] font-mono">
                        <span className="text-[10px] text-cyan-500 uppercase tracking-widest text-[8px] font-semibold">
                          {s.category}
                        </span>
                        
                        <div className="flex items-center gap-1 text-slate-500">
                          <Clock className="w-2.5 h-2.5" />
                          {new Date(s.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </div>
                      </div>

                      {/* Tags */}
                      {s.tags && s.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {s.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="px-1 py-0.5 bg-slate-900 border border-slate-800 text-slate-400 text-[8px] rounded uppercase font-mono">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* User details footer */}
            {user && (
              <div className="p-4 border-t border-[#151B26] bg-[#090C12] flex items-center gap-2.5 text-left">
                <div className="w-8 h-8 rounded border border-[#1C2638] bg-[#121824] flex items-center justify-center font-mono text-xs text-cyan-400 overflow-hidden font-bold">
                  {user.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0 font-mono">
                  <div className="text-xs font-bold text-slate-300 truncate">{user.name}</div>
                  <div className="text-[9px] text-slate-500 tracking-wider uppercase truncate">{user.role}</div>
                </div>
                <div className="text-[10px] text-green-400 animate-pulse font-mono flex items-center gap-1">
                  ● ACTIVE
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. CHAT CANVAS AREA */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#07090E]">
        
        {/* Workspace Header */}
        <div className="h-14 px-5 border-b border-[#151B26] bg-[#090C12] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <Terminal className="w-4 h-4 text-cyan-400" />
            </button>
            
            <div className="text-left font-mono">
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  {activeSession ? activeSession.title : 'No Session Selected'}
                </h2>
                {activeSession?.favorite && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
              </div>
              <div className="text-[10px] text-slate-500 flex items-center gap-1.5">
                <span>Ecosystem Security Barrier: {settings.activeWorkspace.toUpperCase()}</span>
                <span>•</span>
                <span>Active Link: {activeSession?.projectId ? `Project` : activeSession?.customerId ? `Customer` : `None`}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            {/* Quick Provider Picker */}
            <div className="flex items-center gap-2 border border-[#1C2638] bg-[#121824] p-1 rounded">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <select
                value={activeProvider}
                onChange={(e) => {
                  setActiveProvider(e.target.value);
                  eventBus.publish('AI_PROVIDER_CHANGED', { providerId: e.target.value }, { emitter: 'AIWorkspace' });
                }}
                className="bg-transparent text-[11px] text-slate-300 border-none outline-none pr-6 font-semibold"
              >
                <option value="gemini" className="bg-[#121824]">Google Gemini</option>
                <option value="openai" className="bg-[#121824]">OpenAI Enterprise</option>
                <option value="anthropic" className="bg-[#121824]">Anthropic Claude</option>
                <option value="ollama" className="bg-[#121824]">Ollama Local Core</option>
              </select>
            </div>

            <button
              onClick={() => setIsInspectorOpen(!isInspectorOpen)}
              className={`p-1.5 rounded border transition-colors ${
                isInspectorOpen ? 'bg-cyan-950/30 border-cyan-500/30 text-cyan-400' : 'border-[#1C2638] text-slate-400 hover:text-slate-200'
              }`}
              title="Inspect Dynamic Context Builder"
            >
              <Layers className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message Canvas */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!activeSession ? (
            <div className="h-full flex flex-col items-center justify-center p-8 space-y-4 font-mono">
              <Compass className="w-10 h-10 text-cyan-500 animate-spin" />
              <h3 className="text-sm font-semibold tracking-widest text-cyan-400">SELECT INTELLIGENCE DISPATCH THREAD</h3>
              <p className="text-xs text-slate-500 max-w-sm text-center">
                Click an existing diagnostic session or create a new workflow thread to query the ecosystem.
              </p>
              <DSButton variant="primary" onClick={() => handleNewSession()}>
                Bootstrap First Thread
              </DSButton>
            </div>
          ) : activeSession.messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-8 space-y-6 max-w-xl mx-auto">
              <div className="p-4 bg-cyan-950/20 rounded-full border border-cyan-500/20">
                <Sparkles className="w-8 h-8 text-cyan-400" />
              </div>
              <div className="space-y-2 text-center">
                <h3 className="text-sm font-mono font-bold tracking-widest text-slate-200 uppercase">
                  UNIFIED CO-PILOT TUNNEL ESTABLISHED
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-mono">
                  I have automatically gathered all relevant live environment parameters for this 
                  <span className="text-cyan-400 font-semibold px-1">[{settings.activeWorkspace.toUpperCase()}]</span> 
                  isolation boundary. Ask me anything about current active customers, project milestones, AS9100 standards, or file structures.
                </p>
              </div>

              {/* Dynamic Suggested Context Tags */}
              <div className="w-full grid grid-cols-2 gap-3 text-left">
                <div
                  onClick={() => setPromptText('Inspect the StarLabs contract Service Level Agreement constraints and deliverable timelines.')}
                  className="p-3 rounded bg-[#101524]/60 border border-[#1C2638] hover:border-cyan-500/30 transition-all cursor-pointer font-mono"
                >
                  <div className="text-[10px] text-cyan-400 flex items-center gap-1">
                    <UserCheck className="w-3 h-3" /> SLA Contract Review
                  </div>
                  <p className="text-[9px] text-slate-500 mt-1 truncate">Analyze StarLabs late shipment penalty capping.</p>
                </div>
                
                <div
                  onClick={() => setPromptText('Verify the yield stress limits of Titanium composites under extreme thermal conditions (exceeding 800K).')}
                  className="p-3 rounded bg-[#101524]/60 border border-[#1C2638] hover:border-cyan-500/30 transition-all cursor-pointer font-mono"
                >
                  <div className="text-[10px] text-cyan-400 flex items-center gap-1">
                    <Database className="w-3 h-3" /> Materials Engineering
                  </div>
                  <p className="text-[9px] text-slate-500 mt-1 truncate">Verify titanium yield strength limits.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {activeSession.messages.map((msg, i) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={i}
                    className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <div className="w-8 h-8 rounded border border-cyan-500/20 bg-cyan-950/20 flex items-center justify-center font-mono text-cyan-400 font-bold shrink-0 shadow-[0_0_8px_rgba(6,182,212,0.1)]">
                        <Cpu className="w-4 h-4" />
                      </div>
                    )}

                    <div className="max-w-[85%] space-y-2">
                      <div className={`p-4 rounded-lg border text-left leading-relaxed ${
                        isUser
                          ? 'bg-[#151D2A] border-slate-700 text-slate-100 font-mono text-xs'
                          : 'bg-[#0E131F] border-[#151B26] text-slate-300 text-xs font-sans'
                      }`}>
                        
                        {/* Dynamic Render with custom headers and lists */}
                        <div className="whitespace-pre-wrap leading-relaxed space-y-3">
                          {msg.content}
                        </div>

                        {/* Audit inspector link if Assistant */}
                        {!isUser && (
                          <div className="mt-3 pt-3 border-t border-[#1C2638] flex items-center justify-between text-[10px] font-mono">
                            <div className="text-slate-500 flex items-center gap-1.5">
                              <span>Provider: {activeSession.providerId.toUpperCase()}</span>
                              <span>•</span>
                              <span>Temp: {activeSession.temperature}</span>
                            </div>
                            
                            <button
                              onClick={() => {
                                const dummyMeta = responseInspector.analyzeResponse(
                                  msg.content,
                                  compiledFinalPrompt.length,
                                  340,
                                  activeSession.providerId,
                                  currentContext
                                );
                                setActiveResponseMeta(dummyMeta);
                                setIsResponseInspectorOpen(true);
                              }}
                              className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 uppercase tracking-wider text-[9px] font-semibold"
                            >
                              <Eye className="w-3 h-3" /> Inspect Response Model Audit
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {isUser && (
                      <div className="w-8 h-8 rounded border border-slate-700 bg-slate-800 flex items-center justify-center font-mono text-xs text-slate-300 font-bold shrink-0">
                        {user ? user.name.charAt(0) : 'O'}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Streaming Content Indicator */}
              {isStreaming && streamContent && (
                <div className="flex gap-4 justify-start">
                  <div className="w-8 h-8 rounded border border-cyan-500/20 bg-cyan-950/20 flex items-center justify-center font-mono text-cyan-400 font-bold shrink-0 animate-pulse">
                    <Cpu className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="max-w-[85%] text-left">
                    <div className="p-4 rounded-lg border bg-[#0E131F] border-cyan-500/20 text-slate-300 text-xs font-sans">
                      <div className="whitespace-pre-wrap leading-relaxed">
                        {streamContent}
                        <span className="inline-block w-1.5 h-4 ml-1 bg-cyan-400 animate-pulse" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Prompt Composer & Toolbar */}
        <div className="p-4 border-t border-[#151B26] bg-[#090C12] space-y-3 font-mono">
          <div className="max-w-4xl mx-auto space-y-2">
            
            {/* Input Area */}
            <div className="relative border border-[#1C2638] bg-[#0E1420] rounded p-1.5 focus-within:border-cyan-500/40 transition-all flex items-end gap-2">
              <textarea
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Enterprise Co-Pilot... (Press Cmd+Enter to dispatch)"
                className="flex-1 bg-transparent resize-none p-2 text-xs font-mono text-slate-200 placeholder-slate-500 border-none outline-none min-h-[44px] max-h-[140px]"
              />
              
              <div className="flex items-center gap-1.5 pb-1">
                <DSButton
                  size="sm"
                  variant="primary"
                  onClick={handleSendPrompt}
                  disabled={!promptText.trim() || isStreaming || !activeSessionId}
                  leftIcon={<Send className="w-3.5 h-3.5" />}
                >
                  {isStreaming ? 'Streaming...' : 'Send'}
                </DSButton>
              </div>
            </div>

            {/* Quick Suggestions / Telemetry Footer */}
            <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-slate-400">
                  <Database className="w-3 h-3 text-cyan-400" /> Aligned Context Size:
                </span>
                <span className="text-cyan-400 font-semibold">{estimatedTokens} estimated tokens</span>
              </div>
              
              <div className="flex gap-4">
                <span>Temp: {temperature}</span>
                <span>Max Tokens: 2,048</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. CONTEXT & LAYER INSPECTOR (DRAWER) */}
      <AnimatePresence initial={false}>
        {isInspectorOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 330, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="h-full bg-[#0B0E14] border-l border-[#151B26] flex flex-col shrink-0 overflow-hidden text-left"
          >
            {/* Drawer Tabs Header */}
            <div className="flex bg-[#090C12] border-b border-[#151B26] text-[10px] font-mono">
              <button
                onClick={() => setActiveInspectorTab('context')}
                className={`flex-1 py-3 text-center transition-colors font-bold uppercase tracking-wider ${
                  activeInspectorTab === 'context' ? 'text-cyan-400 border-b-2 border-cyan-500 bg-[#0C111C]' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Ecosystem Context
              </button>
              <button
                onClick={() => setActiveInspectorTab('composer')}
                className={`flex-1 py-3 text-center transition-colors font-bold uppercase tracking-wider ${
                  activeInspectorTab === 'composer' ? 'text-cyan-400 border-b-2 border-cyan-500 bg-[#0C111C]' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Prompt Layers
              </button>
            </div>

            {/* Tab 1: Live Context */}
            {activeInspectorTab === 'context' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="p-3 border-b border-[#151B26] bg-[#0E131F]/30 flex items-center justify-between font-mono text-[11px]">
                  <span className="text-slate-400 uppercase tracking-widest font-bold">Dynamic Context Matrix</span>
                  <DSBadge variant="solid" color="cyan">AUTO-TRACK</DSBadge>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-3 font-mono text-xs">
                  {contextItems.map(item => {
                    const isEnabled = contextBuilder.isEnabled(item.type);
                    return (
                      <div
                        key={item.id}
                        className={`p-2.5 rounded border transition-all ${
                          isEnabled 
                            ? 'bg-[#121926]/40 border-cyan-500/15' 
                            : 'bg-slate-900/30 border-transparent opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={isEnabled}
                              onChange={(e) => {
                                contextBuilder.setEnabled(item.type, e.target.checked);
                                refreshSessions();
                              }}
                              className="accent-cyan-500 rounded text-slate-900 cursor-pointer w-3.5 h-3.5"
                            />
                            <span className="font-bold text-[11px] text-slate-300 uppercase tracking-wider">
                              {item.type}
                            </span>
                          </label>
                          <span className="text-[9px] text-slate-500">
                            {isEnabled ? 'SYNCED' : 'EXCLUDED'}
                          </span>
                        </div>

                        <div className="mt-1.5 pl-5 text-[10px] text-slate-400 border-l border-[#1C2638] space-y-1">
                          <div className="font-semibold text-slate-200 truncate">{item.label}</div>
                          {isEnabled && item.metadata && (
                            <pre className="text-[9px] bg-slate-950/40 p-1 rounded text-slate-500 font-mono mt-1 overflow-x-auto">
                              {JSON.stringify(item.metadata, null, 2)}
                            </pre>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab 2: Prompt Layers */}
            {activeInspectorTab === 'composer' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-[11px] text-left">
                <div className="p-3 border border-[#1C2638] bg-[#0E131F]/30 rounded space-y-2">
                  <h4 className="font-bold text-cyan-400 uppercase tracking-widest text-[10px]">
                    Layered Composer Engine
                  </h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Dynamic prompt layers compile automatically prior to dispatching queries. Toggle tabs below to analyze exact variables.
                  </p>
                </div>

                {/* Layer 1 */}
                <div className="space-y-1">
                  <div className="text-[9px] text-slate-500 uppercase font-bold">1. System Prompt base</div>
                  <pre className="bg-[#121824] p-2 border border-[#1C2638] rounded text-slate-400 whitespace-pre-wrap max-h-24 overflow-y-auto text-[9px]">
                    {promptLayers.systemPrompt}
                  </pre>
                </div>

                {/* Layer 2 */}
                <div className="space-y-1">
                  <div className="text-[9px] text-slate-500 uppercase font-bold">2. Workspace Isolation Layer</div>
                  <pre className="bg-[#121824] p-2 border border-[#1C2638] rounded text-cyan-500 whitespace-pre-wrap max-h-20 overflow-y-auto text-[9px]">
                    {promptLayers.workspacePrompt}
                  </pre>
                </div>

                {/* Layer 3 */}
                <div className="space-y-1">
                  <div className="text-[9px] text-slate-500 uppercase font-bold">3. Aligned Module Directives</div>
                  <pre className="bg-[#121824] p-2 border border-[#1C2638] rounded text-slate-400 whitespace-pre-wrap text-[9px]">
                    {promptLayers.modulePrompt}
                  </pre>
                </div>

                {/* Layer 4 */}
                <div className="space-y-1">
                  <div className="text-[9px] text-slate-500 uppercase font-bold">4. Compiled XML Context</div>
                  <pre className="bg-[#121824] p-2 border border-[#1C2638] rounded text-green-500 whitespace-pre-wrap max-h-40 overflow-y-auto text-[9px]">
                    {promptLayers.contextPrompt}
                  </pre>
                </div>

                {/* Combined Compile */}
                <div className="pt-2 border-t border-[#1C2638] space-y-1">
                  <div className="text-[9px] text-slate-500 uppercase font-bold">Absolute Compiled Prompt Preview</div>
                  <pre className="bg-slate-950 p-2 border border-slate-800 rounded text-slate-500 whitespace-pre-wrap max-h-48 overflow-y-auto text-[8px] leading-tight">
                    {compiledFinalPrompt}
                  </pre>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. MODAL DRAWER: RESPONSE INSPECTOR */}
      <AnimatePresence>
        {isResponseInspectorOpen && activeResponseMeta && (
          <div className="fixed inset-0 z-50 flex items-center justify-end p-4 bg-slate-950/80 backdrop-blur-sm font-mono text-left">
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              className="w-full max-w-lg h-full bg-[#0B0E14] border-l border-[#151B26] p-6 flex flex-col space-y-6 overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-[#151B26] pb-4">
                <div className="flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-200">
                    AI Response Audit Report
                  </h3>
                </div>
                <button
                  onClick={() => setIsResponseInspectorOpen(false)}
                  className="text-slate-500 hover:text-slate-300 text-xs uppercase"
                >
                  [Close]
                </button>
              </div>

              {/* Status metrics bar */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded border border-[#1C2638] bg-[#0E1320] space-y-1">
                  <span className="text-[9px] text-slate-500 uppercase">Provider / Model</span>
                  <div className="text-xs font-bold text-slate-200 truncate uppercase">
                    {activeResponseMeta.providerId} • Flash
                  </div>
                </div>

                <div className="p-3 rounded border border-[#1C2638] bg-[#0E1320] space-y-1">
                  <span className="text-[9px] text-slate-500 uppercase">Confidence Boundary</span>
                  <div className="text-xs font-bold text-emerald-400">
                    {(activeResponseMeta.confidence * 100).toFixed(2)}% Match
                  </div>
                </div>

                <div className="p-3 rounded border border-[#1C2638] bg-[#0E1320] space-y-1">
                  <span className="text-[9px] text-slate-500 uppercase">Processing Latency</span>
                  <div className="text-xs font-bold text-slate-200">
                    {activeResponseMeta.latencyMs}ms
                  </div>
                </div>

                <div className="p-3 rounded border border-[#1C2638] bg-[#0E1320] space-y-1">
                  <span className="text-[9px] text-slate-500 uppercase">Input / Output Tokens</span>
                  <div className="text-xs font-bold text-slate-200">
                    {activeResponseMeta.inputTokens} / {activeResponseMeta.outputTokens}
                  </div>
                </div>
              </div>

              {/* Estimated operational costs */}
              <div className="p-3 rounded border border-cyan-500/20 bg-cyan-950/10 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs">
                  <DollarSign className="w-4 h-4 text-cyan-400" />
                  <span className="font-semibold text-slate-300">Transaction Budget Cost</span>
                </div>
                <div className="text-xs font-bold text-cyan-400">
                  ${activeResponseMeta.costEstimate.toFixed(6)} USD
                </div>
              </div>

              {/* Mapped dynamic context nodes */}
              <div className="space-y-2 text-xs">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                  MAPPED RUNTIME DATA LINKAGE SUMMARY
                </span>
                
                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between p-2 rounded bg-slate-900 border border-[#1C2638]">
                    <span className="text-slate-400">Knowledge Base Articles:</span>
                    <span className="font-bold text-slate-200">{activeResponseMeta.knowledgeUsed.length} Linked</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-slate-900 border border-[#1C2638]">
                    <span className="text-slate-400">Recall Memory Registers:</span>
                    <span className="font-bold text-slate-200">{activeResponseMeta.memoryUsed.length} Linked</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-slate-900 border border-[#1C2638]">
                    <span className="text-slate-400">Document Center Indexing:</span>
                    <span className="font-bold text-slate-200">{activeResponseMeta.documentsUsed.length} Linked</span>
                  </div>
                </div>
              </div>

              {/* Warnings / Policy Alerts */}
              {activeResponseMeta.warnings.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[10px] text-amber-500 font-bold uppercase flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-500" /> CO-PILOT SYSTEM WARNINGS
                  </div>
                  <div className="space-y-1">
                    {activeResponseMeta.warnings.map((w, i) => (
                      <div key={i} className="p-2 border border-amber-500/20 bg-amber-500/5 rounded text-[10px] text-amber-400">
                        {w}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mapped Citation Sources */}
              {activeResponseMeta.referencedSources.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                    REFERENCED CITATIONS & LEGAL LEDGERS
                  </span>
                  
                  <div className="space-y-2">
                    {activeResponseMeta.referencedSources.map((source, i) => (
                      <div key={i} className="p-3 border border-[#1C2638] bg-slate-900/40 rounded flex flex-col space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="px-1.5 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/20 text-cyan-400 text-[8px] uppercase font-mono font-bold">
                            {source.type}
                          </span>
                          <span className="text-[9px] text-slate-500">ID: {source.id}</span>
                        </div>
                        <div className="text-xs font-bold text-slate-300">{source.title}</div>
                        {source.snippet && <p className="text-[10px] text-slate-500 italic">"{source.snippet}"</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

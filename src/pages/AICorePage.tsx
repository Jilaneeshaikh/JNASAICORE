import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sliders, 
  Menu, 
  X, 
  Sparkles, 
  Search, 
  Terminal, 
  Layers, 
  RotateCcw, 
  ChevronRight, 
  Info,
  Maximize2,
  Minimize2,
  FileText
} from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';
import { useSettings } from '../contexts/SettingsContext';

// Import Custom Framework components
import { Conversation, Message, Attachment, PromptTemplate, ChatSettings } from '../types/chat';
import { INITIAL_CONVERSATIONS, PROMPT_LIBRARY, DEFAULT_SETTINGS } from '../data/chatMockData';
import { ChatSidebar } from '../components/chat/ChatSidebar';
import { ChatMessageList } from '../components/chat/ChatMessageList';
import { ChatPromptEditor } from '../components/chat/ChatPromptEditor';
import { ChatStatusPanel } from '../components/chat/ChatStatusPanel';
import { ChatPromptLibrary } from '../components/chat/ChatPromptLibrary';
import { ChatSettingsDialog } from '../components/chat/ChatSettingsDialog';

import { DSBadge, DSAlert } from '../components/design-system/DSStatus';
import { DSButton } from '../components/design-system/DSButton';

const STORAGE_CHATS_KEY = 'jnas-ai-chats-v4';
const STORAGE_SETTINGS_KEY = 'jnas-ai-settings-v4';

export const AICorePage: React.FC = () => {
  const { triggerToast } = useNotification();
  const { settings: globalSettings } = useSettings();

  // Local Chat and Settings States
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CHATS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse conversations', e);
    }
    return INITIAL_CONVERSATIONS;
  });

  const [chatSettings, setChatSettings] = useState<ChatSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SETTINGS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse settings', e);
    }
    return DEFAULT_SETTINGS;
  });

  const [activeChatId, setActiveChatId] = useState<string | null>(() => {
    const activeChats = INITIAL_CONVERSATIONS.filter(c => c.status === 'active');
    return activeChats.length > 0 ? activeChats[0].id : null;
  });

  // UI state toggles
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isStatusDockOpen, setIsStatusDockOpen] = useState(true);
  const [isPromptLibraryOpen, setIsPromptLibraryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  // Sync to local storage on mutation
  useEffect(() => {
    localStorage.setItem(STORAGE_CHATS_KEY, JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(chatSettings));
  }, [chatSettings]);

  // Active chat finder
  const activeChat = conversations.find(c => c.id === activeChatId) || null;

  // New Chat session setup
  const handleNewChat = (category: any = 'General') => {
    const newChatId = `chat-${Date.now()}`;
    const newChat: Conversation = {
      id: newChatId,
      title: `Unnamed Thread Session #${conversations.length + 1}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      favorite: false,
      pinned: false,
      category: category,
      project: 'JNAS Core Pipeline',
      workspace: globalSettings.activeWorkspace || 'personal',
      tags: ['workspace-dispatch', category.toLowerCase()],
      status: 'active',
      messages: [
        {
          id: `msg-${Date.now()}-1`,
          role: 'system',
          content: 'System Clearance Active. Awaiting dispatch queries...',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'done'
        }
      ]
    };

    setConversations(prev => [newChat, ...prev]);
    setActiveChatId(newChatId);
    triggerToast('success', `Initialized new ${category} conversation channel!`);
  };

  // Conversation Actions
  const handleRenameChat = (id: string, newTitle: string) => {
    setConversations(prev => prev.map(c => 
      c.id === id ? { ...c, title: newTitle, updatedAt: new Date().toISOString() } : c
    ));
    triggerToast('success', 'Thread channel updated successfully.');
  };

  const handleDeleteChat = (id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeChatId === id) {
      const remaining = conversations.filter(c => c.id !== id && c.status === 'active');
      setActiveChatId(remaining.length > 0 ? remaining[0].id : null);
    }
    triggerToast('success', 'Conversation thread permanently purged.');
  };

  const handleArchiveChat = (id: string) => {
    setConversations(prev => prev.map(c => {
      if (c.id === id) {
        const nextStatus = c.status === 'active' ? 'archived' : 'active';
        triggerToast('success', nextStatus === 'archived' ? 'Thread archived.' : 'Thread restored to active.');
        return { ...c, status: nextStatus, updatedAt: new Date().toISOString() };
      }
      return c;
    }));
  };

  const handlePinChat = (id: string) => {
    setConversations(prev => prev.map(c => {
      if (c.id === id) {
        triggerToast('info', c.pinned ? 'Channel unpinned.' : 'Channel pinned to top workspace nodes.');
        return { ...c, pinned: !c.pinned };
      }
      return c;
    }));
  };

  const handleFavoriteChat = (id: string) => {
    setConversations(prev => prev.map(c => {
      if (c.id === id) {
        triggerToast('success', c.favorite ? 'Removed from starred favorites.' : 'Channel starred as favorite!');
        return { ...c, favorite: !c.favorite };
      }
      return c;
    }));
  };

  // Settings handlers
  const handleUpdateSettings = (updated: Partial<ChatSettings>) => {
    setChatSettings(prev => ({ ...prev, ...updated }));
    triggerToast('success', 'Engine constraints synchronized.');
  };

  // Export chats
  const handleExportChats = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(conversations, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", "jnas-ai-thread-backup.json");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      triggerToast('success', 'Successfully compiled and downloaded conversation backup.');
    } catch (e) {
      triggerToast('error', 'Failed to compile conversations backup.');
    }
  };

  // Import chats
  const handleImportChats = (importedData: any) => {
    if (Array.isArray(importedData)) {
      setConversations(importedData);
      if (importedData.length > 0) {
        setActiveChatId(importedData[0].id);
      }
      triggerToast('success', 'Thread restoration completely loaded.');
    } else {
      triggerToast('error', 'Import failed: Schema is not in compatible array format.');
    }
  };

  // Load blueprint prompt template
  const handleSelectTemplate = (template: PromptTemplate) => {
    triggerToast('info', `Injected prompt blueprint: "${template.title}"`);
    setIsPromptLibraryOpen(false);
  };

  // Live Response Engine connecting to Provider Gateway API
  const handleSendMessage = async (userText: string, attachments: Attachment[]) => {
    if (!activeChatId || isStreaming) return;

    const userMsg: Message = {
      id: `msg-usr-${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'done',
      attachments: attachments
    };

    // 1. Append user message to active thread
    setConversations(prev => prev.map(c => {
      if (c.id === activeChatId) {
        return {
          ...c,
          messages: [...c.messages, userMsg],
          updatedAt: new Date().toISOString()
        };
      }
      return c;
    }));

    setIsStreaming(true);

    const loadingMsgId = `msg-load-${Date.now()}`;
    const loadingMsg: Message = {
      id: loadingMsgId,
      role: 'assistant',
      content: 'Routing operational query to Provider Gateway...',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'loading'
    };

    setConversations(prev => prev.map(c => {
      if (c.id === activeChatId) {
        return { ...c, messages: [...c.messages, loadingMsg] };
      }
      return c;
    }));

    // Simple provider display name to registered system ID mapper
    const mapProviderId = (providerName: string): string => {
      const name = providerName.toLowerCase();
      if (name.includes('gemini')) return 'gemini';
      if (name.includes('openai') || name.includes('gpt')) return 'openai';
      if (name.includes('anthropic') || name.includes('claude')) return 'anthropic';
      if (name.includes('ollama') || name.includes('llama')) return 'ollama';
      if (name.includes('deepseek')) return 'ollama'; // Route deepseek reasoning to local ollama structure
      return 'gemini';
    };

    const providerId = mapProviderId(chatSettings.defaultProvider);
    
    // Build context messages from history (excluding system messages)
    const activeMessages = activeChat ? activeChat.messages.filter(m => m.role !== 'system') : [];
    // Convert base64 / attachment fields cleanly
    const payloadMessages = [
      ...activeMessages.map(m => ({
        role: m.role,
        content: m.content,
        attachments: m.attachments?.map(att => ({
          id: att.id,
          name: att.name,
          mimeType: att.type === 'img' ? 'image/png' : 'application/pdf',
          base64Data: att.id // Use id placeholder or mock data if uploaded
        }))
      })),
      {
        role: 'user',
        content: userText,
        attachments: attachments.map(att => ({
          id: att.id,
          name: att.name,
          mimeType: att.type === 'img' ? 'image/png' : 'application/pdf',
          base64Data: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=' // Transparent 1x1 base64 pixel fallback for testing multimodal
        }))
      }
    ];

    try {
      if (chatSettings.streaming) {
        // SSE Token-Streaming Handshake
        const response = await fetch('/api/ai/chat/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            providerId,
            messages: payloadMessages,
            temperature: chatSettings.temperature,
            maxTokens: chatSettings.maxTokens,
            safetyLevel: chatSettings.safetyLevel,
            systemInstruction: 'You are JNAS AI Orchestration Terminal Core. Be highly helpful, precise, technical, and professional.'
          }),
        });

        if (!response.ok) {
          const errorPayload = await response.json().catch(() => ({ error: 'Streaming initiation failed.' }));
          throw new Error(errorPayload.error || `HTTP error ${response.status}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let hasTransitedFromLoading = false;

        if (reader) {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // Keep incomplete line

            for (const line of lines) {
              const cleanLine = line.trim();
              if (cleanLine.startsWith('data: ')) {
                const jsonStr = cleanLine.slice(6).trim();
                if (!jsonStr) continue;

                try {
                  const parsed = JSON.parse(jsonStr);
                  
                  if (parsed.error) {
                    throw new Error(parsed.error);
                  }

                  if (parsed.done) {
                    break;
                  }

                  const tokenText = parsed.text || '';
                  if (tokenText) {
                    if (!hasTransitedFromLoading) {
                      hasTransitedFromLoading = true;
                      // Convert from Loading to active Stream content
                      setConversations(prev => prev.map(c => {
                        if (c.id === activeChatId) {
                          return {
                            ...c,
                            messages: c.messages.map(m => {
                              if (m.id === loadingMsgId) {
                                return { ...m, content: tokenText, status: 'streaming' as const };
                              }
                              return m;
                            })
                          };
                        }
                        return c;
                      }));
                    } else {
                      // Append incremental tokens
                      setConversations(prev => prev.map(c => {
                        if (c.id === activeChatId) {
                          return {
                            ...c,
                            messages: c.messages.map(m => {
                              if (m.id === loadingMsgId) {
                                return { ...m, content: m.content + tokenText };
                              }
                              return m;
                            })
                          };
                        }
                        return c;
                      }));
                    }
                  }
                } catch (jsonErr: any) {
                  console.error('Error parsing SSE json line:', jsonErr);
                }
              }
            }
          }
        }

        // Complete streaming session successfully
        setConversations(prev => prev.map(c => {
          if (c.id === activeChatId) {
            return {
              ...c,
              messages: c.messages.map(m => {
                if (m.id === loadingMsgId) {
                  return { ...m, status: 'done' as const };
                }
                return m;
              })
            };
          }
          return c;
        }));
        triggerToast('success', 'Operational response stream finalized successfully.');

      } else {
        // Non-streaming standard REST handshake
        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            providerId,
            messages: payloadMessages,
            temperature: chatSettings.temperature,
            maxTokens: chatSettings.maxTokens,
            safetyLevel: chatSettings.safetyLevel,
            systemInstruction: 'You are JNAS AI Orchestration Terminal Core. Be highly helpful, precise, technical, and professional.'
          }),
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.error || `HTTP error ${response.status}`);
        }

        const replyContent = data.response?.content || '';

        setConversations(prev => prev.map(c => {
          if (c.id === activeChatId) {
            return {
              ...c,
              messages: c.messages.map(m => {
                if (m.id === loadingMsgId) {
                  return { ...m, content: replyContent, status: 'done' as const };
                }
                return m;
              })
            };
          }
          return c;
        }));
        triggerToast('success', 'Response compiled and synced successfully.');
      }
    } catch (err: any) {
      console.error('Gateway request execution exception:', err);
      
      let errorText = `Failed to process operational query.\n\n[Gateway Error Detail]:\n${err.message || 'Unknown network trace interruption.'}`;
      let statusType: 'warning' | 'error' = 'error';

      if (err.message?.includes('GEMINI_API_KEY') || err.message?.includes('API Key') || err.message?.includes('key')) {
        errorText = `🔒 SECURITY ERROR: Gemini Provider API key credentials are missing or invalid.\n\nVerify that process.env.GEMINI_API_KEY is correctly defined in your Settings > Secrets panel on Google AI Studio to unlock full provider capabilities.`;
        statusType = 'warning';
      }

      setConversations(prev => prev.map(c => {
        if (c.id === activeChatId) {
          return {
            ...c,
            messages: c.messages.map(m => {
              if (m.id === loadingMsgId) {
                return { 
                  ...m, 
                  content: errorText, 
                  status: statusType as any
                };
              }
              return m;
            })
          };
        }
        return c;
      }));
      triggerToast('error', 'Gateway transaction execution failed.');
    } finally {
      setIsStreaming(false);
    }
  };

  const activeWorkspace = globalSettings.activeWorkspace || 'personal';

  return (
    <div className={`space-y-6 ${isFullScreen ? 'fixed inset-0 bg-slate-950 z-50 p-6 overflow-y-auto' : ''}`}>
      
      {/* A. Header / Status Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-5">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-900 px-2 py-0.5 border border-slate-800 text-slate-400">
              JNAS AI Platform
            </span>
            <ChevronRight className="w-3 h-3 text-slate-700" />
            <span className="text-xs text-cyan-400 font-semibold font-mono capitalize">
              {activeWorkspace} Channel Connected
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-100 font-sans mt-1">
            Enterprise AI Chat Framework
          </h1>
          <p className="text-xs text-slate-400 leading-normal max-w-xl">
            Modular multi-provider interface mock. Ready for live API pipeline couplings in Sprint 5.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <DSButton
            variant="outline"
            size="sm"
            onClick={() => setIsPromptLibraryOpen(!isPromptLibraryOpen)}
            className="font-semibold text-xs border-slate-800 hover:border-cyan-500/30"
          >
            Prompt Blueprint Library
          </DSButton>

          <DSButton
            variant="outline"
            size="sm"
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="font-semibold text-xs border-slate-800 hover:border-cyan-500/30 font-mono"
          >
            Engine Parameters
          </DSButton>

          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="p-2 bg-slate-950 hover:bg-slate-900 border border-slate-900 rounded cursor-pointer transition-colors text-slate-400 hover:text-white"
            title={isFullScreen ? 'Exit Full Screen' : 'Enter Full Screen'}
          >
            {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* B. Alerts / Banner info */}
      <DSAlert type="success" title="SPRINT 5 ACTIVE: LIVE PROVIDER GATEWAY SHIELD">
        Gateway is fully operational. Select your active engine parameter constraints, safety levels, and monitor latency metrics from the telemetry panel on the right.
      </DSAlert>

      {/* C. Interactive Modals Overlays (AnimatePresence) */}
      <AnimatePresence>
        {isPromptLibraryOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="z-40"
          >
            <ChatPromptLibrary 
              templates={PROMPT_LIBRARY} 
              onSelectTemplate={(tpl) => {
                handleSelectTemplate(tpl);
              }}
              onClose={() => setIsPromptLibraryOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="z-40"
          >
            <ChatSettingsDialog 
              settings={chatSettings}
              onUpdateSettings={handleUpdateSettings}
              onClose={() => setIsSettingsOpen(false)}
              onExport={handleExportChats}
              onImport={handleImportChats}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* D. Main Workspace Split View Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 border border-slate-900 bg-slate-950 rounded-sm overflow-hidden h-[620px] shadow-2xl relative">
        
        {/* Toggle controls to slide sidebar or telemetry docks back in on Tablet/Mobile */}
        <div className="absolute top-2.5 left-2.5 z-30 flex items-center gap-1.5 lg:hidden">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 bg-slate-950 border border-slate-850 rounded text-slate-400 hover:text-white cursor-pointer shadow-lg"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>

        {/* 1. Chat Sidebar Section (Span 3) */}
        <div className={`lg:col-span-3 h-full border-r border-slate-900 transition-all duration-300 absolute lg:relative inset-y-0 left-0 z-40 w-72 lg:w-auto ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          <div className="h-full relative">
            <ChatSidebar
              conversations={conversations}
              activeChatId={activeChatId}
              onSelectChat={(id) => {
                setActiveChatId(id);
                // Collapse sidebar on Mobile upon selection
                if (window.innerWidth < 1024) setIsSidebarOpen(false);
              }}
              onNewChat={handleNewChat}
              onRenameChat={handleRenameChat}
              onDeleteChat={handleDeleteChat}
              onArchiveChat={handleArchiveChat}
              onPinChat={handlePinChat}
              onFavoriteChat={handleFavoriteChat}
            />
            
            {/* Close control for mobile drawer */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="absolute top-3.5 right-3 lg:hidden p-1 bg-slate-900 hover:bg-slate-800 rounded text-slate-500 hover:text-slate-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 2. Chat Conversation View Pane (Span 6 or 9 depending on right telemetry dock toggle) */}
        <div className={`h-full flex flex-col bg-slate-950 transition-all duration-300 relative ${isStatusDockOpen ? 'lg:col-span-6' : 'lg:col-span-9'}`}>
          
          {/* Active Chat Header Information */}
          <div className="border-b border-slate-900 px-5 py-3 flex items-center justify-between bg-slate-950 shrink-0">
            <div className="min-w-0 flex flex-col pl-8 lg:pl-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-200 text-xs truncate max-w-[200px] sm:max-w-[320px]">
                  {activeChat ? activeChat.title : 'Initiate Active Thread...'}
                </span>
                {activeChat?.pinned && (
                  <DSBadge variant="outline" color="amber">Pinned</DSBadge>
                )}
                {activeChat?.favorite && (
                  <DSBadge variant="outline" color="cyan">Favorite</DSBadge>
                )}
              </div>
              <p className="text-[9px] font-mono text-slate-500 leading-tight mt-0.5 truncate">
                {activeChat ? `Workspace: ${activeChat.workspace} • Category: ${activeChat.category}` : 'No active workspace contexts'}
              </p>
            </div>

            {/* Quick Status Control triggers */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsStatusDockOpen(!isStatusDockOpen)}
                className={`p-1.5 bg-slate-950 border rounded font-mono text-[10px] cursor-pointer transition-colors flex items-center gap-1.5 ${isStatusDockOpen ? 'border-cyan-500/30 text-cyan-400 bg-cyan-950/5' : 'border-slate-900 text-slate-500 hover:text-slate-300'}`}
                title={isStatusDockOpen ? 'Close Telemetry Monitor' : 'Open Telemetry Monitor'}
              >
                <span>Telemetry {isStatusDockOpen ? 'ON' : 'OFF'}</span>
              </button>
            </div>
          </div>

          {/* Messages Scroll Panel */}
          <div className="flex-1 overflow-y-auto bg-slate-950/20">
            {activeChat ? (
              <ChatMessageList messages={activeChat.messages} />
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                <Terminal className="w-8 h-8 text-slate-800 mb-2 animate-pulse" />
                <span className="text-xs font-mono text-slate-500 uppercase tracking-widest font-bold">No Active Thread Selection</span>
                <button
                  onClick={() => handleNewChat()}
                  className="mt-4 px-4 py-2 bg-cyan-950/40 hover:bg-cyan-950/60 border border-cyan-800/25 text-cyan-400 hover:text-white rounded text-xs cursor-pointer font-mono font-semibold"
                >
                  Create Fresh Session
                </button>
              </div>
            )}
          </div>

          {/* Composer Box */}
          <div className="shrink-0">
            <ChatPromptEditor
              onSendMessage={handleSendMessage}
              templates={PROMPT_LIBRARY}
              onSelectTemplate={(tpl) => {
                handleSelectTemplate(tpl);
              }}
              isStreaming={isStreaming}
            />
          </div>
        </div>

        {/* 3. AI Status Panel / Telemetry Monitor (Span 3, collapsible) */}
        {isStatusDockOpen && (
          <div className="lg:col-span-3 h-full border-t lg:border-t-0 lg:border-l border-slate-900 absolute lg:relative inset-y-0 right-0 z-40 w-72 lg:w-auto bg-slate-950 transition-all duration-300">
            <div className="h-full relative">
              <ChatStatusPanel
                settings={chatSettings}
                activeChatTitle={activeChat ? activeChat.title : ''}
                onOpenSettings={() => setIsSettingsOpen(true)}
              />
              {/* Close drawer for mobile overlay */}
              <button
                onClick={() => setIsStatusDockOpen(false)}
                className="absolute top-3.5 right-3 lg:hidden p-1 bg-slate-900 hover:bg-slate-800 rounded text-slate-500 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* E. Technical Specs Overview Footer Card */}
      <div className="bg-slate-950 border border-slate-900 p-5 rounded-sm space-y-4 font-sans text-xs">
        <h4 className="text-slate-200 font-bold uppercase font-mono tracking-wider text-[11px] flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>Sprint 4 Deployment Architecture Blueprint</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-slate-400 leading-relaxed">
          <div className="space-y-1.5">
            <span className="font-semibold text-slate-300 font-mono text-[10px] uppercase">A. Interface Boundaries</span>
            <p className="text-[11px]">Desktop-first bento grid view collapsible into mobile sliding drawers. Telemetry panels dynamically shrink active chat areas for precise viewing density.</p>
          </div>
          <div className="space-y-1.5">
            <span className="font-semibold text-slate-300 font-mono text-[10px] uppercase">B. Input Tokenizer</span>
            <p className="text-[11px]">Character length trackers translate word sequences into 1:4 byte weights, allowing operators to estimate latency before dispatching queries to servers.</p>
          </div>
          <div className="space-y-1.5">
            <span className="font-semibold text-slate-300 font-mono text-[10px] uppercase">C. Custom Markdown Node</span>
            <p className="text-[11px]">Bypasses heavy node package footprints. Standard string splitters index code-blocks and render high-fidelity copy-to-clipboard blocks seamlessly.</p>
          </div>
          <div className="space-y-1.5">
            <span className="font-semibold text-slate-300 font-mono text-[10px] uppercase">D. Mock Simulation Layer</span>
            <p className="text-[11px]">Dispatches trigger natural processing delays, system clearance warnings, and detailed technical logs to mimic full back-end execution cycles.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

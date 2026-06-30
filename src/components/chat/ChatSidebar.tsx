import React, { useState } from 'react';
import { 
  Search, 
  MessageSquarePlus, 
  Pin, 
  Star, 
  Archive, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  ChevronDown, 
  Folder, 
  Layers, 
  Grid, 
  Bookmark,
  ExternalLink
} from 'lucide-react';
import { Conversation, ConversationCategory, ConversationStatus } from '../../types/chat';

export interface ChatSidebarProps {
  conversations: Conversation[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: (category?: ConversationCategory) => void;
  onRenameChat: (id: string, newTitle: string) => void;
  onDeleteChat: (id: string) => void;
  onArchiveChat: (id: string) => void;
  onPinChat: (id: string) => void;
  onFavoriteChat: (id: string) => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  conversations,
  activeChatId,
  onSelectChat,
  onNewChat,
  onRenameChat,
  onDeleteChat,
  onArchiveChat,
  onPinChat,
  onFavoriteChat
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<ConversationStatus>('active');
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const handleStartRename = (e: React.MouseEvent, chat: Conversation) => {
    e.stopPropagation();
    setEditingChatId(chat.id);
    setEditTitle(chat.title);
  };

  const handleSaveRename = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      onRenameChat(id, editTitle.trim());
    }
    setEditingChatId(null);
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChatId(null);
  };

  // Categories list
  const categories: string[] = ['All', 'General', 'Programming', 'Engineering', 'Packaging', 'Business', 'Documentation', 'Personal'];

  // Filter conversations
  const filteredConversations = conversations.filter((chat) => {
    // Status match
    if (chat.status !== statusFilter) return false;

    // Search query match (title, tags, project)
    const matchesSearch = 
      chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (chat.project && chat.project.toLowerCase().includes(searchQuery.toLowerCase()));

    // Category match
    const matchesCategory = categoryFilter === 'All' || chat.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Groups
  const pinnedConversations = filteredConversations.filter(c => c.pinned);
  const favoriteConversations = filteredConversations.filter(c => c.favorite && !c.pinned);
  const recentConversations = filteredConversations.filter(c => !c.pinned && !c.favorite);

  return (
    <div className="flex flex-col h-full bg-slate-950 border-r border-slate-900 select-none">
      {/* 1. Header Toolbar */}
      <div className="p-4 border-b border-slate-900 space-y-3">
        <button
          onClick={() => onNewChat()}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-950/20 hover:bg-cyan-950/30 text-cyan-400 border border-cyan-800/20 hover:border-cyan-500/30 rounded-sm font-semibold text-xs transition-all duration-200 cursor-pointer shadow-lg shadow-cyan-950/5 group focus:outline-none focus:ring-1 focus:ring-cyan-500"
        >
          <MessageSquarePlus className="w-4 h-4 group-hover:scale-105 transition-transform" />
          <span>New AI Thread Session</span>
        </button>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search threads, tags, projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800/80 rounded-sm text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 font-mono text-[11px]"
          />
        </div>
      </div>

      {/* 2. Filters Tray */}
      <div className="p-3 border-b border-slate-900 space-y-2">
        {/* Status toggles */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setStatusFilter('active')}
            className={`flex-1 text-center py-1 text-[9px] font-mono font-semibold uppercase rounded-sm border transition-all cursor-pointer ${statusFilter === 'active' ? 'text-cyan-400 bg-cyan-950/15 border-cyan-500/25' : 'text-slate-500 bg-slate-950 border-transparent hover:text-slate-300'}`}
          >
            Active Channels
          </button>
          <button
            onClick={() => setStatusFilter('archived')}
            className={`flex-1 text-center py-1 text-[9px] font-mono font-semibold uppercase rounded-sm border transition-all cursor-pointer ${statusFilter === 'archived' ? 'text-cyan-400 bg-cyan-950/15 border-cyan-500/25' : 'text-slate-500 bg-slate-950 border-transparent hover:text-slate-300'}`}
          >
            Archive Logs
          </button>
        </div>

        {/* Categories Scroller */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[9px] font-mono text-slate-500">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2 py-0.5 rounded border whitespace-nowrap cursor-pointer transition-colors ${categoryFilter === cat ? 'text-cyan-400 bg-cyan-950/10 border-cyan-900/40 font-bold' : 'bg-slate-900/40 border-slate-900 hover:text-slate-300 hover:border-slate-800'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Conversation Thread Trees */}
      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        {filteredConversations.length === 0 ? (
          <div className="p-8 text-center text-slate-600 text-[11px] font-mono">
            No active conversation logs trace this filter set.
          </div>
        ) : (
          <>
            {/* PINNED SECTION */}
            {pinnedConversations.length > 0 && (
              <div className="space-y-1">
                <div className="px-2.5 py-1 flex items-center gap-1.5 text-[9px] font-mono font-semibold uppercase tracking-widest text-slate-500">
                  <Pin className="w-3 h-3 text-amber-400" />
                  <span>Pinned Streams</span>
                </div>
                {pinnedConversations.map(chat => renderChatItem(chat))}
              </div>
            )}

            {/* FAVORITE SECTION */}
            {favoriteConversations.length > 0 && (
              <div className="space-y-1">
                <div className="px-2.5 py-1 flex items-center gap-1.5 text-[9px] font-mono font-semibold uppercase tracking-widest text-slate-500">
                  <Star className="w-3 h-3 text-cyan-400 fill-cyan-500/10" />
                  <span>Starred Nodes</span>
                </div>
                {favoriteConversations.map(chat => renderChatItem(chat))}
              </div>
            )}

            {/* RECENT SECTION */}
            <div className="space-y-1">
              {(pinnedConversations.length > 0 || favoriteConversations.length > 0) && (
                <div className="px-2.5 py-1 text-[9px] font-mono font-semibold uppercase tracking-widest text-slate-500 block">
                  Recent Threads
                </div>
              )}
              {recentConversations.map(chat => renderChatItem(chat))}
            </div>
          </>
        )}
      </div>

      {/* 4. Footer Workspace Status */}
      <div className="p-3.5 bg-slate-950 border-t border-slate-900/60 font-mono text-[10px] text-slate-500 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-cyan-500" />
          <span className="font-semibold uppercase tracking-tight text-[9px]">{statusFilter === 'active' ? 'ACTIVE CHANNELS' : 'ARCHIVE LOGS'}:</span>
          <span className="text-slate-300 font-bold">{filteredConversations.length}</span>
        </div>
        <span className="text-[9px] bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">Sprint 4 Build</span>
      </div>
    </div>
  );

  // Render a single chat option item
  function renderChatItem(chat: Conversation) {
    const isActive = activeChatId === chat.id;
    const isEditing = editingChatId === chat.id;

    return (
      <div
        key={chat.id}
        onClick={() => !isEditing && onSelectChat(chat.id)}
        className={`group p-2.5 rounded-sm border cursor-pointer relative transition-all duration-150 flex flex-col gap-1.5 ${isActive ? 'bg-cyan-950/15 border-cyan-500/20 text-cyan-400' : 'bg-slate-950/30 border-transparent hover:bg-slate-900/40 text-slate-400 hover:text-slate-200'}`}
      >
        {/* Title / Editor Row */}
        <div className="flex items-start justify-between gap-2.5">
          {isEditing ? (
            <div className="flex-1 flex items-center gap-1 shrink-0 bg-slate-900 border border-slate-800 p-0.5 rounded-sm">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="w-full bg-transparent border-none text-xs text-slate-200 focus:outline-none focus:ring-0 px-1 font-mono text-[11px]"
                autoFocus
              />
              <button
                onClick={(e) => handleSaveRename(e, chat.id)}
                className="p-1 hover:bg-slate-800 text-emerald-400 cursor-pointer rounded"
                title="Save"
              >
                <Check className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => handleCancelRename(e)}
                className="p-1 hover:bg-slate-800 text-rose-400 cursor-pointer rounded"
                title="Cancel"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="flex-1 min-w-0 flex flex-col gap-0.5">
              <span className="text-xs font-semibold truncate leading-tight select-none">
                {chat.title}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-mono text-cyan-500 uppercase bg-cyan-950/10 px-1 py-0.2 rounded border border-cyan-900/20">
                  {chat.category}
                </span>
                {chat.project && (
                  <span className="text-[8px] font-mono text-slate-500 truncate max-w-[100px]">
                    {chat.project}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Quick Item Action Overlays (Visible on hover or active) */}
          {!isEditing && (
            <div className="absolute right-2 top-2 hidden group-hover:flex items-center gap-1 bg-slate-950 border border-slate-800 rounded p-0.5 shadow-xl z-20 transition-all">
              <button
                onClick={(e) => { e.stopPropagation(); onPinChat(chat.id); }}
                className={`p-1 hover:bg-slate-900 rounded cursor-pointer ${chat.pinned ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'}`}
                title={chat.pinned ? 'Unpin' : 'Pin'}
              >
                <Pin className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onFavoriteChat(chat.id); }}
                className={`p-1 hover:bg-slate-900 rounded cursor-pointer ${chat.favorite ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
                title={chat.favorite ? 'Unstar' : 'Star'}
              >
                <Star className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => handleStartRename(e, chat)}
                className="p-1 hover:bg-slate-900 rounded text-slate-500 hover:text-slate-300 cursor-pointer"
                title="Rename"
              >
                <Edit2 className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onArchiveChat(chat.id); }}
                className="p-1 hover:bg-slate-900 rounded text-slate-500 hover:text-slate-300 cursor-pointer"
                title={chat.status === 'active' ? 'Archive' : 'Restore'}
              >
                <Archive className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDeleteChat(chat.id); }}
                className="p-1 hover:bg-slate-900 rounded text-slate-500 hover:text-rose-400 cursor-pointer"
                title="Delete"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Tags Row */}
        {chat.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-0.5">
            {chat.tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-[8px] font-mono text-slate-600 bg-slate-900 px-1.5 py-0.2 rounded border border-slate-900">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }
};

import React, { useState } from 'react';
import { 
  Sparkles, 
  Search, 
  Star, 
  Copy, 
  Check, 
  ExternalLink,
  Tag,
  Flame,
  LayoutGrid
} from 'lucide-react';
import { PromptTemplate, ConversationCategory } from '../../types/chat';

export interface ChatPromptLibraryProps {
  templates: PromptTemplate[];
  onSelectTemplate: (template: PromptTemplate) => void;
  onClose: () => void;
}

export const ChatPromptLibrary: React.FC<ChatPromptLibraryProps> = ({
  templates,
  onSelectTemplate,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = ['All', 'Favorites', 'Programming', 'Engineering', 'Packaging', 'Business', 'Documentation', 'Personal'];

  const filtered = templates.filter((tpl) => {
    const matchesSearch = 
      tpl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.prompt.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === 'All') return matchesSearch;
    if (activeTab === 'Favorites') return matchesSearch && tpl.favorite;
    return matchesSearch && tpl.category === activeTab;
  });

  const handleCopy = (e: React.MouseEvent, text: string, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-slate-950 border border-slate-900 rounded-sm p-4 space-y-4 font-sans text-xs shadow-2xl">
      {/* 1. Top Section */}
      <div className="flex items-center justify-between border-b border-slate-900 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
          <h4 className="text-sm font-bold text-slate-200">Integrated Prompt Blueprint Library</h4>
        </div>
        <button
          onClick={onClose}
          className="text-[10px] font-mono text-slate-500 hover:text-slate-300 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded cursor-pointer"
        >
          Hide Blueprint Library
        </button>
      </div>

      {/* 2. Search & Categories Navigation */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search blueprints, keywords, prompts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-sm text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 font-mono text-[11px]"
          />
        </div>

        {/* Categories Tab Row */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[9px] font-mono">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-2.5 py-1 rounded border whitespace-nowrap cursor-pointer transition-colors ${activeTab === cat ? 'text-cyan-400 bg-cyan-950/10 border-cyan-900/40 font-bold' : 'bg-slate-900/40 border-slate-900 hover:text-slate-300 hover:border-slate-800'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Grid of Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-600 font-mono col-span-2">
            No matching blueprints indexed inside this category context.
          </div>
        ) : (
          filtered.map((tpl) => (
            <div
              key={tpl.id}
              onClick={() => onSelectTemplate(tpl)}
              className="p-3 border border-slate-900 bg-slate-950/50 hover:bg-slate-900/40 hover:border-cyan-500/10 rounded-sm transition-all flex flex-col justify-between gap-3 group cursor-pointer relative"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full shrink-0" />
                    <span className="font-bold text-slate-200 text-xs truncate max-w-[180px]">{tpl.title}</span>
                  </div>
                  {tpl.favorite && <Star className="w-3 h-3 text-amber-400 fill-current" />}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3 select-none">
                  {tpl.prompt}
                </p>
              </div>

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between border-t border-slate-900/50 pt-2 text-[9px] font-mono text-slate-500">
                <span className="uppercase tracking-wider font-semibold text-cyan-500/80">{tpl.category}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleCopy(e, tpl.prompt, tpl.id)}
                    className="p-1 hover:bg-slate-900 text-slate-500 hover:text-slate-300 rounded cursor-pointer flex items-center gap-1"
                    title="Copy full template prompt"
                  >
                    {copiedId === tpl.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                  <span className="text-slate-700">|</span>
                  <button
                    onClick={() => onSelectTemplate(tpl)}
                    className="p-1 hover:bg-slate-900 text-cyan-400 rounded cursor-pointer flex items-center gap-1 font-semibold"
                    title="Load template directly to composer"
                  >
                    <span>Load</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 4. Help Info */}
      <div className="p-2.5 bg-slate-950/40 border border-slate-900 rounded-sm font-mono text-[10px] text-slate-500 flex items-center gap-2">
        <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse shrink-0" />
        <span>Blueprints let you dispatch pre-composed, heavily parameterized engineering, coding, or business layouts in one click.</span>
      </div>
    </div>
  );
};

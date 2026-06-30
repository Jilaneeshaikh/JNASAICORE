import React, { useState, useRef, useEffect } from 'react';
import { 
  Paperclip, 
  Send, 
  Sparkles, 
  FileText, 
  FileCode, 
  Trash2, 
  Clock, 
  AlertCircle,
  HelpCircle,
  Hash,
  ChevronDown,
  Info
} from 'lucide-react';
import { Attachment, AttachmentType, ConversationCategory, PromptTemplate } from '../../types/chat';
import { getAttachmentIcon } from './ChatMessageList';

export interface ChatPromptEditorProps {
  onSendMessage: (content: string, attachments: Attachment[]) => void;
  templates: PromptTemplate[];
  onSelectTemplate: (template: PromptTemplate) => void;
  isStreaming: boolean;
}

export const ChatPromptEditor: React.FC<ChatPromptEditorProps> = ({
  onSendMessage,
  templates,
  onSelectTemplate,
  isStreaming
}) => {
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 240)}px`;
    }
  }, [content]);

  // Compute character and token counts
  const characterCount = content.length;
  // Standard token estimate logic (roughly 4 characters per token as a standard multiplier)
  const tokenEstimate = Math.ceil(characterCount / 3.8);

  const handleSend = () => {
    if (!content.trim() && attachments.length === 0) return;
    if (isStreaming) return;

    onSendMessage(content, attachments);
    setContent('');
    setAttachments([]);
    setIsTemplatesOpen(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Mock Attachment Picker trigger
  const handleSimulateAttachment = (type: AttachmentType) => {
    const mockFiles: Record<AttachmentType, { name: string; size: string }> = {
      pdf: { name: 'JNAS_Core_Platform_SARD.pdf', size: '2.4 MB' },
      doc: { name: 'SSO_Handshake_Contract.docx', size: '48.2 KB' },
      xls: { name: 'Workspace_Usage_Metrics.xlsx', size: '112.5 KB' },
      img: { name: 'kernel_cluster_topology.png', size: '1.8 MB' },
      cad: { name: 'datacenter_blueprint.dwg', size: '14.2 MB' },
      zip: { name: 'db_migration_schemas.zip', size: '420.8 KB' },
      md: { name: 'security_requirements.md', size: '8.4 KB' },
      audio: { name: 'voice_dispatch_instruction.wav', size: '3.1 MB' },
      video: { name: 'onboarding_screen_walkthrough.mp4', size: '24.8 MB' },
    };

    const picked = mockFiles[type];
    const newAtt: Attachment = {
      id: `att-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: picked.name,
      type: type,
      size: picked.size
    };

    setAttachments(prev => [...prev, newAtt]);
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  // Drag and drop simulator events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    // Simulate picking a ZIP or image depending on dropped metadata
    handleSimulateAttachment('zip');
  };

  const insertMarkdown = (tag: 'bold' | 'code' | 'codeblock') => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const selection = content.substring(start, end);

    let replacement = '';
    if (tag === 'bold') replacement = `**${selection || 'text'}**`;
    if (tag === 'code') replacement = `\`${selection || 'code'}\``;
    if (tag === 'codeblock') replacement = `\n\`\`\`typescript\n${selection || '// code block'}\n\`\`\`\n`;

    const nextVal = content.substring(0, start) + replacement + content.substring(end);
    setContent(nextVal);
    
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(start + replacement.length, start + replacement.length);
      }
    }, 50);
  };

  return (
    <div className="bg-slate-950 border-t border-slate-900 p-4 space-y-3 relative select-none">
      
      {/* Drag & Drop Simulation Cover */}
      {isDragOver && (
        <div 
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="absolute inset-0 bg-cyan-950/70 border-2 border-dashed border-cyan-500/50 flex flex-col items-center justify-center gap-2 z-40 backdrop-blur-sm transition-all"
        >
          <Paperclip className="w-8 h-8 text-cyan-400 animate-bounce" />
          <span className="text-sm font-semibold text-cyan-300 font-mono">Drop operational documents here</span>
          <span className="text-[10px] text-slate-400 font-mono">Simulates fast file indexing</span>
        </div>
      )}

      {/* Attachment & Action Shortcuts Tray */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Attachment menu */}
        <div className="flex items-center gap-1">
          <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500 mr-2">Attach mock data:</span>
          <div className="flex flex-wrap gap-1">
            {(['pdf', 'xls', 'zip', 'img', 'cad', 'audio'] as AttachmentType[]).map((type) => (
              <button
                key={type}
                onClick={() => handleSimulateAttachment(type)}
                className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-850 hover:border-cyan-500/25 text-[10px] font-mono text-slate-400 hover:text-slate-200 rounded-sm cursor-pointer transition-colors"
                title={`Attach mock ${type.toUpperCase()} asset`}
              >
                .{type}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Helper Selector */}
        <div className="relative">
          <button
            onClick={() => setIsTemplatesOpen(!isTemplatesOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-[10px] font-mono text-cyan-400 rounded-sm cursor-pointer transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Prompt Blueprint</span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>

          {isTemplatesOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsTemplatesOpen(false)} />
              <div className="absolute right-0 bottom-8 w-72 bg-slate-950 border border-slate-850 rounded-sm shadow-2xl z-50 p-2 space-y-1">
                <div className="px-2 py-1.5 border-b border-slate-900 text-[9px] font-mono text-slate-500 uppercase tracking-widest font-semibold">
                  Templates Catalog
                </div>
                <div className="max-h-48 overflow-y-auto space-y-0.5 pt-1">
                  {templates.map(tpl => (
                    <button
                      key={tpl.id}
                      onClick={() => {
                        setContent(tpl.prompt);
                        onSelectTemplate(tpl);
                        setIsTemplatesOpen(false);
                      }}
                      className="w-full text-left p-1.5 rounded hover:bg-slate-900 text-[10px] font-sans flex items-start justify-between gap-2 text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-slate-200 truncate">{tpl.title}</span>
                        <span className="text-[9px] text-slate-500 font-mono truncate">{tpl.prompt}</span>
                      </div>
                      <span className="text-[8px] font-mono text-cyan-500 uppercase tracking-tight bg-cyan-950/20 px-1 rounded border border-cyan-900/10 self-center shrink-0">
                        {tpl.category}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Uploaded attachments list */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 bg-slate-950/50 border border-slate-900 rounded-sm">
          {attachments.map((att) => (
            <div 
              key={att.id}
              className="flex items-center gap-1.5 px-2 py-1 bg-slate-900 border border-slate-850 rounded text-[10px] text-slate-300"
            >
              {getAttachmentIcon(att.type)}
              <span className="font-semibold max-w-[120px] truncate">{att.name}</span>
              <button
                onClick={() => handleRemoveAttachment(att.id)}
                className="text-slate-500 hover:text-rose-400 ml-1 cursor-pointer"
                title="Remove attachment"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Editor Box */}
      <div 
        onDragOver={handleDragOver}
        className="border border-slate-850 bg-slate-900/40 focus-within:border-cyan-500/40 focus-within:ring-1 focus-within:ring-cyan-500/20 rounded-sm p-2 flex flex-col gap-2 transition-all"
      >
        <textarea
          ref={textareaRef}
          rows={2}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Dispatch prompt queries to AI. Type markdown or paste code..."
          className="w-full bg-transparent border-none text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-0 resize-none font-sans leading-relaxed px-1"
          style={{ minHeight: '44px' }}
        />

        {/* Formatting actions & counts bar */}
        <div className="flex items-center justify-between border-t border-slate-900/60 pt-2 px-1 text-[10px] font-mono text-slate-500">
          {/* Format shortcuts */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => insertMarkdown('bold')}
              className="hover:text-slate-300 font-bold px-1 py-0.5 rounded hover:bg-slate-950 cursor-pointer"
              title="Bold"
            >
              B
            </button>
            <button
              onClick={() => insertMarkdown('code')}
              className="hover:text-slate-300 font-mono px-1 py-0.5 rounded hover:bg-slate-950 cursor-pointer"
              title="Inline Code"
            >
              `code`
            </button>
            <button
              onClick={() => insertMarkdown('codeblock')}
              className="hover:text-slate-300 font-mono px-1 py-0.5 rounded hover:bg-slate-950 cursor-pointer"
              title="Code Block"
            >
              {"{codeblock}"}
            </button>
          </div>

          {/* Counts & Dispatch button */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="flex items-center gap-2 text-slate-500">
              <span>{characterCount} chars</span>
              <span>•</span>
              <span className="text-cyan-500">{tokenEstimate} tokens est.</span>
            </div>

            <button
              onClick={handleSend}
              disabled={isStreaming || (!content.trim() && attachments.length === 0)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white rounded-sm font-semibold transition-all cursor-pointer shadow-lg shadow-cyan-900/10 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <span>{isStreaming ? 'Streaming' : 'Dispatch'}</span>
              <Send className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Editor Legend Tip */}
      <div className="flex items-center gap-1.5 text-[9px] text-slate-600 font-mono justify-between px-1">
        <div className="flex items-center gap-1">
          <Info className="w-3 h-3 text-cyan-500/60" />
          <span>Press <kbd className="bg-slate-900 px-1 rounded border border-slate-800">Enter</kbd> to Dispatch • <kbd className="bg-slate-900 px-1 rounded border border-slate-800">Shift+Enter</kbd> for multi-line</span>
        </div>
        <span className="hidden sm:block">No AI provider integrated. Outputs are simulated client-side.</span>
      </div>
    </div>
  );
};

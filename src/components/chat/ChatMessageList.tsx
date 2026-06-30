import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Cpu, 
  Terminal, 
  ShieldAlert, 
  AlertTriangle, 
  AlertCircle, 
  Loader2, 
  Copy, 
  Check, 
  FileText, 
  FileSpreadsheet, 
  Image, 
  Archive, 
  AudioLines, 
  Video, 
  Paperclip,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Message, Attachment, AttachmentType } from '../../types/chat';

// Helper to get file icons
export const getAttachmentIcon = (type: AttachmentType) => {
  switch (type) {
    case 'pdf':
      return <FileText className="w-4 h-4 text-rose-400" />;
    case 'doc':
      return <FileText className="w-4 h-4 text-blue-400" />;
    case 'xls':
      return <FileSpreadsheet className="w-4 h-4 text-emerald-400" />;
    case 'img':
      return <Image className="w-4 h-4 text-teal-400" />;
    case 'cad':
      return <Terminal className="w-4 h-4 text-violet-400" />;
    case 'zip':
      return <Archive className="w-4 h-4 text-amber-400" />;
    case 'md':
      return <FileText className="w-4 h-4 text-cyan-400" />;
    case 'audio':
      return <AudioLines className="w-4 h-4 text-indigo-400" />;
    case 'video':
      return <Video className="w-4 h-4 text-fuchsia-400" />;
    default:
      return <Paperclip className="w-4 h-4 text-slate-400" />;
  }
};

// Simple custom Markdown + Code block parsing component
export const FormattedContent: React.FC<{ content: string }> = ({ content }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!content) return null;

  // Split content by triple backticks for code blocks
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-3 leading-relaxed text-xs text-slate-300">
      {parts.map((part, index) => {
        if (part.startsWith('```')) {
          // Extract language and code
          const match = part.match(/```(\w*)\n([\s\S]*?)```/);
          const lang = match ? match[1] : '';
          const code = match ? match[2].trim() : part.slice(3, -3).trim();
          const blockId = `code-block-${index}`;

          return (
            <div key={index} className="border border-slate-900 bg-slate-950/80 rounded-sm overflow-hidden font-mono text-[10px] my-2">
              <div className="bg-slate-950 border-b border-slate-900/60 px-3 py-1.5 flex items-center justify-between text-slate-500 uppercase tracking-widest text-[9px] font-bold">
                <span>{lang || 'code'}</span>
                <button
                  onClick={() => handleCopy(code, blockId)}
                  className="flex items-center gap-1 hover:text-cyan-400 transition-colors cursor-pointer"
                  title="Copy code"
                >
                  {copiedId === blockId ? (
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
              </div>
              <pre className="p-3.5 overflow-x-auto text-cyan-400 leading-normal select-text whitespace-pre">
                <code>{code}</code>
              </pre>
            </div>
          );
        }

        // Inline format helpers for bold and generic paragraphs
        const formattedParagraphs = part.split('\n').map((line, lIdx) => {
          if (!line.trim()) return <div key={lIdx} className="h-2" />;

          // Process bullet points
          if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
            const listContent = line.replace(/^[-*]\s+/, '');
            return (
              <ul key={lIdx} className="list-disc pl-5 my-1 text-slate-300">
                <li>{parseInlineStyles(listContent)}</li>
              </ul>
            );
          }

          return <p key={lIdx} className="text-slate-300">{parseInlineStyles(line)}</p>;
        });

        return <div key={index} className="space-y-1.5">{formattedParagraphs}</div>;
      })}
    </div>
  );
};

// Helper to parse `**bold**` and `` `code` `` inline
const parseInlineStyles = (text: string) => {
  // Regex split to extract `**` and `` ` ``
  const boldCodeParts = text.split(/(\*\*.*?\*\*|`.*?`)/g);

  return boldCodeParts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-bold text-slate-100">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={index} className="bg-slate-900 border border-slate-800 text-cyan-400 px-1 py-0.5 rounded font-mono text-[10px]">{part.slice(1, -1)}</code>;
    }
    return part;
  });
};

// Single Reusable Message Bubble Component
export interface ChatMessageBubbleProps {
  message: Message;
  onAction?: (actionId: string, payload?: any) => void;
}

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({ message, onAction }) => {
  const [isToolOutputExpanded, setIsToolOutputExpanded] = useState(false);

  const getBubbleTheme = () => {
    if (message.status === 'warning') {
      return {
        bg: 'bg-amber-950/15 border border-amber-900/40 text-slate-300',
        icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
        badge: 'Warning Node',
        badgeColor: 'text-amber-400 bg-amber-950/30 border-amber-800/20'
      };
    }
    if (message.status === 'error') {
      return {
        bg: 'bg-rose-950/15 border border-rose-900/40 text-slate-300',
        icon: <AlertCircle className="w-3.5 h-3.5 text-rose-400" />,
        badge: 'Critical Fault',
        badgeColor: 'text-rose-400 bg-rose-950/30 border-rose-800/20'
      };
    }

    switch (message.role) {
      case 'system':
        return {
          bg: 'bg-slate-900/40 border border-slate-900 text-slate-400 font-mono text-[11px]',
          icon: <ShieldAlert className="w-3.5 h-3.5 text-cyan-500" />,
          badge: 'Security Kernel',
          badgeColor: 'text-cyan-500 bg-cyan-950/20 border-cyan-900/20'
        };
      case 'tool':
        return {
          bg: 'bg-slate-950/90 border border-slate-900 text-cyan-400 font-mono text-[11px]',
          icon: <Terminal className="w-3.5 h-3.5 text-emerald-400" />,
          badge: `Dispatch: ${message.toolName || 'tool'}`,
          badgeColor: 'text-emerald-400 bg-emerald-950/20 border-emerald-900/20'
        };
      case 'user':
        return {
          bg: 'bg-cyan-950/10 border border-cyan-950/40 text-slate-200',
          icon: <User className="w-3.5 h-3.5 text-cyan-400" />,
          badge: 'Operator dispatch',
          badgeColor: 'text-cyan-400 bg-cyan-950/30 border-cyan-800/25'
        };
      case 'assistant':
      default:
        return {
          bg: 'bg-slate-900/10 border border-slate-900/40 text-slate-300',
          icon: <Cpu className="w-3.5 h-3.5 text-indigo-400" />,
          badge: 'Cognitive Engine',
          badgeColor: 'text-indigo-400 bg-indigo-950/30 border-indigo-900/25'
        };
    }
  };

  const theme = getBubbleTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-sm flex flex-col md:flex-row gap-4 items-start ${theme.bg}`}
    >
      {/* Icon Badge Indicator */}
      <div className="flex items-center gap-2.5 shrink-0 w-full md:w-36">
        <div className="p-1.5 bg-slate-950 border border-slate-900 rounded flex items-center justify-center shadow-lg">
          {theme.icon}
        </div>
        <div className="flex flex-col">
          <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${theme.badgeColor}`}>
            {theme.badge}
          </span>
          <span className="text-[10px] text-slate-500 font-mono mt-1 hidden md:block">{message.timestamp}</span>
        </div>
      </div>

      {/* Message Core Body */}
      <div className="flex-1 min-w-0 space-y-3 select-text">
        {message.role === 'tool' ? (
          <div className="space-y-2">
            <button
              onClick={() => setIsToolOutputExpanded(!isToolOutputExpanded)}
              className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 hover:text-emerald-400 cursor-pointer"
            >
              <span>{isToolOutputExpanded ? 'Collapse Process Logs' : 'Expand Process Logs'}</span>
              {isToolOutputExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            {isToolOutputExpanded && (
              <pre className="p-3 bg-slate-950/90 border border-slate-900 text-emerald-400 rounded-sm text-[10px] overflow-x-auto leading-relaxed select-text whitespace-pre">
                <code>{message.content}</code>
              </pre>
            )}
          </div>
        ) : (
          <FormattedContent content={message.content} />
        )}

        {/* Loading / Streaming State Indicators */}
        {message.status === 'loading' && (
          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono py-1">
            <Loader2 className="w-3.5 h-3.5 text-cyan-500 animate-spin" />
            <span>Awaiting thread execution clearance...</span>
          </div>
        )}

        {message.status === 'streaming' && (
          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono py-1">
            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" />
            <span>Streaming pipeline response...</span>
          </div>
        )}

        {/* Display File Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="border-t border-slate-900/60 pt-3 mt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg">
            {message.attachments.map((att) => (
              <div 
                key={att.id}
                className="flex items-center justify-between p-2.5 bg-slate-950 border border-slate-900 rounded-sm font-sans text-[11px] hover:border-cyan-500/10 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="p-1 bg-slate-900 border border-slate-800 rounded-sm shrink-0">
                    {getAttachmentIcon(att.type)}
                  </div>
                  <div className="min-w-0 flex flex-col leading-tight">
                    <span className="font-semibold text-slate-300 truncate max-w-[160px]">{att.name}</span>
                    <span className="text-[9px] text-slate-500 font-mono mt-0.5 uppercase">{att.type} • {att.size}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Reusable Message List Scroll View
export interface ChatMessageListProps {
  messages: Message[];
}

export const ChatMessageList: React.FC<ChatMessageListProps> = ({ messages }) => {
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center h-full">
        <Cpu className="w-8 h-8 text-slate-700 mb-2 animate-pulse" />
        <span className="text-xs font-mono text-slate-500 uppercase tracking-widest font-bold">No Active Thread Stream</span>
        <p className="text-[11px] text-slate-600 max-w-sm leading-normal mt-1.5 font-sans">
          Select or initialize a conversation thread from the sidebar list parameters to stream operational dispatches.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-5 select-none">
      {messages.map((msg) => (
        <ChatMessageBubble key={msg.id} message={msg} />
      ))}
    </div>
  );
};

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Command, Search, Sparkles, CheckCircle2, AlertTriangle, Info, ShieldAlert } from 'lucide-react';
import { DSButton } from './DSButton';

// Modal Dialog
export interface DSModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  footerActions?: React.ReactNode;
}

export const DSModal: React.FC<DSModalProps> = ({
  isOpen,
  onClose,
  title,
  size = 'md',
  children,
  footerActions,
}) => {
  // ESC key binder
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className={`w-full ${sizeClasses[size]} bg-slate-950 border border-slate-800 rounded-sm shadow-2xl relative z-10 flex flex-col max-h-[90vh]`}
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-900 flex items-center justify-between">
              <h3 className="text-base font-semibold tracking-tight text-slate-100 font-sans">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-200 hover:bg-slate-900 p-1 rounded-sm transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto font-sans text-sm text-slate-300 leading-relaxed">
              {children}
            </div>

            {/* Footer */}
            {footerActions && (
              <div className="px-5 py-3.5 border-t border-slate-900 bg-slate-950/50 flex items-center justify-end gap-2.5">
                {footerActions}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// Slide-Over Drawer
export interface DSDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  placement?: 'left' | 'right';
  children: React.ReactNode;
}

export const DSDrawer: React.FC<DSDrawerProps> = ({
  isOpen,
  onClose,
  title,
  placement = 'right',
  children,
}) => {
  const isRight = placement === 'right';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
          />

          {/* Drawer Canvas */}
          <div className={`absolute inset-y-0 ${isRight ? 'right-0' : 'left-0'} max-w-full flex`}>
            <motion.div
              initial={{ x: isRight ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: isRight ? '100%' : '-100%' }}
              transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
              className="w-screen max-w-md bg-slate-950 border-l border-slate-900 flex flex-col shadow-2xl relative z-10 h-full"
            >
              {/* Header */}
              <div className="px-5 py-4.5 border-b border-slate-900/80 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-widest font-mono">
                  {title}
                </h3>
                <button
                  onClick={onClose}
                  className="text-slate-400 hover:text-slate-100 hover:bg-slate-900 p-1 rounded-sm cursor-pointer transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 font-sans">
                {children}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

// Command Palette Mockup
export interface DSCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onCommandSelect: (cmd: string) => void;
}

export const DSCommandPalette: React.FC<DSCommandPaletteProps> = ({
  isOpen,
  onClose,
  searchQuery,
  setSearchQuery,
  onCommandSelect,
}) => {
  const commands = [
    { prefix: '/', action: 'ask-ai', desc: 'Query the global AI Co-Pilot', icon: Sparkles, cat: 'AI Operations' },
    { prefix: '/', action: 'create-task', desc: 'Create a new project milestone task', icon: CheckCircle2, cat: 'Workflows' },
    { prefix: '/', action: 'switch-workspace', desc: 'Switch active workspace state', icon: Command, cat: 'Navigation' },
    { prefix: '/', action: 'system-status', desc: 'Inspect environment resource bounds', icon: Info, cat: 'Administration' },
  ];

  const filtered = commands.filter(
    (c) =>
      c.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[10vh]">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
          />

          {/* Palette Box */}
          <motion.div
            initial={{ opacity: 0, y: -15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.98 }}
            className="w-full max-w-xl bg-slate-950 border border-slate-800 rounded-sm shadow-2xl relative z-10 overflow-hidden"
          >
            {/* Search Input Box */}
            <div className="flex items-center px-4 py-3.5 border-b border-slate-900 gap-3">
              <Search className="w-5 h-5 text-slate-500 shrink-0" />
              <input
                autoFocus
                type="text"
                placeholder="Type a command or query..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-sm focus:outline-none"
              />
              <span className="text-[10px] bg-slate-900 text-slate-400 border border-slate-800 px-1.5 py-0.5 rounded font-mono select-none">
                ESC
              </span>
            </div>

            {/* List Results */}
            <div className="max-h-[350px] overflow-y-auto p-2 space-y-1">
              {filtered.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs font-sans">
                  No commands matching "{searchQuery}" found.
                </div>
              ) : (
                filtered.map((cmd) => {
                  const Icon = cmd.icon;
                  return (
                    <div
                      key={cmd.action}
                      onClick={() => onCommandSelect(cmd.action)}
                      className="flex items-center justify-between p-2.5 rounded-sm hover:bg-slate-900/60 cursor-pointer transition-colors group select-none"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-slate-900 border border-slate-800 rounded-sm text-slate-400 group-hover:text-cyan-400 group-hover:border-cyan-500/30 transition-colors">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-mono text-slate-200 group-hover:text-cyan-400">
                            {cmd.prefix}{cmd.action}
                          </span>
                          <span className="text-[10px] text-slate-400 mt-0.5">
                            {cmd.desc}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500 bg-slate-900/40 px-2 py-0.5 border border-slate-900 rounded font-mono">
                        {cmd.cat}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer tips */}
            <div className="px-4 py-2 bg-slate-900/40 border-t border-slate-900 text-[10px] text-slate-500 font-mono flex items-center justify-between">
              <span>Use ↑ ↓ arrow keys to select, Enter to run</span>
              <span>JNAS Command Engine v1.0.0</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// Toast notification item model
export interface DSToastProps {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

export const DSToastItem: React.FC<DSToastProps> = ({
  id,
  type,
  message,
  onClose,
}) => {
  const iconConfig = {
    success: { icon: CheckCircle2, class: 'text-emerald-400 border-emerald-950 bg-emerald-950/20' },
    warning: { icon: AlertTriangle, class: 'text-amber-400 border-amber-950 bg-amber-950/20' },
    error: { icon: ShieldAlert, class: 'text-rose-400 border-rose-950 bg-rose-950/20' },
    info: { icon: Info, class: 'text-cyan-400 border-cyan-950 bg-cyan-950/20' },
  };

  const current = iconConfig[type];
  const Icon = current.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
      className={`p-3.5 border rounded-sm flex items-start gap-3 shadow-xl max-w-sm w-full ${current.class} border-slate-800`}
    >
      <Icon className="w-5 h-5 shrink-0" />
      <div className="flex-1 text-xs font-sans text-slate-100 leading-relaxed pr-1">
        {message}
      </div>
      <button
        onClick={() => onClose(id)}
        className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
};

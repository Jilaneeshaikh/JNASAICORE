import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, AlertTriangle, Info, ShieldAlert, Ghost, RefreshCw, AlertCircle } from 'lucide-react';
import { DSButton } from './DSButton';

// 1. Alerts & Callouts
export interface DSAlertProps {
  type: 'success' | 'warning' | 'error' | 'info';
  title?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

export const DSAlert: React.FC<DSAlertProps> = ({ type, title, children, action }) => {
  const configs = {
    success: { icon: CheckCircle2, border: 'border-emerald-500/20 bg-emerald-950/10 text-emerald-300' },
    warning: { icon: AlertTriangle, border: 'border-amber-500/20 bg-amber-950/10 text-amber-300' },
    error: { icon: ShieldAlert, border: 'border-rose-500/20 bg-rose-950/10 text-rose-300' },
    info: { icon: Info, border: 'border-cyan-500/20 bg-cyan-950/10 text-cyan-300' },
  };

  const current = configs[type];
  const Icon = current.icon;

  return (
    <div className={`p-4 border rounded-sm flex gap-3.5 items-start ${current.border} font-sans text-sm leading-relaxed`}>
      <Icon className="w-5 h-5 shrink-0 mt-0.5" />
      <div className="flex-1">
        {title && <h4 className="font-semibold text-slate-100 mb-1">{title}</h4>}
        <div className="text-slate-300 text-xs">{children}</div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};

// 2. Badges & Tags
export interface DSBadgeProps {
  children: React.ReactNode;
  variant?: 'solid' | 'outline' | 'ghost';
  color?: 'cyan' | 'emerald' | 'amber' | 'rose' | 'slate';
}

export const DSBadge: React.FC<DSBadgeProps> = ({ children, variant = 'solid', color = 'slate' }) => {
  const stylesMap: Record<string, Record<string, string>> = {
    solid: {
      cyan: 'bg-cyan-500 text-slate-950 border-cyan-500',
      emerald: 'bg-emerald-500 text-slate-950 border-emerald-500',
      amber: 'bg-amber-500 text-slate-950 border-amber-500',
      rose: 'bg-rose-500 text-slate-950 border-rose-500',
      slate: 'bg-slate-800 text-slate-200 border-slate-800',
    },
    outline: {
      cyan: 'border-cyan-500/30 text-cyan-400 bg-cyan-950/10',
      emerald: 'border-emerald-500/30 text-emerald-400 bg-emerald-950/10',
      amber: 'border-amber-500/30 text-amber-400 bg-amber-950/10',
      rose: 'border-rose-500/30 text-rose-400 bg-rose-950/10',
      slate: 'border-slate-800 text-slate-400 bg-slate-950/40',
    },
    ghost: {
      cyan: 'border-transparent text-cyan-400 bg-transparent',
      emerald: 'border-transparent text-emerald-400 bg-transparent',
      amber: 'border-transparent text-amber-400 bg-transparent',
      rose: 'border-transparent text-rose-400 bg-transparent',
      slate: 'border-transparent text-slate-400 bg-transparent',
    },
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 border rounded-xs text-[10px] font-semibold font-mono uppercase tracking-wider ${stylesMap[variant][color]}`}>
      {children}
    </span>
  );
};

// 3. Skeletons
export const DSSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-900 rounded-xs border border-slate-900 ${className}`} />
);

export const DSSkeletonCard: React.FC = () => (
  <div className="p-5 border border-slate-800 bg-slate-950 rounded-sm flex flex-col gap-4">
    <div className="flex justify-between items-center">
      <DSSkeleton className="w-1/3 h-5" />
      <DSSkeleton className="w-12 h-4" />
    </div>
    <div className="space-y-2">
      <DSSkeleton className="w-full h-3.5" />
      <DSSkeleton className="w-5/6 h-3.5" />
      <DSSkeleton className="w-2/3 h-3.5" />
    </div>
    <div className="flex justify-between items-center pt-3 border-t border-slate-900">
      <DSSkeleton className="w-20 h-8" />
      <DSSkeleton className="w-10 h-4" />
    </div>
  </div>
);

// 4. Empty State Panel
export interface DSEmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const DSEmptyState: React.FC<DSEmptyStateProps> = ({ title, description, action }) => {
  return (
    <div className="border border-slate-800 border-dashed rounded-sm bg-slate-950/40 p-10 flex flex-col items-center justify-center text-center font-sans max-w-lg mx-auto">
      <div className="p-3 bg-slate-900 border border-slate-800 text-slate-500 rounded-sm mb-4">
        <Ghost className="w-8 h-8" />
      </div>
      <h3 className="text-base font-semibold tracking-tight text-slate-200 mb-1">
        {title}
      </h3>
      <p className="text-xs text-slate-400 leading-relaxed mb-6 max-w-sm">
        {description}
      </p>
      {action && <div className="flex items-center justify-center">{action}</div>}
    </div>
  );
};

// 5. Crash Fallback State
export interface DSCrashFallbackProps {
  errorMsg?: string;
  onReset: () => void;
}

export const DSCrashFallback: React.FC<DSCrashFallbackProps> = ({
  errorMsg = 'CRITICAL_HEAP_CORRUPTION: Security boundary exception on token thread.',
  onReset,
}) => {
  return (
    <div className="border border-rose-900 rounded-sm bg-rose-950/5 p-6 font-sans flex flex-col gap-4 text-xs">
      <div className="flex items-center gap-3">
        <div className="p-1.5 bg-rose-950 border border-rose-900 text-rose-400 rounded-sm">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <h4 className="text-sm font-semibold text-rose-200">System Thread Core Exception</h4>
          <p className="text-[10px] text-slate-500 font-mono mt-0.5">CONTAINER_RUN_ID: c7-84312e</p>
        </div>
      </div>
      <div className="bg-slate-950 border border-slate-900 p-3.5 rounded-sm font-mono text-[10px] text-rose-400/90 leading-normal break-all">
        {errorMsg}
      </div>
      <div className="flex items-center justify-between border-t border-slate-900/40 pt-3">
        <span className="text-[10px] text-slate-500 font-mono">CODE: 0xDEADBEEF</span>
        <DSButton
          size="sm"
          variant="danger"
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          onClick={onReset}
        >
          Reboot Active Kernels
        </DSButton>
      </div>
    </div>
  );
};

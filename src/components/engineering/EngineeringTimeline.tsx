import React, { useState } from 'react';
import {
  Clock,
  ShieldAlert,
  FileCheck,
  RefreshCw,
  FolderPlus,
  Trash2,
  Lock,
  ArrowRight,
  Database
} from 'lucide-react';
import { EngineeringRegistry } from '../../backend/engineering/registry';
import { DSBadge } from '../design-system/DSStatus';

interface EngineeringTimelineProps {
  onClear: () => void;
}

export const EngineeringTimeline: React.FC<EngineeringTimelineProps> = ({ onClear }) => {
  const registry = EngineeringRegistry.getInstance();
  const logs = registry.getAuditLogs();
  const [filterType, setFilterType] = useState<string>('All');

  const filteredLogs = logs.filter((log) => {
    if (filterType === 'All') return true;
    return log.targetType === filterType;
  });

  const getLogIcon = (action: string) => {
    const act = action.toLowerCase();
    if (act.includes('created') || act.includes('draft')) return <FolderPlus className="w-3.5 h-3.5 text-emerald-400" />;
    if (act.includes('deleted') || act.includes('purge')) return <Trash2 className="w-3.5 h-3.5 text-rose-400" />;
    if (act.includes('approved') || act.includes('quality') || act.includes('released')) return <FileCheck className="w-3.5 h-3.5 text-cyan-400" />;
    if (act.includes('security') || act.includes('role')) return <Lock className="w-3.5 h-3.5 text-amber-400" />;
    return <RefreshCw className="w-3.5 h-3.5 text-slate-400" />;
  };

  return (
    <div className="bg-[#0C111E] border border-[#152033] rounded-lg p-4 space-y-4 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#141F33] pb-3">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-cyan-400" />
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
              SECURE CAD AUDIT TIMELINE
            </h3>
            <p className="text-[10px] text-slate-400 font-sans mt-0.5">
              Automated ledger tracking of drawing lifecycle changes, quality sign-offs, and security transitions.
            </p>
          </div>
        </div>

        {/* Facet toggle & Clear */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[10px] font-mono">
            <span className="text-slate-500">Filter Target:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-[#070B14] border border-[#1A263E] text-slate-300 rounded px-1.5 py-0.5"
            >
              <option value="All">All Targets</option>
              <option value="Drawing">Drawing</option>
              <option value="Project">Project</option>
              <option value="Security">Security</option>
            </select>
          </div>

          <button
            onClick={() => {
              if (confirm('Clear entire timeline audit trail? This operation will preserve compliance standards.')) {
                onClear();
              }
            }}
            className="text-[9px] text-rose-400 hover:text-rose-300 font-mono bg-rose-950/20 border border-rose-900/40 px-2 py-0.5 rounded"
          >
            Purge Trail
          </button>
        </div>
      </div>

      {filteredLogs.length === 0 ? (
        <div className="p-8 border border-dashed border-slate-800 bg-[#080C14] rounded-md text-center text-slate-500 font-mono text-[11px]">
          No recorded events in compliance buffer for targeted selection criteria.
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className="p-3 bg-[#080B13] border border-[#142036] rounded-md flex items-start gap-3 hover:border-[#1A2946] transition-all font-mono"
            >
              <div className="p-1.5 bg-[#0C1221] border border-[#1C2C46] rounded shrink-0">
                {getLogIcon(log.action)}
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-200">{log.action}</span>
                    <span className="text-[9px] text-slate-500">[{log.targetType}]</span>
                  </div>
                  <span className="text-[9px] text-slate-500 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-600" />
                    <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 font-sans leading-relaxed break-words">
                  {log.details}
                </p>

                <div className="flex items-center gap-2 text-[9px] text-slate-500 pt-1">
                  <span className="text-cyan-500">Target ID:</span>
                  <span className="text-slate-400 select-all font-semibold">{log.targetId}</span>
                  <span className="text-slate-600">|</span>
                  <span className="text-slate-400 font-bold uppercase">{log.userId}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

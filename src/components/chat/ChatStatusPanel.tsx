import React from 'react';
import { 
  Cpu, 
  Database, 
  Brain, 
  Shuffle, 
  Clock, 
  Compass, 
  Gauge, 
  Server, 
  ShieldCheck, 
  Coins,
  ChevronRight,
  RefreshCw,
  Sliders
} from 'lucide-react';
import { DSCard, DSCardHeader, DSCardContent, DSCardTitle, DSCardSubtitle } from '../design-system/DSCard';
import { DSBadge } from '../design-system/DSStatus';
import { ChatSettings } from '../../types/chat';

export interface ChatStatusPanelProps {
  settings: ChatSettings;
  activeChatTitle: string;
  onOpenSettings: () => void;
}

export const ChatStatusPanel: React.FC<ChatStatusPanelProps> = ({
  settings,
  activeChatTitle,
  onOpenSettings
}) => {
  const [logs, setLogs] = React.useState<any[]>([]);

  React.useEffect(() => {
    let active = true;
    const fetchLogs = async () => {
      try {
        const res = await fetch('/api/gateway/logs');
        const data = await res.json();
        if (data.success && active) {
          setLogs(data.logs || []);
        }
      } catch (err) {
        console.error('Error fetching telemetry logs:', err);
      }
    };

    fetchLogs();
    const timer = setInterval(fetchLogs, 2500);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  const latestLog = logs.find(l => l.status === 'success');
  const latestLatency = latestLog ? `${latestLog.latencyMs} ms` : '12 ms';
  const latestModel = latestLog ? latestLog.modelName : 'Idle Core';

  return (
    <div className="h-full bg-slate-950 border-l border-slate-900 flex flex-col justify-between font-sans text-xs select-none p-4 space-y-4">
      {/* 1. Header Segment */}
      <div className="space-y-1.5 border-b border-slate-900 pb-4">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-mono font-bold text-cyan-400 uppercase tracking-widest bg-cyan-950/20 px-2 py-0.5 rounded border border-cyan-800/10">
            Node Status Board
          </span>
          <DSBadge variant="outline" color="emerald">SPRINT_5</DSBadge>
        </div>
        <h3 className="text-sm font-bold text-slate-200 truncate mt-1">
          {activeChatTitle || 'Terminal Pipeline'}
        </h3>
        <p className="text-[10px] text-slate-500 font-mono leading-tight truncate">
          Active Thread ID: jnas-node-{activeChatTitle ? '2418' : 'void'}
        </p>
      </div>

      {/* 2. Core Operational Metrics Grid */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        
        {/* Metric Module: Provider */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px] text-slate-500 uppercase font-mono tracking-wider font-semibold">
            <span>Model Provider</span>
            <span className="text-cyan-500">Configured</span>
          </div>
          <div className="p-3 border border-slate-900 bg-slate-950/60 rounded-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <Server className="w-4 h-4 text-cyan-400 shrink-0" />
              <div className="min-w-0 flex flex-col">
                <span className="font-bold text-slate-200 truncate">{settings.defaultProvider}</span>
                <span className="text-[9px] font-mono text-slate-500 mt-0.5">Temp: {settings.temperature} • {settings.responseStyle}</span>
              </div>
            </div>
            <button
              onClick={onOpenSettings}
              className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded border border-slate-850 cursor-pointer"
              title="Edit model configurations"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Metric Module: Context Weight */}
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] text-slate-500 uppercase font-mono tracking-wider font-semibold">
            <span>Context Window Load</span>
            <span className="text-cyan-400 font-mono">1.4% Capacity</span>
          </div>
          <div className="p-3 border border-slate-900 bg-slate-950/60 rounded-sm space-y-2.5">
            <div className="h-2 bg-slate-900 border border-slate-850 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full" style={{ width: '1.4%' }} />
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400">
              <div className="flex justify-between border-r border-slate-900 pr-2">
                <span>Active load:</span>
                <span className="text-slate-200 font-bold">14,240 tkn</span>
              </div>
              <div className="flex justify-between pl-1">
                <span>Max boundary:</span>
                <span className="text-slate-500 font-bold">1,000,000</span>
              </div>
            </div>
          </div>
        </div>

        {/* Placeholder Status List */}
        <div className="space-y-2 border-t border-slate-900 pt-3.5">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold block mb-2">
            AI Platform Integration Keys
          </span>
          
          <div className="divide-y divide-slate-900/60 text-[11px] leading-relaxed">
            {/* Memory Engine */}
            <div className="py-2 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-400">
                <Brain className="w-3.5 h-3.5 text-slate-600" />
                <span>Memory Engine</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-600 uppercase bg-slate-950 border border-slate-900/60 px-1.5 rounded">
                Pending Phase 2
              </span>
            </div>

            {/* Knowledge Engine */}
            <div className="py-2 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-400">
                <Database className="w-3.5 h-3.5 text-slate-600" />
                <span>Knowledge Base (RAG)</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-600 uppercase bg-slate-950 border border-slate-900/60 px-1.5 rounded">
                Pending Phase 2
              </span>
            </div>

            {/* Workflow Engine */}
            <div className="py-2 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-400">
                <Shuffle className="w-3.5 h-3.5 text-slate-600" />
                <span>Workflow Pipelines</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-600 uppercase bg-slate-950 border border-slate-900/60 px-1.5 rounded">
                Pending Phase 3
              </span>
            </div>

            {/* Agent Status */}
            <div className="py-2 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-400">
                <Cpu className="w-3.5 h-3.5 text-emerald-500/70" />
                <span>Background Agent Node</span>
              </div>
              <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase bg-emerald-950/20 border border-emerald-900/20 px-1.5 rounded">
                Idle Stable
              </span>
            </div>
          </div>
        </div>

        {/* Performance Metrics Block */}
        <div className="space-y-2 border-t border-slate-900 pt-3.5">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold block mb-2">
            Execution Performance Trace
          </span>

          <div className="grid grid-cols-2 gap-3 font-mono text-[10px]">
            <div className="p-2.5 border border-slate-900 bg-slate-950/40 rounded-sm flex flex-col gap-0.5">
              <span className="text-slate-500 text-[9px] uppercase">Latency</span>
              <span className="text-cyan-400 font-bold truncate">{latestLatency}</span>
            </div>
            <div className="p-2.5 border border-slate-900 bg-slate-950/40 rounded-sm flex flex-col gap-0.5">
              <span className="text-slate-500 text-[9px] uppercase">Active Node</span>
              <span className="text-cyan-400 font-bold truncate">{latestModel}</span>
            </div>
          </div>

          {logs.length > 0 && (
            <div className="mt-3.5 border border-slate-900/60 bg-slate-950 rounded-sm overflow-hidden">
              <div className="bg-slate-900/40 px-2 py-1 flex items-center justify-between border-b border-slate-900">
                <span className="text-[9px] font-mono uppercase text-slate-400 font-bold">Trace Stream</span>
                <span className="text-[8px] font-mono text-cyan-400/80 animate-pulse">● Live</span>
              </div>
              <div className="p-1.5 space-y-1 font-mono text-[9px] max-h-24 overflow-y-auto">
                {logs.slice(0, 4).map((log, idx) => (
                  <div key={log.id || idx} className="flex justify-between items-center text-slate-400 leading-normal border-b border-slate-950 pb-1 last:border-b-0">
                    <span className="truncate max-w-[80px] text-[8px] uppercase font-bold text-slate-300">{log.providerId}</span>
                    <span className="text-slate-500 text-[8px]">{log.latencyMs}ms</span>
                    <span className={`text-[8px] font-bold ${log.status === 'success' ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {log.status === 'success' ? 'SUCCESS' : 'ERR'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Footer Segment */}
      <div className="border-t border-slate-900 pt-4 text-[9px] text-slate-500 font-mono leading-relaxed space-y-1 shrink-0">
        <div className="flex justify-between items-center text-slate-400">
          <span>Security Level:</span>
          <span className="text-cyan-400 font-bold uppercase">Clearance-L3</span>
        </div>
        <p>Telemetry syncs automatically upon active prompt dispatches.</p>
      </div>
    </div>
  );
};

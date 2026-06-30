import React from 'react';
import {
  Database,
  Link,
  Shield,
  Tag,
  CircleDot,
  Server,
  Activity,
  Boxes,
  Layers,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { registry } from '../../backend/knowledge/registry';
import { KnowledgeSource } from '../../backend/knowledge/types';
import { DSBadge } from '../design-system/DSStatus';

export const KnowledgeRegistryPanel: React.FC = () => {
  const sources = registry.getSources();
  const objects = registry.getObjects();
  const totalRelationships = registry.getObjects().reduce((acc, obj) => {
    return acc + registry.getRelationshipsForObject(obj.id).length;
  }, 0) / 2; // dividing by 2 as relationships are bidirectional in our query

  // Calculate unique categories
  const categoriesCount = new Set(objects.map((obj) => obj.category)).size;

  return (
    <div className="space-y-6">
      {/* 1. Core Telemetry Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-[10px]">
        <div className="p-4 border border-slate-900 bg-slate-950/40 rounded-sm flex flex-col gap-1.5 hover:border-slate-800 transition-colors">
          <span className="text-slate-500 text-[9px] uppercase tracking-wider font-semibold flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-cyan-400" /> Active Registrars
          </span>
          <span className="text-lg font-bold text-slate-100">{sources.length} Channels</span>
          <span className="text-[8px] text-slate-500">Live ingestion pipelines</span>
        </div>

        <div className="p-4 border border-slate-900 bg-slate-950/40 rounded-sm flex flex-col gap-1.5 hover:border-slate-800 transition-colors">
          <span className="text-slate-500 text-[9px] uppercase tracking-wider font-semibold flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-emerald-400" /> Cataloged Documents
          </span>
          <span className="text-lg font-bold text-slate-100">{objects.length} Objects</span>
          <span className="text-[8px] text-slate-500">Structured knowledge nodes</span>
        </div>

        <div className="p-4 border border-slate-900 bg-slate-950/40 rounded-sm flex flex-col gap-1.5 hover:border-slate-800 transition-colors">
          <span className="text-slate-500 text-[9px] uppercase tracking-wider font-semibold flex items-center gap-1.5">
            <Boxes className="w-3.5 h-3.5 text-amber-400" /> Cross-Module Couplings
          </span>
          <span className="text-lg font-bold text-slate-100">{totalRelationships} Relationships</span>
          <span className="text-[8px] text-slate-500">Mapped semantic links</span>
        </div>

        <div className="p-4 border border-slate-900 bg-slate-950/40 rounded-sm flex flex-col gap-1.5 hover:border-slate-800 transition-colors">
          <span className="text-slate-500 text-[9px] uppercase tracking-wider font-semibold flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-rose-400" /> Taxonomies
          </span>
          <span className="text-lg font-bold text-slate-100">{categoriesCount} Categories</span>
          <span className="text-[8px] text-slate-500">Organized index boundaries</span>
        </div>
      </div>

      {/* 2. Registry Stream List */}
      <div className="border border-slate-900 bg-slate-950/65 rounded-sm overflow-hidden">
        <div className="px-4 py-3 bg-slate-900/40 border-b border-slate-900 flex justify-between items-center">
          <div>
            <h3 className="text-xs font-bold text-slate-200 uppercase font-sans tracking-wide">
              Registered Knowledge Ingestion Pipelines
            </h3>
            <p className="text-[9px] text-slate-500 font-mono mt-0.5">
              SYSTEM_REGISTRY_INDEX // SECURE BROADCAST CHANNELS
            </p>
          </div>
          <span className="inline-flex items-center gap-1 text-[8px] font-mono text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-900/20">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse mr-0.5" /> SYSTEM ONLINE
          </span>
        </div>

        <div className="divide-y divide-slate-900/60">
          {sources.map((src) => (
            <div
              key={src.id}
              className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-900/10 transition-colors"
            >
              <div className="space-y-1.5 max-w-xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-100 font-sans">{src.name}</span>
                  <span className="px-1.5 py-0.2 bg-slate-900 border border-slate-800 text-[8px] font-mono font-bold text-cyan-400/85 rounded">
                    {src.ownerModule}
                  </span>
                  <span className="font-mono text-[9px] text-slate-500">v{src.version}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal font-sans">
                  {src.description}
                </p>
                {/* Channel tags */}
                <div className="flex flex-wrap gap-1 mt-1">
                  {src.tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-0.5 px-1 py-0.2 bg-slate-900/40 text-[8px] font-mono text-slate-500 border border-slate-800/20 rounded-xs"
                    >
                      <Tag className="w-2 h-2 text-slate-600" />
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Status and permissions info */}
              <div className="flex items-center gap-4 md:self-center">
                <div className="text-right hidden md:block">
                  <div className="text-[9px] font-mono text-slate-500 uppercase">CLASSIFICATION</div>
                  <div className="text-[10px] font-mono text-slate-300 font-bold uppercase">{src.permissions.visibility}</div>
                </div>

                <div className="text-right hidden md:block">
                  <div className="text-[9px] font-mono text-slate-500 uppercase">CATEGORY</div>
                  <div className="text-[10px] font-mono text-slate-300 font-bold uppercase">{src.category}</div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="flex flex-col items-end">
                    <span className="text-[8px] font-mono text-slate-600 uppercase">STATUS</span>
                    <span
                      className={`inline-flex items-center gap-1 text-[9px] font-mono font-bold ${
                        src.status === 'Active' ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      <CircleDot className="w-2.5 h-2.5" /> {src.status.toUpperCase()}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-700" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Developer Integration Guide Callout */}
      <div className="p-4 border border-cyan-950/50 bg-cyan-950/5 rounded-sm">
        <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5 mb-1">
          <Sparkles className="w-4 h-4 text-cyan-400" /> Module Ingestion Protocol (SOP-09)
        </h4>
        <p className="text-xs text-slate-400 leading-normal mb-3">
          New system microservices (e.g. CRM, LMS, Projects, Packaging) can publish knowledge streams to the central Knowledge Engine at build-time using our decoupled registry pattern. Follow the developer integration standards to maintain metadata sync.
        </p>
        <div className="bg-slate-950 p-3 rounded border border-slate-900 font-mono text-[10px] text-slate-400 overflow-x-auto leading-normal">
          {`import { registry } from '@/backend/knowledge/registry';\n\nregistry.registerSource({\n  id: 'src-your-module',\n  name: 'Your System Pipeline',\n  description: 'Synchronizes custom runtime documents...',\n  ownerModule: 'YourModule',\n  category: 'Business',\n  permissions: { roles: ['all_personnel'], visibility: 'Organization' },\n  version: '1.0.0',\n  status: 'Active',\n  tags: ['custom', 'logs']\n});`}
        </div>
      </div>
    </div>
  );
};

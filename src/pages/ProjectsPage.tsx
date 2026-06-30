import React from 'react';
import { DSCard, DSCardHeader, DSCardContent, DSCardTitle, DSCardSubtitle } from '../components/design-system/DSCard';
import { DSBadge } from '../components/design-system/DSStatus';
import { FolderTree, CheckSquare, Calendar, ChevronRight } from 'lucide-react';

export const ProjectsPage: React.FC = () => {
  const milestones = [
    { title: 'Sprint 1: Core Platform Foundation', date: 'June 2026', status: 'Completed', color: 'emerald' },
    { title: 'Sprint 2: Real-time Orchestrator Engine', date: 'July 2026', status: 'Planned', color: 'cyan' },
    { title: 'Sprint 3: KMS Integration & Deep Indexing', date: 'August 2026', status: 'Planned', color: 'slate' }
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-900 pb-5">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold tracking-tight text-slate-100 font-sans">
            Enterprise Projects
          </h1>
          <DSBadge variant="outline" color="emerald">Sprint 1 Target</DSBadge>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Tracking active milestones, epic sprints, and developer execution threads.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {milestones.map((m, idx) => (
          <DSCard key={idx} variant="bordered" className="flex flex-col justify-between">
            <DSCardHeader>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-cyan-400" /> {m.date}
                </span>
                <DSCardTitle className="mt-2 text-slate-200">{m.title}</DSCardTitle>
              </div>
            </DSCardHeader>
            <DSCardContent className="pt-2">
              <p className="text-xs text-slate-400 leading-normal">
                This project encapsulates the architectural boundaries for Phase 1. All tasks are mapped to synthetic operator threads.
              </p>
            </DSCardContent>
            <div className="px-5 py-3 border-t border-slate-900 bg-slate-950/40 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-500">Status:</span>
              <DSBadge variant="outline" color={m.color as any}>{m.status}</DSBadge>
            </div>
          </DSCard>
        ))}
      </div>

      <DSCard variant="bordered">
        <DSCardHeader>
          <DSCardTitle className="flex items-center gap-2">
            <FolderTree className="w-4 h-4 text-cyan-400" />
            <span>Milestone Contribution Policy</span>
          </DSCardTitle>
        </DSCardHeader>
        <DSCardContent className="text-xs text-slate-400 leading-relaxed space-y-2">
          <p>
            Future developers can append new feature modules by creating designated route mappings under `/src/hooks/useRouter.ts` and linking their sub-view components inside `/src/pages/`.
          </p>
          <p>
            All mutations must comply with the strict TS typing schemas established in `/src/types.ts` and review approvals under the Technical Review Board (TRB) guidelines.
          </p>
        </DSCardContent>
      </DSCard>
    </div>
  );
};

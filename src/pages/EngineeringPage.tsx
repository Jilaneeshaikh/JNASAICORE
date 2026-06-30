import React from 'react';
import { DSCard, DSCardHeader, DSCardContent, DSCardTitle } from '../components/design-system/DSCard';
import { DSBadge } from '../components/design-system/DSStatus';
import { Terminal, HardDrive, Cpu } from 'lucide-react';

export const EngineeringPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-900 pb-5">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold tracking-tight text-slate-100 font-sans">
            Engineering Workspace
          </h1>
          <DSBadge variant="outline" color="slate">Future Roadmap</DSBadge>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Dynamic script execution, telemetry inspection, and developer debugging sandboxes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DSCard variant="bordered">
          <DSCardHeader>
            <DSCardTitle className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Computational Simulators</span>
            </DSCardTitle>
          </DSCardHeader>
          <DSCardContent className="text-xs text-slate-400 leading-normal">
            A high-efficiency sandbox designed for compiling micro-controllers, modeling electronic load grids, and compiling rust/webassembly binaries on dedicated compute threads.
          </DSCardContent>
        </DSCard>

        <DSCard variant="bordered">
          <DSCardHeader>
            <DSCardTitle className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>Shell Console Gateway</span>
            </DSCardTitle>
          </DSCardHeader>
          <DSCardContent className="text-xs text-slate-400 leading-normal space-y-2.5">
            <p>
              Execute remote CLI dispatches, verify container health states, and trace running processes directly from the browser window.
            </p>
            <div className="p-3 bg-slate-950 border border-slate-900 rounded font-mono text-[10px] text-cyan-500/80">
              [root@jnas-core] # docker ps --filter name=ai-core
            </div>
          </DSCardContent>
        </DSCard>
      </div>
    </div>
  );
};

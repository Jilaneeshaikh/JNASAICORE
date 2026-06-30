import React from 'react';
import { DSCard, DSCardHeader, DSCardContent, DSCardTitle } from '../components/design-system/DSCard';
import { DSBadge } from '../components/design-system/DSStatus';
import { KeyRound, ShieldCheck, FileCheck } from 'lucide-react';

export const AdminPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-900 pb-5">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold tracking-tight text-slate-100 font-sans">
            Administration Portal
          </h1>
          <DSBadge variant="outline" color="cyan">Sprint 1 Placeholder</DSBadge>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          IAM roles, access key management, security policies, and system audits.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DSCard variant="bordered">
          <DSCardHeader>
            <DSCardTitle className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-cyan-400" />
              <span>IAM Key Management</span>
            </DSCardTitle>
          </DSCardHeader>
          <DSCardContent className="text-xs text-slate-400 leading-normal">
            Revoke operator authorization tokens, rotate private server-side encryption keys, and provision scoped API proxy tokens.
          </DSCardContent>
        </DSCard>

        <DSCard variant="bordered">
          <DSCardHeader>
            <DSCardTitle className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Role-Based Permissions</span>
            </DSCardTitle>
          </DSCardHeader>
          <DSCardContent className="text-xs text-slate-400 leading-normal">
            Restrict access to delicate CAD computation engines, vector indexes, or production billing pipelines.
          </DSCardContent>
        </DSCard>

        <DSCard variant="bordered">
          <DSCardHeader>
            <DSCardTitle className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-cyan-400" />
              <span>Tamper-proof Access Logs</span>
            </DSCardTitle>
          </DSCardHeader>
          <DSCardContent className="text-xs text-slate-400 leading-normal">
            Trace administrative dispatches and track diagnostic traces chronologically inside encrypted log files.
          </DSCardContent>
        </DSCard>
      </div>
    </div>
  );
};

import React from 'react';
import { DSCard, DSCardHeader, DSCardContent, DSCardTitle, DSCardSubtitle } from '../components/design-system/DSCard';
import { DSBadge, DSAlert } from '../components/design-system/DSStatus';
import { Users, UserCheck, ShieldAlert, Layers } from 'lucide-react';

export const CRMPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-900 pb-5">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold tracking-tight text-slate-100 font-sans">
            CRM Core Interface
          </h1>
          <DSBadge variant="outline" color="slate">Under Construction</DSBadge>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Client accounts, tenant management, and user lifecycle analytics.
        </p>
      </div>

      <DSAlert type="info" title="CRM Portal Reserved">
        The CRM data pipeline will link to the Firebase Firestore / Auth instances during Phase 2. No live customer registries are currently indexed.
      </DSAlert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DSCard variant="bordered">
          <DSCardHeader>
            <DSCardTitle className="flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              <span>Tenant Accounts Directory</span>
            </DSCardTitle>
          </DSCardHeader>
          <DSCardContent className="space-y-4 text-xs text-slate-400">
            <p>
              Provides dynamic sorting, filtering, and assignment of enterprise clients to autonomous AI operator pods.
            </p>
            <div className="flex items-center gap-3.5 border border-dashed border-slate-800 p-4 rounded bg-slate-950/20 text-[11px] font-mono">
              <UserCheck className="w-4 h-4 text-slate-600" />
              <span>Awaiting Database Connectivity ...</span>
            </div>
          </DSCardContent>
        </DSCard>

        <DSCard variant="bordered">
          <DSCardHeader>
            <DSCardTitle className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Subscription & Licensing Control</span>
            </DSCardTitle>
          </DSCardHeader>
          <DSCardContent className="text-xs text-slate-400 leading-normal">
            <p>
              Manage multi-tenant operational limits, customized billing tiers, API rate caps, and hardware resource allocations for high-capacity customers.
            </p>
          </DSCardContent>
        </DSCard>
      </div>
    </div>
  );
};

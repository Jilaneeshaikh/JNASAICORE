import React from 'react';
import { DSCard, DSCardHeader, DSCardContent, DSCardTitle } from '../components/design-system/DSCard';
import { DSBadge } from '../components/design-system/DSStatus';
import { Box, Gift, Download } from 'lucide-react';

export const PackagingPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-900 pb-5">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold tracking-tight text-slate-100 font-sans">
            Packaging Studio
          </h1>
          <DSBadge variant="outline" color="slate">Future Roadmap</DSBadge>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Bundling, export wizards, and container deployment blueprints.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DSCard variant="bordered">
          <DSCardHeader>
            <DSCardTitle className="flex items-center gap-2">
              <Box className="w-4 h-4 text-cyan-400" />
              <span>Container Bundle Compiler</span>
            </DSCardTitle>
          </DSCardHeader>
          <DSCardContent className="text-xs text-slate-400 leading-normal">
            Bundle application code, environment assets, node dependencies, and operational safety rules into light-weight, ready-to-deploy Docker images or standalone zip containers.
          </DSCardContent>
        </DSCard>

        <DSCard variant="bordered">
          <DSCardHeader>
            <DSCardTitle className="flex items-center gap-2">
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Multi-Platform Deployment Blueprints</span>
            </DSCardTitle>
          </DSCardHeader>
          <DSCardContent className="text-xs text-slate-400 leading-normal">
            Export ready-made templates for Kubernetes clusters, Google Cloud Run services, or on-premise micro-servers.
          </DSCardContent>
        </DSCard>
      </div>
    </div>
  );
};

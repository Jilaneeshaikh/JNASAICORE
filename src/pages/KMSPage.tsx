import React from 'react';
import { DSCard, DSCardHeader, DSCardContent, DSCardTitle } from '../components/design-system/DSCard';
import { DSBadge, DSAlert } from '../components/design-system/DSStatus';
import { FileSearch, Database, Network } from 'lucide-react';

export const KMSPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-900 pb-5">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold tracking-tight text-slate-100 font-sans">
            KMS - Knowledge Management
          </h1>
          <DSBadge variant="outline" color="slate">Future Roadmap</DSBadge>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Vector database indexes, semantic similarity search, and enterprise document ingestion.
        </p>
      </div>

      <DSAlert type="info" title="Knowledge Store Offline">
        In Sprint 3, this workspace will connect to Vector Databases (e.g. Pinecone/Chroma) and parse structured PDFs/markdown logs.
      </DSAlert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DSCard variant="bordered">
          <DSCardHeader>
            <DSCardTitle className="flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <span>Semantic Embedding Indexes</span>
            </DSCardTitle>
          </DSCardHeader>
          <DSCardContent className="text-xs text-slate-400 leading-normal space-y-2">
            <p>
              Provides quick search over legal corporate documents, database structures, and runtime tool documentation.
            </p>
            <div className="p-3 bg-slate-950 rounded border border-slate-900 font-mono text-[10px] text-slate-500">
              $ query-index --namespace=legal --threshold=0.82
            </div>
          </DSCardContent>
        </DSCard>

        <DSCard variant="bordered">
          <DSCardHeader>
            <DSCardTitle className="flex items-center gap-2">
              <Network className="w-4 h-4 text-cyan-400" />
              <span>Graph-based Retrieval (RAG)</span>
            </DSCardTitle>
          </DSCardHeader>
          <DSCardContent className="text-xs text-slate-400 leading-normal">
            <p>
              Leverages multi-hop semantic graph mappings to extract relational data bounds, feeding high-relevance prompt contexts to active agent execution lines.
            </p>
          </DSCardContent>
        </DSCard>
      </div>
    </div>
  );
};

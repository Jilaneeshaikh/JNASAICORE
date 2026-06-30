import React, { useEffect, useState } from 'react';
import { bootstrapKnowledgeBase } from '../backend/knowledge/mockData';
import { registry } from '../backend/knowledge/registry';
import { KnowledgeObject, KnowledgeSearchQuery } from '../backend/knowledge/types';
import { DSBadge } from '../components/design-system/DSStatus';
import { DSCard, DSCardContent } from '../components/design-system/DSCard';
import { KnowledgeCard } from '../components/knowledge/KnowledgeCard';
import { KnowledgeViewer } from '../components/knowledge/KnowledgeViewer';
import { KnowledgeRegistryPanel } from '../components/knowledge/KnowledgeRegistryPanel';
import { KnowledgeSearchForm } from '../components/knowledge/KnowledgeSearchForm';
import { Database, Network, Search, Compass, Share2, HelpCircle } from 'lucide-react';

export const KMSPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'catalog' | 'registry'>('catalog');
  const [searchQuery, setSearchQuery] = useState<KnowledgeSearchQuery>({});
  const [filteredObjects, setFilteredObjects] = useState<KnowledgeObject[]>([]);
  const [selectedObject, setSelectedObject] = useState<KnowledgeObject | null>(null);

  // Initialize and seed knowledge base on mount
  useEffect(() => {
    bootstrapKnowledgeBase();
    setFilteredObjects(registry.getObjects());
    // Auto-select first item by default if available
    const objs = registry.getObjects();
    if (objs.length > 0) {
      setSelectedObject(objs[0]);
    }
  }, []);

  // Sync querying
  const handleSearch = (query: KnowledgeSearchQuery) => {
    setSearchQuery(query);
    const results = registry.query(query);
    setFilteredObjects(results);

    // Keep active selected object only if it is still within the results list
    if (selectedObject && !results.some((o) => o.id === selectedObject.id)) {
      setSelectedObject(results.length > 0 ? results[0] : null);
    } else if (!selectedObject && results.length > 0) {
      setSelectedObject(results[0]);
    }
  };

  // Extract unique filter properties for advanced dropdown search
  const allObjects = registry.getObjects();
  const projects = Array.from(new Set(allObjects.map((obj) => obj.project).filter((p): p is string => !!p)));
  const owners = Array.from(new Set(allObjects.map((obj) => obj.owner)));
  const workspaces = Array.from(new Set(allObjects.map((obj) => obj.workspace)));

  // Interactive object link navigation
  const handleNavigateToObject = (targetObj: KnowledgeObject) => {
    // If we transition to a document that doesn't fit current filters, clear filters
    const allCurrentObjects = registry.query(searchQuery);
    if (!allCurrentObjects.some((o) => o.id === targetObj.id)) {
      handleSearch({}); // Reset filters
    }
    setSelectedObject(targetObj);

    // Scroll card into view if on viewport
    setTimeout(() => {
      const cardElem = document.getElementById(`kb-card-${targetObj.id}`);
      if (cardElem) {
        cardElem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Portal Header */}
      <div className="border-b border-slate-900 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-slate-100 font-sans">
              KMS — Enterprise Knowledge Engine
            </h1>
            <DSBadge variant="outline" color="cyan">Active Core</DSBadge>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Decoupled knowledge registry, semantic cross-module relationship maps, and enterprise file schema validation index.
          </p>
        </div>

        {/* Custom Tab Switcher */}
        <div className="flex bg-slate-950 border border-slate-900 p-0.5 rounded-sm self-start md:self-center font-mono text-[10px]">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-3.5 py-1.5 rounded-xs font-bold transition-all uppercase cursor-pointer ${
              activeTab === 'catalog'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Knowledge Catalog
          </button>
          <button
            onClick={() => setActiveTab('registry')}
            className={`px-3.5 py-1.5 rounded-xs font-bold transition-all uppercase cursor-pointer ${
              activeTab === 'registry'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Ingestion Pipelines ({registry.getSources().length})
          </button>
        </div>
      </div>

      {/* 2. Interactive Workspace */}
      {activeTab === 'catalog' ? (
        <div className="space-y-6">
          {/* A. Dynamic Search Form */}
          <KnowledgeSearchForm
            onSearch={handleSearch}
            projects={projects}
            owners={owners}
            workspaces={workspaces}
          />

          {/* B. Two Column Bento Grid: Left results, Right detailed inspector */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Result Cards List */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 border-b border-slate-900/50 pb-2">
                <span className="uppercase font-bold">Catalog Index ({filteredObjects.length} Nodes Found)</span>
                <span>Sorted by Ingestion Date</span>
              </div>

              {filteredObjects.length > 0 ? (
                <div className="grid grid-cols-1 gap-3.5 max-h-[720px] overflow-y-auto pr-1">
                  {filteredObjects.map((obj) => (
                    <KnowledgeCard
                      key={obj.id}
                      object={obj}
                      onSelect={(o) => setSelectedObject(o)}
                      isSelected={selectedObject?.id === obj.id}
                    />
                  ))}
                </div>
              ) : (
                <div className="border border-slate-900 border-dashed rounded bg-slate-950/20 p-8 text-center">
                  <p className="text-xs text-slate-500 font-mono italic">No indexed items matched your active criteria filters.</p>
                </div>
              )}
            </div>

            {/* Right Inspector Panel */}
            <div className="lg:col-span-7 h-full min-h-[580px] lg:sticky lg:top-4">
              {selectedObject ? (
                <KnowledgeViewer
                  object={selectedObject}
                  onNavigateToObject={handleNavigateToObject}
                />
              ) : (
                <div className="border border-slate-900 bg-slate-950/20 rounded-sm h-full flex flex-col items-center justify-center text-center p-8 min-h-[580px]">
                  <Compass className="w-8 h-8 text-slate-700 animate-pulse mb-3" />
                  <h4 className="text-sm font-semibold text-slate-400 mb-1">No Knowledge Object Selected</h4>
                  <p className="text-xs text-slate-600 max-w-sm">
                    Select any metadata node from the catalog directory list to view full secure clearances, relationship maps, and raw mock payload vectors.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <KnowledgeRegistryPanel />
      )}
    </div>
  );
};

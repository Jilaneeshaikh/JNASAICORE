import React, { useEffect, useState } from 'react';
import { Search, Filter, ShieldCheck, RefreshCw, Layers, Sparkles } from 'lucide-react';
import { packagingRegistry } from '../../backend/packaging/registry';
import { PackagingRole } from '../../backend/packaging/types';

interface PackagingHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedType: string;
  setSelectedType: (type: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  role: PackagingRole;
  setRole: (role: PackagingRole) => void;
  department: string;
  setDepartment: (dept: string) => void;
  onRefresh: () => void;
}

export const PackagingHeader: React.FC<PackagingHeaderProps> = ({
  searchQuery,
  setSearchQuery,
  selectedType,
  setSelectedType,
  selectedStatus,
  setSelectedStatus,
  role,
  setRole,
  department,
  setDepartment,
  onRefresh
}) => {
  const [activeDwgNum, setActiveDwgNum] = useState<string | null>(null);
  const [activeDwgTitle, setActiveDwgTitle] = useState<string | null>(null);

  // Sync active target context from local storage
  const syncContext = () => {
    try {
      const activeId = localStorage.getItem('jnas-active-drawing-id');
      const storedDrawings = localStorage.getItem('jnas-eng-drawings');
      if (activeId && storedDrawings) {
        const drawings = JSON.parse(storedDrawings) as any[];
        const matching = drawings.find(d => d.id === activeId);
        if (matching) {
          setActiveDwgNum(matching.drawingNumber);
          setActiveDwgTitle(matching.title);
          return;
        }
      }
      setActiveDwgNum(null);
      setActiveDwgTitle(null);
    } catch (e) {
      console.warn('Could not sync active drawing context in Packaging Studio', e);
    }
  };

  useEffect(() => {
    syncContext();
    // poll or wait for localstorage changes
    const interval = setInterval(syncContext, 2000);
    return () => clearInterval(interval);
  }, []);

  const roles: PackagingRole[] = ['Packaging Engineer', 'Engineering Manager', 'Quality Inspector'];
  const depts = ['Industrial Packaging', 'Propulsion Logistics', 'Avionics Transport'];
  const types = [
    'All Types',
    'Returnable',
    'Expendable',
    'Rack',
    'Pallet',
    'Kit Cart',
    'Bin',
    'Plastic Tote',
    'Steel Rack',
    'Wooden Crate',
    'Foam',
    'Corrugated Box'
  ];
  const statuses = ['All Statuses', 'Draft', 'Submitted', 'In Review', 'Approved', 'Active', 'Archived'];

  return (
    <div className="bg-[#0C111E] border-b border-slate-900 px-6 py-4 space-y-4">
      {/* Top row: Title and Context Isolation */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-100 tracking-tight font-sans">
              Packaging Studio
            </h1>
            <span className="px-2 py-0.5 text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-900 rounded-full font-mono uppercase">
              Enterprise Foundation
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Aerospace transit containers, ESD cushioning dunnage trays, and multi-tenant kitting ledgers.
          </p>
        </div>

        {/* Isolation controls */}
        <div className="flex items-center gap-3">
          {/* Active Drawing Sync context */}
          {activeDwgNum && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-cyan-500/5 border border-cyan-500/20 rounded-md text-[11px] font-mono">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span className="text-slate-500">Active Blueprint Target:</span>
              <span className="text-cyan-400 font-semibold">{activeDwgNum}</span>
              <span className="text-slate-600">({activeDwgTitle})</span>
            </div>
          )}

          {/* Department dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-950/40 border border-slate-900 rounded-md px-2 py-1">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <select
              value={department}
              onChange={(e) => {
                setDepartment(e.target.value);
                packagingRegistry.setCurrentDepartment(e.target.value);
              }}
              className="bg-transparent border-none text-[11px] text-slate-300 font-sans focus:outline-none focus:ring-0 cursor-pointer"
            >
              {depts.map(d => (
                <option key={d} value={d} className="bg-slate-950 text-slate-300">
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Role dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-950/40 border border-slate-900 rounded-md px-2 py-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <select
              value={role}
              onChange={(e) => {
                const selected = e.target.value as PackagingRole;
                setRole(selected);
                packagingRegistry.setCurrentRole(selected);
              }}
              className="bg-transparent border-none text-[11px] text-slate-300 font-sans focus:outline-none focus:ring-0 cursor-pointer"
            >
              {roles.map(r => (
                <option key={r} value={r} className="bg-slate-950 text-slate-300">
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Refresh Action */}
          <button
            onClick={onRefresh}
            className="p-1.5 hover:bg-slate-900 rounded-md border border-slate-900 text-slate-400 hover:text-slate-200 transition"
            title="Refresh Registry"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom row: Search & Filters */}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by part name, project #, customer, material code, or engineer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950/40 border border-slate-900 rounded-md text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
            <Filter className="w-3.5 h-3.5" />
            <span>Faceted Filters:</span>
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-slate-950/40 border border-slate-900 rounded-md text-[11px] text-slate-300 px-2 py-1.5 focus:outline-none focus:border-cyan-500/50 cursor-pointer"
          >
            {types.map(t => (
              <option key={t} value={t === 'All Types' ? '' : t} className="bg-slate-950 text-slate-300">
                {t}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-950/40 border border-slate-900 rounded-md text-[11px] text-slate-300 px-2 py-1.5 focus:outline-none focus:border-cyan-500/50 cursor-pointer"
          >
            {statuses.map(s => (
              <option key={s} value={s === 'All Statuses' ? '' : s} className="bg-slate-950 text-slate-300">
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

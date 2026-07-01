import React from 'react';
import { Search, Shield, Building, Filter, UserCheck, X } from 'lucide-react';
import { DSSelect } from '../design-system/DSForm';
import { DSBadge } from '../design-system/DSStatus';
import { EngineeringRegistry } from '../../backend/engineering/registry';

interface EngineeringHeaderProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  selectedApproval: string;
  setSelectedApproval: (app: string) => void;
  activeRole: string;
  setActiveRole: (role: string) => void;
  activeDept: string;
  setActiveDept: (dept: string) => void;
  onClearFilters: () => void;
}

export const EngineeringHeader: React.FC<EngineeringHeaderProps> = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedStatus,
  setSelectedStatus,
  selectedApproval,
  setSelectedApproval,
  activeRole,
  setActiveRole,
  activeDept,
  setActiveDept,
  onClearFilters
}) => {
  const hasActiveFilters = selectedCategory !== 'All' || selectedStatus !== 'All' || selectedApproval !== 'All' || searchQuery !== '';

  const categories = ['All', 'Mechanical', 'Electrical', 'Structural', 'Civil', 'Simulation', 'Packaging', 'Automation', 'Standards'];
  const statuses = ['All', 'Draft', 'Released', 'Superseded', 'Withdrawn', 'Obsolete'];
  const approvals = ['All', 'Pending', 'Approved', 'Rejected', 'In Review'];

  const roles = [
    { value: 'Lead Engineer', label: 'Lead Engineer (Full Access)' },
    { value: 'CAD Designer', label: 'CAD Designer (Draft & Edit)' },
    { value: 'QA Inspector', label: 'QA Inspector (Approve & Audit)' }
  ];

  const depts = [
    { value: 'R&D Propulsion', label: 'R&D Propulsion' },
    { value: 'Structural Analysis', label: 'Structural Analysis' },
    { value: 'Avionics Core', label: 'Avionics Core' },
    { value: 'Thermal Physics', label: 'Thermal Physics' }
  ];

  return (
    <div className="bg-[#0C101B] border border-[#172237] rounded-lg p-4 space-y-4 shadow-xl">
      {/* Search Bar & Security Profiles */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Universal Engineering Lookup */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-4 py-2 border border-[#1D2A44] rounded-md bg-[#070B14] text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 font-sans"
            placeholder="Search drawings by title, number, standards (e.g. AS9100), categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Right: Security Matrix & Isolation Profile Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Active Engineering Role */}
          <div className="flex items-center gap-2 bg-[#0E1524] px-2.5 py-1.5 rounded border border-[#1A263E]">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Role Gate:</span>
            <select
              value={activeRole}
              onChange={(e) => setActiveRole(e.target.value)}
              className="bg-transparent text-slate-200 text-xs font-medium focus:outline-none font-sans cursor-pointer hover:text-white"
            >
              {roles.map((r) => (
                <option key={r.value} value={r.value} className="bg-[#0A0D16] text-slate-200">
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Department Isolation Scope */}
          <div className="flex items-center gap-2 bg-[#0E1524] px-2.5 py-1.5 rounded border border-[#1A263E]">
            <Building className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Dept Isolation:</span>
            <select
              value={activeDept}
              onChange={(e) => setActiveDept(e.target.value)}
              className="bg-transparent text-slate-200 text-xs font-medium focus:outline-none font-sans cursor-pointer hover:text-white"
            >
              {depts.map((d) => (
                <option key={d.value} value={d.value} className="bg-[#0A0D16] text-slate-200">
                  {d.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Advanced Engineering Filters Panel */}
      <div className="flex flex-wrap items-center gap-4 pt-1.5 border-t border-[#131C2D]">
        <div className="flex items-center gap-2 text-[11px] text-slate-400 uppercase tracking-wider font-mono font-bold">
          <Filter className="w-3.5 h-3.5 text-cyan-500" />
          <span>Faceted Search:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Drawing Category */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-500 font-mono">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-[#070B14] border border-[#1A263E] text-slate-300 text-xs rounded px-2 py-1 font-sans focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              {categories.map((c) => (
                <option key={c} value={c} className="bg-[#0A0D16] text-slate-300">
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Core Lifecycle Status */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-500 font-mono">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-[#070B14] border border-[#1A263E] text-slate-300 text-xs rounded px-2 py-1 font-sans focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              {statuses.map((s) => (
                <option key={s} value={s} className="bg-[#0A0D16] text-slate-300">
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Quality Approval Status */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-500 font-mono">Approval:</span>
            <select
              value={selectedApproval}
              onChange={(e) => setSelectedApproval(e.target.value)}
              className="bg-[#070B14] border border-[#1A263E] text-slate-300 text-xs rounded px-2 py-1 font-sans focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              {approvals.map((a) => (
                <option key={a} value={a} className="bg-[#0A0D16] text-slate-300">
                  {a}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Active Indicators & Clear Toggle */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 ml-auto">
              <DSBadge variant="outline" color="cyan">
                Filters Active
              </DSBadge>
              <button
                onClick={onClearFilters}
                className="text-[10px] text-slate-400 hover:text-cyan-400 font-mono flex items-center gap-1 bg-[#1A263E]/40 px-2 py-1 rounded border border-[#1F2E4A] transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

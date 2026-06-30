import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronRight, ArrowUpDown, Trash2, Shield, Eye, MoreHorizontal } from 'lucide-react';
import { DSButton } from './DSButton';
import { DSCheckbox } from './DSForm';

export interface DSTableRow {
  id: string;
  name: string;
  role: string;
  workspace: string;
  status: 'active' | 'inactive' | 'suspended';
  latency: string;
  lastActive: string;
  details: {
    email: string;
    authMethod: string;
    createdDate: string;
    apiCalls: number;
  };
}

export interface DSTableProps {
  rows: DSTableRow[];
  dense?: boolean;
}

export const DSTable: React.FC<DSTableProps> = ({ rows, dense = false }) => {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});
  const [sortField, setSortField] = useState<keyof DSTableRow | ''>('');
  const [sortAsc, setSortAsc] = useState(true);

  const toggleRowExpand = (id: string) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const isAllSelected = rows.length > 0 && rows.every((r) => selectedIds[r.id]);
  const isAnySelected = rows.some((r) => selectedIds[r.id]);

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds({});
    } else {
      const updated: Record<string, boolean> = {};
      rows.forEach((r) => {
        updated[r.id] = true;
      });
      setSelectedIds(updated);
    }
  };

  const handleSort = (field: keyof DSTableRow) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sortedRows = [...rows].sort((a, b) => {
    if (!sortField) return 0;
    const valA = a[sortField];
    const valB = b[sortField];
    if (typeof valA === 'string' && typeof valB === 'string') {
      return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    return 0;
  });

  const selectedCount = Object.values(selectedIds).filter(Boolean).length;

  return (
    <div className="w-full border border-slate-800 bg-slate-950 rounded-sm overflow-hidden flex flex-col font-sans">
      {/* Batch Action Toolbar */}
      <AnimatePresence>
        {isAnySelected && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between overflow-hidden"
          >
            <span className="text-xs font-medium text-cyan-400">
              {selectedCount} item{selectedCount > 1 ? 's' : ''} selected for batch operational dispatch
            </span>
            <div className="flex items-center gap-2">
              <DSButton size="sm" variant="outline" leftIcon={<Shield className="w-3.5 h-3.5" />}>
                Re-encrypt Keys
              </DSButton>
              <DSButton size="sm" variant="danger" leftIcon={<Trash2 className="w-3.5 h-3.5" />}>
                De-authorize
              </DSButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse table-auto">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 uppercase text-[10px] tracking-widest font-mono select-none">
              <th className="p-3.5 w-10 text-center">
                <DSCheckbox
                  checked={isAllSelected ? true : isAnySelected ? 'indeterminate' : false}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="p-3.5 w-8"></th>
              <th className="p-3.5 cursor-pointer hover:text-slate-200 transition-colors" onClick={() => handleSort('name')}>
                <div className="flex items-center gap-1.5">
                  Identity <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th className="p-3.5 cursor-pointer hover:text-slate-200 transition-colors" onClick={() => handleSort('role')}>
                <div className="flex items-center gap-1.5">
                  Assigned Role <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th className="p-3.5 cursor-pointer hover:text-slate-200 transition-colors" onClick={() => handleSort('workspace')}>
                <div className="flex items-center gap-1.5">
                  Workspace Context <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th className="p-3.5 cursor-pointer hover:text-slate-200 transition-colors" onClick={() => handleSort('status')}>
                <div className="flex items-center gap-1.5">
                  System State <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th className="p-3.5">API Latency</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900/60 text-xs">
            {sortedRows.map((row) => {
              const isExpanded = expandedRows[row.id];
              const isSelected = selectedIds[row.id] || false;
              const statusColors = {
                active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                inactive: 'bg-slate-900 text-slate-400 border-slate-800',
                suspended: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
              };

              return (
                <React.Fragment key={row.id}>
                  {/* Primary Row */}
                  <tr
                    className={`hover:bg-slate-900/40 transition-colors ${
                      isSelected ? 'bg-cyan-950/5' : ''
                    } ${dense ? 'h-8' : 'h-12'}`}
                  >
                    <td className="p-3.5 text-center">
                      <DSCheckbox checked={isSelected} onChange={() => toggleSelectRow(row.id)} />
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => toggleRowExpand(row.id)}
                        className="text-slate-500 hover:text-slate-200 cursor-pointer p-0.5"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                    <td className="p-3.5 font-medium text-slate-100">{row.name}</td>
                    <td className="p-3.5 font-mono text-[11px] text-slate-400">{row.role}</td>
                    <td className="p-3.5 text-slate-300">{row.workspace}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 border rounded-sm text-[10px] uppercase font-mono ${statusColors[row.status]}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-cyan-400 font-medium">{row.latency}</td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button className="text-slate-500 hover:text-slate-300 p-1 rounded-sm hover:bg-slate-900 cursor-pointer">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button className="text-slate-500 hover:text-slate-300 p-1 rounded-sm hover:bg-slate-900 cursor-pointer">
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expandable row content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <tr className="bg-slate-950/60">
                        <td colSpan={8} className="p-0">
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-14 py-4 border-b border-slate-900/60 bg-slate-950/40 grid grid-cols-4 gap-6 text-xs text-slate-300">
                              <div className="flex flex-col gap-1.5">
                                <span className="text-[10px] uppercase text-slate-500 tracking-wider font-mono">
                                  Secure Identifier Key
                                </span>
                                <span className="font-mono text-slate-200 truncate">{row.id}</span>
                              </div>
                              <div className="flex flex-col gap-1.5">
                                <span className="text-[10px] uppercase text-slate-500 tracking-wider font-mono">
                                  Email Access Node
                                </span>
                                <span className="font-sans text-slate-200">{row.details.email}</span>
                              </div>
                              <div className="flex flex-col gap-1.5">
                                <span className="text-[10px] uppercase text-slate-500 tracking-wider font-mono">
                                  Auth Encryption Method
                                </span>
                                <span className="font-mono text-slate-400">{row.details.authMethod}</span>
                              </div>
                              <div className="flex flex-col gap-1.5">
                                <span className="text-[10px] uppercase text-slate-500 tracking-wider font-mono">
                                  API Access Volume (Daily)
                                </span>
                                <span className="font-mono text-cyan-400 font-semibold">{row.details.apiCalls.toLocaleString()} calls</span>
                              </div>
                            </div>
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-4 py-3 border-t border-slate-900 bg-slate-950 flex items-center justify-between text-xs text-slate-400 select-none">
        <span className="font-mono">Showing 1-{rows.length} of {rows.length} records</span>
        <div className="flex items-center gap-1.5">
          <DSButton size="sm" variant="outline" disabled>
            Prev
          </DSButton>
          <span className="px-2.5 py-1 text-xs border border-slate-800 bg-slate-900 rounded-sm text-slate-200 font-mono">
            1
          </span>
          <DSButton size="sm" variant="outline" disabled>
            Next
          </DSButton>
        </div>
      </div>
    </div>
  );
};

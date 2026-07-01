import React, { useState } from 'react';
import {
  FileCode,
  User,
  Star,
  Layers,
  Archive,
  Wrench,
  Cpu,
  FileCheck,
  Compass,
  Trash2,
  ListCollapse,
  Download,
  AlertCircle
} from 'lucide-react';
import { Drawing, BOMItem } from '../../backend/engineering/types';
import { DSBadge } from '../design-system/DSStatus';
import { DSButton } from '../design-system/DSButton';
import { EngineeringRegistry } from '../../backend/engineering/registry';

interface DrawingCardProps {
  drawing: Drawing;
  onUpdate: () => void;
  onDelete?: () => void;
  activeRole: string;
}

export const DrawingCard: React.FC<DrawingCardProps> = ({ drawing, onUpdate, onDelete, activeRole }) => {
  const [showBOM, setShowBOM] = useState(false);
  const registry = EngineeringRegistry.getInstance();
  const isFav = registry.isFavorite(drawing.id);

  const statusColors: Record<string, 'cyan' | 'emerald' | 'amber' | 'rose' | 'slate'> = {
    Draft: 'amber',
    Released: 'emerald',
    Superseded: 'slate',
    Withdrawn: 'rose',
    Obsolete: 'slate'
  };

  const approvalColors: Record<string, 'cyan' | 'emerald' | 'rose' | 'amber'> = {
    Pending: 'amber',
    Approved: 'emerald',
    Rejected: 'rose',
    'In Review': 'cyan'
  };

  const handleActiveSelect = () => {
    localStorage.setItem('jnas-active-drawing-id', drawing.id);
    registry.addAuditLog('Drawing Selected', drawing.id, 'Drawing', `Set active drawing workspace target to ${drawing.drawingNumber}`);
    onUpdate();
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    registry.toggleFavorite(drawing.id);
    onUpdate();
  };

  const handleApprovalChange = (e: React.MouseEvent, appStatus: 'Approved' | 'Rejected' | 'In Review') => {
    e.stopPropagation();
    try {
      registry.updateDrawing(drawing.id, { approvalStatus: appStatus });
      onUpdate();
    } catch (err: any) {
      alert(err.message || 'Approval update failed.');
    }
  };

  const handleStatusChange = (e: React.MouseEvent, status: any) => {
    e.stopPropagation();
    try {
      registry.updateDrawing(drawing.id, { status });
      onUpdate();
    } catch (err: any) {
      alert(err.message || 'Status update failed.');
    }
  };

  const canApprove = registry.hasPermission('ApproveDrawing');
  const isActiveWorkspaceDrawing = localStorage.getItem('jnas-active-drawing-id') === drawing.id;

  return (
    <div
      onClick={handleActiveSelect}
      className={`relative bg-[#0C111E] border ${
        isActiveWorkspaceDrawing
          ? 'border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.15)] bg-gradient-to-b from-[#0C111E] to-[#0A1A2F]/40'
          : 'border-[#152033] hover:border-slate-700/60'
      } rounded-lg p-4 transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-4`}
    >
      {/* Header Info */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-500 font-semibold">
            <FileCode className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">{drawing.category} Registry</span>
            <span className="text-slate-600">|</span>
            <span className="text-cyan-400 font-bold">{drawing.drawingNumber}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleToggleFavorite}
              className={`p-1.5 rounded-full border border-transparent hover:bg-slate-900 transition-colors ${
                isFav ? 'text-amber-400' : 'text-slate-500'
              }`}
            >
              <Star className="w-3.5 h-3.5" fill={isFav ? 'currentColor' : 'none'} />
            </button>
            <div className="text-[9px] font-mono font-bold bg-[#1B2945] text-cyan-400 px-2 py-0.5 rounded border border-cyan-800/40">
              Rev {drawing.revision}
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold text-slate-100 font-sans tracking-tight leading-snug line-clamp-1 group-hover:text-cyan-400">
            {drawing.title}
          </h4>
          <p className="text-[11px] text-slate-400 mt-1 leading-normal line-clamp-2">
            {drawing.description}
          </p>
        </div>
      </div>

      {/* Badges & Links */}
      <div className="flex flex-wrap items-center gap-2 font-mono text-[10px]">
        {/* Status */}
        <div className="flex items-center gap-1 bg-[#090D17] px-2 py-1 rounded border border-[#16233B]">
          <span className="text-slate-500">State:</span>
          <span className={`font-bold ${
            drawing.status === 'Released' ? 'text-emerald-400' :
            drawing.status === 'Draft' ? 'text-amber-400' : 'text-slate-400'
          }`}>{drawing.status}</span>
        </div>

        {/* Approval */}
        <div className="flex items-center gap-1 bg-[#090D17] px-2 py-1 rounded border border-[#16233B]">
          <span className="text-slate-500">Quality:</span>
          <span className={`font-bold ${
            drawing.approvalStatus === 'Approved' ? 'text-emerald-400' :
            drawing.approvalStatus === 'Rejected' ? 'text-rose-400' :
            drawing.approvalStatus === 'In Review' ? 'text-cyan-400' : 'text-amber-400'
          }`}>{drawing.approvalStatus}</span>
        </div>

        {/* Author / Owner */}
        <div className="flex items-center gap-1.5 text-slate-400 ml-auto font-sans">
          <User className="w-3 h-3 text-slate-500" />
          <span>{drawing.owner}</span>
        </div>
      </div>

      {/* Related Specs & CAD Links */}
      <div className="pt-2.5 border-t border-[#131E31] text-[10px] space-y-2 font-mono">
        {/* Related Standards */}
        {drawing.relatedStandards.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-500">Standards:</span>
            {drawing.relatedStandards.map((std) => (
              <span key={std} className="bg-[#121929] text-cyan-500 px-1.5 py-0.5 rounded border border-[#1B2844]">
                {std}
              </span>
            ))}
          </div>
        )}

        {/* Related Parts */}
        {drawing.relatedParts.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-500">Parts:</span>
            {drawing.relatedParts.map((part) => (
              <span key={part} className="bg-[#101420] text-slate-400 px-1.5 py-0.5 rounded border border-[#192439]">
                {part}
              </span>
            ))}
          </div>
        )}

        {/* CAD Blueprint Package */}
        {drawing.futureCADFile && (
          <div className="flex items-center justify-between p-1.5 bg-[#080B13] border border-[#162137] rounded">
            <span className="text-[9px] text-slate-400 flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-cyan-500 animate-spin-slow" />
              <span>{drawing.futureCADFile.fileName} ({drawing.futureCADFile.format})</span>
            </span>
            <span className="text-slate-500 text-[9px]">{drawing.futureCADFile.fileSizeMb} MB</span>
          </div>
        )}
      </div>

      {/* Bill of Materials (BOM) Toggle */}
      {drawing.relatedBOM.length > 0 && (
        <div className="border-t border-[#131E31] pt-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowBOM(!showBOM);
            }}
            className="w-full flex items-center justify-between text-[10px] text-slate-400 hover:text-cyan-400 font-mono"
          >
            <span className="flex items-center gap-1.5">
              <Layers className="w-3 h-3 text-cyan-400" />
              <span>Bill of Materials (BOM - {drawing.relatedBOM.length} items)</span>
            </span>
            <span>{showBOM ? 'Collapse' : 'Expand'}</span>
          </button>

          {showBOM && (
            <div className="mt-2 space-y-1 bg-[#060910] border border-[#162137] p-2 rounded max-h-36 overflow-y-auto">
              <table className="w-full text-left font-mono text-[9px]">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500">
                    <th className="pb-1">Part #</th>
                    <th className="pb-1">Name</th>
                    <th className="pb-1 text-right">Qty</th>
                    <th className="pb-1">Material</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 text-slate-300">
                  {drawing.relatedBOM.map((item) => (
                    <tr key={item.partNumber}>
                      <td className="py-1 font-semibold text-cyan-400">{item.partNumber}</td>
                      <td className="py-1 text-slate-400 truncate max-w-[90px]">{item.name}</td>
                      <td className="py-1 text-right font-bold text-slate-200">{item.quantity} {item.unit}</td>
                      <td className="py-1 text-slate-500 text-[8px]">{item.material || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Operations Panel */}
      <div className="pt-3.5 border-t border-[#131E31] flex items-center justify-between gap-2 flex-wrap">
        {/* State transitions (Draft/Released) */}
        {activeRole === 'Lead Engineer' && (
          <div className="flex items-center gap-1">
            {drawing.status !== 'Released' ? (
              <button
                onClick={(e) => handleStatusChange(e, 'Released')}
                className="bg-emerald-950/40 text-emerald-400 text-[9px] font-mono px-2 py-1 rounded border border-emerald-800/40 hover:bg-emerald-900/40 hover:text-white"
              >
                Release
              </button>
            ) : (
              <button
                onClick={(e) => handleStatusChange(e, 'Draft')}
                className="bg-slate-900 text-slate-400 text-[9px] font-mono px-2 py-1 rounded border border-slate-800 hover:bg-slate-800"
              >
                Revert Draft
              </button>
            )}
          </div>
        )}

        {/* Quality Controls */}
        {canApprove && drawing.approvalStatus !== 'Approved' && (
          <div className="flex items-center gap-1.5 ml-auto">
            <button
              onClick={(e) => handleApprovalChange(e, 'Approved')}
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-sans font-bold text-[10px] px-2.5 py-1 rounded flex items-center gap-1 transition-colors"
            >
              <FileCheck className="w-3 h-3" />
              <span>Approve</span>
            </button>
            <button
              onClick={(e) => handleApprovalChange(e, 'Rejected')}
              className="bg-rose-500/15 hover:bg-rose-500/25 border border-rose-800/40 text-rose-400 font-sans font-bold text-[10px] px-2.5 py-1 rounded transition-colors"
            >
              Reject
            </button>
          </div>
        )}

        {/* Purge button (Lead Engineer only) */}
        {activeRole === 'Lead Engineer' && onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1.5 bg-slate-950 border border-slate-900 rounded hover:bg-rose-950/20 hover:border-rose-900/40 hover:text-rose-400 text-slate-600 ml-auto transition-colors"
            title="Delete Drawing"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {isActiveWorkspaceDrawing && (
        <div className="absolute -top-1.5 left-4 bg-cyan-500 text-slate-950 text-[8px] font-mono font-bold tracking-widest px-2.5 py-0.5 rounded uppercase">
          ACTIVE DESIGN MATRIX Context
        </div>
      )}
    </div>
  );
};

import React from 'react';
import {
  FileText,
  FileSpreadsheet,
  FileCode,
  Tag,
  User,
  Shield,
  FolderDot,
  Globe,
  Lock,
  Users,
  Eye,
  ArrowUpRight,
} from 'lucide-react';
import { KnowledgeObject } from '../../backend/knowledge/types';
import { DSBadge } from '../design-system/DSStatus';

interface KnowledgeCardProps {
  object: KnowledgeObject;
  onSelect: (object: KnowledgeObject) => void;
  isSelected?: boolean;
}

export const KnowledgeCard: React.FC<KnowledgeCardProps> = ({
  object,
  onSelect,
  isSelected = false,
}) => {
  // Map types to icons
  const getIcon = () => {
    switch (object.type) {
      case 'pdf':
      case 'word':
        return <FileText className="w-4 h-4 text-emerald-400" />;
      case 'excel':
        return <FileSpreadsheet className="w-4 h-4 text-cyan-400" />;
      case 'cad_metadata':
        return <FileCode className="w-4 h-4 text-blue-400" />;
      case 'engineering_notes':
      case 'packaging_notes':
      case 'meeting_notes':
        return <FileText className="w-4 h-4 text-amber-400" />;
      default:
        return <FileText className="w-4 h-4 text-slate-400" />;
    }
  };

  // Map visibility to badges & icons
  const getVisibilityIcon = () => {
    switch (object.permissions.visibility) {
      case 'Public':
        return <Globe className="w-3.5 h-3.5 text-emerald-400" />;
      case 'Organization':
        return <Users className="w-3.5 h-3.5 text-cyan-400" />;
      case 'Shared':
        return <Eye className="w-3.5 h-3.5 text-amber-400" />;
      case 'Private':
        return <Lock className="w-3.5 h-3.5 text-rose-400" />;
    }
  };

  return (
    <div
      id={`kb-card-${object.id}`}
      onClick={() => onSelect(object)}
      className={`group relative p-4 border rounded-sm transition-all duration-200 cursor-pointer text-left ${
        isSelected
          ? 'border-cyan-500 bg-slate-900/60 shadow-lg shadow-cyan-950/10'
          : 'border-slate-900 bg-slate-950/30 hover:border-slate-800 hover:bg-slate-950/70'
      }`}
    >
      {/* Upper Accents / Category Indicator */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5">
          <div className="p-1 bg-slate-900 border border-slate-800 rounded-xs">
            {getIcon()}
          </div>
          <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">
            {object.category}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span title={`Visibility: ${object.permissions.visibility}`}>
            {getVisibilityIcon()}
          </span>
          <DSBadge variant="outline" color={object.status === 'Published' ? 'emerald' : 'amber'}>
            v{object.version}
          </DSBadge>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-xs font-bold text-slate-100 group-hover:text-cyan-400 transition-colors line-clamp-1 mb-1 font-sans flex items-center justify-between">
        <span>{object.title}</span>
        <ArrowUpRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-500 opacity-0 group-hover:opacity-100 transition-all shrink-0 ml-1" />
      </h3>

      {/* Description */}
      <p className="text-[11px] text-slate-400 leading-normal line-clamp-2 mb-4 font-sans">
        {object.description}
      </p>

      {/* Footer statistics / Owners */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-900/50 font-mono text-[9px] text-slate-500">
        <div className="flex items-center gap-1.5 truncate max-w-[140px]" title={`Owner: ${object.owner}`}>
          <User className="w-3 h-3 text-slate-600 shrink-0" />
          <span className="truncate">{object.owner}</span>
        </div>

        {object.project && (
          <div className="flex items-center gap-1.5 truncate max-w-[140px]" title={`Project: ${object.project}`}>
            <FolderDot className="w-3 h-3 text-slate-600 shrink-0" />
            <span className="truncate text-cyan-400/80 font-bold">{object.project}</span>
          </div>
        )}
      </div>

      {/* Tag list */}
      {object.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {object.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-0.5 px-1 py-0.2 bg-slate-900/50 text-[8px] font-mono text-slate-400 border border-slate-800/40 rounded-xs"
            >
              <Tag className="w-2 h-2 text-slate-600" />
              {tag}
            </span>
          ))}
          {object.tags.length > 3 && (
            <span className="px-1 py-0.2 bg-slate-900/50 text-[8px] font-mono text-slate-500 border border-slate-800/40 rounded-xs">
              +{object.tags.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { PackagingProject } from '../../backend/packaging/types';
import { Box, Layers, Shield, Sparkles, Scale, ExternalLink, Star } from 'lucide-react';

interface PackagingProjectCardProps {
  project: PackagingProject;
  onSelect: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  isStarred: boolean;
}

export const PackagingProjectCard: React.FC<PackagingProjectCardProps> = ({
  project,
  onSelect,
  onToggleFavorite,
  isStarred
}) => {
  return (
    <div
      onClick={() => onSelect(project.id)}
      className="bg-[#0C111E]/80 hover:bg-[#0C111E] border border-slate-900 hover:border-cyan-900/40 rounded-lg p-5 transition-all duration-200 cursor-pointer shadow-md flex flex-col justify-between group relative"
    >
      {/* Favorite Button Overlay */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(project.id);
        }}
        className={`absolute top-4 right-4 p-1.5 rounded bg-slate-950/40 border border-slate-900/50 transition ${
          isStarred ? 'text-amber-400' : 'text-slate-600 hover:text-slate-300'
        }`}
        title="Favorite"
      >
        <Star className="w-3.5 h-3.5 fill-current" />
      </button>

      <div>
        {/* Header Metadata */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-mono text-cyan-400 font-semibold tracking-wide">
            {project.projectNumber}
          </span>
          <span className="text-slate-600 font-mono text-[9px]">R{project.revision}</span>
          <span className={`px-1.5 py-0.5 text-[8px] font-mono rounded uppercase ${
            project.approvalStatus === 'Approved' ? 'bg-emerald-500/10 text-emerald-400' :
            project.approvalStatus === 'In Review' ? 'bg-amber-500/10 text-amber-400' :
            project.approvalStatus === 'Rejected' ? 'bg-rose-500/10 text-rose-400' :
            'bg-slate-900 text-slate-500'
          }`}>
            {project.approvalStatus}
          </span>
        </div>

        {/* Project Name and Customer */}
        <h3 className="text-xs font-bold text-slate-200 group-hover:text-cyan-400 transition-colors duration-200 truncate pr-6">
          {project.projectName}
        </h3>
        <p className="text-[10px] text-slate-500 mt-1">
          Customer: <span className="text-slate-400 font-sans font-medium">{project.customerName}</span>
        </p>

        {/* Physical specifications badge panel */}
        <div className="grid grid-cols-2 gap-2 my-4">
          <div className="bg-slate-950/30 border border-slate-900/40 p-2 rounded">
            <div className="flex items-center gap-1 text-[9px] text-slate-500 uppercase font-mono">
              <Box className="w-3 h-3 text-cyan-500" />
              <span>Dimensions</span>
            </div>
            {project.dimensionsOuter ? (
              <span className="text-[11px] font-mono text-slate-300 block mt-1">
                {project.dimensionsOuter.length}×{project.dimensionsOuter.width}×{project.dimensionsOuter.height} <span className="text-[9px] text-slate-500">{project.dimensionsOuter.unit}</span>
              </span>
            ) : (
              <span className="text-[10px] text-slate-600 block mt-1">Undefined</span>
            )}
          </div>

          <div className="bg-slate-950/30 border border-slate-900/40 p-2 rounded">
            <div className="flex items-center gap-1 text-[9px] text-slate-500 uppercase font-mono">
              <Scale className="w-3 h-3 text-emerald-500" />
              <span>Weight Rating</span>
            </div>
            <span className="text-[11px] font-mono text-slate-300 block mt-1">
              {project.weightCapacityKg !== undefined ? `${project.weightCapacityKg} kg` : 'N/A'}
            </span>
          </div>
        </div>

        {/* Dunnage Spec if exists */}
        {project.dunnageSpecs && (
          <div className="bg-slate-950/20 border border-slate-900/20 p-2 rounded text-[10px] space-y-1 mt-2 mb-4">
            <div className="flex items-center gap-1 font-mono text-[9px] text-slate-500 uppercase">
              <Layers className="w-3 h-3 text-indigo-400" />
              <span>Dunnage Cavity Config</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Material:</span>
              <span className="text-slate-300 font-mono">{project.dunnageSpecs.materialCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Cavities:</span>
              <span className="text-slate-300 font-mono">{project.dunnageSpecs.customCavities} Pockets</span>
            </div>
          </div>
        )}

        {/* Linked Engineering Blueprints references */}
        {project.drawingRefs.length > 0 && (
          <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-mono">
            <ExternalLink className="w-3 h-3 text-cyan-500" />
            <span>Links: </span>
            {project.drawingRefs.map(ref => (
              <span key={ref} className="text-cyan-400 font-semibold bg-cyan-950/40 border border-cyan-900/30 px-1 py-0.2 rounded">
                {ref}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3.5 border-t border-slate-900/50 flex items-center justify-between text-[10px]">
        <span className="text-slate-500 font-mono">Type: {project.packagingType}</span>
        <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono ${
          project.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' :
          project.status === 'In Review' ? 'bg-amber-500/10 text-amber-400' :
          'bg-slate-900 text-slate-500'
        }`}>
          {project.status}
        </span>
      </div>
    </div>
  );
};

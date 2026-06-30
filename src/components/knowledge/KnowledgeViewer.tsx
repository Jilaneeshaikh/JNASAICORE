import React from 'react';
import {
  FileText,
  User,
  Calendar,
  Layers,
  FolderOpen,
  Share2,
  Lock,
  Globe,
  Users,
  Eye,
  Tag,
  Boxes,
  Compass,
  FileCheck,
  ShieldCheck,
  Hash,
} from 'lucide-react';
import { KnowledgeObject } from '../../backend/knowledge/types';
import { registry } from '../../backend/knowledge/registry';
import { DSBadge } from '../design-system/DSStatus';
import { DSButton } from '../design-system/DSButton';

interface KnowledgeViewerProps {
  object: KnowledgeObject;
  onClose?: () => void;
  onNavigateToObject: (object: KnowledgeObject) => void;
}

export const KnowledgeViewer: React.FC<KnowledgeViewerProps> = ({
  object,
  onClose,
  onNavigateToObject,
}) => {
  // Fetch relationships for this object
  const related = registry.getRelatedObjects(object.id);

  // Formatting visibility tags
  const getVisibilityBadge = () => {
    switch (object.permissions.visibility) {
      case 'Public':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950/20 text-emerald-400 border border-emerald-900/40 font-mono text-[10px] uppercase font-bold">
            <Globe className="w-3.5 h-3.5" /> Public Access
          </span>
        );
      case 'Organization':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-cyan-950/20 text-cyan-400 border border-cyan-900/40 font-mono text-[10px] uppercase font-bold">
            <Users className="w-3.5 h-3.5" /> Organization Only
          </span>
        );
      case 'Shared':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-950/20 text-amber-400 border border-amber-900/40 font-mono text-[10px] uppercase font-bold">
            <Eye className="w-3.5 h-3.5" /> Shared Workspace
          </span>
        );
      case 'Private':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-950/20 text-rose-400 border border-rose-900/40 font-mono text-[10px] uppercase font-bold">
            <Lock className="w-3.5 h-3.5" /> Private Vault
          </span>
        );
    }
  };

  // Human readable relationship descriptions
  const getRelationshipTypeLabel = (type: string) => {
    return type.replace(/_/g, ' ');
  };

  return (
    <div className="border border-slate-900 bg-slate-950/80 rounded-sm h-full flex flex-col font-sans overflow-hidden">
      {/* 1. Breadcrumb Header */}
      <div className="px-5 py-3 border-b border-slate-900 bg-slate-950 flex items-center justify-between text-[10px] font-mono text-slate-500">
        <div className="flex items-center gap-1 truncate max-w-lg">
          <Compass className="w-3.5 h-3.5 text-slate-600" />
          <span>KNOWLEDGE BASE</span>
          <span>/</span>
          <span className="text-slate-400 uppercase">{object.category}</span>
          <span>/</span>
          <span className="text-cyan-400 truncate font-semibold uppercase">{object.id}</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 font-mono text-xs cursor-pointer px-1.5 py-0.5 hover:bg-slate-900/50 rounded"
          >
            [CLOSE]
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* 2. Main Identity */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <DSBadge variant="outline" color="cyan">
              {object.type.toUpperCase()}
            </DSBadge>
            <DSBadge variant="solid" color={object.status === 'Published' ? 'emerald' : 'slate'}>
              {object.status}
            </DSBadge>
            <span className="font-mono text-[10px] text-slate-500">VERSION {object.version}</span>
          </div>

          <h2 className="text-base font-bold tracking-tight text-slate-100 font-sans leading-snug">
            {object.title}
          </h2>

          <p className="text-xs text-slate-400 leading-relaxed font-sans bg-slate-950 p-3 border border-slate-900 rounded-sm">
            {object.description}
          </p>
        </div>

        {/* 3. Security Clearances & Access Policies */}
        <div className="space-y-2.5">
          <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-500" /> Security Clearances
          </h4>
          <div className="p-3 border border-slate-900/80 bg-slate-950/40 rounded-sm space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[10px] font-mono">VISIBILITY DIRECTIVE</span>
              {getVisibilityBadge()}
            </div>
            {object.permissions.allowedRoles.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-900/40 items-center">
                <span className="text-[9px] font-mono text-slate-500 uppercase mr-1">AUTHORIZED ROLES:</span>
                {object.permissions.allowedRoles.map((role) => (
                  <span
                    key={role}
                    className="px-1.5 py-0.2 bg-slate-900 border border-slate-800 text-[9px] font-mono text-slate-400 rounded-xs uppercase"
                  >
                    {role.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 4. Relationship Ecosystem Mappings */}
        <div className="space-y-2.5">
          <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Boxes className="w-3.5 h-3.5 text-amber-500" /> Relational Ecosystem
          </h4>
          {related.length > 0 ? (
            <div className="grid grid-cols-1 gap-2">
              {related.map(({ relation, object: otherObj }) => (
                <div
                  key={`${relation.sourceId}-${relation.targetId}`}
                  onClick={() => onNavigateToObject(otherObj)}
                  className="p-2.5 bg-slate-950/50 border border-slate-900 hover:border-slate-800 rounded-sm group cursor-pointer transition-colors"
                >
                  <div className="flex justify-between items-center gap-2 mb-1 text-[10px] font-mono">
                    <span className="text-cyan-400 group-hover:underline font-bold truncate">
                      {otherObj.title}
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-amber-950/20 text-amber-500 border border-amber-900/40 text-[8px] uppercase tracking-wider font-bold shrink-0">
                      {getRelationshipTypeLabel(relation.relationshipType)}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal line-clamp-1">
                    {relation.description}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 bg-slate-950/20 border border-slate-900 border-dashed rounded-sm text-center">
              <span className="text-[10px] text-slate-500 font-mono italic">No relational couplings mapped in current index database.</span>
            </div>
          )}
        </div>

        {/* 5. Document Metadata Key-Value Schema */}
        <div className="space-y-2.5">
          <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-500" /> Document Metadata Grid
          </h4>
          <div className="grid grid-cols-2 gap-2 bg-slate-950 border border-slate-900 p-3 rounded-sm font-mono text-[10px]">
            <div className="space-y-1">
              <span className="text-slate-500 text-[9px] uppercase">ORIGIN STREAM</span>
              <div className="text-slate-300 truncate">{object.source}</div>
            </div>
            <div className="space-y-1">
              <span className="text-slate-500 text-[9px] uppercase">WORKSPACE NODE</span>
              <div className="text-slate-300 truncate">{object.workspace}</div>
            </div>
            <div className="space-y-1 mt-2 border-t border-slate-900 pt-2 col-span-2">
              <span className="text-slate-500 text-[9px] uppercase">CUSTOM ATTRIBUTE SCHEMAS</span>
              <div className="grid grid-cols-2 gap-1.5 mt-1.5 text-slate-400 bg-slate-950/80 p-2 border border-slate-900 rounded-sm">
                {Object.entries(object.metadata).map(([key, value]) => (
                  <div key={key} className="flex flex-col gap-0.5 border-b border-slate-900/30 pb-1">
                    <span className="text-slate-600 text-[8px] uppercase font-bold">{key.replace(/([A-Z])/g, '_$1')}</span>
                    <span className="text-[10px] text-cyan-400 truncate">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 6. Secure Viewer Workspace Placeholder */}
        <div className="space-y-2.5">
          <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <FileCheck className="w-3.5 h-3.5 text-emerald-500" /> Secure Sandbox Preview Panel
          </h4>
          <div className="border border-slate-900 bg-slate-950 rounded-sm overflow-hidden">
            <div className="bg-slate-900/40 px-3 py-1.5 border-b border-slate-900 flex justify-between items-center text-[9px] font-mono">
              <span className="text-slate-400 font-bold uppercase flex items-center gap-1">
                <Hash className="w-3 h-3 text-slate-600" /> RAW_PAYLOAD_BUFFER
              </span>
              <span className="text-slate-500 text-[8px]">READONLY // ENCRYPTED</span>
            </div>
            <div className="p-4 font-mono text-[10px] text-slate-400 leading-normal space-y-2 select-text bg-slate-950">
              <p className="text-slate-500 italic">
                // Simulating payload view context parsing bounds...
              </p>
              <div className="p-3 border border-slate-900/60 bg-slate-950/40 rounded text-slate-300 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                {`[HEADER] OBJECT_ID: ${object.id}\n[VERSION] BUILD_REF: ${object.version}\n[AUTHOR] KEY_SIGN: ${object.owner}\n\n[SUBSTANCE_LOG]\n---\n`}
                {object.type === 'cad_metadata' && (
                  `- Dynamic stress thresholds verified up to ${object.metadata.maxPressurePsi || 'N/A'} PSI.\n- Material structure conforms strictly to specified Titanium Grade 5 standards.\n- Mechanical micro-tolerances are set at standard ${object.metadata.tolerancesMm || 'N/A'} mm intervals.\n- Model hash sum matches SHA checksum signatures perfectly.`
                )}
                {object.type === 'packaging_notes' && (
                  `- Corrugated layers meet exact heavy-transit thresholds (${object.metadata.thicknessMm || 'N/A'}mm).\n- Direct burst ratings exceed ${object.metadata.burstTestRatingPsi || 'N/A'} PSI load indices.\n- Cardboard composite is certified biodegradable (${object.metadata.recycleRatingPercentage || 'N/A'}% recyclable).\n- Tested weight loads of ${object.metadata.maxLoadWeightKg || 'N/A'} kg verified.`
                )}
                {object.type === 'word' && (
                  `- Agreement SLA guarantees critical client response time within ${object.metadata.slaResponseTimeHours || 'N/A'} hours.\n- Account valuation contract locked in at $${object.metadata.contractValueUsd?.toLocaleString() || 'N/A'} USD.\n- Key stakeholders have finalized delivery timelines.`
                )}
                {object.type === 'pdf' && (
                  `- Certified compliance curriculum covers key OSHA compliance code indices.\n- Passing score metric established at ${object.metadata.passingScorePercentage || 'N/A'}%.\n- Certification lifecycle validates for exactly ${object.metadata.validityYears || 'N/A'} years.`
                )}
                {object.type === 'project_documents' && (
                  `- Program budget boundary secured at $${object.metadata.budgetCapUsd?.toLocaleString() || 'N/A'} USD.\n- Project divided into ${object.metadata.phaseCount || 'N/A'} active phases.\n- Delivery target schedule locked at ${object.metadata.completionDeadline || 'N/A'}.`
                )}
                {object.type === 'engineering_notes' && (
                  `- Interconnect standards require standard thread configurations (${object.metadata.couplingThreadStandard || 'N/A'}).\n- Safety factor margin configured at ${object.metadata.safetyFactorRating || 'N/A'}x overpressure constraints.\n- Structural couplings verify perfectly against nominal pressures.`
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 7. Action Footer */}
      <div className="p-4 border-t border-slate-900 bg-slate-950 flex flex-wrap gap-2 justify-end">
        <span className="text-[10px] font-mono text-slate-500 mr-auto self-center flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" /> Updated: {new Date(object.updatedAt).toLocaleDateString()}
        </span>
        <DSButton
          size="sm"
          variant="outline"
          leftIcon={<Share2 className="w-3.5 h-3.5 text-slate-400" />}
          onClick={() => {
            alert(`Relational coupling link copied: ${window.location.origin}/kms/view/${object.id}`);
          }}
        >
          Share Coupling URL
        </DSButton>
      </div>
    </div>
  );
};

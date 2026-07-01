import React, { useState } from 'react';
import {
  Layers,
  Calendar,
  Users,
  DollarSign,
  Briefcase,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Percent
} from 'lucide-react';
import { EngineeringProjectDetails, SubProject, EngineeringMilestone } from '../../backend/engineering/types';
import { EngineeringRegistry } from '../../backend/engineering/registry';
import { ProjectRegistry } from '../../backend/projects/registry';
import { DSBadge } from '../design-system/DSStatus';

interface ProjectExplorerProps {
  onUpdate: () => void;
}

export const ProjectExplorer: React.FC<ProjectExplorerProps> = ({ onUpdate }) => {
  const registry = EngineeringRegistry.getInstance();
  const projectRegistry = ProjectRegistry.getInstance();

  const allProjects = projectRegistry.getProjects();
  const [selectedProjId, setSelectedProjId] = useState(allProjects[0]?.id || '');

  const projectDetails = selectedProjId ? registry.getProjectDetails(selectedProjId) : null;
  const projectModel = selectedProjId ? projectRegistry.getProject(selectedProjId) : null;

  const handleActiveProjectChange = (id: string) => {
    setSelectedProjId(id);
    localStorage.setItem('jnas-active-project-id', id);
    registry.addAuditLog('Project Target Changed', id, 'Project', `Changed active engineering project target to ${id}`);
    onUpdate();
  };

  const calculatePercentage = (spent: number, allocated: number) => {
    if (allocated === 0) return 0;
    return Math.min(100, Math.round((spent / allocated) * 100));
  };

  return (
    <div className="space-y-4">
      {/* Project Selector bar */}
      <div className="bg-[#0A0D16] border border-[#141F33] p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-cyan-400" />
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
              Active Engineering Project Context
            </h3>
            <p className="text-[10px] text-slate-400 font-sans mt-0.5">
              Select an active master project to inspect nested sub-systems, financial budgets, and QA gates.
            </p>
          </div>
        </div>

        <select
          value={selectedProjId}
          onChange={(e) => handleActiveProjectChange(e.target.value)}
          className="bg-[#070B14] border border-[#1B2945] text-slate-200 text-xs rounded-md px-3 py-2 font-medium focus:outline-none focus:ring-1 focus:ring-cyan-500"
        >
          {allProjects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {projectDetails && projectModel ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Left Column: Sub-Systems and Specifications */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Nested Sub-projects */}
            <div className="bg-[#0C111E] border border-[#152033] rounded-lg p-4 space-y-3 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#141F33] pb-2">
                <h4 className="text-xs font-mono font-bold text-slate-200 uppercase flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span>Engineering Sub-Projects ({projectDetails.subProjects.length})</span>
                </h4>
                <DSBadge variant="outline" color="cyan">
                  {projectModel.status || 'Active'}
                </DSBadge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {projectDetails.subProjects.map((sub: SubProject) => (
                  <div
                    key={sub.id}
                    className="p-3 bg-[#080B13] border border-[#142036] rounded-md space-y-2 hover:border-[#1E2E4A] transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold font-mono text-cyan-400">
                        {sub.id.toUpperCase()}
                      </span>
                      <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${
                        sub.status === 'Completed' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/20' :
                        sub.status === 'Active' ? 'bg-cyan-950/40 text-cyan-400 border border-cyan-800/20' :
                        'bg-amber-950/40 text-amber-400 border border-amber-800/20'
                      }`}>
                        {sub.status}
                      </span>
                    </div>

                    <div>
                      <h5 className="text-xs font-bold text-slate-200 font-sans">{sub.name}</h5>
                      <p className="text-[10px] text-slate-400 font-mono mt-1">Lead: {sub.leadEngineer}</p>
                    </div>

                    <div className="pt-2 border-t border-[#131D2E] flex items-center justify-between text-[9px] text-slate-500 font-mono">
                      <span>Deadline: {sub.deadline}</span>
                      <span>Est. Cost: ${sub.estimatedCost.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Engineering Milestones */}
            <div className="bg-[#0C111E] border border-[#152033] rounded-lg p-4 space-y-3 shadow-xl">
              <div className="border-b border-[#141F33] pb-2">
                <h4 className="text-xs font-mono font-bold text-slate-200 uppercase flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  <span>Ecosystem Design Milestones & Gates</span>
                </h4>
              </div>

              <div className="space-y-2">
                {projectDetails.milestones.map((ms: EngineeringMilestone) => {
                  const percent = ms.status === 'Achieved' ? 100 : ms.status === 'In Progress' ? 60 : ms.status === 'Scheduled' ? 20 : 0;
                  return (
                    <div
                      key={ms.id}
                      className="p-3 bg-[#080B13] border border-[#142036] rounded-md flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-[#1E2E4A] transition-all"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="mt-0.5">
                          {ms.status === 'Achieved' ? (
                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                          ) : ms.status === 'In Progress' ? (
                            <Clock className="w-4 h-4 text-cyan-400 animate-pulse" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-amber-400" />
                          )}
                        </div>

                        <div>
                          <h5 className="text-xs font-bold text-slate-200 font-sans">{ms.title}</h5>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-right font-mono text-[10px]">
                        <div>
                          <div className="text-slate-500">Target Date</div>
                          <div className="text-slate-300 font-semibold">{ms.targetDate}</div>
                        </div>

                        <div className="w-24">
                          <div className="flex justify-between text-[8px] text-slate-500 mb-0.5">
                            <span>Stage</span>
                            <span>{percent}%</span>
                          </div>
                          <div className="w-full bg-[#111827] h-1.5 rounded-full overflow-hidden border border-[#1B2945]">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                ms.status === 'Achieved' ? 'bg-emerald-500' :
                                ms.status === 'In Progress' ? 'bg-cyan-500' : 'bg-amber-500'
                              }`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Column: Budgets & Assigned Multi-Disciplinary Team */}
          <div className="space-y-4">
            
            {/* Financial Health Tracker */}
            <div className="bg-[#0C111E] border border-[#152033] rounded-lg p-4 space-y-3 shadow-xl">
              <div className="border-b border-[#141F33] pb-2">
                <h4 className="text-xs font-mono font-bold text-slate-200 uppercase flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-cyan-400" />
                  <span>Financial Stress Matrix</span>
                </h4>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-mono">Allocated Budget:</span>
                  <span className="text-xs font-bold font-mono text-slate-100">
                    {projectDetails.budget.currency} {projectDetails.budget.allocated.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-mono">Current Burn:</span>
                  <span className="text-xs font-bold font-mono text-cyan-400">
                    {projectDetails.budget.currency} {projectDetails.budget.spent.toLocaleString()}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-slate-500">Utilization Rate</span>
                    <span className="text-cyan-400 font-bold">
                      {calculatePercentage(projectDetails.budget.spent, projectDetails.budget.allocated)}%
                    </span>
                  </div>
                  <div className="w-full bg-[#080B13] h-2.5 rounded-full overflow-hidden border border-[#1C2C46]">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${calculatePercentage(projectDetails.budget.spent, projectDetails.budget.allocated)}%` }}
                    />
                  </div>
                </div>

                <p className="text-[9px] text-slate-500 italic font-sans leading-normal">
                  * Budgets are mapped dynamically against task status, components pricing, and physical fabrication material logs.
                </p>
              </div>
            </div>

            {/* Assigned Project Team */}
            <div className="bg-[#0C111E] border border-[#152033] rounded-lg p-4 space-y-3 shadow-xl">
              <div className="border-b border-[#141F33] pb-2">
                <h4 className="text-xs font-mono font-bold text-slate-200 uppercase flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-cyan-400" />
                  <span>Multi-Disciplinary Team</span>
                </h4>
              </div>

              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {projectDetails.team.map((member) => (
                  <div
                    key={member.userId}
                    className="flex items-center justify-between p-2 bg-[#080B13] border border-[#142036] rounded-md hover:border-[#1E2E4A] transition-all"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-200 font-sans">{member.name}</div>
                      <div className="text-[9px] text-slate-400 font-mono mt-0.5">{member.role}</div>
                    </div>

                    <div className="text-right">
                      <span className="text-[9px] font-mono text-slate-500 bg-[#121929] px-2 py-0.5 rounded border border-[#1B2844]">
                        {member.department}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      ) : (
        <div className="p-12 border border-dashed border-slate-800 bg-[#0B0E17]/30 rounded-lg text-center text-slate-400 text-xs font-mono">
          No engineering details configured for the selected project master ledger.
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { 
  ValidationRule, 
  ValidationRun, 
  ValidationResult, 
  PackagingDesign, 
  ValidationRuleCategory, 
  ValidationSeverity, 
  ValidationStatus 
} from '../../backend/packaging/types';
import { packagingRegistry } from '../../backend/packaging/registry';
import { 
  ShieldAlert, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Play, 
  Sparkles, 
  FileText, 
  Plus, 
  Trash2, 
  Filter, 
  Search, 
  Clock, 
  User, 
  Settings, 
  ChevronRight, 
  Info,
  Layers,
  ArrowRight,
  PlusCircle,
  FileCode,
  XCircle,
  Bookmark,
  Share2
} from 'lucide-react';
import { eventBus } from '../../core';

interface PackagingValidationWorkspaceProps {
  designs: PackagingDesign[];
  rules: ValidationRule[];
  validationRuns: ValidationRun[];
  role: string;
  department: string;
  onRefresh: () => void;
}

export const PackagingValidationWorkspace: React.FC<PackagingValidationWorkspaceProps> = ({
  designs,
  rules,
  validationRuns,
  role,
  department,
  onRefresh
}) => {
  // Search and filter state for Rules Registry
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All');
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);

  // States for Validation workspace
  const [selectedDesignId, setSelectedDesignId] = useState<string>('');
  const [activeRun, setActiveRun] = useState<ValidationRun | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [viewingRunDetails, setViewingRunDetails] = useState<ValidationRun | null>(null);

  // Form states for creating new validation rule
  const [newRuleNum, setNewRuleNum] = useState('JNAS-RULE-00' + (rules.length + 1));
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleDesc, setNewRuleDesc] = useState('');
  const [newRuleCat, setNewRuleCat] = useState<ValidationRuleCategory>('Safety Rules');
  const [newRulePriority, setNewRulePriority] = useState<'Critical' | 'High' | 'Medium' | 'Low'>('Medium');
  const [newRuleSeverity, setNewRuleSeverity] = useState<ValidationSeverity>('Error');
  const [newRuleOwner, setNewRuleOwner] = useState('Alex Mercer');
  const [newRuleDept, setNewRuleDept] = useState('Packaging Design');
  const [newRuleStandard, setNewRuleStandard] = useState('');

  // Tab state inside Validation workspace
  const [subTab, setSubTab] = useState<'runs' | 'registry'>('runs');

  const categories: string[] = [
    'All',
    'Safety Rules',
    'Material Rules',
    'Forklift Rules',
    'Stacking Rules',
    'Ergonomic Rules',
    'Automotive Rules'
  ];

  const severities = ['All', 'Error', 'Warning', 'Recommendation'];

  const filteredRules = rules.filter(rule => {
    const matchesSearch = 
      rule.ruleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.ruleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || rule.category === selectedCategory;
    const matchesSeverity = selectedSeverity === 'All' || rule.severity === selectedSeverity;
    return matchesSearch && matchesCategory && matchesSeverity;
  });

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleName || !newRuleDesc) return;

    const formattedRuleNum = newRuleNum.startsWith('JNAS-RULE-') ? newRuleNum : `JNAS-RULE-${newRuleNum}`;

    packagingRegistry.createRule({
      ruleNumber: formattedRuleNum,
      ruleName: newRuleName,
      description: newRuleDesc,
      category: newRuleCat,
      priority: newRulePriority,
      severity: newRuleSeverity,
      owner: newRuleOwner,
      department: newRuleDept,
      revision: 'R1',
      status: 'Active',
      version: '1.0.0',
      relatedStandard: newRuleStandard || undefined,
      auditMetadata: {
        createdBy: 'jilaneeshaikh@gmail.com'
      }
    });

    // Reset states
    setNewRuleName('');
    setNewRuleDesc('');
    setNewRuleStandard('');
    setNewRuleNum('JNAS-RULE-00' + (rules.length + 2));
    setIsRuleModalOpen(false);
    onRefresh();
  };

  const handleDeleteRule = (id: string) => {
    if (window.confirm('Are you sure you want to retire this engineering rule?')) {
      packagingRegistry.deleteRule(id);
      onRefresh();
    }
  };

  const handleRunValidation = (designId: string) => {
    if (!designId) return;
    setIsValidating(true);
    setActiveRun(null);

    // Simulate precise millisecond engineering calculations
    setTimeout(() => {
      try {
        const run = packagingRegistry.executeValidation(designId);
        setActiveRun(run);
        setViewingRunDetails(run);
        onRefresh();
      } catch (err) {
        console.error(err);
      } finally {
        setIsValidating(false);
      }
    }, 1200);
  };

  const handleTransmitToAI = (run: ValidationRun) => {
    // Publish an event that the AI assistant context panel will catch
    eventBus.publish('CO_PILOT_CONTEXT_SET', {
      topic: `Design Validation: ${run.designNumber}`,
      contextText: `
Validation results for ${run.designName} (${run.designNumber}):
Executed At: ${run.executedAt}
Overall Status: ${run.overallStatus}
Executed By: ${run.executedBy}

Detailed Results:
${run.results.map(r => `
- Rule: ${r.ruleNumber} (${r.ruleName})
  Category: ${r.category}
  Severity: ${r.severity}
  Status: ${r.status}
  Details: ${r.message}
  Recommendation: ${r.recommendationPlaceholder}
`).join('\n')}
      `
    }, { emitter: 'ValidationWorkspace' });

    // Switch tab to design workspace to interact with Co-pilot, or show a beautiful banner
    alert(`Validation run dataset has been successfully serialized and injected into the AI Co-Pilot system prompt context.`);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-130px)] bg-[#070B13] overflow-y-auto">
      {/* Tab bar header */}
      <div className="bg-[#090D1A] border-b border-slate-900 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setSubTab('runs')}
            className={`text-xs font-mono font-bold tracking-wider uppercase pb-1 border-b-2 transition-all ${
              subTab === 'runs' 
                ? 'border-cyan-400 text-cyan-400' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Validation Engine workspace
          </button>
          <button 
            onClick={() => setSubTab('registry')}
            className={`text-xs font-mono font-bold tracking-wider uppercase pb-1 border-b-2 transition-all ${
              subTab === 'registry' 
                ? 'border-cyan-400 text-cyan-400' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Engineering Rules Registry
          </button>
        </div>

        <div className="flex items-center gap-2">
          {subTab === 'registry' && (
            <button 
              onClick={() => setIsRuleModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-900 text-xs font-bold font-mono rounded transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Register Rule
            </button>
          )}
        </div>
      </div>

      {/* Primary Workspace Panels */}
      {subTab === 'runs' ? (
        <div className="flex flex-1 grid grid-cols-12 gap-6 p-6 overflow-hidden min-h-[500px]">
          {/* Design Selection & Run Trigger */}
          <div className="col-span-12 lg:col-span-4 bg-[#090D1A] border border-slate-900 rounded-lg p-5 flex flex-col h-fit space-y-4">
            <div>
              <h2 className="text-sm font-bold font-mono tracking-wide uppercase text-slate-200 flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                Select Design for Audit
              </h2>
              <p className="text-[11px] text-slate-500 mt-1">
                Select a physical packaging design from the registry to execute deterministic engineering rule validations.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 font-mono">ACTIVE PACKAGING DESIGN</label>
              <select 
                value={selectedDesignId}
                onChange={(e) => {
                  setSelectedDesignId(e.target.value);
                  const runs = validationRuns.filter(r => r.designId === e.target.value);
                  if (runs.length > 0) {
                    setViewingRunDetails(runs[0]);
                  } else {
                    setViewingRunDetails(null);
                  }
                }}
                className="w-full bg-[#0C1122] border border-slate-800 rounded px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 font-mono"
              >
                <option value="">-- Choose active specification --</option>
                {designs.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.designNumber} - {d.designName}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => handleRunValidation(selectedDesignId)}
              disabled={!selectedDesignId || isValidating}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded font-mono font-bold text-xs uppercase transition-all ${
                !selectedDesignId || isValidating
                  ? 'bg-slate-900 text-slate-600 cursor-not-allowed'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-950/25 animate-pulse'
              }`}
            >
              {isValidating ? (
                <>
                  <Clock className="w-4 h-4 animate-spin text-slate-950" />
                  Calculating stress vectors...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 text-slate-950" />
                  Run Rules Engine Validation
                </>
              )}
            </button>

            {/* Run History List */}
            <div className="border-t border-slate-900 pt-4 mt-2">
              <h3 className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider mb-2">
                Validation Audit History ({validationRuns.length})
              </h3>
              {validationRuns.length === 0 ? (
                <div className="text-[11px] text-slate-600 py-4 font-mono text-center bg-[#070B13]/40 rounded border border-dashed border-slate-900">
                  No historical audits recorded.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {validationRuns.map(run => (
                    <button
                      key={run.id}
                      onClick={() => setViewingRunDetails(run)}
                      className={`w-full text-left p-2.5 rounded border text-[11px] font-mono flex items-center justify-between transition-all ${
                        viewingRunDetails?.id === run.id
                          ? 'bg-cyan-950/30 border-cyan-800'
                          : 'bg-[#070B13]/50 border-slate-900 hover:bg-[#070B13] hover:border-slate-800'
                      }`}
                    >
                      <div className="space-y-0.5 max-w-[70%]">
                        <div className="text-slate-300 font-semibold truncate">{run.designName}</div>
                        <div className="text-slate-500 text-[9px]">
                          {new Date(run.executedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {run.designNumber}
                        </div>
                      </div>
                      <span className={`px-1.5 py-0.5 text-[9px] font-semibold font-mono rounded uppercase ${
                        run.overallStatus === 'Passed'
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-900'
                          : run.overallStatus === 'Failed'
                          ? 'bg-rose-950/80 text-rose-400 border border-rose-900'
                          : run.overallStatus === 'Warning'
                          ? 'bg-amber-950/80 text-amber-400 border border-amber-900'
                          : 'bg-cyan-950/80 text-cyan-400 border border-cyan-900'
                      }`}>
                        {run.overallStatus}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Detailed Audit Results */}
          <div className="col-span-12 lg:col-span-8 flex flex-col h-full space-y-4">
            {viewingRunDetails ? (
              <div className="bg-[#090D1A] border border-slate-900 rounded-lg p-6 flex flex-col h-fit space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-900 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 bg-slate-900 rounded text-cyan-400 border border-slate-800">
                        {viewingRunDetails.designNumber}
                      </span>
                      <span className="text-slate-500 text-[11px] font-mono">
                        {new Date(viewingRunDetails.executedAt).toLocaleString()}
                      </span>
                    </div>
                    <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wide font-mono">
                      {viewingRunDetails.designName}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className={`px-2.5 py-1 text-xs font-bold font-mono rounded uppercase flex items-center gap-1.5 border ${
                      viewingRunDetails.overallStatus === 'Passed'
                        ? 'bg-emerald-950/55 text-emerald-400 border-emerald-800'
                        : viewingRunDetails.overallStatus === 'Failed'
                        ? 'bg-rose-950/55 text-rose-400 border-rose-800'
                        : viewingRunDetails.overallStatus === 'Warning'
                        ? 'bg-amber-950/55 text-amber-400 border-amber-800'
                        : 'bg-cyan-950/55 text-cyan-400 border-cyan-800'
                    }`}>
                      {viewingRunDetails.overallStatus === 'Passed' && <ShieldCheck className="w-4 h-4 text-emerald-400" />}
                      {viewingRunDetails.overallStatus === 'Failed' && <ShieldAlert className="w-4 h-4 text-rose-400" />}
                      {viewingRunDetails.overallStatus === 'Warning' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                      STATUS: {viewingRunDetails.overallStatus}
                    </span>

                    <button
                      onClick={() => handleTransmitToAI(viewingRunDetails)}
                      className="flex items-center gap-1 px-2.5 py-1 bg-cyan-950/30 text-cyan-400 hover:bg-cyan-950/60 border border-cyan-900 rounded text-xs font-mono font-semibold transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Export to AI
                    </button>
                  </div>
                </div>

                {/* Rules Checklist results */}
                <div className="space-y-4">
                  <h3 className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider">
                    Faceted Rule Evaluation results
                  </h3>

                  <div className="space-y-3">
                    {viewingRunDetails.results.map((res, index) => (
                      <div 
                        key={index}
                        className={`p-4 rounded border text-xs flex flex-col md:flex-row gap-4 justify-between transition-all ${
                          res.status === 'Passed'
                            ? 'bg-emerald-950/10 border-emerald-950/40 hover:bg-emerald-950/20'
                            : res.status === 'Failed'
                            ? 'bg-rose-950/10 border-rose-950/40 hover:bg-rose-950/20'
                            : res.status === 'Warning'
                            ? 'bg-amber-950/10 border-amber-950/40 hover:bg-amber-950/20'
                            : res.status === 'Skipped'
                            ? 'bg-slate-900/40 border-slate-900/60 text-slate-500'
                            : 'bg-cyan-950/10 border-cyan-950/40 hover:bg-cyan-950/20'
                        }`}
                      >
                        <div className="space-y-2 max-w-[80%]">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono font-bold text-slate-200">
                              {res.ruleNumber}
                            </span>
                            <span className="text-slate-400 font-medium">
                              • {res.ruleName}
                            </span>
                            <span className="px-1.5 py-0.5 bg-slate-900 text-slate-500 rounded text-[9px] font-mono uppercase">
                              {res.category}
                            </span>
                          </div>

                          <p className="text-slate-300 font-sans leading-relaxed text-[11px]">
                            {res.message}
                          </p>

                          {res.recommendationPlaceholder && (
                            <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1 bg-[#05080F] p-2 rounded">
                              <Info className="w-3.5 h-3.5 text-cyan-500 flex-shrink-0" />
                              <span>{res.recommendationPlaceholder}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-row md:flex-col items-start md:items-end justify-between md:justify-center gap-2">
                          <span className={`px-2 py-0.5 text-[9px] font-bold font-mono rounded uppercase tracking-wider ${
                            res.status === 'Passed'
                              ? 'bg-emerald-950 text-emerald-400'
                              : res.status === 'Failed'
                              ? 'bg-rose-950 text-rose-400'
                              : res.status === 'Warning'
                              ? 'bg-amber-950 text-amber-400'
                              : res.status === 'Skipped'
                              ? 'bg-slate-900 text-slate-400'
                              : 'bg-cyan-950 text-cyan-400'
                          }`}>
                            {res.status}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {res.severity}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#090D1A] border border-slate-900 rounded-lg p-10 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
                <ShieldAlert className="w-10 h-10 text-slate-700 animate-pulse mb-3" />
                <h3 className="text-sm font-bold uppercase font-mono text-slate-400">No active audit session selected</h3>
                <p className="text-[11px] text-slate-600 font-mono mt-1 max-w-sm leading-relaxed">
                  Choose an active specification from the selector list on the left to review its compliance data sheet or run new audits.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Registry View */
        <div className="p-6 space-y-6">
          {/* Statistics and filters */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-[#090D1A] border border-slate-900 rounded-lg p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search rules catalog..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[#0C1122] border border-slate-800 rounded pl-9 pr-4 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 font-mono w-56 placeholder-slate-600"
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-[#0C1122] border border-slate-800 rounded px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 font-mono"
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
                ))}
              </select>

              {/* Severity Filter */}
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="bg-[#0C1122] border border-slate-800 rounded px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 font-mono"
              >
                {severities.map(s => (
                  <option key={s} value={s}>{s === 'All' ? 'All Severities' : s}</option>
                ))}
              </select>
            </div>

            <div className="text-xs font-mono text-slate-500">
              Showing <span className="text-slate-300">{filteredRules.length}</span> of {rules.length} engineering rules
            </div>
          </div>

          {/* Rules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRules.map(rule => (
              <div 
                key={rule.id}
                className="bg-[#090D1A] border border-slate-900 rounded-lg p-5 hover:border-slate-800 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 bg-slate-900 border border-slate-800 text-cyan-400 rounded">
                      {rule.ruleNumber}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className={`px-1.5 py-0.5 text-[9px] font-bold font-mono rounded ${
                        rule.severity === 'Error'
                          ? 'bg-rose-950/60 text-rose-400'
                          : rule.severity === 'Warning'
                          ? 'bg-amber-950/60 text-amber-400'
                          : 'bg-cyan-950/60 text-cyan-400'
                      }`}>
                        {rule.severity}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {rule.priority}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wide font-mono line-clamp-1">
                      {rule.ruleName}
                    </h3>
                    <span className="text-[10px] text-slate-500 font-mono block">
                      Category: {rule.category}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 font-sans leading-relaxed line-clamp-3">
                    {rule.description}
                  </p>
                </div>

                <div className="border-t border-slate-900/80 pt-3 flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <div className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-600" />
                    <span className="truncate max-w-[100px]">{rule.owner}</span>
                  </div>

                  {rule.relatedStandard && (
                    <span className="text-cyan-500/85">
                      Ref: {rule.relatedStandard}
                    </span>
                  )}

                  <button 
                    onClick={() => handleDeleteRule(rule.id)}
                    className="text-rose-500/60 hover:text-rose-400 transition-all"
                    title="Retire Rule"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {filteredRules.length === 0 && (
              <div className="col-span-full bg-[#090D1A] border border-slate-900 rounded-lg p-12 text-center flex flex-col items-center justify-center">
                <ShieldAlert className="w-8 h-8 text-slate-700 mb-2 animate-pulse" />
                <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider">No matching rules found</h4>
                <p className="text-[11px] text-slate-600 font-mono mt-1">Adjust search filter criteria or register a new standard engineering rule.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATE NEW RULE MODAL */}
      {isRuleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#0C1120] border border-slate-900 rounded-lg p-6 shadow-2xl relative">
            <h3 className="text-sm font-bold text-slate-100 uppercase font-mono tracking-wider mb-4 flex items-center gap-1.5">
              <PlusCircle className="w-4 h-4 text-cyan-400" />
              Register Engineering Rule
            </h3>

            <form onSubmit={handleCreateRule} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-500 block font-mono">RULE NUMBER *</label>
                  <input
                    type="text"
                    required
                    value={newRuleNum}
                    onChange={(e) => setNewRuleNum(e.target.value)}
                    placeholder="e.g. JNAS-RULE-007"
                    className="w-full bg-[#090D1A] border border-slate-800 rounded px-3 py-2 text-slate-300 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 block font-mono">RULE NAME *</label>
                  <input
                    type="text"
                    required
                    value={newRuleName}
                    onChange={(e) => setNewRuleName(e.target.value)}
                    placeholder="e.g. Heavy Cushion Set Limit"
                    className="w-full bg-[#090D1A] border border-slate-800 rounded px-3 py-2 text-slate-300 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 block font-mono">RULE DESCRIPTION *</label>
                <textarea
                  required
                  rows={3}
                  value={newRuleDesc}
                  onChange={(e) => setNewRuleDesc(e.target.value)}
                  placeholder="Explain exactly what the engine must validate and look for..."
                  className="w-full bg-[#090D1A] border border-slate-800 rounded px-3 py-2 text-slate-300 focus:outline-none focus:border-cyan-500 font-mono resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-500 block font-mono">RULE CATEGORY</label>
                  <select
                    value={newRuleCat}
                    onChange={(e) => setNewRuleCat(e.target.value as ValidationRuleCategory)}
                    className="w-full bg-[#090D1A] border border-slate-800 rounded px-3 py-2 text-slate-300 focus:outline-none focus:border-cyan-500 font-mono"
                  >
                    <option value="Safety Rules">Safety Rules</option>
                    <option value="Material Rules">Material Rules</option>
                    <option value="Forklift Rules">Forklift Rules</option>
                    <option value="Stacking Rules">Stacking Rules</option>
                    <option value="Ergonomic Rules">Ergonomic Rules</option>
                    <option value="Automotive Rules">Automotive Rules</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500 block font-mono">SEVERITY LEVEL</label>
                  <select
                    value={newRuleSeverity}
                    onChange={(e) => setNewRuleSeverity(e.target.value as ValidationSeverity)}
                    className="w-full bg-[#090D1A] border border-slate-800 rounded px-3 py-2 text-slate-300 focus:outline-none focus:border-cyan-500 font-mono"
                  >
                    <option value="Error">Error</option>
                    <option value="Warning">Warning</option>
                    <option value="Recommendation">Recommendation</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-500 block font-mono">RELATED STANDARD (REF)</label>
                  <input
                    type="text"
                    value={newRuleStandard}
                    onChange={(e) => setNewRuleStandard(e.target.value)}
                    placeholder="e.g. ASTM-D642"
                    className="w-full bg-[#090D1A] border border-slate-800 rounded px-3 py-2 text-slate-300 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500 block font-mono">PRIORITY LEVEL</label>
                  <select
                    value={newRulePriority}
                    onChange={(e) => setNewRulePriority(e.target.value as any)}
                    className="w-full bg-[#090D1A] border border-slate-800 rounded px-3 py-2 text-slate-300 focus:outline-none focus:border-cyan-500 font-mono"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-900 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsRuleModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-slate-200 font-mono transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold font-mono rounded transition-all"
                >
                  Submit Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

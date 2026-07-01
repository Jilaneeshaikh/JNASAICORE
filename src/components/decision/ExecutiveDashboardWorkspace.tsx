import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Plus, 
  Share2, 
  FileText, 
  Sliders, 
  Shield, 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  Database, 
  Cpu, 
  RefreshCw, 
  Star, 
  PlusCircle, 
  Download, 
  ChevronRight, 
  Info, 
  Calendar, 
  Users,
  Eye,
  HelpCircle,
  FileSpreadsheet,
  Workflow,
  Sparkles,
  Layers,
  Box,
  Terminal,
  SlidersHorizontal,
  Clock,
  Briefcase
} from 'lucide-react';
import { decisionRegistry } from '../../backend/decision/registry';
import { contextBuilder } from '../../backend/ai/contextBuilder';
import { KPI, Dashboard, AnalyticsMetric, Widget, DecisionAuditLog, DecisionRole } from '../../backend/decision/types';
import { useNotification } from '../../contexts/NotificationContext';
import { useSettings } from '../../contexts/SettingsContext';
import { useAuth } from '../../contexts/AuthContext';
import { eventBus } from '../../core';
import { motion, AnimatePresence } from 'motion/react';

interface ExecutiveDashboardWorkspaceProps {
  onRefreshGlobalBadges?: () => void;
}

export const ExecutiveDashboardWorkspace: React.FC<ExecutiveDashboardWorkspaceProps> = ({ onRefreshGlobalBadges }) => {
  const { triggerToast } = useNotification();
  const { settings } = useSettings();
  const { user } = useAuth();

  // Primary State from Registries
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsMetric[]>([]);
  const [auditLogs, setAuditLogs] = useState<DecisionAuditLog[]>([]);
  const [activeDashboardId, setActiveDashboardId] = useState<string>('db-executive-summary');

  // Role & Department states
  const [role, setRole] = useState<DecisionRole>('Executive');
  const [department, setDepartment] = useState<string>('Executive Committee');

  // Interactive controls
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');

  // Modals / Slide-overs
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isUpdateKPIOpen, setIsUpdateKPIOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isAISimulatorOpen, setIsAISimulatorOpen] = useState(false);

  // Form states
  const [newDashboardName, setNewDashboardName] = useState('');
  const [newDashboardAudience, setNewDashboardAudience] = useState<Dashboard['audience']>('Executives');
  const [newDashboardDept, setNewDashboardDept] = useState('Corporate Operations');
  const [newDashboardWorkspace, setNewDashboardWorkspace] = useState<Dashboard['workspace']>('global');
  const [selectedKpiIdsForNewDashboard, setSelectedKpiIdsForNewDashboard] = useState<string[]>([]);

  // Update KPI form states
  const [selectedKpiToUpdate, setSelectedKpiToUpdate] = useState<KPI | null>(null);
  const [updatedKpiValue, setUpdatedKpiValue] = useState<string>('');

  // Share form states
  const [shareRecipientRole, setShareRecipientRole] = useState<string>('Manager');

  // AI Assistant Interaction Simulator
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<string>('');
  const [aiLoading, setAiLoading] = useState(false);
  const [activeXmlContext, setActiveXmlContext] = useState<string>('');

  // Synchronize registries on load
  const loadRegistryData = () => {
    setKpis(decisionRegistry.getKPIs());
    setDashboards(decisionRegistry.getDashboards());
    setWidgets(decisionRegistry.getWidgets());
    setAnalytics(decisionRegistry.getAnalytics());
    setAuditLogs(decisionRegistry.getAuditLogs());
    setRole(decisionRegistry.getRole());
    setDepartment(decisionRegistry.getDepartment());
  };

  useEffect(() => {
    loadRegistryData();

    // Attach listeners for command palette triggers
    const handleCreateDashboardTrigger = () => {
      setSelectedKpiIdsForNewDashboard(decisionRegistry.getKPIs().slice(0, 3).map(k => k.kpiId));
      setIsCreateOpen(true);
    };

    const handleSearchKPITrigger = () => {
      const el = document.getElementById('decision-search-input');
      if (el) el.focus();
    };

    window.addEventListener('jnas-trigger-create-dashboard', handleCreateDashboardTrigger);
    window.addEventListener('jnas-trigger-search-kpi', handleSearchKPITrigger);

    return () => {
      window.removeEventListener('jnas-trigger-create-dashboard', handleCreateDashboardTrigger);
      window.removeEventListener('jnas-trigger-search-kpi', handleSearchKPITrigger);
    };
  }, []);

  // Update context visual XML dump whenever KPIs change
  useEffect(() => {
    // Generate simulated context payload
    const context = {
      currentUser: user ? { name: user.name, email: user.email, role } : { name: 'Chief Operator', email: 'operator@jnas.space', role: 'Executive' },
      currentWorkspace: settings.activeWorkspace || 'global',
      currentModule: 'Decision Intelligence',
      decisionContext: {
        kpis,
        dashboards: dashboards.filter(d => d.dashboardId === activeDashboardId),
        analytics
      }
    };
    // Format a high-fidelity XML representing structure
    let xml = `<JNAS_UNIFIED_CONTEXT_FABRIC>\n`;
    xml += `  <CURRENT_USER>\n`;
    xml += `    <NAME>${context.currentUser.name}</NAME>\n`;
    xml += `    <ROLE>${context.currentUser.role}</ROLE>\n`;
    xml += `  </CURRENT_USER>\n`;
    xml += `  <ISOLATION_WORKSPACE>${context.currentWorkspace.toUpperCase()}</ISOLATION_WORKSPACE>\n`;
    xml += `  <DECISION_INTELLIGENCE_COGNITION>\n`;
    xml += `    <STRATEGIC_KPIS>\n`;
    context.decisionContext.kpis.forEach((k: any) => {
      xml += `      <KPI id="${k.kpiId}" status="${k.status}">\n`;
      xml += `        <NAME>${k.name}</NAME>\n`;
      xml += `        <CURRENT>${k.currentValue}</CURRENT>\n`;
      xml += `        <TARGET>${k.targetValue}</TARGET>\n`;
      xml += `      </KPI>\n`;
    });
    xml += `    </STRATEGIC_KPIS>\n`;
    xml += `  </DECISION_INTELLIGENCE_COGNITION>\n`;
    xml += `</JNAS_UNIFIED_CONTEXT_FABRIC>`;
    setActiveXmlContext(xml);
  }, [kpis, dashboards, activeDashboardId, role, settings.activeWorkspace, user, analytics]);

  // Update role/dept handler
  const handleRoleChange = (newRole: DecisionRole, newDept: string) => {
    decisionRegistry.setRoleAndDepartment(newRole, newDept);
    setRole(newRole);
    setDepartment(newDept);
    triggerToast('success', `Security context rotated to ${newRole} [${newDept}]. Workspace isolation updated.`);
  };

  // Toggle favorite dashboard
  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isFavNow = decisionRegistry.toggleFavorite(id);
    setDashboards(decisionRegistry.getDashboards());
    triggerToast('success', isFavNow ? 'Dashboard added to strategic favorites!' : 'Dashboard removed from favorites.');
  };

  // Create Dashboard Handler
  const handleCreateDashboard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDashboardName.trim()) {
      triggerToast('error', 'Dashboard name is required.');
      return;
    }

    // Provision default widgets for new dashboards linking the selected KPIs
    const createdWidgets: string[] = [];
    if (selectedKpiIdsForNewDashboard.length > 0) {
      // 1. Executive overview progress widget
      const w1 = decisionRegistry.addWidgetToDashboard('temp-id', `${newDashboardName} Overview`, 'Progress', selectedKpiIdsForNewDashboard);
      createdWidgets.push(w1.widgetId);
      // 2. Analytical metric card
      if (selectedKpiIdsForNewDashboard.length > 1) {
        const w2 = decisionRegistry.addWidgetToDashboard('temp-id', `${newDashboardName} Comparative Chart`, 'Chart', selectedKpiIdsForNewDashboard.slice(0, 2));
        createdWidgets.push(w2.widgetId);
      }
    }

    const newDb = decisionRegistry.createDashboard({
      dashboardName: newDashboardName,
      audience: newDashboardAudience,
      department: newDashboardDept,
      widgets: createdWidgets,
      permissions: [role, 'Executive', 'Manager'],
      workspace: newDashboardWorkspace,
      favorite: false
    });

    // Update references inside created widgets to point to correct dashboard ID
    createdWidgets.forEach(wId => {
      const w = decisionRegistry.getWidget(wId);
      if (w) {
        // Simple update internally
      }
    });

    loadRegistryData();
    setActiveDashboardId(newDb.dashboardId);
    setIsCreateOpen(false);
    setNewDashboardName('');
    setSelectedKpiIdsForNewDashboard([]);
    triggerToast('success', `Dashboard "${newDb.dashboardName}" successfully registered with ${createdWidgets.length} supporting widgets.`);
    if (onRefreshGlobalBadges) onRefreshGlobalBadges();
  };

  // Update KPI Handler
  const handleUpdateKPI = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKpiToUpdate) return;
    const numValue = parseFloat(updatedKpiValue);
    if (isNaN(numValue)) {
      triggerToast('error', 'Invalid numerical format.');
      return;
    }

    const updated = decisionRegistry.updateKPI(
      selectedKpiToUpdate.kpiId,
      numValue,
      user?.name || 'Chief Executive'
    );

    if (updated) {
      loadRegistryData();
      setIsUpdateKPIOpen(false);
      setSelectedKpiToUpdate(null);
      setUpdatedKpiValue('');
      triggerToast('success', `KPI "${updated.name}" successfully updated. Current standing: ${updated.currentValue} ${updated.unit}.`);
    }
  };

  // Share Dashboard Handler
  const handleShareDashboard = (e: React.FormEvent) => {
    e.preventDefault();
    decisionRegistry.shareDashboard(activeDashboardId, shareRecipientRole);
    loadRegistryData();
    setIsShareOpen(false);
    triggerToast('success', `Dashboard permission shared with role group: [${shareRecipientRole}] successfully.`);
  };

  // Generate Executive PDF/CSV Report simulator
  const handleGenerateReport = () => {
    const reportId = decisionRegistry.generateDecisionReport(activeDashboardId, user?.name || 'Chief Executive');
    loadRegistryData();
    triggerToast('success', `Steering report [${reportId}] compiled and queued for secure Workspace distribution.`);
  };

  // AI Grounded Decision Copilot Simulation
  const handleAISubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;

    setAiLoading(true);
    setAiResponse('');

    // Formulate prompt leveraging active registry metadata
    await new Promise((resolve) => setTimeout(resolve, 900));

    const matchedKPIs = kpis.filter(k => k.name.toLowerCase().includes(aiQuery.toLowerCase()) || k.module.toLowerCase().includes(aiQuery.toLowerCase()));
    
    let answer = `### [AI Grounding Engine Verdict - SPRINT 35 Decision Intelligence]\n\n`;
    answer += `Active context loaded: **${kpis.length} KPIs** and **${dashboards.length} dashboards** serialized under XML structure.\n\n`;
    
    if (matchedKPIs.length > 0) {
      answer += `I have identified the following indicators related to your query:\n`;
      matchedKPIs.forEach(k => {
        const devPercent = ((k.currentValue / k.targetValue) * 100).toFixed(1);
        const colorMark = k.status === 'On Track' ? '🟢' : k.status === 'At Risk' ? '🟡' : '🔴';
        answer += `- **${k.name}** (${k.module}): Currently **${k.currentValue} ${k.unit}** vs target **${k.targetValue} ${k.unit}** (${devPercent}% achieved). Status: ${colorMark} *${k.status}*.\n`;
      });
      answer += `\n**Strategic Recommendation:**\n`;
      const criticalKpis = matchedKPIs.filter(k => k.status !== 'On Track');
      if (criticalKpis.length > 0) {
        answer += `1. **Intervene immediately** on *${criticalKpis[0].name}* showing a trend toward *${criticalKpis[0].trend}*. Formula placeholder **${criticalKpis[0].formula}** must be audited within the next cycle.\n`;
        answer += `2. Relocate operational margins from overperforming pipelines into the underperforming *${criticalKpis[0].module}* modules.\n`;
      } else {
        answer += `All matched metrics are on track. Continue rotating active materials and load staging plans under current configurations.\n`;
      }
    } else {
      answer += `Your query **"${aiQuery}"** was evaluated against our centralized KPI registry. \n\nNo exact string matches were found, but based on the overall organizational health metrics:\n`;
      const atRiskCount = kpis.filter(k => k.status === 'At Risk' || k.status === 'Critical').length;
      answer += `- Total indicators at risk: **${atRiskCount}**. \n`;
      answer += `- Top modules flagged: *Projects (Milestones Rate At Risk)* and *Logistics (Fill Factor At Risk)*.\n\n`;
      answer += `**Ecosystem Safety Directive:** Realign engineering cad approval cycles to prevent downstream production delays. Speeding up CAD drawings clearances will improve project milestone rates.`;
    }

    setAiResponse(answer);
    setAiLoading(false);
  };

  // Filtered lists
  const filteredKPIs = useMemo(() => {
    return kpis.filter(k => {
      const matchSearch = k.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          k.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          k.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          k.kpiId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchModule = selectedModule === 'All' || k.module === selectedModule;
      const matchCategory = selectedCategory === 'All' || k.category === selectedCategory;
      const matchPriority = selectedPriority === 'All' || k.priority === selectedPriority;
      return matchSearch && matchModule && matchCategory && matchPriority;
    });
  }, [kpis, searchQuery, selectedModule, selectedCategory, selectedPriority]);

  const activeDashboard = useMemo(() => {
    return dashboards.find(d => d.dashboardId === activeDashboardId) || dashboards[0];
  }, [dashboards, activeDashboardId]);

  // Compute stats for executive summaries
  const stats = useMemo(() => {
    const total = kpis.length;
    const onTrack = kpis.filter(k => k.status === 'On Track').length;
    const atRisk = kpis.filter(k => k.status === 'At Risk').length;
    const critical = kpis.filter(k => k.status === 'Critical').length;
    const averageCompletion = kpis.reduce((acc, k) => {
      const ratio = Math.min((k.currentValue / k.targetValue) * 100, 150); // cap at 150%
      return acc + (isNaN(ratio) ? 0 : ratio);
    }, 0) / (total || 1);

    return { total, onTrack, atRisk, critical, averageCompletion: averageCompletion.toFixed(1) };
  }, [kpis]);

  // Render a gorgeous clean mini SVG Sparkline
  const renderSparkline = (trend: 'up' | 'down' | 'stable') => {
    const points = trend === 'up' 
      ? '0,25 15,22 30,27 45,15 60,18 75,8' 
      : trend === 'down' 
      ? '0,8 15,14 30,12 45,22 60,18 75,26' 
      : '0,15 15,16 30,14 45,16 60,14 75,15';
    const strokeColor = trend === 'up' ? '#10B981' : trend === 'down' ? '#EF4444' : '#64748B';
    return (
      <svg className="w-16 h-8 overflow-visible" stroke={strokeColor} strokeWidth="1.5" fill="none">
        <polyline points={points} />
      </svg>
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. SECURE GATEWAY & TITLE BAR */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-900 pb-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-950/40 px-2 py-0.5 border border-indigo-500/20 text-indigo-400">
              Steering & Strategy
            </span>
            <ChevronRight className="w-3 h-3 text-slate-700" />
            <span className="text-xs text-emerald-400 font-semibold font-mono">
              Role-Based Workspace Isolation level 4 Active
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-100 font-sans mt-1">
            Enterprise Decision Intelligence Platform
          </h1>
          <p className="text-xs text-slate-400 leading-normal max-w-xl">
            Centralized decision orchestration console for the JNAS workspace ecosystem, unifying business KPIs, audit paths, and XML context boundaries.
          </p>
        </div>

        {/* Dynamic Security & Role Switcher */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-900 px-3 py-1.5 rounded-sm">
            <Shield className="w-3.5 h-3.5 text-cyan-500" />
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold mr-1">Active Role:</span>
            <select
              value={role}
              onChange={(e) => {
                const r = e.target.value as DecisionRole;
                const d = r === 'Executive' ? 'Executive Committee' : r === 'Manager' ? 'Operations Board' : r === 'Engineer' ? 'Technical Division' : 'Departmental Oversight';
                handleRoleChange(r, d);
              }}
              className="bg-transparent border-none text-[11px] font-mono text-cyan-400 font-bold focus:outline-none focus:ring-0 cursor-pointer"
            >
              <option value="Executive">Chief Executive</option>
              <option value="Manager">Business Operations Manager</option>
              <option value="Engineer">Principal Systems Engineer</option>
              <option value="Department Head">Oversight Department Head</option>
            </select>
          </div>

          <button
            onClick={() => setIsAISimulatorOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/25 hover:border-indigo-500/40 text-indigo-300 hover:text-white rounded-sm text-xs font-mono font-bold cursor-pointer transition-all"
          >
            <Cpu className="w-3.5 h-3.5 animate-pulse" />
            <span>AI Context Fabric</span>
          </button>
        </div>
      </div>

      {/* 2. CORPORATE MACRO STANDING SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-slate-950 border border-slate-900 p-4 rounded-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Strategic Indicators</span>
            <span className="text-2xl font-bold font-sans text-slate-100">{stats.total}</span>
          </div>
          <div className="p-2.5 bg-slate-900 border border-slate-800 text-slate-400 rounded">
            <Database className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-900 p-4 rounded-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest block">On Track Metrics</span>
            <span className="text-2xl font-bold font-sans text-emerald-400">{stats.onTrack}</span>
          </div>
          <div className="p-2.5 bg-emerald-950/20 border border-emerald-500/10 text-emerald-400 rounded">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-900 p-4 rounded-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest block">At Risk Alerts</span>
            <span className="text-2xl font-bold font-sans text-amber-400">{stats.atRisk}</span>
          </div>
          <div className="p-2.5 bg-amber-950/20 border border-amber-500/10 text-amber-400 rounded">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-900 p-4 rounded-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-rose-500 uppercase tracking-widest block">Critical Escalations</span>
            <span className="text-2xl font-bold font-sans text-rose-400">{stats.critical}</span>
          </div>
          <div className="p-2.5 bg-rose-950/20 border border-rose-500/10 text-rose-400 rounded">
            <Activity className="w-5 h-5 text-rose-500 animate-pulse" />
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-900 p-4 rounded-sm flex items-center justify-between col-span-1 sm:col-span-2 lg:col-span-1">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest block">Avg Target Completion</span>
            <span className="text-2xl font-bold font-sans text-cyan-400">{stats.averageCompletion}%</span>
          </div>
          <div className="p-2.5 bg-cyan-950/20 border border-cyan-500/10 text-cyan-400 rounded">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. CORE STRATEGIC STEERING TAB INTERFACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Dashboards Directory & Custom Widget Staging */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-950 border border-slate-900 p-4 rounded-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold uppercase text-slate-200 tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>Steering Dashboards</span>
              </h3>
              <button
                onClick={() => setIsCreateOpen(true)}
                className="p-1 text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800 rounded transition-colors"
                title="Create Custom Dashboard"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Dashboard List */}
            <div className="space-y-2">
              {dashboards.map((db) => {
                const isActive = db.dashboardId === activeDashboardId;
                const matchesRole = db.permissions.includes(role);

                return (
                  <div
                    key={db.dashboardId}
                    onClick={() => {
                      if (matchesRole) {
                        setActiveDashboardId(db.dashboardId);
                      } else {
                        triggerToast('error', `Access Denied: Role [${role}] lacks clearances for [${db.dashboardName}].`);
                      }
                    }}
                    className={`p-3 rounded-sm border text-left cursor-pointer transition-all ${
                      isActive 
                        ? 'border-indigo-500 bg-indigo-950/10' 
                        : 'border-slate-900 bg-slate-950/50 hover:bg-slate-900/50 hover:border-slate-800'
                    } ${!matchesRole ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-sans font-bold text-slate-200 text-xs line-clamp-1">
                        {db.dashboardName}
                      </span>
                      <button
                        onClick={(e) => handleToggleFavorite(db.dashboardId, e)}
                        className={`text-slate-500 hover:text-amber-400 ${db.favorite ? 'text-amber-400' : ''}`}
                      >
                        <Star className={`w-3.5 h-3.5 ${db.favorite ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-2">
                      <span className="capitalize">{db.audience} Dashboard</span>
                      <span>{db.version}</span>
                    </div>

                    {!matchesRole && (
                      <div className="flex items-center gap-1 text-[9px] font-mono text-rose-400 uppercase font-bold mt-1.5">
                        <Shield className="w-3 h-3" />
                        <span>Isolations Active</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Analytics Aggregations */}
          <div className="bg-slate-950 border border-slate-900 p-4 rounded-sm space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase text-slate-200 tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Analytic Metrical registry</span>
            </h3>

            <div className="space-y-3">
              {analytics.map((metric) => (
                <div key={metric.metricId} className="border-b border-slate-900 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-sans font-semibold text-slate-300">{metric.name}</span>
                    <span className="font-mono text-emerald-400 font-bold">
                      {metric.currentValue}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-1">
                    <span>{metric.sourceModule} ({metric.aggregationType})</span>
                    <span>Range: {metric.timeRange}</span>
                  </div>

                  {/* SVG mini trend line */}
                  <div className="flex items-center justify-between mt-2 pt-1 bg-slate-900/20 px-2 py-1 rounded">
                    <span className="text-[9px] font-mono text-slate-500">Historical Trend</span>
                    <svg className="w-24 h-6 overflow-visible" stroke="#10B981" strokeWidth="1.2" fill="none">
                      <polyline points="0,20 15,18 30,12 45,15 60,8 75,10 90,4" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Active Workspace & Widgets Render */}
        <div className="lg:col-span-8 space-y-6">
          {/* Active Dashboard Controls */}
          <div className="bg-slate-950 border border-slate-900 p-4 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[9px] font-mono text-indigo-400 uppercase font-bold tracking-widest block">Active Steering Console</span>
              <h2 className="text-sm font-sans font-bold text-slate-100 mt-0.5">
                {activeDashboard?.dashboardName || 'Global Steering Dashboard'}
              </h2>
              <span className="text-[10px] font-mono text-slate-500 block mt-0.5">
                Target Dept: {activeDashboard?.department || 'Operations Office'} • Scope: {activeDashboard?.workspace.toUpperCase()}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsShareOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-sm text-xs font-mono cursor-pointer transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </button>

              <button
                onClick={handleGenerateReport}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-sm text-xs font-mono cursor-pointer transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Steer Report</span>
              </button>
            </div>
          </div>

          {/* Render Active Widgets */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {widgets
              .filter(w => activeDashboard?.widgets.includes(w.widgetId))
              .map((widget) => {
                // Get linked KPIs
                const linkedKpis = kpis.filter(k => widget.sourceKpiIds.includes(k.kpiId));

                return (
                  <div 
                    key={widget.widgetId} 
                    className={`bg-slate-950 border border-slate-900 p-4 rounded-sm space-y-4 flex flex-col justify-between ${
                      widget.colSpan === 4 ? 'md:col-span-2' : 'col-span-1'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                          {widget.type} Frame Widget
                        </span>
                        <span className="text-[9px] font-mono text-indigo-400 border border-indigo-500/10 bg-indigo-950/20 px-1.5 py-0.2 rounded-sm uppercase font-bold">
                          Core Connected
                        </span>
                      </div>
                      <h3 className="text-xs font-sans font-bold text-slate-200">
                        {widget.title}
                      </h3>
                    </div>

                    {/* Render Widget specifics based on type */}
                    {widget.type === 'Status' && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2">
                        {linkedKpis.map(k => (
                          <div 
                            key={k.kpiId} 
                            onClick={() => {
                              setSelectedKpiToUpdate(k);
                              setUpdatedKpiValue(k.currentValue.toString());
                              setIsUpdateKPIOpen(true);
                            }}
                            className="bg-slate-900/40 hover:bg-slate-900/80 border border-slate-900 hover:border-slate-800 p-3 rounded-sm transition-all cursor-pointer group"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">{k.module}</span>
                              {k.trend === 'up' ? (
                                <TrendingUp className="w-3 h-3 text-emerald-400" />
                              ) : k.trend === 'down' ? (
                                <TrendingDown className="w-3 h-3 text-rose-500" />
                              ) : (
                                <span className="text-slate-500 font-mono text-[9px]">-</span>
                              )}
                            </div>
                            <div className="text-sm font-sans font-bold text-slate-100 mt-1.5 group-hover:text-indigo-400">
                              {k.currentValue} {k.unit}
                            </div>
                            <span className="text-[9px] text-slate-500 line-clamp-1 block mt-1">{k.name}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {widget.type === 'Chart' && (
                      <div className="space-y-4 py-2">
                        {/* High-fidelity SVG mock charts */}
                        <div className="bg-slate-900/20 border border-slate-900/50 p-4 rounded-sm flex flex-col items-center justify-center relative">
                          <svg className="w-full h-32 overflow-visible" strokeWidth="2" fill="none">
                            <defs>
                              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#6366F1" stopOpacity="0.15" />
                                <stop offset="100%" stopColor="#6366F1" stopOpacity="0.0" />
                              </linearGradient>
                            </defs>
                            {/* Target value horizontal line */}
                            <line x1="0" y1="30" x2="400" y2="30" stroke="#EF4444" strokeWidth="1" strokeDasharray="3,3" />
                            <text x="5" y="26" fill="#EF4444" className="text-[9px] font-mono font-bold">TARGET LIMIT</text>

                            {/* Core spline path */}
                            <path d="M0,120 Q50,110 100,95 T200,60 T300,45 T400,20" stroke="#6366F1" fill="none" />
                            <path d="M0,120 Q50,110 100,95 T200,60 T300,45 T400,20 L400,130 L0,130 Z" fill="url(#chartGradient)" />

                            {/* Dots */}
                            <circle cx="100" cy="95" r="3" fill="#6366F1" />
                            <circle cx="200" cy="60" r="3" fill="#6366F1" />
                            <circle cx="300" cy="45" r="3" fill="#6366F1" />
                            <circle cx="400" cy="20" r="3" fill="#10B981" />
                          </svg>

                          <div className="flex items-center justify-between w-full text-[9px] font-mono text-slate-500 mt-2 border-t border-slate-900/60 pt-2">
                            <span>WK 22</span>
                            <span>WK 24</span>
                            <span>WK 26</span>
                            <span>WK 28 (CURRENT)</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-[11px]">
                          {linkedKpis.map(k => (
                            <div key={k.kpiId} className="bg-slate-900/30 p-2 border border-slate-900 rounded-sm">
                              <span className="text-slate-400 block font-sans font-semibold">{k.name}</span>
                              <div className="flex items-center justify-between mt-1">
                                <span className="font-mono text-slate-200">{k.currentValue} / {k.targetValue} {k.unit}</span>
                                <span className={k.status === 'On Track' ? 'text-emerald-400' : 'text-amber-500'}>{k.status}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {widget.type === 'Progress' && (
                      <div className="space-y-4 py-2">
                        {linkedKpis.map(k => {
                          const percent = Math.min((k.currentValue / k.targetValue) * 100, 100);
                          return (
                            <div key={k.kpiId} className="space-y-1.5">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-300 font-sans font-semibold">{k.name}</span>
                                <span className="font-mono font-bold text-cyan-400">{percent.toFixed(1)}%</span>
                              </div>
                              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                                <div 
                                  className="bg-cyan-500 h-full rounded-full transition-all duration-500" 
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                                <span>Formula: {k.formula}</span>
                                <span>Target: {k.targetValue} {k.unit}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {widget.type === 'Table' && (
                      <div className="py-2">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="border-b border-slate-900 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                                <th className="pb-2">Metric</th>
                                <th className="pb-2 text-right">Value</th>
                                <th className="pb-2 text-right">Trend</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-900">
                              {linkedKpis.map(k => (
                                <tr key={k.kpiId} className="hover:bg-slate-900/10">
                                  <td className="py-2.5 pr-2">
                                    <div className="font-semibold text-slate-300">{k.name}</div>
                                    <div className="text-[10px] text-slate-500">{k.module} • Owner: {k.owner.split(' ')[0]}</div>
                                  </td>
                                  <td className="py-2.5 text-right font-mono text-slate-200">
                                    {k.currentValue} {k.unit}
                                  </td>
                                  <td className="py-2.5 text-right pl-2">
                                    {k.trend === 'up' ? (
                                      <span className="text-emerald-400 font-mono text-[10px]">▲ UP</span>
                                    ) : k.trend === 'down' ? (
                                      <span className="text-rose-500 font-mono text-[10px]">▼ DOWN</span>
                                    ) : (
                                      <span className="text-slate-500 font-mono text-[10px]">STABLE</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {widget.type === 'Heatmap' && (
                      <div className="space-y-4 py-2">
                        {/* Interactive structural rotation density matrix mock */}
                        <div className="grid grid-cols-7 gap-1">
                          {Array.from({ length: 28 }).map((_, i) => {
                            const colors = [
                              'bg-slate-900 border-slate-950', 
                              'bg-emerald-950/40 border-emerald-900/30 text-emerald-400', 
                              'bg-emerald-900/40 border-emerald-800/40 text-emerald-300', 
                              'bg-emerald-500/20 border-emerald-500/20 text-emerald-100', 
                              'bg-emerald-500 border-emerald-400 text-slate-950'
                            ];
                            const idx = (i * 7 + 3) % 5;
                            return (
                              <div 
                                key={i} 
                                className={`aspect-square rounded border flex items-center justify-center font-mono text-[9px] ${colors[idx]}`}
                                title={`Metric day ${i + 1}`}
                              >
                                {i + 1}
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                          <span>Low Density</span>
                          <div className="flex items-center gap-1">
                            <span className="w-2.5 h-2.5 bg-slate-900 border border-slate-800 rounded-sm" />
                            <span className="w-2.5 h-2.5 bg-emerald-950 rounded-sm" />
                            <span className="w-2.5 h-2.5 bg-emerald-800 rounded-sm" />
                            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm" />
                          </div>
                          <span>Max Rotation</span>
                        </div>
                      </div>
                    )}

                    <div className="border-t border-slate-900 pt-3 flex items-center justify-between text-[10px] font-mono text-slate-500">
                      <span>Formula: {linkedKpis[0]?.formula || 'None'}</span>
                      <button
                        onClick={() => {
                          if (linkedKpis[0]) {
                            setSelectedKpiToUpdate(linkedKpis[0]);
                            setUpdatedKpiValue(linkedKpis[0].currentValue.toString());
                            setIsUpdateKPIOpen(true);
                          }
                        }}
                        className="text-cyan-400 hover:underline"
                      >
                        Adjust Indicator
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* 4. STRATEGIC METRICS FACET SEARCH & LEDGER CATALOG */}
      <div className="bg-slate-950 border border-slate-900 p-5 rounded-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-4">
          <div>
            <h3 className="text-xs font-mono font-bold uppercase text-slate-200 tracking-wider">
              Strategic KPI & Metrics Directory
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Filter, search, and update critical metrics across the entire JNAS workflow landscape.</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedModule('All');
                setSelectedCategory('All');
                setSelectedPriority('All');
                setSearchQuery('');
                triggerToast('success', 'Faceted directories reset.');
              }}
              className="text-[10px] font-mono text-slate-400 hover:text-white"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-600 absolute left-3 top-2.5" />
            <input
              id="decision-search-input"
              type="text"
              placeholder="Search ID, name, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded pl-9 pr-3 py-2 text-xs font-mono text-slate-200 focus:outline-none"
            />
          </div>

          <div>
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded px-3 py-2 text-xs font-sans text-slate-200 focus:outline-none"
            >
              <option value="All">All Modules</option>
              <option value="CRM">CRM Portal</option>
              <option value="Projects">Projects & Milestones</option>
              <option value="Engineering">Engineering specs</option>
              <option value="Packaging">Packaging Studio</option>
              <option value="Logistics">Logistics Planning</option>
              <option value="Returnables">Returnable Assets</option>
              <option value="KMS">KMS Knowledge</option>
              <option value="AI">AI usage</option>
            </select>
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded px-3 py-2 text-xs font-sans text-slate-200 focus:outline-none"
            >
              <option value="All">All Categories</option>
              <option value="Growth">Growth</option>
              <option value="Operational">Operational</option>
              <option value="Quality">Quality</option>
              <option value="Financial">Financial</option>
              <option value="Efficiency">Efficiency</option>
              <option value="AI Usage">AI Usage</option>
              <option value="Workflow">Workflow</option>
            </select>
          </div>

          <div>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded px-3 py-2 text-xs font-sans text-slate-200 focus:outline-none"
            >
              <option value="All">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>
        </div>

        {/* Directory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredKPIs.length === 0 ? (
            <div className="col-span-full py-8 text-center bg-slate-900/20 border border-slate-900 rounded border-dashed">
              <span className="text-slate-500 font-mono text-xs italic">No matching strategic indicators detected inside this search filter.</span>
            </div>
          ) : (
            filteredKPIs.map((k) => {
              const percentageAchieved = ((k.currentValue / k.targetValue) * 100).toFixed(1);
              return (
                <div 
                  key={k.kpiId} 
                  onClick={() => {
                    setSelectedKpiToUpdate(k);
                    setUpdatedKpiValue(k.currentValue.toString());
                    setIsUpdateKPIOpen(true);
                  }}
                  className="bg-slate-900/30 hover:bg-slate-900/60 border border-slate-900 hover:border-slate-800 p-4 rounded-sm flex flex-col justify-between space-y-4 cursor-pointer transition-all hover:-translate-y-0.5"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono text-slate-500 uppercase font-bold bg-slate-950 px-1.5 py-0.5 border border-slate-900 rounded">
                        {k.module} • {k.category}
                      </span>
                      <span className={`text-[10px] font-mono uppercase font-bold px-1.5 rounded ${
                        k.status === 'On Track' 
                          ? 'bg-emerald-950/40 border border-emerald-500/10 text-emerald-400' 
                          : k.status === 'At Risk'
                          ? 'bg-amber-950/40 border border-amber-500/10 text-amber-400'
                          : 'bg-rose-950/40 border border-rose-500/10 text-rose-400'
                      }`}>
                        {k.status}
                      </span>
                    </div>

                    <h4 className="text-xs font-sans font-bold text-slate-200">{k.name}</h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{k.description}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-end justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-mono text-slate-500 uppercase">Current Standing</span>
                        <div className="text-xs font-mono font-bold text-slate-200">
                          {k.currentValue} {k.unit}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[9px] font-mono text-slate-500 uppercase block">Target</span>
                        <span className="text-xs font-mono text-slate-400">{k.targetValue} {k.unit}</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-900">
                      <div 
                        className={`h-full rounded-full ${
                          k.status === 'On Track' ? 'bg-emerald-500' : k.status === 'At Risk' ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(parseFloat(percentageAchieved), 100)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[9px] font-mono text-slate-500">
                      <span>Owner: {k.owner.split(' ')[0]}</span>
                      <span>{percentageAchieved}% achieved</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 5. METRIC HISTORY & AUDIT PATH TABLE */}
      <div className="bg-slate-950 border border-slate-900 p-4 rounded-sm space-y-4">
        <h3 className="text-xs font-mono font-bold uppercase text-slate-200 tracking-wider flex items-center gap-1.5">
          <SlidersHorizontal className="w-4 h-4 text-slate-400" />
          <span>Strategic Decision Logs & System Audits</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-900 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                <th className="pb-2">Timestamp</th>
                <th className="pb-2">Operator</th>
                <th className="pb-2">Action</th>
                <th className="pb-2">Details</th>
                <th className="pb-2 text-right">Node IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {auditLogs.slice(0, 5).map((log) => (
                <tr key={log.logId} className="hover:bg-slate-900/10 font-mono text-[11px] text-slate-300">
                  <td className="py-2.5 whitespace-nowrap text-slate-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-2.5 text-cyan-400 font-semibold">{log.operator}</td>
                  <td className="py-2.5">
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                      log.action === 'Dashboard Created' 
                        ? 'bg-blue-950/40 border border-blue-500/10 text-blue-400'
                        : log.action === 'KPI Updated'
                        ? 'bg-amber-950/40 border border-amber-500/10 text-amber-400'
                        : 'bg-indigo-950/40 border border-indigo-500/10 text-indigo-400'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2.5 font-sans leading-relaxed text-slate-400">{log.details}</td>
                  <td className="py-2.5 text-right text-slate-600">{log.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- SIDEBAR: AI COGNITIVE FABRIC SIMULATOR --- */}
      {isAISimulatorOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-[#07090F] border-l border-slate-900 p-6 flex flex-col justify-between h-full shadow-2xl font-mono">
            
            {/* Header */}
            <div className="space-y-2 pb-4 border-b border-slate-900">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-indigo-400 animate-pulse" />
                  <span>AI Unified Context Fabric Simulator</span>
                </h3>
                <button 
                  onClick={() => setIsAISimulatorOpen(false)}
                  className="p-1 hover:bg-slate-900 border border-slate-800 text-slate-500 hover:text-white rounded"
                >
                  Close
                </button>
              </div>
              <p className="text-[11px] font-sans text-slate-400 leading-relaxed">
                This panel demonstrates how the active Decision Indicators are serialized into JNAS's XML context nodes (`&lt;DECISION_INTELLIGENCE_COGNITION&gt;`) for server-side grounding.
              </p>
            </div>

            {/* XML Dump View */}
            <div className="flex-1 my-4 overflow-y-auto space-y-4 pr-1">
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">XML Serialized Output Prompt</span>
                <pre className="bg-slate-950 p-3 rounded border border-slate-900 text-[10px] text-cyan-400 font-mono overflow-x-auto max-h-64 leading-normal">
                  {activeXmlContext}
                </pre>
              </div>

              {/* Copilot Ask Form */}
              <div className="bg-slate-950 border border-slate-900 p-4 rounded-sm space-y-4">
                <span className="text-[10px] uppercase font-bold text-indigo-400 block flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Grounding Decision Copilot</span>
                </span>

                <form onSubmit={handleAISubmit} className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Audit Sales Pipeline or review Projects compliance..."
                      value={aiQuery}
                      onChange={(e) => setAiQuery(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-0"
                    />
                    <button
                      type="submit"
                      disabled={aiLoading}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-slate-100 rounded text-xs font-bold cursor-pointer transition-colors disabled:opacity-50"
                    >
                      {aiLoading ? 'Gleaning...' : 'Ground Verdict'}
                    </button>
                  </div>
                </form>

                {aiResponse && (
                  <div className="bg-indigo-950/10 border border-indigo-500/20 p-3.5 rounded text-xs leading-relaxed text-slate-300 font-sans space-y-2 whitespace-pre-line">
                    {aiResponse}
                  </div>
                )}
              </div>
            </div>

            <div className="text-[10px] text-slate-500 text-center border-t border-slate-900 pt-3">
              CONTEXT_SIZE: ~{contextBuilder.estimateTokenCount(activeXmlContext)} TOKENS • COMPILING STATEFUL STREAM
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: CREATE DASHBOARD --- */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs">
          <div className="bg-[#0A0C12] border border-slate-900 w-full max-w-lg p-6 rounded shadow-2xl font-sans space-y-4">
            <h3 className="text-sm font-mono font-bold uppercase text-slate-200 tracking-wider">
              Create Executive Dashboard
            </h3>

            <form onSubmit={handleCreateDashboard} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-400 font-medium">Dashboard Name</label>
                <input
                  type="text"
                  placeholder="e.g. Q3 Steering Committee review"
                  value={newDashboardName}
                  onChange={(e) => setNewDashboardName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900 focus:border-indigo-500 rounded px-3 py-2 text-slate-200 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-400 font-medium">Audience Clearances</label>
                  <select
                    value={newDashboardAudience}
                    onChange={(e) => setNewDashboardAudience(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-900 focus:border-indigo-500 rounded px-3 py-2 text-slate-200 focus:outline-none"
                  >
                    <option value="Executives">Executives Only</option>
                    <option value="Managers">Managers & Executives</option>
                    <option value="Department Heads">Department Oversight</option>
                    <option value="Engineers">Technical Division</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 font-medium">Target Workspace</label>
                  <select
                    value={newDashboardWorkspace}
                    onChange={(e) => setNewDashboardWorkspace(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-900 focus:border-indigo-500 rounded px-3 py-2 text-slate-200 focus:outline-none"
                  >
                    <option value="global">Global Shared</option>
                    <option value="engineering">Engineering</option>
                    <option value="business">Business CRM</option>
                    <option value="learning">LMS Training</option>
                    <option value="admin">Administration</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-medium">Department Assignment</label>
                <input
                  type="text"
                  value={newDashboardDept}
                  onChange={(e) => setNewDashboardDept(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900 focus:border-indigo-500 rounded px-3 py-2 text-slate-200"
                />
              </div>

              {/* KPI Multi-select mock list */}
              <div className="space-y-2">
                <label className="text-slate-400 font-medium block">Link Strategic Indicators</label>
                <div className="max-h-36 overflow-y-auto bg-slate-950 border border-slate-900 rounded p-2.5 space-y-1.5">
                  {kpis.map(k => {
                    const checked = selectedKpiIdsForNewDashboard.includes(k.kpiId);
                    return (
                      <label key={k.kpiId} className="flex items-center gap-2 text-slate-300 hover:text-white cursor-pointer font-mono text-[10px]">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            if (checked) {
                              setSelectedKpiIdsForNewDashboard(prev => prev.filter(id => id !== k.kpiId));
                            } else {
                              setSelectedKpiIdsForNewDashboard(prev => [...prev, k.kpiId]);
                            }
                          }}
                          className="rounded border-slate-900 bg-slate-900 text-indigo-600 focus:ring-0"
                        />
                        <span>{k.name} ({k.module})</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-white border border-slate-900 rounded transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-slate-100 rounded font-bold transition-colors cursor-pointer"
                >
                  Provision Dashboard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: UPDATE KPI VALUE --- */}
      {isUpdateKPIOpen && selectedKpiToUpdate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs">
          <div className="bg-[#0A0C12] border border-slate-900 w-full max-w-sm p-6 rounded shadow-2xl font-sans space-y-4">
            <h3 className="text-sm font-mono font-bold uppercase text-slate-200 tracking-wider">
              Adjust Strategic Indicator
            </h3>

            <div className="space-y-1 bg-slate-950 p-3 rounded border border-slate-900">
              <span className="text-[10px] font-mono text-indigo-400 block">{selectedKpiToUpdate.module} • {selectedKpiToUpdate.category}</span>
              <span className="text-xs font-semibold text-slate-200 block">{selectedKpiToUpdate.name}</span>
              <p className="text-[11px] text-slate-500 mt-1">{selectedKpiToUpdate.description}</p>
            </div>

            <form onSubmit={handleUpdateKPI} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-400 font-medium">New Current Value ({selectedKpiToUpdate.unit})</label>
                <input
                  type="number"
                  step="any"
                  placeholder={`Currently ${selectedKpiToUpdate.currentValue}`}
                  value={updatedKpiValue}
                  onChange={(e) => setUpdatedKpiValue(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900 focus:border-indigo-500 rounded px-3 py-2 text-slate-200 focus:outline-none"
                  required
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUpdateKPIOpen(false)}
                  className="px-4 py-2 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-white border border-slate-900 rounded transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-slate-100 rounded font-bold transition-colors cursor-pointer"
                >
                  Commit Value
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: SHARE DASHBOARD --- */}
      {isShareOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs">
          <div className="bg-[#0A0C12] border border-slate-900 w-full max-w-sm p-6 rounded shadow-2xl font-sans space-y-4">
            <h3 className="text-sm font-mono font-bold uppercase text-slate-200 tracking-wider">
              Share Steering Permissions
            </h3>

            <p className="text-xs text-slate-400 leading-normal">
              Authorize another organizational role level to access, update, and review indicators linked with **{activeDashboard?.dashboardName}**.
            </p>

            <form onSubmit={handleShareDashboard} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-400 font-medium">Recipient Permission Group</label>
                <select
                  value={shareRecipientRole}
                  onChange={(e) => setShareRecipientRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900 focus:border-indigo-500 rounded px-3 py-2 text-slate-200 focus:outline-none"
                >
                  <option value="Manager">Business Operations Managers</option>
                  <option value="Engineer">Principal Systems Engineers</option>
                  <option value="Department Head">Oversight Department Heads</option>
                  <option value="Quality Assurance">Quality Control Inspectors</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsShareOpen(false)}
                  className="px-4 py-2 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-white border border-slate-900 rounded transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-slate-100 rounded font-bold transition-colors cursor-pointer"
                >
                  Share Permissions
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

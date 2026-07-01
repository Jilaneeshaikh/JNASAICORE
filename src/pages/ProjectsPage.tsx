import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FolderKanban,
  Users,
  Play,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Brain,
  Sparkles,
  Plus,
  Search,
  ArrowLeft,
  Archive,
  Copy,
  Trash2,
  Calendar,
  FileText,
  Activity,
  ShieldAlert,
  Cpu,
  Layers,
  HardDrive,
  RefreshCw,
  Send,
  CheckSquare,
  PlusCircle,
  X,
  SlidersHorizontal
} from 'lucide-react';

import { useSettings } from '../contexts/SettingsContext';
import { useNotification } from '../contexts/NotificationContext';

// Design System components
import {
  DSCard,
  DSCardHeader,
  DSCardContent,
  DSCardTitle,
  DSCardSubtitle,
  DSCardFooter
} from '../components/design-system/DSCard';
import { DSBadge, DSAlert, DSEmptyState } from '../components/design-system/DSStatus';
import { DSButton } from '../components/design-system/DSButton';

// Backend logic
import { ProjectRegistry } from '../backend/projects/registry';
import { seedProjects } from '../backend/projects/mockData';
import { integrationEngine, ConnectedKnowledgeNode, ConnectedMemoryNode, ConnectedWorkflow, ConnectedAgent } from '../backend/projects/integration';
import {
  Project,
  ProjectMember,
  ProjectTask,
  ProjectType,
  ProjectPriority,
  ProjectStatus,
  ProjectHealth,
  ProjectRole
} from '../backend/projects/types';

export const ProjectsPage: React.FC = () => {
  const { settings } = useSettings();
  const { triggerToast } = useNotification();
  
  const registry = ProjectRegistry.getInstance();

  // Initialize and seed projects inside component lifecycle
  useEffect(() => {
    seedProjects();
    setProjectsList(registry.getProjects(settings.activeWorkspace));
  }, [settings.activeWorkspace]);

  const [projectsList, setProjectsList] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tasks' | 'integrations' | 'ai-assistant' | 'team' | 'settings'>('dashboard');

  // Search and filter states for projects list
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  // Project creation modal/wizard states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creationMode, setCreationMode] = useState<'scratch' | 'template'>('template');
  const [selectedTemplateId, setSelectedTemplateId] = useState('tmpl-engineering');

  // Custom project creation form fields
  const [newProjName, setNewProjName] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newProjType, setNewProjType] = useState<ProjectType>('engineering');
  const [newProjPriority, setNewProjPriority] = useState<ProjectPriority>('Medium');
  const [newProjCategory, setNewProjCategory] = useState('');
  const [newProjClient, setNewProjClient] = useState('');
  const [newProjTags, setNewProjTags] = useState('');

  // RAG / AI playground states
  const [aiQuery, setAiQuery] = useState('Verify the alignment of current material calibration records with AS9100 quality policies.');
  const [includeTasks, setIncludeTasks] = useState(true);
  const [includeTeam, setIncludeTeam] = useState(true);
  const [includeKms, setIncludeKms] = useState(true);
  const [includeMemory, setIncludeMemory] = useState(true);
  
  const [compiledPrompt, setCompiledPrompt] = useState('');
  const [estimatedTokens, setEstimatedTokens] = useState(0);
  const [aiOutput, setAiOutput] = useState('');
  const [selectedAiProvider, setSelectedAiProvider] = useState('gemini');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiLatency, setAiLatency] = useState<number | null>(null);
  const [aiModelUsed, setAiModelUsed] = useState('');

  // Task creation state
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState<ProjectTask['priority']>('Medium');
  const [taskDueDate, setTaskDueDate] = useState('2026-07-31');
  const [taskAssignedTo, setTaskAssignedTo] = useState('');

  // Member creation state
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [memberUserId, setMemberUserId] = useState('');
  const [memberName, setMemberName] = useState('');
  const [memberRole, setMemberRole] = useState<ProjectRole>('Member');
  const [memberDept, setMemberDept] = useState('');
  const [memberEmail, setMemberEmail] = useState('');

  // Clone project modal state
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [cloneNewName, setCloneNewName] = useState('');

  // Resolve current active selected project
  const currentProject = useMemo(() => {
    if (!selectedProjectId) return null;
    return registry.getProject(selectedProjectId) || null;
  }, [selectedProjectId, projectsList]);

  // Sync state whenever registry is updated
  const refreshProjectsList = () => {
    setProjectsList(registry.getProjects(settings.activeWorkspace));
  };

  // Filtered projects view
  const filteredProjects = useMemo(() => {
    return projectsList.filter(p => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesPriority = filterPriority === 'all' || p.priority === filterPriority;
      const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
      const matchesType = filterType === 'all' || p.type === filterType;

      return matchesSearch && matchesPriority && matchesStatus && matchesType;
    });
  }, [projectsList, searchQuery, filterPriority, filterStatus, filterType]);

  // Overall statistics for metrics dashboard
  const stats = useMemo(() => {
    const list = projectsList;
    const total = list.length;
    const healthy = list.filter(p => p.health === 'healthy').length;
    const critical = list.filter(p => p.health === 'critical').length;
    const activeTasks = list.reduce((acc, p) => acc + p.tasks.filter(t => t.status !== 'Done').length, 0);
    const totalStorage = list.reduce((acc, p) => acc + integrationEngine.getProjectAPIMetadata(p).storageUsageMb, 0);

    return { total, healthy, critical, activeTasks, totalStorage: totalStorage.toFixed(1) };
  }, [projectsList]);

  // Project-specific metrics (e.g. task progress)
  const projectProgress = useMemo(() => {
    if (!currentProject) return 0;
    const tasks = currentProject.tasks;
    if (tasks.length === 0) return 0;
    const doneCount = tasks.filter(t => t.status === 'Done').length;
    return Math.round((doneCount / tasks.length) * 100);
  }, [currentProject]);

  // Handle manual project creation
  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName.trim()) {
      triggerToast('error', 'Project name is required.');
      return;
    }

    try {
      if (creationMode === 'template') {
        const proj = registry.createFromTemplate(
          selectedTemplateId,
          newProjName,
          'System Operator',
          settings.activeWorkspace
        );
        triggerToast('success', `Initialized project "${proj.name}" from template!`);
      } else {
        const tagList = newProjTags
          .split(',')
          .map(t => t.trim())
          .filter(t => t.length > 0);

        const proj = registry.createProject(
          newProjName,
          newProjDesc || 'No technical outline provided.',
          newProjType,
          settings.activeWorkspace,
          'System Operator',
          newProjPriority,
          newProjCategory || 'Standard',
          tagList
        );

        // Update fields if provided
        if (newProjClient.trim() || newProjCategory.trim()) {
          registry.updateProject(proj.id, {
            client: newProjClient || undefined,
            category: newProjCategory || 'Standard'
          });
        }
        triggerToast('success', `Custom project "${proj.name}" registered successfully.`);
      }

      // Reset and refresh
      setShowCreateModal(false);
      setNewProjName('');
      setNewProjDesc('');
      setNewProjCategory('');
      setNewProjClient('');
      setNewProjTags('');
      refreshProjectsList();
    } catch (err: any) {
      triggerToast('error', err.message || 'Failed to initialize project.');
    }
  };

  // Archive Project
  const handleArchiveProject = () => {
    if (!currentProject) return;
    const isArchived = currentProject.archiveStatus;
    if (isArchived) {
      registry.restoreProject(currentProject.id);
      triggerToast('success', `Restored "${currentProject.name}" to active rosters.`);
    } else {
      registry.archiveProject(currentProject.id);
      triggerToast('warning', `Archived "${currentProject.name}". Background operations paused.`);
    }
    refreshProjectsList();
  };

  // Clone Project
  const handleCloneProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject || !cloneNewName.trim()) return;

    const cloned = registry.cloneProject(currentProject.id, cloneNewName);
    if (cloned) {
      triggerToast('success', `Successfully cloned into "${cloned.name}".`);
      setSelectedProjectId(cloned.id);
      setShowCloneModal(false);
      setCloneNewName('');
      setActiveTab('dashboard');
      refreshProjectsList();
    } else {
      triggerToast('error', 'Cloning failed.');
    }
  };

  // Delete Project
  const handleDeleteProject = () => {
    if (!currentProject) return;
    const name = currentProject.name;
    const success = registry.deleteProject(currentProject.id);
    if (success) {
      triggerToast('error', `Permanently deleted project "${name}".`);
      setSelectedProjectId(null);
      refreshProjectsList();
    }
  };

  // Add Task
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject || !taskTitle.trim()) return;

    const t = registry.addTask(currentProject.id, {
      title: taskTitle,
      description: taskDesc || 'No structural criteria defined.',
      status: 'Todo',
      priority: taskPriority,
      dueDate: taskDueDate,
      assignedTo: taskAssignedTo || undefined
    });

    if (t) {
      triggerToast('success', `Deliverable "${t.title}" added to active tasks.`);
      setTaskTitle('');
      setTaskDesc('');
      setTaskAssignedTo('');
      setShowAddTaskForm(false);
      refreshProjectsList();
    }
  };

  // Update Task Status
  const handleUpdateTaskStatus = (taskId: string, status: ProjectTask['status']) => {
    if (!currentProject) return;
    registry.updateTaskStatus(currentProject.id, taskId, status);
    refreshProjectsList();
  };

  // Add Member
  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject || !memberName.trim() || !memberEmail.trim()) return;

    const id = memberUserId.trim() || `usr-${Math.random().toString(36).substring(2, 7)}`;
    const success = registry.addMember(currentProject.id, {
      userId: id,
      name: memberName,
      role: memberRole,
      department: memberDept || 'Operations',
      email: memberEmail
    });

    if (success) {
      triggerToast('success', `Added "${memberName}" with role ${memberRole}.`);
      setMemberUserId('');
      setMemberName('');
      setMemberDept('');
      setMemberEmail('');
      setShowAddMemberForm(false);
      refreshProjectsList();
    } else {
      triggerToast('error', 'User is already registered inside this workspace.');
    }
  };

  // Remove Member
  const handleRemoveMember = (userId: string) => {
    if (!currentProject) return;
    if (userId === 'usr-operator') {
      triggerToast('error', 'The Workspace Owner or System Operator cannot be removed.');
      return;
    }
    const success = registry.removeMember(currentProject.id, userId);
    if (success) {
      triggerToast('warning', 'Removed member from project access roster.');
      refreshProjectsList();
    }
  };

  // Trigger Context Prompt Compiler
  const handleCompilePrompt = () => {
    if (!currentProject) return;
    const compiled = integrationEngine.compileWorkspacePrompt(currentProject, aiQuery, {
      includeTasks,
      includeTeam,
      includeKms,
      includeMemory
    });
    setCompiledPrompt(compiled.compiledMarkdown);
    setEstimatedTokens(compiled.tokenEstimate);
    triggerToast('info', 'Compiled dense workspace markdown prompt.');
  };

  // Run AI Analysis via Gateway
  const handleRunAiAnalysis = async () => {
    if (!currentProject) return;
    
    // Auto compile if prompt is empty
    let promptToRun = compiledPrompt;
    if (!promptToRun) {
      const compiled = integrationEngine.compileWorkspacePrompt(currentProject, aiQuery, {
        includeTasks,
        includeTeam,
        includeKms,
        includeMemory
      });
      promptToRun = compiled.compiledMarkdown;
      setCompiledPrompt(compiled.compiledMarkdown);
      setEstimatedTokens(compiled.tokenEstimate);
    }

    setAiLoading(true);
    setAiOutput('');
    setAiLatency(null);

    try {
      const response = await integrationEngine.executeProjectAnalysis(
        currentProject,
        promptToRun,
        selectedAiProvider
      );
      setAiOutput(response.responseText);
      setAiLatency(response.latencyMs);
      setAiModelUsed(response.modelUsed);
      triggerToast('success', 'AI evaluation complete.');
    } catch (err: any) {
      triggerToast('error', 'Gateway error.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="border-b border-slate-900 pb-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-slate-100 font-sans flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-cyan-400" />
              <span>Project Management Workspaces</span>
            </h1>
            <DSBadge variant="outline" color="cyan">
              {settings.activeWorkspace} Active
            </DSBadge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Centrally manage isolated projects, schedule compliance tasks, inspect telemetry, and compile context-bounded prompts.
          </p>
        </div>

        {!selectedProjectId && (
          <DSButton
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setShowCreateModal(true)}
          >
            Create Program Workspace
          </DSButton>
        )}
      </div>

      {/* 2. MAIN WORKSPACE VIEW (Conditional Rendering) */}
      {!selectedProjectId ? (
        <div className="space-y-6">
          {/* A. Statistics Panels */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <DSCard variant="metric">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Tracked Projects</span>
              <div className="text-xl font-bold font-mono text-slate-100 mt-1">{stats.total}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Isolated to {settings.activeWorkspace}</div>
            </DSCard>
            <DSCard variant="metric">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Healthy Systems</span>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-1">{stats.healthy}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Green light state</div>
            </DSCard>
            <DSCard variant="metric">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">At Risk / Critical</span>
              <div className={`text-xl font-bold font-mono mt-1 ${stats.critical > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                {projectsList.filter(p => p.health !== 'healthy').length}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Failing telemetry thresholds</div>
            </DSCard>
            <DSCard variant="metric">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">KMS Workspace Storage</span>
              <div className="text-xl font-bold font-mono text-cyan-400 mt-1">{stats.totalStorage} MB</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Active data buffers</div>
            </DSCard>
          </div>

          {/* B. Filter & Search Controls */}
          <div className="p-4 border border-slate-900 bg-slate-950/40 rounded-sm flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search projects, tags, categories..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 text-xs rounded-xs py-2 pl-9 pr-4 text-slate-100 focus:outline-none font-sans"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-500" />
                <span>Filters:</span>
              </div>
              <select
                value={filterPriority}
                onChange={e => setFilterPriority(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 py-1 px-2.5 rounded-xs"
              >
                <option value="all">Priority: All</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>

              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 py-1 px-2.5 rounded-xs"
              >
                <option value="all">Status: All</option>
                <option value="Active">Active</option>
                <option value="Paused">Paused</option>
                <option value="On Hold">On Hold</option>
                <option value="Archived">Archived</option>
                <option value="Completed">Completed</option>
              </select>

              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 py-1 px-2.5 rounded-xs"
              >
                <option value="all">Type: All</option>
                <option value="engineering">Engineering</option>
                <option value="packaging">Packaging</option>
                <option value="learning">Learning</option>
                <option value="business">Business</option>
                <option value="personal">Personal</option>
              </select>
            </div>
          </div>

          {/* C. Projects Grid list */}
          {filteredProjects.length === 0 ? (
            <DSEmptyState
              title="No Isolated Projects Registered"
              description="Either search parameters are too tight, or no projects are seeded for this specific workspace yet."
              action={
                <DSButton
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setFilterPriority('all');
                    setFilterStatus('all');
                    setFilterType('all');
                    triggerToast('info', 'Filters reset to default.');
                  }}
                >
                  Clear Filters
                </DSButton>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map(proj => {
                const api = integrationEngine.getProjectAPIMetadata(proj);
                const progress = proj.tasks.length > 0
                  ? Math.round((proj.tasks.filter(t => t.status === 'Done').length / proj.tasks.length) * 100)
                  : 0;

                const healthColors = {
                  healthy: 'emerald',
                  at_risk: 'amber',
                  critical: 'rose'
                };

                return (
                  <DSCard
                    key={proj.id}
                    variant="interactive"
                    onClick={() => {
                      setSelectedProjectId(proj.id);
                      setActiveTab('dashboard');
                    }}
                    className="flex flex-col justify-between"
                  >
                    <DSCardHeader className="pb-3">
                      <div>
                        <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-500 uppercase">
                          <span>{proj.category}</span>
                          <span>•</span>
                          <span>{proj.type}</span>
                        </div>
                        <DSCardTitle className="text-sm font-semibold mt-1 text-slate-100 group-hover:text-cyan-400">
                          {proj.name}
                        </DSCardTitle>
                      </div>
                      <DSBadge variant="outline" color={healthColors[proj.health] as any}>
                        {proj.health}
                      </DSBadge>
                    </DSCardHeader>

                    <DSCardContent className="py-2.5 space-y-4">
                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                        {proj.description}
                      </p>

                      {/* Progress bar */}
                      <div>
                        <div className="flex justify-between items-center text-[10px] font-mono mb-1">
                          <span className="text-slate-500">Deliverables</span>
                          <span className="text-slate-300 font-semibold">{progress}% Done</span>
                        </div>
                        <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-950">
                          <div
                            className="bg-cyan-500 h-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1">
                        {proj.tags.map((t, idx) => (
                          <span key={idx} className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 text-[9px] font-mono text-slate-500 rounded-xs">
                            #{t}
                          </span>
                        ))}
                      </div>
                    </DSCardContent>

                    <DSCardFooter className="text-[10px] font-mono pt-2">
                      <div className="flex items-center gap-2.5 text-slate-500">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-slate-600" /> {proj.members.length}
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5 text-slate-600" /> {api.documentsCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <Brain className="w-3.5 h-3.5 text-slate-600" /> {api.memoryNodesCount}
                        </span>
                      </div>
                      <span className={`font-semibold ${proj.priority === 'Critical' ? 'text-rose-400' : 'text-slate-400'}`}>
                        {proj.priority}
                      </span>
                    </DSCardFooter>
                  </DSCard>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* 3. SELECTED INDIVIDUAL PROJECT DESKTOP/MOBILE WORKSPACE */
        <div className="space-y-6">
          {/* Project Control Ribbon Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-slate-950 p-4 border border-slate-900 rounded-sm">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedProjectId(null)}
                className="p-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono bg-slate-900 px-1.5 py-0.5 text-slate-500 rounded-xs uppercase">
                    ID: {currentProject?.id}
                  </span>
                  {currentProject?.client && (
                    <span className="text-[9px] font-mono text-cyan-400">
                      Client: {currentProject.client}
                    </span>
                  )}
                </div>
                <h2 className="text-base font-bold text-slate-100 font-sans mt-0.5">
                  {currentProject?.name}
                </h2>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <DSBadge variant="outline" color={currentProject?.health === 'healthy' ? 'emerald' : currentProject?.health === 'at_risk' ? 'amber' : 'rose'}>
                Health: {currentProject?.health}
              </DSBadge>
              <DSBadge variant="solid" color="slate">
                {currentProject?.status}
              </DSBadge>

              <DSButton
                variant="tertiary"
                size="sm"
                leftIcon={<Archive className="w-3.5 h-3.5" />}
                onClick={handleArchiveProject}
              >
                {currentProject?.archiveStatus ? 'Restore' : 'Archive'}
              </DSButton>

              <DSButton
                variant="tertiary"
                size="sm"
                leftIcon={<Copy className="w-3.5 h-3.5" />}
                onClick={() => {
                  setCloneNewName(`${currentProject?.name} (Copy)`);
                  setShowCloneModal(true);
                }}
              >
                Clone
              </DSButton>

              <DSButton
                variant="danger"
                size="sm"
                leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                onClick={() => {
                  if (confirm('Permanently wipe this isolated project? This will also clear activity logs.')) {
                    handleDeleteProject();
                  }
                }}
              >
                Delete
              </DSButton>
            </div>
          </div>

          {/* Navigation tabs */}
          <div className="flex border-b border-slate-900 overflow-x-auto gap-1">
            {(['dashboard', 'tasks', 'integrations', 'ai-assistant', 'team', 'settings'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-4 text-xs font-medium font-sans border-b-2 transition-all cursor-pointer whitespace-nowrap capitalize ${
                  activeTab === tab
                    ? 'border-cyan-500 text-cyan-400 font-semibold bg-slate-950/20'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.replace('-', ' ')}
              </button>
            ))}
          </div>

          {/* TAB CONTENTS CONTAINER */}
          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {currentProject && activeTab === 'dashboard' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {/* Grid Dashboard Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <DSCard variant="metric" className="py-4">
                      <span className="text-[9px] uppercase font-mono text-slate-500">Progress</span>
                      <div className="text-lg font-bold font-mono text-cyan-400 mt-0.5">{projectProgress}%</div>
                    </DSCard>
                    <DSCard variant="metric" className="py-4">
                      <span className="text-[9px] uppercase font-mono text-slate-500">Total Tasks</span>
                      <div className="text-lg font-bold font-mono text-slate-200 mt-0.5">{currentProject.tasks.length}</div>
                    </DSCard>
                    <DSCard variant="metric" className="py-4">
                      <span className="text-[9px] uppercase font-mono text-slate-500">Team Size</span>
                      <div className="text-lg font-bold font-mono text-slate-200 mt-0.5">{currentProject.members.length}</div>
                    </DSCard>
                    <DSCard variant="metric" className="py-4">
                      <span className="text-[9px] uppercase font-mono text-slate-500">KMS Links</span>
                      <div className="text-lg font-bold font-mono text-slate-200 mt-0.5">
                        {integrationEngine.getProjectAPIMetadata(currentProject).knowledgeLinksCount}
                      </div>
                    </DSCard>
                    <DSCard variant="metric" className="py-4">
                      <span className="text-[9px] uppercase font-mono text-slate-500">Memories</span>
                      <div className="text-lg font-bold font-mono text-slate-200 mt-0.5">
                        {integrationEngine.getProjectAPIMetadata(currentProject).memoryNodesCount}
                      </div>
                    </DSCard>
                    <DSCard variant="metric" className="py-4">
                      <span className="text-[9px] uppercase font-mono text-slate-500">Disk Weight</span>
                      <div className="text-lg font-bold font-mono text-amber-500 mt-0.5">
                        {integrationEngine.getProjectAPIMetadata(currentProject).storageUsageMb} MB
                      </div>
                    </DSCard>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left details */}
                    <div className="lg:col-span-2 space-y-6">
                      <DSCard variant="bordered">
                        <DSCardHeader>
                          <DSCardTitle className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-cyan-500" />
                            <span>Executive Summary Outline</span>
                          </DSCardTitle>
                        </DSCardHeader>
                        <DSCardContent className="space-y-4">
                          <p className="text-xs text-slate-300 leading-relaxed font-sans">
                            {currentProject.description}
                          </p>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border-t border-slate-900 pt-4 text-xs font-mono">
                            <div>
                              <span className="text-slate-500 block">Workspace Class</span>
                              <span className="text-slate-200 font-semibold uppercase">{currentProject.workspace}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block">Client Partner</span>
                              <span className="text-slate-200 font-semibold">{currentProject.client || 'JNAS Internal'}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block">Department Sector</span>
                              <span className="text-slate-200 font-semibold">{currentProject.department}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block">Category</span>
                              <span className="text-slate-200 font-semibold">{currentProject.category}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block">Security Sign-Off</span>
                              <span className="text-slate-200 font-semibold">1.0.0-PROD</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block">Priority</span>
                              <span className="text-rose-400 font-semibold">{currentProject.priority}</span>
                            </div>
                          </div>
                        </DSCardContent>
                      </DSCard>

                      {/* Running processes simulation */}
                      <DSCard variant="bordered">
                        <DSCardHeader>
                          <DSCardTitle className="flex items-center gap-2">
                            <Cpu className="w-4 h-4 text-cyan-400 animate-pulse" />
                            <span>Active System Workflows & Pipeline Tests</span>
                          </DSCardTitle>
                        </DSCardHeader>
                        <DSCardContent className="p-0">
                          {integrationEngine.getLinkedWorkflows(currentProject).length === 0 ? (
                            <p className="p-5 text-xs text-slate-500 italic">No background pipeline simulations currently running.</p>
                          ) : (
                            <div className="divide-y divide-slate-900">
                              {integrationEngine.getLinkedWorkflows(currentProject).map(wf => (
                                <div key={wf.id} className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 font-sans text-xs">
                                  <div>
                                    <h4 className="font-semibold text-slate-200">{wf.name}</h4>
                                    <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                                      Stage: <span className="text-cyan-400">{wf.stage}</span>
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3 font-mono text-[10px]">
                                    <span className="text-slate-500">Run: {wf.elapsedMinutes}m</span>
                                    <DSBadge variant="outline" color={wf.status === 'Running' ? 'cyan' : 'emerald'}>
                                      {wf.status}
                                    </DSBadge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </DSCardContent>
                      </DSCard>
                    </div>

                    {/* Right audit feed */}
                    <div className="space-y-6">
                      <DSCard variant="bordered" className="h-full flex flex-col">
                        <DSCardHeader>
                          <DSCardTitle className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-cyan-400" />
                            <span>Project Action Trails</span>
                          </DSCardTitle>
                        </DSCardHeader>
                        <div className="flex-1 overflow-y-auto max-h-[400px] p-5 space-y-4">
                          {registry.getLogs(currentProject.id).length === 0 ? (
                            <p className="text-xs text-slate-500 italic">No actions logged inside this workspace yet.</p>
                          ) : (
                            <div className="relative border-l border-slate-900 ml-2 pl-4 space-y-4">
                              {registry.getLogs(currentProject.id).slice(0, 10).map(log => (
                                <div key={log.id} className="relative text-xs">
                                  <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-slate-950 border border-cyan-500 shrink-0" />
                                  <span className="text-[9px] font-mono text-slate-500 block">
                                    {new Date(log.timestamp).toLocaleTimeString()}
                                  </span>
                                  <div className="font-semibold text-slate-200 mt-0.5">{log.actionType}</div>
                                  <p className="text-slate-400 text-[11px] mt-0.5 leading-normal">{log.details}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </DSCard>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TASKS SANDBOX TAB */}
              {currentProject && activeTab === 'tasks' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center bg-slate-950 p-4 border border-slate-900 rounded-sm">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                        <CheckSquare className="w-4 h-4 text-cyan-400" />
                        <span>Project Deliverables Ledger</span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">Define deliverables, set critical priorities, and allocate personnel.</p>
                    </div>

                    <DSButton
                      variant="outline"
                      size="sm"
                      leftIcon={<PlusCircle className="w-4 h-4" />}
                      onClick={() => setShowAddTaskForm(!showAddTaskForm)}
                    >
                      {showAddTaskForm ? 'Close Drawer' : 'Add Task'}
                    </DSButton>
                  </div>

                  {/* Add Task Form Drawer */}
                  {showAddTaskForm && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="border border-slate-900 p-5 bg-slate-950/80 rounded-sm"
                    >
                      <form onSubmit={handleAddTask} className="space-y-4">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Add New Deliverable</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[11px] text-slate-400 font-mono">Task Title</label>
                            <input
                              type="text"
                              required
                              value={taskTitle}
                              onChange={e => setTaskTitle(e.target.value)}
                              placeholder="e.g. Conduct FEA mesh calibrations"
                              className="w-full bg-slate-950 border border-slate-800 text-xs rounded-xs p-2 text-slate-100"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] text-slate-400 font-mono">Assigned To</label>
                            <select
                              value={taskAssignedTo}
                              onChange={e => setTaskAssignedTo(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 text-xs rounded-xs p-2 text-slate-300"
                            >
                              <option value="">Unassigned</option>
                              {currentProject.members.map(m => (
                                <option key={m.userId} value={m.name}>{m.name} ({m.role})</option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] text-slate-400 font-mono">Priority</label>
                            <select
                              value={taskPriority}
                              onChange={e => setTaskPriority(e.target.value as any)}
                              className="w-full bg-slate-950 border border-slate-800 text-xs rounded-xs p-2 text-slate-300"
                            >
                              <option value="Low">Low</option>
                              <option value="Medium">Medium</option>
                              <option value="High">High</option>
                              <option value="Critical">Critical</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] text-slate-400 font-mono">Due Date</label>
                            <input
                              type="date"
                              required
                              value={taskDueDate}
                              onChange={e => setTaskDueDate(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 text-xs rounded-xs p-2 text-slate-100 font-mono"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] text-slate-400 font-mono">Description / Stress Parameters</label>
                          <textarea
                            value={taskDesc}
                            onChange={e => setTaskDesc(e.target.value)}
                            placeholder="Enter specific verification requirements..."
                            className="w-full bg-slate-950 border border-slate-800 text-xs rounded-xs p-2 text-slate-100 h-16"
                          />
                        </div>

                        <div className="flex justify-end gap-2">
                          <DSButton variant="tertiary" size="sm" type="button" onClick={() => setShowAddTaskForm(false)}>
                            Cancel
                          </DSButton>
                          <DSButton variant="primary" size="sm" type="submit">
                            Save Task
                          </DSButton>
                        </div>
                      </form>
                    </motion.div>
                  )}

                  {/* Tasks Table */}
                  <DSCard variant="bordered">
                    {currentProject.tasks.length === 0 ? (
                      <p className="p-8 text-xs text-slate-500 italic text-center">No tasks assigned to this project. Create one above!</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-slate-900 bg-slate-950 font-mono text-[10px] text-slate-500 uppercase">
                              <th className="p-4">Deliverable</th>
                              <th className="p-4">Assignee</th>
                              <th className="p-4">Priority</th>
                              <th className="p-4">Due Date</th>
                              <th className="p-4">Status</th>
                              <th className="p-4 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-900">
                            {currentProject.tasks.map(t => (
                              <tr key={t.id} className="hover:bg-slate-950/20 font-sans">
                                <td className="p-4">
                                  <div className="font-semibold text-slate-200">{t.title}</div>
                                  <div className="text-[10px] text-slate-500 mt-0.5">{t.description}</div>
                                </td>
                                <td className="p-4 font-medium text-slate-300">
                                  {t.assignedTo || <span className="text-slate-600 italic">Unassigned</span>}
                                </td>
                                <td className="p-4">
                                  <span className={`font-mono text-[10px] font-bold ${
                                    t.priority === 'Critical' ? 'text-rose-400' : t.priority === 'High' ? 'text-amber-400' : 'text-slate-400'
                                  }`}>
                                    {t.priority}
                                  </span>
                                </td>
                                <td className="p-4 font-mono text-[10px] text-slate-400">{t.dueDate}</td>
                                <td className="p-4">
                                  <span className={`px-2 py-0.5 border text-[9px] rounded-xs font-mono font-bold ${
                                    t.status === 'Done' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-950/10' :
                                    t.status === 'In Review' ? 'border-amber-500/30 text-amber-400 bg-amber-950/10' :
                                    t.status === 'In Progress' ? 'border-cyan-500/30 text-cyan-400 bg-cyan-950/10' :
                                    'border-slate-800 text-slate-500 bg-slate-950'
                                  }`}>
                                    {t.status}
                                  </span>
                                </td>
                                <td className="p-4 text-right">
                                  <select
                                    value={t.status}
                                    onChange={e => handleUpdateTaskStatus(t.id, e.target.value as any)}
                                    className="bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-300 py-1 px-1.5 rounded-xs"
                                  >
                                    <option value="Todo">Set Todo</option>
                                    <option value="In Progress">Set Progress</option>
                                    <option value="In Review">Set Review</option>
                                    <option value="Done">Set Done</option>
                                    <option value="Backlog">Set Backlog</option>
                                  </select>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </DSCard>
                </motion.div>
              )}

              {/* INTEGRATIONS TAB */}
              {currentProject && activeTab === 'integrations' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  {/* KMS Knowledge links */}
                  <DSCard variant="bordered">
                    <DSCardHeader>
                      <DSCardTitle className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-cyan-400" />
                        <span>KMS Standards & Reference Links</span>
                      </DSCardTitle>
                    </DSCardHeader>
                    <DSCardContent className="p-0">
                      <div className="divide-y divide-slate-900">
                        {integrationEngine.getLinkedKnowledgeNodes(currentProject).map(node => (
                          <div key={node.id} className="p-4 flex justify-between items-center gap-3 text-xs font-sans">
                            <div>
                              <h4 className="font-semibold text-slate-200">{node.title}</h4>
                              <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">KMS Node: {node.id}</span>
                            </div>
                            <div className="text-right font-mono text-[10px]">
                              <span className="text-emerald-400 block font-semibold">Match: {(node.relevanceScore * 100).toFixed(0)}%</span>
                              <span className="text-slate-500 text-[9px] block">Verified: {node.lastVerified}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </DSCardContent>
                  </DSCard>

                  {/* Memory logs */}
                  <DSCard variant="bordered">
                    <DSCardHeader>
                      <DSCardTitle className="flex items-center gap-2">
                        <Brain className="w-4 h-4 text-cyan-400" />
                        <span>Connected Memory Engine States</span>
                      </DSCardTitle>
                    </DSCardHeader>
                    <DSCardContent className="p-0">
                      <div className="divide-y divide-slate-900">
                        {integrationEngine.getLinkedMemoryNodes(currentProject).map(mem => (
                          <div key={mem.id} className="p-4 space-y-2 text-xs font-sans">
                            <div className="flex justify-between items-center">
                              <DSBadge variant="outline" color={mem.category === 'compliance' ? 'rose' : mem.category === 'technical' ? 'cyan' : 'slate'}>
                                {mem.category}
                              </DSBadge>
                              <span className="text-[10px] text-slate-500 font-mono">{mem.timestamp}</span>
                            </div>
                            <p className="text-slate-300 leading-normal italic">
                              "{mem.thought}"
                            </p>
                          </div>
                        ))}
                      </div>
                    </DSCardContent>
                  </DSCard>

                  {/* AI Agents assigned */}
                  <DSCard variant="bordered" className="md:col-span-2">
                    <DSCardHeader>
                      <DSCardTitle className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-cyan-400" />
                        <span>Assigned AI Expert Personas</span>
                      </DSCardTitle>
                    </DSCardHeader>
                    <DSCardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {integrationEngine.getLinkedAgents(currentProject).map(agent => (
                        <div key={agent.id} className="p-4 border border-slate-900 bg-slate-950/20 rounded-sm flex gap-3.5 items-start text-xs font-sans">
                          <span className="text-2xl p-2 bg-slate-900 border border-slate-800 rounded-sm shrink-0 select-none">
                            {agent.avatar}
                          </span>
                          <div className="space-y-1.5">
                            <h4 className="font-bold text-slate-100">{agent.name}</h4>
                            <span className="text-[10px] text-cyan-400 font-semibold block">{agent.specialty}</span>
                            <p className="text-slate-400 text-[11px] leading-relaxed italic border-t border-slate-900/60 pt-1.5">
                              "{agent.systemPrompt}"
                            </p>
                          </div>
                        </div>
                      ))}
                    </DSCardContent>
                  </DSCard>
                </motion.div>
              )}

              {/* AI ASSISTANT & RAG TAB */}
              {currentProject && activeTab === 'ai-assistant' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Input controls column */}
                    <div className="space-y-6 lg:col-span-1">
                      <DSCard variant="bordered">
                        <DSCardHeader>
                          <DSCardTitle className="flex items-center gap-2">
                            <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
                            <span>Playground Criteria</span>
                          </DSCardTitle>
                        </DSCardHeader>
                        <DSCardContent className="space-y-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Gateway Provider</label>
                            <select
                              value={selectedAiProvider}
                              onChange={e => setSelectedAiProvider(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 text-xs rounded-xs p-2 text-slate-300 font-mono"
                            >
                              <option value="gemini">Google Gemini 1.5 (High Priority)</option>
                              <option value="anthropic">Anthropic Claude 3.5</option>
                              <option value="openai">OpenAI GPT-4o</option>
                              <option value="ollama">Ollama Local Kernel</option>
                            </select>
                          </div>

                          <div className="space-y-2 pt-2 border-t border-slate-900/60">
                            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block">Include Context Blocks</span>
                            
                            <label className="flex items-center gap-2.5 text-xs text-slate-300 select-none cursor-pointer">
                              <input
                                type="checkbox"
                                checked={includeTasks}
                                onChange={e => setIncludeTasks(e.target.checked)}
                                className="rounded-xs accent-cyan-500"
                              />
                              <span>Active Deliverables (Tasks)</span>
                            </label>

                            <label className="flex items-center gap-2.5 text-xs text-slate-300 select-none cursor-pointer">
                              <input
                                type="checkbox"
                                checked={includeTeam}
                                onChange={e => setIncludeTeam(e.target.checked)}
                                className="rounded-xs accent-cyan-500"
                              />
                              <span>Authorized Access Roster</span>
                            </label>

                            <label className="flex items-center gap-2.5 text-xs text-slate-300 select-none cursor-pointer">
                              <input
                                type="checkbox"
                                checked={includeKms}
                                onChange={e => setIncludeKms(e.target.checked)}
                                className="rounded-xs accent-cyan-500"
                              />
                              <span>KMS Technical References</span>
                            </label>

                            <label className="flex items-center gap-2.5 text-xs text-slate-300 select-none cursor-pointer">
                              <input
                                type="checkbox"
                                checked={includeMemory}
                                onChange={e => setIncludeMemory(e.target.checked)}
                                className="rounded-xs accent-cyan-500"
                              />
                              <span>Memory Engine Observation Streams</span>
                            </label>
                          </div>

                          <div className="space-y-1.5 pt-2 border-t border-slate-900/60">
                            <label className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Query / Analytical Scope</label>
                            <textarea
                              value={aiQuery}
                              onChange={e => setAiQuery(e.target.value)}
                              placeholder="Write prompt instructions..."
                              className="w-full bg-slate-950 border border-slate-800 text-xs rounded-xs p-2.5 text-slate-100 h-24"
                            />
                          </div>

                          <div className="flex gap-2.5 pt-2">
                            <DSButton variant="tertiary" size="sm" className="flex-1" onClick={handleCompilePrompt}>
                              Compile Draft
                            </DSButton>
                            <DSButton
                              variant="primary"
                              size="sm"
                              className="flex-1"
                              loading={aiLoading}
                              leftIcon={<Send className="w-3.5 h-3.5" />}
                              onClick={handleRunAiAnalysis}
                            >
                              Run Analysis
                            </DSButton>
                          </div>
                        </DSCardContent>
                      </DSCard>
                    </div>

                    {/* Output columns */}
                    <div className="lg:col-span-2 space-y-6">
                      {/* Compiler preview */}
                      <DSCard variant="bordered">
                        <DSCardHeader className="py-2.5">
                          <DSCardTitle className="text-xs font-mono text-slate-400">Compiled Context Token Boundary</DSCardTitle>
                          {estimatedTokens > 0 && (
                            <span className="text-[10px] font-mono text-cyan-400 font-semibold bg-cyan-950/10 px-2 py-0.5 border border-cyan-900/30">
                              ~{estimatedTokens} Tokens
                            </span>
                          )}
                        </DSCardHeader>
                        <DSCardContent className="p-0">
                          {compiledPrompt ? (
                            <pre className="p-4 bg-slate-950 font-mono text-[10px] text-slate-400 overflow-x-auto max-h-[160px] leading-relaxed break-all select-all whitespace-pre-wrap">
                              {compiledPrompt}
                            </pre>
                          ) : (
                            <p className="p-8 text-xs text-slate-500 italic text-center">Click "Compile Draft" to serialize the context payload.</p>
                          )}
                        </DSCardContent>
                      </DSCard>

                      {/* AI Response output terminal */}
                      <DSCard variant="bordered" className="bg-slate-950 flex flex-col h-[340px]">
                        <DSCardHeader className="py-3 border-b border-slate-900 flex justify-between items-center shrink-0">
                          <DSCardTitle className="flex items-center gap-2 text-xs font-semibold">
                            <Cpu className="w-4 h-4 text-cyan-400" />
                            <span>AI Provider Gateway Telemetry</span>
                          </DSCardTitle>
                          {aiLatency !== null && (
                            <span className="text-[9px] font-mono text-slate-500">
                              Latency: <span className="text-emerald-400">{aiLatency}ms</span> | Model: <span className="text-cyan-400">{aiModelUsed}</span>
                            </span>
                          )}
                        </DSCardHeader>
                        <div className="flex-1 overflow-y-auto p-5 font-sans text-xs leading-relaxed text-slate-300">
                          {aiLoading ? (
                            <div className="flex flex-col items-center justify-center h-full gap-3">
                              <motion.span
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                                className="text-cyan-400"
                              >
                                <RefreshCw className="w-6 h-6" />
                              </motion.span>
                              <span className="text-[10px] font-mono text-slate-500 animate-pulse uppercase">Querying Gateway Kernels...</span>
                            </div>
                          ) : aiOutput ? (
                            <div className="whitespace-pre-wrap prose prose-invert prose-xs">
                              {aiOutput}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 p-6">
                              <Brain className="w-8 h-8 text-slate-600 mb-2" />
                              <p className="text-xs">Gateway prompt buffer is empty.</p>
                              <p className="text-[10px] text-slate-600 mt-0.5">Define your parameters on the left and click "Run Analysis" to retrieve. If keys are missing, safe simulation routines are launched automatically.</p>
                            </div>
                          )}
                        </div>
                      </DSCard>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TEAM ROSTER TAB */}
              {currentProject && activeTab === 'team' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center bg-slate-950 p-4 border border-slate-900 rounded-sm">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                        <Users className="w-4 h-4 text-cyan-400" />
                        <span>Security Access Roster</span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">Review access clearances and add authorized corporate personnel.</p>
                    </div>

                    <DSButton
                      variant="outline"
                      size="sm"
                      leftIcon={<PlusCircle className="w-4 h-4" />}
                      onClick={() => setShowAddMemberForm(!showAddMemberForm)}
                    >
                      {showAddMemberForm ? 'Close Drawer' : 'Grant Access'}
                    </DSButton>
                  </div>

                  {/* Add Member Form Drawer */}
                  {showAddMemberForm && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="border border-slate-900 p-5 bg-slate-950/80 rounded-sm"
                    >
                      <form onSubmit={handleAddMember} className="space-y-4">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Assign New Personnel Space</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[11px] text-slate-400 font-mono">User ID (Optional)</label>
                            <input
                              type="text"
                              value={memberUserId}
                              onChange={e => setMemberUserId(e.target.value)}
                              placeholder="e.g. usr-elena"
                              className="w-full bg-slate-950 border border-slate-800 text-xs rounded-xs p-2 text-slate-100"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] text-slate-400 font-mono">Full Name</label>
                            <input
                              type="text"
                              required
                              value={memberName}
                              onChange={e => setMemberName(e.target.value)}
                              placeholder="e.g. Elena Rostova"
                              className="w-full bg-slate-950 border border-slate-800 text-xs rounded-xs p-2 text-slate-100"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] text-slate-400 font-mono">Role Clearance</label>
                            <select
                              value={memberRole}
                              onChange={e => setMemberRole(e.target.value as any)}
                              className="w-full bg-slate-950 border border-slate-800 text-xs rounded-xs p-2 text-slate-300"
                            >
                              <option value="Manager">Manager</option>
                              <option value="Member">Member</option>
                              <option value="Viewer">Viewer</option>
                              <option value="Guest">Guest</option>
                              <option value="Administrator">Administrator</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] text-slate-400 font-mono">Department</label>
                            <input
                              type="text"
                              required
                              value={memberDept}
                              onChange={e => setMemberDept(e.target.value)}
                              placeholder="e.g. QA Compliance"
                              className="w-full bg-slate-950 border border-slate-800 text-xs rounded-xs p-2 text-slate-100"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] text-slate-400 font-mono">Secure Email</label>
                          <input
                            type="email"
                            required
                            value={memberEmail}
                            onChange={e => setMemberEmail(e.target.value)}
                            placeholder="e.g. e.rostova@jnas.space"
                            className="w-full bg-slate-950 border border-slate-800 text-xs rounded-xs p-2 text-slate-100 font-mono"
                          />
                        </div>

                        <div className="flex justify-end gap-2">
                          <DSButton variant="tertiary" size="sm" type="button" onClick={() => setShowAddMemberForm(false)}>
                            Cancel
                          </DSButton>
                          <DSButton variant="primary" size="sm" type="submit">
                            Authorize User
                          </DSButton>
                        </div>
                      </form>
                    </motion.div>
                  )}

                  {/* Roster table */}
                  <DSCard variant="bordered">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-900 bg-slate-950 font-mono text-[10px] text-slate-500 uppercase">
                            <th className="p-4">Personnel</th>
                            <th className="p-4">Role Clearance</th>
                            <th className="p-4">Department</th>
                            <th className="p-4">Secure Email</th>
                            <th className="p-4 text-right">Access Controls</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-900">
                          {currentProject.members.map(m => (
                            <tr key={m.userId} className="hover:bg-slate-950/20 font-sans">
                              <td className="p-4 font-semibold text-slate-200">
                                <div>{m.name}</div>
                                <span className="text-[9px] font-mono text-slate-600 mt-0.5 block">ID: {m.userId}</span>
                              </td>
                              <td className="p-4">
                                <span className={`px-2 py-0.5 border text-[9px] rounded-xs font-mono font-bold ${
                                  m.role === 'Owner' || m.role === 'Administrator' ? 'border-rose-500/30 text-rose-400 bg-rose-950/10' :
                                  m.role === 'Manager' ? 'border-amber-500/30 text-amber-400 bg-amber-950/10' :
                                  m.role === 'Member' ? 'border-cyan-500/30 text-cyan-400 bg-cyan-950/10' :
                                  'border-slate-800 text-slate-500 bg-slate-950'
                                }`}>
                                  {m.role}
                                </span>
                              </td>
                              <td className="p-4 text-slate-300 font-mono text-[11px]">{m.department}</td>
                              <td className="p-4 text-slate-400 font-mono text-[11px]">{m.email}</td>
                              <td className="p-4 text-right">
                                <DSButton
                                  variant="ghost"
                                  size="sm"
                                  className="text-rose-400 hover:text-rose-300 p-1"
                                  onClick={() => {
                                    if (confirm(`Remove access for ${m.name}?`)) {
                                      handleRemoveMember(m.userId);
                                    }
                                  }}
                                  disabled={m.userId === 'usr-operator'}
                                >
                                  Revoke Clearances
                                </DSButton>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </DSCard>
                </motion.div>
              )}

              {/* SETTINGS TAB */}
              {currentProject && activeTab === 'settings' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="max-w-xl mx-auto space-y-6"
                >
                  <DSCard variant="bordered">
                    <DSCardHeader>
                      <DSCardTitle className="flex items-center gap-2">
                        <Settings className="w-4 h-4 text-cyan-400" />
                        <span>Project Environment Settings</span>
                      </DSCardTitle>
                    </DSCardHeader>
                    <DSCardContent className="space-y-4 text-xs font-sans">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[11px] text-slate-500 font-mono">System Priority</label>
                          <select
                            value={currentProject.priority}
                            onChange={e => {
                              registry.updateProject(currentProject.id, { priority: e.target.value as any });
                              refreshProjectsList();
                              triggerToast('success', `Updated system priority level to "${e.target.value}".`);
                            }}
                            className="w-full bg-slate-950 border border-slate-800 text-xs rounded-xs p-2 text-slate-300"
                          >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                            <option value="Critical">Critical</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] text-slate-500 font-mono">System Health</label>
                          <select
                            value={currentProject.health}
                            onChange={e => {
                              registry.updateProject(currentProject.id, { health: e.target.value as any });
                              refreshProjectsList();
                              triggerToast('success', `Updated telemetry health classification to "${e.target.value}".`);
                            }}
                            className="w-full bg-slate-950 border border-slate-800 text-xs rounded-xs p-2 text-slate-300 animate-pulse"
                          >
                            <option value="healthy">Healthy</option>
                            <option value="at_risk">At Risk</option>
                            <option value="critical">Critical</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] text-slate-500 font-mono">Status State</label>
                          <select
                            value={currentProject.status}
                            onChange={e => {
                              registry.updateProject(currentProject.id, { status: e.target.value as any });
                              refreshProjectsList();
                              triggerToast('success', `Updated operation status to "${e.target.value}".`);
                            }}
                            className="w-full bg-slate-950 border border-slate-800 text-xs rounded-xs p-2 text-slate-300"
                          >
                            <option value="Active">Active</option>
                            <option value="Paused">Paused</option>
                            <option value="On Hold">On Hold</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] text-slate-500 font-mono">Major Version release</label>
                          <input
                            type="text"
                            value={currentProject.version}
                            onChange={e => {
                              registry.updateProject(currentProject.id, { version: e.target.value });
                              refreshProjectsList();
                            }}
                            className="w-full bg-slate-950 border border-slate-800 text-xs rounded-xs p-2 text-slate-100 font-mono"
                          />
                        </div>
                      </div>

                      <div className="space-y-1 pt-2 border-t border-slate-900/60">
                        <label className="text-[11px] text-slate-500 font-mono">Edit Project Description Outline</label>
                        <textarea
                          value={currentProject.description}
                          onChange={e => {
                            registry.updateProject(currentProject.id, { description: e.target.value });
                            refreshProjectsList();
                          }}
                          className="w-full bg-slate-950 border border-slate-800 text-xs rounded-xs p-2 text-slate-100 h-24"
                        />
                      </div>
                    </DSCardContent>
                  </DSCard>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* 4. MODALS & POPUPS POPULATED ON FORM EVENTS */}

      {/* A. Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-xl bg-slate-950 border border-slate-800 rounded-sm overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-slate-900 flex justify-between items-center bg-slate-950">
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <Plus className="w-4 h-4 text-cyan-400" />
                <span>Initialize Program Workspace</span>
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-500 hover:text-slate-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="p-6 space-y-4 text-xs font-sans">
              <div className="flex border-b border-slate-900 pb-2 mb-4">
                <button
                  type="button"
                  onClick={() => setCreationMode('template')}
                  className={`flex-1 pb-1.5 text-center font-semibold text-[11px] uppercase tracking-wider font-mono ${
                    creationMode === 'template' ? 'text-cyan-400 border-b border-cyan-400' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  From Standard Blueprint Template
                </button>
                <button
                  type="button"
                  onClick={() => setCreationMode('scratch')}
                  className={`flex-1 pb-1.5 text-center font-semibold text-[11px] uppercase tracking-wider font-mono ${
                    creationMode === 'scratch' ? 'text-cyan-400 border-b border-cyan-400' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Start From Scratch
                </button>
              </div>

              {creationMode === 'template' ? (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Select Template Blueprint</label>
                    <div className="grid grid-cols-1 gap-2.5">
                      {registry.getTemplates().map(t => (
                        <label
                          key={t.id}
                          className={`p-3 border rounded-sm flex flex-col gap-1 cursor-pointer transition-colors ${
                            selectedTemplateId === t.id
                              ? 'border-cyan-500/60 bg-cyan-950/5'
                              : 'border-slate-900 bg-slate-950 hover:border-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-200">{t.name}</span>
                            <input
                              type="radio"
                              name="blueprint"
                              value={t.id}
                              checked={selectedTemplateId === t.id}
                              onChange={() => setSelectedTemplateId(t.id)}
                              className="accent-cyan-500"
                            />
                          </div>
                          <p className="text-[10px] text-slate-400">{t.description}</p>
                          <div className="flex items-center gap-3 text-[9px] font-mono text-slate-500 mt-1">
                            <span>Preloaded Tasks: {t.defaultTasks.length}</span>
                            <span>•</span>
                            <span>Clearances: {t.defaultMembers.length + 1} users</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Custom Project Name</label>
                    <input
                      type="text"
                      required
                      value={newProjName}
                      onChange={e => setNewProjName(e.target.value)}
                      placeholder="e.g. AS9100 Space Shuttle Audit"
                      className="w-full bg-slate-950 border border-slate-800 text-xs rounded-xs p-2 text-slate-100"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Project Name</label>
                      <input
                        type="text"
                        required
                        value={newProjName}
                        onChange={e => setNewProjName(e.target.value)}
                        placeholder="e.g. Fusion Wing Assemble"
                        className="w-full bg-slate-950 border border-slate-800 text-xs rounded-xs p-2 text-slate-100"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Client Partner</label>
                      <input
                        type="text"
                        value={newProjClient}
                        onChange={e => setNewProjClient(e.target.value)}
                        placeholder="e.g. NASA Marshall"
                        className="w-full bg-slate-950 border border-slate-800 text-xs rounded-xs p-2 text-slate-100"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Core Type</label>
                      <select
                        value={newProjType}
                        onChange={e => setNewProjType(e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-800 text-xs rounded-xs p-2 text-slate-300"
                      >
                        <option value="engineering">Engineering</option>
                        <option value="packaging">Packaging</option>
                        <option value="learning">Learning</option>
                        <option value="business">Business</option>
                        <option value="personal">Personal</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Priority level</label>
                      <select
                        value={newProjPriority}
                        onChange={e => setNewProjPriority(e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-800 text-xs rounded-xs p-2 text-slate-300"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Category</label>
                      <input
                        type="text"
                        value={newProjCategory}
                        onChange={e => setNewProjCategory(e.target.value)}
                        placeholder="e.g. Aerodynamic Stress"
                        className="w-full bg-slate-950 border border-slate-800 text-xs rounded-xs p-2 text-slate-100"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Tags (comma-separated)</label>
                      <input
                        type="text"
                        value={newProjTags}
                        onChange={e => setNewProjTags(e.target.value)}
                        placeholder="e.g. wing, alloy, cad"
                        className="w-full bg-slate-950 border border-slate-800 text-xs rounded-xs p-2 text-slate-100 font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Technical Outline / Objective</label>
                    <textarea
                      value={newProjDesc}
                      onChange={e => setNewProjDesc(e.target.value)}
                      placeholder="Specify project objectives and compliance metrics..."
                      className="w-full bg-slate-950 border border-slate-800 text-xs rounded-xs p-2 text-slate-100 h-16"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-900">
                <DSButton variant="tertiary" size="sm" type="button" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </DSButton>
                <DSButton variant="primary" size="sm" type="submit">
                  Initialize Workspace
                </DSButton>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* B. Clone Project Modal */}
      {showCloneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-sm overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-slate-900 flex justify-between items-center bg-slate-950">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-100 flex items-center gap-2">
                <Copy className="w-4 h-4 text-cyan-400" />
                <span>Clone Program Workspace</span>
              </h3>
              <button onClick={() => setShowCloneModal(false)} className="text-slate-500 hover:text-slate-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCloneProject} className="p-6 space-y-4 text-xs font-sans">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Cloned Project Name</label>
                <input
                  type="text"
                  required
                  value={cloneNewName}
                  onChange={e => setCloneNewName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs rounded-xs p-2 text-slate-100"
                />
                <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                  All active tasks and permissions will be replicated cleanly. Deliverable progress resets to backlog.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <DSButton variant="tertiary" size="sm" type="button" onClick={() => setShowCloneModal(false)}>
                  Cancel
                </DSButton>
                <DSButton variant="primary" size="sm" type="submit">
                  Clone Workspace
                </DSButton>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

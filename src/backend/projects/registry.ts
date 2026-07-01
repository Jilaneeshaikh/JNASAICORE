import {
  Project,
  ProjectMember,
  ProjectTask,
  ProjectActivityLog,
  ProjectTemplate,
  ProjectType,
  ProjectPriority,
  ProjectStatus,
  ProjectHealth
} from './types';

export class ProjectRegistry {
  private static instance: ProjectRegistry;
  private projects: Map<string, Project> = new Map();
  private activityLogs: ProjectActivityLog[] = [];
  
  private templates: ProjectTemplate[] = [
    {
      id: 'tmpl-engineering',
      name: 'Aerospace Engineering Blueprint',
      description: 'Standard technical design workspace for high-precision components and stress tests.',
      type: 'engineering',
      defaultCategory: 'Mechanical R&D',
      defaultTasks: [
        { title: 'Define Coordinate Boundary Framework', description: 'Establish absolute bounding coordinate guides', status: 'Todo', priority: 'High', dueDate: '2026-07-15' },
        { title: 'Thermal Expansion Vector Simulation', description: 'Run finite element analysis on structural composites', status: 'Todo', priority: 'Critical', dueDate: '2026-07-25' },
        { title: 'AS9100 Material Sourcing Clearance', description: 'Certify high-nickel structural alloy logs in KMS', status: 'Backlog', priority: 'Medium', dueDate: '2026-08-01' }
      ],
      defaultMembers: [
        { userId: 'usr-sarah', name: 'Sarah Jenkins', role: 'Manager', department: 'R&D', email: 's.jenkins@jnas.space' },
        { userId: 'usr-alex', name: 'Alex Rivera', role: 'Member', department: 'Structure Design', email: 'a.rivera@jnas.space' }
      ]
    },
    {
      id: 'tmpl-packaging',
      name: 'Dynamic Insulation Packaging Design',
      description: 'Prototype development and drop testing templates for custom thermal casings.',
      type: 'packaging',
      defaultCategory: 'Packaging Studio',
      defaultTasks: [
        { title: 'Drop-Test Simulation Analysis', description: 'Analyze integrity at 4m impact vectors', status: 'Todo', priority: 'High', dueDate: '2026-07-20' },
        { title: 'Thermal Shield Optimization', description: 'Calculate heat leakage across aerogel barriers', status: 'In Progress', priority: 'Critical', dueDate: '2026-07-10' }
      ],
      defaultMembers: [
        { userId: 'usr-dave', name: 'David Vance', role: 'Manager', department: 'Thermal Physics', email: 'd.vance@jnas.space' }
      ]
    },
    {
      id: 'tmpl-compliance',
      name: 'Regulatory Compliance Audit Guide',
      description: 'Standard template for AS9100 Rev D audit controls, checklists, and signoffs.',
      type: 'business',
      defaultCategory: 'Quality Operations',
      defaultTasks: [
        { title: 'Collate Calibration Certificates', description: 'Retrieve mechanical caliper calibration sheets from KMS', status: 'In Progress', priority: 'High', dueDate: '2026-07-05' },
        { title: 'Conduct Internal Mock Review', description: 'Perform gap analysis with Lead Inspector', status: 'Todo', priority: 'Medium', dueDate: '2026-07-12' }
      ],
      defaultMembers: [
        { userId: 'usr-elena', name: 'Elena Rostova', role: 'Owner', department: 'QA Compliance', email: 'e.rostova@jnas.space' }
      ]
    },
    {
      id: 'tmpl-training',
      name: 'Aviation Safety LMS Training',
      description: 'Curriculum creation, instructor briefings, and pilot quiz assessments.',
      type: 'learning',
      defaultCategory: 'Corporate Education',
      defaultTasks: [
        { title: 'Script Safety Video Modules', description: 'Write narration for turbine clearance guidelines', status: 'Todo', priority: 'Medium', dueDate: '2026-08-10' },
        { title: 'Publish Pilot Assessment Quiz', description: 'Draft 25 multi-choice questions in LMS portal', status: 'Todo', priority: 'High', dueDate: '2026-08-20' }
      ],
      defaultMembers: [
        { userId: 'usr-marcus', name: 'Marcus Brody', role: 'Manager', department: 'Training Dev', email: 'm.brody@jnas.space' }
      ]
    }
  ];

  private constructor() {}

  public static getInstance(): ProjectRegistry {
    if (!ProjectRegistry.instance) {
      ProjectRegistry.instance = new ProjectRegistry();
    }
    return ProjectRegistry.instance;
  }

  public registerProject(project: Project): void {
    this.projects.set(project.id, { ...project });
    this.addLog(project.id, 'system', 'Created', `Project "${project.name}" registered successfully.`);
  }

  public getProject(id: string): Project | undefined {
    return this.projects.get(id);
  }

  public getProjects(workspace?: string): Project[] {
    const list = Array.from(this.projects.values());
    if (workspace && workspace !== 'admin') {
      return list.filter(p => p.workspace === workspace);
    }
    return list;
  }

  public createProject(
    name: string,
    description: string,
    type: ProjectType,
    workspace: 'personal' | 'engineering' | 'learning' | 'business' | 'admin',
    owner: string,
    priority: ProjectPriority = 'Medium',
    category: string = 'General',
    tags: string[] = []
  ): Project {
    const timestamp = new Date().toISOString();
    const id = `prj-${Math.random().toString(36).substring(2, 11)}`;
    const newProject: Project = {
      id,
      name,
      description,
      type,
      status: 'Active',
      priority,
      health: 'healthy',
      owner,
      members: [
        {
          userId: 'usr-operator',
          name: owner,
          role: 'Owner',
          department: 'Operations',
          email: 'operator@jnas.space',
          joinDate: timestamp
        }
      ],
      workspace,
      department: 'Standard Operations',
      category,
      tags,
      version: '1.0.0',
      archiveStatus: false,
      tasks: [],
      createdDate: timestamp,
      updatedDate: timestamp
    };

    this.projects.set(id, newProject);
    this.addLog(id, 'usr-operator', 'Created', `Project "${name}" was created via manual workspace form.`);
    return newProject;
  }

  public createFromTemplate(
    templateId: string,
    name: string,
    owner: string,
    workspace: 'personal' | 'engineering' | 'learning' | 'business' | 'admin'
  ): Project {
    const template = this.templates.find(t => t.id === templateId);
    if (!template) {
      throw new Error(`Template with id "${templateId}" not found.`);
    }

    const timestamp = new Date().toISOString();
    const projectId = `prj-${Math.random().toString(36).substring(2, 11)}`;

    const tasks: ProjectTask[] = template.defaultTasks.map((t, idx) => ({
      ...t,
      id: `task-${projectId}-${idx + 1}`
    }));

    const members: ProjectMember[] = [
      {
        userId: 'usr-operator',
        name: owner,
        role: 'Owner',
        department: 'Operations',
        email: 'operator@jnas.space',
        joinDate: timestamp
      },
      ...template.defaultMembers.map(m => ({
        ...m,
        joinDate: timestamp
      }))
    ];

    const project: Project = {
      id: projectId,
      name,
      description: template.description,
      type: template.type,
      status: 'Active',
      priority: 'High',
      health: 'healthy',
      owner,
      members,
      workspace,
      department: template.type === 'engineering' ? 'R&D' : template.type === 'packaging' ? 'Design' : 'Corporate',
      category: template.defaultCategory,
      tags: [template.type, 'templated'],
      version: '1.0.0',
      archiveStatus: false,
      tasks,
      createdDate: timestamp,
      updatedDate: timestamp
    };

    this.projects.set(projectId, project);
    this.addLog(projectId, 'usr-operator', 'Created', `Initialized project "${name}" from template "${template.name}".`);
    return project;
  }

  public updateProject(id: string, updates: Partial<Project>): boolean {
    const project = this.projects.get(id);
    if (!project) return false;

    const updated = {
      ...project,
      ...updates,
      updatedDate: new Date().toISOString()
    };
    this.projects.set(id, updated);
    this.addLog(id, 'usr-operator', 'Updated', `Modified properties: ${Object.keys(updates).join(', ')}`);
    return true;
  }

  public cloneProject(id: string, newName: string): Project | undefined {
    const project = this.projects.get(id);
    if (!project) return undefined;

    const timestamp = new Date().toISOString();
    const newId = `prj-${Math.random().toString(36).substring(2, 11)}`;
    const cloned: Project = {
      ...project,
      id: newId,
      name: newName,
      createdDate: timestamp,
      updatedDate: timestamp,
      status: 'Active',
      health: 'healthy',
      archiveStatus: false,
      tasks: project.tasks.map((t, i) => ({ ...t, id: `task-${newId}-${i}` })),
      members: project.members.map(m => ({ ...m, joinDate: timestamp }))
    };

    this.projects.set(newId, cloned);
    this.addLog(newId, 'usr-operator', 'Created', `Cloned and initialized from project "${project.name}" (ID: ${id})`);
    return cloned;
  }

  public archiveProject(id: string): boolean {
    const project = this.projects.get(id);
    if (!project) return false;

    project.archiveStatus = true;
    project.status = 'Archived';
    project.updatedDate = new Date().toISOString();
    this.addLog(id, 'usr-operator', 'Archived', `Project moved to digital archive repository.`);
    return true;
  }

  public restoreProject(id: string): boolean {
    const project = this.projects.get(id);
    if (!project) return false;

    project.archiveStatus = false;
    project.status = 'Active';
    project.updatedDate = new Date().toISOString();
    this.addLog(id, 'usr-operator', 'Restored', `Project restored to active workspaces.`);
    return true;
  }

  public deleteProject(id: string): boolean {
    if (!this.projects.has(id)) return false;
    this.projects.delete(id);
    this.activityLogs = this.activityLogs.filter(log => log.projectId !== id);
    return true;
  }

  public addMember(projectId: string, member: Omit<ProjectMember, 'joinDate'>): boolean {
    const project = this.projects.get(projectId);
    if (!project) return false;

    const exists = project.members.some(m => m.userId === member.userId);
    if (exists) return false;

    const newMember: ProjectMember = {
      ...member,
      joinDate: new Date().toISOString()
    };
    project.members.push(newMember);
    project.updatedDate = new Date().toISOString();
    this.addLog(projectId, 'usr-operator', 'MemberAdded', `Added member "${member.name}" with role "${member.role}".`);
    return true;
  }

  public removeMember(projectId: string, userId: string): boolean {
    const project = this.projects.get(projectId);
    if (!project) return false;

    const member = project.members.find(m => m.userId === userId);
    if (!member) return false;

    project.members = project.members.filter(m => m.userId !== userId);
    project.updatedDate = new Date().toISOString();
    this.addLog(projectId, 'usr-operator', 'MemberRemoved', `Removed member "${member.name}" from project roster.`);
    return true;
  }

  public addTask(projectId: string, task: Omit<ProjectTask, 'id'>): ProjectTask | undefined {
    const project = this.projects.get(projectId);
    if (!project) return undefined;

    const newTask: ProjectTask = {
      ...task,
      id: `task-${projectId}-${Date.now()}`
    };
    project.tasks.push(newTask);
    project.updatedDate = new Date().toISOString();
    this.addLog(projectId, 'usr-operator', 'TaskUpdated', `Added new task "${task.title}".`);
    return newTask;
  }

  public updateTaskStatus(projectId: string, taskId: string, status: ProjectTask['status']): boolean {
    const project = this.projects.get(projectId);
    if (!project) return false;

    const task = project.tasks.find(t => t.id === taskId);
    if (!task) return false;

    const oldStatus = task.status;
    task.status = status;
    project.updatedDate = new Date().toISOString();
    this.addLog(projectId, 'usr-operator', 'TaskUpdated', `Task "${task.title}" updated from [${oldStatus}] to [${status}].`);
    return true;
  }

  public getTemplates(): ProjectTemplate[] {
    return this.templates;
  }

  public getLogs(projectId: string): ProjectActivityLog[] {
    return this.activityLogs.filter(log => log.projectId === projectId);
  }

  private addLog(projectId: string, userId: string, actionType: ProjectActivityLog['actionType'], details: string): void {
    const log: ProjectActivityLog = {
      id: `log-${Math.random().toString(36).substring(2, 11)}`,
      timestamp: new Date().toISOString(),
      projectId,
      userId,
      actionType,
      details
    };
    this.activityLogs.unshift(log); // Keep newest at the top
  }
}

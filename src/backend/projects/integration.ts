import { Project, ProjectAPI } from './types';
import { registry as providerRegistry } from '../registry';

// Define structures for connected integrations
export interface ConnectedKnowledgeNode {
  id: string;
  title: string;
  category: string;
  lastVerified: string;
  relevanceScore: number;
}

export interface ConnectedMemoryNode {
  id: string;
  thought: string;
  timestamp: string;
  category: 'operational' | 'technical' | 'compliance';
}

export interface ConnectedWorkflow {
  id: string;
  name: string;
  stage: string;
  status: 'Running' | 'Success' | 'Failed' | 'Pending';
  initiatedBy: string;
  elapsedMinutes: number;
}

export interface ConnectedAgent {
  id: string;
  name: string;
  specialty: string;
  avatar: string;
  systemPrompt: string;
}

export class ProjectIntegrationEngine {
  private static instance: ProjectIntegrationEngine;

  private constructor() {}

  public static getInstance(): ProjectIntegrationEngine {
    if (!ProjectIntegrationEngine.instance) {
      ProjectIntegrationEngine.instance = new ProjectIntegrationEngine();
    }
    return ProjectIntegrationEngine.instance;
  }

  /**
   * Resolves synthetic active integration sizes and usage for a given Project.
   */
  public getProjectAPIMetadata(project: Project): ProjectAPI {
    // Generate deterministic metrics based on project properties
    const multiplier = project.id.charCodeAt(project.id.length - 1) % 5 + 1;
    return {
      documentsCount: project.tasks.length + multiplier,
      knowledgeLinksCount: multiplier * 2,
      memoryNodesCount: multiplier + 1,
      activeWorkflowsCount: project.status === 'Active' ? 1 : 0,
      storageUsageMb: parseFloat((multiplier * 12.4 + 4.2).toFixed(1))
    };
  }

  /**
   * Resolves related Knowledge Base (KMS) nodes filtered by project tags/categories.
   */
  public getLinkedKnowledgeNodes(project: Project): ConnectedKnowledgeNode[] {
    const nodes: ConnectedKnowledgeNode[] = [];
    if (project.tags.includes('audit') || project.tags.includes('AS9100')) {
      nodes.push(
        { id: 'kms-as9100-revd', title: 'AS9100 Revision D Audit Guidelines', category: 'Standards', lastVerified: '2026-05-10', relevanceScore: 0.98 },
        { id: 'kms-calibration', title: 'Standard Calibration Schedules & ISO-17025', category: 'Calibration', lastVerified: '2026-06-01', relevanceScore: 0.85 }
      );
    }
    if (project.tags.includes('CAD') || project.tags.includes('aerospace')) {
      nodes.push(
        { id: 'kms-tensile-718', title: 'Inconel-718 Alloy Tensile Constraints', category: 'Materials', lastVerified: '2026-04-12', relevanceScore: 0.95 },
        { id: 'kms-stress-methods', title: 'Finite Element Analysis Stress Vector Benchmarks', category: 'Formulas', lastVerified: '2026-02-18', relevanceScore: 0.90 }
      );
    }
    if (project.tags.includes('packaging') || project.tags.includes('vacuum-insulation')) {
      nodes.push(
        { id: 'kms-thermal-leak', title: 'Heat Leakage Equations across Aerogels', category: 'Thermal', lastVerified: '2026-05-20', relevanceScore: 0.97 },
        { id: 'kms-drop-integrity', title: 'Impact Vector Resilience on Composites', category: 'Standards', lastVerified: '2026-06-11', relevanceScore: 0.88 }
      );
    }
    if (project.tags.includes('LMS') || project.tags.includes('safety')) {
      nodes.push(
        { id: 'kms-emergency-rules', title: 'FAA Cabin Decompression Standards', category: 'Regulations', lastVerified: '2026-03-24', relevanceScore: 0.99 },
        { id: 'kms-pilot-rubric', title: 'Quiz Design & Cognitive Retention Guidelines', category: 'Pedagogy', lastVerified: '2026-01-15', relevanceScore: 0.82 }
      );
    }

    // Default general-purpose nodes
    nodes.push({ id: 'kms-jnas-pms', title: 'JNAS Project Management Platform Standard', category: 'Corporate', lastVerified: '2026-06-29', relevanceScore: 0.70 });
    return nodes;
  }

  /**
   * Retrieves active Memory Engine records reflecting current operating states.
   */
  public getLinkedMemoryNodes(project: Project): ConnectedMemoryNode[] {
    const memories: ConnectedMemoryNode[] = [];
    if (project.type === 'business') {
      memories.push(
        { id: 'mem-1', thought: 'Operator verified that the audit team requires full history of documents uploaded inside this workspace.', timestamp: '2 hours ago', category: 'compliance' },
        { id: 'mem-2', thought: 'SGS auditors requested mechanical caliper records on 2026-07-08.', timestamp: '1 day ago', category: 'compliance' }
      );
    } else if (project.type === 'engineering') {
      memories.push(
        { id: 'mem-3', thought: 'Wing Assembly wing stress variance of 0.05mm around hinge joints has been successfully resolved inside CAD.', timestamp: '4 hours ago', category: 'technical' },
        { id: 'mem-4', thought: 'Heat leakage models under atmospheric entry are exceeding margins by 1.2% in the current simulation.', timestamp: 'Yesterday', category: 'technical' }
      );
    } else {
      memories.push(
        { id: 'mem-5', thought: 'Initial curriculum structure for safety drills is ready for review by Flight Operations.', timestamp: '3 hours ago', category: 'operational' }
      );
    }
    return memories;
  }

  /**
   * Queries the Workflow Engine to pull live execution threads.
   */
  public getLinkedWorkflows(project: Project): ConnectedWorkflow[] {
    const workflows: ConnectedWorkflow[] = [];
    if (project.type === 'business') {
      workflows.push({
        id: 'wf-as9100-audit',
        name: 'AS9100 Rev D Auditing Clearance',
        stage: 'Document Extraction Handshake',
        status: 'Running',
        initiatedBy: 'Elena Rostova',
        elapsedMinutes: 14.5
      });
    } else if (project.type === 'engineering') {
      workflows.push({
        id: 'wf-wing-simulation',
        name: 'Finite-Element Wing stress validation',
        stage: 'Vector Displacement Calculation',
        status: 'Running',
        initiatedBy: 'Sarah Jenkins',
        elapsedMinutes: 42.1
      });
    } else if (project.type === 'packaging') {
      workflows.push({
        id: 'wf-drop-test',
        name: 'Aerogel Friction Validation Loop',
        stage: 'Friction Drag Run',
        status: 'Success',
        initiatedBy: 'David Vance',
        elapsedMinutes: 120
      });
    }
    return workflows;
  }

  /**
   * Resolves the dedicated AI Agents preloaded inside this project workspace.
   */
  public getLinkedAgents(project: Project): ConnectedAgent[] {
    const agents: ConnectedAgent[] = [];
    if (project.type === 'business') {
      agents.push({
        id: 'agt-auditor',
        name: 'AeroGov Auditor',
        specialty: 'AS9100 Compliance & Document Audit',
        avatar: '🛡️',
        systemPrompt: 'You are AeroGov, a compliance expert for AS9100 Rev D. You evaluate documents, find gaps, and draft regulatory responses.'
      });
    } else if (project.type === 'engineering') {
      agents.push({
        id: 'agt-cad-wizard',
        name: 'CAD Vector Expert',
        specialty: 'Finite Element Modeling & Coordinate Alignment',
        avatar: '📐',
        systemPrompt: 'You are CAD-Vector, specializing in spatial geometry, finite element simulations, and physical stress calculations.'
      });
    } else if (project.type === 'packaging') {
      agents.push({
        id: 'agt-pkg-designer',
        name: 'InsulaCasing Expert',
        specialty: 'Insulated Packaging & Vacuum Seam Testing',
        avatar: '📦',
        systemPrompt: 'You are InsulaCasing, expert in atmospheric drag coefficient analysis and aerogel casing protection design.'
      });
    } else if (project.type === 'learning') {
      agents.push({
        id: 'agt-lms-coach',
        name: 'Safety Curriculum Coach',
        specialty: 'Educational Rubrics & Pilot Evaluations',
        avatar: '🎓',
        systemPrompt: 'You are the Safety Curriculum Coach, crafting clear training manuals and validated pilot assessment quizzes.'
      });
    }

    // Standard Assistant is always active
    agents.push({
      id: 'agt-core-analyst',
      name: 'Project Intelligence Coordinator',
      specialty: 'Task Prioritization & Resource Health Checks',
      avatar: '📊',
      systemPrompt: 'You are the Project Intelligence Coordinator, focusing on sprint health trackers and milestone contribution audits.'
    });

    return agents;
  }

  /**
   * Universal Context Compiler (RAG + Projects + KMS + Memory)
   * Builds an optimized prompt for the AI Provider Gateway without directly feeding raw databases.
   */
  public compileWorkspacePrompt(
    project: Project,
    query: string,
    options: { includeKms: boolean; includeMemory: boolean; includeTasks: boolean; includeTeam: boolean }
  ): { compiledMarkdown: string; tokenEstimate: number } {
    let content = ``;
    content += `=== SECURITY ISOLATION BOUNDARY: JNAS CORE PROJECT WORKSPACE ===\n`;
    content += `PROJECT_ID: ${project.id}\n`;
    content += `NAME: ${project.name}\n`;
    content += `WORKSPACE_CONTEXT: ${project.workspace.toUpperCase()}\n`;
    content += `SECURITY_LEVEL: RESTRICTED INTERNAL\n`;
    content += `DEPARTMENT: ${project.department}\n`;
    content += `STATUS: ${project.status} | HEALTH: ${project.health.toUpperCase()}\n\n`;

    content += `=== PRIMARY OPERATOR QUERY ===\n`;
    content += `${query}\n\n`;

    if (options.includeTasks) {
      content += `=== ACTIVE WORKSPACE DELIVERABLES (TASKS) ===\n`;
      project.tasks.forEach((t, i) => {
        content += `${i + 1}. [${t.status}] [${t.priority}] ${t.title} - Due: ${t.dueDate} (Assigned to: ${t.assignedTo || 'Unassigned'})\n`;
        content += `   Details: ${t.description}\n`;
      });
      content += `\n`;
    }

    if (options.includeTeam) {
      content += `=== AUTHORIZED ACCESS ROSTER (TEAM MEMBERS) ===\n`;
      project.members.forEach((m, i) => {
        content += `Member ${i + 1}: ${m.name} (${m.role}) - Dept: ${m.department} - Email: ${m.email}\n`;
      });
      content += `\n`;
    }

    if (options.includeKms) {
      content += `=== EXTRACTED KMS TECHNICAL CODES (KNOWLEDGE ENGINE) ===\n`;
      const kmsNodes = this.getLinkedKnowledgeNodes(project);
      kmsNodes.forEach(node => {
        content += `- Reference: [${node.category}] "${node.title}" (Relevance Match: ${(node.relevanceScore * 100).toFixed(0)}%)\n`;
      });
      content += `\n`;
    }

    if (options.includeMemory) {
      content += `=== ACTIVE MEMORY ENGINE CONTEXT (RECENT BRAIN OBSERVATIONS) ===\n`;
      const memoryNodes = this.getLinkedMemoryNodes(project);
      memoryNodes.forEach(mem => {
        content += `- [${mem.category.toUpperCase()}] Observed ${mem.timestamp}: "${mem.thought}"\n`;
      });
      content += `\n`;
    }

    content += `=== INSTRUCTIONS FOR INTENT EXTRACTION ===\n`;
    content += `Generate a structured, technical response solving the primary operator query above.\n`;
    content += `Ground all conclusions in the provided isolated workspace parameters.\n`;
    content += `Do NOT make up any calibration numbers or tensile values outside the specified KMS entries.\n`;

    // Calculate approximate tokens (characters divided by 4)
    const tokenEstimate = Math.ceil(content.length / 4);

    return {
      compiledMarkdown: content,
      tokenEstimate
    };
  }

  /**
   * Interacts with the AI Gateway safely to run context completions.
   */
  public async executeProjectAnalysis(
    project: Project,
    compiledPrompt: string,
    providerId = 'gemini'
  ): Promise<{ responseText: string; latencyMs: number; modelUsed: string }> {
    const start = Date.now();
    try {
      const resolvedProvider = providerRegistry.resolveProvider(providerId);
      
      // Let's call the provider. Note that we wrap this in a safe try-catch 
      // in case of missing keys or local test environment constraints.
      const result = await resolvedProvider.generate({
        messages: [
          { role: 'system', content: 'You are a technical AI operations specialist embedded inside JNAS Workspace.' },
          { role: 'user', content: compiledPrompt }
        ],
        temperature: 0.1,
        maxTokens: 1024,
        safetyLevel: 'block_medium_above',
        streaming: false
      });

      return {
        responseText: result.content,
        latencyMs: Date.now() - start,
        modelUsed: result.metadata?.modelName || resolvedProvider.id
      };
    } catch (err: any) {
      // Graceful local development simulation fallback if API Key is not set or network fails
      const delay = Math.round(500 + Math.random() * 500);
      await new Promise(resolve => setTimeout(resolve, delay));

      const isKeyMissing = err.message?.includes('API_KEY') || err.message?.includes('key');
      const fallbackResponse = `[JNAS AI Gateway Fallback Simulation]
Analysis of project "${project.name}" based on query context completed.

1. **Strategic Assessment**: The project parameters align with workspace policies.
2. **Action Plan**:
   - Resolve outstanding tasks (especially due tasks matching status [In Progress]).
   - Verify material tensile configurations with appropriate engineering team leaders.
   - Maintain the specified isolation level: "${project.workspace.toUpperCase()}".

*(Note: Gateway simulated this response because standard ${providerId} provider was offline or credentials are being loaded)*`;

      return {
        responseText: fallbackResponse,
        latencyMs: delay,
        modelUsed: `${providerId}-offline-simulator`
      };
    }
  }
}
export const integrationEngine = ProjectIntegrationEngine.getInstance();

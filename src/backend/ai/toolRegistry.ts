import { AITool } from './types';
import { eventBus } from '../../core';

export class AIToolRegistry {
  private static instance: AIToolRegistry;
  private tools: Map<string, AITool> = new Map();

  private constructor() {
    this.registerDefaultTools();
  }

  public static getInstance(): AIToolRegistry {
    if (!AIToolRegistry.instance) {
      AIToolRegistry.instance = new AIToolRegistry();
    }
    return AIToolRegistry.instance;
  }

  public register(tool: AITool): void {
    if (this.tools.has(tool.id)) {
      console.warn(`[AIToolRegistry] Tool with ID "${tool.id}" already registered. Overwriting.`);
    }
    this.tools.set(tool.id, tool);
    console.info(`[AIToolRegistry] Registered Tool: ${tool.name} (${tool.id})`);
  }

  public getTools(): AITool[] {
    return Array.from(this.tools.values());
  }

  public getTool(id: string): AITool | undefined {
    return this.tools.get(id);
  }

  public async executeTool(id: string, args: any): Promise<any> {
    const tool = this.tools.get(id);
    if (!tool) {
      throw new Error(`[AIToolRegistry] Tool execution failed: Tool ID "${id}" is not registered.`);
    }

    try {
      console.info(`[AIToolRegistry] Executing Tool "${tool.name}" with args:`, args);
      const result = await tool.handler(args);
      
      eventBus.publish('AI_TOOL_EXECUTED', { toolId: id, args, success: true, result }, { emitter: 'AIToolRegistry' });
      return result;
    } catch (e: any) {
      console.error(`[AIToolRegistry] Tool execution failed for "${id}":`, e);
      eventBus.publish('AI_TOOL_EXECUTED', { toolId: id, args, success: false, error: e.message }, { emitter: 'AIToolRegistry' });
      throw e;
    }
  }

  private registerDefaultTools(): void {
    // 1. Search Tool
    this.register({
      id: 'tool-search',
      name: 'Universal Ecosystem Search',
      description: 'Executes semantic queries across customer records, active projects, files, and chat sessions.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'The search query or keyword', required: true },
          workspace: { type: 'string', description: 'Limit search to specific workspace isolation barrier' }
        }
      },
      handler: async (args) => {
        return {
          hits: [
            { id: 'doc-laser-1', type: 'document', title: 'Laser Splicing Specs', snippet: 'AS9100 approved precision steps.' },
            { id: 'proj-laser-001', type: 'project', title: 'Laser Upgrade', snippet: 'Project status: In Progress.' }
          ],
          count: 2
        };
      }
    });

    // 2. Knowledge Base Query Tool
    this.register({
      id: 'tool-knowledge',
      name: 'KMS Core Knowledge Query',
      description: 'Queries technical articles, aerospace standards, and general procedures in Knowledge Engine.',
      parameters: {
        type: 'object',
        properties: {
          topic: { type: 'string', description: 'Topic like aerospace standards or titanium properties', required: true }
        }
      },
      handler: async (args) => {
        return {
          results: [
            { title: 'AS9100 Titanium Standards', url: '#/engineering/kms/kms-ti-9100', category: 'Standards' }
          ]
        };
      }
    });

    // 3. Memory recall tool
    this.register({
      id: 'tool-memory',
      name: 'Memory Recall Ledger',
      description: 'Retrieves operating instructions or preferences recorded in previous sessions.',
      parameters: {
        type: 'object',
        properties: {
          key: { type: 'string', description: 'Memory key or concept', required: true }
        }
      },
      handler: async (args) => {
        return {
          recalledNodes: [
            { content: 'Operator prefers low-latency models for drafting.', confidence: 0.98 }
          ]
        };
      }
    });

    // 4. Workflow Task tool
    this.register({
      id: 'tool-workflow',
      name: 'Workflow Pipeline Inspector',
      description: 'Checks and updates status, assignees, or priority on workspace tasks.',
      parameters: {
        type: 'object',
        properties: {
          projectId: { type: 'string', description: 'Associated Project ID', required: true },
          taskId: { type: 'string', description: 'Target task ID' },
          action: { type: 'string', description: 'Action: complete, start, assign', enum: ['complete', 'start', 'assign'] }
        }
      },
      handler: async (args) => {
        return {
          success: true,
          status: 'Updated',
          taskId: args.taskId || 'all-aligned'
        };
      }
    });

    // 5. CRM customer tool
    this.register({
      id: 'tool-crm',
      name: 'CRM Account Ledger',
      description: 'Fetches account health, SLA criteria, contact rosters, or company profiles from CRM.',
      parameters: {
        type: 'object',
        properties: {
          customerId: { type: 'string', description: 'Customer identifier', required: true }
        }
      },
      handler: async (args) => {
        return {
          accountStatus: 'Elite Tier',
          slaHoldPenalty: '0.5% per day',
          owner: 'Systems Operator'
        };
      }
    });

    // 6. Project Milestone tool
    this.register({
      id: 'tool-projects',
      name: 'Milestone Manager',
      description: 'Queries active projects list, team roles, and health bounds.',
      parameters: {
        type: 'object',
        properties: {
          workspace: { type: 'string', description: 'Target workspace to query' }
        }
      },
      handler: async (args) => {
        return {
          activeProjectsCount: 3,
          healthSummary: 'Optimal / No Anomalies'
        };
      }
    });

    // 7. Thermal & Materials Stress Calculator
    this.register({
      id: 'tool-calculator',
      name: 'Thermal Stress & Velocity Calculator',
      description: 'Calculates physical properties, thermal expansions, and stress tolerances for materials.',
      parameters: {
        type: 'object',
        properties: {
          material: { type: 'string', description: 'Titanium, Nickel, Carbon, Steel', required: true, enum: ['Titanium', 'Nickel', 'Carbon', 'Steel'] },
          temperatureK: { type: 'string', description: 'Target temperature in Kelvin', required: true }
        }
      },
      handler: async (args) => {
        const temp = Number(args.temperatureK) || 300;
        const coefs: Record<string, number> = { Titanium: 8.6e-6, Nickel: 13.3e-6, Steel: 11e-6, Carbon: 2.1e-6 };
        const baseCoef = coefs[args.material] || 10e-6;
        const expansion = (temp - 293) * baseCoef;
        return {
          material: args.material,
          temperatureK: temp,
          linearExpansionCoefficient: baseCoef,
          calculatedThermalExpansionFactor: expansion,
          yieldStrengthRetentionPercentage: temp > 800 ? '58%' : '100%'
        };
      }
    });
  }
}

export const toolRegistry = AIToolRegistry.getInstance();

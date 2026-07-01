import { AIContextObject } from './types';
import { contextBuilder } from './contextBuilder';

export interface PromptLayers {
  systemPrompt: string;
  workspacePrompt: string;
  modulePrompt: string;
  contextPrompt: string;
  conversationPrompt: string;
  userPrompt: string;
}

export class AIPromptComposer {
  private static instance: AIPromptComposer;

  private constructor() {}

  public static getInstance(): AIPromptComposer {
    if (!AIPromptComposer.instance) {
      AIPromptComposer.instance = new AIPromptComposer();
    }
    return AIPromptComposer.instance;
  }

  public composeLayers(
    userMessage: string,
    context: AIContextObject,
    history: Array<{ role: string; content: string }>
  ): PromptLayers {
    // 1. System Prompt (The absolute base directives of the JNAS AI)
    const systemPrompt = `You are JNAS AI Core, the unified, context-aware intelligence layer of the entire JNAS Enterprise Platform.
You are embedded directly within active workspaces to assist operators with mission-critical technical analytics, QA compliance, contract audits, and workflow optimizations.
Provide high-fidelity, professional, objective responses with clear analytical frameworks. Never make up data or refer to simulated elements in a mock fashion—provide real-world-ready advice.`;

    // 2. Workspace Isolation Prompt
    const workspacePrompt = `Active Workspace Boundary: ${context.currentWorkspace.toUpperCase()}.
This interaction is governed by the rules, permissions, and isolation codes of the [${context.currentWorkspace}] domain. Keep all responses strictly aligned with this workspace context.`;

    // 3. Module-specific prompts
    const modulePrompts: Record<string, string> = {
      'dashboard': 'You are viewing the System Dashboard. Focus on system overview, high-level indicators, and inter-departmental links.',
      'projects': 'You are viewing the Milestone Scheduler. Assist with milestone tasks, deliverables timeline, team roles, and dependency safety margins.',
      'crm': 'You are viewing the CRM Customer Ledger. Assist with account health, client portfolios, SLA validations, and corporate contract risks.',
      'documents': 'You are viewing the Central Document Management platform. Assist with file metadata, confidentiality tags, origin departments, and linkage indexes.',
      'kms': 'You are viewing the Knowledge Management System. Assist with aerospace blueprints, engineering articles, and corporate procedural logs.',
      'contacts': 'You are viewing the Operational Contacts directory. Focus on active stakeholder roles, communication channels, and contact linkages.'
    };
    const modulePrompt = modulePrompts[context.currentModule] || 'You are in a unified enterprise workspace. Assist with current operating metrics.';

    // 4. Context Prompt (compiled XML from the Context Builder)
    const contextPrompt = contextBuilder.compileToXmlPrompt(context);

    // 5. Conversation history prompt formatting
    const conversationPrompt = history.length > 0 
      ? history.map(h => `[${h.role.toUpperCase()}]: ${h.content}`).join('\n\n')
      : '[No previous messages in active thread]';

    // 6. User Prompt
    const userPrompt = userMessage;

    return {
      systemPrompt,
      workspacePrompt,
      modulePrompt,
      contextPrompt,
      conversationPrompt,
      userPrompt
    };
  }

  public compileFinalPrompt(layers: PromptLayers): string {
    return `${layers.systemPrompt}

======================================================================
ISOLATION SECURITY MATRIX & SCOPE GUIDELINES
======================================================================
${layers.workspacePrompt}
${layers.modulePrompt}

======================================================================
ACTIVE ECOSYSTEM RUNTIME CONTEXT
======================================================================
${layers.contextPrompt}

======================================================================
CONVERSATION LOG
======================================================================
${layers.conversationPrompt}

======================================================================
CURRENT OPERATOR COMMAND (USER INPUT)
======================================================================
[USER]: ${layers.userPrompt}
[ASSISTANT]:`;
  }
}

export const promptComposer = AIPromptComposer.getInstance();

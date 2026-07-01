import { AIResponseMeta, AIContextObject } from './types';

export class AIResponseInspector {
  private static instance: AIResponseInspector;

  private constructor() {}

  public static getInstance(): AIResponseInspector {
    if (!AIResponseInspector.instance) {
      AIResponseInspector.instance = new AIResponseInspector();
    }
    return AIResponseInspector.instance;
  }

  public analyzeResponse(
    responseContent: string,
    promptLength: number,
    latencyMs: number,
    providerId: string,
    context: AIContextObject
  ): AIResponseMeta {
    // 1. Calculate inputs and outputs
    const inputTokens = Math.ceil(promptLength / 3.8);
    const outputTokens = Math.ceil(responseContent.length / 3.8);

    // 2. Pricing calculation (e.g. Gemini 2.5 Flash / 1.5 Flash rates: $0.075/M input, $0.30/M output)
    const inputPrice = (inputTokens / 1000000) * 0.075;
    const outputPrice = (outputTokens / 1000000) * 0.30;
    const costEstimate = inputPrice + outputPrice;

    // 3. Scan response for mentions of active entities to build references
    const referencedSources: AIResponseMeta['referencedSources'] = [];
    const knowledgeUsed: string[] = [];
    const memoryUsed: string[] = [];
    const documentsUsed: string[] = [];
    const projectsUsed: string[] = [];

    // Scan for Customer keywords
    if (context.currentCustomer && (
      responseContent.toLowerCase().includes(context.currentCustomer.companyName.toLowerCase()) ||
      responseContent.toLowerCase().includes('customer') ||
      responseContent.toLowerCase().includes('starlabs')
    )) {
      referencedSources.push({
        id: context.currentCustomer.id,
        type: 'customer',
        title: context.currentCustomer.companyName,
        snippet: `SLA details and credit matrix for ${context.currentCustomer.companyName}.`
      });
    }

    // Scan for Project keywords
    if (context.currentProject && (
      responseContent.toLowerCase().includes(context.currentProject.name.toLowerCase()) ||
      responseContent.toLowerCase().includes('project') ||
      responseContent.toLowerCase().includes('laser')
    )) {
      referencedSources.push({
        id: context.currentProject.id,
        type: 'project',
        title: context.currentProject.name,
        snippet: `Milestone scheduler link for ${context.currentProject.name}.`
      });
      projectsUsed.push(context.currentProject.name);
    }

    // Scan for Document keywords
    context.currentDocuments.forEach(doc => {
      if (responseContent.toLowerCase().includes(doc.title.toLowerCase()) || responseContent.toLowerCase().includes('document')) {
        referencedSources.push({
          id: doc.id,
          type: 'document',
          title: doc.title,
          snippet: `Enterprise archive node for ${doc.title}.`
        });
        documentsUsed.push(doc.title);
      }
    });

    // Scan Knowledge Base items
    context.knowledge.forEach(k => {
      if (responseContent.toLowerCase().includes(k.title.toLowerCase()) || responseContent.toLowerCase().includes('standard') || responseContent.toLowerCase().includes('as9100')) {
        referencedSources.push({
          id: k.id || 'kms-item',
          type: 'knowledge',
          title: k.title,
          snippet: k.description
        });
        knowledgeUsed.push(k.title);
      }
    });

    // Scan Memories
    context.memory.forEach(m => {
      if (responseContent.toLowerCase().includes('titanium') || responseContent.toLowerCase().includes('yield') || responseContent.toLowerCase().includes('penalty')) {
        referencedSources.push({
          id: m.id,
          type: 'memory',
          title: m.title,
          snippet: m.title
        });
        memoryUsed.push(m.title);
      }
    });

    // 4. Generate some warnings (if relevant)
    const warnings: string[] = [];
    if (context.currentWorkspace === 'personal' && responseContent.toLowerCase().includes('as9100')) {
      warnings.push('Workspace Warning: Accessing standard AS9100 procedures within Personal Sandbox boundary.');
    }
    if (outputTokens > 1000) {
      warnings.push('Resource Alert: Output length exceeded 1,000 tokens. Monitor operational budget.');
    }

    // 5. Simulated confidence bound
    const confidence = parseFloat((0.92 + Math.random() * 0.07).toFixed(4));

    return {
      providerId,
      modelName: providerId === 'gemini' ? 'gemini-2.5-flash-core' : `${providerId}-standard`,
      latencyMs,
      inputTokens,
      outputTokens,
      confidence,
      costEstimate,
      knowledgeUsed,
      memoryUsed,
      documentsUsed,
      projectsUsed,
      referencedSources,
      warnings,
      toolsExecuted: []
    };
  }
}

export const responseInspector = AIResponseInspector.getInstance();

import { AISession, AISessionStatus } from './types';
import { eventBus } from '../../core';

const STORAGE_KEY = 'jnas-ai-workspace-sessions-v5';

export class AISessionRegistry {
  private static instance: AISessionRegistry;
  private sessions: Map<string, AISession> = new Map();

  private constructor() {
    this.loadFromStorage();
    if (this.sessions.size === 0) {
      this.seedInitialSessions();
    }
  }

  public static getInstance(): AISessionRegistry {
    if (!AISessionRegistry.instance) {
      AISessionRegistry.instance = new AISessionRegistry();
    }
    return AISessionRegistry.instance;
  }

  private loadFromStorage(): void {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: AISession[] = JSON.parse(saved);
        parsed.forEach(s => this.sessions.set(s.id, s));
      }
    } catch (e) {
      console.error('[AISessionRegistry] Failed to load sessions from storage:', e);
    }
  }

  private saveToStorage(): void {
    try {
      const array = Array.from(this.sessions.values());
      localStorage.setItem(STORAGE_KEY, JSON.stringify(array));
    } catch (e) {
      console.error('[AISessionRegistry] Failed to save sessions to storage:', e);
    }
  }

  private seedInitialSessions(): void {
    const defaultSessions: AISession[] = [
      {
        id: 'session-aerospace-001',
        title: 'Aerospace Core Structural Simulation Analysis',
        createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(), // 2 days ago
        updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        favorite: true,
        status: 'active',
        category: 'Engineering R&D',
        tags: ['stress-tests', 'thermal-expansion', 'titanium-composite'],
        workspace: 'engineering',
        projectId: 'proj-laser-001', // Example project
        messages: [
          { role: 'user', content: 'Run stress test validation on the titanium support trusses under extreme thermal loads (up to 850K).' },
          { role: 'assistant', content: 'Based on the ANSYS-derived mechanical models for Titanium Grade 5 (Ti-6Al-4V) composites, at temperatures exceeding 800K, structural yield strength degrades by approximately 42%.\n\n### Analytical Vectors:\n- **Absolute Yield Stress Limit**: Reduced from 880 MPa to 510 MPa.\n- **Thermal Expansion Index**: 8.6 × 10⁻⁶ /K causing an expansion displacement of +1.4mm across the primary coordinate boundaries.\n\n### Optimization Strategy:\nI recommend applying a dynamic high-nickel thermal barrier coating (TBC) or implementing a liquid nitrogen radiator jacket along coordinate anchor points.' }
        ],
        temperature: 0.5,
        maxTokens: 2048,
        providerId: 'gemini'
      },
      {
        id: 'session-marketing-002',
        title: 'Laser Splicing SLA Contract & Terms Inspection',
        createdAt: new Date(Date.now() - 3600000 * 12).toISOString(), // 12 hours ago
        updatedAt: new Date(Date.now() - 3600000).toISOString(),
        favorite: false,
        status: 'active',
        category: 'Legal & Procurement',
        tags: ['customer-sla', 'laser-tech', 'compliance'],
        workspace: 'business',
        customerId: 'cust-starlabs', // Example customer
        messages: [
          { role: 'user', content: 'Analyze the StarLabs master Service Level Agreement regarding late delivery penalties on custom optical laser modules.' },
          { role: 'assistant', content: 'Section 4.3 of the StarLabs SLA stipulates a compounding penalty of **0.5% of total contract value per business day** for critical component delivery delays exceeding 14 calendar days.\n\n### Mitigation Matrix:\n- **Grace Period**: Up to 7 business days if a force majeure event (QA compliance hold) is declared.\n- **Maximum Cap**: Penalty caps out strictly at 10% of order value.\n- **Recommended Task**: Trigger a QA pre-clearance task in Projects to guarantee shipment 3 days ahead of the delivery deadline.' }
        ],
        temperature: 0.2,
        maxTokens: 2048,
        providerId: 'gemini'
      }
    ];

    defaultSessions.forEach(s => this.sessions.set(s.id, s));
    this.saveToStorage();
  }

  public getSessions(): AISession[] {
    return Array.from(this.sessions.values()).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  public getSession(id: string): AISession | undefined {
    return this.sessions.get(id);
  }

  public createSession(params: Partial<AISession> & { title: string; workspace: string }): AISession {
    const id = `session-${Date.now()}`;
    const newSession: AISession = {
      id,
      title: params.title,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      favorite: params.favorite || false,
      status: params.status || 'active',
      category: params.category || 'General Operations',
      tags: params.tags || [],
      workspace: params.workspace,
      projectId: params.projectId,
      customerId: params.customerId,
      contactId: params.contactId,
      messages: params.messages || [],
      systemInstruction: params.systemInstruction,
      temperature: params.temperature !== undefined ? params.temperature : 0.7,
      maxTokens: params.maxTokens || 2048,
      providerId: params.providerId || 'gemini',
    };

    this.sessions.set(id, newSession);
    this.saveToStorage();

    eventBus.publish('AI_SESSION_CREATED', newSession, { emitter: 'AISessionRegistry' });
    return newSession;
  }

  public updateSession(id: string, updates: Partial<Omit<AISession, 'id' | 'createdAt'>>): AISession {
    const session = this.sessions.get(id);
    if (!session) {
      throw new Error(`AISession not found: ${id}`);
    }

    const updated: AISession = {
      ...session,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.sessions.set(id, updated);
    this.saveToStorage();

    eventBus.publish('AI_SESSION_UPDATED', updated, { emitter: 'AISessionRegistry' });
    return updated;
  }

  public deleteSession(id: string): boolean {
    const deleted = this.sessions.delete(id);
    if (deleted) {
      this.saveToStorage();
      eventBus.publish('AI_SESSION_DELETED', { id }, { emitter: 'AISessionRegistry' });
    }
    return deleted;
  }

  public toggleFavorite(id: string): AISession {
    const session = this.sessions.get(id);
    if (!session) throw new Error(`AISession not found: ${id}`);
    
    const updated = this.updateSession(id, { favorite: !session.favorite });
    return updated;
  }

  public setStatus(id: string, status: AISessionStatus): AISession {
    const updated = this.updateSession(id, { status });
    if (status === 'archived') {
      eventBus.publish('AI_SESSION_ARCHIVED', updated, { emitter: 'AISessionRegistry' });
    }
    return updated;
  }
}

export const sessionRegistry = AISessionRegistry.getInstance();

import { AIProvider } from './providers/base';
import { ProviderInfo } from './types';
import { GeminiProvider } from './providers/gemini';
import { OllamaProvider } from './providers/ollama';
import { OpenAIProvider } from './providers/openai';
import { AnthropicProvider } from './providers/anthropic';

export class ProviderRegistry {
  private providers = new Map<string, AIProvider>();

  constructor() {
    // Automatically register out-of-the-box providers
    this.register(new GeminiProvider());
    this.register(new OllamaProvider());
    this.register(new OpenAIProvider());
    this.register(new AnthropicProvider());
  }

  /**
   * Register a new provider into the system.
   */
  register(provider: AIProvider): void {
    if (this.providers.has(provider.id)) {
      console.warn(`Provider with ID "${provider.id}" already registered. Overwriting registration.`);
    }
    this.providers.set(provider.id, provider);
    console.info(`Provider Registered: ${provider.name} (v${provider.version})`);
  }

  /**
   * Enable a registered provider.
   */
  enable(id: string): boolean {
    const provider = this.providers.get(id);
    if (!provider) return false;
    provider.enabled = true;
    return true;
  }

  /**
   * Disable a registered provider.
   */
  disable(id: string): boolean {
    const provider = this.providers.get(id);
    if (!provider) return false;
    provider.enabled = false;
    return true;
  }

  /**
   * Get a registered provider by its ID.
   */
  get(id: string): AIProvider | undefined {
    return this.providers.get(id);
  }

  /**
   * List all registered providers with status metadata.
   */
  async list(): Promise<ProviderInfo[]> {
    const list: ProviderInfo[] = [];
    for (const [id, provider] of this.providers.entries()) {
      let status: 'online' | 'offline' | 'disabled' = 'disabled';
      
      if (provider.enabled) {
        // Quick verification checks
        const isHealthy = await provider.healthCheck().catch(() => false);
        status = isHealthy ? 'online' : 'offline';
      }

      list.push({
        id: provider.id,
        name: provider.name,
        version: provider.version,
        priority: provider.priority,
        enabled: provider.enabled,
        status,
        config: {
          hasApiKey: id === 'gemini' ? !!process.env.GEMINI_API_KEY : false,
        }
      });
    }
    return list;
  }

  /**
   * Resolve best provider according to request parameters, enabling custom fallback flows.
   */
  resolveProvider(requestedId?: string): AIProvider {
    // If a specific provider is requested and enabled, try to use it
    if (requestedId) {
      const p = this.providers.get(requestedId);
      if (p && p.enabled) return p;
    }

    // Otherwise, filter enabled ones, sorted by priority (1 is highest priority)
    const active = Array.from(this.providers.values())
      .filter(p => p.enabled)
      .sort((a, b) => a.priority - b.priority);

    if (active.length === 0) {
      // Fallback to Gemini if nothing else is enabled (since it is the default built-in core)
      const gemini = this.providers.get('gemini');
      if (gemini) return gemini;
      throw new Error('No AI Providers are currently registered or enabled in the system gateway.');
    }

    return active[0];
  }
}

// Export a singleton instance of the registry
export const registry = new ProviderRegistry();

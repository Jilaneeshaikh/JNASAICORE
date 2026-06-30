import { registry } from './registry';
import { ProviderRequest, ProviderResponse, ProviderChunk, GatewayLog } from './types';
import { AIProvider } from './providers/base';

export class ProviderGateway {
  private logs: GatewayLog[] = [];
  private maxLogs = 100;

  /**
   * Log gateway traffic for metrics and auditing.
   */
  private logRequest(log: GatewayLog) {
    this.logs.unshift(log);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }
    console.log(`[Gateway Log] [${log.timestamp}] Provider: ${log.providerId} | Latency: ${log.latencyMs}ms | Status: ${log.status}`);
  }

  /**
   * Get active traffic logs.
   */
  getLogs(): GatewayLog[] {
    return this.logs;
  }

  /**
   * Clears traffic logs.
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Validate request structure before dispatching.
   */
  private validateRequest(request: ProviderRequest): void {
    if (!request.messages || !Array.isArray(request.messages) || request.messages.length === 0) {
      throw new Error('Invalid AI request payload: "messages" field is required and must not be empty.');
    }
    
    // Safety boundaries check
    if (request.temperature < 0 || request.temperature > 2) {
      throw new Error('Invalid AI parameter boundaries: temperature must reside between 0.0 and 2.0.');
    }

    if (request.maxTokens && (request.maxTokens <= 0 || request.maxTokens > 1000000)) {
      throw new Error('Invalid AI parameter boundaries: maxTokens must be a positive integer within safety limits.');
    }
  }

  /**
   * Handle non-streaming generation with automatic provider fallback handling.
   */
  async generate(providerId: string, request: ProviderRequest): Promise<ProviderResponse> {
    this.validateRequest(request);
    const startTime = Date.now();
    let provider: AIProvider;

    try {
      // 1. Resolve starting provider
      provider = registry.resolveProvider(providerId);
    } catch (err: any) {
      throw new Error(`Routing failure: ${err.message}`);
    }

    try {
      // 2. Dispatch request
      const response = await provider.generate(request);
      
      const latencyMs = Date.now() - startTime;
      this.logRequest({
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        providerId: provider.id,
        modelName: provider.version,
        latencyMs,
        status: 'success',
        tokens: (response.metadata.inputTokens || 0) + (response.metadata.outputTokens || 0)
      });

      return response;
    } catch (err: any) {
      console.error(`Primary provider "${provider.id}" failed: ${err.message}. Initiating fallback routing...`);

      // 3. Fallback Handling: if primary provider fails, try fallback to Gemini (since it's always available/default)
      if (provider.id !== 'gemini') {
        const fallbackProvider = registry.get('gemini');
        if (fallbackProvider && fallbackProvider.enabled) {
          try {
            const response = await fallbackProvider.generate(request);
            const latencyMs = Date.now() - startTime;
            this.logRequest({
              id: `log-${Date.now()}`,
              timestamp: new Date().toISOString(),
              providerId: `${provider.id}_failed_fallback_gemini`,
              modelName: fallbackProvider.version,
              latencyMs,
              status: 'success',
              tokens: (response.metadata.inputTokens || 0) + (response.metadata.outputTokens || 0)
            });
            return {
              ...response,
              content: `[Fallback Triggered - Gemini Provider Handshake]:\n${response.content}`
            };
          } catch (fallbackErr: any) {
            this.logRequest({
              id: `log-${Date.now()}`,
              timestamp: new Date().toISOString(),
              providerId: provider.id,
              modelName: provider.version,
              latencyMs: Date.now() - startTime,
              status: 'error',
              errorMessage: `Fallback failed: ${fallbackErr.message}`
            });
            throw new Error(`System Provider Layer Failure: Primary provider failed (${err.message}) and Fallback failed (${fallbackErr.message})`);
          }
        }
      }

      // If no fallback was possible or same provider failed, record error
      this.logRequest({
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        providerId: provider.id,
        modelName: provider.version,
        latencyMs: Date.now() - startTime,
        status: 'error',
        errorMessage: err.message
      });

      throw err;
    }
  }

  /**
   * Handle streaming generation.
   */
  async generateStream(providerId: string, request: ProviderRequest): Promise<AsyncIterable<ProviderChunk>> {
    this.validateRequest(request);
    
    let provider: AIProvider;
    try {
      provider = registry.resolveProvider(providerId);
    } catch (err: any) {
      throw new Error(`Routing failure: ${err.message}`);
    }

    try {
      return await provider.generateStream(request);
    } catch (err: any) {
      console.error(`Streaming initialization failed for "${provider.id}":`, err.message);
      
      // Fallback routing for streaming
      if (provider.id !== 'gemini') {
        const fallbackProvider = registry.get('gemini');
        if (fallbackProvider && fallbackProvider.enabled) {
          console.info('Initiating streaming fallback routing to Gemini...');
          return await fallbackProvider.generateStream(request);
        }
      }
      throw err;
    }
  }
}

export const gateway = new ProviderGateway();

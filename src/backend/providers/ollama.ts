import { AIProvider } from './base';
import { ProviderRequest, ProviderResponse, ProviderChunk } from '../types';

export class OllamaProvider implements AIProvider {
  id = 'ollama';
  name = 'Ollama Local Core Pipeline';
  version = 'llama3:latest';
  priority = 2;
  enabled = false; // Disabled by default until connected

  async healthCheck(): Promise<boolean> {
    // Simulates checking the local ollama endpoint (e.g. http://localhost:11434/api/tags)
    try {
      const res = await fetch('http://localhost:11434/api/tags', { signal: AbortSignal.timeout(1000) });
      return res.ok;
    } catch {
      return false; // Expected to be offline in sandbox
    }
  }

  async generate(request: ProviderRequest): Promise<ProviderResponse> {
    const startTime = Date.now();
    const prompt = request.messages.map(m => `[${m.role}]: ${m.content}`).join('\n');
    
    // In production, this would fetch from 'http://localhost:11434/api/generate'
    // To enable offline testing or simulation, we can respond with a local mock:
    const content = `[Ollama Llama3 local execution response]: I have successfully processed your prompt via local offline pipeline bounds.\n\nPrompt received:\n${prompt.slice(0, 150)}...`;

    return {
      content,
      metadata: {
        providerId: this.id,
        modelName: this.version,
        latencyMs: Date.now() - startTime,
        inputTokens: Math.ceil(prompt.length / 4),
        outputTokens: Math.ceil(content.length / 4),
        timestamp: new Date().toISOString()
      }
    };
  }

  async generateStream(request: ProviderRequest): Promise<AsyncIterable<ProviderChunk>> {
    const chunks = [
      'Initializing Ollama local llama3 instance...',
      '\nProcessing system context buffer...',
      '\nLocal node execution successfully compiled:\n\n',
      'I am Llama 3 running inside your local edge infrastructure. All memory boundaries remain fully on-premise.'
    ];

    return {
      [Symbol.asyncIterator]() {
        let index = 0;
        return {
          async next() {
            if (index < chunks.length) {
              await new Promise(resolve => setTimeout(resolve, 200));
              return {
                done: false,
                value: {
                  text: chunks[index++],
                  done: false,
                  metadata: { timestamp: new Date().toISOString() }
                }
              };
            }
            return { done: true, value: undefined as any };
          }
        };
      }
    };
  }
}

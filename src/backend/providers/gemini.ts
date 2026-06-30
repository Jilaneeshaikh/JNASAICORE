import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import { AIProvider } from './base';
import { ProviderRequest, ProviderResponse, ProviderChunk } from '../types';

export class GeminiProvider implements AIProvider {
  id = 'gemini';
  name = 'Gemini AI Provider Engine';
  version = 'gemini-3.5-flash';
  priority = 1;
  enabled = true;

  private getClient(): GoogleGenAI {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not configured on the server. Please add it in Settings > Secrets.');
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  async healthCheck(): Promise<boolean> {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) return false;
      const ai = this.getClient();
      // Simple ping content request to check key validity
      await ai.models.generateContent({
        model: this.version,
        contents: 'ping',
        config: { maxOutputTokens: 5 }
      });
      return true;
    } catch (e) {
      console.error('Gemini Health check failed:', e);
      return false;
    }
  }

  private mapSafetySettings(level: string) {
    let threshold = 'BLOCK_MEDIUM_AND_ABOVE';
    if (level === 'none') threshold = 'BLOCK_NONE';
    else if (level === 'block_low_above') threshold = 'BLOCK_LOW_AND_ABOVE';
    else if (level === 'block_medium_above') threshold = 'BLOCK_MEDIUM_AND_ABOVE';
    else if (level === 'block_high_above') threshold = 'BLOCK_ONLY_HIGH';

    return [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold },
    ];
  }

  private prepareContents(request: ProviderRequest) {
    // Separate system message if present
    const systemMsgs = request.messages.filter(m => m.role === 'system');
    const systemInstruction = systemMsgs.map(m => m.content).join('\n') || request.systemInstruction;

    const chatMsgs = request.messages.filter(m => m.role !== 'system');
    
    // Map messages into Gemini's contents structure
    const contents = chatMsgs.map(m => {
      const parts: any[] = [{ text: m.content }];

      if (m.attachments) {
        for (const att of m.attachments) {
          if (att.base64Data) {
            // Strip data URL prefixes if present
            const cleanBase64 = att.base64Data.includes('base64,') 
              ? att.base64Data.split('base64,')[1] 
              : att.base64Data;

            parts.push({
              inlineData: {
                mimeType: att.mimeType,
                data: cleanBase64
              }
            });
          }
        }
      }

      return {
        role: m.role === 'assistant' ? 'model' : 'user',
        parts,
      };
    });

    return { contents, systemInstruction };
  }

  // Execute request with timeout and retry logic
  private async executeWithRetry<T>(fn: () => Promise<T>, retries = 3, timeoutMs = 30000): Promise<T> {
    let attempt = 0;
    while (attempt < retries) {
      try {
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error(`Request timed out after ${timeoutMs}ms`)), timeoutMs);
        });

        // Race our generation function against the timeout
        return await Promise.race([fn(), timeoutPromise]);
      } catch (err: any) {
        attempt++;
        console.warn(`Gemini API execution attempt ${attempt} failed. Error: ${err.message || err}`);
        
        // If last attempt, throw
        if (attempt >= retries) {
          // Graceful mapping of error codes
          if (err.status === 429 || err.message?.includes('429') || err.message?.includes('Quota')) {
            throw new Error('Gemini API Quota or Rate Limit exceeded. Please wait a moment before retrying.');
          }
          if (err.status === 403 || err.status === 401 || err.message?.includes('API key')) {
            throw new Error('Invalid Gemini API Key. Please verify your configured credentials in Secrets panel.');
          }
          throw err;
        }

        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
    throw new Error('Unexpected execution failure');
  }

  async generate(request: ProviderRequest): Promise<ProviderResponse> {
    const startTime = Date.now();
    const { contents, systemInstruction } = this.prepareContents(request);

    const ai = this.getClient();
    const timeout = request.timeout || 30000;
    const retries = request.retryCount !== undefined ? request.retryCount : 3;

    const response = await this.executeWithRetry(async () => {
      return await ai.models.generateContent({
        model: this.version,
        contents,
        config: {
          systemInstruction,
          temperature: request.temperature,
          maxOutputTokens: request.maxTokens,
          safetySettings: this.mapSafetySettings(request.safetyLevel) as any,
        }
      });
    }, retries, timeout);

    const latencyMs = Date.now() - startTime;
    const content = response.text || '';

    return {
      content,
      metadata: {
        providerId: this.id,
        modelName: this.version,
        latencyMs,
        inputTokens: response.usageMetadata?.promptTokenCount,
        outputTokens: response.usageMetadata?.candidatesTokenCount,
        finishReason: response.candidates?.[0]?.finishReason,
        timestamp: new Date().toISOString()
      }
    };
  }

  async generateStream(request: ProviderRequest): Promise<AsyncIterable<ProviderChunk>> {
    const { contents, systemInstruction } = this.prepareContents(request);
    const ai = this.getClient();

    const timeout = request.timeout || 30000;
    const retries = request.retryCount !== undefined ? request.retryCount : 3;

    // Start streaming content using generateContentStream
    const responseStream = await this.executeWithRetry(async () => {
      return await ai.models.generateContentStream({
        model: this.version,
        contents,
        config: {
          systemInstruction,
          temperature: request.temperature,
          maxOutputTokens: request.maxTokens,
          safetySettings: this.mapSafetySettings(request.safetyLevel) as any,
        }
      });
    }, retries, timeout);

    const providerId = this.id;
    const modelName = this.version;

    // Return custom async generator compatible with AsyncIterable<ProviderChunk>
    return {
      [Symbol.asyncIterator]() {
        const iterator = responseStream[Symbol.asyncIterator]();
        return {
          async next() {
            try {
              const { value, done } = await iterator.next();
              if (done) {
                return { done: true, value: undefined as any };
              }
              const chunk = value as GenerateContentResponse;
              return {
                done: false,
                value: {
                  text: chunk.text || '',
                  done: false,
                  metadata: {
                    timestamp: new Date().toISOString()
                  }
                }
              };
            } catch (err: any) {
              console.error('Error during streaming chunk extraction:', err);
              throw err;
            }
          }
        };
      }
    };
  }
}

export interface ProviderMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  attachments?: ProviderAttachment[];
}

export interface ProviderAttachment {
  id: string;
  name: string;
  mimeType: string;
  base64Data?: string; // Optional embedded data
  size: string;
}

export interface ProviderRequest {
  messages: ProviderMessage[];
  temperature: number;
  maxTokens: number;
  safetyLevel: 'none' | 'block_low_above' | 'block_medium_above' | 'block_high_above';
  streaming: boolean;
  systemInstruction?: string;
  timeout?: number;
  retryCount?: number;
}

export interface ProviderResponse {
  content: string;
  metadata: {
    providerId: string;
    modelName: string;
    latencyMs: number;
    inputTokens?: number;
    outputTokens?: number;
    finishReason?: string;
    timestamp: string;
  };
}

export interface ProviderChunk {
  text: string;
  done: boolean;
  metadata?: {
    latencyMs?: number;
    inputTokens?: number;
    outputTokens?: number;
    timestamp: string;
  };
}

export interface ProviderInfo {
  id: string;
  name: string;
  version: string;
  priority: number;
  enabled: boolean;
  status: 'online' | 'offline' | 'disabled';
  config: Record<string, any>;
}

export interface GatewayLog {
  id: string;
  timestamp: string;
  providerId: string;
  modelName: string;
  latencyMs: number;
  status: 'success' | 'error';
  errorMessage?: string;
  tokens?: number;
}

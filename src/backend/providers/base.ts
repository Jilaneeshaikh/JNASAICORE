import { ProviderRequest, ProviderResponse, ProviderChunk } from '../types';

export interface AIProvider {
  id: string;
  name: string;
  version: string;
  priority: number;
  enabled: boolean;

  /**
   * Performs a basic connectivity or configuration validation.
   */
  healthCheck(): Promise<boolean>;

  /**
   * Generates a non-streaming AI response.
   */
  generate(request: ProviderRequest): Promise<ProviderResponse>;

  /**
   * Generates a streaming AI response, yielding chunks of text.
   */
  generateStream(request: ProviderRequest): Promise<AsyncIterable<ProviderChunk>>;
}

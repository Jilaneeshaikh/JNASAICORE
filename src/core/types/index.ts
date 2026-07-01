/**
 * JNAS Core Platform - Types & Contracts
 */

// ============================================================================
// Configuration Contracts
// ============================================================================

export interface AppConfig {
  name: string;
  version: string;
  environment: 'development' | 'production' | 'test';
  debug: boolean;
}

export interface EnvConfig {
  port: number;
  host: string;
  nodeEnv: string;
}

export interface FirebaseConfig {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  databaseUrl?: string;
}

export interface GeminiConfig {
  apiKey?: string;
  defaultModel: string;
  defaultTemperature: number;
  defaultMaxTokens: number;
  safetyLevel: string;
}

export interface ProviderConfig {
  id: string;
  name: string;
  enabled: boolean;
  type: 'openai' | 'gemini' | 'anthropic' | 'cohere' | 'mock';
}

export interface FeatureFlags {
  enableWorkflowEngine: boolean;
  enableRAG: boolean;
  enableRealtimeSync: boolean;
  enableAdvancedSecurity: boolean;
  enableCommandCenter: boolean;
}

export interface SecurityConfig {
  corsOrigin: string;
  tokenExpiry: string;
  rateLimitMax: number;
  rateLimitWindowMs: number;
}

export interface DeploymentConfig {
  platform: 'cloud-run' | 'local' | 'kubernetes';
  ingressPort: number;
  sslEnabled: boolean;
}

export interface SystemConfig {
  app: AppConfig;
  env: EnvConfig;
  firebase: FirebaseConfig;
  gemini: GeminiConfig;
  providers: ProviderConfig[];
  featureFlags: FeatureFlags;
  security: SecurityConfig;
  deployment: DeploymentConfig;
}

// ============================================================================
// Logging Contracts
// ============================================================================

export enum LogSeverity {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  FATAL = 'FATAL'
}

export interface LogMessage {
  timestamp: string;
  level: LogSeverity;
  category: string;
  message: string;
  context?: Record<string, any>;
  error?: Error;
}

export interface ILogger {
  debug(message: string, context?: Record<string, any>): void;
  info(message: string, context?: Record<string, any>): void;
  warn(message: string, context?: Record<string, any>): void;
  error(message: string, error?: Error, context?: Record<string, any>): void;
  fatal(message: string, error?: Error, context?: Record<string, any>): void;
}

// ============================================================================
// Error Contracts
// ============================================================================

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface AppErrorPayload {
  code: string;
  message: string;
  severity: ErrorSeverity;
  recoveryStrategy?: string;
  timestamp: string;
  context?: Record<string, any>;
  stack?: string;
}

// ============================================================================
// Event Bus Contracts
// ============================================================================

export enum EventPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface EventMetadata {
  id: string;
  timestamp: string;
  emitter: string;
  priority: EventPriority;
  traceId?: string;
}

export interface Event<TPayload = any> {
  type: string;
  metadata: EventMetadata;
  payload: TPayload;
}

export interface EventSubscription {
  id: string;
  unsubscribe(): void;
}

export type EventCallback<T = any> = (event: Event<T>) => void | Promise<void>;

export interface IEventBus {
  publish<T>(type: string, payload: T, options?: Partial<Omit<EventMetadata, 'id' | 'timestamp'>>): Promise<void>;
  subscribe<T>(type: string, callback: EventCallback<T>): EventSubscription;
  unsubscribe(type: string, subscriptionId: string): boolean;
  getHistory(): Event[];
  clearHistory(): void;
}

// ============================================================================
// Service Registry Contracts
// ============================================================================

export interface IService {
  serviceId: string;
  initialize(): Promise<void>;
  shutdown?(): Promise<void>;
}

export interface IServiceRegistry {
  register(service: IService): void;
  get<T extends IService>(serviceId: string): T;
  unregister(serviceId: string): boolean;
  list(): string[];
  clear(): void;
}

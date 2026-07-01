import { ErrorSeverity, AppErrorPayload } from '../types';

export class AppError extends Error {
  public code: string;
  public severity: ErrorSeverity;
  public recoveryStrategy?: string;
  public timestamp: string;
  public context?: Record<string, any>;

  constructor(
    code: string,
    message: string,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    recoveryStrategy?: string,
    context?: Record<string, any>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.severity = severity;
    this.recoveryStrategy = recoveryStrategy;
    this.timestamp = new Date().toISOString();
    this.context = context;
    
    // Maintain proper stack trace in V8 engines
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  public toJSON(): AppErrorPayload {
    return {
      code: this.code,
      message: this.message,
      severity: this.severity,
      recoveryStrategy: this.recoveryStrategy,
      timestamp: this.timestamp,
      context: this.context,
      stack: this.stack,
    };
  }
}

export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super('ERR_VALIDATION_FAILED', message, ErrorSeverity.LOW, 'Verify input format and re-submit.', context);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super('ERR_AUTHENTICATION_FAILED', message, ErrorSeverity.HIGH, 'Clear cache, check session credentials, and log in again.', context);
  }
}

export class AIError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super('ERR_AI_OPERATION_FAILED', message, ErrorSeverity.HIGH, 'Check API parameters or prompt length and try again.', context);
  }
}

export class ProviderError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super('ERR_PROVIDER_UNAVAILABLE', message, ErrorSeverity.CRITICAL, 'Check API key configuration, quotas, and third-party status.', context);
  }
}

export class WorkflowError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super('ERR_WORKFLOW_ABORTED', message, ErrorSeverity.MEDIUM, 'Inspect active step status, trace workflow dependencies, or rerun state transition.', context);
  }
}

export class KnowledgeError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super('ERR_KNOWLEDGE_NOT_FOUND', message, ErrorSeverity.LOW, 'Verify document references or query string.', context);
  }
}

export class SearchError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super('ERR_SEARCH_INDEX_STALE', message, ErrorSeverity.LOW, 'Trigger re-index of documents or try simplified search term.', context);
  }
}

export class ConfigurationError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super('ERR_INVALID_CONFIGURATION', message, ErrorSeverity.CRITICAL, 'Ensure .env variables match .env.example definitions.', context);
  }
}

export class NetworkError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super('ERR_NETWORK_DISRUPTED', message, ErrorSeverity.HIGH, 'Verify client connection or backend ingress connectivity.', context);
  }
}

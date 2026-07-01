import { LogSeverity, LogMessage, ILogger } from '../types';

export class Logger implements ILogger {
  private category: string;

  constructor(category: string) {
    this.category = category;
  }

  private formatMessage(level: LogSeverity, message: string, error?: Error, context?: Record<string, any>): LogMessage {
    return {
      timestamp: new Date().toISOString(),
      level,
      category: this.category,
      message,
      context,
      error,
    };
  }

  private print(log: LogMessage) {
    const formatted = `[${log.timestamp}] [${log.level}] [${log.category}] ${log.message}`;
    
    switch (log.level) {
      case LogSeverity.DEBUG:
        console.debug(formatted, log.context || '');
        break;
      case LogSeverity.INFO:
        console.log(formatted, log.context || '');
        break;
      case LogSeverity.WARN:
        console.warn(formatted, log.context || '');
        break;
      case LogSeverity.ERROR:
      case LogSeverity.FATAL:
        console.error(formatted, log.error || '', log.context || '');
        break;
    }
  }

  debug(message: string, context?: Record<string, any>): void {
    this.print(this.formatMessage(LogSeverity.DEBUG, message, undefined, context));
  }

  info(message: string, context?: Record<string, any>): void {
    this.print(this.formatMessage(LogSeverity.INFO, message, undefined, context));
  }

  warn(message: string, context?: Record<string, any>): void {
    this.print(this.formatMessage(LogSeverity.WARN, message, undefined, context));
  }

  error(message: string, error?: Error, context?: Record<string, any>): void {
    this.print(this.formatMessage(LogSeverity.ERROR, message, error, context));
  }

  fatal(message: string, error?: Error, context?: Record<string, any>): void {
    this.print(this.formatMessage(LogSeverity.FATAL, message, error, context));
  }
}

// Global logger factory/roster
export const loggers = {
  app: new Logger('Application'),
  ai: new Logger('AI-Provider'),
  auth: new Logger('Authentication'),
  workflow: new Logger('Workflow-Engine'),
  knowledge: new Logger('Knowledge-Base'),
  memory: new Logger('Memory-Engine'),
  search: new Logger('Search-Engine'),
  security: new Logger('Security'),
  audit: new Logger('Audit-Trail'),
  performance: new Logger('Performance-Metrics')
};

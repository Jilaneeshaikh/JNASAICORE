import { Event, EventCallback, EventPriority, EventSubscription, IEventBus, EventMetadata } from '../types';
import { loggers } from '../logging';

export class EventBus implements IEventBus {
  private subscribers: Map<string, Array<{ id: string; callback: EventCallback }>> = new Map();
  private history: Event[] = [];
  private maxHistorySize = 250;

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  public async publish<T>(
    type: string,
    payload: T,
    options: Partial<Omit<EventMetadata, 'id' | 'timestamp'>> = {}
  ): Promise<void> {
    const event: Event<T> = {
      type,
      metadata: {
        id: this.generateId(),
        timestamp: new Date().toISOString(),
        emitter: options.emitter || 'System',
        priority: options.priority || EventPriority.NORMAL,
        traceId: options.traceId,
      },
      payload,
    };

    // Store in history
    this.history.push(event);
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }

    loggers.app.debug(`Event Published: ${type}`, { eventId: event.metadata.id, priority: event.metadata.priority });

    const callbacks = this.subscribers.get(type) || [];
    const executionPromises = callbacks.map(async (sub) => {
      try {
        await this.executeWithRetry(sub.callback, event);
      } catch (err: any) {
        loggers.app.error(`Failed to handle event ${type} in subscriber ${sub.id}`, err);
      }
    });

    await Promise.all(executionPromises);
  }

  private async executeWithRetry(callback: EventCallback, event: Event, attempts = 3): Promise<void> {
    for (let i = 1; i <= attempts; i++) {
      try {
        await callback(event);
        return; // Success!
      } catch (err) {
        if (i === attempts) {
          throw err; // Last attempt failed, rethrow
        }
        loggers.app.warn(`Retrying event callback for event ${event.type}. Attempt ${i}/${attempts} failed.`);
        await new Promise((res) => setTimeout(res, 50 * i)); // Exponential-ish backoff
      }
    }
  }

  public subscribe<T>(type: string, callback: EventCallback<T>): EventSubscription {
    const subscriptionId = this.generateId();
    const subs = this.subscribers.get(type) || [];
    
    subs.push({ id: subscriptionId, callback });
    this.subscribers.set(type, subs);

    loggers.app.debug(`Subscriber added for event ${type}`, { subscriptionId });

    return {
      id: subscriptionId,
      unsubscribe: () => this.unsubscribe(type, subscriptionId),
    };
  }

  public unsubscribe(type: string, subscriptionId: string): boolean {
    const subs = this.subscribers.get(type);
    if (!subs) return false;

    const initialLength = subs.length;
    const filtered = subs.filter((sub) => sub.id !== subscriptionId);
    this.subscribers.set(type, filtered);

    const success = filtered.length < initialLength;
    if (success) {
      loggers.app.debug(`Unsubscribed from event ${type}`, { subscriptionId });
    }
    return success;
  }

  public getHistory(): Event[] {
    return [...this.history];
  }

  public clearHistory(): void {
    this.history = [];
    loggers.app.debug('Event history cleared.');
  }
}

// Export singleton instance
export const eventBus = new EventBus();

import { IService, IServiceRegistry } from '../types';
import { loggers } from '../logging';

export class ServiceRegistry implements IServiceRegistry {
  private services: Map<string, IService> = new Map();

  public register(service: IService): void {
    if (!service.serviceId) {
      throw new Error('Service must have a non-empty serviceId to register.');
    }
    
    if (this.services.has(service.serviceId)) {
      loggers.app.warn(`Overwriting already registered service with ID: ${service.serviceId}`);
    }

    this.services.set(service.serviceId, service);
    loggers.app.info(`Service registered successfully: ${service.serviceId}`);
  }

  public get<T extends IService>(serviceId: string): T {
    const service = this.services.get(serviceId);
    if (!service) {
      throw new Error(`Service not found in registry: ${serviceId}`);
    }
    return service as T;
  }

  public unregister(serviceId: string): boolean {
    const hasService = this.services.has(serviceId);
    if (hasService) {
      this.services.delete(serviceId);
      loggers.app.info(`Service unregistered: ${serviceId}`);
    }
    return hasService;
  }

  public list(): string[] {
    return Array.from(this.services.keys());
  }

  public clear(): void {
    this.services.clear();
    loggers.app.info('Service registry cleared.');
  }
}

// Export singleton instance
export const serviceRegistry = new ServiceRegistry();
export const services = { serviceRegistry };

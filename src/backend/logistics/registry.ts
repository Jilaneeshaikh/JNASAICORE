import { LoadPlan, ContainerEquipment, CapacityModel, LogisticsAuditLog, LoadPlanStatus, LoadPlanPriority, LoadPlanApprovalStatus } from './types';
import { eventBus, loggers, serviceRegistry, IService } from '../../core';
import { packagingRegistry } from '../packaging/registry';

// Initial container library seeds
export const initialContainers: ContainerEquipment[] = [
  {
    id: 'cont-20ft',
    type: '20ft Container',
    name: 'Standard 20-Foot Dry Freight ISO',
    code: 'ISO-20GP',
    description: 'Standard intermodal container suitable for maritime, rail, and road transit.',
    lengthMm: 5898,
    widthMm: 2352,
    heightMm: 2393,
    maxWeightKg: 21770,
    maxVolumeCbm: 33.2,
    status: 'Available'
  },
  {
    id: 'cont-40ft',
    type: '40ft Container',
    name: 'Standard 40-Foot Dry Freight ISO',
    code: 'ISO-40GP',
    description: 'Standard double-length container with optimized volumetric capacity.',
    lengthMm: 12032,
    widthMm: 2352,
    heightMm: 2393,
    maxWeightKg: 26780,
    maxVolumeCbm: 67.7,
    status: 'In Use'
  },
  {
    id: 'cont-40hc',
    type: '40HC',
    name: '40-Foot High Cube ISO',
    code: 'ISO-40HC',
    description: 'High Cube container with extra 1-foot overhead space for tall mechanical racks.',
    lengthMm: 12032,
    widthMm: 2352,
    heightMm: 2698,
    maxWeightKg: 26512,
    maxVolumeCbm: 76.2,
    status: 'Available'
  },
  {
    id: 'cont-pal-std',
    type: 'Pallet',
    name: 'GMA Standard Wooden Pallet',
    code: 'GMA-PAL-01',
    description: 'Standard Grocery Manufacturers Association specification heavy-duty pallet.',
    lengthMm: 1219,
    widthMm: 1016,
    heightMm: 140,
    maxWeightKg: 2100,
    maxVolumeCbm: 1.8,
    status: 'Available'
  },
  {
    id: 'cont-rack-steel',
    type: 'Rack',
    name: 'Heavy Steel Stackable Storage Rack',
    code: 'STEEL-RACK-M3',
    description: 'Heavy duty modular racking for heavy machinery cradles and automotive kits.',
    lengthMm: 2400,
    widthMm: 1500,
    heightMm: 1800,
    maxWeightKg: 4500,
    maxVolumeCbm: 6.48,
    status: 'Reserved'
  },
  {
    id: 'cont-truck-flat',
    type: 'Truck',
    name: '48-Foot Flatbed Transport Truck',
    code: 'FLATBED-48',
    description: 'Open flatbed commercial truck for transporting heavy unboxed steel racks and containers.',
    lengthMm: 14630,
    widthMm: 2590,
    heightMm: 2500,
    maxWeightKg: 22000,
    maxVolumeCbm: 94.7,
    status: 'Available'
  }
];

// Initial load planning seeds
export const initialLoadPlans: LoadPlan[] = [
  {
    id: 'plan-001',
    planNumber: 'JNAS-LPL-001',
    title: 'Avionics Cradle Box Container Loading Plan',
    description: 'Logistics planning layout for shipping high-precision Avionics Cradle Boxes in standard 40HC ISO containers for rocket payload launch coordinates.',
    customer: {
      id: 'cust-001',
      name: 'SpaceX Falcon Systems'
    },
    project: {
      id: 'pkg-001',
      name: 'Avionics Cradle Box Project'
    },
    packagingDesign: {
      id: 'dsn-2801',
      name: 'Avionics Cradle Box V1',
      designNumber: 'DSN-PKG-2801'
    },
    engineeringAsset: 'DWG-AV-CRADLE-2801-REV2.dxf',
    containerType: '40HC',
    containerId: 'cont-40hc',
    vehicleType: 'Flatbed Truck / Intermodal Rail',
    warehouse: 'East Launch Facility Warehouse H-3',
    status: 'Submitted',
    priority: 'Critical',
    revision: 1,
    planner: 'Sarah Connor',
    approvalStatus: 'In Review',
    capacity: {
      volume: 45.2,
      weight: 12400,
      dimensions: {
        length: 12032,
        width: 2352,
        height: 2698,
        unit: 'mm'
      },
      stackingLimit: 2,
      maximumCapacity: 24,
      safetyMargin: 15,
      loadingZone: 'Bay Area 4',
      centerOfGravity: '[X: 120, Y: -10, Z: 510]'
    },
    createdDate: '2026-06-25T08:30:00Z',
    updatedDate: '2026-06-29T14:45:00Z',
    auditMetadata: {
      createdBy: 'Sarah Connor'
    }
  },
  {
    id: 'plan-002',
    planNumber: 'JNAS-LPL-002',
    title: 'Steel Frame Component Loading Scheme',
    description: 'Stacking scheme for structural steel frames using GMA Pallets for domestic truck logistics.',
    customer: {
      id: 'cust-002',
      name: 'Tesla Gigafactory Texas'
    },
    project: {
      id: 'pkg-002',
      name: 'Tesla Chassis Steel Frame'
    },
    packagingDesign: {
      id: 'dsn-2802',
      name: 'Steel Frame Nesting Rack',
      designNumber: 'DSN-PKG-2802'
    },
    engineeringAsset: 'CAD-STEEL-RACK-03A.step',
    containerType: 'Pallet',
    containerId: 'cont-pal-std',
    vehicleType: 'Standard Box Trailer',
    warehouse: 'Austin Distribution Center Bay 12',
    status: 'Draft',
    priority: 'Medium',
    revision: 2,
    planner: 'Marcus Aurelius',
    approvalStatus: 'Pending',
    capacity: {
      volume: 1.5,
      weight: 850,
      dimensions: {
        length: 1219,
        width: 1016,
        height: 1200,
        unit: 'mm'
      },
      stackingLimit: 3,
      maximumCapacity: 12,
      safetyMargin: 20,
      loadingZone: 'Zone A-South',
      centerOfGravity: '[X: 0, Y: 0, Z: 310]'
    },
    createdDate: '2026-06-27T09:15:00Z',
    updatedDate: '2026-06-27T10:30:00Z',
    auditMetadata: {
      createdBy: 'Marcus Aurelius'
    }
  }
];

export class LogisticsRegistry implements IService {
  private static instance: LogisticsRegistry;
  public serviceId = 'LogisticsRegistry';

  private loadPlans: Map<string, LoadPlan> = new Map();
  private containers: Map<string, ContainerEquipment> = new Map();
  private auditLogs: LogisticsAuditLog[] = [];

  private currentPlanner: string = 'jilaneeshaikh@gmail.com';
  private currentRole: string = 'Logistics Engineer';

  private constructor() {
    this.loadState();
  }

  public static getInstance(): LogisticsRegistry {
    if (!this.instance) {
      this.instance = new LogisticsRegistry();
      try {
        serviceRegistry.register(this.instance);
      } catch (e) {
        console.warn('Could not register LogisticsRegistry with Core Service Registry', e);
      }
    }
    return this.instance;
  }

  public async initialize(): Promise<void> {
    loggers.app.info('Logistics Registry Service initializing...');
  }

  public async shutdown(): Promise<void> {
    loggers.app.info('Logistics Registry Service shutting down...');
    this.saveState();
  }

  private saveState(): void {
    try {
      localStorage.setItem('jnas-log-plans', JSON.stringify(Array.from(this.loadPlans.values())));
      localStorage.setItem('jnas-log-containers', JSON.stringify(Array.from(this.containers.values())));
      localStorage.setItem('jnas-log-audit-logs', JSON.stringify(this.auditLogs));
    } catch (e) {
      loggers.app.error('Failed to save Logistics state to localStorage', e);
    }
  }

  private loadState(): void {
    try {
      const storedPlans = localStorage.getItem('jnas-log-plans');
      const storedContainers = localStorage.getItem('jnas-log-containers');
      const storedAuditLogs = localStorage.getItem('jnas-log-audit-logs');

      if (storedContainers) {
        const parsed = JSON.parse(storedContainers) as ContainerEquipment[];
        parsed.forEach(c => this.containers.set(c.id, c));
      } else {
        initialContainers.forEach(c => this.containers.set(c.id, c));
      }

      if (storedPlans) {
        const parsed = JSON.parse(storedPlans) as LoadPlan[];
        parsed.forEach(p => this.loadPlans.set(p.id, p));
      } else {
        initialLoadPlans.forEach(p => this.loadPlans.set(p.id, p));
      }

      if (storedAuditLogs) {
        this.auditLogs = JSON.parse(storedAuditLogs);
      } else {
        this.auditLogs = [
          {
            id: 'log-log-1',
            timestamp: new Date().toISOString(),
            userId: 'jilaneeshaikh@gmail.com',
            userRole: 'Logistics Engineer',
            action: 'INITIALIZED',
            targetId: 'system',
            details: 'Logistics Planning Platform initialized with initial container registers and loading specs.'
          }
        ];
      }
    } catch (e) {
      loggers.app.error('Failed to load Logistics state', e);
      initialContainers.forEach(c => this.containers.set(c.id, c));
      initialLoadPlans.forEach(p => this.loadPlans.set(p.id, p));
      this.auditLogs = [];
    }
  }

  // Load Plans CRUD
  public getLoadPlans(): LoadPlan[] {
    return Array.from(this.loadPlans.values());
  }

  public getLoadPlanById(id: string): LoadPlan | undefined {
    return this.loadPlans.get(id);
  }

  public createLoadPlan(plan: Omit<LoadPlan, 'id' | 'planNumber' | 'createdAt' | 'updatedAt' | 'createdDate' | 'updatedDate' | 'revision' | 'auditMetadata'>): LoadPlan {
    const nextId = `plan-00${this.loadPlans.size + 1}`;
    const nextNumber = `JNAS-LPL-${300 + this.loadPlans.size + 1}`;

    const newPlan: LoadPlan = {
      ...plan,
      id: nextId,
      planNumber: nextNumber,
      revision: 1,
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
      auditMetadata: {
        createdBy: this.currentPlanner
      }
    };

    this.loadPlans.set(nextId, newPlan);
    this.addAuditLog('CREATE_PLAN', nextId, `Load Plan ${nextNumber} (${plan.title}) drafted.`);

    // Publish load plan created activity
    eventBus.publish('ACTIVITY_CREATED', {
      type: 'Load Plan Created',
      title: `Load Plan Registered: ${nextNumber}`,
      description: `Transport capacity planning sheet initialized for design "${plan.packagingDesign.name}".`,
      category: 'logistics',
      referenceId: nextId
    }, { emitter: 'LogisticsRegistry' });

    this.saveState();
    return newPlan;
  }

  public updateLoadPlan(id: string, updates: Partial<LoadPlan>): LoadPlan {
    const existing = this.loadPlans.get(id);
    if (!existing) {
      throw new Error(`Load plan with ID ${id} not found.`);
    }

    const updatedPlan: LoadPlan = {
      ...existing,
      ...updates,
      updatedDate: new Date().toISOString()
    };

    this.loadPlans.set(id, updatedPlan);
    this.addAuditLog('UPDATE_PLAN', id, `Load plan ${existing.planNumber} parameters modified.`);

    // Publish load plan updated activity
    eventBus.publish('ACTIVITY_CREATED', {
      type: 'Load Plan Updated',
      title: `Load Plan Updated: ${existing.planNumber}`,
      description: `Parameters for loading sheet "${existing.title}" were modified.`,
      category: 'logistics',
      referenceId: id
    }, { emitter: 'LogisticsRegistry' });

    // Handle special activity triggers like container changes
    if (updates.containerId && updates.containerId !== existing.containerId) {
      const cont = this.containers.get(updates.containerId);
      eventBus.publish('ACTIVITY_CREATED', {
        type: 'Container Assigned',
        title: `Container Assigned: ${existing.planNumber}`,
        description: `Cargo container standard "${cont ? cont.name : updates.containerType}" assigned for loading layout.`,
        category: 'logistics',
        referenceId: id
      }, { emitter: 'LogisticsRegistry' });
    }

    // Handle special activity triggers like approval state changes
    if (updates.approvalStatus && updates.approvalStatus !== existing.approvalStatus) {
      eventBus.publish('ACTIVITY_CREATED', {
        type: 'Approval Changed',
        title: `Approval Updated: ${existing.planNumber}`,
        description: `Approval workflow shifted to ${updates.approvalStatus} for plan ${existing.planNumber}.`,
        category: 'logistics',
        referenceId: id
      }, { emitter: 'LogisticsRegistry' });
    }

    this.saveState();
    return updatedPlan;
  }

  public createPlanRevision(id: string, notes: string): LoadPlan {
    const existing = this.loadPlans.get(id);
    if (!existing) throw new Error('Load plan not found');

    const nextRev = existing.revision + 1;
    const updated: LoadPlan = {
      ...existing,
      revision: nextRev,
      status: 'In Review',
      approvalStatus: 'Pending',
      updatedDate: new Date().toISOString()
    };

    this.loadPlans.set(id, updated);
    this.addAuditLog('REVISION_CREATED', id, `Created loading layout revision R${nextRev}. Notes: ${notes}`);

    eventBus.publish('ACTIVITY_CREATED', {
      type: 'Revision Created',
      title: `Plan Revision R${nextRev}: ${existing.planNumber}`,
      description: `New cargo load planning blueprint revision generated. Notes: ${notes}`,
      category: 'logistics',
      referenceId: id
    }, { emitter: 'LogisticsRegistry' });

    this.saveState();
    return updated;
  }

  public archiveLoadPlan(id: string): void {
    const existing = this.loadPlans.get(id);
    if (existing) {
      const updated: LoadPlan = {
        ...existing,
        status: 'Archived',
        updatedDate: new Date().toISOString()
      };
      this.loadPlans.set(id, updated);
      this.addAuditLog('ARCHIVE_PLAN', id, `Load plan archived: ${existing.planNumber}`);

      eventBus.publish('ACTIVITY_CREATED', {
        type: 'Plan Archived',
        title: `Plan Archived: ${existing.planNumber}`,
        description: `Cargo staging sheet ${existing.planNumber} shifted to compliance archive state.`,
        category: 'logistics',
        referenceId: id
      }, { emitter: 'LogisticsRegistry' });

      this.saveState();
    }
  }

  // Containers CRUD
  public getContainers(): ContainerEquipment[] {
    return Array.from(this.containers.values());
  }

  public getContainerById(id: string): ContainerEquipment | undefined {
    return this.containers.get(id);
  }

  public createContainer(cont: Omit<ContainerEquipment, 'id'>): ContainerEquipment {
    const nextId = `cont-${Date.now()}`;
    const newCont: ContainerEquipment = {
      ...cont,
      id: nextId
    };
    this.containers.set(nextId, newCont);
    this.addAuditLog('CREATE_CONTAINER', nextId, `Registered new logistics equipment: ${cont.code} - ${cont.name}`);
    this.saveState();
    return newCont;
  }

  public updateContainer(id: string, updates: Partial<ContainerEquipment>): ContainerEquipment {
    const existing = this.containers.get(id);
    if (!existing) throw new Error('Container not found');
    const updated = {
      ...existing,
      ...updates
    };
    this.containers.set(id, updated);
    this.addAuditLog('UPDATE_CONTAINER', id, `Modified logistics equipment specifications: ${existing.code}`);
    this.saveState();
    return updated;
  }

  // Auditing
  public getAuditLogs(): LogisticsAuditLog[] {
    return this.auditLogs;
  }

  private addAuditLog(action: string, targetId: string, details: string): void {
    const log: LogisticsAuditLog = {
      id: `log-log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      userId: this.currentPlanner,
      userRole: this.currentRole,
      action,
      targetId,
      details
    };
    this.auditLogs.unshift(log);
    if (this.auditLogs.length > 100) {
      this.auditLogs.pop();
    }
  }

  // Expose XML Context for AI Assistant Ingestion
  public getAIContext(): string {
    let contextStr = '<logistics_planning_context>\n';
    
    contextStr += '  <registered_container_equipment>\n';
    this.getContainers().forEach(c => {
      contextStr += `    <equipment id="${c.id}">
      <code>${c.code}</code>
      <type>${c.type}</type>
      <name>${c.name}</name>
      <length_mm>${c.lengthMm}</length_mm>
      <width_mm>${c.widthMm}</width_mm>
      <height_mm>${c.heightMm}</height_mm>
      <max_weight_kg>${c.maxWeightKg}</max_weight_kg>
      <max_volume_cbm>${c.maxVolumeCbm}</max_volume_cbm>
      <status>${c.status}</status>
    </equipment>\n`;
    });
    contextStr += '  </registered_container_equipment>\n';

    contextStr += '  <active_load_plans>\n';
    this.getLoadPlans().forEach(p => {
      contextStr += `    <load_plan id="${p.id}">
      <plan_number>${p.planNumber}</plan_number>
      <title>${p.title}</title>
      <description>${p.description}</description>
      <customer id="${p.customer.id}">${p.customer.name}</customer>
      <project id="${p.project.id}">${p.project.name}</project>
      <packaging_design id="${p.packagingDesign.id}" design_number="${p.packagingDesign.designNumber}">${p.packagingDesign.name}</packaging_design>
      <engineering_asset>${p.engineeringAsset}</engineering_asset>
      <container_type>${p.containerType}</container_type>
      <vehicle_type>${p.vehicleType}</vehicle_type>
      <warehouse_facility>${p.warehouse}</warehouse_facility>
      <status>${p.status}</status>
      <priority>${p.priority}</priority>
      <revision>${p.revision}</revision>
      <planner>${p.planner}</planner>
      <approval_status>${p.approvalStatus}</approval_status>
      <capacity_model>
        <volume_cbm>${p.capacity.volume}</volume_cbm>
        <weight_kg>${p.capacity.weight}</weight_kg>
        <length>${p.capacity.dimensions.length}</length>
        <width>${p.capacity.dimensions.width}</width>
        <height>${p.capacity.dimensions.height}</height>
        <unit>${p.capacity.dimensions.unit}</unit>
        <stacking_limit>${p.capacity.stackingLimit}</stacking_limit>
        <max_units>${p.capacity.maximumCapacity}</max_units>
        <safety_margin_percent>${p.capacity.safetyMargin}</safety_margin_percent>
        <loading_zone>${p.capacity.loadingZone}</loading_zone>
        <center_of_gravity>${p.capacity.centerOfGravity}</center_of_gravity>
      </capacity_model>
    </load_plan>\n`;
    });
    contextStr += '  </active_load_plans>\n';
    contextStr += '</logistics_planning_context>';
    
    return contextStr;
  }

  public resetToDefaults(): void {
    this.loadPlans.clear();
    this.containers.clear();
    this.auditLogs = [];

    initialContainers.forEach(c => this.containers.set(c.id, c));
    initialLoadPlans.forEach(p => this.loadPlans.set(p.id, p));
    this.addAuditLog('RESET_SYSTEM', 'system', 'Logistics database restored to default seeds.');
    this.saveState();
  }
}

export const logisticsRegistry = LogisticsRegistry.getInstance();

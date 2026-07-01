import { 
  ReturnableAsset, 
  InspectionRecord, 
  MaintenanceRecord, 
  LocationHistoryEntry, 
  ReturnableAuditLog, 
  AssetLifecycleState, 
  AssetType, 
  TrackingMode 
} from './types';
import { eventBus, loggers, serviceRegistry, IService } from '../../core';
import { packagingRegistry } from '../packaging/registry';

const log = loggers.app;

export const initialAssets: ReturnableAsset[] = [
  {
    id: 'ast-001',
    assetNumber: 'JNAS-AST-0101',
    assetName: 'SpaceX Heavy Carbon-Steel Avionics Rack',
    assetType: 'Steel Rack',
    description: 'Heavy duty, shock-isolated protective carbon-steel racking specifically machined to secure Falcon Avionics assemblies in high-vibration intermodal transit.',
    customer: { id: 'cust-001', name: 'SpaceX Falcon Systems' },
    project: { id: 'proj-001', name: 'Avionics Cradle Box Project' },
    packagingDesign: { id: 'dsn-001', name: 'Avionics Cradle Box Design', designNumber: 'DSN-2801' },
    engineeringAsset: 'SPX-AV-RACK-REV4.step',
    material: 'A36 Structural Carbon Steel',
    revision: 3,
    status: 'Assigned',
    currentLocation: 'Houston Intermodal Hub (HH-02)',
    owner: 'Principal Supply Chain Architect',
    assignedDepartment: 'SpaceX Logistics Unit',
    manufacturingDate: '2026-01-15',
    commissionDate: '2026-02-01',
    lifecycleStatus: 'In Transit',
    expectedLifeCycles: 500,
    currentCycleCount: 42,
    maximumCycleCount: 500,
    repairStatus: 'Operational',
    inspectionStatus: 'Passed',
    trackingMode: 'RFID',
    trackingIdentifier: 'RFID-SPX-AV-0101',
    createdDate: '2026-02-01T12:00:00Z',
    updatedDate: '2026-06-30T10:00:00Z',
    auditMetadata: {
      createdBy: 'Logistics Admin',
      lastInspectedBy: 'Lead Quality Inspector Alpha',
      lastAuditedAt: '2026-06-28T09:30:00Z'
    }
  },
  {
    id: 'ast-002',
    assetNumber: 'JNAS-AST-0102',
    assetName: 'Tesla Cybertruck Battery Kit Cart',
    assetType: 'Kit Cart',
    description: 'ESD-Safe custom structured aluminum mobile trolley designed for staging high-voltage battery modules in gigafactory cells.',
    customer: { id: 'cust-002', name: 'Tesla Gigafactory Texas' },
    project: { id: 'proj-002', name: 'Cybertruck Battery Module' },
    packagingDesign: { id: 'dsn-002', name: 'Lithium Module Foam Pack', designNumber: 'DSN-3402' },
    engineeringAsset: 'TSLA-BATT-CART-R2.step',
    material: 'ESD-Safe Polycarbonate / 6061 Aluminum',
    revision: 2,
    status: 'Available',
    currentLocation: 'Austin Giga-Bay 4 (AG-04)',
    owner: 'Chief Packaging Engineer',
    assignedDepartment: 'Battery Integration Team',
    manufacturingDate: '2026-03-10',
    commissionDate: '2026-03-25',
    lifecycleStatus: 'Returned',
    expectedLifeCycles: 1000,
    currentCycleCount: 118,
    maximumCycleCount: 1000,
    repairStatus: 'Operational',
    inspectionStatus: 'Pending',
    trackingMode: 'BLE Beacon',
    trackingIdentifier: 'BLE-TSLA-BC-0102',
    createdDate: '2026-03-25T08:00:00Z',
    updatedDate: '2026-06-29T15:45:00Z',
    auditMetadata: {
      createdBy: 'Battery Automation Engineer',
      lastInspectedBy: 'Automation Quality Tech B',
      lastAuditedAt: '2026-06-25T14:20:00Z'
    }
  },
  {
    id: 'ast-003',
    assetNumber: 'JNAS-AST-0103',
    assetName: 'Northrop Grumman Solid Fuel Pallet',
    assetType: 'Pallet',
    description: 'High-capacity, non-sparking copper-alloy composite pallet for staging volatile booster fuel canisters.',
    customer: { id: 'cust-003', name: 'Northrop Space Systems' },
    project: { id: 'proj-003', name: 'NASA SLS Booster Fuel Staging' },
    packagingDesign: { id: 'dsn-003', name: 'Booster Canister Transport Skid', designNumber: 'DSN-8911' },
    engineeringAsset: 'NGC-SLS-SKID-V1.step',
    material: 'Non-Sparking Bronze & Reinforced Polymers',
    revision: 1,
    status: 'Quarantined',
    currentLocation: 'Promontory UT Staging Area B',
    owner: 'Senior Mechanical Architect',
    assignedDepartment: 'Propulsion Logistics',
    manufacturingDate: '2025-11-01',
    commissionDate: '2025-11-15',
    lifecycleStatus: 'Maintenance',
    expectedLifeCycles: 200,
    currentCycleCount: 185,
    maximumCycleCount: 200,
    repairStatus: 'Requires Attention',
    inspectionStatus: 'Failed',
    trackingMode: 'GPS Placeholder',
    trackingIdentifier: 'GPS-NGC-BOOST-03',
    createdDate: '2025-11-15T09:00:00Z',
    updatedDate: '2026-06-30T08:12:00Z',
    auditMetadata: {
      createdBy: 'Propulsion Safety Inspector',
      lastInspectedBy: 'NASA Defense Auditor',
      lastAuditedAt: '2026-06-30T08:00:00Z'
    }
  },
  {
    id: 'ast-004',
    assetNumber: 'JNAS-AST-0104',
    assetName: 'Thermoformed ESD Safe Plastic Tote',
    assetType: 'Plastic Tote',
    description: 'Stackable ESD safe polymer tote designed to shuttle highly sensitive spacecraft PCB boards between sub-assembly lines.',
    customer: { id: 'cust-004', name: 'Blue Origin Rocketry' },
    project: { id: 'proj-004', name: 'New Glenn Flight Computer' },
    packagingDesign: { id: 'dsn-004', name: 'PCB Anti-Static Carrier Box', designNumber: 'DSN-0199' },
    engineeringAsset: 'BO-PCB-TOTE-R5.step',
    material: 'ESD Conductive Polypropylene',
    revision: 5,
    status: 'Available',
    currentLocation: 'Kent WA cleanroom storage room',
    owner: 'Avionics Assembly Lead',
    assignedDepartment: 'PCB Assembly Line',
    manufacturingDate: '2026-04-01',
    commissionDate: '2026-04-05',
    lifecycleStatus: 'Released',
    expectedLifeCycles: 300,
    currentCycleCount: 12,
    maximumCycleCount: 300,
    repairStatus: 'Operational',
    inspectionStatus: 'Passed',
    trackingMode: 'QR Code',
    trackingIdentifier: 'QR-BO-TOTE-402',
    createdDate: '2026-04-05T07:30:00Z',
    updatedDate: '2026-06-28T11:00:00Z',
    auditMetadata: {
      createdBy: 'ESD Compliance Auditor',
      lastInspectedBy: 'ESD Compliance Auditor',
      lastAuditedAt: '2026-06-25T11:00:00Z'
    }
  }
];

export const initialInspections: Record<string, InspectionRecord[]> = {
  'ast-001': [
    {
      id: 'insp-101',
      inspectionDate: '2026-06-28',
      inspector: 'Lead Quality Inspector Alpha',
      condition: 'Excellent',
      damageLevel: 'None',
      comments: 'Passed structural load deflection test. Damping springs checked, showing zero micro-fatigue. Shock pads structurally clean.',
      photosPlaceholder: 'asset_insp_001_p1.jpg',
      recommendations: 'Pass',
      nextInspectionDate: '2026-09-28'
    },
    {
      id: 'insp-102',
      inspectionDate: '2026-03-20',
      inspector: 'Lead Quality Inspector Alpha',
      condition: 'Good',
      damageLevel: 'Low',
      comments: 'Minor scratches on protective surface paint coatings. Galvanic protection active. No oxidation.',
      photosPlaceholder: 'asset_insp_001_p0.jpg',
      recommendations: 'Pass',
      nextInspectionDate: '2026-06-20'
    }
  ],
  'ast-002': [
    {
      id: 'insp-201',
      inspectionDate: '2026-06-25',
      inspector: 'Automation Quality Tech B',
      condition: 'Good',
      damageLevel: 'Low',
      comments: 'ESD resistance verified: 10^6 ohms. Grounding chains complete. Caster wheels rolling freely.',
      photosPlaceholder: 'asset_insp_002_p1.jpg',
      recommendations: 'Monitor',
      nextInspectionDate: '2026-08-25'
    }
  ],
  'ast-003': [
    {
      id: 'insp-301',
      inspectionDate: '2026-06-30',
      inspector: 'NASA Defense Auditor',
      condition: 'Damaged',
      damageLevel: 'High',
      comments: 'Crack identified in non-sparking base bronze alloy composite, localized near load-bearing fork slot. Stacking integrity compromised.',
      photosPlaceholder: 'asset_insp_003_p1.jpg',
      recommendations: 'Quarantine',
      nextInspectionDate: '2026-07-05'
    }
  ]
};

export const initialMaintenance: Record<string, MaintenanceRecord[]> = {
  'ast-001': [
    {
      id: 'maint-101',
      recordType: 'Routine',
      scheduledDate: '2026-03-22',
      completedDate: '2026-03-22',
      replacementParts: ['Damping Spring Shock Mount #4'],
      costPlaceholder: 185.00,
      technician: 'Senior Mechanical Tech R',
      status: 'Completed',
      revision: 3,
      comments: 'Preventative replacement of high-cycle polyurethane damping dampener springs.'
    }
  ],
  'ast-003': [
    {
      id: 'maint-301',
      recordType: 'Repair',
      scheduledDate: '2026-07-01',
      replacementParts: ['Base Bronze Spar Support Beam', 'Side Guide Lock Collar'],
      costPlaceholder: 1420.00,
      technician: 'Metallurgy Weld Specialist S',
      status: 'Scheduled',
      revision: 1,
      comments: 'Requires inert gas bronze weld deposition to fuse localized fractures and re-establish load tolerances.'
    }
  ]
};

export const initialLocationHistory: Record<string, LocationHistoryEntry[]> = {
  'ast-001': [
    {
      id: 'lh-101',
      timestamp: '2026-06-30T10:00:00Z',
      location: 'Houston Intermodal Hub (HH-02)',
      stateTransition: 'In Transit',
      updatedBy: 'Gateway RFID Controller RX-8',
      comments: 'Inbound transit ping detected. Asset loaded into standard shipping layout.'
    },
    {
      id: 'lh-102',
      timestamp: '2026-06-25T08:00:00Z',
      location: 'Austin Giga-Bay 4 (AG-04)',
      stateTransition: 'Released',
      updatedBy: 'Senior Shipping Planner',
      comments: 'Asset designated and cleared for intermodal transfer routing.'
    }
  ],
  'ast-002': [
    {
      id: 'lh-201',
      timestamp: '2026-06-29T15:45:00Z',
      location: 'Austin Giga-Bay 4 (AG-04)',
      stateTransition: 'Returned',
      updatedBy: 'Dock Receiving Officer C',
      comments: 'Trolley shuttle returned from Giga-assembly floor. Emptied of battery modules.'
    }
  ]
};

export class ReturnablesRegistry implements IService {
  private static instance: ReturnablesRegistry;
  public serviceId = 'ReturnablesRegistry';

  private assets: Map<string, ReturnableAsset> = new Map();
  private inspections: Map<string, InspectionRecord[]> = new Map();
  private maintenance: Map<string, MaintenanceRecord[]> = new Map();
  private locationHistory: Map<string, LocationHistoryEntry[]> = new Map();
  private auditLogs: ReturnableAuditLog[] = [];

  private constructor() {
    this.loadState();
  }

  public static getInstance(): ReturnablesRegistry {
    if (!this.instance) {
      this.instance = new ReturnablesRegistry();
      try {
        serviceRegistry.register(this.instance);
      } catch (e) {
        console.warn('Could not register ReturnablesRegistry with Core Service Registry', e);
      }
    }
    return this.instance;
  }

  public async initialize(): Promise<void> {
    log.info('Initializing JNAS Returnable Packaging Lifecycle Registry service');
  }

  public async shutdown(): Promise<void> {
    log.info('Shutting down JNAS Returnable Packaging Lifecycle Registry service');
  }

  private loadState(): void {
    try {
      const savedAssets = localStorage.getItem('jnas_returnable_assets');
      const savedInspections = localStorage.getItem('jnas_returnable_inspections');
      const savedMaint = localStorage.getItem('jnas_returnable_maintenance');
      const savedLocs = localStorage.getItem('jnas_returnable_locations');
      const savedAudits = localStorage.getItem('jnas_returnable_audits');

      if (savedAssets) {
        const parsed = JSON.parse(savedAssets);
        parsed.forEach((a: ReturnableAsset) => this.assets.set(a.id, a));
      } else {
        initialAssets.forEach(a => this.assets.set(a.id, a));
      }

      if (savedInspections) {
        const parsed = JSON.parse(savedInspections);
        Object.keys(parsed).forEach(k => this.inspections.set(k, parsed[k]));
      } else {
        Object.keys(initialInspections).forEach(k => this.inspections.set(k, initialInspections[k]));
      }

      if (savedMaint) {
        const parsed = JSON.parse(savedMaint);
        Object.keys(parsed).forEach(k => this.maintenance.set(k, parsed[k]));
      } else {
        Object.keys(initialMaintenance).forEach(k => this.maintenance.set(k, initialMaintenance[k]));
      }

      if (savedLocs) {
        const parsed = JSON.parse(savedLocs);
        Object.keys(parsed).forEach(k => this.locationHistory.set(k, parsed[k]));
      } else {
        Object.keys(initialLocationHistory).forEach(k => this.locationHistory.set(k, initialLocationHistory[k]));
      }

      if (savedAudits) {
        this.auditLogs = JSON.parse(savedAudits);
      } else {
        this.addAuditLog('SYSTEM_INIT', 'SYSTEM', 'Stateful returnable packaging registry initialized with core seeds.');
      }
    } catch (e) {
      log.error('Error loading returnable asset registries', e);
      // Fallback defaults
      initialAssets.forEach(a => this.assets.set(a.id, a));
      Object.keys(initialInspections).forEach(k => this.inspections.set(k, initialInspections[k]));
      Object.keys(initialMaintenance).forEach(k => this.maintenance.set(k, initialMaintenance[k]));
      Object.keys(initialLocationHistory).forEach(k => this.locationHistory.set(k, initialLocationHistory[k]));
    }
  }

  private saveState(): void {
    try {
      localStorage.setItem('jnas_returnable_assets', JSON.stringify(this.getAssets()));
      
      const inspectionsObj: Record<string, InspectionRecord[]> = {};
      this.inspections.forEach((v, k) => { inspectionsObj[k] = v; });
      localStorage.setItem('jnas_returnable_inspections', JSON.stringify(inspectionsObj));

      const maintObj: Record<string, MaintenanceRecord[]> = {};
      this.maintenance.forEach((v, k) => { maintObj[k] = v; });
      localStorage.setItem('jnas_returnable_maintenance', JSON.stringify(maintObj));

      const locsObj: Record<string, LocationHistoryEntry[]> = {};
      this.locationHistory.forEach((v, k) => { locsObj[k] = v; });
      localStorage.setItem('jnas_returnable_locations', JSON.stringify(locsObj));

      localStorage.setItem('jnas_returnable_audits', JSON.stringify(this.auditLogs));
    } catch (e) {
      log.error('Failed to serialize state to localStorage', e);
    }
  }

  public addAuditLog(action: string, targetId: string, details: string, userId: string = 'User 2841'): void {
    const entry: ReturnableAuditLog = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      userId,
      userRole: 'Packaging Engineer',
      action,
      targetId,
      details
    };
    this.auditLogs.unshift(entry);
    this.saveState();
  }

  // Assets Read
  public getAssets(): ReturnableAsset[] {
    return Array.from(this.assets.values());
  }

  public getAssetById(id: string): ReturnableAsset | undefined {
    return this.assets.get(id);
  }

  public getAssetByNumber(num: string): ReturnableAsset | undefined {
    return this.getAssets().find(a => a.assetNumber.toLowerCase() === num.toLowerCase());
  }

  // Create Asset
  public createAsset(asset: Omit<ReturnableAsset, 'id' | 'assetNumber' | 'createdDate' | 'updatedDate'>): ReturnableAsset {
    const totalCount = this.getAssets().length;
    const padding = String(totalCount + 101).padStart(4, '0');
    const assetNumber = `JNAS-AST-${padding}`;
    const id = `ast-${Date.now()}`;
    const isoString = new Date().toISOString();

    const newAsset: ReturnableAsset = {
      ...asset,
      id,
      assetNumber,
      createdDate: isoString,
      updatedDate: isoString
    };

    this.assets.set(id, newAsset);
    this.addAuditLog('ASSET_CREATED', id, `Registered reusable asset: ${assetNumber} (${asset.assetName})`);

    eventBus.publish('ACTIVITY_CREATED', {
      type: 'Asset Created',
      title: `Asset Staged: ${assetNumber}`,
      description: `New ${asset.assetType} engineered to lifecycle tracking specification. Tracking Ident: ${asset.trackingIdentifier}`,
      category: 'packaging',
      referenceId: id
    }, { emitter: 'ReturnablesRegistry' });

    // Seed location log
    this.addLocationHistory(id, asset.currentLocation, asset.lifecycleStatus, 'Logistics Engine', 'Initial asset commissioning.');

    this.saveState();
    return newAsset;
  }

  // Update Asset
  public updateAsset(id: string, updates: Partial<ReturnableAsset>): ReturnableAsset {
    const existing = this.assets.get(id);
    if (!existing) throw new Error(`Asset with id ${id} not found.`);

    const wasLifecycleChanged = updates.lifecycleStatus && updates.lifecycleStatus !== existing.lifecycleStatus;

    const updated: ReturnableAsset = {
      ...existing,
      ...updates,
      updatedDate: new Date().toISOString()
    };

    this.assets.set(id, updated);
    this.addAuditLog('ASSET_UPDATED', id, `Modified packaging asset specification: ${existing.assetNumber}`);

    if (wasLifecycleChanged && updates.lifecycleStatus) {
      this.addLocationHistory(
        id, 
        updates.currentLocation || existing.currentLocation, 
        updates.lifecycleStatus, 
        'Supply Chain Architect', 
        `Lifecycle state shifted into ${updates.lifecycleStatus}`
      );

      eventBus.publish('ACTIVITY_CREATED', {
        type: 'Lifecycle Changed',
        title: `Asset Lifecycle: ${existing.assetNumber}`,
        description: `Reusable asset transitioned to state ${updates.lifecycleStatus} inside ${updates.currentLocation || existing.currentLocation}.`,
        category: 'packaging',
        referenceId: id
      }, { emitter: 'ReturnablesRegistry' });
    }

    this.saveState();
    return updated;
  }

  // Location History
  public getLocationHistory(assetId: string): LocationHistoryEntry[] {
    return this.locationHistory.get(assetId) || [];
  }

  public addLocationHistory(
    assetId: string, 
    location: string, 
    stateTransition: AssetLifecycleState, 
    updatedBy: string, 
    comments: string
  ): LocationHistoryEntry {
    const entry: LocationHistoryEntry = {
      id: `lh-${Date.now()}`,
      timestamp: new Date().toISOString(),
      location,
      stateTransition,
      updatedBy,
      comments
    };

    const list = this.locationHistory.get(assetId) || [];
    list.unshift(entry);
    this.locationHistory.set(assetId, list);
    
    this.saveState();
    return entry;
  }

  // Inspections CRUD
  public getInspections(assetId: string): InspectionRecord[] {
    return this.inspections.get(assetId) || [];
  }

  public addInspection(assetId: string, record: Omit<InspectionRecord, 'id'>): InspectionRecord {
    const existing = this.assets.get(assetId);
    if (!existing) throw new Error(`Asset ${assetId} not found.`);

    const id = `insp-${Date.now()}`;
    const newRecord: InspectionRecord = {
      ...record,
      id
    };

    const list = this.inspections.get(assetId) || [];
    list.unshift(newRecord);
    this.inspections.set(assetId, list);

    // Update asset statuses based on recommendations
    let inspectionStatus: ReturnableAsset['inspectionStatus'] = 'Passed';
    let repairStatus: ReturnableAsset['repairStatus'] = existing.repairStatus;
    let lifecycleStatus: ReturnableAsset['lifecycleStatus'] = existing.lifecycleStatus;

    if (record.recommendations === 'Quarantine') {
      inspectionStatus = 'Failed';
      repairStatus = 'Requires Attention';
      lifecycleStatus = 'Maintenance';
    } else if (record.recommendations === 'Schedule Repair') {
      inspectionStatus = 'Failed';
      repairStatus = 'Requires Attention';
      lifecycleStatus = 'Repair';
    } else if (record.recommendations === 'Scrap') {
      inspectionStatus = 'Failed';
      lifecycleStatus = 'Scrapped';
    } else if (record.recommendations === 'Monitor') {
      inspectionStatus = 'Pending';
    }

    this.updateAsset(assetId, {
      inspectionStatus,
      repairStatus,
      lifecycleStatus,
      auditMetadata: {
        ...existing.auditMetadata,
        lastInspectedBy: record.inspector,
        lastAuditedAt: new Date().toISOString()
      }
    });

    this.addAuditLog('INSPECTION_COMPLETED', assetId, `Completed engineering audit inspection: Status ${record.condition}, Decision ${record.recommendations}`);

    eventBus.publish('ACTIVITY_CREATED', {
      type: 'Inspection Completed',
      title: `Asset Inspected: ${existing.assetNumber}`,
      description: `Asset verified by ${record.inspector}. Condition: ${record.condition}. Recommendation: ${record.recommendations}.`,
      category: 'packaging',
      referenceId: assetId
    }, { emitter: 'ReturnablesRegistry' });

    this.saveState();
    return newRecord;
  }

  // Maintenance CRUD
  public getMaintenance(assetId: string): MaintenanceRecord[] {
    return this.maintenance.get(assetId) || [];
  }

  public addMaintenance(assetId: string, record: Omit<MaintenanceRecord, 'id' | 'revision'>): MaintenanceRecord {
    const existing = this.assets.get(assetId);
    if (!existing) throw new Error(`Asset ${assetId} not found.`);

    const id = `maint-${Date.now()}`;
    const newRecord: MaintenanceRecord = {
      ...record,
      id,
      revision: existing.revision + 1
    };

    const list = this.maintenance.get(assetId) || [];
    list.unshift(newRecord);
    this.maintenance.set(assetId, list);

    // Update repair status
    let repairStatus: ReturnableAsset['repairStatus'] = existing.repairStatus;
    let lifecycleStatus: ReturnableAsset['lifecycleStatus'] = existing.lifecycleStatus;
    let inspectionStatus: ReturnableAsset['inspectionStatus'] = existing.inspectionStatus;

    if (record.status === 'Completed') {
      repairStatus = 'Operational';
      lifecycleStatus = 'In Service';
      inspectionStatus = 'Passed';
    } else if (record.status === 'In Progress') {
      repairStatus = 'Undergoing Repair';
      lifecycleStatus = 'Repair';
    }

    this.updateAsset(assetId, {
      repairStatus,
      lifecycleStatus,
      inspectionStatus,
      revision: existing.revision + 1
    });

    const isRepair = record.recordType === 'Repair' || record.recordType === 'Refurbishment';
    const logAction = isRepair ? 'REPAIR_COMPLETED' : 'MAINTENANCE_COMPLETED';

    this.addAuditLog(logAction, assetId, `Added mechanical service sheet (${record.recordType}): Tech ${record.technician}, State ${record.status}`);

    eventBus.publish('ACTIVITY_CREATED', {
      type: isRepair ? 'Repair Completed' : 'Maintenance Completed',
      title: `${isRepair ? 'Repair' : 'Maintenance'} Record: ${existing.assetNumber}`,
      description: `Asset underwent ${record.recordType} procedure. Technician: ${record.technician}. Replacement components: ${record.replacementParts.join(', ') || 'none'}.`,
      category: 'packaging',
      referenceId: assetId
    }, { emitter: 'ReturnablesRegistry' });

    this.saveState();
    return newRecord;
  }

  public getAuditLogs(): ReturnableAuditLog[] {
    return this.auditLogs;
  }
}

export const returnablesRegistry = ReturnablesRegistry.getInstance();

import { PackagingProject, PackagingDesign } from '../packaging/types';

export type LoadPlanStatus = 'Draft' | 'Submitted' | 'In Review' | 'Approved' | 'Archived';
export type LoadPlanPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type LoadPlanApprovalStatus = 'Pending' | 'In Review' | 'Approved' | 'Rejected';

export interface CapacityModel {
  volume: number; // in cubic meters
  weight: number; // in kg
  dimensions: {
    length: number;
    width: number;
    height: number;
    unit: 'mm' | 'inch';
  };
  stackingLimit: number; // maximum stacked tiers
  maximumCapacity: number; // max units allowed
  safetyMargin: number; // percentage, e.g. 15 for 15%
  loadingZone: string; // warehouse zone identifier
  centerOfGravity: string; // e.g. "[X: 0, Y: 0, Z: 450]"
}

export interface ContainerEquipment {
  id: string;
  type: '20ft Container' | '40ft Container' | '40HC' | 'Pallet' | 'Rack' | 'Truck' | 'Trailer' | 'Warehouse Bin' | 'Custom Container';
  name: string;
  code: string;
  description: string;
  lengthMm: number;
  widthMm: number;
  heightMm: number;
  maxWeightKg: number;
  maxVolumeCbm: number;
  status: 'Available' | 'In Use' | 'Maintenance' | 'Reserved';
}

export interface LoadPlan {
  id: string;
  planNumber: string; // e.g. JNAS-LPL-001
  title: string;
  description: string;
  customer: {
    id: string;
    name: string;
  };
  project: {
    id: string;
    name: string;
  };
  packagingDesign: {
    id: string;
    name: string;
    designNumber: string;
  };
  engineeringAsset: string; // Linked Drawing/CAD part ref
  containerType: ContainerEquipment['type'];
  containerId: string; // Linked ContainerEquipment.id
  vehicleType: string; // e.g. Flatbed Truck, Intermodal Railcar, Cargo Jet
  warehouse: string; // Warehouse facility identifier
  status: LoadPlanStatus;
  priority: LoadPlanPriority;
  revision: number;
  planner: string;
  approvalStatus: LoadPlanApprovalStatus;
  capacity: CapacityModel;
  createdDate: string;
  updatedDate: string;
  auditMetadata: {
    createdBy: string;
    approvedBy?: string;
    lastAuditedAt?: string;
  };
}

export interface LogisticsAuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userRole: string;
  action: string;
  targetId: string;
  details: string;
}

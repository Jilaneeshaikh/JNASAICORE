import { PackagingProject, PackagingDesign } from '../packaging/types';

export type AssetType = 'Steel Rack' | 'Plastic Tote' | 'Metal Bin' | 'Kit Cart' | 'Pallet' | 'Custom Fixture' | 'Returnable Crate' | 'Container';

export type AssetLifecycleState = 
  | 'Designed'
  | 'Manufactured'
  | 'Approved'
  | 'Released'
  | 'In Service'
  | 'In Transit'
  | 'At Customer'
  | 'Returned'
  | 'Maintenance'
  | 'Repair'
  | 'Refurbished'
  | 'Retired'
  | 'Scrapped';

export type TrackingMode = 'QR Code' | 'Barcode' | 'RFID' | 'BLE Beacon' | 'GPS Placeholder' | 'Manual Tracking';

export interface InspectionRecord {
  id: string;
  inspectionDate: string;
  inspector: string;
  condition: 'Excellent' | 'Good' | 'Fair' | 'Damaged' | 'Critical';
  damageLevel: 'None' | 'Low' | 'Medium' | 'High' | 'Structural';
  comments: string;
  photosPlaceholder: string; // e.g. "asset_ins_021.jpg"
  recommendations: 'Pass' | 'Monitor' | 'Schedule Repair' | 'Quarantine' | 'Scrap';
  nextInspectionDate: string;
}

export interface MaintenanceRecord {
  id: string;
  recordType: 'Routine' | 'Repair' | 'Refurbishment' | 'Calibration';
  scheduledDate: string;
  completedDate?: string;
  replacementParts: string[]; // e.g. ["Heavy Swivel Caster", "Steel Structural Bracket"]
  costPlaceholder: number; // USD
  technician: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Deferred';
  revision: number;
  comments: string;
}

export interface ReturnableAsset {
  id: string;
  assetNumber: string; // e.g. JNAS-AST-0402
  assetName: string;
  assetType: AssetType;
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
  engineeringAsset: string; // CAD Step file ref
  material: string; // e.g. HDPE, Structural Carbon Steel
  revision: number;
  status: 'Available' | 'Assigned' | 'Staged' | 'Quarantined' | 'Retired';
  currentLocation: string; // Facility coordinate, e.g. "Austin Giga-Bay 4"
  owner: string;
  assignedDepartment: string;
  manufacturingDate: string;
  commissionDate: string;
  retirementDate?: string;
  lifecycleStatus: AssetLifecycleState;
  expectedLifeCycles: number;
  currentCycleCount: number;
  maximumCycleCount: number;
  repairStatus: 'Operational' | 'Requires Attention' | 'Undergoing Repair' | 'Quarantined';
  inspectionStatus: 'Pending' | 'Passed' | 'Overdue' | 'Failed';
  trackingMode: TrackingMode;
  trackingIdentifier: string; // e.g. "RFID-HEX-A938C" or "QR-0402"
  createdDate: string;
  updatedDate: string;
  auditMetadata: {
    createdBy: string;
    lastInspectedBy?: string;
    lastAuditedAt?: string;
  };
}

export interface LocationHistoryEntry {
  id: string;
  timestamp: string;
  location: string;
  stateTransition: AssetLifecycleState;
  updatedBy: string;
  comments: string;
}

export interface ReturnableAuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userRole: string;
  action: string;
  targetId: string;
  details: string;
}

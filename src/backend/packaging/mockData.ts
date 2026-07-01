import { PackagingMaterial, PackagingProject, MaterialStandard, PackagingComponent, PackagingDesign, ValidationRule } from './types';

// Packaging standards seeds
export const initialStandards: MaterialStandard[] = [
  {
    id: 'std-001',
    code: 'ASTM-D3951',
    name: 'Commercial Packaging Standard Practice',
    type: 'ASTM',
    description: 'Establishes minimum requirements for packaging of materials for commercial and military shipment.',
    revision: 'A-20',
    publishedDate: '2020-11-15',
    status: 'Active'
  },
  {
    id: 'std-002',
    code: 'ISPM-15',
    name: 'Phytosanitary Wood Regulation',
    type: 'ISO',
    description: 'International standards for phytosanitary measures regulating wood packaging materials in global trade.',
    revision: 'R-18',
    publishedDate: '2018-04-10',
    status: 'Active'
  },
  {
    id: 'std-003',
    code: 'NASA-STD-6016',
    name: 'Spacecraft Material & Process Standards',
    type: 'Material',
    description: 'Strict quality control, offgassing, and environmental standards for materials used inside spacecraft cabins.',
    revision: 'Rev B',
    publishedDate: '2021-09-30',
    status: 'Active'
  },
  {
    id: 'std-004',
    code: 'MIL-STD-2073',
    name: 'Military Packaging Standard Practice',
    type: 'OEM',
    description: 'Defense department standard for military preservation and packing development criteria.',
    revision: '1E-Chg 3',
    publishedDate: '2022-02-01',
    status: 'Active'
  },
  {
    id: 'std-005',
    code: 'ISO-2248',
    name: 'Transport Drop Testing Spec',
    type: 'ISO',
    description: 'Defines vertical drop testing methods for complete, filled transport packages.',
    revision: '2023',
    publishedDate: '2023-01-10',
    status: 'Active'
  }
];

// Expanded core materials seeds
export const initialMaterials: PackagingMaterial[] = [
  {
    id: 'mat-001',
    code: 'ESD-PETG-02',
    name: 'Stat-Kon Electrostatic Dissipative PET-G',
    category: 'Plastic',
    subcategory: 'Thermoformed Sheet',
    description: 'Ideal for custom thermoformed dunnage trays holding flight electronics. Excellent impact resistance and reliable ESD surface resistivity (10^6 to 10^9 ohms/sq).',
    materialType: 'Polymer',
    grade: 'ESD',
    density: '1.27 g/cm³',
    weight: '2.5 kg/sheet',
    thickness: '3.2 mm',
    dimensions: '1220mm x 2440mm',
    color: 'Opaque Black',
    finish: 'Matte',
    surfaceTreatment: 'Inherent Conductive Filler',
    manufacturer: 'Sabic Innovative Plastics',
    supplierPlaceholder: 'Allied Plastics Inc.',
    standardIds: ['std-004'],
    unit: 'sheet',
    costPlaceholder: 125.50,
    lifecycleStatus: 'Approved',
    revision: 'A',
    approvalStatus: 'Approved',
    tags: ['ESD', 'Polymer', 'PETG', 'Avionics'],
    isArchived: false,
    createdAt: '2026-01-15T08:00:00Z',
    updatedAt: '2026-06-20T11:00:00Z'
  },
  {
    id: 'mat-002',
    code: 'EVA-FOAM-45',
    name: 'High-Density Ethylene-Vinyl Acetate Foam',
    category: 'Foam',
    subcategory: 'Cushioning Block',
    description: 'Excellent closed-cell shock-absorbency for delicate flight assemblies, cameras, and optical guidance control clusters.',
    materialType: 'Composite Polymer',
    grade: 'Structural Cushion',
    density: '45 kg/m³',
    weight: '1.8 kg/block',
    thickness: '100 mm',
    dimensions: '1000mm x 2000mm',
    color: 'Charcoal Dark Gray',
    finish: 'Textured Cell',
    surfaceTreatment: 'None',
    manufacturer: 'Zotefoams Inc',
    supplierPlaceholder: 'Foam Fab Industries',
    standardIds: ['std-001', 'std-005'],
    unit: 'block',
    costPlaceholder: 85.00,
    lifecycleStatus: 'Approved',
    revision: 'B',
    approvalStatus: 'Approved',
    tags: ['Cushion', 'Shock Absorption', 'Closed Cell', 'EVA'],
    isArchived: false,
    createdAt: '2026-02-10T10:30:00Z',
    updatedAt: '2026-06-21T09:15:00Z'
  },
  {
    id: 'mat-003',
    code: 'AL-RACK-6061',
    name: 'Anodized 6061-T6 Structural Aluminum',
    category: 'Aluminium',
    subcategory: 'Extruded Profile',
    description: 'Heavy-duty structural framework for engine storage racks, mobile integration carts, and spacecraft ground transport stands.',
    materialType: 'Metal Alloy',
    grade: 'Structural Spacecraft Grade',
    density: '2.70 g/cm³',
    weight: '5.8 kg/meter',
    thickness: '6.0 mm Wall',
    dimensions: '80mm x 80mm t-slot',
    color: 'Satin Silver',
    finish: 'Anodized Hardcoat',
    surfaceTreatment: 'Mil-A-8625 Type III Anodizing',
    manufacturer: 'Alcoa Corporation',
    supplierPlaceholder: 'Pacific Metal Supply',
    standardIds: ['std-003'],
    unit: 'meter',
    costPlaceholder: 42.00,
    lifecycleStatus: 'Approved',
    revision: 'A',
    approvalStatus: 'Approved',
    tags: ['Metal', 'Structural', 'Rack', 'Reusable'],
    isArchived: false,
    createdAt: '2026-03-01T09:00:00Z',
    updatedAt: '2026-06-22T14:40:00Z'
  },
  {
    id: 'mat-004',
    code: 'CORR-BC-275',
    name: 'Heavy-Duty Double-Wall BC Flute Corrugated',
    category: 'Corrugated',
    subcategory: 'Packaging Board',
    description: 'Standard heavy-duty protective outer cartons for transport of non-flight support hardware, tools, and non-ESD spares.',
    materialType: 'Paper-based',
    grade: 'Heavy Duty Industrial',
    density: '450 g/m²',
    weight: '0.9 kg/sheet',
    thickness: '6.4 mm',
    dimensions: '1500mm x 3000mm flat',
    color: 'Kraft Brown',
    finish: 'Uncoated',
    surfaceTreatment: 'None',
    manufacturer: 'International Paper Co.',
    supplierPlaceholder: 'Uline Logistics Hub',
    standardIds: ['std-001'],
    unit: 'sheet',
    costPlaceholder: 6.75,
    lifecycleStatus: 'Approved',
    revision: 'A',
    approvalStatus: 'Approved',
    tags: ['Cardboard', 'Expendable', 'Carton', 'Recyclable'],
    isArchived: false,
    createdAt: '2026-01-20T11:00:00Z',
    updatedAt: '2026-06-18T16:20:00Z'
  },
  {
    id: 'mat-005',
    code: 'WOOD-PLY-M3',
    name: 'IPPC ISPM-15 Certified Marine Plywood',
    category: 'Plywood',
    subcategory: 'Engineered Board',
    description: 'Required for global maritime/export crate enclosures. Resistant to rot, heat-treated for pest termination, and stamped with IPPC seals.',
    materialType: 'Organic Wood',
    grade: 'Maritime Export',
    density: '680 kg/m³',
    weight: '24.5 kg/sheet',
    thickness: '19.0 mm',
    dimensions: '1220mm x 2440mm',
    color: 'Natural Wood Grain',
    finish: 'Sanded',
    surfaceTreatment: 'IPPC Heat Treatment (HT)',
    manufacturer: 'Weyerhaeuser Company',
    supplierPlaceholder: 'Global Lumber Dist',
    standardIds: ['std-002'],
    unit: 'sheet',
    costPlaceholder: 95.00,
    lifecycleStatus: 'Approved',
    revision: 'C',
    approvalStatus: 'Approved',
    tags: ['Wood', 'Crate', 'Export', 'Maritime'],
    isArchived: false,
    createdAt: '2026-02-15T08:30:00Z',
    updatedAt: '2026-06-29T10:00:00Z'
  },
  {
    id: 'mat-006',
    code: 'STEEL-A36-STRUCT',
    name: 'Structural Steel A36 Beam Profile',
    category: 'Steel',
    subcategory: 'Heavy Structural',
    description: 'Carbon steel plate and channel beams used to manufacture heavy-duty launch-pad transport carts and rocket booster storage jigs.',
    materialType: 'Metal Alloy',
    grade: 'Heavy Structural',
    density: '7.85 g/cm³',
    weight: '18.4 kg/meter',
    thickness: '12.0 mm',
    dimensions: '100mm x 100mm channel',
    color: 'Dark Gray',
    finish: 'Hot Rolled',
    surfaceTreatment: 'Zinc Phosphate Primed',
    manufacturer: 'Nucor Steel Corp',
    supplierPlaceholder: 'Apex Metal Center',
    standardIds: [],
    unit: 'meter',
    costPlaceholder: 68.00,
    lifecycleStatus: 'Approved',
    revision: 'A',
    approvalStatus: 'Approved',
    tags: ['Metal', 'Steel', 'Heavy Structure', 'Booster'],
    isArchived: false,
    createdAt: '2026-04-10T14:00:00Z',
    updatedAt: '2026-06-15T11:20:00Z'
  }
];

// Initial packaging component definitions
export const initialComponents: PackagingComponent[] = [
  {
    id: 'comp-001',
    code: 'CMP-TR-ESD-01',
    name: 'PCB Static Dissipative Slotted Insert',
    description: 'Custom vacuum-formed thermoformed tray insert with 24 individual precision slots designed to hold Guidance Control boards without component contact.',
    category: 'Dunnage Insert',
    materialId: 'mat-001',
    revision: 'R1',
    status: 'Active',
    engineeringAsset: 'Guidance Tray Assembly',
    drawingRef: 'dwg-avion-401',
    partNumber: 'JNAS-AV-DNG-24',
    projectId: 'pkg-002',
    customerId: 'cust-spacex-02',
    knowledgeLinks: ['kno-esd-99'],
    memoryLinks: ['mem-esd-23'],
    activities: [],
    documentRefs: ['doc-std-esd'],
    futureSupplierPlaceholder: 'Polymer Forms LLC',
    createdAt: '2026-06-02T10:00:00Z',
    updatedAt: '2026-06-30T10:15:00Z'
  },
  {
    id: 'comp-002',
    code: 'CMP-FO-CUSH-04',
    name: 'Thrust Chamber Neck Contour Cushion',
    description: 'Contour waterjet cut EVA-45 foam cushioning collar designed to lock around the throat of the Thrust Chamber to neutralize vertical transport vibrations.',
    category: 'Cushion',
    materialId: 'mat-002',
    revision: 'R2',
    status: 'Active',
    engineeringAsset: 'Thrust Chamber Damper System',
    drawingRef: 'dwg-prop-002',
    partNumber: 'JNAS-PRP-CSH-Neck',
    projectId: 'pkg-001',
    customerId: 'cust-nasa-01',
    knowledgeLinks: ['kno-prop-09'],
    memoryLinks: ['mem-091'],
    activities: [],
    documentRefs: ['doc-spec-302'],
    futureSupplierPlaceholder: 'Precision Foam Cutters',
    createdAt: '2026-05-12T09:00:00Z',
    updatedAt: '2026-06-28T14:30:00Z'
  },
  {
    id: 'comp-003',
    code: 'CMP-AL-BASE-12',
    name: 'Engine Pod Slide-Out Skid Rail',
    description: 'Heavy duty modular extruded aluminum slide-out guide rails used for sliding high weight booster pods safely out of wooden shipping crates.',
    category: 'Base',
    materialId: 'mat-003',
    revision: 'R1',
    status: 'Active',
    engineeringAsset: 'Structural Rail Base',
    drawingRef: 'dwg-prop-002',
    partNumber: 'JNAS-PRP-RAIL-01',
    projectId: 'pkg-001',
    customerId: 'cust-nasa-01',
    knowledgeLinks: ['kno-pkg-12'],
    memoryLinks: ['mem-095'],
    activities: [],
    documentRefs: ['doc-test-99'],
    futureSupplierPlaceholder: 'AlumaStructures Inc.',
    createdAt: '2026-05-15T11:00:00Z',
    updatedAt: '2026-06-25T13:40:00Z'
  },
  {
    id: 'comp-004',
    code: 'CMP-WD-LID-03',
    name: 'Heavy Launch Box Bolt-Down Panel',
    description: 'Sealed marine plywood heavy-duty structural flat top lid configured with weather stripping and steel mounting clips to enclose primary propulsion hardware.',
    category: 'Lid',
    materialId: 'mat-005',
    revision: 'R3',
    status: 'Active',
    engineeringAsset: 'Shipping Lid Component',
    drawingRef: 'dwg-prop-002',
    partNumber: 'JNAS-CRAT-LID-301',
    projectId: 'pkg-001',
    customerId: 'cust-nasa-01',
    knowledgeLinks: [],
    memoryLinks: [],
    activities: [],
    documentRefs: [],
    futureSupplierPlaceholder: 'Seattle Maritime Woodworks',
    createdAt: '2026-05-11T09:30:00Z',
    updatedAt: '2026-06-28T14:30:00Z'
  }
];

// Original project listings (with integrated component references)
export const initialPackagingProjects: PackagingProject[] = [
  {
    id: 'pkg-001',
    projectNumber: 'JNAS-PKG-301',
    projectName: 'Thrust Chamber Shipping Pod v2',
    customerId: 'cust-nasa-01',
    customerName: 'NASA Glenn Research Center',
    engineeringProjectId: 'proj-prop-01',
    engineeringProjectName: 'Propulsion Assembly Project',
    packagingType: 'Wooden Crate',
    industry: 'Aerospace Propulsion',
    status: 'In Review',
    priority: 'High',
    owner: 'Dr. Sarah Jenkins',
    packagingEngineer: 'Alex Mercer',
    revision: 2,
    startDate: '2026-05-10',
    targetDate: '2026-07-15',
    approvalStatus: 'In Review',
    tags: ['Propulsion', 'Heavy Lift', 'Shock-Isolated', 'Crate'],
    knowledgeLinks: ['kno-prop-09', 'kno-pkg-12'],
    memoryLinks: ['mem-091', 'mem-095'],
    documentRefs: ['doc-spec-302', 'doc-test-99'],
    drawingRefs: ['dwg-prop-002'],
    changeRefs: ['eco-104'],
    dunnageSpecs: {
      materialCode: 'EVA-FOAM-45',
      thickness: '75mm',
      customCavities: 1,
      antistatic: true
    },
    weightCapacityKg: 1250,
    dimensionsOuter: {
      length: 1800,
      width: 1200,
      height: 1100,
      unit: 'mm'
    },
    createdAt: '2026-05-10T08:00:00Z',
    updatedAt: '2026-06-28T14:30:00Z'
  },
  {
    id: 'pkg-002',
    projectNumber: 'JNAS-PKG-302',
    projectName: 'Guidance Control PCB Antistatic Rack',
    customerId: 'cust-spacex-02',
    customerName: 'SpaceX Falcon Core Group',
    engineeringProjectId: 'proj-avion-02',
    engineeringProjectName: 'Avionics Flight Hardware',
    packagingType: 'Plastic Tote',
    industry: 'Flight Electronics',
    status: 'Approved',
    priority: 'Critical',
    owner: 'Marcus Aurelius',
    packagingEngineer: 'Elena Rostova',
    revision: 3,
    startDate: '2026-06-01',
    targetDate: '2026-07-01',
    approvalStatus: 'Approved',
    tags: ['Avionics', 'ESD', 'Tote', 'Anti-Static'],
    knowledgeLinks: ['kno-esd-99'],
    memoryLinks: ['mem-esd-23'],
    documentRefs: ['doc-std-esd'],
    drawingRefs: ['dwg-avion-401'],
    changeRefs: [],
    dunnageSpecs: {
      materialCode: 'ESD-PETG-02',
      thickness: '12mm',
      customCavities: 24,
      antistatic: true
    },
    weightCapacityKg: 45,
    dimensionsOuter: {
      length: 600,
      width: 400,
      height: 320,
      unit: 'mm'
    },
    createdAt: '2026-06-01T09:00:00Z',
    updatedAt: '2026-06-30T10:15:00Z'
  },
  {
    id: 'pkg-003',
    projectNumber: 'JNAS-PKG-303',
    projectName: 'Actuator Gimbal Multi-Kit Cart',
    customerId: 'cust-blue-03',
    customerName: 'Blue Origin New Glenn Systems',
    engineeringProjectId: 'proj-gimbal-03',
    engineeringProjectName: 'Gimbal Vector Controls',
    packagingType: 'Kit Cart',
    industry: 'Robotics',
    status: 'Draft',
    priority: 'Medium',
    owner: 'Elena Rostova',
    packagingEngineer: 'Alex Mercer',
    revision: 1,
    startDate: '2026-06-15',
    targetDate: '2026-08-01',
    approvalStatus: 'Pending',
    tags: ['Robotics', 'Kitting', 'Mobile', 'Cart'],
    knowledgeLinks: [],
    memoryLinks: [],
    documentRefs: [],
    drawingRefs: ['dwg-gimb-012'],
    changeRefs: [],
    dunnageSpecs: {
      materialCode: 'EVA-FOAM-45',
      thickness: '50mm',
      customCavities: 6,
      antistatic: false
    },
    weightCapacityKg: 250,
    dimensionsOuter: {
      length: 1200,
      width: 800,
      height: 1050,
      unit: 'mm'
    },
    createdAt: '2026-06-15T10:30:00Z',
    updatedAt: '2026-06-15T11:00:00Z'
  }
];

export const initialPackagingDesigns: PackagingDesign[] = [
  {
    id: 'dsn-2801',
    designNumber: 'DSN-PKG-2801',
    designName: 'Heavy Booster Shock-Transit System v1',
    description: 'Custom heavy-duty shipping steel structure configured with waterjet contour EVA dunnage dampening pads and top-panel marine plywood closure system. Specially designed to absorb booster shipping impact up to 5G.',
    customer: {
      id: 'cust-nasa-01',
      name: 'NASA Glenn Research Center'
    },
    project: {
      id: 'proj-prop-01',
      name: 'Propulsion Assembly Project'
    },
    packagingType: 'Wooden Crate',
    category: 'Steel Rack',
    revision: 2,
    lifecycleStatus: 'Released',
    approvalStatus: 'Approved',
    packagingEngineer: 'Alex Mercer',
    owner: 'Dr. Sarah Jenkins',
    version: '1.2.0',
    engineeringAsset: 'Assy-Prop-Crate-301',
    bom: [
      { componentId: 'comp-002', code: 'CMP-FO-CUSH-04', name: 'Thrust Chamber Neck Contour Cushion', quantity: 2 },
      { componentId: 'comp-003', code: 'CMP-AL-BASE-12', name: 'Engine Pod Slide-Out Skid Rail', quantity: 4 },
      { componentId: 'comp-004', code: 'CMP-WD-LID-03', name: 'Heavy Launch Box Bolt-Down Panel', quantity: 1 }
    ],
    materials: ['mat-002', 'mat-003', 'mat-005', 'mat-006'],
    knowledgeLinks: ['kno-prop-09', 'kno-pkg-12'],
    memoryLinks: ['mem-091', 'mem-095'],
    documents: [
      { id: 'doc-dsn-2801-spec', name: 'Design Specifications Sheet', url: '/docs/spec-302.pdf' },
      { id: 'doc-dsn-2801-test', name: 'Drop & Vibe Impact Test Report', url: '/docs/test-99.pdf' }
    ],
    activities: [
      { id: 'act-1', timestamp: '2026-06-28T14:30:00Z', user: 'Alex Mercer', action: 'Design Approved', details: 'Final approval issued following quality assurance review.' },
      { id: 'act-2', timestamp: '2026-06-25T11:00:00Z', user: 'Alex Mercer', action: 'BOM Updated', details: 'Added heavy launch box bolt-down panel lid component.' }
    ],
    workflow: [
      { stage: 'Drafting', status: 'Completed', assignee: 'Alex Mercer' },
      { stage: 'Structural FEA Review', status: 'Completed', assignee: 'Elena Rostova' },
      { stage: 'Quality Compliance', status: 'Completed', assignee: 'Marcus Aurelius' },
      { stage: 'Release Gate', status: 'Completed', assignee: 'Sarah Jenkins' }
    ],
    createdAt: '2026-05-10T08:00:00Z',
    updatedAt: '2026-06-28T14:30:00Z',
    auditMetadata: {
      createdBy: 'Alex Mercer',
      approvedBy: 'Sarah Jenkins',
      lastAuditedAt: '2026-06-28T14:30:00Z'
    }
  },
  {
    id: 'dsn-2802',
    designNumber: 'DSN-PKG-2802',
    designName: 'Stat-Kon Avionics Slotted Tray Enclosure',
    description: 'Thermoformed high-performance PETG slotted tray insert enclosed in a protective antistatic polypropylene box. Optimally arranged with 24 custom slots matching standard spacecraft control computer PCBs.',
    customer: {
      id: 'cust-spacex-02',
      name: 'SpaceX Falcon Core Group'
    },
    project: {
      id: 'proj-avion-02',
      name: 'Avionics Flight Hardware'
    },
    packagingType: 'Plastic Tote',
    category: 'Returnable Rack',
    revision: 3,
    lifecycleStatus: 'Approved',
    approvalStatus: 'Approved',
    packagingEngineer: 'Elena Rostova',
    owner: 'Marcus Aurelius',
    version: '1.0.0',
    engineeringAsset: 'Assy-Avion-Tote-401',
    bom: [
      { componentId: 'comp-001', code: 'CMP-TR-ESD-01', name: 'PCB Static Dissipative Slotted Insert', quantity: 1 }
    ],
    materials: ['mat-001'],
    knowledgeLinks: ['kno-esd-99'],
    memoryLinks: ['mem-esd-23'],
    documents: [
      { id: 'doc-dsn-2802-spec', name: 'Anti-Static Test Certificate', url: '/docs/esd-cert.pdf' }
    ],
    activities: [
      { id: 'act-1', timestamp: '2026-06-30T10:15:00Z', user: 'Elena Rostova', action: 'Design Approved', details: 'Passed ESD surface resistivity scan standard.' }
    ],
    workflow: [
      { stage: 'Concept Development', status: 'Completed', assignee: 'Elena Rostova' },
      { stage: 'ESD Surface Testing', status: 'Completed', assignee: 'Alex Mercer' },
      { stage: 'Signoff Gate', status: 'Completed', assignee: 'Marcus Aurelius' }
    ],
    createdAt: '2026-06-01T09:00:00Z',
    updatedAt: '2026-06-30T10:15:00Z',
    auditMetadata: {
      createdBy: 'Elena Rostova',
      approvedBy: 'Marcus Aurelius',
      lastAuditedAt: '2026-06-30T10:15:00Z'
    }
  },
  {
    id: 'dsn-2803',
    designNumber: 'DSN-PKG-2803',
    designName: 'Vector Actuator Gimbal Multi-Kit Cart',
    description: 'Integrated aluminum kit-cart transport chassis designed for six precision gimbals. Features custom CNC-profiled foam cushioning base with tool storage dividers for launchpad technicians.',
    customer: {
      id: 'cust-blue-03',
      name: 'Blue Origin New Glenn Systems'
    },
    project: {
      id: 'proj-gimbal-03',
      name: 'Gimbal Vector Controls'
    },
    packagingType: 'Kit Cart',
    category: 'Kit Cart',
    revision: 1,
    lifecycleStatus: 'Draft',
    approvalStatus: 'Pending',
    packagingEngineer: 'Alex Mercer',
    owner: 'Elena Rostova',
    version: '0.1.0',
    engineeringAsset: 'Assy-Gimbal-Cart-12',
    bom: [],
    materials: ['mat-002', 'mat-003'],
    knowledgeLinks: [],
    memoryLinks: [],
    documents: [],
    activities: [
      { id: 'act-1', timestamp: '2026-06-15T11:00:00Z', user: 'Alex Mercer', action: 'Design Initiated', details: 'Drafted parameters based on customer weight and volume specs.' }
    ],
    workflow: [
      { stage: 'Parameters Setup', status: 'Completed', assignee: 'Alex Mercer' },
      { stage: 'Foam Prototyping', status: 'In Progress', assignee: 'Alex Mercer' },
      { stage: 'Manager Approval', status: 'Pending', assignee: 'Elena Rostova' }
    ],
    createdAt: '2026-06-15T10:30:00Z',
    updatedAt: '2026-06-15T11:00:00Z',
    auditMetadata: {
      createdBy: 'Alex Mercer'
    }
  }
];

export const initialRules: ValidationRule[] = [
  {
    id: 'rule-001',
    ruleNumber: 'JNAS-RULE-001',
    ruleName: 'ESD Protection Compliance',
    description: 'Verifies that all avionics, sensor, and battery transport containers include ESD-safe (Electrostatic Discharge) dissipative lining materials to prevent electrostatic damage.',
    category: 'Safety Rules',
    priority: 'Critical',
    severity: 'Error',
    owner: 'Marcus Aurelius',
    department: 'Quality Engineering',
    revision: 'R1',
    status: 'Active',
    version: '1.0.0',
    customer: 'NASA Glenn Research Center',
    projectType: 'Avionics Transport',
    packagingCategory: 'Steel Rack',
    relatedStandard: 'ESD-S20.20',
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-01-10T08:00:00Z',
    auditMetadata: {
      createdBy: 'System System Seeder',
      approvedBy: 'Elena Rostova'
    }
  },
  {
    id: 'rule-002',
    ruleNumber: 'JNAS-RULE-002',
    ruleName: 'Maximum Stacking Load Factor',
    description: 'Ensures structural designs for flight payload containers do not exceed standard 3-tier stacking limits without active corner-post steel reinforcements.',
    category: 'Stacking Rules',
    priority: 'High',
    severity: 'Error',
    owner: 'Elena Rostova',
    department: 'Mechanical Design',
    revision: 'R2',
    status: 'Active',
    version: '1.1.0',
    relatedStandard: 'ASTM-D642',
    createdAt: '2026-02-15T09:30:00Z',
    updatedAt: '2026-02-20T10:00:00Z',
    auditMetadata: {
      createdBy: 'Elena Rostova',
      approvedBy: 'Alex Mercer'
    }
  },
  {
    id: 'rule-003',
    ruleNumber: 'JNAS-RULE-003',
    ruleName: 'Forklift Tine Channel Clearance',
    description: 'Steel racks and flight-line crates with a total weight exceeding 150 lbs must integrate dedicated forklift pockets with a minimum width of 8 inches and 3.5 inches vertical spacing.',
    category: 'Forklift Rules',
    priority: 'Critical',
    severity: 'Error',
    owner: 'Devin Finch',
    department: 'Industrial Engineering',
    revision: 'R1',
    status: 'Active',
    version: '1.0.0',
    relatedStandard: 'OSHA-1910.178',
    createdAt: '2026-03-01T14:20:00Z',
    updatedAt: '2026-03-01T14:20:00Z',
    auditMetadata: {
      createdBy: 'Devin Finch',
      approvedBy: 'Elena Rostova'
    }
  },
  {
    id: 'rule-004',
    ruleNumber: 'JNAS-RULE-004',
    ruleName: 'Manual Lift Hand-Carrying Weight Limits',
    description: 'Hand-held dunnage and transport cases designed for single-operator manual loading must not exceed a gross weight of 35 lbs (15.8 kg) to comply with ergonomic handling regulations.',
    category: 'Ergonomic Rules',
    priority: 'Medium',
    severity: 'Warning',
    owner: 'Sarah Connor',
    department: 'Health & Safety',
    revision: 'R1',
    status: 'Active',
    version: '1.0.0',
    relatedStandard: 'NIOSH-91-117',
    createdAt: '2026-03-10T11:15:00Z',
    updatedAt: '2026-03-10T11:15:00Z',
    auditMetadata: {
      createdBy: 'Sarah Connor'
    }
  },
  {
    id: 'rule-005',
    ruleNumber: 'JNAS-RULE-005',
    ruleName: 'Dunnage Foam Compression Set Margin',
    description: 'Validates that cushioning foam thickness matches the payload weight to prevent bottoming-out. High-density components must specify at least 2.5 inches of high-recovery polyurethane or EVA padding.',
    category: 'Material Rules',
    priority: 'High',
    severity: 'Error',
    owner: 'Alex Mercer',
    department: 'Packaging Design',
    revision: 'R3',
    status: 'Active',
    version: '2.0.0',
    relatedStandard: 'MIL-STD-2073-1D',
    createdAt: '2026-04-05T10:00:00Z',
    updatedAt: '2026-05-12T16:45:00Z',
    auditMetadata: {
      createdBy: 'Alex Mercer',
      approvedBy: 'Elena Rostova'
    }
  },
  {
    id: 'rule-006',
    ruleNumber: 'JNAS-RULE-006',
    ruleName: 'AIAG Automotive Footprint Standard',
    description: 'Verifies that parts-bin components fit within standard 48-inch by 45-inch or 32-inch by 30-inch modular sub-grids to optimize intermodal transport shipping volume.',
    category: 'Automotive Rules',
    priority: 'Low',
    severity: 'Recommendation',
    owner: 'Hiroshi Tanaka',
    department: 'Supply Chain Operations',
    revision: 'R1',
    status: 'Active',
    version: '1.0.0',
    customer: 'SpaceX Falcon Logistics',
    relatedStandard: 'AIAG-RC-9',
    createdAt: '2026-05-01T09:00:00Z',
    updatedAt: '2026-05-01T09:00:00Z',
    auditMetadata: {
      createdBy: 'System Seeder'
    }
  }
];



import { Drawing, EngineeringProjectDetails, EngineeringDocument } from './types';

export const initialDrawings: Drawing[] = [
  {
    id: 'drw-mech-1001',
    drawingNumber: 'JNAS-MECH-1001',
    revision: 'A.04',
    title: 'Solid Fuel Jet Propulsion Nozzle Casing',
    description: 'Structural nozzle casing assembly drawing with heat shield integration bounds, mechanical fasteners, and core exhaust clearance tolerance indices.',
    category: 'Mechanical',
    owner: 'Sarah Jenkins',
    projectId: 'prj-jet-propulsion',
    customerId: 'cust-jnas',
    status: 'Released',
    approvalStatus: 'Approved',
    relatedDocuments: ['AS9100-Ti Certification', 'Thermal Gradient calculations (v1.2)'],
    relatedParts: ['FAST-M8-TI', 'NOZ-CASE-01', 'ORING-VT-24'],
    relatedBOM: [
      { partNumber: 'FAST-M8-TI', name: 'M8 Titanium Hex Flange Bolt', quantity: 12, unit: 'pcs', material: 'Ti-6Al-4V Alloy', source: 'Purchased' },
      { partNumber: 'NOZ-CASE-01', name: 'Main Thrust Exhaust Casing Shell', quantity: 1, unit: 'pcs', material: 'Inconel 718', source: 'In-House' },
      { partNumber: 'ORING-VT-24', name: 'High-Temperature Viton O-Ring', quantity: 2, unit: 'pcs', material: 'Fluorocarbon FKM', source: 'Purchased' },
      { partNumber: 'SHLD-COAT-09', name: 'Zirconia Thermal Coating Base', quantity: 1, unit: 'liter', material: 'Yttria-Stabilized Zirconia', source: 'Subcontract' }
    ],
    relatedStandards: ['AS9100 Rev D', 'ASTM-B348', 'MIL-DTL-5624'],
    futureCADFile: {
      format: 'STEP',
      fileName: 'JNAS_MECH_1001_A04.stp',
      fileSizeMb: 14.82
    },
    createdAt: '2026-01-15T08:30:00Z',
    updatedAt: '2026-06-25T14:20:00Z'
  },
  {
    id: 'drw-therm-2002',
    drawingNumber: 'JNAS-THERM-2002',
    revision: 'B.01',
    title: 'Cryogenic Carbon Casing Insulation Barrier',
    description: 'Double-wall vacuum jacketed aerogel insulation layout for supercooled hydrogen tanks. Features thermal sensor port integrations.',
    category: 'Packaging',
    owner: 'David Vance',
    projectId: 'prj-carbon-casing',
    customerId: 'cust-ols',
    status: 'Released',
    approvalStatus: 'Approved',
    relatedDocuments: ['Insulation Density Analysis', 'Vacuum Port Tightness Test'],
    relatedParts: ['CASE-OUT-02', 'AG-BARRIER-09', 'SEN-TC-K'],
    relatedBOM: [
      { partNumber: 'CASE-OUT-02', name: 'Outer Carbon Fiber Shell', quantity: 1, unit: 'pcs', material: 'Carbon Epoxy Composite', source: 'In-House' },
      { partNumber: 'AG-BARRIER-09', name: 'Silica Aerogel Thermal Sheet', quantity: 6, unit: 'sheets', material: 'Amorphous Silica', source: 'Purchased' },
      { partNumber: 'SEN-TC-K', name: 'Type-K Sheathed Thermocouple', quantity: 4, unit: 'pcs', material: 'Chromel/Alumel', source: 'Purchased' }
    ],
    relatedStandards: ['NASA-STD-5001', 'ISO-14935'],
    futureCADFile: {
      format: 'IGES',
      fileName: 'JNAS_THERM_2002_B01.igs',
      fileSizeMb: 8.44
    },
    createdAt: '2026-02-10T10:15:00Z',
    updatedAt: '2026-06-20T11:45:00Z'
  },
  {
    id: 'drw-elec-3001',
    drawingNumber: 'JNAS-ELEC-3001',
    revision: 'A.01',
    title: 'Guidance Computer Power Management Board',
    description: 'Multi-layer printed circuit board schematic detailing dual-redundant buck regulator circuits, high-frequency filtering, and avionics bus isolation.',
    category: 'Electrical',
    owner: 'Sarah Jenkins',
    projectId: 'prj-jet-propulsion',
    customerId: 'cust-jda',
    status: 'Draft',
    approvalStatus: 'In Review',
    relatedDocuments: ['PCB Signal Integrity Simulation Report', 'Radiation Tolerant Power Spec'],
    relatedParts: ['PCB-GCPMB-01', 'IC-REG-LM5060', 'CAP-TA-10UF'],
    relatedBOM: [
      { partNumber: 'PCB-GCPMB-01', name: '8-Layer Rigid FR4 PCB Board', quantity: 1, unit: 'pcs', material: 'Isola FR408HR', source: 'Subcontract' },
      { partNumber: 'IC-REG-LM5060', name: 'Radiation Hardened High-Side Protection Controller', quantity: 2, unit: 'pcs', material: 'Semiconductor Silicon', source: 'Purchased' },
      { partNumber: 'CAP-TA-10UF', name: 'Tantalum Solid Electrolytic Capacitor 10uF', quantity: 18, unit: 'pcs', material: 'Tantalum Pentoxide', source: 'Purchased' }
    ],
    relatedStandards: ['IPC-A-610G Class 3', 'MIL-PRF-31032'],
    futureCADFile: {
      format: 'DWG',
      fileName: 'JNAS_ELEC_3001_A01.dwg',
      fileSizeMb: 24.15
    },
    createdAt: '2026-06-01T09:00:00Z',
    updatedAt: '2026-06-29T16:30:00Z'
  },
  {
    id: 'drw-mech-1002',
    drawingNumber: 'JNAS-MECH-1002',
    revision: 'C.02',
    title: 'Hydraulic Actuator Bracket Assembly',
    description: 'High-stress structural mounting bracket for heavy load vector gimbals. Subjected to advanced dynamic load lifecycle validation.',
    category: 'Mechanical',
    owner: 'Alex Rivera',
    projectId: 'prj-jet-propulsion',
    customerId: 'cust-jda',
    status: 'Released',
    approvalStatus: 'Approved',
    relatedDocuments: ['Gimbal Structural Finite Element Analysis', 'Hydraulic Load Bounds v4'],
    relatedParts: ['BRKT-GMB-C1', 'FAST-M12-TI', 'BUSH-BRZ-02'],
    relatedBOM: [
      { partNumber: 'BRKT-GMB-C1', name: 'Gimbal Actuator Mounting Bracket', quantity: 1, unit: 'pcs', material: 'Ti-6Al-4V Grade 5', source: 'In-House' },
      { partNumber: 'FAST-M12-TI', name: 'M12 Titanium Torx Drive Screw', quantity: 4, unit: 'pcs', material: 'Ti-6Al-4V Alloy', source: 'Purchased' },
      { partNumber: 'BUSH-BRZ-02', name: 'Self-Lubricating Bronze Bushing', quantity: 2, unit: 'pcs', material: 'Sintered Bronze-Steel', source: 'Purchased' }
    ],
    relatedStandards: ['ASTM-E1417', 'MIL-HDBK-5J'],
    futureCADFile: {
      format: 'STEP',
      fileName: 'JNAS_MECH_1002_C02.stp',
      fileSizeMb: 6.75
    },
    createdAt: '2026-03-05T08:00:00Z',
    updatedAt: '2026-05-18T10:10:00Z'
  },
  {
    id: 'drw-auto-4001',
    drawingNumber: 'JNAS-AUTO-4001',
    revision: 'A.02',
    title: 'Exhaust Vent Flap Control Logic Diagram',
    description: 'Pneumatic PID control schematic showing feedback loops, pressure transducer wiring, and safety interlock overrides for automated bypass valves.',
    category: 'Automation',
    owner: 'Sarah Jenkins',
    projectId: 'prj-carbon-casing',
    customerId: 'cust-ols',
    status: 'Released',
    approvalStatus: 'Approved',
    relatedDocuments: ['Bypass Vent Loop Tuning Guide', 'Transducer Calibration Log'],
    relatedParts: ['PLC-CTL-S7', 'VLV-PNM-C1', 'XDUC-P-05'],
    relatedBOM: [
      { partNumber: 'PLC-CTL-S7', name: 'Safety PLC Main Processing Unit', quantity: 1, unit: 'pcs', material: 'Industrial Thermoplastic', source: 'Purchased' },
      { partNumber: 'VLV-PNM-C1', name: 'Pneumatic Proportioning Control Valve', quantity: 1, unit: 'pcs', material: '316 Stainless Steel', source: 'Purchased' },
      { partNumber: 'XDUC-P-05', name: '0-100 Bar Pressure Transducer 4-20mA', quantity: 2, unit: 'pcs', material: 'Hastelloy Sensor', source: 'Purchased' }
    ],
    relatedStandards: ['IEC-61508 SIL3', 'ISA-5.1'],
    futureCADFile: {
      format: 'DXF',
      fileName: 'JNAS_AUTO_4001_A02.dxf',
      fileSizeMb: 3.12
    },
    createdAt: '2026-04-18T14:00:00Z',
    updatedAt: '2026-06-12T09:15:00Z'
  }
];

export const initialProjectDetails: EngineeringProjectDetails[] = [
  {
    projectId: 'prj-jet-propulsion',
    subProjects: [
      { id: 'sub-jet-01', name: 'Thruster Combustion Chamber', status: 'Active', leadEngineer: 'Sarah Jenkins', deadline: '2026-08-31', estimatedCost: 350000 },
      { id: 'sub-jet-02', name: 'Avionics Bus Routing Integration', status: 'Active', leadEngineer: 'Marcus Brody', deadline: '2026-09-30', estimatedCost: 180000 },
      { id: 'sub-jet-03', name: 'Gimbal Vector Structural Mounting', status: 'Planning', leadEngineer: 'Alex Rivera', deadline: '2026-11-15', estimatedCost: 120000 }
    ],
    revisions: [
      { version: 'P1.00', description: 'Initial Conceptual Layout Design Release', date: '2026-01-20', author: 'Sarah Jenkins' },
      { version: 'P1.01', description: 'Updated structural flange brackets for higher shear resistance', date: '2026-03-12', author: 'Alex Rivera' },
      { version: 'P1.02', description: 'Added sensor ports and revised PCB power bus filters', date: '2026-06-15', author: 'Sarah Jenkins' }
    ],
    milestones: [
      { id: 'mls-jet-1', title: 'Flange Joint Stress Analysis Approved', status: 'Achieved', targetDate: '2026-03-30' },
      { id: 'mls-jet-2', title: 'Preliminary Power Board Schematic Release', status: 'Achieved', targetDate: '2026-06-01' },
      { id: 'mls-jet-3', title: 'Core Combustion Prototype Assembly Complete', status: 'In Progress', targetDate: '2026-08-15' },
      { id: 'mls-jet-4', title: 'Full Flight Qualification Firing Test', status: 'Scheduled', targetDate: '2026-12-10' }
    ],
    team: [
      { userId: 'usr-sarah', name: 'Sarah Jenkins', role: 'Lead Engineer', department: 'R&D Propulsion' },
      { userId: 'usr-alex', name: 'Alex Rivera', role: 'Structural Specialist', department: 'Structural Analysis' },
      { userId: 'usr-marcus', name: 'Marcus Brody', role: 'CAD Designer', department: 'Avionics Core' }
    ],
    budget: {
      allocated: 750000,
      spent: 425000,
      currency: 'USD'
    }
  },
  {
    projectId: 'prj-carbon-casing',
    subProjects: [
      { id: 'sub-carb-01', name: 'Composite Carbon Layup Design', status: 'Completed', leadEngineer: 'David Vance', deadline: '2026-05-15', estimatedCost: 140000 },
      { id: 'sub-carb-02', name: 'Aerogel Thermal Seal Optimization', status: 'Active', leadEngineer: 'Elena Rostova', deadline: '2026-08-30', estimatedCost: 95000 }
    ],
    revisions: [
      { version: 'R1.00', description: 'Initial Composite Core Release', date: '2026-02-15', author: 'David Vance' },
      { version: 'R1.01', description: 'Vacuum jacket sealing rings modified from Copper to Viton O-Rings', date: '2026-04-22', author: 'David Vance' }
    ],
    milestones: [
      { id: 'mls-carb-1', title: 'Carbon Layup Tensile Pull Test', status: 'Achieved', targetDate: '2026-05-01' },
      { id: 'mls-carb-2', title: 'Vacuum Chamber Tightness Verification', status: 'In Progress', targetDate: '2026-07-20' },
      { id: 'mls-carb-3', title: 'Extreme Temperature Deflection Approval', status: 'Scheduled', targetDate: '2026-10-05' }
    ],
    team: [
      { userId: 'usr-dave', name: 'David Vance', role: 'Lead Engineer', department: 'Thermal Physics' },
      { userId: 'usr-elena', name: 'Elena Rostova', role: 'QA Inspector', department: 'Quality Assurance' }
    ],
    budget: {
      allocated: 300000,
      spent: 195000,
      currency: 'USD'
    }
  }
];

export const initialEngineeringDocuments: EngineeringDocument[] = [
  {
    id: 'edoc-spec-101',
    title: 'High-Temperature Nickel Inconel Alloy Casting Specification',
    type: 'Specification',
    description: 'Establishes microstructure, heat treatment, and chemical purity limits for high-temperature turbine casings.',
    revision: 'Rev.C',
    owner: 'Sarah Jenkins',
    projectId: 'prj-jet-propulsion',
    fileSizeKb: 1240,
    createdAt: '2026-01-10T11:00:00Z',
    updatedAt: '2026-05-12T15:30:00Z'
  },
  {
    id: 'edoc-calc-102',
    title: 'Combustion Exhaust Thermal Expansion Calculations',
    type: 'Calculation',
    description: 'Predictive finite element equations simulating axial thermal growth at continuous 1800K ignition cycles.',
    revision: 'v1.4',
    owner: 'Alex Rivera',
    projectId: 'prj-jet-propulsion',
    fileSizeKb: 4520,
    createdAt: '2026-02-04T09:15:00Z',
    updatedAt: '2026-06-18T10:00:00Z'
  },
  {
    id: 'edoc-std-201',
    title: 'NASA-STD-5001 Structural Design Rules for Space Systems',
    type: 'Standard',
    description: 'Federal standard outlining margin-of-safety metrics and stress vectors for space vehicle payloads.',
    revision: 'Rev.B',
    owner: 'David Vance',
    projectId: 'prj-carbon-casing',
    fileSizeKb: 18320,
    createdAt: '2019-11-20T00:00:00Z',
    updatedAt: '2019-11-20T00:00:00Z'
  },
  {
    id: 'edoc-insp-301',
    title: 'Primary Jet Propellant Nozzle Calibration Quality Inspection Report',
    type: 'InspectionReport',
    description: 'Dimensional verification report detailing non-destructive ultrasonic scanning of core titanium welds.',
    revision: 'Run 4',
    owner: 'Elena Rostova',
    projectId: 'prj-jet-propulsion',
    fileSizeKb: 890,
    createdAt: '2026-06-25T11:30:00Z',
    updatedAt: '2026-06-25T14:00:00Z'
  },
  {
    id: 'edoc-mfg-103',
    title: 'Exhaust Flange Welding Sequence & Thermal Pre-Heat Notes',
    type: 'ManufacturingNote',
    description: 'Detailed instructions outlining argon gas purge ratios, shield clamp torque sequences, and cool-down times.',
    revision: 'A.01',
    owner: 'Sarah Jenkins',
    projectId: 'prj-jet-propulsion',
    fileSizeKb: 340,
    createdAt: '2026-03-22T13:45:00Z',
    updatedAt: '2026-03-22T13:45:00Z'
  }
];

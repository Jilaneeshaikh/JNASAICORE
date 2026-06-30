import { registry } from './registry';
import { KnowledgeSource, KnowledgeObject, KnowledgeRelationship } from './types';

// Seeding standard sources
export const seedSources: KnowledgeSource[] = [
  {
    id: 'src-crm-customers',
    name: 'CRM Account Sync Pipeline',
    description: 'Active database pipeline linking active CRM customer accounts and contact histories.',
    ownerModule: 'CRM',
    category: 'Customers',
    permissions: {
      roles: ['admin', 'sales_representative', 'engineer'],
      visibility: 'Organization',
    },
    version: '1.4.0',
    status: 'Active',
    tags: ['crm', 'sales', 'accounts', 'sync'],
  },
  {
    id: 'src-eng-cad',
    name: 'CAD Schematic Workspace Registry',
    description: 'Real-time repository sync for CAD models, physical assemblies, and mechanical drawings.',
    ownerModule: 'Engineering',
    category: 'Engineering',
    permissions: {
      roles: ['admin', 'engineer', 'architect'],
      visibility: 'Organization',
    },
    version: '2.1.2',
    status: 'Active',
    tags: ['cad', 'solidworks', 'drawings', 'engineering'],
  },
  {
    id: 'src-pkg-specs',
    name: 'Packaging Standards & Blueprints',
    description: 'International packaging specifications, cardboard dimensions, and eco-friendly standards.',
    ownerModule: 'Packaging',
    category: 'Packaging',
    permissions: {
      roles: ['admin', 'engineer', 'packaging_designer'],
      visibility: 'Public',
    },
    version: '3.0.1',
    status: 'Active',
    tags: ['packaging', 'specs', 'blueprints', 'sustainability'],
  },
  {
    id: 'src-lms-learning',
    name: 'Compliance Training Hub',
    description: 'Corporate certification resources, onboarding tracks, and OSHA packaging safety procedures.',
    ownerModule: 'LMS',
    category: 'Learning',
    permissions: {
      roles: ['admin', 'all_personnel'],
      visibility: 'Organization',
    },
    version: '1.0.0',
    status: 'Active',
    tags: ['training', 'lms', 'compliance', 'safety'],
  },
  {
    id: 'src-proj-history',
    name: 'Project Milestone Tracker',
    description: 'Master logs containing historical scope documents, charter specs, and delivery logs.',
    ownerModule: 'Projects',
    category: 'Projects',
    permissions: {
      roles: ['admin', 'project_manager', 'engineer', 'sales_representative'],
      visibility: 'Shared',
    },
    version: '1.2.0',
    status: 'Active',
    tags: ['projects', 'milestones', 'reports', 'charters'],
  },
];

// Seeding objects
export const seedObjects: KnowledgeObject[] = [
  {
    id: 'obj-eng-001',
    title: 'Dual-Chamber Mechanical Valve CAD Assembly',
    description: 'Detailed CAD assembly metadata and structural stress calculations for the modular dual-chamber high-pressure pneumatic regulator.',
    type: 'cad_metadata',
    owner: 'Dr. Sarah Lin (Lead Engineer)',
    workspace: 'Pneumatics Lab A',
    project: 'Project Ares-IV',
    category: 'Engineering',
    tags: ['cad', 'valve', 'pressure', 'pneumatic', 'ares-iv'],
    status: 'Published',
    version: '2.0.1',
    metadata: {
      massGrams: 3450,
      material: 'Titanium Grade 5',
      maxPressurePsi: 4500,
      tolerancesMm: 0.02,
      fileHash: 'sha256:7f92a3420cd163',
    },
    permissions: {
      visibility: 'Organization',
      allowedRoles: ['engineer', 'architect'],
    },
    source: 'CAD Schematic Workspace Registry',
    createdAt: '2026-02-15T09:30:00Z',
    updatedAt: '2026-06-18T14:22:00Z',
  },
  {
    id: 'obj-pkg-001',
    title: 'Corrugated Eco-Cardboard Structural Standards',
    description: 'Tensile thresholds, weight load ratings, and structural fold-lines for zero-plastic biodegradable heavy cargo boxes.',
    type: 'packaging_notes',
    owner: 'Marcus Brody (Senior Packaging Designer)',
    workspace: 'Structural Studio',
    project: 'Eco-Transit-2026',
    category: 'Packaging',
    tags: ['cardboard', 'transit', 'load-bearing', 'eco-friendly'],
    status: 'Published',
    version: '3.1.0',
    metadata: {
      thicknessMm: 4.5,
      maxLoadWeightKg: 45,
      recycleRatingPercentage: 100,
      burstTestRatingPsi: 275,
    },
    permissions: {
      visibility: 'Public',
      allowedRoles: ['all_personnel', 'packaging_designer'],
    },
    source: 'Packaging Standards & Blueprints',
    createdAt: '2026-01-10T11:00:00Z',
    updatedAt: '2026-05-29T10:15:00Z',
  },
  {
    id: 'obj-crm-001',
    title: 'Acme Heavy Industries Enterprise Contract Spec',
    description: 'Contract terms, delivery schedules, and special design rules negotiated for bespoke industrial cargo logistics.',
    type: 'word',
    owner: 'Clarissa Evans (Global Key Accounts)',
    workspace: 'Enterprise Accounts',
    project: 'Acme-Logistics-2026',
    category: 'Customers',
    tags: ['acme', 'contract', 'procurement', 'sla'],
    status: 'Published',
    version: '1.2.0',
    metadata: {
      contractValueUsd: 1250000,
      renewalDate: '2027-06-01',
      slaResponseTimeHours: 4,
    },
    permissions: {
      visibility: 'Shared',
      allowedRoles: ['sales_representative', 'project_manager'],
    },
    source: 'CRM Account Sync Pipeline',
    createdAt: '2026-03-01T15:00:00Z',
    updatedAt: '2026-06-10T16:45:00Z',
  },
  {
    id: 'obj-lms-001',
    title: 'Hazardous Material Handling & Compliance Training',
    description: 'Mandatory OSHA guidelines and internal SOP manuals for warehousing chemical payloads and high-pressure storage structures.',
    type: 'pdf',
    owner: 'Safety & Onboarding Division',
    workspace: 'Compliance Academy',
    category: 'Learning',
    tags: ['osha', 'compliance', 'safety', 'hazmat'],
    status: 'Published',
    version: '1.0.2',
    metadata: {
      courseId: 'COMP-HAZ-402',
      passingScorePercentage: 90,
      validityYears: 2,
    },
    permissions: {
      visibility: 'Organization',
      allowedRoles: ['all_personnel'],
    },
    source: 'Compliance Training Hub',
    createdAt: '2025-09-12T08:00:00Z',
    updatedAt: '2026-04-05T13:10:00Z',
  },
  {
    id: 'obj-proj-001',
    title: 'Project Ares-IV Kickoff Charter & Deliverables',
    description: 'Main program document covering timeline, key stakeholders, sub-system divisions, and financial brackets for Project Ares-IV.',
    type: 'project_documents',
    owner: 'Gregory Vance (VP of Programs)',
    workspace: 'Ares PMO',
    project: 'Project Ares-IV',
    category: 'Projects',
    tags: ['ares-iv', 'kickoff', 'charter', 'pmo', 'timeline'],
    status: 'Published',
    version: '1.0.0',
    metadata: {
      budgetCapUsd: 4500000,
      phaseCount: 4,
      completionDeadline: '2027-12-31',
    },
    permissions: {
      visibility: 'Shared',
      allowedRoles: ['project_manager', 'engineer', 'sales_representative'],
    },
    source: 'Project Milestone Tracker',
    createdAt: '2026-01-22T09:00:00Z',
    updatedAt: '2026-01-25T11:40:00Z',
  },
  {
    id: 'obj-eng-002',
    title: 'Ares-IV Pneumatic Interconnect Protocol Notes',
    description: 'Engineering lab logs specifying pneumatic hookup criteria, coupling diameters, and stress ratings for interconnected high-pressure valves.',
    type: 'engineering_notes',
    owner: 'Dr. Sarah Lin (Lead Engineer)',
    workspace: 'Pneumatics Lab A',
    project: 'Project Ares-IV',
    category: 'Engineering',
    tags: ['coupling', 'pneumatics', 'interconnect', 'standards'],
    status: 'Draft',
    version: '0.4.0',
    metadata: {
      couplingThreadStandard: 'NPT 3/4',
      safetyFactorRating: 4.0,
    },
    permissions: {
      visibility: 'Private',
      allowedRoles: ['engineer'],
    },
    source: 'CAD Schematic Workspace Registry',
    createdAt: '2026-06-25T14:00:00Z',
    updatedAt: '2026-06-29T17:30:00Z',
  },
];

// Seeding standard relationships
export const seedRelationships: KnowledgeRelationship[] = [
  {
    sourceId: 'obj-eng-001', // Dual-Chamber CAD Valve
    targetId: 'obj-proj-001', // Project Ares-IV Kickoff
    relationshipType: 'Document_To_Project',
    description: 'Core physical module developed for high-pressure delivery systems under Project Ares-IV.',
  },
  {
    sourceId: 'obj-eng-002', // Pneumatic Protocol Notes
    targetId: 'obj-eng-001', // Dual-Chamber CAD Valve
    relationshipType: 'References',
    description: 'Interconnection specifications directly referencing the physical stress calculations of the dual-chamber valve assembly.',
  },
  {
    sourceId: 'obj-pkg-001', // Corrugated Standards
    targetId: 'obj-eng-001', // Dual-Chamber CAD Valve
    relationshipType: 'Drawing_To_Packaging',
    description: 'Prescribes load-bearing packing parameters required to ship titanium assemblies without dynamic friction damage.',
  },
  {
    sourceId: 'obj-crm-001', // Acme heavy contract
    targetId: 'obj-proj-001', // Project Ares-IV
    relationshipType: 'Project_To_Customer',
    description: 'Acme Heavy Industries acts as the prime stakeholder and funding customer for Project Ares-IV deliverables.',
  },
  {
    sourceId: 'obj-pkg-001', // Corrugated Packaging Standards
    targetId: 'obj-lms-001', // OSHA Compliance safety
    relationshipType: 'Lesson_To_Standard',
    description: 'Packaging structural folds must adhere strictly to OSHA double-wall box stacking limits.',
  },
];

// Bootstrapping function
export function bootstrapKnowledgeBase(): void {
  const currentSources = registry.getSources();
  if (currentSources.length === 0) {
    seedSources.forEach((s) => registry.registerSource(s));
    seedObjects.forEach((o) => registry.registerObject(o));
    seedRelationships.forEach((r) => registry.registerRelationship(r));
    console.log('[KnowledgeRegistry] Bootstrapped Knowledge base successfully.');
  }
}

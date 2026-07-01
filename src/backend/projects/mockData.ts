import { ProjectRegistry } from './registry';
import { Project } from './types';

export function seedProjects(): void {
  const registry = ProjectRegistry.getInstance();
  const existing = registry.getProjects();
  if (existing.length > 0) return; // Already seeded

  const timestamp = new Date().toISOString();

  // Project 1: AS9100 Rev D Compliance Audit
  const prjCompliance: Project = {
    id: 'prj-as9100-audit',
    name: 'AS9100 Revision D Certification',
    description: 'Critical aerospace governance alignment program, audit trail mapping, and quality assurance checklists.',
    type: 'business',
    status: 'Active',
    priority: 'Critical',
    health: 'healthy',
    owner: 'Elena Rostova',
    members: [
      { userId: 'usr-operator', name: 'System Operator', role: 'Administrator', department: 'Operations', email: 'operator@jnas.space', joinDate: timestamp },
      { userId: 'usr-elena', name: 'Elena Rostova', role: 'Owner', department: 'QA Compliance', email: 'e.rostova@jnas.space', joinDate: timestamp },
      { userId: 'usr-sarah', name: 'Sarah Jenkins', role: 'Manager', department: 'R&D Operations', email: 's.jenkins@jnas.space', joinDate: timestamp }
    ],
    workspace: 'business',
    department: 'Quality Operations',
    client: 'Joint Defense Agency',
    category: 'Regulatory Governance',
    tags: ['audit', 'AS9100', 'governance'],
    version: '2.4.0',
    archiveStatus: false,
    tasks: [
      { id: 'task-as9100-1', title: 'Compile CAD Coordinate Calibration Records', description: 'Review laser scanner offsets and log precision metrics to KMS.', status: 'In Progress', priority: 'High', assignedTo: 'Sarah Jenkins', dueDate: '2026-07-08' },
      { id: 'task-as9100-2', title: 'Verify Document Isolation Boundaries', description: 'Confirm docIntel cannot leak engineering schematics to business RAG streams.', status: 'Done', priority: 'Critical', assignedTo: 'System Operator', dueDate: '2026-06-25' },
      { id: 'task-as9100-3', title: 'Schedule External Registrar Briefing', description: 'Finalize site walkthrough timetable with SGS Lead Auditor.', status: 'Todo', priority: 'Medium', assignedTo: 'Elena Rostova', dueDate: '2026-07-15' }
    ],
    createdDate: '2026-05-12T08:30:00Z',
    updatedDate: timestamp
  };

  // Project 2: Jet-Propulsion Wing Assembly
  const prjEngineering: Project = {
    id: 'prj-jet-propulsion',
    name: 'Jet-Propulsion Wing Assembly Design',
    description: 'CAD structure modeling, finite-element stress validations, and materials integration for next-gen thrust vectors.',
    type: 'engineering',
    status: 'Active',
    priority: 'High',
    health: 'at_risk',
    owner: 'Sarah Jenkins',
    members: [
      { userId: 'usr-operator', name: 'System Operator', role: 'Manager', department: 'Operations', email: 'operator@jnas.space', joinDate: timestamp },
      { userId: 'usr-sarah', name: 'Sarah Jenkins', role: 'Owner', department: 'R&D Operations', email: 's.jenkins@jnas.space', joinDate: timestamp },
      { userId: 'usr-alex', name: 'Alex Rivera', role: 'Member', department: 'Structural Physics', email: 'a.rivera@jnas.space', joinDate: timestamp }
    ],
    workspace: 'engineering',
    department: 'Aero Structures',
    client: 'JNAS Aerospace',
    category: 'Thruster Dynamics',
    tags: ['jet', 'CAD', 'aerospace', 'structural'],
    version: '1.2.1',
    archiveStatus: false,
    tasks: [
      { id: 'task-jet-1', title: 'Resolve Wing Stress Coordinate Anomaly', description: 'Fixed stress variance of 0.05mm around hinge joint vectors.', status: 'Done', priority: 'High', assignedTo: 'Alex Rivera', dueDate: '2026-06-20' },
      { id: 'task-jet-2', title: 'Thermal Shield Stress Analysis', description: 'Run finite element simulation at high temperatures.', status: 'In Progress', priority: 'Critical', assignedTo: 'Alex Rivera', dueDate: '2026-07-12' },
      { id: 'task-jet-3', title: 'Update Material Data Ledger in KMS', description: 'Ensure tensile strength of alloy-718 is aligned with ASME codes.', status: 'Todo', priority: 'High', assignedTo: 'Sarah Jenkins', dueDate: '2026-07-22' }
    ],
    createdDate: '2026-06-01T10:15:00Z',
    updatedDate: timestamp
  };

  // Project 3: Carbon-Fiber Structural Insulation Casing (Packaging)
  const prjPackaging: Project = {
    id: 'prj-carbon-casing',
    name: 'Carbon-Fiber Vacuum Insulation Module',
    description: 'Designing high-strength external cargo containment layers optimized for thermal protection during atmospheric friction.',
    type: 'packaging',
    status: 'Active',
    priority: 'Medium',
    health: 'healthy',
    owner: 'David Vance',
    members: [
      { userId: 'usr-operator', name: 'System Operator', role: 'Viewer', department: 'Operations', email: 'operator@jnas.space', joinDate: timestamp },
      { userId: 'usr-dave', name: 'David Vance', role: 'Owner', department: 'Thermal Physics', email: 'd.vance@jnas.space', joinDate: timestamp }
    ],
    workspace: 'engineering',
    department: 'Packaging Design',
    client: 'Orbital Logistics',
    category: 'Structural Protection',
    tags: ['vacuum-insulation', 'composites', 'packaging'],
    version: '1.0.5',
    archiveStatus: false,
    tasks: [
      { id: 'task-pkg-1', title: 'Validate Airflow Boundary Slices', description: 'Assess boundary flow friction along outer casing seams.', status: 'In Progress', priority: 'High', assignedTo: 'David Vance', dueDate: '2026-07-06' },
      { id: 'task-pkg-2', title: 'Publish Drop-Test Parameters', description: 'Save structural drop formulas in Project Document Archive.', status: 'Todo', priority: 'Medium', assignedTo: 'David Vance', dueDate: '2026-07-19' }
    ],
    createdDate: '2026-06-15T14:20:00Z',
    updatedDate: timestamp
  };

  // Project 4: Aviation Safety LMS Training
  const prjLms: Project = {
    id: 'prj-lms-aviation-safety',
    name: 'Critical Aviation Safety Training',
    description: 'Developing pilot certifications, simulation emergency workflows, and flight manual briefings.',
    type: 'learning',
    status: 'Paused',
    priority: 'High',
    health: 'healthy',
    owner: 'Marcus Brody',
    members: [
      { userId: 'usr-operator', name: 'System Operator', role: 'Manager', department: 'Operations', email: 'operator@jnas.space', joinDate: timestamp },
      { userId: 'usr-marcus', name: 'Marcus Brody', role: 'Owner', department: 'Training Dev', email: 'm.brody@jnas.space', joinDate: timestamp }
    ],
    workspace: 'learning',
    department: 'Corporate Training',
    client: 'Internal Safety Board',
    category: 'Flight Safety Certs',
    tags: ['LMS', 'safety', 'pilot-training'],
    version: '1.0.0',
    archiveStatus: false,
    tasks: [
      { id: 'task-lms-1', title: 'Draft Emergency Decompression Video Outline', description: 'Provide step-by-step procedure slide templates.', status: 'Done', priority: 'High', assignedTo: 'Marcus Brody', dueDate: '2026-06-18' },
      { id: 'task-lms-2', title: 'Construct Pilot Test Rubric', description: 'Compile question arrays with randomized answer offsets.', status: 'Todo', priority: 'High', assignedTo: 'Marcus Brody', dueDate: '2026-08-15' }
    ],
    createdDate: '2026-06-10T09:00:00Z',
    updatedDate: timestamp
  };

  registry.registerProject(prjCompliance);
  registry.registerProject(prjEngineering);
  registry.registerProject(prjPackaging);
  registry.registerProject(prjLms);
}

import { ContactRegistry } from './registry';
import { Contact } from './types';

export function seedContacts(): void {
  const registry = ContactRegistry.getInstance();
  const existing = registry.getContacts(true);
  if (existing.length > 0) return; // Already seeded

  const timestamp = new Date().toISOString();

  // Contact 1: Elena Rostova (JDA QA compliance Lead)
  const conElena: Contact = {
    id: 'con-elena',
    firstName: 'Elena',
    lastName: 'Rostova',
    displayName: 'Elena Rostova',
    company: 'Joint Defense Agency',
    department: 'Government QA Compliance',
    designation: 'Lead Quality Inspector',
    role: 'Quality',
    email: 'e.rostova@jnas.space',
    alternativeEmail: 'e.rostova@jda.gov.space',
    phone: '+1 (555) 012-4041',
    whatsappNumber: '+1 (555) 012-4041',
    address: {
      street: '100 Pentagon Plaza, Suite 400',
      city: 'Washington',
      state: 'DC',
      zip: '20301',
      country: 'United States',
    },
    language: 'English',
    timeZone: 'EST',
    status: 'Active',
    tags: ['military', 'audit', 'compliance', 'government'],
    notes: 'Strict compliance auditor. Directs all calibration audits and clearance reviews. Prefers communications via direct secure email.',
    customerLinks: ['cust-jda'],
    projectLinks: ['prj-as9100-audit'],
    knowledgeLinks: ['doc-as9100-standards', 'doc-calibration-guide'],
    memoryLinks: ['mem-jda-decision-history', 'mem-jda-audit-lessons'],
    workspace: 'business',
    createdDate: '2026-05-10T08:00:00Z',
    updatedDate: timestamp,
    archiveStatus: false,
    isDeleted: false,
    version: 1,
    auditMetadata: {
      createdBy: 'usr-operator',
      updatedBy: 'usr-operator',
    },
  };

  // Contact 2: Marcus Jackson (JDA Sourcing Lead)
  const conMarcusJ: Contact = {
    id: 'con-marcus',
    firstName: 'Marcus',
    lastName: 'Jackson',
    displayName: 'Marcus Jackson',
    company: 'Joint Defense Agency',
    department: 'Defense Sourcing Division',
    designation: 'Procurement Specialist',
    role: 'Procurement',
    email: 'm.jackson@jda.gov.space',
    phone: '+1 (555) 012-4045',
    address: {
      street: '100 Pentagon Plaza, Suite 400',
      city: 'Washington',
      state: 'DC',
      zip: '20301',
      country: 'United States',
    },
    language: 'English',
    timeZone: 'EST',
    status: 'Active',
    tags: ['sourcing', 'procurement', 'contracts'],
    notes: 'Manages budget clearance codes and SLA pricing sheets. Reports directly to procurement division chiefs.',
    customerLinks: ['cust-jda'],
    projectLinks: ['prj-as9100-audit'],
    knowledgeLinks: ['doc-as9100-standards'],
    memoryLinks: [],
    reportingManagerId: 'con-elena', // Elena is active director
    workspace: 'business',
    createdDate: '2026-05-12T09:15:00Z',
    updatedDate: timestamp,
    archiveStatus: false,
    isDeleted: false,
    version: 1,
    auditMetadata: {
      createdBy: 'usr-operator',
      updatedBy: 'usr-operator',
    },
  };

  // Contact 3: Sarah Jenkins (JNAS Aerospace Lead Architect)
  const conSarah: Contact = {
    id: 'con-sarah',
    firstName: 'Sarah',
    lastName: 'Jenkins',
    displayName: 'Sarah Jenkins',
    company: 'JNAS Aerospace',
    department: 'R&D Jet Assemblies',
    designation: 'Director of Aero Engineering',
    role: 'Engineering',
    email: 's.jenkins@jnas.space',
    phone: '+1 (555) 987-1123',
    whatsappNumber: '+1 (555) 987-1123',
    address: {
      street: '450 Propulsion Parkway',
      city: 'Huntsville',
      state: 'AL',
      zip: '35806',
      country: 'United States',
    },
    language: 'English',
    timeZone: 'EST',
    status: 'Active',
    tags: ['aerospace', 'structural-cad', 'FEA', 'jet-propulsion'],
    notes: 'Chief structural architect. Coordinates wing assembly CAD layouts and structural stresses.',
    customerLinks: ['cust-jnas'],
    projectLinks: ['prj-jet-propulsion'],
    knowledgeLinks: ['doc-thrust-vector-spec', 'doc-alloy-718-specs'],
    memoryLinks: ['mem-thrust-hinge-fix'],
    workspace: 'engineering',
    createdDate: '2026-05-28T10:00:00Z',
    updatedDate: timestamp,
    archiveStatus: false,
    isDeleted: false,
    version: 1,
    auditMetadata: {
      createdBy: 'usr-operator',
      updatedBy: 'usr-operator',
    },
  };

  // Contact 4: Alex Rivera (JNAS Structural Engineer)
  const conAlex: Contact = {
    id: 'con-alex',
    firstName: 'Alex',
    lastName: 'Rivera',
    displayName: 'Alex Rivera',
    company: 'JNAS Aerospace',
    department: 'Stress FEA Division',
    designation: 'Senior Structural Analyst',
    role: 'Engineering',
    email: 'a.rivera@jnas.space',
    phone: '+1 (555) 987-1129',
    address: {
      street: '450 Propulsion Parkway',
      city: 'Huntsville',
      state: 'AL',
      zip: '35806',
      country: 'United States',
    },
    language: 'English',
    timeZone: 'EST',
    status: 'Active',
    tags: ['FEA', 'thermal-stress', 'structural-analysis'],
    notes: 'Handles advanced finite element calculations. Reports issues immediately to Sarah Jenkins.',
    customerLinks: ['cust-jnas'],
    projectLinks: ['prj-jet-propulsion'],
    knowledgeLinks: ['doc-alloy-718-specs'],
    memoryLinks: ['mem-thrust-hinge-fix'],
    reportingManagerId: 'con-sarah', // Sarah is supervisor
    workspace: 'engineering',
    createdDate: '2026-05-30T11:45:00Z',
    updatedDate: timestamp,
    archiveStatus: false,
    isDeleted: false,
    version: 1,
    auditMetadata: {
      createdBy: 'usr-operator',
      updatedBy: 'usr-operator',
    },
  };

  // Contact 5: David Vance (Orbital Logistics Thermal Expert)
  const conDavid: Contact = {
    id: 'con-david',
    firstName: 'David',
    lastName: 'Vance',
    displayName: 'David Vance',
    company: 'Orbital Logistics Systems',
    department: 'Insulation R&D',
    designation: 'Thermal Protection Lead',
    role: 'Engineering',
    email: 'd.vance@jnas.space',
    phone: '+1 (555) 456-7891',
    address: {
      street: '12 Spaceport Boulevard',
      city: 'Cape Canaveral',
      state: 'FL',
      zip: '32920',
      country: 'United States',
    },
    language: 'English',
    timeZone: 'EST',
    status: 'Active',
    tags: ['vacuum-insulation', 'composites', 'aerogel'],
    notes: 'Focuses on aerogel casings, friction calculations, and structural drop-safety.',
    customerLinks: ['cust-ols'],
    projectLinks: ['prj-carbon-casing'],
    knowledgeLinks: ['doc-carbon-friction-friction', 'doc-aerogel-thermal-data'],
    memoryLinks: ['mem-drop-test-calibration'],
    workspace: 'engineering',
    createdDate: '2026-06-12T11:30:00Z',
    updatedDate: timestamp,
    archiveStatus: false,
    isDeleted: false,
    version: 1,
    auditMetadata: {
      createdBy: 'usr-operator',
      updatedBy: 'usr-operator',
    },
  };

  // Contact 6: Marcus Brody (Safety board Flight Instructor)
  const conBrody: Contact = {
    id: 'con-brody',
    firstName: 'Marcus',
    lastName: 'Brody',
    displayName: 'Marcus Brody',
    company: 'Internal Safety Board',
    department: 'Flight Safety Certification',
    designation: 'Chief Pilot Instructor',
    role: 'Compliance',
    email: 'm.brody@jnas.space',
    phone: '+1 (555) 234-5679',
    address: {
      street: '75 Training Ridge',
      city: 'Denver',
      state: 'CO',
      zip: '80202',
      country: 'United States',
    },
    language: 'English',
    timeZone: 'PST',
    status: 'Active',
    tags: ['pilot-safety', 'LMS-training', 'decompression'],
    notes: 'Directs decompression mock drills, safety evaluation sheets, and flight briefing standards.',
    customerLinks: ['cust-isb'],
    projectLinks: ['prj-lms-aviation-safety'],
    knowledgeLinks: ['doc-decompression-syllabus', 'doc-pilot-briefing-rules'],
    memoryLinks: ['mem-pilot-questions-feedback'],
    workspace: 'learning',
    createdDate: '2026-06-08T09:00:00Z',
    updatedDate: timestamp,
    archiveStatus: false,
    isDeleted: false,
    version: 1,
    auditMetadata: {
      createdBy: 'usr-operator',
      updatedBy: 'usr-operator',
    },
  };

  // Contact 7: Frank Vogel (Quantum Materials Specialist)
  const conVogel: Contact = {
    id: 'con-vogel',
    firstName: 'Frank',
    lastName: 'Vogel',
    displayName: 'Frank Vogel',
    company: 'Quantum Composites Corp',
    department: 'Resin R&D',
    designation: 'Materials Engineer',
    role: 'Engineering',
    email: 'vogel@quantumcomposites.resins',
    phone: '+1 (555) 777-8890',
    address: {
      street: '10 Industrial Lane, Block F',
      city: 'Wilmington',
      state: 'DE',
      zip: '19801',
      country: 'United States',
    },
    language: 'German',
    timeZone: 'CET',
    status: 'Active',
    tags: ['materials', 'resins', 'epoxies'],
    notes: 'Handles chemical safety checklists and composite curing properties. Vaulted profile.',
    customerLinks: ['cust-qcc'],
    projectLinks: [],
    knowledgeLinks: [],
    memoryLinks: [],
    workspace: 'admin',
    createdDate: '2026-04-01T10:00:00Z',
    updatedDate: timestamp,
    archiveStatus: false,
    isDeleted: false,
    version: 1,
    auditMetadata: {
      createdBy: 'usr-operator',
      updatedBy: 'usr-operator',
    },
  };

  // Contact 8: Diana Prince (Apex Legal Representative - External Advisor)
  const conDiana: Contact = {
    id: 'con-diana',
    firstName: 'Diana',
    lastName: 'Prince',
    displayName: 'Diana Prince',
    company: 'Apex Resourcing & Counsel',
    department: 'Executive Legal Advisor',
    designation: 'Senior Legal Consultant',
    role: 'Legal',
    email: 'diana.prince@apex-counsel.space',
    phone: '+1 (555) 888-2233',
    address: {
      street: '888 Constitution Ave',
      city: 'Washington',
      state: 'DC',
      zip: '20001',
      country: 'United States',
    },
    language: 'English',
    timeZone: 'EST',
    status: 'Active',
    tags: ['legal-advisor', 'regulatory-compliance', 'defense-clauses'],
    notes: 'Retained advisor for government contracts and strict intellectual property boundaries in aerospace assemblies.',
    customerLinks: ['cust-jda'],
    projectLinks: ['prj-as9100-audit'],
    knowledgeLinks: ['doc-as9100-standards'],
    memoryLinks: [],
    workspace: 'admin',
    createdDate: '2026-05-15T09:00:00Z',
    updatedDate: timestamp,
    archiveStatus: false,
    isDeleted: false,
    version: 1,
    auditMetadata: {
      createdBy: 'usr-operator',
      updatedBy: 'usr-operator',
    },
  };

  // Register all
  registry.createContact(conElena);
  registry.createContact(conMarcusJ);
  registry.createContact(conSarah);
  registry.createContact(conAlex);
  registry.createContact(conDavid);
  registry.createContact(conBrody);
  registry.createContact(conVogel);
  registry.createContact(conDiana);

  // Toggle favorites
  registry.toggleFavorite('con-elena');
  registry.toggleFavorite('con-sarah');

  // Track recent views
  registry.trackRecentView('con-elena');
  registry.trackRecentView('con-sarah');
}

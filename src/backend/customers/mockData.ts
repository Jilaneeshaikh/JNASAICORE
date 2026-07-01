import { CustomerRegistry } from './registry';
import { Customer } from './types';

export function seedCustomers(): void {
  const registry = CustomerRegistry.getInstance();
  const existing = registry.getCustomers(true);
  if (existing.length > 0) return; // Already seeded

  const timestamp = new Date().toISOString();

  // Customer 1: Joint Defense Agency (Linked to AS9100 Revision D Audit)
  const custJda: Customer = {
    id: 'cust-jda',
    companyName: 'Joint Defense Agency',
    displayName: 'JDA',
    legalName: 'Joint Defense Procurement & Logistics Agency',
    customerCode: 'CUST-JDA',
    industry: 'Defense & Government',
    businessType: 'Government',
    gstNumber: 'GST-9988223344',
    taxInformation: 'Tax-Exempt Gov Category A',
    website: 'https://jda.gov.space',
    email: 'procurement@jda.gov.space',
    phone: '+1 (555) 012-4040',
    billingAddress: {
      street: '100 Pentagon Plaza, Suite 400',
      city: 'Washington',
      state: 'DC',
      zip: '20301',
      country: 'United States',
    },
    shippingAddress: {
      street: 'JDA Secure Logistics Depot 12',
      city: 'Alexandria',
      state: 'VA',
      zip: '22304',
      country: 'United States',
    },
    contacts: [
      {
        id: 'contact-elena',
        name: 'Elena Rostova',
        designation: 'Lead Quality Inspector',
        department: 'Government QA Compliance',
        email: 'e.rostova@jnas.space',
        phone: '+1 (555) 012-4041',
        isPrimary: true,
        notes: 'Strict compliance auditor. Directs all calibration audits and clearance reviews.',
      },
      {
        id: 'contact-jackson',
        name: 'Marcus Jackson',
        designation: 'Procurement Specialist',
        department: 'Defense Sourcing Division',
        email: 'm.jackson@jda.gov.space',
        phone: '+1 (555) 012-4045',
        isPrimary: false,
      }
    ],
    status: 'Active',
    priority: 'Critical',
    tags: ['military', 'audit', 'compliance', 'government'],
    owner: 'Elena Rostova',
    workspace: 'business',
    projects: ['prj-as9100-audit'],
    knowledgeLinks: ['doc-as9100-standards', 'doc-calibration-guide'],
    memoryLinks: ['mem-jda-decision-history', 'mem-jda-audit-lessons'],
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

  // Customer 2: JNAS Aerospace (Linked to Jet-Propulsion Wing Assembly Design)
  const custAerospace: Customer = {
    id: 'cust-jnas',
    companyName: 'JNAS Aerospace',
    displayName: 'JNAS Aerospace',
    legalName: 'JNAS Aerospace Structures Corp',
    customerCode: 'CUST-JNAS',
    industry: 'Aeronautics & Aero-Structures',
    businessType: 'Enterprise',
    gstNumber: 'GST-1122334455',
    taxInformation: 'Standard Corporate Rate (US-East)',
    website: 'https://aerospace.jnas.space',
    email: 'info@aerospace.jnas.space',
    phone: '+1 (555) 987-1122',
    billingAddress: {
      street: '450 Propulsion Parkway',
      city: 'Huntsville',
      state: 'AL',
      zip: '35806',
      country: 'United States',
    },
    shippingAddress: {
      street: 'Aero Assembly Hangar 4',
      city: 'Huntsville',
      state: 'AL',
      zip: '35806',
      country: 'United States',
    },
    contacts: [
      {
        id: 'contact-jenkins',
        name: 'Sarah Jenkins',
        designation: 'Director of Aero Engineering',
        department: 'R&D Jet Assemblies',
        email: 's.jenkins@jnas.space',
        phone: '+1 (555) 987-1123',
        isPrimary: true,
        notes: 'Chief structural architect. Coordinates wing assembly CAD layouts and structural stresses.',
      },
      {
        id: 'contact-rivera',
        name: 'Alex Rivera',
        designation: 'Senior Structural Analyst',
        department: 'Stress FEA Division',
        email: 'a.rivera@jnas.space',
        phone: '+1 (555) 987-1129',
        isPrimary: false,
      }
    ],
    status: 'Active',
    priority: 'High',
    tags: ['aerospace', 'jet-engines', 'propulation', 'FEA'],
    owner: 'Sarah Jenkins',
    workspace: 'engineering',
    projects: ['prj-jet-propulsion'],
    knowledgeLinks: ['doc-thrust-vector-spec', 'doc-alloy-718-specs'],
    memoryLinks: ['mem-thrust-hinge-fix'],
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

  // Customer 3: Orbital Logistics Systems (Linked to Carbon-Fiber Vacuum Insulation Module)
  const custOrbital: Customer = {
    id: 'cust-ols',
    companyName: 'Orbital Logistics Systems',
    displayName: 'Orbital Logistics',
    legalName: 'Orbital Freight & Cargo Packaging Corp',
    customerCode: 'CUST-OLS',
    industry: 'Space Cargo Logistics',
    businessType: 'Enterprise',
    gstNumber: 'GST-5544332211',
    taxInformation: 'Standard Enterprise Rate',
    website: 'https://orbital.cargo.space',
    email: 'contracts@orbital.cargo.space',
    phone: '+1 (555) 456-7890',
    billingAddress: {
      street: '12 Spaceport Boulevard',
      city: 'Cape Canaveral',
      state: 'FL',
      zip: '32920',
      country: 'United States',
    },
    shippingAddress: {
      street: 'Containment Loading Zone 3',
      city: 'Cape Canaveral',
      state: 'FL',
      zip: '32920',
      country: 'United States',
    },
    contacts: [
      {
        id: 'contact-vance',
        name: 'David Vance',
        designation: 'Thermal Protection Lead',
        department: 'Insulation R&D',
        email: 'd.vance@jnas.space',
        phone: '+1 (555) 456-7891',
        isPrimary: true,
        notes: 'Focuses on aerogel casings, friction calculations, and structural drop-safety.',
      }
    ],
    status: 'Active',
    priority: 'Medium',
    tags: ['spaceports', 'vacuum-insulation', 'shipping', 'composites'],
    owner: 'David Vance',
    workspace: 'engineering',
    projects: ['prj-carbon-casing'],
    knowledgeLinks: ['doc-carbon-friction-friction', 'doc-aerogel-thermal-data'],
    memoryLinks: ['mem-drop-test-calibration'],
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

  // Customer 4: Internal Safety Board (Linked to Critical Aviation Safety Training)
  const custIsb: Customer = {
    id: 'cust-isb',
    companyName: 'Internal Safety Board',
    displayName: 'Safety Board',
    legalName: 'JNAS Internal Pilot Safety Board',
    customerCode: 'CUST-ISB',
    industry: 'Education & Compliance',
    businessType: 'Academic',
    gstNumber: 'GST-3344556677',
    taxInformation: 'Tax-Exempt Educational Code C3',
    website: 'https://safety.jnas.space',
    email: 'board@safety.jnas.space',
    phone: '+1 (555) 234-5678',
    billingAddress: {
      street: '75 Training Ridge',
      city: 'Denver',
      state: 'CO',
      zip: '80202',
      country: 'United States',
    },
    shippingAddress: {
      street: 'Main Classroom Complex B',
      city: 'Denver',
      state: 'CO',
      zip: '80202',
      country: 'United States',
    },
    contacts: [
      {
        id: 'contact-brody',
        name: 'Marcus Brody',
        designation: 'Chief Pilot Instructor',
        department: 'Flight Safety Certification',
        email: 'm.brody@jnas.space',
        phone: '+1 (555) 234-5679',
        isPrimary: true,
        notes: 'Directs decompression mock drills, safety evaluation sheets, and flight briefing standards.',
      }
    ],
    status: 'On Hold',
    priority: 'High',
    tags: ['LMS', 'safety-board', 'pilot-training', 'decompression'],
    owner: 'Marcus Brody',
    workspace: 'learning',
    projects: ['prj-lms-aviation-safety'],
    knowledgeLinks: ['doc-decompression-syllabus', 'doc-pilot-briefing-rules'],
    memoryLinks: ['mem-pilot-questions-feedback'],
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

  // Customer 5: Quantum Composites Corp (Archived, inactive target)
  const custQuantum: Customer = {
    id: 'cust-qcc',
    companyName: 'Quantum Composites Corp',
    displayName: 'Quantum Composites',
    legalName: 'Quantum Carbon-Epoxy Composites Inc.',
    customerCode: 'CUST-QCC',
    industry: 'Chemical & Composite Resins',
    businessType: 'Enterprise',
    gstNumber: 'GST-7711223399',
    taxInformation: 'Standard Corporate Rate',
    website: 'https://quantumcomposites.resins',
    email: 'contact@quantumcomposites.resins',
    phone: '+1 (555) 777-8899',
    billingAddress: {
      street: '10 Industrial Lane, Block F',
      city: 'Wilmington',
      state: 'DE',
      zip: '19801',
      country: 'United States',
    },
    shippingAddress: {
      street: 'Chemical Delivery Silo 4',
      city: 'Wilmington',
      state: 'DE',
      zip: '19801',
      country: 'United States',
    },
    contacts: [
      {
        id: 'contact-vogel',
        name: 'Frank Vogel',
        designation: 'Materials Engineer',
        department: 'Resin R&D',
        email: 'vogel@quantumcomposites.resins',
        phone: '+1 (555) 777-8890',
        isPrimary: true,
      }
    ],
    status: 'Archived',
    priority: 'Low',
    tags: ['resins', 'epoxies', 'carbon-fiber', 'materials'],
    owner: 'System Operator',
    workspace: 'admin',
    projects: [],
    knowledgeLinks: [],
    memoryLinks: [],
    createdDate: '2026-04-01T10:00:00Z',
    updatedDate: timestamp,
    archiveStatus: true,
    isDeleted: false,
    version: 1,
    auditMetadata: {
      createdBy: 'usr-operator',
      updatedBy: 'usr-operator',
    },
  };

  // Create all in registry
  registry.createCustomer(custJda);
  registry.createCustomer(custAerospace);
  registry.createCustomer(custOrbital);
  registry.createCustomer(custIsb);
  registry.createCustomer(custQuantum);

  // Set default Favorites
  registry.toggleFavorite('cust-jda');
  registry.toggleFavorite('cust-jnas');

  // Track initial Recent views
  registry.trackRecentView('cust-jda');
  registry.trackRecentView('cust-jnas');
  registry.trackRecentView('cust-ols');
}

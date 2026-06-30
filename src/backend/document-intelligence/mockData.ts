import { processDocument } from './pipeline';

export async function seedDocumentRegistry(): Promise<void> {
  const documentsToSeed = [
    {
      title: 'Aerospace Specification Standard AS9100-D',
      description: 'Aviation Quality Management Systems, including audit protocols, safety procedures, and temperature calibration constraints.',
      content: `Standard Aerospace Certification Protocol AS9100 Rev D.
This document governs aviation safety checklists, environmental chamber conditions, and quality management pipelines.
1. Executive Summary: All systems operating within JNAS aerospace guidelines must hold full calibration certifications.
2. Environmental Testing Constraints:
Testing must run for at least 72 hours across rapid temperature shocks ranging from -55 degrees Celsius to 125 degrees Celsius.
Checklists for thermal vacuum tests must monitor voltage drops continuously.
2.1 Temperature Shock Resistance: High altitude mock simulation chambers must deploy triple-redundant sensors to ensure thermal limits are within the 0.05% tolerance band.
3. Compliance Protocols: Aerospace systems must undergo external third-party certification audits every six months to verify compliance matrices.
Audit logs are to be recorded in the KMS Database instantly upon review completion.`,
      format: 'pdf' as const,
      owner: 'Lead Aero Architect',
      workspace: 'engineering',
      project: 'JNAS Core Pipeline',
      module: 'Engineering',
      category: 'Standards',
      tags: ['aerospace', 'standards', 'compliance', 'safety']
    },
    {
      title: 'Aviation CAD Wing-Assembly Layout Rib-V4',
      description: 'Full-scale orthographic design layers, wiring harness pathways, and coordinate assembly vectors for jet-propulsion boundaries.',
      content: `JNAS Jet Wing-Assembly Vector Rib Blueprint Layout.
Layer Outline:
- LAYER: Shell_Boundary: Bounds the spatial aerodynamic curve coordinates. Scale multiplier: 1:50. Outer surface skin.
- LAYER: Wiring_Harness: Houses fiber-optic signals routing flight computer signals to actuators. Minimum clearance: 20mm.
- LAYER: Dimensions: Captures radial curves, coordinate holes, and connector specifications.
Coordinate Hole Details:
Hole AH-1: Coord X=120.4, Y=340.5, Diameter=4.5mm.
Hole AH-2: Coord X=120.4, Y=450.2, Diameter=4.5mm.
Connector Assemblies: Flight control lines are physically locked with standard double-braided steel sleeves to avoid severe high-altitude vibrations.`,
      format: 'dwg' as const,
      owner: 'Principal Systems Designer',
      workspace: 'engineering',
      project: 'JNAS Core Pipeline',
      module: 'Engineering',
      category: 'Blueprints',
      tags: ['cad', 'blueprint', 'engineering', 'wing-assembly']
    },
    {
      title: 'Enterprise CRM Migration & Sync Playbook',
      description: 'Technical guide outlining API synchronization steps, security token exchanges, and customer ledger validation pipelines.',
      content: `# Enterprise CRM Migration & Sync Playbook
This document outlines standard guidelines for moving client accounts into the JNAS CRM module.
## 1. Authentication Handshake:
All CRM API requests must carry a signed JSON Web Token (JWT) on the Authorization header.
Tokens expire in 15 minutes and can be renewed by exchanging active refresh scopes.
## 2. Customer Ledger Ingestion:
Ledger balances are calculated daily. Field maps:
- CustomerName -> Title
- AccountBalance -> CustomValue
- AccountRepresentative -> LeadOwner
Ensure currency codes default strictly to USD unless multi-currency override flags are verified.
## 3. Contact Record Sync:
Avoid duplication of contact nodes by validating unique email hashes before merging records.`,
      format: 'md' as const,
      owner: 'CRM Database Lead',
      workspace: 'business',
      project: 'Business Workspace',
      module: 'CRM',
      category: 'Playbooks',
      tags: ['crm', 'api', 'sync', 'ledger']
    },
    {
      title: 'Q3 Regional Audit Sales Metrics',
      description: 'Consolidated performance sheet recording quarterly transactions, regional representative logs, and target forecasts.',
      content: `Q3 Corporate Auditing Performance Ledger Spreadsheet.
Sheet: Q3_Audit
Row 1: Regional Representative, Accounts Registered, Balance Closed, Commission Rate
Row 2: Sarah Jenkins, 12, $142,500.00, 4.5%
Row 3: Michael Chang, 8, $98,400.00, 4.0%
Row 4: Jessica Vance, 19, $210,000.00, 5.0%
Sheet: Projections_2026
Forecast model suggests JNAS services will expand by 24% next fiscal year, targeting aviation systems as the prime pipeline.`,
      format: 'xlsx' as const,
      owner: 'FinOps Specialist',
      workspace: 'business',
      project: 'Business Workspace',
      module: 'CRM',
      category: 'Financials',
      tags: ['audit', 'sales', 'xlsx', 'financials']
    }
  ];

  // Seed documents sequentially
  for (const doc of documentsToSeed) {
    try {
      await processDocument(doc);
    } catch (e) {
      console.error(`Failed to seed mock document: ${doc.title}`, e);
    }
  }
}

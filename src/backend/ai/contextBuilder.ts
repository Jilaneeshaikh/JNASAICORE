import { AIContextObject, ContextItem } from './types';
import { CustomerRegistry } from '../customers/registry';
import { ProjectRegistry } from '../projects/registry';
import { DocumentRegistry } from '../documents/registry';
import { ContactRegistry } from '../contacts/registry';
import { registry as kmsRegistry } from '../knowledge/registry';
import { EngineeringRegistry } from '../engineering/registry';
import { packagingRegistry } from '../packaging/registry';
import { logisticsRegistry } from '../logistics/registry';
import { returnablesRegistry } from '../returnables/registry';
import { decisionRegistry } from '../decision/registry';
import { threadRegistry } from '../thread/registry';

export class AIContextBuilder {
  private static instance: AIContextBuilder;
  private enabledContexts: Map<string, boolean> = new Map();

  private constructor() {
    // Initialize default enables
    const defaults = ['user', 'workspace', 'module', 'customer', 'contact', 'project', 'document', 'knowledge', 'memory', 'workflow', 'activity', 'communication', 'drawing', 'engineering', 'packaging', 'logistics', 'returnables', 'decision', 'thread'];
    defaults.forEach(d => this.enabledContexts.set(d, true));
  }

  public static getInstance(): AIContextBuilder {
    if (!AIContextBuilder.instance) {
      AIContextBuilder.instance = new AIContextBuilder();
    }
    return AIContextBuilder.instance;
  }

  public isEnabled(type: string): boolean {
    return this.enabledContexts.get(type) !== false;
  }

  public setEnabled(type: string, enabled: boolean): void {
    this.enabledContexts.set(type, enabled);
  }

  public getContextItems(activeWorkspace: string, currentModule: string): ContextItem[] {
    const list: ContextItem[] = [];
    const customerRegistry = CustomerRegistry.getInstance();
    const projectRegistry = ProjectRegistry.getInstance();
    const documentRegistry = DocumentRegistry.getInstance();
    const contactRegistry = ContactRegistry.getInstance();

    // 1. User Context
    list.push({
      id: 'ctx-user',
      type: 'user',
      label: 'Current Operator Persona',
      enabled: this.isEnabled('user'),
      metadata: { role: 'Lead System Engineer', securityClearance: 'Level 4 (Delta-9)' }
    });

    // 2. Workspace
    list.push({
      id: 'ctx-workspace',
      type: 'workspace',
      label: `Workspace Boundary [${activeWorkspace.toUpperCase()}]`,
      enabled: this.isEnabled('workspace'),
      metadata: { activeWorkspace }
    });

    // 3. Current Module
    list.push({
      id: 'ctx-module',
      type: 'module',
      label: `Active Module View [${currentModule}]`,
      enabled: this.isEnabled('module'),
      metadata: { module: currentModule }
    });

    // 4. CRM Customer
    const activeCustomerId = localStorage.getItem('jnas-active-customer-id');
    const customer = activeCustomerId ? customerRegistry.getCustomerById(activeCustomerId) : null;
    list.push({
      id: 'ctx-customer',
      type: 'customer',
      label: customer ? `CRM Customer: ${customer.companyName}` : 'No Active CRM Customer selected',
      enabled: this.isEnabled('customer'),
      metadata: customer || null
    });

    // 5. Contact
    const activeContactId = localStorage.getItem('jnas-active-contact-id');
    const contact = activeContactId ? contactRegistry.getContactById(activeContactId) : null;
    list.push({
      id: 'ctx-contact',
      type: 'contact',
      label: contact ? `Contact Partner: ${contact.displayName}` : 'No Active Contact selected',
      enabled: this.isEnabled('contact'),
      metadata: contact || null
    });

    // 6. Project
    const activeProjectId = localStorage.getItem('jnas-active-project-id');
    const project = activeProjectId ? projectRegistry.getProject(activeProjectId) : null;
    list.push({
      id: 'ctx-project',
      type: 'project',
      label: project ? `Project Milestone: ${project.name}` : 'No Active Project selected',
      enabled: this.isEnabled('project'),
      metadata: project || null
    });

    // 7. Documents
    const activeDocId = localStorage.getItem('jnas-active-document-id');
    const doc = activeDocId ? documentRegistry.getDocument(activeDocId) : null;
    list.push({
      id: 'ctx-document',
      type: 'document',
      label: doc ? `Document Node: ${doc.title}` : 'No Active Document selected',
      enabled: this.isEnabled('document'),
      metadata: doc || null
    });

    // 8. KMS Knowledge
    const kmsItems = kmsRegistry.getObjects().filter(k => k.workspace === activeWorkspace).slice(0, 3);
    list.push({
      id: 'ctx-knowledge',
      type: 'knowledge',
      label: `KMS Base (${kmsItems.length} items loaded)`,
      enabled: this.isEnabled('knowledge'),
      metadata: kmsItems
    });

    // 9. Memory Engine
    const memories = [
      { id: 'mem-091', title: 'Critical stress vectors limit on Titanium grade 5 composites is 800K.', type: 'engineering' },
      { id: 'mem-092', title: 'Client StarLabs contract dictates penalty caps at 10% maximum order value.', type: 'legal' }
    ];
    list.push({
      id: 'ctx-memory',
      type: 'memory',
      label: `Memory Engine Recalls (${memories.length} nodes)`,
      enabled: this.isEnabled('memory'),
      metadata: memories
    });

    // 10. Workflows
    const activeTasks = project ? project.tasks.slice(0, 3) : [];
    list.push({
      id: 'ctx-workflow',
      type: 'workflow',
      label: project ? `Workflow Status: ${project.name} Tasks` : 'No Active Project Workflows',
      enabled: this.isEnabled('workflow'),
      metadata: activeTasks
    });

    // 11. Activities & Timeline
    const activities = project ? projectRegistry.getLogs(project.id).slice(0, 3) : [];
    list.push({
      id: 'ctx-activity',
      type: 'activity',
      label: project ? `Activity Logs (${activities.length} entries)` : 'No active activity stream',
      enabled: this.isEnabled('activity'),
      metadata: activities
    });

    // 12. Communications
    const comms = [
      { id: 'comm-1', sender: 'Systems Operator', channel: 'Slack', message: 'SLA documents for StarLabs successfully processed by crawler.' }
    ];
    list.push({
      id: 'ctx-communication',
      type: 'communication',
      label: 'Communication Hub Stream',
      enabled: this.isEnabled('communication'),
      metadata: comms
    });

    // 13. CAD Drawings (Engineering)
    const activeDrawingId = localStorage.getItem('jnas-active-drawing-id');
    const drawing = activeDrawingId ? EngineeringRegistry.getInstance().getDrawingById(activeDrawingId) : null;
    list.push({
      id: 'ctx-drawing',
      type: 'drawing',
      label: drawing ? `CAD Drawing: ${drawing.drawingNumber} (${drawing.title})` : 'No Active CAD Drawing selected',
      enabled: this.isEnabled('drawing'),
      metadata: drawing || null
    });

    // 14. Engineering Sub-Projects & Milestones
    const engProjDetails = project ? EngineeringRegistry.getInstance().getProjectDetails(project.id) : null;
    list.push({
      id: 'ctx-engineering',
      type: 'engineering',
      label: engProjDetails ? `Engineering Specs & Revisions` : 'No Engineering Details for active project',
      enabled: this.isEnabled('engineering'),
      metadata: engProjDetails || null
    });

    // 15. Packaging Studio Context
    const pkgProjects = packagingRegistry.getProjects();
    list.push({
      id: 'ctx-packaging',
      type: 'packaging',
      label: `Packaging Specs (${pkgProjects.length} designs in registry)`,
      enabled: this.isEnabled('packaging'),
      metadata: pkgProjects
    });

    // 16. Logistics Context
    const loadPlans = logisticsRegistry.getLoadPlans();
    list.push({
      id: 'ctx-logistics',
      type: 'logistics',
      label: `Logistics Load Plans (${loadPlans.length} active plans)`,
      enabled: this.isEnabled('logistics'),
      metadata: loadPlans
    });

    // 17. Returnables Context
    const assets = returnablesRegistry.getAssets();
    list.push({
      id: 'ctx-returnables',
      type: 'returnables',
      label: `Returnable Assets (${assets.length} items in registry)`,
      enabled: this.isEnabled('returnables'),
      metadata: assets
    });

    // 18. Decision Context
    const kpis = decisionRegistry.getKPIs();
    list.push({
      id: 'ctx-decision',
      type: 'decision',
      label: `Decision KPIs (${kpis.length} registered strategic indicators)`,
      enabled: this.isEnabled('decision'),
      metadata: kpis
    });

    // 19. Digital Thread Context
    const relationships = threadRegistry.getRelationships();
    list.push({
      id: 'ctx-thread',
      type: 'thread',
      label: `Digital Thread Relationships (${relationships.length} active links)`,
      enabled: this.isEnabled('thread'),
      metadata: relationships
    });

    return list;
  }

  public gatherContext(activeWorkspace: string, currentModule: string, currentUserSession: any): AIContextObject {
    const customerRegistry = CustomerRegistry.getInstance();
    const projectRegistry = ProjectRegistry.getInstance();
    const documentRegistry = DocumentRegistry.getInstance();
    const contactRegistry = ContactRegistry.getInstance();

    const activeCustomerId = localStorage.getItem('jnas-active-customer-id');
    const customer = activeCustomerId ? customerRegistry.getCustomerById(activeCustomerId) : null;

    const activeContactId = localStorage.getItem('jnas-active-contact-id');
    const contact = activeContactId ? contactRegistry.getContactById(activeContactId) : null;

    const activeProjectId = localStorage.getItem('jnas-active-project-id');
    const project = activeProjectId ? projectRegistry.getProject(activeProjectId) : null;

    const activeDocId = localStorage.getItem('jnas-active-document-id');
    const doc = activeDocId ? documentRegistry.getDocument(activeDocId) : null;

    const kmsItems = kmsRegistry.getObjects().filter(k => k.workspace === activeWorkspace).slice(0, 3);

    const memories = [
      { id: 'mem-091', title: 'Critical stress vectors limit on Titanium grade 5 composites is 800K.', type: 'engineering' },
      { id: 'mem-092', title: 'Client StarLabs contract dictates penalty caps at 10% maximum order value.', type: 'legal' }
    ];

    const activeTasks = project ? project.tasks.slice(0, 5) : [];
    const activities = project ? projectRegistry.getLogs(project.id).slice(0, 3) : [];
    const comms = [
      { id: 'comm-1', sender: 'Systems Operator', channel: 'Notification', message: 'SLA documents for StarLabs successfully processed.' }
    ];

    const activeDrawingId = localStorage.getItem('jnas-active-drawing-id');
    const activeDrawing = activeDrawingId ? EngineeringRegistry.getInstance().getDrawingById(activeDrawingId) : null;
    const engineeringDetails = project ? EngineeringRegistry.getInstance().getProjectDetails(project.id) : null;

    return {
      currentUser: currentUserSession ? {
        id: currentUserSession.id,
        name: currentUserSession.name,
        email: currentUserSession.email,
        role: currentUserSession.role
      } : {
        id: 'usr-operator',
        name: 'Chief Operator',
        email: 'operator@jnas.space',
        role: 'Administrator'
      },
      currentWorkspace: activeWorkspace,
      currentModule: currentModule,
      currentCustomer: this.isEnabled('customer') ? customer : null,
      currentContact: this.isEnabled('contact') ? contact : null,
      currentProject: this.isEnabled('project') ? project : null,
      currentDocuments: this.isEnabled('document') && doc ? [doc] : [],
      knowledge: this.isEnabled('knowledge') ? kmsItems : [],
      memory: this.isEnabled('memory') ? memories : [],
      activities: this.isEnabled('activity') ? activities : [],
      communication: this.isEnabled('communication') ? comms : [],
      workflow: this.isEnabled('workflow') && project ? { projectId: project.id, tasks: activeTasks } : null,
      searchResults: [],
      settings: { theme: 'slate-dark', isIsolated: true },
      permissions: ['read:all', 'write:core', 'execute:ai'],
      activeDrawing: this.isEnabled('drawing') ? activeDrawing : null,
      engineeringDetails: this.isEnabled('engineering') ? engineeringDetails : null,
      packagingContext: this.isEnabled('packaging') ? {
        projects: packagingRegistry.getProjects(),
        materials: packagingRegistry.getMaterials(),
        components: packagingRegistry.getComponents(),
        standards: packagingRegistry.getStandards(),
        designs: packagingRegistry.getDesigns(),
        rules: packagingRegistry.getRules(),
        validationRuns: packagingRegistry.getValidationRuns()
      } : null,
      logisticsContext: this.isEnabled('logistics') ? {
        loadPlans: logisticsRegistry.getLoadPlans(),
        containers: logisticsRegistry.getContainers()
      } : null,
      returnablesContext: this.isEnabled('returnables') ? {
        assets: returnablesRegistry.getAssets(),
        auditLogs: returnablesRegistry.getAuditLogs()
      } : null,
      decisionContext: this.isEnabled('decision') ? {
        kpis: decisionRegistry.getKPIs(),
        dashboards: decisionRegistry.getDashboards(),
        analytics: decisionRegistry.getAnalytics(),
        auditLogs: decisionRegistry.getAuditLogs()
      } : null,
      threadContext: this.isEnabled('thread') ? {
        nodes: threadRegistry.getNodes(),
        relationships: threadRegistry.getRelationships(),
        auditLogs: threadRegistry.getAuditLogs()
      } : null
    };
  }

  public compileToXmlPrompt(context: AIContextObject): string {
    let xml = `<JNAS_UNIFIED_CONTEXT_FABRIC>\n`;
    xml += `  <GENERATED_TIMESTAMP>${new Date().toISOString()}</GENERATED_TIMESTAMP>\n`;

    if (this.isEnabled('user') && context.currentUser) {
      xml += `  <CURRENT_USER>\n`;
      xml += `    <NAME>${context.currentUser.name}</NAME>\n`;
      xml += `    <EMAIL>${context.currentUser.email}</EMAIL>\n`;
      xml += `    <ROLE>${context.currentUser.role}</ROLE>\n`;
      xml += `  </CURRENT_USER>\n`;
    }

    if (this.isEnabled('workspace')) {
      xml += `  <ISOLATION_WORKSPACE>${context.currentWorkspace.toUpperCase()}</ISOLATION_WORKSPACE>\n`;
    }

    if (this.isEnabled('module')) {
      xml += `  <ACTIVE_MODULE>${context.currentModule}</ACTIVE_MODULE>\n`;
    }

    if (this.isEnabled('customer') && context.currentCustomer) {
      const cust = context.currentCustomer;
      xml += `  <CRM_CUSTOMER>\n`;
      xml += `    <ID>${cust.id}</ID>\n`;
      xml += `    <COMPANY_NAME>${cust.companyName}</COMPANY_NAME>\n`;
      xml += `    <CODE>${cust.customerCode}</CODE>\n`;
      xml += `    <INDUSTRY>${cust.industry}</INDUSTRY>\n`;
      xml += `    <STATUS>${cust.status}</STATUS>\n`;
      xml += `  </CRM_CUSTOMER>\n`;
    }

    if (this.isEnabled('contact') && context.currentContact) {
      const cont = context.currentContact;
      xml += `  <CONTACT_PARTNER>\n`;
      xml += `    <ID>${cont.id}</ID>\n`;
      xml += `    <NAME>${cont.displayName}</NAME>\n`;
      xml += `    <EMAIL>${cont.email}</EMAIL>\n`;
      xml += `    <ROLE>${cont.role || 'Member'}</ROLE>\n`;
      xml += `    <COMPANY>${cont.company}</COMPANY>\n`;
      xml += `  </CONTACT_PARTNER>\n`;
    }

    if (this.isEnabled('project') && context.currentProject) {
      const proj = context.currentProject;
      xml += `  <PROJECT_MILESTONE>\n`;
      xml += `    <ID>${proj.id}</ID>\n`;
      xml += `    <NAME>${proj.name}</NAME>\n`;
      xml += `    <STATUS>${proj.status}</STATUS>\n`;
      xml += `    <PRIORITY>${proj.priority}</PRIORITY>\n`;
      xml += `    <HEALTH>${proj.health || 'Healthy'}</HEALTH>\n`;
      xml += `  </PROJECT_MILESTONE>\n`;
    }

    if (this.isEnabled('document') && context.currentDocuments.length > 0) {
      context.currentDocuments.forEach(doc => {
        xml += `  <DOCUMENT_NODE>\n`;
        xml += `    <ID>${doc.id}</ID>\n`;
        xml += `    <TITLE>${doc.title}</TITLE>\n`;
        xml += `    <EXTENSION>${doc.type || 'PDF'}</EXTENSION>\n`;
        xml += `    <CONFIDENTIALITY>${doc.confidentialityLevel || 'Internal'}</CONFIDENTIALITY>\n`;
        xml += `    <DESCRIPTION>${doc.description || 'No summary available'}</DESCRIPTION>\n`;
        xml += `  </DOCUMENT_NODE>\n`;
      });
    }

    if (this.isEnabled('knowledge') && context.knowledge.length > 0) {
      xml += `  <KNOWLEDGE_ARTICLES>\n`;
      context.knowledge.forEach((k: any) => {
        xml += `    <ARTICLE>\n`;
        xml += `      <TITLE>${k.title}</TITLE>\n`;
        xml += `      <CATEGORY>${k.category}</CATEGORY>\n`;
        xml += `      <SUMMARY>${k.description}</SUMMARY>\n`;
        xml += `    </ARTICLE>\n`;
      });
      xml += `  </KNOWLEDGE_ARTICLES>\n`;
    }

    if (this.isEnabled('memory') && context.memory.length > 0) {
      xml += `  <MEMORY_NODES>\n`;
      context.memory.forEach((m: any) => {
        xml += `    <NODE id="${m.id}">${m.title}</NODE>\n`;
      });
      xml += `  </MEMORY_NODES>\n`;
    }

    if (this.isEnabled('workflow') && context.workflow) {
      xml += `  <WORKFLOW_TASKS>\n`;
      context.workflow.tasks.forEach((t: any) => {
        xml += `    <TASK status="${t.status}" priority="${t.priority}">${t.title}</TASK>\n`;
      });
      xml += `  </WORKFLOW_TASKS>\n`;
    }

    if (this.isEnabled('activity') && context.activities.length > 0) {
      xml += `  <ACTIVITY_TIMELINE>\n`;
      context.activities.forEach((a: any) => {
        xml += `    <EVENT action="${a.action}" timestamp="${a.timestamp}">${a.detail || a.action}</EVENT>\n`;
      });
      xml += `  </ACTIVITY_TIMELINE>\n`;
    }

    if (this.isEnabled('communication') && context.communication.length > 0) {
      xml += `  <COMMUNICATION_CHANNELS>\n`;
      context.communication.forEach((c: any) => {
        xml += `    <COMMUNICATION sender="${c.sender}" channel="${c.channel}">${c.message}</COMMUNICATION>\n`;
      });
      xml += `  </COMMUNICATION_CHANNELS>\n`;
    }

    if (this.isEnabled('drawing') && context.activeDrawing) {
      const drw = context.activeDrawing;
      xml += `  <ACTIVE_CAD_DRAWING>\n`;
      xml += `    <DRAWING_NUMBER>${drw.drawingNumber}</DRAWING_NUMBER>\n`;
      xml += `    <REVISION>${drw.revision}</REVISION>\n`;
      xml += `    <TITLE>${drw.title}</TITLE>\n`;
      xml += `    <CATEGORY>${drw.category}</CATEGORY>\n`;
      xml += `    <STATUS>${drw.status}</STATUS>\n`;
      xml += `    <APPROVAL>${drw.approvalStatus}</APPROVAL>\n`;
      xml += `    <DESCRIPTION>${drw.description}</DESCRIPTION>\n`;
      if (drw.relatedBOM && drw.relatedBOM.length > 0) {
        xml += `    <BOM_ITEMS>\n`;
        drw.relatedBOM.forEach((b: any) => {
          xml += `      <BOM_ITEM q="${b.quantity}" u="${b.unit}">${b.partNumber} - ${b.name} (${b.material || ''})</BOM_ITEM>\n`;
        });
        xml += `    </BOM_ITEMS>\n`;
      }
      xml += `  </ACTIVE_CAD_DRAWING>\n`;
    }

    if (this.isEnabled('engineering') && context.engineeringDetails) {
      const eng = context.engineeringDetails;
      xml += `  <ENGINEERING_PROJECT_DETAILS>\n`;
      xml += `    <BUDGET spent="${eng.budget.spent}" allocated="${eng.budget.allocated}">${eng.budget.currency}</BUDGET>\n`;
      if (eng.subProjects && eng.subProjects.length > 0) {
        xml += `    <SUB_PROJECTS>\n`;
        eng.subProjects.forEach((s: any) => {
          xml += `      <SUB_PROJECT status="${s.status}">${s.name} (Lead: ${s.leadEngineer})</SUB_PROJECT>\n`;
        });
        xml += `    </SUB_PROJECTS>\n`;
      }
      if (eng.milestones && eng.milestones.length > 0) {
        xml += `    <MILESTONES>\n`;
        eng.milestones.forEach((m: any) => {
          xml += `      <MILESTONE status="${m.status}">${m.title} (Target: ${m.targetDate})</MILESTONE>\n`;
        });
        xml += `    </MILESTONES>\n`;
      }
      xml += `  </ENGINEERING_PROJECT_DETAILS>\n`;
    }

    if (this.isEnabled('packaging') && context.packagingContext) {
      xml += `  <PACKAGING_STUDIO_COGNITION>\n`;
      const { projects, materials, components, standards, designs } = context.packagingContext;

      if (projects && projects.length > 0) {
        xml += `    <PACKAGING_PROJECTS>\n`;
        projects.forEach((p: any) => {
          xml += `      <PROJECT num="${p.projectNumber}" status="${p.status}" approval="${p.approvalStatus}">\n`;
          xml += `        <NAME>${p.projectName}</NAME>\n`;
          xml += `        <CUSTOMER>${p.customerName}</CUSTOMER>\n`;
          xml += `        <TYPE>${p.packagingType}</TYPE>\n`;
          xml += `        <WEIGHT_CAPACITY>${p.weightCapacityKg || 'N/A'} kg</WEIGHT_CAPACITY>\n`;
          if (p.dimensionsOuter) {
            xml += `        <DIMENSIONS>${p.dimensionsOuter.length}x${p.dimensionsOuter.width}x${p.dimensionsOuter.height} ${p.dimensionsOuter.unit}</DIMENSIONS>\n`;
          }
          if (p.tags) {
            xml += `        <TAGS>${p.tags.join(', ')}</TAGS>\n`;
          }
          xml += `      </PROJECT>\n`;
        });
        xml += `    </PACKAGING_PROJECTS>\n`;
      }

      if (materials && materials.length > 0) {
        xml += `    <MATERIAL_REGISTRY>\n`;
        materials.forEach((m: any) => {
          xml += `      <MATERIAL id="${m.id}" code="${m.code}" cat="${m.category}" grade="${m.grade}">\n`;
          xml += `        <NAME>${m.name}</NAME>\n`;
          xml += `        <TYPE>${m.materialType}</TYPE>\n`;
          xml += `        <DENSITY>${m.density}</DENSITY>\n`;
          xml += `        <UNIT>${m.unit}</UNIT>\n`;
          xml += `        <REVISION>${m.revision}</REVISION>\n`;
          xml += `        <APPROVAL>${m.approvalStatus}</APPROVAL>\n`;
          xml += `        <MANUFACTURER>${m.manufacturer}</MANUFACTURER>\n`;
          xml += `      </MATERIAL>\n`;
        });
        xml += `    </MATERIAL_REGISTRY>\n`;
      }

      if (components && components.length > 0) {
        xml += `    <COMPONENT_REGISTRY>\n`;
        components.forEach((c: any) => {
          xml += `      <COMPONENT id="${c.id}" code="${c.code}" cat="${c.category}" status="${c.status}">\n`;
          xml += `        <NAME>${c.name}</NAME>\n`;
          xml += `        <MATERIAL_ID>${c.materialId}</MATERIAL_ID>\n`;
          xml += `        <REVISION>${c.revision}</REVISION>\n`;
          if (c.drawingRef) xml += `        <DRAWING_REF>${c.drawingRef}</DRAWING_REF>\n`;
          if (c.partNumber) xml += `        <PART_NUMBER>${c.partNumber}</PART_NUMBER>\n`;
          xml += `      </COMPONENT>\n`;
        });
        xml += `    </COMPONENT_REGISTRY>\n`;
      }

      if (standards && standards.length > 0) {
        xml += `    <PACKAGING_STANDARDS>\n`;
        standards.forEach((s: any) => {
          xml += `      <STANDARD id="${s.id}" code="${s.code}" type="${s.type}" status="${s.status}">\n`;
          xml += `        <NAME>${s.name}</NAME>\n`;
          xml += `        <REVISION>${s.revision}</REVISION>\n`;
          xml += `      </STANDARD>\n`;
        });
        xml += `    </PACKAGING_STANDARDS>\n`;
      }

      if (designs && designs.length > 0) {
        xml += `    <PACKAGING_DESIGNS>\n`;
        designs.forEach((d: any) => {
          xml += `      <DESIGN id="${d.id}" num="${d.designNumber}" rev="${d.revision}" version="${d.version}" status="${d.lifecycleStatus}">\n`;
          xml += `        <NAME>${d.designName}</NAME>\n`;
          xml += `        <CATEGORY>${d.category}</CATEGORY>\n`;
          xml += `        <CUSTOMER id="${d.customer.id}">${d.customer.name}</CUSTOMER>\n`;
          xml += `        <PROJECT id="${d.project.id}">${d.project.name}</PROJECT>\n`;
          xml += `        <ENGINEER>${d.packagingEngineer}</ENGINEER>\n`;
          xml += `        <ASSET>${d.engineeringAsset}</ASSET>\n`;
          if (d.bom && d.bom.length > 0) {
            xml += `          <BOM>\n`;
            d.bom.forEach((b: any) => {
              xml += `            <BOM_ITEM code="${b.code}" quantity="${b.quantity}">${b.name}</BOM_ITEM>\n`;
            });
            xml += `          </BOM>\n`;
          }
          xml += `      </DESIGN>\n`;
        });
        xml += `    </PACKAGING_DESIGNS>\n`;
      }

      const rules = context.packagingContext.rules;
      if (rules && rules.length > 0) {
        xml += `    <VALIDATION_RULES>\n`;
        rules.forEach((r: any) => {
          xml += `      <RULE id="${r.id}" code="${r.ruleNumber}" category="${r.category}" severity="${r.severity}" priority="${r.priority}" status="${r.status}">\n`;
          xml += `        <NAME>${r.ruleName}</NAME>\n`;
          xml += `        <DESCRIPTION>${r.description}</DESCRIPTION>\n`;
          if (r.relatedStandard) xml += `        <RELATED_STANDARD>${r.relatedStandard}</RELATED_STANDARD>\n`;
          xml += `      </RULE>\n`;
        });
        xml += `    </VALIDATION_RULES>\n`;
      }

      const runs = context.packagingContext.validationRuns;
      if (runs && runs.length > 0) {
        xml += `    <VALIDATION_RUNS>\n`;
        runs.forEach((run: any) => {
          xml += `      <RUN id="${run.id}" designId="${run.designId}" designNum="${run.designNumber}" status="${run.overallStatus}" executedAt="${run.executedAt}">\n`;
          xml += `        <DESIGN_NAME>${run.designName}</DESIGN_NAME>\n`;
          xml += `        <EXECUTED_BY>${run.executedBy}</EXECUTED_BY>\n`;
          xml += `      </RUN>\n`;
        });
        xml += `    </VALIDATION_RUNS>\n`;
      }

      xml += `  </PACKAGING_STUDIO_COGNITION>\n`;
    }

    if (this.isEnabled('logistics') && context.logisticsContext) {
      xml += `  <LOGISTICS_PLANNING_COGNITION>\n`;
      const plans = context.logisticsContext.loadPlans || [];
      if (plans.length > 0) {
        xml += `    <LOAD_PLANS>\n`;
        plans.forEach((p: any) => {
          xml += `      <PLAN id="${p.id}" number="${p.planNumber}" status="${p.status}" priority="${p.priority}" approval="${p.approvalStatus}">\n`;
          xml += `        <TITLE>${p.title}</TITLE>\n`;
          xml += `        <DESCRIPTION>${p.description}</DESCRIPTION>\n`;
          xml += `        <CUSTOMER>${p.customer.name}</CUSTOMER>\n`;
          xml += `        <PROJECT>${p.project.name}</PROJECT>\n`;
          xml += `        <DESIGN_NUMBER>${p.packagingDesign.designNumber}</DESIGN_NUMBER>\n`;
          xml += `        <DESIGN_NAME>${p.packagingDesign.name}</DESIGN_NAME>\n`;
          xml += `        <ENGINEERING_ASSET>${p.engineeringAsset}</ENGINEERING_ASSET>\n`;
          xml += `        <CONTAINER>${p.containerType}</CONTAINER>\n`;
          xml += `        <VEHICLE>${p.vehicleType}</VEHICLE>\n`;
          xml += `        <WAREHOUSE>${p.warehouse}</WAREHOUSE>\n`;
          xml += `        <CAPACITY_MODEL>\n`;
          xml += `          <VOLUME_CBM>${p.capacity.volume}</VOLUME_CBM>\n`;
          xml += `          <WEIGHT_KG>${p.capacity.weight}</WEIGHT_KG>\n`;
          xml += `          <STACKING_LIMIT>${p.capacity.stackingLimit}</STACKING_LIMIT>\n`;
          xml += `          <MAX_UNITS>${p.capacity.maximumCapacity}</MAX_UNITS>\n`;
          xml += `          <SAFETY_MARGIN_PERCENT>${p.capacity.safetyMargin}</SAFETY_MARGIN_PERCENT>\n`;
          xml += `          <LOADING_ZONE>${p.capacity.loadingZone}</LOADING_ZONE>\n`;
          xml += `          <CENTER_OF_GRAVITY>${p.capacity.centerOfGravity}</CENTER_OF_GRAVITY>\n`;
          xml += `        </CAPACITY_MODEL>\n`;
          xml += `      </PLAN>\n`;
        });
        xml += `    </LOAD_PLANS>\n`;
      }
      const containers = context.logisticsContext.containers || [];
      if (containers.length > 0) {
        xml += `    <CONTAINER_EQUIPMENT>\n`;
        containers.forEach((c: any) => {
          xml += `      <EQUIPMENT id="${c.id}" code="${c.code}" type="${c.type}" status="${c.status}">\n`;
          xml += `        <NAME>${c.name}</NAME>\n`;
          xml += `        <DIMENSIONS>${c.lengthMm}x${c.widthMm}x${c.heightMm} mm</DIMENSIONS>\n`;
          xml += `        <MAX_WEIGHT_KG>${c.maxWeightKg}</MAX_WEIGHT_KG>\n`;
          xml += `        <MAX_VOLUME_CBM>${c.maxVolumeCbm}</MAX_VOLUME_CBM>\n`;
          xml += `      </EQUIPMENT>\n`;
        });
        xml += `    </CONTAINER_EQUIPMENT>\n`;
      }
      xml += `  </LOGISTICS_PLANNING_COGNITION>\n`;
    }

    if (this.isEnabled('returnables') && context.returnablesContext) {
      xml += `  <RETURNABLE_ASSET_COGNITION>\n`;
      const assets = context.returnablesContext.assets || [];
      if (assets.length > 0) {
        xml += `    <RETURNABLE_ASSETS>\n`;
        assets.forEach((a: any) => {
          xml += `      <ASSET id="${a.id}" number="${a.assetNumber}" type="${a.assetType}" lifecycle="${a.lifecycleStatus}" status="${a.status}">\n`;
          xml += `        <NAME>${a.assetName}</NAME>\n`;
          xml += `        <DESCRIPTION>${a.description}</DESCRIPTION>\n`;
          xml += `        <CUSTOMER>${a.customer.name}</CUSTOMER>\n`;
          xml += `        <PROJECT>${a.project.name}</PROJECT>\n`;
          xml += `        <DESIGN>${a.packagingDesign.designNumber} (${a.packagingDesign.name})</DESIGN>\n`;
          xml += `        <ENGINEERING_ASSET>${a.engineeringAsset}</ENGINEERING_ASSET>\n`;
          xml += `        <MATERIAL>${a.material}</MATERIAL>\n`;
          xml += `        <LOCATION>${a.currentLocation}</LOCATION>\n`;
          xml += `        <CYCLES>${a.currentCycleCount}/${a.maximumCycleCount}</CYCLES>\n`;
          xml += `        <INSPECTION>${a.inspectionStatus}</INSPECTION>\n`;
          xml += `        <REPAIR>${a.repairStatus}</REPAIR>\n`;
          xml += `        <TRACKING mode="${a.trackingMode}">${a.trackingIdentifier}</TRACKING>\n`;
          xml += `      </ASSET>\n`;
        });
        xml += `    </RETURNABLE_ASSETS>\n`;
      }
      xml += `  </RETURNABLE_ASSET_COGNITION>\n`;
    }

    if (this.isEnabled('decision') && context.decisionContext) {
      xml += `  <DECISION_INTELLIGENCE_COGNITION>\n`;
      const kpis = context.decisionContext.kpis || [];
      if (kpis.length > 0) {
        xml += `    <STRATEGIC_KPIS>\n`;
        kpis.forEach((k: any) => {
          xml += `      <KPI id="${k.kpiId}" module="${k.module}" category="${k.category}" status="${k.status}" priority="${k.priority}">\n`;
          xml += `        <NAME>${k.name}</NAME>\n`;
          xml += `        <DESCRIPTION>${k.description}</DESCRIPTION>\n`;
          xml += `        <CURRENT_VALUE>${k.currentValue}</CURRENT_VALUE>\n`;
          xml += `        <TARGET_VALUE>${k.targetValue}</TARGET_VALUE>\n`;
          xml += `        <UNIT>${k.unit}</UNIT>\n`;
          xml += `        <TREND>${k.trend}</TREND>\n`;
          xml += `        <FORMULA>${k.formula}</FORMULA>\n`;
          xml += `      </KPI>\n`;
        });
        xml += `    </STRATEGIC_KPIS>\n`;
      }
      const dashboards = context.decisionContext.dashboards || [];
      if (dashboards.length > 0) {
        xml += `    <EXECUTIVE_DASHBOARDS>\n`;
        dashboards.forEach((d: any) => {
          xml += `      <DASHBOARD id="${d.dashboardId}" audience="${d.audience}" workspace="${d.workspace}">\n`;
          xml += `        <NAME>${d.dashboardName}</NAME>\n`;
          xml += `        <DEPARTMENT>${d.department}</DEPARTMENT>\n`;
          xml += `        <VERSION>${d.version}</VERSION>\n`;
          xml += `      </DASHBOARD>\n`;
        });
        xml += `    </EXECUTIVE_DASHBOARDS>\n`;
      }
      xml += `  </DECISION_INTELLIGENCE_COGNITION>\n`;
    }

    if (this.isEnabled('thread') && context.threadContext) {
      xml += `  <DIGITAL_THREAD_COGNITION>\n`;
      const nodes = context.threadContext.nodes || [];
      if (nodes.length > 0) {
        xml += `    <THREAD_OBJECT_DIRECTORY>\n`;
        nodes.forEach((n: any) => {
          xml += `      <OBJECT id="${n.objectId}" type="${n.objectType}" status="${n.status || ''}">\n`;
          xml += `        <NAME>${n.objectName}</NAME>\n`;
          xml += `        <OWNER>${n.owner || ''}</OWNER>\n`;
          xml += `      </OBJECT>\n`;
        });
        xml += `    </THREAD_OBJECT_DIRECTORY>\n`;
      }

      const relationships = context.threadContext.relationships || [];
      if (relationships.length > 0) {
        xml += `    <RELATIONSHIP_GRAPH_EDGES>\n`;
        relationships.forEach((r: any) => {
          xml += `      <EDGE id="${r.relationshipId}" type="${r.relationshipType}" source="${r.sourceId}" target="${r.targetId}" direction="${r.direction}" strength="${r.strength}" status="${r.status}" />\n`;
        });
        xml += `    </RELATIONSHIP_GRAPH_EDGES>\n`;
      }
      xml += `  </DIGITAL_THREAD_COGNITION>\n`;
    }

    xml += `</JNAS_UNIFIED_CONTEXT_FABRIC>`;
    return xml;
  }

  public estimateTokenCount(text: string): number {
    return Math.ceil(text.length / 3.8); // High fidelity estimated count (approx 1 token for ~3.8-4 characters)
  }
}

export const contextBuilder = AIContextBuilder.getInstance();

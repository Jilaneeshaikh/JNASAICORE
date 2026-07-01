import { KPI, Dashboard, AnalyticsMetric, Widget, DecisionAuditLog, DecisionRole } from './types';
import { eventBus, loggers, serviceRegistry, IService } from '../../core';

const log = loggers.app;

export const initialKPIs: KPI[] = [
  // CRM KPIs
  {
    kpiId: 'kpi-crm-pipeline',
    name: 'Sales Pipeline Value',
    description: 'Total active value of deal opportunities in CRM pipelines',
    module: 'CRM',
    category: 'Growth',
    formula: 'SUM(DealValue * Probability)',
    unit: 'USD',
    targetValue: 2500000,
    currentValue: 2180000,
    trend: 'up',
    owner: 'Sarah Connor (Business Ops)',
    status: 'On Track',
    priority: 'High',
    refreshFrequency: 'Daily',
    createdDate: '2026-01-10T08:00:00Z',
    updatedDate: '2026-06-30T10:00:00Z',
    auditMetadata: { lastUpdatedBy: 'system', lastAudited: '2026-06-30T00:00:00Z', version: 34 }
  },
  {
    kpiId: 'kpi-crm-conversion',
    name: 'Customer Conversion Rate',
    description: 'Percentage of prospects successfully converted to active accounts',
    module: 'CRM',
    category: 'Growth',
    formula: 'ConvertedDeals / TotalLeads * 100',
    unit: '%',
    targetValue: 35,
    currentValue: 31.5,
    trend: 'up',
    owner: 'Sarah Connor (Business Ops)',
    status: 'On Track',
    priority: 'Medium',
    refreshFrequency: 'Weekly',
    createdDate: '2026-01-15T08:00:00Z',
    updatedDate: '2026-06-29T14:30:00Z',
    auditMetadata: { lastUpdatedBy: 's.connor', lastAudited: '2026-06-25T00:00:00Z', version: 12 }
  },
  // Projects KPIs
  {
    kpiId: 'kpi-proj-delivery',
    name: 'Project Milestones On-Time Rate',
    description: 'Percentage of project milestone cards completed within schedule envelopes',
    module: 'Projects',
    category: 'Operational',
    formula: 'OnTimeCompletedMilestones / TotalMilestones * 100',
    unit: '%',
    targetValue: 90,
    currentValue: 84.3,
    trend: 'stable',
    owner: 'Dave Miller (Project Management)',
    status: 'At Risk',
    priority: 'High',
    refreshFrequency: 'Daily',
    createdDate: '2026-02-01T09:00:00Z',
    updatedDate: '2026-06-30T12:00:00Z',
    auditMetadata: { lastUpdatedBy: 'd.miller', lastAudited: '2026-06-29T00:00:00Z', version: 45 }
  },
  // Engineering KPIs
  {
    kpiId: 'kpi-eng-rev-cycles',
    name: 'CAD Engineering Review Duration',
    description: 'Average business days taken to evaluate, review, and sign-off CAD drawing revisions',
    module: 'Engineering',
    category: 'Efficiency',
    formula: 'AVG(ApprovalTimestamp - SubmissionTimestamp)',
    unit: 'Days',
    targetValue: 3,
    currentValue: 4.2,
    trend: 'down',
    owner: 'Elena Rostova (Engineering Lead)',
    status: 'At Risk',
    priority: 'Medium',
    refreshFrequency: 'Weekly',
    createdDate: '2026-01-20T08:00:00Z',
    updatedDate: '2026-06-28T16:00:00Z',
    auditMetadata: { lastUpdatedBy: 'e.rostova', lastAudited: '2026-06-24T00:00:00Z', version: 8 }
  },
  {
    kpiId: 'kpi-eng-fatigue-violations',
    name: 'Stress & Fatigue Compliance Rate',
    description: 'Percentage of mechanical asset designs scoring within safety deflection envelopes',
    module: 'Engineering',
    category: 'Quality',
    formula: 'CompliantDesigns / TotalDesigns * 100',
    unit: '%',
    targetValue: 100,
    currentValue: 98.5,
    trend: 'stable',
    owner: 'Elena Rostova (Engineering Lead)',
    status: 'On Track',
    priority: 'High',
    refreshFrequency: 'Real-time',
    createdDate: '2026-01-22T08:00:00Z',
    updatedDate: '2026-06-30T15:00:00Z',
    auditMetadata: { lastUpdatedBy: 'system', lastAudited: '2026-06-30T12:00:00Z', version: 104 }
  },
  // Packaging KPIs
  {
    kpiId: 'kpi-pkg-standards',
    name: 'Standards Testing Clearance',
    description: 'Percentage of packaging design portfolios clearing ASTM D6199 and ISTA 3A protocols',
    module: 'Packaging',
    category: 'Quality',
    formula: 'PassedDesigns / TestedDesigns * 100',
    unit: '%',
    targetValue: 98,
    currentValue: 96.2,
    trend: 'up',
    owner: 'Chief Packaging Engineer',
    status: 'On Track',
    priority: 'High',
    refreshFrequency: 'Weekly',
    createdDate: '2026-03-01T08:00:00Z',
    updatedDate: '2026-06-30T11:45:00Z',
    auditMetadata: { lastUpdatedBy: 'system', lastAudited: '2026-06-30T00:00:00Z', version: 56 }
  },
  // Logistics KPIs
  {
    kpiId: 'kpi-log-fillfactor',
    name: 'Container Volume Fill Factor',
    description: 'Average visual & volume capacity optimization percentage inside loaded containers',
    module: 'Logistics',
    category: 'Efficiency',
    formula: 'AVG(OccupiedVolume / AvailableVolume) * 100',
    unit: '%',
    targetValue: 88,
    currentValue: 81.4,
    trend: 'up',
    owner: 'Logistics Supervisor',
    status: 'At Risk',
    priority: 'Medium',
    refreshFrequency: 'Daily',
    createdDate: '2026-03-10T08:00:00Z',
    updatedDate: '2026-06-30T09:00:00Z',
    auditMetadata: { lastUpdatedBy: 'system', lastAudited: '2026-06-30T00:00:00Z', version: 112 }
  },
  // Returnables KPIs
  {
    kpiId: 'kpi-ret-rotations',
    name: 'Asset Fleet Active Rotation Rate',
    description: 'Percentage of returnable steel racks and kit carts in active circulation cycle',
    module: 'Returnables',
    category: 'Operational',
    formula: 'ActiveTransitAssets / TotalFleetSize * 100',
    unit: '%',
    targetValue: 75,
    currentValue: 78.3,
    trend: 'up',
    owner: 'Industrial Asset Lead',
    status: 'On Track',
    priority: 'High',
    refreshFrequency: 'Real-time',
    createdDate: '2026-05-15T08:00:00Z',
    updatedDate: '2026-06-30T17:00:00Z',
    auditMetadata: { lastUpdatedBy: 'system', lastAudited: '2026-06-30T16:00:00Z', version: 89 }
  },
  {
    kpiId: 'kpi-ret-scrap',
    name: 'Returnable Scrap & Asset Depreciation Ratio',
    description: 'Percentage of fleet assets retired or scrapped due to mechanical fatigue vs. restored',
    module: 'Returnables',
    category: 'Financial',
    formula: 'ScrappedAssets / TotalFleetSize * 100',
    unit: '%',
    targetValue: 2.0,
    currentValue: 1.4,
    trend: 'down',
    owner: 'Industrial Asset Lead',
    status: 'On Track',
    priority: 'Low',
    refreshFrequency: 'Monthly',
    createdDate: '2026-05-18T08:00:00Z',
    updatedDate: '2026-06-25T08:00:00Z',
    auditMetadata: { lastUpdatedBy: 'asset.tracker', lastAudited: '2026-06-25T00:00:00Z', version: 4 }
  },
  // Knowledge & Training Growth
  {
    kpiId: 'kpi-kms-growth',
    name: 'KMS Active Knowledge Bases',
    description: 'Cumulative total of approved standard operating procedures and technical design guides in KMS',
    module: 'KMS',
    category: 'Efficiency',
    formula: 'COUNT(KMSArticles)',
    unit: 'Articles',
    targetValue: 120,
    currentValue: 142,
    trend: 'up',
    owner: 'Training & KMS Lead',
    status: 'On Track',
    priority: 'Low',
    refreshFrequency: 'Monthly',
    createdDate: '2026-01-05T08:00:00Z',
    updatedDate: '2026-06-30T07:15:00Z',
    auditMetadata: { lastUpdatedBy: 'system', lastAudited: '2026-06-30T00:00:00Z', version: 20 }
  },
  // AI usage
  {
    kpiId: 'kpi-ai-automation',
    name: 'AI Agent Decision Automations',
    description: 'Total automated validation run evaluations and load placements calculated by server-side AI',
    module: 'AI',
    category: 'AI Usage',
    formula: 'COUNT(AIEvaluations)',
    unit: 'Runs',
    targetValue: 500,
    currentValue: 684,
    trend: 'up',
    owner: 'AI Systems Architect',
    status: 'On Track',
    priority: 'Medium',
    refreshFrequency: 'Hourly',
    createdDate: '2026-04-01T08:00:00Z',
    updatedDate: '2026-06-30T17:30:00Z',
    auditMetadata: { lastUpdatedBy: 'system', lastAudited: '2026-06-30T17:00:00Z', version: 412 }
  }
];

export const initialWidgets: Widget[] = [
  {
    widgetId: 'widget-exec-summary',
    title: 'Core Ecosystem Health Grid',
    type: 'Status',
    colSpan: 4,
    config: { colorScheme: 'slate' },
    sourceKpiIds: ['kpi-crm-pipeline', 'kpi-proj-delivery', 'kpi-ret-rotations', 'kpi-ai-automation']
  },
  {
    widgetId: 'widget-eng-kpi-trend',
    title: 'Engineering Stress & Revision Dynamics',
    type: 'Chart',
    colSpan: 2,
    config: { chartType: 'area', colorScheme: 'indigo', showGrid: true, dataKeys: ['currentValue', 'targetValue'] },
    sourceKpiIds: ['kpi-eng-rev-cycles', 'kpi-eng-fatigue-violations']
  },
  {
    widgetId: 'widget-pkg-log-ops',
    title: 'Packaging Standards vs Container Fill optimization',
    type: 'Progress',
    colSpan: 2,
    config: { colorScheme: 'cyan' },
    sourceKpiIds: ['kpi-pkg-standards', 'kpi-log-fillfactor']
  },
  {
    widgetId: 'widget-crm-growth',
    title: 'Enterprise Business pipeline analytics',
    type: 'Table',
    colSpan: 2,
    config: { colorScheme: 'amber' },
    sourceKpiIds: ['kpi-crm-pipeline', 'kpi-crm-conversion']
  },
  {
    widgetId: 'widget-returnables-lifespan',
    title: 'Returnables Structural Wear and Rotation Frequency',
    type: 'Heatmap',
    colSpan: 2,
    config: { colorScheme: 'teal' },
    sourceKpiIds: ['kpi-ret-rotations', 'kpi-ret-scrap']
  }
];

export const initialDashboards: Dashboard[] = [
  {
    dashboardId: 'db-executive-summary',
    dashboardName: 'Executive Steering & Decision Control',
    audience: 'Executives',
    department: 'C-Suite Operational Control',
    widgets: ['widget-exec-summary', 'widget-eng-kpi-trend', 'widget-pkg-log-ops', 'widget-crm-growth', 'widget-returnables-lifespan'],
    permissions: ['Executive', 'Manager'],
    workspace: 'global',
    favorite: true,
    version: 'v1.4'
  },
  {
    dashboardId: 'db-industrial-logistics',
    dashboardName: 'Logistics and Returnables Deployment Audit',
    audience: 'Department Heads',
    department: 'Industrial Supply Chain',
    widgets: ['widget-exec-summary', 'widget-returnables-lifespan', 'widget-pkg-log-ops'],
    permissions: ['Executive', 'Manager', 'Department Head'],
    workspace: 'engineering',
    favorite: false,
    version: 'v1.1'
  },
  {
    dashboardId: 'db-sales-milestones',
    dashboardName: 'Commercial CRM & Active Project Deliveries',
    audience: 'Managers',
    department: 'Business Operations',
    widgets: ['widget-crm-growth', 'widget-exec-summary'],
    permissions: ['Executive', 'Manager', 'Department Head'],
    workspace: 'business',
    favorite: false,
    version: 'v1.0'
  }
];

export const initialAnalytics: AnalyticsMetric[] = [
  {
    metricId: 'metric-crm-pipeline-val',
    name: 'Deal Velocity Ratio',
    sourceModule: 'CRM',
    aggregationType: 'RATIO',
    timeRange: '30d',
    workspace: 'business',
    filters: { 'stage': 'active' },
    currentValue: 1.45,
    historicalValues: [
      { date: '2026-06-25', value: 1.2 },
      { date: '2026-06-26', value: 1.25 },
      { date: '2026-06-27', value: 1.3 },
      { date: '2026-06-28', value: 1.32 },
      { date: '2026-06-29', value: 1.41 },
      { date: '2026-06-30', value: 1.45 }
    ]
  },
  {
    metricId: 'metric-pkg-material-factor',
    name: 'Average Structural Clearance Cycles',
    sourceModule: 'Packaging',
    aggregationType: 'AVG',
    timeRange: '90d',
    workspace: 'engineering',
    filters: { 'class': 'heavy-duty' },
    currentValue: 1240,
    historicalValues: [
      { date: '2026-06-25', value: 1100 },
      { date: '2026-06-26', value: 1120 },
      { date: '2026-06-27', value: 1150 },
      { date: '2026-06-28', value: 1190 },
      { date: '2026-06-29', value: 1210 },
      { date: '2026-06-30', value: 1240 }
    ]
  }
];

export const initialAuditLogs: DecisionAuditLog[] = [
  {
    logId: 'dal-1',
    timestamp: '2026-06-30T09:00:00Z',
    operator: 'Chief Executive Operator',
    role: 'Executive',
    action: 'Dashboard Shared',
    details: 'Steering Dashboard v1.4 shared with Industrial Packaging Lead.',
    ipAddress: '10.120.45.2'
  },
  {
    logId: 'dal-2',
    timestamp: '2026-06-30T14:15:00Z',
    operator: 'Sarah Connor',
    role: 'Manager',
    action: 'KPI Updated',
    details: 'Sales Pipeline Value updated. New currentValue set to 2,180,000 USD.',
    ipAddress: '192.168.1.104'
  }
];

export class DecisionRegistry implements IService {
  private static instance: DecisionRegistry;
  public serviceId = 'DecisionRegistry';

  private kpis: Map<string, KPI> = new Map();
  private dashboards: Map<string, Dashboard> = new Map();
  private widgets: Map<string, Widget> = new Map();
  private analytics: Map<string, AnalyticsMetric> = new Map();
  private auditLogs: DecisionAuditLog[] = [];

  private currentRole: DecisionRole = 'Executive';
  private currentDepartment: string = 'Executive Committee';

  private constructor() {
    this.loadState();
  }

  public static getInstance(): DecisionRegistry {
    if (!this.instance) {
      this.instance = new DecisionRegistry();
      try {
        serviceRegistry.register(this.instance);
      } catch (e) {
        console.warn('Could not register DecisionRegistry with Core Service Registry', e);
      }
    }
    return this.instance;
  }

  public async initialize(): Promise<void> {
    log.info('Initializing JNAS Executive Decision Intelligence Registry service');
  }

  public async shutdown(): Promise<void> {
    log.info('Decision Intelligence service shutting down');
    this.saveState();
  }

  private saveState(): void {
    try {
      localStorage.setItem('jnas-dec-kpis', JSON.stringify(Array.from(this.kpis.values())));
      localStorage.setItem('jnas-dec-dashboards', JSON.stringify(Array.from(this.dashboards.values())));
      localStorage.setItem('jnas-dec-widgets', JSON.stringify(Array.from(this.widgets.values())));
      localStorage.setItem('jnas-dec-analytics', JSON.stringify(Array.from(this.analytics.values())));
      localStorage.setItem('jnas-dec-audit-logs', JSON.stringify(this.auditLogs));
      localStorage.setItem('jnas-dec-role', this.currentRole);
      localStorage.setItem('jnas-dec-dept', this.currentDepartment);
    } catch (e) {
      log.error('Failed to save Decision state to localStorage', e);
    }
  }

  private loadState(): void {
    try {
      const storedKPIs = localStorage.getItem('jnas-dec-kpis');
      const storedDashboards = localStorage.getItem('jnas-dec-dashboards');
      const storedWidgets = localStorage.getItem('jnas-dec-widgets');
      const storedAnalytics = localStorage.getItem('jnas-dec-analytics');
      const storedAuditLogs = localStorage.getItem('jnas-dec-audit-logs');
      const storedRole = localStorage.getItem('jnas-dec-role');
      const storedDept = localStorage.getItem('jnas-dec-dept');

      if (storedKPIs) {
        const list: KPI[] = JSON.parse(storedKPIs);
        list.forEach((k) => this.kpis.set(k.kpiId, k));
      } else {
        initialKPIs.forEach((k) => this.kpis.set(k.kpiId, k));
      }

      if (storedDashboards) {
        const list: Dashboard[] = JSON.parse(storedDashboards);
        list.forEach((d) => this.dashboards.set(d.dashboardId, d));
      } else {
        initialDashboards.forEach((d) => this.dashboards.set(d.dashboardId, d));
      }

      if (storedWidgets) {
        const list: Widget[] = JSON.parse(storedWidgets);
        list.forEach((w) => this.widgets.set(w.widgetId, w));
      } else {
        initialWidgets.forEach((w) => this.widgets.set(w.widgetId, w));
      }

      if (storedAnalytics) {
        const list: AnalyticsMetric[] = JSON.parse(storedAnalytics);
        list.forEach((a) => this.analytics.set(a.metricId, a));
      } else {
        initialAnalytics.forEach((a) => this.analytics.set(a.metricId, a));
      }

      if (storedAuditLogs) {
        this.auditLogs = JSON.parse(storedAuditLogs);
      } else {
        this.auditLogs = [...initialAuditLogs];
      }

      if (storedRole) {
        this.currentRole = storedRole as DecisionRole;
      }
      if (storedDept) {
        this.currentDepartment = storedDept;
      }
    } catch (e) {
      log.error('Failed to load Decision state from localStorage, bootstrapping defaults', e);
      initialKPIs.forEach((k) => this.kpis.set(k.kpiId, k));
      initialDashboards.forEach((d) => this.dashboards.set(d.dashboardId, d));
      initialWidgets.forEach((w) => this.widgets.set(w.widgetId, w));
      initialAnalytics.forEach((a) => this.analytics.set(a.metricId, a));
      this.auditLogs = [...initialAuditLogs];
    }
  }

  // --- GETTERS & SETTERS ---
  public getRole(): DecisionRole {
    return this.currentRole;
  }

  public getDepartment(): string {
    return this.currentDepartment;
  }

  public setRoleAndDepartment(role: DecisionRole, dept: string): void {
    this.currentRole = role;
    this.currentDepartment = dept;
    this.saveState();
  }

  public getKPIs(): KPI[] {
    return Array.from(this.kpis.values());
  }

  public getKPI(id: string): KPI | undefined {
    return this.kpis.get(id);
  }

  public getDashboards(): Dashboard[] {
    return Array.from(this.dashboards.values());
  }

  public getDashboard(id: string): Dashboard | undefined {
    return this.dashboards.get(id);
  }

  public getWidgets(): Widget[] {
    return Array.from(this.widgets.values());
  }

  public getWidget(id: string): Widget | undefined {
    return this.widgets.get(id);
  }

  public getAnalytics(): AnalyticsMetric[] {
    return Array.from(this.analytics.values());
  }

  public getAuditLogs(): DecisionAuditLog[] {
    return this.auditLogs;
  }

  // --- ACTIONS ---
  public createDashboard(data: Omit<Dashboard, 'dashboardId' | 'version'>): Dashboard {
    const dashboardId = `db-${Math.random().toString(36).substring(2, 11)}`;
    const newDashboard: Dashboard = {
      ...data,
      dashboardId,
      version: 'v1.0'
    };
    this.dashboards.set(dashboardId, newDashboard);
    this.saveState();

    this.publishAuditLog(
      'Dashboard Created',
      `Dashboard "${newDashboard.dashboardName}" created targeting audience: ${newDashboard.audience}.`
    );

    eventBus.publish('jnas:decision:dashboard-created', { dashboard: newDashboard });
    return newDashboard;
  }

  public updateKPI(kpiId: string, value: number, operator: string): KPI | undefined {
    const kpi = this.kpis.get(kpiId);
    if (!kpi) return undefined;

    const previousValue = kpi.currentValue;
    kpi.currentValue = value;
    kpi.trend = value > previousValue ? 'up' : value < previousValue ? 'down' : 'stable';
    kpi.updatedDate = new Date().toISOString();
    kpi.auditMetadata.lastUpdatedBy = operator;
    kpi.auditMetadata.lastAudited = new Date().toISOString();
    kpi.auditMetadata.version += 1;

    this.kpis.set(kpiId, kpi);
    this.saveState();

    this.publishAuditLog(
      'KPI Updated',
      `KPI "${kpi.name}" value updated from ${previousValue} to ${value} ${kpi.unit}.`
    );

    eventBus.publish('jnas:decision:kpi-updated', { kpi });
    return kpi;
  }

  public addWidgetToDashboard(dashboardId: string, title: string, type: Widget['type'], sourceKpis: string[]): Widget {
    const widgetId = `widget-${Math.random().toString(36).substring(2, 11)}`;
    const newWidget: Widget = {
      widgetId,
      title,
      type,
      colSpan: type === 'Status' ? 4 : 2,
      config: {
        chartType: type === 'Chart' ? 'bar' : undefined,
        colorScheme: 'slate',
        showGrid: true
      },
      sourceKpiIds: sourceKpis
    };

    this.widgets.set(widgetId, newWidget);

    const db = this.dashboards.get(dashboardId);
    if (db) {
      db.widgets.push(widgetId);
      this.dashboards.set(dashboardId, db);
    }

    this.saveState();

    this.publishAuditLog(
      'Widget Added',
      `New widget "${title}" of type ${type} appended to dashboard Id: ${dashboardId}.`
    );

    eventBus.publish('jnas:decision:widget-added', { widget: newWidget, dashboardId });
    return newWidget;
  }

  public toggleFavorite(dashboardId: string): boolean {
    const db = this.dashboards.get(dashboardId);
    if (!db) return false;
    db.favorite = !db.favorite;
    this.dashboards.set(dashboardId, db);
    this.saveState();
    return db.favorite;
  }

  public shareDashboard(dashboardId: string, recipientRole: string): void {
    const db = this.dashboards.get(dashboardId);
    if (!db) return;

    if (!db.permissions.includes(recipientRole)) {
      db.permissions.push(recipientRole);
      this.dashboards.set(dashboardId, db);
      this.saveState();
    }

    this.publishAuditLog(
      'Dashboard Shared',
      `Dashboard "${db.dashboardName}" shared with permission level: ${recipientRole}.`
    );

    eventBus.publish('jnas:decision:dashboard-shared', { dashboardId, recipientRole });
  }

  public generateDecisionReport(dashboardId: string, operator: string): string {
    const db = this.dashboards.get(dashboardId);
    if (!db) return 'Dashboard not found';

    const reportId = `rep-${Math.random().toString(36).substring(2, 11)}`;
    this.publishAuditLog(
      'Report Generated',
      `Executive report generated for dashboard: "${db.dashboardName}" by ${operator}. Report code: ${reportId}.`
    );

    eventBus.publish('jnas:decision:report-generated', { reportId, dashboardId, operator });
    return reportId;
  }

  // --- SEARCH ENGINE ---
  public searchDecision(query: string): {
    dashboards: Dashboard[];
    kpis: KPI[];
    analytics: AnalyticsMetric[];
    widgets: Widget[];
  } {
    const cleanQuery = query.toLowerCase().trim();
    if (!cleanQuery) {
      return {
        dashboards: this.getDashboards(),
        kpis: this.getKPIs(),
        analytics: this.getAnalytics(),
        widgets: this.getWidgets()
      };
    }

    const matchedDashboards = Array.from(this.dashboards.values()).filter(
      (d) =>
        d.dashboardName.toLowerCase().includes(cleanQuery) ||
        d.department.toLowerCase().includes(cleanQuery) ||
        d.audience.toLowerCase().includes(cleanQuery)
    );

    const matchedKPIs = Array.from(this.kpis.values()).filter(
      (k) =>
        k.name.toLowerCase().includes(cleanQuery) ||
        k.description.toLowerCase().includes(cleanQuery) ||
        k.module.toLowerCase().includes(cleanQuery) ||
        k.category.toLowerCase().includes(cleanQuery)
    );

    const matchedAnalytics = Array.from(this.analytics.values()).filter(
      (a) =>
        a.name.toLowerCase().includes(cleanQuery) ||
        a.sourceModule.toLowerCase().includes(cleanQuery) ||
        a.aggregationType.toLowerCase().includes(cleanQuery)
    );

    const matchedWidgets = Array.from(this.widgets.values()).filter(
      (w) =>
        w.title.toLowerCase().includes(cleanQuery) ||
        w.type.toLowerCase().includes(cleanQuery)
    );

    return {
      dashboards: matchedDashboards,
      kpis: matchedKPIs,
      analytics: matchedAnalytics,
      widgets: matchedWidgets
    };
  }

  // --- PRIVATE UTILS ---
  private publishAuditLog(action: DecisionAuditLog['action'], details: string): void {
    const logId = `dal-${Date.now()}`;
    const newLog: DecisionAuditLog = {
      logId,
      timestamp: new Date().toISOString(),
      operator: this.currentRole === 'Executive' ? 'Chief Executive Operator' : `Operator (${this.currentRole})`,
      role: this.currentRole,
      action,
      details,
      ipAddress: '10.120.45.2'
    };

    this.auditLogs.unshift(newLog);
    if (this.auditLogs.length > 100) {
      this.auditLogs.pop();
    }
    this.saveState();
  }
}

export const decisionRegistry = DecisionRegistry.getInstance();

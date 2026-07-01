export interface KPI {
  kpiId: string;
  name: string;
  description: string;
  module: 'CRM' | 'Projects' | 'Engineering' | 'Packaging' | 'LMS' | 'KMS' | 'Logistics' | 'Returnables' | 'System' | 'AI';
  category: 'Growth' | 'Operational' | 'Quality' | 'Financial' | 'Efficiency' | 'AI Usage' | 'Workflow';
  formula: string;
  unit: string;
  targetValue: number;
  currentValue: number;
  trend: 'up' | 'down' | 'stable';
  owner: string;
  status: 'On Track' | 'At Risk' | 'Critical' | 'Pending';
  priority: 'High' | 'Medium' | 'Low';
  refreshFrequency: 'Real-time' | 'Hourly' | 'Daily' | 'Weekly' | 'Monthly';
  createdDate: string;
  updatedDate: string;
  auditMetadata: {
    lastUpdatedBy: string;
    lastAudited: string;
    version: number;
  };
}

export interface Dashboard {
  dashboardId: string;
  dashboardName: string;
  audience: 'Executives' | 'Managers' | 'Engineers' | 'Department Heads';
  department: string;
  widgets: string[]; // List of Widget IDs
  permissions: string[]; // Allowed roles: e.g. ['Executive', 'Manager', 'Engineer']
  workspace: 'personal' | 'engineering' | 'learning' | 'business' | 'admin' | 'global';
  favorite: boolean;
  version: string;
}

export interface AnalyticsMetric {
  metricId: string;
  name: string;
  sourceModule: string;
  aggregationType: 'SUM' | 'AVG' | 'COUNT' | 'MIN' | 'MAX' | 'RATIO';
  timeRange: '24h' | '7d' | '30d' | '90d' | 'YTD' | 'All';
  workspace: string;
  filters: Record<string, string>;
  currentValue: number;
  historicalValues: { date: string; value: number }[];
  predictiveValuePlaceholder?: number;
}

export interface Widget {
  widgetId: string;
  title: string;
  type: 'Card' | 'Table' | 'Chart' | 'Heatmap' | 'Timeline' | 'Progress' | 'Status';
  colSpan: 1 | 2 | 3 | 4;
  config: {
    chartType?: 'bar' | 'line' | 'area' | 'pie' | 'radar';
    colorScheme?: string;
    showGrid?: boolean;
    dataKeys?: string[];
  };
  sourceKpiIds: string[];
}

export interface DecisionAuditLog {
  logId: string;
  timestamp: string;
  operator: string;
  role: string;
  action: string; // 'Dashboard Created' | 'KPI Updated' | 'Widget Added' | 'Dashboard Shared' | 'Report Generated'
  details: string;
  ipAddress: string;
}

export type DecisionRole = 'Executive' | 'Manager' | 'Engineer' | 'Department Head';

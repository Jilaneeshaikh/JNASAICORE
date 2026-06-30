// JNAS AI Core - Design System Shared Types & Schemas

export type DSVariant = 'primary' | 'secondary' | 'tertiary' | 'outline' | 'ghost' | 'danger' | 'accent';
export type DSSize = 'sm' | 'md' | 'lg' | 'xl';
export type DSTitleFont = 'display' | 'sans' | 'mono';

export interface DSComponentMeta {
  id: string;
  name: string;
  description: string;
  specs: string[];
  contrastRatio: string;
  responsiveReady: boolean;
  codeSnippet: string;
}

export type DSApprovalState = 'draft' | 'under_review' | 'approved';

export interface DSComponentGroup {
  id: string;
  name: string;
  icon: string; // lucide icon name
  description: string;
  components: DSComponentMeta[];
  approvalState: DSApprovalState;
  approvedBy?: string;
  approvedAt?: string;
  reviewNotes?: string;
}

export interface DSTokenColor {
  name: string;
  hex: string;
  variable: string;
  usage: string;
}

export interface DSTokenFont {
  name: string;
  family: string;
  variable: string;
  usage: string;
}

export interface DSTokenSpacing {
  name: string;
  value: string;
  variable: string;
}

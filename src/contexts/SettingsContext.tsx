import { createContext, useContext } from 'react';

export type AgentSchedulingType = 'agent-executor' | 'gatekeeper';
export type WorkspaceType = 'personal' | 'engineering' | 'learning' | 'business' | 'admin';

export interface WorkspaceSettings {
  compactMode: boolean;
  sidebarCollapsed: boolean;
  schemaAutoHealing: boolean;
  agentScheduling: AgentSchedulingType;
  activeWorkspace: WorkspaceType;
}

export interface SettingsContextType {
  settings: WorkspaceSettings;
  updateSetting: <K extends keyof WorkspaceSettings>(key: K, value: WorkspaceSettings[K]) => void;
  resetSettings: () => void;
}

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

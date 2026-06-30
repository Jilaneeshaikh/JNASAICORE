import React, { useState, useEffect } from 'react';
import { SettingsContext, WorkspaceSettings } from '../contexts/SettingsContext';

const DEFAULT_SETTINGS: WorkspaceSettings = {
  compactMode: false,
  sidebarCollapsed: false,
  schemaAutoHealing: true,
  agentScheduling: 'agent-executor',
  activeWorkspace: 'personal',
};

interface SettingsProviderProps {
  children: React.ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<WorkspaceSettings>(() => {
    try {
      const saved = localStorage.getItem('jnas-settings');
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Failed to load settings from localStorage', e);
    }
    return DEFAULT_SETTINGS;
  });

  const updateSetting = <K extends keyof WorkspaceSettings>(key: K, value: WorkspaceSettings[K]) => {
    setSettings((prev) => {
      const updated = { ...prev, [key]: value };
      localStorage.setItem('jnas-settings', JSON.stringify(updated));
      return updated;
    });
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.setItem('jnas-settings', JSON.stringify(DEFAULT_SETTINGS));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

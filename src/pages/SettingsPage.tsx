import React from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useNotification } from '../contexts/NotificationContext';
import { DSCard, DSCardHeader, DSCardContent, DSCardFooter, DSCardTitle, DSCardSubtitle } from '../components/design-system/DSCard';
import { DSButton } from '../components/design-system/DSButton';
import { DSSwitch, DSRadioGroup } from '../components/design-system/DSForm';
import { Sliders, RefreshCw, Trash2 } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { settings, updateSetting, resetSettings } = useSettings();
  const { triggerToast } = useNotification();

  const handleReset = () => {
    resetSettings();
    triggerToast('warning', 'Platform parameters rolled back to initial configurations.');
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-900 pb-5">
        <h1 className="text-xl font-bold tracking-tight text-slate-100 font-sans">
          Platform System Parameters
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure administrative settings, local styling tokens, and synthetic task execution parameters.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Visual Settings */}
        <DSCard variant="bordered" className="md:col-span-2">
          <DSCardHeader>
            <DSCardTitle className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>User Interface Preferences</span>
            </DSCardTitle>
          </DSCardHeader>
          <DSCardContent className="space-y-6 p-5">
            <DSSwitch
              checked={settings.compactMode}
              onChange={(val) => {
                updateSetting('compactMode', val);
                triggerToast('success', `High-density layout set to: ${val ? 'ON' : 'OFF'}`);
              }}
              label="High-Density Space Guttering"
              description="Reduces outer padding limits to display more text telemetry on smaller monitors"
            />

            <div className="border-t border-slate-900 pt-6">
              <DSSwitch
                checked={settings.schemaAutoHealing}
                onChange={(val) => {
                  updateSetting('schemaAutoHealing', val);
                  triggerToast('info', `Self-healing triggers: ${val ? 'ENGAGED' : 'SUSPENDED'}`);
                }}
                label="Dynamic Database Schema Recovery"
                description="Prompts background workers to correct index and table mappings on exception triggers"
              />
            </div>
          </DSCardContent>
        </DSCard>

        {/* Task scheduling mode */}
        <DSCard variant="bordered" className="flex flex-col justify-between">
          <DSCardHeader>
            <div className="flex flex-col">
              <DSCardTitle>Agent Scheduler Mode</DSCardTitle>
              <DSCardSubtitle>Map runtime safety permission gates</DSCardSubtitle>
            </div>
          </DSCardHeader>
          <DSCardContent className="p-5">
            <DSRadioGroup
              label="Pipeline Permission Level"
              value={settings.agentScheduling}
              onChange={(val) => {
                updateSetting('agentScheduling', val as any);
                triggerToast('success', `Agent Scheduling updated to: ${val === 'agent-executor' ? 'Autonomous' : 'Gatekeeper'}`);
              }}
              options={[
                {
                  value: 'agent-executor',
                  label: 'Autonomous Executor',
                  description: 'AI model triggers workspace tool pipelines automatically without human gate confirmation.'
                },
                {
                  value: 'gatekeeper',
                  label: 'Human-in-the-Loop Gatekeeper',
                  description: 'Halts operations and prompts administrator validation before writing database mutations.'
                }
              ]}
            />
          </DSCardContent>
          <DSCardFooter className="bg-slate-950/20">
            <span className="text-[10px] text-slate-500 font-mono">
              Persisted: {settings.agentScheduling.toUpperCase()}
            </span>
          </DSCardFooter>
        </DSCard>
      </div>

      {/* Danger Zone / Reset */}
      <DSCard variant="bordered" className="border-red-900/30">
        <DSCardHeader className="bg-red-950/5">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-red-200">Reset Platform Configurations</span>
            <span className="text-[10px] text-slate-500 font-mono mt-0.5">DANGER_ZONE</span>
          </div>
        </DSCardHeader>
        <DSCardContent className="text-xs text-slate-400">
          Rolling back settings returns visual grids, layout densities, and security schedules back to factory standards. Any local cookie caches will be flushed immediately.
        </DSCardContent>
        <div className="px-5 py-4 border-t border-slate-900 bg-red-950/5 flex justify-end">
          <DSButton
            variant="danger"
            size="sm"
            onClick={handleReset}
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
          >
            Reset Settings to Defaults
          </DSButton>
        </div>
      </DSCard>
    </div>
  );
};

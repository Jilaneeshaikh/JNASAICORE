import React, { useState, useRef } from 'react';
import { 
  Sliders, 
  Settings2, 
  Lock, 
  Eye, 
  X, 
  Download, 
  Upload, 
  Check, 
  Sparkles, 
  HelpCircle,
  Sun,
  Moon,
  ToggleLeft,
  ToggleRight,
  RefreshCw
} from 'lucide-react';
import { ChatSettings } from '../../types/chat';
import { useNotification } from '../../contexts/NotificationContext';

export interface ChatSettingsDialogProps {
  settings: ChatSettings;
  onUpdateSettings: (updated: Partial<ChatSettings>) => void;
  onClose: () => void;
  onExport: () => void;
  onImport: (importedData: any) => void;
}

export const ChatSettingsDialog: React.FC<ChatSettingsDialogProps> = ({
  settings,
  onUpdateSettings,
  onClose,
  onExport,
  onImport
}) => {
  const { triggerToast } = useNotification();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Available mockup providers list
  const providers = [
    'Gemini 2.5 Flash (Standard Hub)',
    'Gemini 2.5 Pro (Ultra-Context)',
    'OpenAI GPT-4o (Proxy Agent)',
    'Anthropic Claude 3.5 Sonnet (Draft Core)',
    'Ollama Llama 3 (Local Core Pipeline)',
    'DeepSeek R1 (Reasoning Node)'
  ];

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        onImport(json);
        triggerToast('success', 'Successfully imported external backup configuration thread!');
      } catch (err) {
        triggerToast('error', 'Critical import failure: Selected file is not a valid JNAS chat archive JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="bg-slate-950 border border-slate-900 rounded-sm p-5 space-y-5 font-sans text-xs shadow-2xl relative">
      {/* 1. Header Row */}
      <div className="flex items-center justify-between border-b border-slate-900 pb-3">
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-cyan-400 animate-pulse" />
          <h4 className="text-sm font-bold text-slate-200">AI Framework Global Parameters</h4>
        </div>
        <button
          onClick={onClose}
          className="text-slate-500 hover:text-slate-200 cursor-pointer p-1 rounded"
          title="Close Settings Panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left Column: LLM Parameters */}
        <div className="space-y-4">
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block border-b border-slate-900/40 pb-1">
            Engine & Creativity Parameters
          </span>

          {/* Provider Selection */}
          <div className="space-y-1.5">
            <label className="text-slate-400 font-semibold font-mono text-[10px] uppercase">Default AI Provider</label>
            <select
              value={settings.defaultProvider}
              onChange={(e) => onUpdateSettings({ defaultProvider: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-sm py-2 px-3 text-slate-200 text-xs focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
            >
              {providers.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Temperature slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-slate-400 font-semibold font-mono text-[10px] uppercase">
              <span>Temperature (Entropy)</span>
              <span className="text-cyan-400 font-bold">{settings.temperature}</span>
            </div>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={settings.temperature}
              onChange={(e) => onUpdateSettings({ temperature: parseFloat(e.target.value) })}
              className="w-full accent-cyan-500 bg-slate-900 rounded-lg cursor-pointer h-1.5"
            />
            <div className="flex justify-between text-[9px] font-mono text-slate-600">
              <span>Deterministic (0.0)</span>
              <span>Highly Creative (2.0)</span>
            </div>
          </div>

          {/* Max Tokens parameter */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-slate-400 font-semibold font-mono text-[10px] uppercase">
              <span>Max Response Output Tokens</span>
              <span className="text-cyan-400 font-bold">{settings.maxTokens}</span>
            </div>
            <input
              type="number"
              min="1"
              max="32000"
              value={settings.maxTokens}
              onChange={(e) => onUpdateSettings({ maxTokens: parseInt(e.target.value) || 2048 })}
              className="w-full bg-slate-900 border border-slate-800 rounded-sm py-1.5 px-3 text-slate-200 text-xs focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
            />
          </div>

          {/* Safety Settings */}
          <div className="space-y-1.5">
            <label className="text-slate-400 font-semibold font-mono text-[10px] uppercase">Gateway Safety Filter Threshold</label>
            <select
              value={settings.safetyLevel}
              onChange={(e) => onUpdateSettings({ safetyLevel: e.target.value as any })}
              className="w-full bg-slate-900 border border-slate-800 rounded-sm py-2 px-3 text-slate-200 text-xs focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
            >
              <option value="none">Block None (Unrestricted)</option>
              <option value="block_low_above">Block Low & Above (Strict)</option>
              <option value="block_medium_above">Block Medium & Above (Standard)</option>
              <option value="block_high_above">Block High Only (Lenient)</option>
            </select>
          </div>

          {/* Response Style selection */}
          <div className="space-y-1.5">
            <label className="text-slate-400 font-semibold font-mono text-[10px] uppercase">Response Verbosity Style</label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['concise', 'balanced', 'detailed', 'creative'] as const).map((style) => (
                <button
                  key={style}
                  onClick={() => onUpdateSettings({ responseStyle: style })}
                  className={`py-1.5 rounded-sm border font-mono text-[9px] font-bold uppercase cursor-pointer transition-colors ${settings.responseStyle === style ? 'text-cyan-400 bg-cyan-950/10 border-cyan-900/40' : 'bg-slate-900 border-slate-850 text-slate-500 hover:text-slate-300'}`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Platform Configuration & Backups */}
        <div className="space-y-4">
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block border-b border-slate-900/40 pb-1">
            System Preferences & Logs
          </span>

          {/* Streaming Toggle Switch */}
          <div className="p-3 border border-slate-900 bg-slate-950/60 rounded-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <div className="flex flex-col">
                <span className="font-bold text-slate-200 font-mono text-[10px] uppercase">Token Streaming</span>
                <span className="text-[9px] text-slate-500 font-mono">Stream chunks incrementally over SSE connection</span>
              </div>
            </div>
            <button
              onClick={() => onUpdateSettings({ streaming: !settings.streaming })}
              className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              {settings.streaming ? (
                <ToggleRight className="w-6 h-6 text-cyan-400" />
              ) : (
                <ToggleLeft className="w-6 h-6 text-slate-600" />
              )}
            </button>
          </div>

          {/* Retry Count & Timeout Limits */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-slate-400 font-semibold font-mono text-[10px] uppercase">Gateway Retry Count</label>
              <input
                type="number"
                min="0"
                max="10"
                value={settings.retryCount}
                onChange={(e) => onUpdateSettings({ retryCount: parseInt(e.target.value) || 0 })}
                className="w-full bg-slate-900 border border-slate-800 rounded-sm py-1.5 px-3 text-slate-200 text-xs focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-slate-400 font-semibold font-mono text-[10px] uppercase">Timeout (ms)</label>
              <input
                type="number"
                min="1000"
                max="120000"
                step="1000"
                value={settings.timeout}
                onChange={(e) => onUpdateSettings({ timeout: parseInt(e.target.value) || 30000 })}
                className="w-full bg-slate-900 border border-slate-800 rounded-sm py-1.5 px-3 text-slate-200 text-xs focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
              />
            </div>
          </div>

          {/* Theme selection */}
          <div className="space-y-1.5">
            <label className="text-slate-400 font-semibold font-mono text-[10px] uppercase">Visual Skin Theme</label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['system', 'dark', 'light'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => onUpdateSettings({ theme: t })}
                  className={`py-1.5 rounded-sm border font-mono text-[9px] font-bold uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${settings.theme === t ? 'text-cyan-400 bg-cyan-950/10 border-cyan-900/40' : 'bg-slate-900 border-slate-850 text-slate-500 hover:text-slate-300'}`}
                >
                  {t === 'light' ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
                  <span>{t}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Privacy Lock Toggle */}
          <div className="p-3 border border-slate-900 bg-slate-950/60 rounded-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-rose-500" />
              <div className="flex flex-col">
                <span className="font-bold text-slate-200 font-mono text-[10px] uppercase">Local Confidentiality Mode</span>
                <span className="text-[9px] text-slate-500 font-mono">Bypasses global sync; stores logs offline</span>
              </div>
            </div>
            <button
              onClick={() => onUpdateSettings({ privacyMode: !settings.privacyMode })}
              className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              {settings.privacyMode ? (
                <ToggleRight className="w-6 h-6 text-cyan-400" />
              ) : (
                <ToggleLeft className="w-6 h-6 text-slate-600" />
              )}
            </button>
          </div>

          {/* Backup Import/Export */}
          <div className="space-y-2">
            <label className="text-slate-400 font-semibold font-mono text-[10px] uppercase">Configuration Serialization</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onExport}
                className="flex items-center justify-center gap-1.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-850 hover:border-slate-700 rounded-sm font-semibold cursor-pointer transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON Backup</span>
              </button>

              <button
                onClick={handleImportClick}
                className="flex items-center justify-center gap-1.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-850 hover:border-slate-700 rounded-sm font-semibold cursor-pointer transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Import JSON Backup</span>
              </button>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Helper Legend Info */}
      <div className="border-t border-slate-900 pt-4 font-mono text-[10px] text-slate-500 flex items-center justify-between">
        <span>Framework version: CORE-AI-v4.1</span>
        <span>Settings serialized automatically to client localStorage.</span>
      </div>
    </div>
  );
};

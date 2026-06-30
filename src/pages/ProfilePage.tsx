import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { DSCard, DSCardHeader, DSCardContent, DSCardFooter, DSCardTitle, DSCardSubtitle } from '../components/design-system/DSCard';
import { DSButton } from '../components/design-system/DSButton';
import { DSInput } from '../components/design-system/DSForm';
import { DSBadge } from '../components/design-system/DSStatus';
import { User, Shield, KeyRound, Save } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile, logout } = useAuth();
  const { triggerToast } = useNotification();
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatarUrl || '');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      triggerToast('error', 'Operator name cannot be left empty.');
      return;
    }
    updateProfile(name, avatar);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-900 pb-5">
        <h1 className="text-xl font-bold tracking-tight text-slate-100 font-sans">
          Operator Profile Parameters
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Review administrative keys, role bindings, and credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card Form */}
        <DSCard variant="bordered" className="md:col-span-2">
          <DSCardHeader>
            <div className="flex flex-col">
              <DSCardTitle>Operator Metadata</DSCardTitle>
              <DSCardSubtitle>Modify active profile tags</DSCardSubtitle>
            </div>
          </DSCardHeader>
          <form onSubmit={handleSave}>
            <DSCardContent className="space-y-5 p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DSInput
                  label="Display Identity"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter full name..."
                  required
                />
                <DSInput
                  label="Email (Static Key)"
                  value={user?.email || ''}
                  disabled
                  placeholder="operator@jnas-core.internal..."
                />
              </div>

              <DSInput
                label="Custom Avatar URL"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://images.unsplash.com/..."
              />
            </DSCardContent>
            <DSCardFooter className="bg-slate-950/20 flex justify-between">
              <DSButton
                type="button"
                variant="ghost"
                className="text-red-400 hover:text-red-300 hover:bg-red-950/20"
                onClick={logout}
              >
                Revoke Credentials (Logout)
              </DSButton>
              <DSButton
                type="submit"
                variant="primary"
                leftIcon={<Save className="w-3.5 h-3.5 text-slate-950" />}
              >
                Save Changes
              </DSButton>
            </DSCardFooter>
          </form>
        </DSCard>

        {/* Permissions & Scopes Summary */}
        <DSCard variant="bordered" className="flex flex-col justify-between">
          <DSCardHeader>
            <div className="flex flex-col">
              <DSCardTitle>Security Scopes</DSCardTitle>
              <DSCardSubtitle>Administrative clearance ratings</DSCardSubtitle>
            </div>
          </DSCardHeader>
          <DSCardContent className="p-5 space-y-4">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-500">Security Clearance</span>
              <DSBadge variant="solid" color="rose">
                {user?.role || 'Operator'}
              </DSBadge>
            </div>
            
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-500">Active Node Session</span>
              <span className="text-emerald-400 font-bold">Authorized</span>
            </div>

            <div className="border-t border-slate-900 pt-4 space-y-2 text-xs text-slate-400">
              <span className="text-[10px] font-mono text-slate-500 uppercase block">Assigned Scopes</span>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded text-[9px] font-mono">workspace:write</span>
                <span className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded text-[9px] font-mono">schemas:heal</span>
                <span className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded text-[9px] font-mono">telemetry:inspect</span>
              </div>
            </div>
          </DSCardContent>
          <DSCardFooter className="bg-slate-950/20 text-[10px] font-mono text-slate-500">
            Last logged in: {user?.lastLogin || 'N/A'}
          </DSCardFooter>
        </DSCard>
      </div>
    </div>
  );
};

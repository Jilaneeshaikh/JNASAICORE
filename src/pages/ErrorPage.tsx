import React, { useState } from 'react';
import { DSCard, DSCardHeader, DSCardContent, DSCardFooter, DSCardTitle, DSCardSubtitle } from '../components/design-system/DSCard';
import { DSButton } from '../components/design-system/DSButton';
import { DSBadge } from '../components/design-system/DSStatus';
import { useNotification } from '../contexts/NotificationContext';
import { AlertCircle, WifiOff, FileX, RefreshCw, ServerCrash } from 'lucide-react';

interface ErrorPageProps {
  type?: '404' | '500' | 'offline';
  onNavigateHome?: () => void;
}

export const ErrorPage: React.FC<ErrorPageProps> = ({ type: initialType = '404', onNavigateHome }) => {
  const { triggerToast } = useNotification();
  const [errorType, setErrorType] = useState<'404' | '500' | 'offline'>(initialType);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    triggerToast('info', 'Re-transmitting synchronization pings...');
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsRetrying(false);
    triggerToast('success', 'Connection established. Active routing nodes recovered.');
    if (onNavigateHome) onNavigateHome();
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher to let developers test all standard error layouts */}
      <div className="flex items-center justify-between border-b border-slate-900 pb-4">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-sm font-mono uppercase tracking-widest text-slate-400 font-semibold">
            Exception Simulators
          </h2>
          <p className="text-[10px] text-slate-500 font-mono">Select a state to audit compliance rendering</p>
        </div>

        <div className="flex gap-2">
          {(['404', '500', 'offline'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setErrorType(t)}
              className={`px-3 py-1 text-xs font-mono border rounded-sm uppercase cursor-pointer transition-colors ${
                errorType === t
                  ? 'border-cyan-500 bg-cyan-950/10 text-cyan-400 font-bold'
                  : 'border-slate-800 text-slate-500 hover:text-slate-300'
              }`}
            >
              {t === 'offline' ? 'Offline (Retry)' : `${t} Page`}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-[350px] flex items-center justify-center p-6">
        {errorType === '404' && (
          <div className="text-center space-y-5 max-w-md">
            <div className="inline-flex p-4 bg-slate-900 border border-slate-800 rounded-sm text-slate-400">
              <FileX className="w-10 h-10" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-center gap-2">
                <h3 className="text-lg font-bold text-slate-200">PAGE_NOT_INDEXED</h3>
                <DSBadge variant="outline" color="rose">404 ERROR</DSBadge>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                The requested URL path does not map to any active enterprise workspace routes. Verify router bindings in the shell gateway.
              </p>
            </div>
            {onNavigateHome && (
              <DSButton variant="outline" size="sm" onClick={onNavigateHome}>
                Return to Dashboard
              </DSButton>
            )}
          </div>
        )}

        {errorType === '500' && (
          <div className="text-center space-y-5 max-w-md">
            <div className="inline-flex p-4 bg-rose-950/20 border border-rose-900/30 text-rose-400">
              <ServerCrash className="w-10 h-10 animate-pulse" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-center gap-2">
                <h3 className="text-lg font-bold text-slate-200">HEAP_CORRUPTION_FATAL</h3>
                <DSBadge variant="outline" color="rose">500 EXCEPTION</DSBadge>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Uncaught buffer memory leak detected on background tooling dispatcher thread. Active runtime session suspended for security purposes.
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <DSButton variant="outline" size="sm" onClick={handleRetry} loading={isRetrying}>
                Reboot Thread
              </DSButton>
              {onNavigateHome && (
                <DSButton variant="tertiary" size="sm" onClick={onNavigateHome}>
                  Return to Dashboard
                </DSButton>
              )}
            </div>
          </div>
        )}

        {errorType === 'offline' && (
          <div className="text-center space-y-5 max-w-md">
            <div className="inline-flex p-4 bg-amber-950/20 border border-amber-900/30 text-amber-400">
              <WifiOff className="w-10 h-10" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-center gap-2">
                <h3 className="text-lg font-bold text-slate-200">CONNECTION_TIMEOUT</h3>
                <DSBadge variant="outline" color="amber">STATUS_OFFLINE</DSBadge>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Platform cannot communicate with cloud run cluster ingress nodes. Re-transmitting requests at exponential offsets.
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <DSButton
                variant="primary"
                size="sm"
                onClick={handleRetry}
                loading={isRetrying}
                leftIcon={<RefreshCw className="w-3.5 h-3.5 text-slate-950" />}
              >
                Retry Handshake
              </DSButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

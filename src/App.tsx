import { useState, useEffect } from 'react';
import { ErrorBoundary } from './providers/ErrorBoundary';
import { ThemeProvider } from './providers/ThemeProvider';
import { NotificationProvider } from './providers/NotificationProvider';
import { SettingsProvider } from './providers/SettingsProvider';
import { AuthProvider } from './providers/AuthProvider';
import { useAuth } from './contexts/AuthContext';
import { useNotification } from './contexts/NotificationContext';
import { useSettings } from './contexts/SettingsContext';
import { useRouter, Route } from './hooks/useRouter';
import { AppShell } from './layouts/AppShell';

// Pages
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { AICorePage } from './pages/AICorePage';
import { ProjectsPage } from './pages/ProjectsPage';
import { CRMPage } from './pages/CRMPage';
import { LMSPage } from './pages/LMSPage';
import { KMSPage } from './pages/KMSPage';
import { EngineeringPage } from './pages/EngineeringPage';
import { PackagingPage } from './pages/PackagingPage';
import { AdminPage } from './pages/AdminPage';
import { SettingsPage } from './pages/SettingsPage';
import { ProfilePage } from './pages/ProfilePage';
import { ErrorPage } from './pages/ErrorPage';

// Import Custom Design System Components for Sandbox Route
import { Sparkles, Layers, Cpu, LayoutGrid, FileCode, Copy, ChevronRight, Sliders, Bell, Shield, MousePointer } from 'lucide-react';
import { DSButton } from './components/design-system/DSButton';
import { DSCard, DSCardHeader, DSCardContent, DSCardFooter, DSCardTitle, DSCardSubtitle } from './components/design-system/DSCard';
import { DSInput, DSTextarea, DSSelect, DSSwitch, DSCheckbox, DSRadioGroup } from './components/design-system/DSForm';
import { DSModal, DSDrawer, DSToastItem } from './components/design-system/DSDialog';
import { DSTable } from './components/design-system/DSTable';
import { DSSparkline, DSBarChart, DSAreaChart, DSActivityHeatmap, DSProgressCircle } from './components/design-system/DSChart';
import { DSAlert, DSBadge, DSSkeleton, DSEmptyState, DSCrashFallback } from './components/design-system/DSStatus';
import { DSBreadcrumbs, DSTabs } from './components/design-system/DSNavigation';
import { DSComponentGroup, DSApprovalState } from './types';

function PlatformGateway() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { route, navigate } = useRouter('dashboard');
  const { settings } = useSettings();
  const { triggerToast } = useNotification();

  // Redirect unauthenticated operators to authorization nodes
  useEffect(() => {
    if (!isLoading) {
      const isAuthRoute = route === 'login' || route === 'register' || route === 'forgot-password';
      if (!isAuthenticated && !isAuthRoute) {
        navigate('login');
      } else if (isAuthenticated && isAuthRoute) {
        navigate('dashboard');
      }
    }
  }, [isAuthenticated, route, navigate, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0C12] text-slate-100 flex flex-col items-center justify-center p-6 space-y-4 font-mono text-xs">
        <div className="p-2 bg-cyan-500 text-slate-950 rounded-sm animate-spin">
          <Cpu className="w-5 h-5" />
        </div>
        <span className="text-cyan-400 tracking-widest animate-pulse">SYNCHRONIZING SECURE TUNNELS...</span>
      </div>
    );
  }

  // Gateway route handlers for splash authentication pages
  if (route === 'login' || route === 'register' || route === 'forgot-password') {
    return <LoginPage onNavigate={navigate} view={route as any} />;
  }

  // Standard Page Router switch
  const renderActivePage = () => {
    switch (route) {
      case 'dashboard':
        return <DashboardPage />;
      case 'ai-core':
        return <AICorePage />;
      case 'projects':
        return <ProjectsPage />;
      case 'crm':
        return <CRMPage />;
      case 'lms':
        return <LMSPage />;
      case 'kms':
        return <KMSPage />;
      case 'engineering':
        return <EngineeringPage />;
      case 'packaging':
        return <PackagingPage />;
      case 'admin':
        return <AdminPage />;
      case 'settings':
        return <SettingsPage />;
      case 'profile':
        return <ProfilePage />;
      case '404':
      case '500':
      case 'offline':
        return <ErrorPage type={route as any} onNavigateHome={() => navigate('dashboard')} />;
      default:
        return <ErrorPage type="404" onNavigateHome={() => navigate('dashboard')} />;
    }
  };

  return (
    <AppShell currentRoute={route} onNavigate={navigate}>
      {renderActivePage()}
    </AppShell>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <NotificationProvider>
          <SettingsProvider>
            <AuthProvider>
              <PlatformGateway />
            </AuthProvider>
          </SettingsProvider>
        </NotificationProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

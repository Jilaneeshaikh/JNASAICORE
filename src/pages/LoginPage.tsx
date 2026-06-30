import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { DSButton } from '../components/design-system/DSButton';
import { DSCard, DSCardHeader, DSCardContent, DSCardFooter, DSCardTitle, DSCardSubtitle } from '../components/design-system/DSCard';
import { DSInput } from '../components/design-system/DSForm';
import { Cpu, ShieldCheck, Mail, Lock, User, KeyRound } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (route: 'login' | 'register' | 'forgot-password' | 'dashboard') => void;
  view: 'login' | 'register' | 'forgot-password';
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate, view }) => {
  const { login, register, forgotPassword, isLoading } = useAuth();
  
  // Login fields
  const [loginEmail, setLoginEmail] = useState('admin@jnas-core.internal');
  const [loginPassword, setLoginPassword] = useState('kernel_auth_2026');

  // Register fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');

  // Forgot password fields
  const [forgotEmail, setForgotEmail] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return;
    const success = await login(loginEmail, loginPassword);
    if (success) {
      onNavigate('dashboard');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail) return;
    const success = await register(regName, regEmail);
    if (success) {
      onNavigate('dashboard');
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    const success = await forgotPassword(forgotEmail);
    if (success) {
      onNavigate('login');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0C12] text-slate-100 flex items-center justify-center p-6 relative cyber-grid">
      {/* Decorative Blur Background Accent */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-cyan-500 text-slate-950 rounded-sm font-bold shadow-lg shadow-cyan-500/20">
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
          <h1 className="text-xl font-bold tracking-tight uppercase font-mono text-cyan-400">
            JNAS AI Core OS
          </h1>
          <p className="text-xs text-slate-500 font-mono tracking-widest uppercase">
            Phase 1 Foundation Gateway
          </p>
        </div>

        {view === 'login' && (
          <DSCard variant="bordered" className="border-t-cyan-500 border-t-2">
            <DSCardHeader>
              <div className="flex flex-col">
                <DSCardTitle>Kernel Gatekeeping</DSCardTitle>
                <DSCardSubtitle>Establish secure administrative node session</DSCardSubtitle>
              </div>
            </DSCardHeader>
            <form onSubmit={handleLoginSubmit}>
              <DSCardContent className="space-y-4">
                <DSInput
                  label="Administrative Email"
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="Enter secure email address..."
                  required
                />
                <DSInput
                  label="Node Passkey"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter passthrough token..."
                  required
                />
              </DSCardContent>
              <DSCardFooter className="flex flex-col gap-3.5 bg-slate-950/40 p-5">
                <DSButton
                  type="submit"
                  variant="primary"
                  className="w-full justify-center"
                  loading={isLoading}
                  disabled={isLoading}
                  leftIcon={<ShieldCheck className="w-4 h-4 text-slate-950" />}
                >
                  Authorize Identity
                </DSButton>
                <div className="flex items-center justify-between w-full text-[11px] font-mono text-slate-500">
                  <button
                    type="button"
                    onClick={() => onNavigate('forgot-password')}
                    className="hover:text-cyan-400 cursor-pointer transition-colors"
                  >
                    Forgot Passkey?
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('register')}
                    className="hover:text-cyan-400 cursor-pointer transition-colors"
                  >
                    Request Operator Access
                  </button>
                </div>
              </DSCardFooter>
            </form>
          </DSCard>
        )}

        {view === 'register' && (
          <DSCard variant="bordered" className="border-t-cyan-500 border-t-2">
            <DSCardHeader>
              <div className="flex flex-col">
                <DSCardTitle>Operator Registration</DSCardTitle>
                <DSCardSubtitle>Request developer keys for the platform shell</DSCardSubtitle>
              </div>
            </DSCardHeader>
            <form onSubmit={handleRegisterSubmit}>
              <DSCardContent className="space-y-4">
                <DSInput
                  label="Operator Full Name"
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="E.g. Aneesh Shaikh..."
                  required
                />
                <DSInput
                  label="Corporate Email Node"
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="E.g. operator@jnas-core.internal..."
                  required
                />
              </DSCardContent>
              <DSCardFooter className="flex flex-col gap-3.5 bg-slate-950/40 p-5">
                <DSButton
                  type="submit"
                  variant="primary"
                  className="w-full justify-center"
                  loading={isLoading}
                  disabled={isLoading}
                >
                  Generate Credentials
                </DSButton>
                <div className="text-center w-full text-[11px] font-mono">
                  <button
                    type="button"
                    onClick={() => onNavigate('login')}
                    className="text-slate-500 hover:text-cyan-400 cursor-pointer transition-colors"
                  >
                    Already have access? Authorize Node
                  </button>
                </div>
              </DSCardFooter>
            </form>
          </DSCard>
        )}

        {view === 'forgot-password' && (
          <DSCard variant="bordered" className="border-t-cyan-500 border-t-2">
            <DSCardHeader>
              <div className="flex flex-col">
                <DSCardTitle>Recover Credentials</DSCardTitle>
                <DSCardSubtitle>Retrieve secure access credentials via dispatch</DSCardSubtitle>
              </div>
            </DSCardHeader>
            <form onSubmit={handleForgotSubmit}>
              <DSCardContent className="space-y-4">
                <DSInput
                  label="Registered Email"
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="operator@jnas-core.internal..."
                  required
                />
              </DSCardContent>
              <DSCardFooter className="flex flex-col gap-3.5 bg-slate-950/40 p-5">
                <DSButton
                  type="submit"
                  variant="primary"
                  className="w-full justify-center"
                  loading={isLoading}
                  disabled={isLoading}
                >
                  Dispatch Passkey Reset
                </DSButton>
                <div className="text-center w-full text-[11px] font-mono">
                  <button
                    type="button"
                    onClick={() => onNavigate('login')}
                    className="text-slate-500 hover:text-cyan-400 cursor-pointer transition-colors"
                  >
                    Return to authorization portal
                  </button>
                </div>
              </DSCardFooter>
            </form>
          </DSCard>
        )}

        {/* Minimal Footer */}
        <div className="text-center font-mono text-[10px] text-slate-600">
          JNAS SECURE LINK VER-2026.1 • SHA256 ENABLED
        </div>
      </div>
    </div>
  );
};

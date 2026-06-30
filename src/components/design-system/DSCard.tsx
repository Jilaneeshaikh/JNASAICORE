import React from 'react';
import { motion } from 'motion/react';

export type DSCardVariant = 'standard' | 'bordered' | 'accent' | 'interactive' | 'glass' | 'metric';

interface DSCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: DSCardVariant;
  hoverAccent?: boolean;
  accentColor?: string; // Tailwind border or glow color
  className?: string;
  id?: string;
}

export const DSCard: React.FC<DSCardProps> = ({
  children,
  variant = 'standard',
  hoverAccent = false,
  accentColor = 'border-t-cyan-500',
  className = '',
  id,
  ...props
}) => {
  const baseStyles = 'rounded-sm font-sans relative overflow-hidden bg-slate-950 border text-slate-100';
  
  const variantStyles: Record<DSCardVariant, string> = {
    standard: 'border-slate-800 bg-slate-950/80',
    bordered: 'border-slate-700 bg-slate-950',
    accent: `border-slate-800 border-t-2 ${accentColor} bg-slate-950/90`,
    interactive: 'border-slate-800 hover:border-slate-700 bg-slate-950/80 hover:bg-slate-900/40 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/5 hover:-translate-y-0.5',
    glass: 'border-slate-800/60 bg-slate-950/40 backdrop-blur-md',
    metric: 'border-slate-800 bg-slate-950/90 py-5 px-6 shadow-sm shadow-black/40',
  };

  const hoverAccentStyles = hoverAccent ? 'hover:border-cyan-500/40 transition-colors duration-200' : '';

  return (
    <div
      id={id}
      className={`${baseStyles} ${variantStyles[variant]} ${hoverAccentStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// Subcomponents for structured Card compositions
export const DSCardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div className={`px-5 py-4 border-b border-slate-900 flex items-center justify-between gap-4 ${className}`}>
    {children}
  </div>
);

export const DSCardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div className={`p-5 ${className}`}>
    {children}
  </div>
);

export const DSCardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div className={`px-5 py-3.5 border-t border-slate-900/60 bg-slate-950/40 text-xs text-slate-400 flex items-center justify-between gap-4 ${className}`}>
    {children}
  </div>
);

export const DSCardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <h3 className={`text-base font-medium tracking-tight text-slate-100 ${className}`}>
    {children}
  </h3>
);

export const DSCardSubtitle: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <p className={`text-xs text-slate-400 font-sans tracking-normal ${className}`}>
    {children}
  </p>
);

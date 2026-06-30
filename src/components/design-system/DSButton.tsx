import React from 'react';
import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';
import { DSVariant, DSSize } from '../../types';

export interface DSButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: DSVariant;
  size?: DSSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
}

export const DSButton: React.FC<DSButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  className = '',
  ...props
}) => {
  // Styles based on Swiss-International minimal-border approach
  const baseStyles = 'inline-flex items-center justify-center font-sans font-medium transition-all duration-200 outline-none select-none relative cursor-pointer active:scale-[0.98] focus:ring-1 focus:ring-offset-2 focus:ring-cyan-500 border';

  const variantStyles: Record<DSVariant, string> = {
    primary: 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 border-cyan-500 hover:border-cyan-400 font-semibold shadow-md shadow-cyan-500/10',
    secondary: 'bg-slate-900 hover:bg-slate-800 text-slate-100 border-slate-800 hover:border-slate-700',
    tertiary: 'bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-slate-200 border-slate-900 hover:border-slate-800',
    outline: 'bg-transparent hover:bg-slate-900/50 text-slate-300 hover:text-slate-100 border-slate-800 hover:border-slate-600',
    ghost: 'bg-transparent hover:bg-slate-900 text-slate-400 hover:text-slate-200 border-transparent',
    danger: 'bg-rose-950 hover:bg-rose-900 text-rose-200 border-rose-900 hover:border-rose-800',
    accent: 'bg-slate-100 hover:bg-white text-slate-950 border-slate-200 hover:border-white font-medium',
  };

  const sizeStyles: Record<DSSize, string> = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5 rounded-sm',
    md: 'text-sm px-4 py-2 gap-2 rounded-sm',
    lg: 'text-base px-6 py-3 gap-2.5 rounded-sm',
    xl: 'text-lg px-8 py-4 gap-3 rounded-md tracking-tight font-medium',
  };

  const statusStyles = (disabled || loading) ? 'opacity-40 cursor-not-allowed pointer-events-none' : '';

  return (
    <button
      disabled={disabled || loading}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${statusStyles} ${className}`}
      {...props}
    >
      {loading && (
        <motion.span
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="inline-block mr-1.5"
        >
          <Loader2 className="w-4 h-4 text-current" />
        </motion.span>
      )}

      {!loading && leftIcon && <span className="inline-flex items-center">{leftIcon}</span>}
      <span className="truncate">{children}</span>
      {!loading && rightIcon && <span className="inline-flex items-center">{rightIcon}</span>}
    </button>
  );
};

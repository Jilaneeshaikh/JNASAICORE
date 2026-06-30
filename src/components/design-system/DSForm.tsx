import React, { useId } from 'react';
import { motion } from 'motion/react';
import { AlertCircle } from 'lucide-react';

// Form Label Wrapper
export const DSLabel: React.FC<{
  children: React.ReactNode;
  htmlFor?: string;
  required?: boolean;
  className?: string;
}> = ({ children, htmlFor, required, className = '' }) => (
  <label
    htmlFor={htmlFor}
    className={`block text-xs font-medium text-slate-300 mb-1.5 font-sans tracking-wide select-none ${className}`}
  >
    {children} {required && <span className="text-rose-500">*</span>}
  </label>
);

// Form Error text with icon
export const DSErrorText: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  if (!children) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-1 mt-1 text-xs text-rose-400 font-sans ${className}`}
    >
      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
      <span>{children}</span>
    </motion.div>
  );
};

// Form Input
export interface DSInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  required?: boolean;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

export const DSInput: React.FC<DSInputProps> = ({
  label,
  required,
  error,
  leftIcon,
  rightIcon,
  className = '',
  containerClassName = '',
  ...props
}) => {
  const generatedId = useId();
  const id = props.id || generatedId;

  const baseInputStyles = 'w-full bg-slate-950 text-slate-100 placeholder-slate-500 text-sm font-sans px-3.5 py-2.5 rounded-sm border focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200';
  const borderStyles = error ? 'border-rose-900 bg-rose-950/10 focus:border-rose-500 focus:ring-rose-500' : 'border-slate-800 focus:border-cyan-500';
  const iconPadding = `${leftIcon ? 'pl-10' : ''} ${rightIcon ? 'pr-10' : ''}`;
  const statusStyles = props.disabled ? 'opacity-40 cursor-not-allowed bg-slate-900/50' : '';

  return (
    <div className={`w-full ${containerClassName}`}>
      {label && <DSLabel htmlFor={id} required={required}>{label}</DSLabel>}
      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3.5 text-slate-500 flex items-center justify-center pointer-events-none select-none">
            {leftIcon}
          </div>
        )}
        <input
          id={id}
          className={`${baseInputStyles} ${borderStyles} ${iconPadding} ${statusStyles} ${className}`}
          required={required}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3.5 text-slate-500 flex items-center justify-center pointer-events-none select-none">
            {rightIcon}
          </div>
        )}
      </div>
      <DSErrorText>{error}</DSErrorText>
    </div>
  );
};

// Custom Textarea
export interface DSTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  required?: boolean;
  error?: string;
  charLimit?: number;
  containerClassName?: string;
}

export const DSTextarea: React.FC<DSTextareaProps> = ({
  label,
  required,
  error,
  charLimit,
  className = '',
  containerClassName = '',
  ...props
}) => {
  const generatedId = useId();
  const id = props.id || generatedId;

  const valueLength = typeof props.value === 'string' ? props.value.length : 0;

  return (
    <div className={`w-full ${containerClassName}`}>
      <div className="flex justify-between items-center mb-1.5">
        {label && <DSLabel htmlFor={id} required={required}>{label}</DSLabel>}
        {charLimit && (
          <span className="text-[10px] text-slate-500 font-mono">
            {valueLength} / {charLimit}
          </span>
        )}
      </div>
      <textarea
        id={id}
        className={`w-full bg-slate-950 text-slate-100 placeholder-slate-500 text-sm font-sans px-3.5 py-2.5 rounded-sm border border-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200 min-h-[100px] resize-y ${
          error ? 'border-rose-900 bg-rose-950/10 focus:border-rose-500 focus:ring-rose-500' : ''
        } ${props.disabled ? 'opacity-40 cursor-not-allowed bg-slate-900/50' : ''} ${className}`}
        required={required}
        {...props}
      />
      <DSErrorText>{error}</DSErrorText>
    </div>
  );
};

// Custom Select Dropdown
export interface DSSelectOption {
  value: string;
  label: string;
}

export interface DSSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: DSSelectOption[];
  required?: boolean;
  error?: string;
  containerClassName?: string;
}

export const DSSelect: React.FC<DSSelectProps> = ({
  label,
  options,
  required,
  error,
  className = '',
  containerClassName = '',
  ...props
}) => {
  const generatedId = useId();
  const id = props.id || generatedId;

  return (
    <div className={`w-full ${containerClassName}`}>
      {label && <DSLabel htmlFor={id} required={required}>{label}</DSLabel>}
      <div className="relative">
        <select
          id={id}
          className={`w-full bg-slate-950 text-slate-100 text-sm font-sans px-3.5 py-2.5 rounded-sm border border-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200 appearance-none ${
            error ? 'border-rose-900 focus:border-rose-500 focus:ring-rose-500' : ''
          } ${props.disabled ? 'opacity-40 cursor-not-allowed' : ''} ${className}`}
          required={required}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-slate-950 text-slate-100">
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 flex items-center">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      <DSErrorText>{error}</DSErrorText>
    </div>
  );
};

// Switch/Toggle
export interface DSSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export const DSSwitch: React.FC<DSSwitchProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  className = '',
}) => {
  return (
    <div className={`flex items-start justify-between gap-4 cursor-pointer select-none ${disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''} ${className}`}
         onClick={() => !disabled && onChange(!checked)}>
      {(label || description) && (
        <div className="flex flex-col">
          {label && <span className="text-sm font-medium text-slate-200">{label}</span>}
          {description && <span className="text-xs text-slate-400 mt-0.5">{description}</span>}
        </div>
      )}
      <div className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors duration-200 shrink-0 ${checked ? 'bg-cyan-500' : 'bg-slate-800'}`}>
        <motion.div
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="bg-slate-950 w-4 h-4 rounded-full shadow-md"
          animate={{ x: checked ? 16 : 0 }}
        />
      </div>
    </div>
  );
};

// Custom Checkbox
export interface DSCheckboxProps {
  checked: boolean | 'indeterminate';
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export const DSCheckbox: React.FC<DSCheckboxProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  className = '',
}) => {
  return (
    <div
      onClick={() => !disabled && onChange(checked === 'indeterminate' ? true : !checked)}
      className={`flex items-center gap-2.5 cursor-pointer select-none ${disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''} ${className}`}
    >
      <div
        className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-all duration-150 shrink-0 ${
          checked ? 'border-cyan-500 bg-cyan-500 text-slate-950' : 'border-slate-800 bg-slate-950 text-transparent'
        }`}
      >
        {checked === true && (
          <svg className="w-3 h-3 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
        {checked === 'indeterminate' && (
          <div className="w-2 h-0.5 bg-slate-950" />
        )}
      </div>
      {label && <span className="text-xs font-medium text-slate-300 font-sans">{label}</span>}
    </div>
  );
};

// Custom Radio Button Group
export interface DSRadioOption {
  value: string;
  label: string;
  description?: string;
}

export interface DSRadioGroupProps {
  value: string;
  onChange: (value: string) => void;
  options: DSRadioOption[];
  label?: string;
  disabled?: boolean;
  className?: string;
}

export const DSRadioGroup: React.FC<DSRadioGroupProps> = ({
  value,
  onChange,
  options,
  label,
  disabled = false,
  className = '',
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && <DSLabel>{label}</DSLabel>}
      <div className="space-y-2">
        {options.map((opt) => {
          const isSelected = opt.value === value;
          return (
            <div
              key={opt.value}
              onClick={() => !disabled && onChange(opt.value)}
              className={`flex items-start gap-3 p-3 border rounded-sm cursor-pointer select-none transition-all duration-200 ${
                isSelected
                  ? 'border-cyan-500 bg-cyan-950/10'
                  : 'border-slate-800 bg-slate-950 hover:bg-slate-900/40'
              } ${disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}`}
            >
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all shrink-0 mt-0.5 ${
                  isSelected ? 'border-cyan-500 bg-transparent' : 'border-slate-800 bg-slate-950'
                }`}
              >
                {isSelected && <div className="w-2 h-2 rounded-full bg-cyan-500" />}
              </div>
              <div className="flex flex-col">
                <span className={`text-xs font-medium ${isSelected ? 'text-cyan-400' : 'text-slate-300'}`}>
                  {opt.label}
                </span>
                {opt.description && (
                  <span className="text-[10px] text-slate-500 mt-0.5">
                    {opt.description}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

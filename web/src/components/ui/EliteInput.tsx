import React from 'react';

interface EliteInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

interface EliteTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

interface EliteSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: React.ReactNode;
}

const baseInput = 'w-full bg-elite-bg/80 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-elite-primary/60 focus:border-elite-primary/40 transition-all text-sm';

export function EliteInput({ label, error, className = '', ...props }: EliteInputProps) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-slate-400 mb-1.5">{label}</label>}
      <input className={`${baseInput} ${className}`} {...props} />
      {error && <p className="text-xs text-elite-accent mt-1">{error}</p>}
    </div>
  );
}

export function EliteTextarea({ label, error, className = '', ...props }: EliteTextareaProps) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-slate-400 mb-1.5">{label}</label>}
      <textarea className={`${baseInput} resize-y ${className}`} {...props} />
      {error && <p className="text-xs text-elite-accent mt-1">{error}</p>}
    </div>
  );
}

export function EliteSelect({ label, error, className = '', children, ...props }: EliteSelectProps) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-slate-400 mb-1.5">{label}</label>}
      <select className={`${baseInput} ${className}`} {...props}>
        {children}
      </select>
      {error && <p className="text-xs text-elite-accent mt-1">{error}</p>}
    </div>
  );
}

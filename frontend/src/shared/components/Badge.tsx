import React from 'react';
import { cn } from '../utils/cn';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  children?: React.ReactNode;
  className?: string;
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const baseStyles = "inline-flex items-center font-mono text-xs uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold border";
  
  const variants = {
    default: "bg-slate-800 text-slate-300 border-slate-700",
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    danger: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    info: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  };

  return (
    <span className={cn(baseStyles, variants[variant], className)} {...props} />
  );
}

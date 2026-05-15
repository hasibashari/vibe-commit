import React from 'react';
import { cn } from '../utils/cn';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center", className)}>
      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-slate-400 max-w-sm mb-6">{description}</p>
      )}
      {action && (
        <div>{action}</div>
      )}
    </div>
  );
}

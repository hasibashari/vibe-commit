import React from 'react';
import { cn } from '../utils/cn';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subValue?: string;
  className?: string;
  valueColor?: string;
}

export function StatCard({
  icon,
  label,
  value,
  subValue,
  className,
  valueColor = 'text-white',
}: StatCardProps) {
  return (
    <div
      className={cn(
        'bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex flex-col',
        className,
      )}
    >
      <div className='flex items-center gap-2 mb-2'>
        <div className='w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400'>
          {icon}
        </div>
        <span className='text-xs font-mono uppercase tracking-widest text-slate-400'>{label}</span>
      </div>
      <div className='mt-auto'>
        <div className={cn('text-2xl font-bold tracking-tight font-display', valueColor)}>
          {value}
        </div>
        {subValue && <div className='text-xs text-slate-500 mt-1'>{subValue}</div>}
      </div>
    </div>
  );
}

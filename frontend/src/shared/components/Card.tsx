import React from 'react';
import { cn } from '../utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'interactive' | 'bordered';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const baseStyles = 'bg-[#0A0C10] rounded-xl overflow-hidden';

    const variants = {
      default: 'bg-slate-900/50 border border-slate-800',
      interactive:
        'bg-slate-900/50 border border-slate-800 hover:border-accent-500/30 hover:bg-slate-800/50 transition-colors cursor-pointer',
      bordered: 'bg-transparent border border-white/10',
    };

    return <div ref={ref} className={cn(baseStyles, variants[variant], className)} {...props} />;
  },
);
Card.displayName = 'Card';

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'px-6 py-4 flex items-center justify-between border-b border-white/5',
        className,
      )}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-6', className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-6 py-4 border-t border-white/5', className)} {...props} />;
}

import React from 'react';
import { cn } from '../utils/cn';
import { motion, HTMLMotionProps } from 'motion/react';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props },
    ref,
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-500 disabled:pointer-events-none disabled:opacity-50';

    const variants = {
      primary:
        'bg-accent-500 text-black hover:bg-accent-400 shadow-[0_0_15px_rgba(var(--theme-500-rgb),0.15)] hover:shadow-[0_0_20px_rgba(var(--theme-500-rgb),0.3)]',
      secondary:
        'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white',
      danger:
        'bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500/20 hover:text-rose-400',
      ghost: 'text-slate-400 hover:text-white hover:bg-white/5',
      icon: 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-accent-400',
    };

    const sizes = {
      sm: 'h-9 px-3 text-xs rounded-md md:h-8',
      md: 'h-11 px-5 text-sm rounded-lg',
      lg: 'h-14 px-8 text-base rounded-xl',
      icon: 'h-11 w-11 shrink-0 rounded-xl md:h-10 md:w-10',
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.97 }}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className='flex items-center gap-2'>
            <svg className='animate-spin h-4 w-4' viewBox='0 0 24 24'>
              <circle
                className='opacity-25'
                cx='12'
                cy='12'
                r='10'
                stroke='currentColor'
                strokeWidth='4'
                fill='none'
              />
              <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8v8H4z' />
            </svg>
            Loading...
          </span>
        ) : (
          children
        )}
      </motion.button>
    );
  },
);
Button.displayName = 'Button';

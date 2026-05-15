import React from 'react';
import { cn } from '../utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-mono uppercase tracking-widest text-slate-400 mb-1.5 ml-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full h-11 bg-slate-900 border text-sm rounded-lg px-4 focus:outline-none transition-colors placeholder:text-slate-600",
            error 
              ? "border-rose-500/50 focus:border-rose-500 text-rose-500" 
              : "border-slate-800 text-slate-200 focus:border-cyan-500/50",
            className
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-rose-500 ml-1">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string, error?: string }>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-mono uppercase tracking-widest text-slate-400 mb-1.5 ml-1">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            "w-full min-h-[100px] bg-slate-900 border text-sm rounded-lg p-4 focus:outline-none transition-colors placeholder:text-slate-600 resize-y",
            error 
              ? "border-rose-500/50 focus:border-rose-500 text-rose-500" 
              : "border-slate-800 text-slate-200 focus:border-cyan-500/50",
            className
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-rose-500 ml-1">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '../utils/cn';
import { Button } from './Button';
import { useToastStore, ToastMessage, ToastType } from '../../store/toastStore';

export type { ToastMessage, ToastType };

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);

  return (
    <>
      {children}
      <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-200 flex flex-col gap-2 pointer-events-none w-full max-w-sm">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              className={cn(
                "pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg bg-surface/95 backdrop-blur-xl",
                t.type === 'success' && "border-emerald-500/20",
                t.type === 'error' && "border-rose-500/20",
                t.type === 'info' && "border-accent-500/20"
              )}
            >
              <div className="shrink-0 mt-0.5">
                {t.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-400" />}
                {t.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400" />}
                {t.type === 'info' && <Info className="w-5 h-5 text-accent-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white">{t.title}</p>
                {t.description && (
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{t.description}</p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeToast(t.id)}
                className="shrink-0 w-6 h-6 p-0! text-slate-500 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}

export function useToast() {
  const toast = useToastStore((state) => state.toast);
  return { toast };
}

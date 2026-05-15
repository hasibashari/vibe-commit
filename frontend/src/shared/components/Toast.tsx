import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '../utils/cn';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: Omit<ToastMessage, 'id'>) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const toast = useCallback((message: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...message, id }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000); // 5 seconds auto-dismiss
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-[200] flex flex-col gap-2 pointer-events-none w-full max-w-sm">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              className={cn(
                "pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg bg-[#0A0C10]/95 backdrop-blur-xl",
                t.type === 'success' && "border-emerald-500/20",
                t.type === 'error' && "border-rose-500/20",
                t.type === 'info' && "border-cyan-500/20"
              )}
            >
              <div className="shrink-0 mt-0.5">
                {t.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-400" />}
                {t.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400" />}
                {t.type === 'info' && <Info className="w-5 h-5 text-cyan-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white">{t.title}</p>
                {t.description && (
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{t.description}</p>
                )}
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="shrink-0 text-slate-500 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

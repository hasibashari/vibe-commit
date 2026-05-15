import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../utils/cn';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  variant?: 'default' | 'danger' | 'fullscreen';
  className?: string;
  preventBackdropClose?: boolean;
}

export function Modal({ 
  isOpen, 
  onClose, 
  title, 
  description, 
  children, 
  variant = 'default',
  className,
  preventBackdropClose = false
}: ModalProps) {

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !preventBackdropClose) onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, preventBackdropClose]);

  const variants = {
    default: "w-full max-w-2xl rounded-2xl",
    danger: "w-full max-w-md rounded-xl border-rose-500/20",
    fullscreen: "w-full h-full max-w-full rounded-none border-0",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => !preventBackdropClose && onClose()}
          />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className={cn(
              "relative bg-[#0A0C10] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-full",
              variants[variant],
              className
            )}
            role="dialog"
            aria-modal="true"
          >
            {(title || description) && (
              <div className="flex-none px-6 py-4 border-b border-white/5 flex items-start justify-between">
                <div>
                  {title && <h2 className="text-xl font-display font-bold text-white tracking-tight">{title}</h2>}
                  {description && <p className="text-sm text-slate-400 mt-1">{description}</p>}
                </div>
                {!preventBackdropClose && (
                  <button 
                    onClick={onClose}
                    className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors -mr-2"
                    aria-label="Close dialog"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}
            <div className="flex-1 overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

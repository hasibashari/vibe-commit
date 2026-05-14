import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle } from 'lucide-react';

interface DeleteQuestModalProps {
  questId: string | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteQuestModal({ questId, onClose, onConfirm }: DeleteQuestModalProps) {
  return (
    <AnimatePresence>
      {questId && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
            className="relative w-full max-w-sm bg-slate-900 border border-rose-500/30 rounded-xl overflow-hidden shadow-2xl z-10"
          >
            <div className="p-6 text-center">
              <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4 opacity-80" />
              <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Drop Quest?</h3>
              <p className="text-sm text-slate-400 leading-relaxed font-mono">
                Quest dan semua progress log-nya bakal dihapus permanen. Aksi ini nggak bisa dibatalin.
              </p>
            </div>
            <div className="flex border-t border-slate-800">
              <button 
                onClick={onClose}
                className="flex-1 px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest hover:bg-slate-800 transition-colors"
              >
                Batal
              </button>
              <div className="w-px bg-slate-800" />
              <button 
                onClick={onConfirm}
                className="flex-1 px-4 py-4 text-xs font-bold text-rose-400 uppercase tracking-widest hover:bg-rose-900/20 transition-colors"
              >
                Hapus Permanen
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

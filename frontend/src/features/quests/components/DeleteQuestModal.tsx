import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from '../../../shared/components/Modal';
import { Button } from '../../../shared/components/Button';

interface DeleteQuestModalProps {
  questId: string | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteQuestModal({ questId, onClose, onConfirm }: DeleteQuestModalProps) {
  return (
    <Modal
      isOpen={!!questId}
      onClose={onClose}
      variant="danger"
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
    </Modal>
  );
}

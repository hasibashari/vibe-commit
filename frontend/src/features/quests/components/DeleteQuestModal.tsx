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
    <Modal isOpen={!!questId} onClose={onClose} variant='danger'>
      <div className='p-4 sm:p-6 flex flex-col gap-4'>
        <div className='text-center'>
          <AlertTriangle className='w-12 h-12 text-rose-500 mx-auto mb-4 opacity-80' />
          <h3 className='text-xl font-bold text-white mb-2 tracking-tight'>Drop Quest?</h3>
          <p className='text-sm text-slate-400 leading-relaxed font-mono'>
            Quest dan semua progress log-nya bakal dihapus permanen. Aksi ini nggak bisa dibatalin.
          </p>
        </div>
        <div className='flex gap-3 mt-2'>
          <Button variant='ghost' className='flex-1' onClick={onClose}>
            Batal
          </Button>
          <Button variant='danger' className='flex-1' onClick={onConfirm}>
            Hapus
          </Button>
        </div>
      </div>
    </Modal>
  );
}

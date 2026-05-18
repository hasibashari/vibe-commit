import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import type { Goal } from '../../../shared/types/goal';
import { Modal } from '../../../shared/components/Modal';
import { Input, Textarea } from '../../../shared/components/Input';
import { Button } from '../../../shared/components/Button';

interface QuestEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (questData: Partial<Goal>) => void;
  initialData?: Goal | null;
}

export const QuestEditorModal: React.FC<QuestEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 5.0,
    reward_alpha: 0.5,
    category: 'Daily Quest',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description || '',
        difficulty: initialData.difficulty,
        reward_alpha: initialData.reward_alpha || 0.5,
        category: initialData.category || 'Daily Quest',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        difficulty: 5.0,
        reward_alpha: 0.5,
        category: 'Daily Quest',
      });
    }
  }, [initialData, isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Quest' : 'Buat Quest Baru'}>
      <div className='p-4 sm:p-6 space-y-5'>
        <Input
          label='Nama Quest'
          value={formData.title}
          onChange={e => setFormData({ ...formData, title: e.target.value })}
          placeholder='Misi hari ini apa...'
        />

        <Textarea
          label='Deskripsi / Rule Quest'
          value={formData.description}
          onChange={e => setFormData({ ...formData, description: e.target.value })}
          placeholder='Detail tugas, kriteria biar dihitung selesai...'
        />

        <div className='grid grid-cols-2 gap-4'>
          <div className='space-y-1.5'>
            <label className='text-xs font-bold uppercase tracking-widest text-slate-500 flex justify-between'>
              <span>Tingkat Kesulitan</span>
              <span className='text-accent-400 font-mono'>{formData.difficulty.toFixed(1)}</span>
            </label>
            <input
              type='range'
              min='0.1'
              max='10'
              step='0.1'
              value={formData.difficulty}
              onChange={e => setFormData({ ...formData, difficulty: parseFloat(e.target.value) })}
              className='w-full accent-cyan-500'
            />
          </div>
          <div className='space-y-1.5'>
            <label className='text-xs font-bold uppercase tracking-widest text-slate-500 flex justify-between'>
              <span>Bonus EXP Multiplier</span>
              <span className='text-amber-400 font-mono'>{formData.reward_alpha.toFixed(2)}x</span>
            </label>
            <input
              type='range'
              min='0.1'
              max='2'
              step='0.05'
              value={formData.reward_alpha}
              onChange={e => setFormData({ ...formData, reward_alpha: parseFloat(e.target.value) })}
              className='w-full accent-amber-500'
            />
          </div>
        </div>

        <div className='space-y-1.5'>
          <label className='text-xs font-mono uppercase tracking-widest text-slate-400 mb-1.5 ml-1'>
            Kategori Quest
          </label>
          <select
            value={formData.category}
            onChange={e => setFormData({ ...formData, category: e.target.value })}
            className='w-full h-11 bg-slate-900 border border-slate-800 text-sm rounded-lg px-4 focus:outline-none focus:border-accent-500/50 transition-colors text-slate-200'
          >
            <option value='Main Quest'>👑 Main Quest (Tujuan Utama)</option>
            <option value='Daily Quest'>📅 Daily Quest (Misi Harian)</option>
            <option value='Side Quest'>📌 Side Quest (Tugas Tambahan)</option>
          </select>
        </div>
      </div>

      <div className='border-t border-white/5 p-4 bg-[#0A0C10] flex justify-end gap-3 flex-wrap'>
        <Button variant='ghost' onClick={onClose}>
          Batal
        </Button>
        <Button
          variant='primary'
          onClick={() => onSave(formData)}
          disabled={!formData.title.trim()}
          className='gap-2'
        >
          <Save className='w-4 h-4' />
          {initialData ? 'Simpan Update' : 'Buat Quest'}
        </Button>
      </div>
    </Modal>
  );
};

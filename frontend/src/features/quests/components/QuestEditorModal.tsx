import { useState, useEffect } from 'react';
import { Save, Crown, Calendar, Pin, Infinity, Zap, Coins } from 'lucide-react';
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
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    difficulty: number;
    reward_alpha: number;
    category: string;
    type: 'daily' | 'one-off' | 'project';
  }>({
    title: '',
    description: '',
    difficulty: 5.0,
    reward_alpha: 0.5,
    category: 'Daily Quest',
    type: 'daily',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description || '',
        difficulty: initialData.difficulty,
        reward_alpha: initialData.reward_alpha || 0.5,
        category: initialData.category || 'Daily Quest',
        type: (initialData.type as any) || 'daily',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        difficulty: 5.0,
        reward_alpha: 0.5,
        category: 'Daily Quest',
        type: 'daily',
      });
    }
  }, [initialData, isOpen]);

  // Dynamic difficulty tier status and colors
  const getDifficultyStatus = (diff: number) => {
    if (diff <= 3.0) {
      return {
        label: '🟢 Easy / Ringan',
        textColor: 'text-emerald-400',
        badgeClass: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
        accentColor: 'accent-emerald-500',
      };
    }
    if (diff <= 6.0) {
      return {
        label: '🔵 Medium / Sedang',
        textColor: 'text-cyan-400',
        badgeClass: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
        accentColor: 'accent-cyan-500',
      };
    }
    if (diff <= 9.0) {
      return {
        label: '🟠 Hard / Menantang',
        textColor: 'text-amber-400',
        badgeClass: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
        accentColor: 'accent-amber-500',
      };
    }
    return {
      label: '🔴 Legendary / Elite',
      textColor: 'text-rose-400',
      badgeClass: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
      accentColor: 'accent-rose-500',
    };
  };

  const getRewardStatus = (alpha: number) => {
    if (alpha <= 0.6) {
      return {
        label: 'Coins: Normal',
        textColor: 'text-slate-400',
        badgeClass: 'bg-slate-500/10 border-slate-500/20 text-slate-400',
      };
    }
    if (alpha <= 1.2) {
      return {
        label: 'Coins: Enhanced EXP ⚡',
        textColor: 'text-amber-400',
        badgeClass: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
      };
    }
    return {
      label: 'Coins: JACKPOT Booster! 🔥',
      textColor: 'text-yellow-400 font-bold',
      badgeClass: 'bg-yellow-500/15 border-yellow-500/30 text-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.1)]',
    };
  };

  const diffStatus = getDifficultyStatus(formData.difficulty);
  const rewardStatus = getRewardStatus(formData.reward_alpha);

  // Category Options mapping for interactive cards
  const categoryOptions = [
    {
      id: 'Main Quest',
      label: 'Main Quest',
      sub: 'Tujuan Utama',
      icon: Crown,
      activeClass: 'border-amber-500/60 bg-amber-500/10 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]',
      inactiveClass: 'border-slate-800/80 bg-slate-950/40 hover:border-slate-700/60 text-slate-400 hover:text-slate-200',
      accentColor: 'text-amber-500',
    },
    {
      id: 'Daily Quest',
      label: 'Daily Quest',
      sub: 'Misi Harian',
      icon: Calendar,
      activeClass: 'border-cyan-500/60 bg-cyan-500/10 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]',
      inactiveClass: 'border-slate-800/80 bg-slate-950/40 hover:border-slate-700/60 text-slate-400 hover:text-slate-200',
      accentColor: 'text-cyan-500',
    },
    {
      id: 'Side Quest',
      label: 'Side Quest',
      sub: 'Tugas Tambahan',
      icon: Pin,
      activeClass: 'border-purple-500/60 bg-purple-500/10 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.15)]',
      inactiveClass: 'border-slate-800/80 bg-slate-950/40 hover:border-slate-700/60 text-slate-400 hover:text-slate-200',
      accentColor: 'text-purple-500',
    },
  ];

  // Type Options mapping for interactive cards
  const typeOptions = [
    {
      id: 'daily' as const,
      label: 'Rutinitas (Habit)',
      sub: 'Diulang tiap hari',
      icon: Infinity,
      activeClass: 'border-emerald-500/60 bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]',
      inactiveClass: 'border-slate-800/80 bg-slate-950/40 hover:border-slate-700/60 text-slate-400 hover:text-slate-200',
      accentColor: 'text-emerald-500',
    },
    {
      id: 'one-off' as const,
      label: 'Sekali Jalan',
      sub: 'Selesai & arsip',
      icon: Zap,
      activeClass: 'border-sky-500/60 bg-sky-500/10 text-sky-400 shadow-[0_0_15px_rgba(14,165,233,0.15)]',
      inactiveClass: 'border-slate-800/80 bg-slate-950/40 hover:border-slate-700/60 text-slate-400 hover:text-slate-200',
      accentColor: 'text-sky-500',
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Quest' : 'Buat Quest Baru'}>
      <div className='p-5 sm:p-6 space-y-6 bg-slate-950/10'>
        
        {/* Input: Nama Quest */}
        <div>
          <Input
            label='Nama Quest'
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            placeholder='Misi hari ini apa...'
            className='bg-slate-900 border-slate-800/80 focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/20 hover:border-slate-700 transition-all duration-200 text-white font-medium placeholder-slate-600 shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.4)] rounded-xl'
          />
        </div>

        {/* Input: Deskripsi */}
        <div>
          <Textarea
            label='Deskripsi / Rule Quest'
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            placeholder='Detail tugas atau kriteria biar quest dihitung sukses...'
            className='bg-slate-900 border-slate-800/80 focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/20 hover:border-slate-700 transition-all duration-200 text-slate-300 placeholder-slate-600 h-24 shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.4)] rounded-xl'
          />
        </div>

        {/* Dynamic Interactive Sliders (RPG Control Style) */}
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          
          {/* Slider: Difficulty */}
          <div className='space-y-3 p-4 bg-slate-900/50 border border-slate-800/80 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.2)] transition-colors hover:border-slate-800'>
            <div className='flex justify-between items-start'>
              <div className='space-y-0.5'>
                <span className='text-xs font-mono uppercase tracking-widest text-slate-400 block'>Tingkat Kesulitan</span>
                <span className={`text-[10px] inline-flex items-center px-2 py-0.5 rounded-full border ${diffStatus.badgeClass} font-semibold transition-all duration-300`}>
                  {diffStatus.label}
                </span>
              </div>
              <span className={`font-mono font-black text-xl tracking-tight leading-none ${diffStatus.textColor}`}>
                {formData.difficulty.toFixed(1)}
              </span>
            </div>
            
            <div className='pt-1'>
              <input
                type='range'
                min='0.1'
                max='10'
                step='0.1'
                value={formData.difficulty}
                onChange={e => setFormData({ ...formData, difficulty: parseFloat(e.target.value) })}
                className={`w-full ${diffStatus.accentColor} bg-slate-950 h-2 rounded-lg cursor-pointer appearance-none transition-all outline-none border border-slate-800/60`}
              />
              <div className='flex justify-between text-[9px] font-mono text-slate-500 mt-1 px-0.5'>
                <span>0.1 (Mudah)</span>
                <span>5.0</span>
                <span>10.0 (Gila)</span>
              </div>
            </div>
          </div>

          {/* Slider: Reward Multiplier */}
          <div className='space-y-3 p-4 bg-slate-900/50 border border-slate-800/80 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.2)] transition-colors hover:border-slate-800'>
            <div className='flex justify-between items-start'>
              <div className='space-y-0.5'>
                <span className='text-xs font-mono uppercase tracking-widest text-slate-400 block'>Multiplier Bonus EXP</span>
                <span className={`text-[10px] inline-flex items-center px-2 py-0.5 rounded-full border ${rewardStatus.badgeClass} font-semibold transition-all duration-300`}>
                  {rewardStatus.label}
                </span>
              </div>
              <span className='font-mono font-black text-xl tracking-tight leading-none text-amber-400 flex items-center gap-0.5'>
                <Coins className='w-4 h-4 text-amber-500' />
                {formData.reward_alpha.toFixed(2)}x
              </span>
            </div>

            <div className='pt-1'>
              <input
                type='range'
                min='0.1'
                max='2'
                step='0.05'
                value={formData.reward_alpha}
                onChange={e => setFormData({ ...formData, reward_alpha: parseFloat(e.target.value) })}
                className='w-full accent-amber-500 bg-slate-950 h-2 rounded-lg cursor-pointer appearance-none transition-all outline-none border border-slate-800/60'
              />
              <div className='flex justify-between text-[9px] font-mono text-slate-500 mt-1 px-0.5'>
                <span>0.1x (Sedikit)</span>
                <span>1.0x</span>
                <span>2.0x (Max)</span>
              </div>
            </div>
          </div>
          
        </div>

        {/* Section: Category - Beautiful Interactive Selector Cards */}
        <div className='space-y-2.5'>
          <label className='block text-xs font-mono uppercase tracking-widest text-slate-400 ml-1'>
            Kategori Quest
          </label>
          <div className='grid grid-cols-3 gap-3'>
            {categoryOptions.map(opt => {
              const IconComp = opt.icon;
              const isSelected = formData.category === opt.id;
              return (
                <button
                  key={opt.id}
                  type='button'
                  onClick={() => setFormData({ ...formData, category: opt.id })}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all duration-300 relative group overflow-hidden active:scale-95 ${
                    isSelected ? opt.activeClass : opt.inactiveClass
                  }`}
                >
                  {/* Subtle hover gradient background */}
                  <div className='absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none' />
                  
                  <IconComp className={`w-5 h-5 mb-1.5 transition-transform duration-300 group-hover:scale-110 ${
                    isSelected ? opt.accentColor : 'text-slate-400 group-hover:text-slate-300'
                  }`} />
                  
                  <span className='text-xs font-bold tracking-wide block leading-tight'>
                    {opt.label}
                  </span>
                  <span className='text-[9px] text-slate-500 group-hover:text-slate-400 block mt-0.5 leading-none transition-colors'>
                    {opt.sub}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section: Type - Beautiful Segment Control Cards */}
        <div className='space-y-2.5'>
          <label className='block text-xs font-mono uppercase tracking-widest text-slate-400 ml-1'>
            Tipe Quest
          </label>
          <div className='grid grid-cols-2 gap-3'>
            {typeOptions.map(opt => {
              const IconComp = opt.icon;
              const isSelected = formData.type === opt.id;
              return (
                <button
                  key={opt.id}
                  type='button'
                  onClick={() => setFormData({ ...formData, type: opt.id })}
                  className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all duration-300 relative group overflow-hidden text-left active:scale-95 ${
                    isSelected ? opt.activeClass : opt.inactiveClass
                  }`}
                >
                  <div className='absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none' />
                  
                  <div className={`p-2 rounded-xl transition-all duration-300 ${
                    isSelected ? 'bg-white/10' : 'bg-slate-900 group-hover:bg-slate-800'
                  }`}>
                    <IconComp className={`w-5 h-5 transition-transform duration-300 group-hover:rotate-6 ${
                      isSelected ? opt.accentColor : 'text-slate-400 group-hover:text-slate-300'
                    }`} />
                  </div>

                  <div>
                    <span className='text-xs font-bold tracking-wide block leading-tight'>
                      {opt.label}
                    </span>
                    <span className='text-[9px] text-slate-500 group-hover:text-slate-400 block mt-0.5 leading-tight transition-colors'>
                      {opt.sub}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Action Footer */}
      <div className='border-t border-white/5 p-4 bg-slate-950/80 flex justify-end gap-3 flex-wrap relative z-10'>
        <Button variant='ghost' onClick={onClose} className='hover:bg-white/5 active:scale-95 transition-all text-slate-400 hover:text-white rounded-xl px-5'>
          Batal
        </Button>
        <Button
          variant='primary'
          onClick={() => onSave(formData)}
          disabled={!formData.title.trim()}
          className='gap-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold tracking-wide shadow-[0_4px_15px_rgba(6,182,212,0.2)] hover:shadow-[0_4px_20px_rgba(6,182,212,0.35)] active:scale-95 transition-all !rounded-xl px-6 py-2.5'
        >
          <Save className='w-4 h-4' />
          {initialData ? 'Simpan Update' : 'Buat Quest'}
        </Button>
      </div>
    </Modal>
  );
};

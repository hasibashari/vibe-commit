import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, X, Save } from 'lucide-react';
import type { Goal } from '../../../app/App';

interface QuestEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (questData: Partial<Goal>) => void;
  initialData?: Goal | null;
}

export const QuestEditorModal: React.FC<QuestEditorModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
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
        description: initialData.description,
        difficulty: initialData.difficulty,
        reward_alpha: initialData.reward_alpha,
        category: initialData.category,
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative w-full max-w-lg bg-[#0a0f16] border border-slate-700 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]"
      >
        {/* Header */}
        <div className="border-b border-slate-800 p-4 flex justify-between items-center bg-slate-900/50">
          <h2 className="font-display text-[14px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
            <Target className="w-4 h-4 text-cyan-400" />
            {initialData ? 'Edit Quest' : 'Buat Quest Baru'}
          </h2>
          <button onClick={onClose} className="p-3 -m-3 text-slate-500 hover:text-slate-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Nama Quest</label>
            <input 
               type="text" 
               value={formData.title}
               onChange={(e) => setFormData({...formData, title: e.target.value})}
               className="w-full bg-slate-900/50 border border-slate-700 rounded p-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors placeholder:text-slate-600 font-bold"
               placeholder="Misi hari ini apa..."
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Deskripsi / Rule Quest</label>
            <textarea 
               value={formData.description}
               onChange={(e) => setFormData({...formData, description: e.target.value})}
               className="w-full bg-slate-900/50 border border-slate-700 rounded p-2.5 text-sm text-slate-300 focus:outline-none focus:border-cyan-500 transition-colors placeholder:text-slate-600 resize-none h-24 leading-relaxed"
               placeholder="Detail tugas, kriteria biar dihitung selesai..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500 flex justify-between">
                <span>Tingkat Kesulitan</span>
                <span className="text-cyan-400 font-mono">{formData.difficulty.toFixed(1)}</span>
              </label>
              <input 
                type="range" 
                min="0.1" max="10" step="0.1" 
                value={formData.difficulty}
                onChange={(e) => setFormData({...formData, difficulty: parseFloat(e.target.value)})}
                className="w-full accent-cyan-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500 flex justify-between">
                <span>Bonus EXP Multiplier</span>
                <span className="text-amber-400 font-mono">{formData.reward_alpha.toFixed(2)}x</span>
              </label>
              <input 
                type="range" 
                min="0.1" max="2" step="0.05" 
                value={formData.reward_alpha}
                onChange={(e) => setFormData({...formData, reward_alpha: parseFloat(e.target.value)})}
                className="w-full accent-amber-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Kategori Quest</label>
            <select 
               value={formData.category}
               onChange={(e) => setFormData({...formData, category: e.target.value})}
               className="w-full bg-slate-900/50 border border-slate-700 rounded p-2.5 text-sm text-slate-300 focus:outline-none focus:border-cyan-500 transition-colors"
            >
              <option value="Main Quest">👑 Main Quest (Tujuan Utama)</option>
              <option value="Daily Quest">📅 Daily Quest (Misi Harian)</option>
              <option value="Side Quest">📌 Side Quest (Tugas Tambahan)</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 p-4 bg-slate-900/30 flex justify-end gap-3 flex-wrap">
          <button 
            onClick={onClose}
            className="px-6 py-3 min-h-[44px] text-[11px] font-bold text-slate-400 hover:text-white uppercase tracking-wider transition-colors"
          >
            Batal
          </button>
          <button 
            onClick={() => onSave(formData)}
            disabled={!formData.title.trim()}
            className="px-6 py-3 min-h-[44px] bg-cyan-500 text-black text-[11px] font-bold uppercase tracking-wider rounded border border-cyan-400 hover:bg-cyan-400 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(6,182,212,0.3)] active:scale-95"
          >
            <Save className="w-4 h-4" />
            {initialData ? 'Simpan Update' : 'Buat Quest'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

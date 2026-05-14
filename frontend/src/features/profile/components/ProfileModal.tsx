import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Shield, RefreshCw, Save, TriangleAlert } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onSaveProfile: (data: any) => Promise<void>;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ 
  isOpen, onClose, user, onSaveProfile 
}) => {
  const [name, setName] = useState(user?.name || '');
  const [title, setTitle] = useState(user?.title || '');
  const [avatarColor, setAvatarColor] = useState(user?.avatar_color || 'indigo');

  const colors = [
    { id: 'indigo', hex: 'bg-indigo-500', ring: 'ring-indigo-400' },
    { id: 'rose', hex: 'bg-rose-500', ring: 'ring-rose-400' },
    { id: 'cyan', hex: 'bg-cyan-500', ring: 'ring-cyan-400' },
    { id: 'emerald', hex: 'bg-emerald-500', ring: 'ring-emerald-400' },
    { id: 'amber', hex: 'bg-amber-500', ring: 'ring-amber-400' },
  ];

  const handleSave = async () => {
    await onSaveProfile({ name, title, avatar_color: avatarColor });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
            onClick={onClose}
          />
          <div className="fixed inset-0 flex items-center justify-center z-[201] p-4 pointer-events-none">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-[#0A0C10] border border-slate-700/50 rounded-xl shadow-2xl w-full max-w-md pointer-events-auto overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-4 border-b border-slate-800/50 flex justify-between items-center bg-slate-900/50">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-slate-400" />
                  <h3 className="text-sm font-bold text-white tracking-widest uppercase">System Profile</h3>
                </div>
                <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-md text-slate-400">
                  <X className="w-4 h-4" />
                 </button>
              </div>

              {/* Body */}
              <div className="p-5 flex flex-col gap-6 overflow-y-auto">
                <div className="flex flex-col gap-4">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Identification</h4>
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-mono text-slate-400">Call Sign (Name)</label>
                    <input 
                      type="text" 
                      value={name} 
                      onChange={e => setName(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-mono text-slate-400">Designation (Title)</label>
                    <input 
                      type="text" 
                      value={title} 
                      onChange={e => setTitle(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Aesthetics</h4>
                  <div className="flex gap-3">
                    {colors.map(c => (
                      <button 
                        key={c.id}
                        onClick={() => setAvatarColor(c.id)}
                        className={`w-8 h-8 rounded-full ${c.hex} flex items-center justify-center ring-2 transition-all ${
                          avatarColor === c.id ? `${c.ring} ring-offset-2 ring-offset-[#0A0C10] scale-110` : 'ring-transparent opacity-50'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-800/50 bg-slate-900/50">
                <button 
                  onClick={handleSave}
                  className="w-full flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 py-2.5 rounded-md font-bold text-xs uppercase tracking-widest transition-colors shadow-[0_0_20px_rgba(34,211,238,0.2)]"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>

            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

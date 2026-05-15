import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Shield, RefreshCw, Save, TriangleAlert, Trophy, Sword, Star, Crown, Swords } from 'lucide-react';
import { Achievement } from '../../dashboard/utils/dashboardUtils';
import { cn } from '../../../shared/utils/cn';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  achievements?: Achievement[];
  onSaveProfile: (data: any) => Promise<void>;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ 
  isOpen, onClose, user, achievements = [], onSaveProfile 
}) => {
  const [name, setName] = useState(user?.name || '');
  const [title, setTitle] = useState(user?.title || '');
  const [avatarColor, setAvatarColor] = useState(user?.avatar_color || 'indigo');
  const [activeTab, setActiveTab] = useState<'profile' | 'badges'>('profile');

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

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sword': return <Sword className="w-5 h-5" />;
      case 'Shield': return <Shield className="w-5 h-5" />;
      case 'Swords': return <Swords className="w-5 h-5" />;
      case 'Star': return <Star className="w-5 h-5" />;
      case 'Crown': return <Crown className="w-5 h-5" />;
      default: return <Trophy className="w-5 h-5" />;
    }
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
              className="bg-[#0A0C10] border border-slate-700/50 rounded-xl shadow-2xl w-full max-w-md pointer-events-auto flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-4 border-b border-slate-800/50 flex flex-col gap-4 bg-slate-900/50 rounded-t-xl shrink-0">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-slate-400" />
                    <h3 className="text-sm font-bold text-white tracking-widest uppercase">Hero Dossier</h3>
                  </div>
                  <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-md text-slate-400">
                    <X className="w-4 h-4" />
                   </button>
                </div>
                
                <div className="flex bg-slate-800/50 p-1 rounded-lg">
                  <button 
                    onClick={() => setActiveTab('profile')}
                    className={cn(
                      "flex-1 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-colors",
                      activeTab === 'profile' ? "bg-slate-700 text-white" : "text-slate-400 hover:text-slate-200"
                    )}
                  >
                    IDENTITAS
                  </button>
                  <button 
                    onClick={() => setActiveTab('badges')}
                    className={cn(
                      "flex-1 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-colors",
                      activeTab === 'badges' ? "bg-slate-700 text-white" : "text-slate-400 hover:text-slate-200"
                    )}
                  >
                    BADGES
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 overflow-y-auto flex-1 min-h-[300px]">
                {activeTab === 'profile' ? (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col gap-6"
                  >
                    <div className="flex flex-col gap-4">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Identification</h4>
                      
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
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Aesthetics</h4>
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
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col gap-4"
                  >
                    {achievements.length === 0 ? (
                      <div className="text-center py-10 flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center">
                          <Trophy className="w-6 h-6 text-slate-600" />
                        </div>
                        <p className="text-sm text-slate-500 font-mono">Belum ada achievement.<br/>Lakukan sesuatu yang epik!</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3">
                        {achievements.map((ach) => (
                          <div 
                            key={ach.id} 
                            className={cn(
                              "flex items-center gap-4 p-3 rounded-lg border",
                              ach.isUnlocked 
                                ? "bg-indigo-500/10 border-indigo-500/30" 
                                : "bg-slate-900/50 border-slate-800 grayscale opacity-50"
                            )}
                          >
                            <div className={cn(
                              "w-12 h-12 shrink-0 rounded-full flex items-center justify-center shadow-inner",
                              ach.isUnlocked ? "bg-gradient-to-br from-indigo-500 to-cyan-500 text-white" : "bg-slate-800 text-slate-500"
                            )}>
                              {getIcon(ach.icon)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="text-sm font-bold text-slate-200 truncate">{ach.title}</h5>
                              <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{ach.description}</p>
                              <div className="mt-2 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                <div 
                                  className={cn("h-full transition-all duration-1000", ach.isUnlocked ? "bg-cyan-400" : "bg-slate-500")}
                                  style={{ width: `${(ach.progress / (ach.maxProgress || 1)) * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </div>

              {/* Footer */}
              {activeTab === 'profile' && (
                <div className="p-4 border-t border-slate-800/50 bg-slate-900/50 shrink-0">
                  <button 
                    onClick={handleSave}
                    className="w-full flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 py-2.5 rounded-md font-bold text-xs uppercase tracking-widest transition-colors shadow-[0_0_20px_rgba(34,211,238,0.2)]"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                </div>
              )}

            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Save, Trophy, Sword, Star, Crown, Swords, Shield, X } from 'lucide-react';
import { Achievement } from '../../dashboard/utils/dashboardUtils';
import { cn } from '../../../shared/utils/cn';
import { Modal } from '../../../shared/components/Modal';
import { Input } from '../../../shared/components/Input';
import { Button } from '../../../shared/components/Button';

import type { UserStats } from '../../../shared/types/user';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserStats;
  achievements?: Achievement[];
  onSaveProfile: (data: Partial<UserStats>) => Promise<void>;
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-md"
    >
      <div className="px-6 pt-4 pb-2 border-b border-white/5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-display font-bold text-white tracking-tight">Hero Dossier</h2>
          <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
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

      <div className="p-4 sm:p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'profile' ? (
            <motion.div 
              key="profile"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex flex-col gap-6"
            >
              <div className="flex flex-col gap-4">
                <Input 
                  label="Call Sign (Name)"
                  value={name} 
                  onChange={e => setName(e.target.value)}
                  className="font-mono"
                />
                <Input 
                  label="Designation (Title)"
                  value={title} 
                  onChange={e => setTitle(e.target.value)}
                  className="font-mono"
                />
              </div>

              <div className="flex flex-col gap-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Aesthetics</h4>
                <div className="flex gap-3">
                  {colors.map(c => (
                    <button 
                      key={c.id}
                      onClick={() => setAvatarColor(c.id)}
                      className={`w-10 h-10 rounded-full ${c.hex} flex items-center justify-center ring-2 transition-all ${
                        avatarColor === c.id ? `${c.ring} ring-offset-2 ring-offset-[#0A0C10] scale-110` : 'ring-transparent opacity-50'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/5">
                <Button 
                  variant="primary"
                  onClick={handleSave}
                  className="w-full gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="badges"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex flex-col gap-4 pb-2"
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
                        "flex items-center gap-4 p-3 rounded-xl border",
                        ach.isUnlocked 
                          ? "bg-indigo-500/10 border-indigo-500/30" 
                          : "bg-slate-900 border-slate-800 grayscale opacity-50"
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
        </AnimatePresence>
      </div>
    </Modal>
  );
};

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Save, Trophy, Sword, Star, Crown, Swords, Shield, X, Heart, Zap, Lock, Palette, Monitor } from 'lucide-react';
import { Achievement } from '../../dashboard/utils/dashboardUtils';
import { useDashboardStore } from '../../../store/dashboardStore';
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
  coins?: number;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ 
  isOpen, onClose, user, achievements = [], onSaveProfile, coins = 0
}) => {
  const { buyItem } = useDashboardStore();
  const [name, setName] = useState(user?.name || '');
  const [title, setTitle] = useState(user?.title || '');
  const [avatarColor, setAvatarColor] = useState(user?.avatar_color || 'indigo');
  const [avatarIcon, setAvatarIcon] = useState(user?.avatar_icon || 'shield');
  const [activeTab, setActiveTab] = useState<'profile' | 'badges' | 'shop'>('profile');
  const [isBuying, setIsBuying] = useState<string | null>(null);

  let unlockedItems: string[] = [];
  try {
    if (user?.unlocked_items) unlockedItems = JSON.parse(user.unlocked_items);
  } catch(e) {}

  const colors = [
    { id: 'indigo', hex: 'bg-indigo-500', ring: 'ring-indigo-400', text: 'text-indigo-400', from: 'from-indigo-500/20' },
    { id: 'emerald', hex: 'bg-emerald-500', ring: 'ring-emerald-400', text: 'text-emerald-400', from: 'from-emerald-500/20' },
    { id: 'amber', hex: 'bg-amber-500', ring: 'ring-amber-400', text: 'text-amber-400', from: 'from-amber-500/20' },
    { id: 'cyan', hex: 'bg-accent-500', ring: 'ring-accent-400', text: 'text-accent-400', from: 'from-accent-500/20', premium: true, unlockId: 'aesthetic_color_cyan' },
    { id: 'rose', hex: 'bg-rose-500', ring: 'ring-rose-400', text: 'text-rose-400', from: 'from-rose-500/20', premium: true, unlockId: 'aesthetic_color_rose' },
  ];

  const handleSave = async () => {
    await onSaveProfile({ name, title, avatar_color: avatarColor, avatar_icon: avatarIcon });
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
          <button 
            onClick={() => setActiveTab('shop')}
            className={cn(
              "flex-1 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-colors",
              activeTab === 'shop' ? "bg-slate-700 text-white" : "text-slate-400 hover:text-slate-200"
            )}
          >
            SHOP
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'profile' && (
            <motion.div 
              key="profile"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex flex-col gap-6"
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4 bg-slate-800/30 p-4 rounded-xl border border-white/5 mb-2">
                  <div className={`relative w-16 h-16 rounded-2xl flex flex-col items-center justify-center shadow-inner overflow-hidden ring-2 ${colors.find(c => c.id === avatarColor)?.ring || 'ring-indigo-400'}`}>
                    <div className={cn("absolute inset-0 bg-gradient-to-tr to-purple-500/20", colors.find(c => c.id === avatarColor)?.from)}></div>
                    <div className={cn("z-10", colors.find(c => c.id === avatarColor)?.text)}>
                      {getIcon(avatarIcon)}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-white font-mono text-lg">{name || 'Explorer'}</h3>
                    <p className="text-sm text-slate-400">{title || 'Novice Operative'}</p>
                  </div>
                </div>

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
                  {colors.map(c => {
                    const isLocked = c.premium && !unlockedItems.includes(c.unlockId!);
                    return (
                      <button 
                        key={c.id}
                        onClick={() => !isLocked && setAvatarColor(c.id)}
                        disabled={isLocked}
                        className={`relative w-10 h-10 rounded-full ${c.hex} flex items-center justify-center ring-2 transition-all ${
                          avatarColor === c.id ? `${c.ring} ring-offset-2 ring-offset-surface scale-110` : 'ring-transparent opacity-50'
                        } ${isLocked ? 'grayscale opacity-30 cursor-not-allowed' : 'cursor-pointer hover:opacity-100'}`}
                      >
                        {isLocked && <Lock className="w-4 h-4 text-white/70 absolute" />}
                      </button>
                    );
                  })}
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
          )}

          {activeTab === 'badges' && (
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
                        ach.isUnlocked ? "bg-linear-to-br from-indigo-500 to-cyan-500 text-white" : "bg-slate-800 text-slate-500"
                      )}>
                        {getIcon(ach.icon)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <h5 className="text-sm font-bold text-slate-200 truncate">{ach.title}</h5>
                          {ach.isUnlocked && (
                            <button
                              onClick={() => {
                                setAvatarIcon(ach.icon);
                                setActiveTab('profile'); // Send them back to profile to see it, and save it.
                              }}
                              className={cn(
                                "text-[10px] px-2 py-1 rounded-sm uppercase tracking-wider font-bold transition-colors border",
                                avatarIcon === ach.icon 
                                  ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" 
                                  : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-white"
                              )}
                            >
                              {avatarIcon === ach.icon ? 'Equipped' : 'Equip'}
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{ach.description}</p>
                        <div className="mt-2 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={cn("h-full transition-all duration-1000", ach.isUnlocked ? "bg-accent-400" : "bg-slate-500")}
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

          {activeTab === 'shop' && (
            <motion.div 
              key="shop"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex flex-col gap-4 pb-2"
            >
              <div className="flex items-center justify-between p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-2">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-400" fill="currentColor" />
                  <span className="font-mono font-bold text-amber-400 text-lg">{coins}</span>
                </div>
                <div className="text-xs text-amber-500/70 font-mono uppercase tracking-widest">Koin Tersedia</div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                
                {/* HP Elixir */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl border bg-slate-900 border-slate-800 hover:border-emerald-500/30 transition-colors group">
                  <div className="w-12 h-12 shrink-0 rounded-full flex items-center justify-center shadow-inner bg-linear-to-br from-emerald-500/20 to-emerald-500/5 text-emerald-400 group-hover:scale-110 transition-transform">
                    <Heart className="w-6 h-6" fill="currentColor" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-sm font-bold text-slate-200">HP Elixir (Ramuan Stamina)</h5>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">Memulihkan +30 HP. Menolongmu jika kelelahan agar tidak putus asa.</p>
                  </div>
                  <Button 
                    variant="primary" 
                    size="sm" 
                    className="w-full sm:w-auto gap-2 bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-white border border-amber-500/20"
                    disabled={coins < 150 || isBuying === 'hp_elixir'}
                    onClick={async () => {
                      setIsBuying('hp_elixir');
                      await buyItem('hp_elixir', 150, coins);
                      setIsBuying(null);
                    }}
                  >
                    {isBuying === 'hp_elixir' ? '...' : (
                      <>
                        <Star className="w-4 h-4" /> 150
                      </>
                    )}
                  </Button>
                </div>

                {/* Mana Tonic */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl border bg-slate-900 border-slate-800 hover:border-cyan-500/30 transition-colors group">
                  <div className="w-12 h-12 shrink-0 rounded-full flex items-center justify-center shadow-inner bg-linear-to-br from-cyan-500/20 to-cyan-500/5 text-cyan-400 group-hover:scale-110 transition-transform">
                    <Zap className="w-6 h-6" fill="currentColor" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-sm font-bold text-slate-200">Mana Focus Tonic</h5>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">Memulihkan +20 Mana. Membantu mengurangi burnout hari ini.</p>
                  </div>
                  <Button 
                    variant="primary" 
                    size="sm" 
                    className="w-full sm:w-auto gap-2 bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-white border border-amber-500/20"
                    disabled={coins < 200 || isBuying === 'mana_tonic'}
                    onClick={async () => {
                      setIsBuying('mana_tonic');
                      await buyItem('mana_tonic', 200, coins);
                      setIsBuying(null);
                    }}
                  >
                    {isBuying === 'mana_tonic' ? '...' : (
                      <>
                        <Star className="w-4 h-4" /> 200
                      </>
                    )}
                  </Button>
                </div>

                {/* Streak Shield */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl border bg-slate-900 border-slate-800 hover:border-indigo-500/30 transition-colors group">
                  <div className="w-12 h-12 shrink-0 rounded-full flex items-center justify-center shadow-inner bg-linear-to-br from-indigo-500/20 to-indigo-500/5 text-indigo-400 group-hover:scale-110 transition-transform">
                    <Shield className="w-6 h-6" fill="currentColor" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h5 className="text-sm font-bold text-slate-200">Streak Shield</h5>
                      {user.shield_until && new Date(user.shield_until).getTime() > Date.now() && (
                        <span className="text-[10px] font-bold uppercase tracking-widest bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-sm">
                          Aktif
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">Anti-Bolos! Mencegah pengurangan HP jika kamu tidak mengerjakan quest hari ini.</p>
                  </div>
                  <Button 
                    variant="primary" 
                    size="sm" 
                    className="w-full sm:w-auto gap-2 bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-white border border-amber-500/20 relative"
                    disabled={coins < 500 || isBuying === 'streak_shield'}
                    onClick={async () => {
                      setIsBuying('streak_shield');
                      await buyItem('streak_shield', 500, coins);
                      setIsBuying(null);
                    }}
                  >
                    {isBuying === 'streak_shield' ? '...' : (
                      <>
                        <Star className="w-4 h-4" /> 500
                      </>
                    )}
                  </Button>
                </div>

                {/* Aesthetics Heading */}
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-4">Aesthetics</h4>

                {/* Adaptive Accent Avatar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl border bg-slate-900 border-slate-800 hover:border-accent-500/30 transition-colors group">
                  <div className="w-12 h-12 shrink-0 rounded-full flex items-center justify-center shadow-inner bg-accent-500/20 text-accent-400 group-hover:scale-110 transition-transform">
                    <Palette className="w-6 h-6" fill="currentColor" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-sm font-bold text-slate-200">Warna Premium: Adaptive Accent</h5>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">Buka warna yang menyala terang dan beradaptasi dengan tema senada.</p>
                  </div>
                  <Button 
                    variant="primary" 
                    size="sm" 
                    className="w-full sm:w-auto gap-2 bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-white border border-amber-500/20"
                    disabled={unlockedItems.includes('aesthetic_color_cyan') || coins < 300 || user.level < 5 || isBuying === 'aesthetic_color_cyan'}
                    onClick={async () => {
                      setIsBuying('aesthetic_color_cyan');
                      await buyItem('aesthetic_color_cyan', 300, coins);
                      setIsBuying(null);
                    }}
                  >
                    {unlockedItems.includes('aesthetic_color_cyan') ? 'OWNED' : isBuying === 'aesthetic_color_cyan' ? '...' : (
                      <>
                        <Star className="w-4 h-4" /> 300 {user.level < 5 && '(Lv.5)'}
                      </>
                    )}
                  </Button>
                </div>

                {/* Crimson Gold Avatar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl border bg-slate-900 border-slate-800 hover:border-rose-500/30 transition-colors group">
                  <div className="w-12 h-12 shrink-0 rounded-full flex items-center justify-center shadow-inner bg-rose-500/20 text-rose-400 group-hover:scale-110 transition-transform">
                    <Palette className="w-6 h-6" fill="currentColor" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-sm font-bold text-slate-200">Warna Premium: Crimson Rose</h5>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">Buka warna rose kemerahan untuk avatarmu.</p>
                  </div>
                  <Button 
                    variant="primary" 
                    size="sm" 
                    className="w-full sm:w-auto gap-2 bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-white border border-amber-500/20"
                    disabled={unlockedItems.includes('aesthetic_color_rose') || coins < 300 || user.level < 5 || isBuying === 'aesthetic_color_rose'}
                    onClick={async () => {
                      setIsBuying('aesthetic_color_rose');
                      await buyItem('aesthetic_color_rose', 300, coins);
                      setIsBuying(null);
                    }}
                  >
                    {unlockedItems.includes('aesthetic_color_rose') ? 'OWNED' : isBuying === 'aesthetic_color_rose' ? '...' : (
                      <>
                        <Star className="w-4 h-4" /> 300 {user.level < 5 && '(Lv.5)'}
                      </>
                    )}
                  </Button>
                </div>

                {/* Matrix Green Theme */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl border bg-slate-900 border-slate-800 hover:border-emerald-500/30 transition-colors group">
                  <div className="w-12 h-12 shrink-0 rounded-full flex items-center justify-center shadow-inner bg-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
                    <Monitor className="w-6 h-6" fill="currentColor" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-sm font-bold text-slate-200">Tema Eksklusif: Matrix Green</h5>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">Buka nuansa hacker. Dapat diakses dari pengaturan tema setelah dibeli.</p>
                  </div>
                  <Button 
                    variant="primary" 
                    size="sm" 
                    className="w-full sm:w-auto gap-2 bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-white border border-amber-500/20"
                    disabled={unlockedItems.includes('aesthetic_theme_matrix') || coins < 800 || user.level < 8 || isBuying === 'aesthetic_theme_matrix'}
                    onClick={async () => {
                      setIsBuying('aesthetic_theme_matrix');
                      await buyItem('aesthetic_theme_matrix', 800, coins);
                      setIsBuying(null);
                    }}
                  >
                    {unlockedItems.includes('aesthetic_theme_matrix') ? 'OWNED' : isBuying === 'aesthetic_theme_matrix' ? '...' : (
                      <>
                        <Star className="w-4 h-4" /> 800 {user.level < 8 && '(Lv.8)'}
                      </>
                    )}
                  </Button>
                </div>

                {/* Neon Glow Theme */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl border bg-slate-900 border-slate-800 hover:border-purple-500/30 transition-colors group">
                  <div className="w-12 h-12 shrink-0 rounded-full flex items-center justify-center shadow-inner bg-purple-500/20 text-purple-400 group-hover:scale-110 transition-transform">
                    <Monitor className="w-6 h-6" fill="currentColor" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-sm font-bold text-slate-200">Tema Eksklusif: Neon Glow</h5>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">Buka aura synthwave dan gemerlap kota malam.</p>
                  </div>
                  <Button 
                    variant="primary" 
                    size="sm" 
                    className="w-full sm:w-auto gap-2 bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-white border border-amber-500/20"
                    disabled={unlockedItems.includes('aesthetic_theme_neon') || coins < 800 || user.level < 8 || isBuying === 'aesthetic_theme_neon'}
                    onClick={async () => {
                      setIsBuying('aesthetic_theme_neon');
                      await buyItem('aesthetic_theme_neon', 800, coins);
                      setIsBuying(null);
                    }}
                  >
                    {unlockedItems.includes('aesthetic_theme_neon') ? 'OWNED' : isBuying === 'aesthetic_theme_neon' ? '...' : (
                      <>
                        <Star className="w-4 h-4" /> 800 {user.level < 8 && '(Lv.8)'}
                      </>
                    )}
                  </Button>
                </div>

                {/* Title: Vanguard */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl border bg-slate-900 border-slate-800 hover:border-blue-500/30 transition-colors group">
                  <div className="w-12 h-12 shrink-0 rounded-full flex items-center justify-center shadow-inner bg-blue-500/20 text-blue-400 group-hover:scale-110 transition-transform">
                    <Crown className="w-6 h-6" fill="currentColor" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-sm font-bold text-slate-200">Gelar: Code Vanguard</h5>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">Gelar elit untuk dipajang di profilmu.</p>
                  </div>
                  <Button 
                    variant="primary" 
                    size="sm" 
                    className="w-full sm:w-auto gap-2 bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-white border border-amber-500/20"
                    disabled={unlockedItems.includes('aesthetic_title_vanguard') || coins < 1000 || isBuying === 'aesthetic_title_vanguard'}
                    onClick={async () => {
                      setIsBuying('aesthetic_title_vanguard');
                      await buyItem('aesthetic_title_vanguard', 1000, coins);
                      onSaveProfile({ title: 'Code Vanguard' });
                      setIsBuying(null);
                    }}
                  >
                    {unlockedItems.includes('aesthetic_title_vanguard') ? 'OWNED' : isBuying === 'aesthetic_title_vanguard' ? '...' : (
                      <>
                        <Star className="w-4 h-4" /> 1000
                      </>
                    )}
                  </Button>
                </div>

                {/* Title: Legendary Committer */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl border bg-slate-900 border-slate-800 hover:border-yellow-500/30 transition-colors group">
                  <div className="w-12 h-12 shrink-0 rounded-full flex items-center justify-center shadow-inner bg-yellow-500/20 text-yellow-400 group-hover:scale-110 transition-transform">
                    <Crown className="w-6 h-6" fill="currentColor" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-sm font-bold text-slate-200">Gelar: Legendary Committer</h5>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">Gelar mitos, otomatis dipakai saat beli.</p>
                  </div>
                  <Button 
                    variant="primary" 
                    size="sm" 
                    className="w-full sm:w-auto gap-2 bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-white border border-amber-500/20"
                    disabled={unlockedItems.includes('aesthetic_title_legendary') || coins < 1500 || isBuying === 'aesthetic_title_legendary'}
                    onClick={async () => {
                      setIsBuying('aesthetic_title_legendary');
                      await buyItem('aesthetic_title_legendary', 1500, coins);
                      onSaveProfile({ title: 'Legendary Committer' });
                      setIsBuying(null);
                    }}
                  >
                    {unlockedItems.includes('aesthetic_title_legendary') ? 'OWNED' : isBuying === 'aesthetic_title_legendary' ? '...' : (
                      <>
                        <Star className="w-4 h-4" /> 1500
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
};

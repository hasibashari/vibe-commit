import React from 'react';
import { motion } from 'motion/react';
import { Heart, Zap, Star, Shield, Settings, Volume2, VolumeX } from 'lucide-react';
import { useAudio } from '../providers/AudioProvider';

interface TopBarProps {
  hp: number;
  mana: number;
  level: number;
  exp: number;
  coins: number;
  user?: any;
  onOpenProfile?: () => void;
  onOpenSettings?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ hp, mana, level, exp, coins, user, onOpenProfile, onOpenSettings }) => {
  const { isMuted, toggleMute } = useAudio();
  const avatarColorMap: Record<string, { from: string; text: string }> = {
    indigo: { from: 'from-indigo-500/20', text: 'text-indigo-400' },
    rose: { from: 'from-rose-500/20', text: 'text-rose-400' },
    cyan: { from: 'from-cyan-500/20', text: 'text-cyan-400' },
    emerald: { from: 'from-emerald-500/20', text: 'text-emerald-400' },
    amber: { from: 'from-amber-500/20', text: 'text-amber-400' },
  };

  const cColor = user?.avatar_color || 'indigo';
  const colorClasses = avatarColorMap[cColor] || avatarColorMap.indigo;

  return (
    <header className="sticky top-0 z-50 transition-all duration-300 w-full bg-[#0A0C10]/95 backdrop-blur-xl border-b border-white/5 flex flex-col lg:flex-row lg:items-center justify-between px-4 py-3 md:px-6 shadow-sm gap-4 lg:gap-0">
      
      {/* Left: User / Level Info */}
      <div className="flex items-center justify-between lg:justify-start w-full lg:w-auto gap-4">
        <div className="flex items-center gap-3">
          <button onClick={onOpenProfile} className="relative w-10 h-10 md:w-12 md:h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center overflow-hidden shadow-inner group hover:border-slate-400 transition-colors shrink-0">
            <div className={`absolute inset-0 bg-gradient-to-tr ${colorClasses.from} to-purple-500/20`}></div>
            <Shield className={`w-5 h-5 md:w-6 md:h-6 ${colorClasses.text} group-hover:scale-110 transition-transform`} />
          </button>
          
          <div className="flex flex-col">
            <button onClick={onOpenProfile} className="font-display text-sm md:text-base font-bold text-white tracking-wide text-left hover:text-cyan-400 transition-colors">
              {user?.name || 'Player_One'}
            </button>
            <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">{user?.title || 'Novice Operative'}</span>
          </div>
        </div>

        {/* Mobile Settings/Coins row - hidden on desktop */}
        <div className="flex lg:hidden items-center gap-2">
          <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1.5 rounded-md border border-white/10">
            <Star className="w-3.5 h-3.5 text-amber-400" fill="currentColor" />
            <span className="text-xs font-mono font-bold text-amber-400">{coins}</span>
          </div>
          <button onClick={toggleMute} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-colors">
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>
          <button onClick={onOpenSettings} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-colors">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Right: RPG Stats */}
      <div className="flex items-center justify-between lg:justify-end gap-4 lg:gap-6 w-full lg:w-auto">
        
        {/* EXP Bar (Moved here for better grid) */}
        <div className="flex flex-col gap-1 min-w-[80px] flex-1 lg:flex-none lg:w-32">
          <div className="flex justify-between items-center text-xs font-bold tracking-widest uppercase">
            <span className="text-amber-400">Lv {level}</span>
            <span className="text-slate-400">{exp.toFixed(0)} <span className="text-slate-600">%</span></span>
          </div>
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden p-[1px]">
            <motion.div initial={{ width: 0 }} animate={{ width: `${exp}%` }} className="h-full bg-amber-400 rounded-full"></motion.div>
          </div>
        </div>

        {/* HP Bar */}
        <div className="flex flex-col gap-1 min-w-[80px] flex-1 lg:flex-none lg:w-32">
          <div className="flex justify-between items-center text-xs font-bold tracking-widest uppercase">
            <span className="text-emerald-400 flex items-center gap-1"><Heart className="w-3 h-3" fill="currentColor" /> HP</span>
            <span className="text-slate-200">{hp.toFixed(0)}</span>
          </div>
          <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/5">
            <motion.div initial={{ width: 0 }} animate={{ width: `${hp}%` }} className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400"></motion.div>
          </div>
        </div>

        {/* MP Bar */}
        <div className="flex flex-col gap-1 min-w-[80px] flex-1 lg:flex-none lg:w-32">
          <div className="flex justify-between items-center text-xs font-bold tracking-widest uppercase">
            <span className="text-cyan-400 flex items-center gap-1"><Zap className="w-3 h-3" fill="currentColor" /> MP</span>
            <span className="text-slate-200">{mana.toFixed(0)}</span>
          </div>
          <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/5">
            <motion.div initial={{ width: 0 }} animate={{ width: `${mana}%` }} className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400"></motion.div>
          </div>
        </div>

        {/* Coins/Points - Desktop */}
        <div className="hidden lg:flex items-center gap-1.5 bg-white/5 px-2.5 py-1.5 rounded-md border border-white/10 shrink-0">
          <Star className="w-3.5 h-3.5 text-amber-400" fill="currentColor" />
          <span className="text-xs font-mono font-bold text-amber-400">{coins}</span>
        </div>

        <div className="hidden lg:flex items-center gap-2 shrink-0">
          <button onClick={toggleMute} className="flex w-8 h-8 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-colors">
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>
          
          {/* Settings - Desktop */}
          <button onClick={onOpenSettings} className="flex w-8 h-8 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-colors">
            <Settings className="w-4 h-4" />
          </button>
        </div>

      </div>

    </header>
  );
};

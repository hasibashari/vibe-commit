import React from 'react';
import { motion } from 'motion/react';
import { Heart, Zap, Star, Shield, Settings } from 'lucide-react';

interface RPGHeaderProps {
  hp: number;
  mana: number;
  level: number;
  exp: number;
  coins: number;
  user?: any;
  onOpenProfile?: () => void;
  onOpenSettings?: () => void;
}

export const RPGHeader: React.FC<RPGHeaderProps> = ({ hp, mana, level, exp, coins, user, onOpenProfile, onOpenSettings }) => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  
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
    <header className="sticky top-0 z-50 transition-all duration-300 w-full bg-[#0A0C10]/95 backdrop-blur-xl border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between px-4 py-3 md:px-6 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      
      {/* Left: User / Level Info */}
      <div className="flex items-center gap-4 mb-3 md:mb-0">
        <button onClick={onOpenProfile} className="relative w-12 h-12 bg-slate-800 border-2 border-slate-600 rounded-lg flex items-center justify-center overflow-hidden shadow-inner group hover:border-slate-400 transition-colors">
          <div className={`absolute inset-0 bg-gradient-to-tr ${colorClasses.from} to-purple-500/20`}></div>
          <Shield className={`w-6 h-6 ${colorClasses.text} group-hover:scale-110 transition-transform`} />
        </button>
        
        <div className="flex flex-col">
          <div className="flex flex-col mb-1">
            <button onClick={onOpenProfile} className="font-display text-base font-bold text-white tracking-wide text-left hover:text-slate-300 transition-colors">
              {user?.name || 'Player_One'}
            </button>
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">{user?.title || 'Novice Operative'}</span>
          </div>
          
          {/* EXP Bar */}
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest w-6">Lv {level}</span>
            <div className="w-24 md:w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden p-[1px]">
              <motion.div initial={{ width: 0 }} animate={{ width: `${exp}%` }} className="h-full bg-amber-400 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.5)]"></motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Right: RPG Stats */}
      <div className="flex gap-4 md:gap-6 items-center w-full md:w-auto">
        
        {/* HP Bar */}
        <div className="flex flex-col gap-0.5 min-w-[80px] flex-1">
          <div className="flex justify-between items-center text-[9px] font-bold tracking-widest uppercase">
            <span className="text-emerald-400 flex items-center gap-1"><Heart className="w-3 h-3" fill="currentColor" /> HP</span>
            <span className="text-slate-200">{hp.toFixed(0)} <span className="text-slate-500">/ 100</span></span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
            <motion.div initial={{ width: 0 }} animate={{ width: `${hp}%` }} className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]"></motion.div>
          </div>
        </div>

        {/* MP Bar */}
        <div className="flex flex-col gap-0.5 min-w-[80px] flex-1">
          <div className="flex justify-between items-center text-[9px] font-bold tracking-widest uppercase">
            <span className="text-cyan-400 flex items-center gap-1"><Zap className="w-3 h-3" fill="currentColor" /> MP</span>
            <span className="text-slate-200">{mana.toFixed(0)} <span className="text-slate-500">/ 100</span></span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
            <motion.div initial={{ width: 0 }} animate={{ width: `${mana}%` }} className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]"></motion.div>
          </div>
        </div>

        {/* Coins/Points */}
        <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700 ml-auto flex-shrink-0">
          <Star className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" />
          <span className="text-xs font-mono font-bold text-yellow-400">{coins}</span>
        </div>

        {/* Settings */}
        <button onClick={onOpenSettings} className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors ml-1">
          <Settings className="w-4 h-4" />
        </button>

      </div>

    </header>
  );
};

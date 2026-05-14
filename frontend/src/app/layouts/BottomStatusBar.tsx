import React from 'react';

interface BottomStatusBarProps {
  activeQuestsCount: number;
  totalExp: number;
}

export function BottomStatusBar({ activeQuestsCount, totalExp }: BottomStatusBarProps) {
  return (
    <footer className="hidden md:flex h-8 border-t border-slate-800 items-center justify-between shrink-0 font-mono text-[9px] md:text-[10px] text-slate-500 px-1 mt-auto">
      <div className="flex gap-4 md:gap-6 items-center">
        <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> SYS: OK</span>
        <span className="hidden sm:inline">ACTIVE_QUESTS: {activeQuestsCount}</span>
        <span className="text-cyan-800 truncate">STREAK_BYPASS: TRUE</span>
      </div>
      <div className="flex gap-4 md:gap-6 items-center">
        <span className="text-slate-700 tracking-tighter truncate">TOTAL_EXP: {totalExp.toString(16).padStart(8, '0')}</span>
        <span className="text-cyan-900 font-bold hidden sm:inline">[SYSTEM_ONLINE]</span>
      </div>
    </footer>
  );
}

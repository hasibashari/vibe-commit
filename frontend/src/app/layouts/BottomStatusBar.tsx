import React from 'react';

interface BottomStatusBarProps {
  activeQuestsCount: number;
}

export function BottomStatusBar({ activeQuestsCount }: BottomStatusBarProps) {
  return (
    <footer className="hidden md:flex h-6 border-t border-slate-800 items-center justify-between shrink-0 font-mono text-[9px] md:text-[10px] text-slate-500 px-2 mt-auto">
      <div className="flex gap-4 items-center">
        <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> SYS: OK</span>
        <span className="hidden sm:inline">ACTIVE_QUESTS: {activeQuestsCount}</span>
      </div>
      <div className="flex items-center">
        <span className="text-slate-600 tracking-tighter truncate">v2.4.1</span>
      </div>
    </footer>
  );
}

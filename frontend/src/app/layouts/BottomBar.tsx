import React from 'react';
import { Shield, Target, Plus, BrainCircuit, BarChart3 } from 'lucide-react';
import type { Tab } from '../../app/App'; // Will update if necessary

interface BottomBarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  onOpenBrainDump: () => void;
  onNewQuest: () => void;
}

export function BottomBar({ activeTab, setActiveTab, onOpenBrainDump, onNewQuest }: BottomBarProps) {
  return (
    <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md z-[100] pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around items-center h-16 px-1 bg-slate-950/90 backdrop-blur-2xl border border-slate-700/50 shadow-[0_10px_40px_rgba(0,0,0,0.8),inset_0_1px_rgba(255,255,255,0.1)] rounded-2xl relative">
        
        <button onClick={() => setActiveTab('character')} className="flex flex-col items-center justify-center w-[18%] h-full gap-1 group relative">
          <div className={`absolute -top-px w-6 h-0.5 rounded-b-full transition-all duration-300 ${activeTab === 'character' ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]' : 'bg-transparent'}`} />
          <Shield className={`w-[22px] h-[22px] transition-all duration-300 ${activeTab === 'character' ? 'text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)] -translate-y-1' : 'text-slate-500 group-hover:text-slate-400'}`} />
          <span className={`text-xs font-bold uppercase tracking-widest transition-all duration-300 absolute bottom-1 ${activeTab === 'character' ? 'opacity-100 text-rose-300' : 'opacity-0 text-slate-500'}`}>Status</span>
        </button>
        
        <button onClick={() => setActiveTab('dashboard')} className="flex flex-col items-center justify-center w-[18%] h-full gap-1 group relative">
          <div className={`absolute -top-px w-6 h-0.5 rounded-b-full transition-all duration-300 ${activeTab === 'dashboard' ? 'bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.8)]' : 'bg-transparent'}`} />
          <BarChart3 className={`w-[22px] h-[22px] transition-all duration-300 ${activeTab === 'dashboard' ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] -translate-y-1' : 'text-slate-500 group-hover:text-slate-400'}`} />
          <span className={`text-xs font-bold uppercase tracking-widest transition-all duration-300 absolute bottom-1 ${activeTab === 'dashboard' ? 'opacity-100 text-cyan-300' : 'opacity-0 text-slate-500'}`}>Hub</span>
        </button>

        <div className="flex flex-col items-center justify-center w-[20%] group relative z-10">
          <div className="absolute inset-x-0 -top-10 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-xl animate-pulse group-hover:bg-cyan-500/40 transition-all duration-300"></div>
              <button 
                onClick={onOpenBrainDump}
                className="relative w-14 h-14 bg-gradient-to-br from-cyan-400 to-emerald-500 rounded-full flex flex-col items-center justify-center text-slate-950 shadow-[0_4px_20px_rgba(6,182,212,0.5)] active:scale-95 transition-transform border-[3px] border-slate-900 overflow-hidden group/dump"
              >
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay pointer-events-none"></div>
                <BrainCircuit className="w-6 h-6 stroke-[2]" />
              </button>
            </div>
          </div>
        </div>

        <button onClick={() => setActiveTab('quests')} className="flex flex-col items-center justify-center w-[18%] h-full gap-1 group relative">
          <div className={`absolute -top-px w-6 h-0.5 rounded-b-full transition-all duration-300 ${activeTab === 'quests' ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]' : 'bg-transparent'}`} />
          <Target className={`w-[22px] h-[22px] transition-all duration-300 ${activeTab === 'quests' ? 'text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.8)] -translate-y-1' : 'text-slate-500 group-hover:text-slate-400'}`} />
          <span className={`text-xs font-bold uppercase tracking-widest transition-all duration-300 absolute bottom-1 ${activeTab === 'quests' ? 'opacity-100 text-indigo-300' : 'opacity-0 text-slate-500'}`}>Quest</span>
        </button>

        <button onClick={onNewQuest} className="flex flex-col items-center justify-center w-[18%] h-full gap-1 group relative pb-[2px]">
          <div className="absolute -top-px w-6 h-0.5 rounded-b-full bg-transparent group-active:bg-purple-500 transition-all duration-300" />
          <Plus className="w-[22px] h-[22px] transition-all duration-300 text-slate-500 group-hover:text-purple-400 active:scale-90 active:text-purple-400 group-active:-translate-y-1" />
          <span className="text-xs font-bold uppercase tracking-widest transition-all duration-300 absolute bottom-1 opacity-0 text-slate-500 group-hover:text-purple-300 group-hover:opacity-100">New</span>
        </button>
        
      </div>
    </div>
  );
}

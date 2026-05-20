
import { Shield, Target, Plus, BrainCircuit, BarChart3 } from 'lucide-react';
import type { Tab } from '../../shared/types/navigation';
import { Button } from '../../shared/components/Button';

interface BottomBarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  onOpenBrainDump: () => void;
  onNewQuest: () => void;
}

export function BottomBar({
  activeTab,
  setActiveTab,
  onOpenBrainDump,
  onNewQuest,
}: BottomBarProps) {
  return (
    <div className='md:hidden fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] max-w-md z-[100] pb-[env(safe-area-inset-bottom)]'>
      <div className='flex justify-around items-center h-14 sm:h-16 px-1 bg-slate-950/90 backdrop-blur-md border border-slate-700/50 shadow-[0_10px_40px_rgba(0,0,0,0.8),inset_0_1px_rgba(255,255,255,0.1)] rounded-xl sm:rounded-2xl relative'>
        <Button
          variant='ghost'
          onClick={() => setActiveTab('character')}
          className='!p-0 !bg-transparent hover:!bg-transparent flex flex-col items-center justify-center w-[18%] !h-full gap-1 group relative rounded-none'
        >
          <div
            className={`absolute -top-px w-6 h-0.5 rounded-b-full transition-all duration-300 ${activeTab === 'character' ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]' : 'bg-transparent'}`}
          />
          <Shield
            className={`w-[22px] h-[22px] transition-all duration-300 ${activeTab === 'character' ? 'text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)] -translate-y-1' : 'text-slate-500 group-hover:text-slate-400'}`}
          />
          <span
            className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all duration-300 absolute bottom-1 ${activeTab === 'character' ? 'opacity-100 text-rose-300' : 'opacity-0 text-slate-500'}`}
          >
            Status
          </span>
        </Button>

        <Button
          variant='ghost'
          onClick={() => setActiveTab('dashboard')}
          className='!p-0 !bg-transparent hover:!bg-transparent flex flex-col items-center justify-center w-[18%] !h-full gap-1 group relative rounded-none'
        >
          <div
            className={`absolute -top-px w-6 h-0.5 rounded-b-full transition-all duration-300 ${activeTab === 'dashboard' ? 'bg-accent-500 shadow-[0_0_10px_rgba(var(--theme-400-rgb),0.8)]' : 'bg-transparent'}`}
          />
          <BarChart3
            className={`w-[22px] h-[22px] transition-all duration-300 ${activeTab === 'dashboard' ? 'text-accent-400 drop-shadow-[0_0_8px_rgba(var(--theme-400-rgb),0.8)] -translate-y-1' : 'text-slate-500 group-hover:text-slate-400'}`}
          />
          <span
            className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all duration-300 absolute bottom-1 ${activeTab === 'dashboard' ? 'opacity-100 text-accent-300' : 'opacity-0 text-slate-500'}`}
          >
            Hub
          </span>
        </Button>

        <div className='flex flex-col items-center justify-center w-[20%] group relative z-10'>
          <div className='absolute inset-x-0 -top-10 flex justify-center'>
            <div className='relative'>
              <div className='absolute inset-0 bg-accent-500/20 rounded-full blur-xl animate-pulse group-hover:bg-accent-500/40 transition-all duration-300'></div>
              <Button
                variant='primary'
                onClick={onOpenBrainDump}
                className='!p-0 relative w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-accent-400 to-emerald-500 text-slate-950 hover:from-accent-300 hover:to-emerald-400 shadow-[0_4px_20px_rgba(var(--theme-500-rgb),0.5)] active:scale-95 transition-transform border-[3px] border-slate-900 overflow-hidden group/dump !rounded-full shrink-0'
              >
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay pointer-events-none"></div>
                <BrainCircuit className='w-6 h-6 stroke-[2]' />
              </Button>
            </div>
          </div>
        </div>

        <Button
          variant='ghost'
          onClick={() => setActiveTab('quests')}
          className='!p-0 !bg-transparent hover:!bg-transparent flex flex-col items-center justify-center w-[18%] !h-full gap-1 group relative rounded-none'
        >
          <div
            className={`absolute -top-px w-6 h-0.5 rounded-b-full transition-all duration-300 ${activeTab === 'quests' ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]' : 'bg-transparent'}`}
          />
          <Target
            className={`w-[22px] h-[22px] transition-all duration-300 ${activeTab === 'quests' ? 'text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.8)] -translate-y-1' : 'text-slate-500 group-hover:text-slate-400'}`}
          />
          <span
            className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all duration-300 absolute bottom-1 ${activeTab === 'quests' ? 'opacity-100 text-indigo-300' : 'opacity-0 text-slate-500'}`}
          >
            Quest
          </span>
        </Button>

        <Button
          variant='ghost'
          onClick={onNewQuest}
          className='!p-0 !bg-transparent hover:!bg-transparent flex flex-col items-center justify-center w-[18%] !h-full gap-1 group relative pb-[2px] rounded-none'
        >
          <div className='absolute -top-px w-6 h-0.5 rounded-b-full bg-transparent group-active:bg-purple-500 transition-all duration-300' />
          <Plus className='w-[22px] h-[22px] transition-all duration-300 text-slate-500 group-hover:text-purple-400 active:scale-90 active:text-purple-400 group-active:-translate-y-1' />
          <span className='text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all duration-300 absolute bottom-1 opacity-0 text-slate-500 group-hover:text-purple-300 group-hover:opacity-100'>
            New
          </span>
        </Button>
      </div>
    </div>
  );
}

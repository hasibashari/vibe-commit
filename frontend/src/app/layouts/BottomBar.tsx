import { Target, Plus, BarChart3, Edit3, Sparkles } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import type { Tab } from '../../shared/types/navigation';
import { Button } from '../../shared/components/Button';

interface BottomBarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  onNewQuest: () => void;
  onNewAiQuest?: () => void;
}

export function BottomBar({
  activeTab,
  setActiveTab,
  onNewQuest,
  onNewAiQuest,
}: BottomBarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  return (
    <div className='md:hidden fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] max-w-md z-[100] pb-[env(safe-area-inset-bottom)]'>
      <div className='flex justify-around items-center h-14 sm:h-16 px-2 bg-slate-950/90 backdrop-blur-md border border-slate-700/50 shadow-[0_10px_40px_rgba(0,0,0,0.8),inset_0_1px_rgba(255,255,255,0.1)] rounded-xl sm:rounded-2xl relative'>
        
        {/* Quest Tab */}
        <Button
          variant='ghost'
          onClick={() => setActiveTab('quests')}
          className='!p-0 !bg-transparent hover:!bg-transparent flex flex-col items-center justify-center w-[30%] !h-full gap-1 group relative rounded-none'
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

        {/* Command Hub Tab */}
        <Button
          variant='ghost'
          onClick={() => setActiveTab('dashboard')}
          className='!p-0 !bg-transparent hover:!bg-transparent flex flex-col items-center justify-center w-[30%] !h-full gap-1 group relative rounded-none'
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

        {/* New Quest Action Menu */}
        <div className='relative w-[30%] h-full flex justify-center items-center' ref={menuRef}>
          {/* Popup Menu */}
          <div className={`absolute bottom-full mb-4 w-48 bg-slate-900 border border-slate-700/50 shadow-[0_10px_40px_rgba(0,0,0,0.8)] rounded-xl overflow-visible transition-all duration-300 origin-bottom ${isMenuOpen ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 translate-y-4 pointer-events-none'}`}>
            <div className='flex flex-col p-1.5 gap-1 relative z-10 bg-slate-900 rounded-xl'>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onNewQuest();
                }}
                className='flex items-center gap-3 w-full px-3 py-2.5 text-left text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors'
              >
                <Edit3 className='w-4 h-4 text-emerald-400' />
                Buat Manual
              </button>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  if (onNewAiQuest) onNewAiQuest();
                }}
                className='flex items-center gap-3 w-full px-3 py-2.5 text-left text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400 hover:bg-slate-800 rounded-lg transition-colors'
              >
                <Sparkles className='w-4 h-4 text-purple-400' />
                Buat dgn AI
              </button>
            </div>
            {/* Triangle pointer */}
            <div className='absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-900 border-b border-r border-slate-700/50 transform rotate-45 z-0' />
          </div>

          {/* Toggle Button */}
          <Button
            variant='ghost'
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className='!p-0 !bg-transparent hover:!bg-transparent flex flex-col items-center justify-center w-full !h-full gap-1 group relative pb-[2px] rounded-none'
          >
            <div className={`absolute -top-px w-6 h-0.5 rounded-b-full bg-transparent group-active:bg-purple-500 transition-all duration-300 ${isMenuOpen ? 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)]' : ''}`} />
            <Plus className={`w-[22px] h-[22px] transition-all duration-300 text-slate-500 group-hover:text-purple-400 active:scale-90 active:text-purple-400 group-active:-translate-y-1 ${isMenuOpen ? 'rotate-45 text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)] -translate-y-1' : ''}`} />
            <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all duration-300 absolute bottom-1 ${isMenuOpen ? 'opacity-100 text-purple-300' : 'opacity-0 text-slate-500 group-hover:text-purple-300 group-hover:opacity-100'}`}>
              New
            </span>
          </Button>
        </div>

      </div>
    </div>
  );
}

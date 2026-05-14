import React from 'react';
import { Target, Check, ChevronRight, FlaskConical, Settings2, Trash2 } from 'lucide-react';
import type { Goal } from '../../../app/App'; // Will update path later

interface QuestItemProps {
  key?: React.Key;
  goal: Goal;
  onLog: () => void;
  onBranch: (goal: Goal) => void;
  onEdit: (goal: Goal) => void;
  onDrop: (goalId: string) => void;
  isSelected: boolean;
  isCompleted?: boolean;
  onClick: () => void;
}

export function QuestItem({ goal, onLog, onBranch, onEdit, onDrop, isSelected, isCompleted = false, onClick }: QuestItemProps) {
  return (
    <div 
      onClick={onClick}
      className={`group relative p-5 rounded-lg border transition-all cursor-pointer ${
        isSelected && !isCompleted ? 'bg-cyan-500/5 border-cyan-800' : 'bg-slate-900/30 border-slate-800 hover:border-slate-700'
      } ${
        isCompleted ? 'opacity-50 grayscale hover:opacity-80' : ''
      }`}
    >
      <div className="flex justify-between items-start gap-4">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-[9px] font-mono uppercase tracking-widest text-slate-500">{goal.category}</p>
            {goal.is_experimental && <span className="text-[8px] bg-purple-900/30 text-purple-400 px-1.5 py-0.5 rounded border border-purple-800 font-mono uppercase font-bold tracking-wider">Experimental</span>}
            {isCompleted && <span className="text-[8px] bg-emerald-900/30 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-800 font-mono uppercase font-bold tracking-wider">Completed</span>}
          </div>
          <h3 className={`text-base font-bold tracking-tight transition-colors ${
            isCompleted ? 'line-through text-slate-500' :
            isSelected ? 'text-cyan-400' : 'text-white'
          }`}>{goal.title}</h3>
          <p className={`text-[11px] leading-snug transition-all ${!isSelected ? 'line-clamp-2' : ''} ${isCompleted ? 'text-slate-600' : 'text-slate-500'}`}>
            {goal.description}
          </p>
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          <button 
            onClick={(e) => { e.stopPropagation(); onLog(); }}
            disabled={isCompleted}
            className={`w-12 h-12 md:w-10 md:h-10 rounded border flex items-center justify-center transition-all active:scale-95 shrink-0 ${
              isCompleted ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/50 cursor-default' :
              isSelected ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500 hover:border-emerald-400 hover:text-black hover:shadow-[0_0_15px_rgba(16,185,129,0.4)]'
            }`}
          >
            <Check className="w-6 h-6 md:w-5 md:h-5 stroke-[2.5]" />
          </button>
          {!isCompleted && (
            <button 
              onClick={(e) => { e.stopPropagation(); onBranch(goal); }}
              title="Branch Experiment"
              className="w-12 h-12 md:w-10 md:h-10 rounded border border-slate-700 bg-slate-950 text-slate-500 flex items-center justify-center transition-all hover:bg-purple-900/50 hover:border-purple-500 hover:text-purple-400 shrink-0"
            >
              <FlaskConical className="w-5 h-5 md:w-4 md:h-4" />
            </button>
          )}
        </div>
      </div>

      {isSelected && (
        <div className="mt-4 pt-4 border-t border-slate-800/50 flex flex-wrap gap-4 items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex flex-wrap gap-4 md:gap-6">
            <div className="flex flex-col">
              <span className="text-[8px] text-slate-600 font-bold uppercase tracking-[0.2em] mb-0.5">Rank</span>
              <div className="flex items-center gap-1 h-[14px]">
                <span className={`text-[10px] font-mono tabular-nums leading-none ${isCompleted ? 'text-slate-600' : 'text-amber-500'}`}>{'★'.repeat(Math.max(1, Math.ceil(goal.difficulty / 2)))}</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] text-slate-600 font-bold uppercase tracking-[0.2em] mb-0.5">Reward / EXP</span>
              <span className={`text-[10px] font-mono tabular-nums ${isCompleted ? 'text-slate-600' : 'text-cyan-400'}`}>+{(goal.difficulty * 10).toFixed(0)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] text-slate-600 font-bold uppercase tracking-[0.2em] mb-0.5">Impact</span>
              <span className={`text-[10px] font-mono tabular-nums ${isCompleted ? 'text-slate-600' : 'text-purple-400'}`}>+{(goal.reward_alpha * 100).toFixed(0)}%</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {!isCompleted && (
               <button 
                onClick={(e) => { e.stopPropagation(); onEdit(goal); }}
                className="w-10 h-10 md:w-8 md:h-8 flex items-center justify-center text-slate-500 hover:text-cyan-300 hover:bg-slate-800 rounded transition-colors active:scale-95"
                title="Edit Quest"
              >
                <Settings2 className="w-4 h-4" />
              </button>
            )}
            <button 
              onClick={(e) => { e.stopPropagation(); onDrop(goal.id); }}
              className="w-10 h-10 md:w-8 md:h-8 flex items-center justify-center text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors active:scale-95"
              title="Delete Quest"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

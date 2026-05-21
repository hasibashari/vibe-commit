import React from 'react';
import { Check, Settings2, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import type { Goal } from '../../../shared/types/goal';

interface QuestItemProps {
  key?: React.Key;
  goal: Goal;
  onLog: () => void;
  onEdit: (goal: Goal) => void;
  onDrop: (goalId: string) => void;
  isSelected: boolean;
  isCompleted?: boolean;
  onClick: () => void;
}

export function QuestItem({
  goal,
  onLog,
  onEdit,
  onDrop,
  isSelected,
  isCompleted = false,
  onClick,
}: QuestItemProps) {


  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0, scale: isCompleted ? 0.98 : 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={`group relative p-5 rounded-lg border transition-all cursor-pointer ${
        isSelected && !isCompleted
          ? 'bg-accent-500/5 border-accent-800'
          : 'bg-slate-900/30 border-slate-800 hover:border-slate-700'
      } ${isCompleted ? 'opacity-50 grayscale hover:opacity-80' : ''}`}
    >
      <div className='flex justify-between items-start gap-4'>
        <div className='space-y-2 flex-1'>
          <div className='flex items-center gap-2 flex-wrap'>
            <p className='text-xs font-mono uppercase tracking-widest text-slate-500'>
              {goal.category}
            </p>
            {isCompleted && (
              <span className='text-xs bg-emerald-900/30 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-800 font-mono uppercase font-bold tracking-wider flex items-center gap-1'>
                <Check className='w-3 h-3' /> Completed
              </span>
            )}
          </div>
          <h3
            className={`text-base font-bold tracking-tight transition-colors ${
              isCompleted
                ? 'line-through text-slate-500'
                : isSelected
                  ? 'text-accent-400'
                  : 'text-white'
            }`}
          >
            {goal.title}
          </h3>
          <p
            className={`text-xs leading-snug transition-all ${!isSelected ? 'line-clamp-2' : ''} ${isCompleted ? 'text-slate-600' : 'text-slate-500'}`}
          >
            {goal.description}
          </p>
        </div>
        <div className='flex flex-col gap-2 shrink-0'>
          <motion.button
            whileTap={!isCompleted ? { scale: 0.9 } : undefined}
            onClick={e => {
              e.stopPropagation();
              onLog();
            }}
            disabled={isCompleted}
            className={`w-12 h-12 md:w-10 md:h-10 rounded border flex items-center justify-center transition-all shrink-0 ${
              isCompleted
                ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/50 cursor-default'
                : isSelected
                  ? 'bg-accent-500 text-black border-accent-400 shadow-[0_0_15px_rgba(var(--theme-500-rgb),0.4)]'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500 hover:border-emerald-400 hover:text-black hover:shadow-[0_0_15px_rgba(16,185,129,0.4)]'
            }`}
          >
            <Check className='w-6 h-6 md:w-5 md:h-5 stroke-[2.5]' />
          </motion.button>
        </div>
      </div>

      {isSelected && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className='mt-4 pt-4 border-t border-slate-800/50 flex flex-col gap-4'
        >

          {/* ── Stats Row ─────────────────────────────────────────────────── */}
          <div className='flex flex-wrap gap-4 items-center justify-between'>
            <div className='flex flex-wrap gap-4 md:gap-6'>
              <div className='flex flex-col'>
                <span className='text-xs text-slate-600 font-bold uppercase tracking-[0.2em] mb-0.5'>
                  Rank
                </span>
                <span className={`text-xs font-mono tabular-nums leading-none ${isCompleted ? 'text-slate-600' : 'text-amber-500'}`}>
                  {'★'.repeat(Math.max(1, Math.ceil(goal.difficulty / 2)))}
                </span>
              </div>
              <div className='flex flex-col'>
                <span className='text-xs text-slate-600 font-bold uppercase tracking-[0.2em] mb-0.5'>
                  Reward / EXP
                </span>
                <span className={`text-xs font-mono tabular-nums ${isCompleted ? 'text-slate-600' : 'text-accent-400'}`}>
                  +{(goal.difficulty * 10 * goal.reward_alpha).toFixed(0)}
                </span>
              </div>
              <div className='flex flex-col'>
                <span className='text-xs text-slate-600 font-bold uppercase tracking-[0.2em] mb-0.5'>
                  Impact
                </span>
                <span className={`text-xs font-mono tabular-nums ${isCompleted ? 'text-slate-600' : 'text-purple-400'}`}>
                  +{(goal.reward_alpha * 100).toFixed(0)}%
                </span>
              </div>
              <div className='flex flex-col'>
                <span className='text-xs text-slate-600 font-bold uppercase tracking-[0.2em] mb-0.5'>
                  Reps
                </span>
                <span className='text-xs font-mono tabular-nums text-slate-400'>
                  ×{goal.repetition_count}
                </span>
              </div>
            </div>

            <div className='flex items-center gap-2'>
              {!isCompleted && (
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onEdit(goal);
                  }}
                  className='w-10 h-10 md:w-8 md:h-8 flex items-center justify-center text-slate-500 hover:text-accent-300 hover:bg-slate-800 rounded transition-colors active:scale-95'
                  title='Edit Quest'
                >
                  <Settings2 className='w-4 h-4' />
                </button>
              )}
              <button
                onClick={e => {
                  e.stopPropagation();
                  onDrop(goal.id);
                }}
                className='w-10 h-10 md:w-8 md:h-8 flex items-center justify-center text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors active:scale-95'
                title='Delete Quest'
              >
                <Trash2 className='w-4 h-4' />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

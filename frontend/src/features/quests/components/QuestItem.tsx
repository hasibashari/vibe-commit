import React from 'react';
import { Check, Settings2, Trash2, TrendingDown, Activity } from 'lucide-react';
import { motion } from 'motion/react';
import type { Goal } from '../../../shared/types/goal';
import {
  getBetaParams,
  calculateBayesianProbability,
  getDaysSinceLastLog,
} from '../../../shared/utils/vibeMath';

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
  // ── Bayesian Beta-Bernoulli Calculation ──────────────────────────────────
  // θ ~ Beta(α, β) | P = α/(α+β) | σ² = αβ/((α+β)²(α+β+1))
  const daysSinceLastLog = React.useMemo(
    () => getDaysSinceLastLog(goal.logs || []),
    [goal.logs]
  );

  const { alpha, beta } = React.useMemo(
    () => getBetaParams(goal.repetition_count, goal.difficulty, daysSinceLastLog),
    [goal.repetition_count, goal.difficulty, daysSinceLastLog]
  );

  const probability = React.useMemo(
    () => calculateBayesianProbability(alpha, beta),
    [alpha, beta]
  );

  const probPercent = Math.round(probability * 100);

  // Decay warning: tampilkan jika inaktif ≥ 3 hari DAN sudah pernah log
  const isDecaying = daysSinceLastLog >= 3 && goal.repetition_count > 0;
  const decayDaysDisplay = Math.floor(daysSinceLastLog);

  // Warna berdasarkan nilai probabilitas (semaphore visual)
  const probColor =
    probPercent >= 75 ? 'text-emerald-400' :
    probPercent >= 45 ? 'text-amber-400'   :
    probPercent >= 20 ? 'text-orange-400'  :
    'text-rose-400';

  const probBarColor =
    probPercent >= 75 ? 'bg-emerald-500' :
    probPercent >= 45 ? 'bg-amber-500'   :
    probPercent >= 20 ? 'bg-orange-500'  :
    'bg-rose-500';

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
            {/* Badge decay — tampil bahkan saat card belum di-expand */}
            {!isCompleted && isDecaying && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className='text-xs bg-rose-900/30 text-rose-400 px-1.5 py-0.5 rounded border border-rose-800/50 font-mono uppercase font-bold tracking-wider flex items-center gap-1'
                title={`Tidak ada aktivitas selama ${decayDaysDisplay} hari — konsistensi sedang menurun`}
              >
                <TrendingDown className='w-3 h-3' />
                {decayDaysDisplay}d idle
              </motion.span>
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
          {/* ── Consistency Bar (Visual Representation of Bayesian Habit Strength) ── */}
          <div className='flex flex-col gap-1.5'>
            <div className='flex items-center justify-between'>
              <span className='text-xs text-slate-600 font-bold uppercase tracking-[0.2em] flex items-center gap-1'>
                <Activity className='w-3 h-3' />
                Consistency
              </span>
              <div className='flex items-center gap-2'>
                {isDecaying && (
                  <span className='text-xs text-rose-400 font-mono flex items-center gap-0.5'>
                    <TrendingDown className='w-3 h-3' />
                    menurun
                  </span>
                )}
                <span className={`text-sm font-black font-mono tabular-nums ${probColor}`}>
                  {probPercent}%
                </span>
              </div>
            </div>

            {/* Animated progress bar */}
            <div className='h-1.5 w-full bg-slate-800 rounded-full overflow-hidden'>
              <motion.div
                className={`h-full rounded-full ${probBarColor}`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(probPercent, 0.3)}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </div>

            {/* Decay message */}
            {isDecaying && (
              <p className='text-xs text-rose-400/70 leading-snug'>
                ⚠ Tidak ada log selama{' '}
                <span className='font-bold'>{decayDaysDisplay} hari</span> — selesaikan quest ini untuk mengembalikan konsistensi.
              </p>
            )}
          </div>

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

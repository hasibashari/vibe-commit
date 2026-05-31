import React, { useState } from 'react';
import {
  Target,
  Crown,
  Calendar,
  Bookmark,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { QuestItem } from './QuestItem';
import { Button } from '../../../shared/components/Button';
import type { Goal } from '../../../shared/types/goal';
import { groupQuests, calculateExpMultiplier } from '../utils/questUtils';

interface QuestPanelProps {
  goals: Goal[];
  selectedGoal: Goal | null;
  onSelectGoal: (goal: Goal) => void;
  onLogAction: (goalId: string) => void;
  onEdit: (goal: Goal) => void;
  onDrop: (goalId: string) => void;
  onNewQuest: () => void;
  recentlyCompletedIds: string[];
}

export function QuestPanel({
  goals,
  selectedGoal,
  onSelectGoal,
  onLogAction,
  onEdit,
  onDrop,
  onNewQuest,
  recentlyCompletedIds,
}: QuestPanelProps) {
  const [expandedCategory, setExpandedCategory] = useState<string>('Main Quest');

  const toggleCategory = (cat: string) => {
    setExpandedCategory(prev => (prev === cat ? '' : cat));
  };

  const { mainQuests, dailyQuests, sideQuests } = React.useMemo(() => groupQuests(goals), [goals]);
  const expMultiplier = React.useMemo(() => calculateExpMultiplier(goals), [goals]);

  React.useEffect(() => {
    if (selectedGoal) {
      if (mainQuests.some(q => q.id === selectedGoal.id)) setExpandedCategory('Main Quest');
      else if (dailyQuests.some(q => q.id === selectedGoal.id)) setExpandedCategory('Daily Quest');
      else if (sideQuests.some(q => q.id === selectedGoal.id)) setExpandedCategory('Side Quest');
    }
  }, [selectedGoal?.id]);

  return (
    <div className='flex flex-col gap-4 md:gap-6 pb-28 md:pb-6'>

      <div className='bg-slate-900/50 border border-slate-800 p-4 md:p-5 rounded-lg flex flex-col gap-5'>
        <div className='flex items-center justify-between mb-2'>
          <h3 className='text-xs font-bold text-slate-400 uppercase tracking-widest px-1'>
            Quest Log
          </h3>
          <div className='flex items-center gap-2'>
            <span className='text-xs text-slate-500'>Rata-rata Pengali EXP:</span>
            <span className='text-sm font-black text-amber-500 tabular-nums'>
              {goals.length > 0 ? `${expMultiplier.toFixed(2)}x` : '—'}
            </span>
          </div>
        </div>



        {/* Main Quests */}
        <div className='flex flex-col gap-3 transition-all duration-300'>
          <button
            onClick={() => toggleCategory('Main Quest')}
            className='flex items-center justify-between px-1 group'
          >
            <h3
              className={`text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-2 transition-colors ${expandedCategory === 'Main Quest' ? 'text-amber-300' : 'text-amber-400/70 group-hover:text-amber-300'}`}
            >
              <Crown className='w-4 h-4' /> Main Quest ({mainQuests.length})
            </h3>
            {expandedCategory !== 'Main Quest' ? (
              <ChevronUp className='w-4 h-4 text-slate-500 group-hover:text-amber-400/70' />
            ) : (
              <ChevronDown className='w-4 h-4 text-slate-500 group-hover:text-amber-400/70' />
            )}
          </button>

          <div
            className={`space-y-3 overflow-hidden transition-all duration-300 ${expandedCategory === 'Main Quest' ? 'max-h-[2500px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}
          >
            {mainQuests.map(goal => (
              <QuestItem
                key={goal.id}
                goal={goal}
                onLog={() => onLogAction(goal.id)}
                onEdit={onEdit}
                onDrop={onDrop}
                isSelected={selectedGoal?.id === goal.id}
                isCompleted={recentlyCompletedIds.includes(goal.id)}
                onClick={() => onSelectGoal(goal)}
              />
            ))}
            {mainQuests.length === 0 && (
              <div className='px-4 py-8 text-center border border-dashed border-slate-700 bg-slate-800/20 rounded-lg flex flex-col items-center justify-center gap-2'>
                <Target className='w-5 h-5 text-slate-500 opacity-50' />
                <p className='text-xs font-mono uppercase tracking-widest text-slate-500'>
                  Belum ada target utama
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Daily Quests */}
        <div className='flex flex-col gap-3 pt-3 border-t border-slate-800 transition-all duration-300'>
          <button
            onClick={() => toggleCategory('Daily Quest')}
            className='flex items-center justify-between px-1 group'
          >
            <h3
              className={`text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-2 transition-colors ${expandedCategory === 'Daily Quest' ? 'text-accent-300' : 'text-accent-400/70 group-hover:text-accent-300'}`}
            >
              <Calendar className='w-4 h-4' /> Daily Quest ({dailyQuests.length})
            </h3>
            {expandedCategory !== 'Daily Quest' ? (
              <ChevronUp className='w-4 h-4 text-slate-500 group-hover:text-accent-400/70' />
            ) : (
              <ChevronDown className='w-4 h-4 text-slate-500 group-hover:text-accent-400/70' />
            )}
          </button>

          <div
            className={`space-y-3 overflow-hidden transition-all duration-300 ${expandedCategory === 'Daily Quest' ? 'max-h-[2500px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}
          >
            {dailyQuests.map(goal => (
              <QuestItem
                key={goal.id}
                goal={goal}
                onLog={() => onLogAction(goal.id)}
                onEdit={onEdit}
                onDrop={onDrop}
                isSelected={selectedGoal?.id === goal.id}
                isCompleted={recentlyCompletedIds.includes(goal.id)}
                onClick={() => onSelectGoal(goal)}
              />
            ))}
            {dailyQuests.length === 0 && (
              <div className='px-4 py-8 text-center border border-dashed border-slate-700 bg-slate-800/20 rounded-lg flex flex-col items-center justify-center gap-2'>
                <Calendar className='w-5 h-5 text-slate-500 opacity-50' />
                <p className='text-xs font-mono uppercase tracking-widest text-slate-500'>
                  Belum ada target harian
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Side Quests */}
        <div className='flex flex-col gap-3 pt-3 border-t border-slate-800 transition-all duration-300'>
          <button
            onClick={() => toggleCategory('Side Quest')}
            className='flex items-center justify-between px-1 group'
          >
            <h3
              className={`text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-2 transition-colors ${expandedCategory === 'Side Quest' ? 'text-emerald-300' : 'text-emerald-400/70 group-hover:text-emerald-300'}`}
            >
              <Bookmark className='w-4 h-4' /> Side Quest ({sideQuests.length})
            </h3>
            {expandedCategory !== 'Side Quest' ? (
              <ChevronUp className='w-4 h-4 text-slate-500 group-hover:text-emerald-400/70' />
            ) : (
              <ChevronDown className='w-4 h-4 text-slate-500 group-hover:text-emerald-400/70' />
            )}
          </button>

          <div
            className={`space-y-3 overflow-hidden transition-all duration-300 ${expandedCategory === 'Side Quest' ? 'max-h-[2500px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}
          >
            {sideQuests.map(goal => (
              <QuestItem
                key={goal.id}
                goal={goal}
                onLog={() => onLogAction(goal.id)}
                onEdit={onEdit}
                onDrop={onDrop}
                isSelected={selectedGoal?.id === goal.id}
                isCompleted={recentlyCompletedIds.includes(goal.id)}
                onClick={() => onSelectGoal(goal)}
              />
            ))}
            {sideQuests.length === 0 && (
              <div className='px-4 py-8 text-center border border-dashed border-slate-700 bg-slate-800/20 rounded-lg flex flex-col items-center justify-center gap-2'>
                <Bookmark className='w-5 h-5 text-slate-500 opacity-50' />
                <p className='text-xs font-mono uppercase tracking-widest text-slate-500'>
                  Belum ada tugas tambahan
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className='mt-4 pt-4 border-t border-slate-800/50 space-y-3'>
          <Button variant='secondary' onClick={onNewQuest} className='w-full'>
            + Buat Quest
          </Button>
        </div>
      </div>
    </div>
  );
}

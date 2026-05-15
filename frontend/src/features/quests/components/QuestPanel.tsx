import React, { useState } from 'react';
import { Target, RotateCcw, BrainCircuit, ChevronRight, Crown, Calendar, Bookmark, FlaskConical, ChevronDown, ChevronUp } from 'lucide-react';
import { QuestItem } from './QuestItem';
import type { Goal } from '../../../app/App';
import { groupQuests, calculateExpMultiplier } from '../utils/questUtils';

interface QuestPanelProps {
  goals: Goal[];
  selectedGoal: Goal | null;
  latestDump: { summary: string; anxietyLevel: string; anxietyScore: number } | null;
  onSelectGoal: (goal: Goal) => void;
  onLogAction: (goalId: string) => void;
  onBranch: (goal: Goal) => void;
  onEdit: (goal: Goal) => void;
  onDrop: (goalId: string) => void;
  onOpenBrainDump: () => void;
  onNewQuest: () => void;
  recentlyCompletedIds: string[];
}

export function QuestPanel({
  goals,
  selectedGoal,
  latestDump,
  onSelectGoal,
  onLogAction,
  onBranch,
  onEdit,
  onDrop,
  onOpenBrainDump,
  onNewQuest,
  recentlyCompletedIds
}: QuestPanelProps) {
  
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({
    'Side Quest': true // Collapse side quests by default
  });

  const toggleCategory = (cat: string) => {
    setCollapsedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };
  
  const { mainQuests, dailyQuests, sideQuests, experimentQuests } = groupQuests(goals);
  const expMultiplier = calculateExpMultiplier(goals);

  return (
    <div className="flex flex-col gap-4 md:gap-6 pb-6">
      
      {/* Brain Dump Action Panel - Promoted to top for easier access */}
      <div className="bg-indigo-900/20 border border-indigo-500/30 p-4 md:p-5 rounded-lg flex flex-col shadow-lg shadow-indigo-900/10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest decoration-indigo-500/50 flex items-center gap-2">
            <BrainCircuit className="w-3.5 h-3.5" /> Brain Dump
          </h3>
          {latestDump && (
            <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full border ${
              latestDump.anxietyScore > 7 ? 'text-rose-400 border-rose-400/30 bg-rose-400/10' : 'text-indigo-400 border-indigo-400/30 bg-indigo-400/10'
            }`}>
              Level: {latestDump.anxietyLevel}
            </span>
          )}
        </div>
        <button 
          onClick={onOpenBrainDump}
          className="w-full text-left group flex items-start justify-between gap-3 bg-indigo-950/30 p-3 rounded-md hover:bg-indigo-900/40 transition-colors"
        >
          <p className="text-xs leading-relaxed text-slate-300 group-hover:text-white transition-colors">
            {latestDump ? `"${latestDump.summary}"` : 'Tulis apa yang lo pikirkan biar AI buatkan plan-nya...'}
          </p>
          <ChevronRight className="w-4 h-4 text-indigo-400/60 shrink-0 mt-0.5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 p-4 md:p-5 rounded-lg flex flex-col gap-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Quest Log</h3>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500">EXP Multiplier:</span>
            <span className="text-sm font-black text-amber-500 tabular-nums">
              {expMultiplier}x
            </span>
          </div>
        </div>
        
        {/* Main Quests */}
        <div className="flex flex-col gap-3">
          <button 
            onClick={() => toggleCategory('Main Quest')}
            className="flex items-center justify-between px-1 group"
          >
            <h3 className="text-[11px] font-bold text-amber-400/90 uppercase tracking-[0.2em] flex items-center gap-2 group-hover:text-amber-300 transition-colors">
              <Crown className="w-4 h-4" /> Main Quest ({mainQuests.length})
            </h3>
            {collapsedCategories['Main Quest'] ? <ChevronUp className="w-4 h-4 text-slate-500 group-hover:text-amber-400/70" /> : <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-amber-400/70" />}
          </button>
          
          {!collapsedCategories['Main Quest'] && (
            <div className="space-y-3">
              {mainQuests.map(goal => (
                <QuestItem 
                  key={goal.id}
                  goal={goal}
                  onLog={() => onLogAction(goal.id)}
                  onBranch={onBranch}
                  onEdit={onEdit}
                  onDrop={onDrop}
                  isSelected={selectedGoal?.id === goal.id}
                  isCompleted={recentlyCompletedIds.includes(goal.id)}
                  onClick={() => onSelectGoal(goal)}
                />
              ))}
              {mainQuests.length === 0 && (
                <div className="px-4 py-8 text-center border border-dashed border-slate-700 bg-slate-800/20 rounded-lg flex flex-col items-center justify-center gap-2">
                  <Target className="w-5 h-5 text-slate-500 opacity-50" />
                  <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Belum ada target utama</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Daily Quests */}
        <div className="flex flex-col gap-3 pt-3 border-t border-slate-800">
          <button 
            onClick={() => toggleCategory('Daily Quest')}
            className="flex items-center justify-between px-1 group"
          >
            <h3 className="text-[11px] font-bold text-cyan-400/90 uppercase tracking-[0.2em] flex items-center gap-2 group-hover:text-cyan-300 transition-colors">
              <Calendar className="w-4 h-4" /> Daily Quest ({dailyQuests.length})
            </h3>
            {collapsedCategories['Daily Quest'] ? <ChevronUp className="w-4 h-4 text-slate-500 group-hover:text-cyan-400/70" /> : <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-cyan-400/70" />}
          </button>

          {!collapsedCategories['Daily Quest'] && (
            <div className="space-y-3">
              {dailyQuests.map(goal => (
                <QuestItem 
                  key={goal.id}
                  goal={goal}
                  onLog={() => onLogAction(goal.id)}
                  onBranch={onBranch}
                  onEdit={onEdit}
                  onDrop={onDrop}
                  isSelected={selectedGoal?.id === goal.id}
                  isCompleted={recentlyCompletedIds.includes(goal.id)}
                  onClick={() => onSelectGoal(goal)}
                />
              ))}
              {dailyQuests.length === 0 && (
                <div className="px-4 py-8 text-center border border-dashed border-slate-700 bg-slate-800/20 rounded-lg flex flex-col items-center justify-center gap-2">
                  <Calendar className="w-5 h-5 text-slate-500 opacity-50" />
                  <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Belum ada target harian</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Side Quests */}
        <div className="flex flex-col gap-3 pt-3 border-t border-slate-800">
          <button 
            onClick={() => toggleCategory('Side Quest')}
            className="flex items-center justify-between px-1 group"
          >
            <h3 className="text-[11px] font-bold text-emerald-400/90 uppercase tracking-[0.2em] flex items-center gap-2 group-hover:text-emerald-300 transition-colors">
              <Bookmark className="w-4 h-4" /> Side Quest ({sideQuests.length})
            </h3>
            {collapsedCategories['Side Quest'] ? <ChevronUp className="w-4 h-4 text-slate-500 group-hover:text-emerald-400/70" /> : <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-emerald-400/70" />}
          </button>

          {!collapsedCategories['Side Quest'] && (
            <div className="space-y-3">
              {sideQuests.map(goal => (
                <QuestItem 
                  key={goal.id}
                  goal={goal}
                  onLog={() => onLogAction(goal.id)}
                  onBranch={onBranch}
                  onEdit={onEdit}
                  onDrop={onDrop}
                  isSelected={selectedGoal?.id === goal.id}
                  isCompleted={recentlyCompletedIds.includes(goal.id)}
                  onClick={() => onSelectGoal(goal)}
                />
              ))}
              {sideQuests.length === 0 && (
                <div className="px-4 py-8 text-center border border-dashed border-slate-700 bg-slate-800/20 rounded-lg flex flex-col items-center justify-center gap-2">
                  <Bookmark className="w-5 h-5 text-slate-500 opacity-50" />
                  <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Belum ada tugas tambahan</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Experiments */}
        {experimentQuests.length > 0 && (
          <div className="flex flex-col gap-3 pt-3 border-t border-slate-800/50">
            <h3 className="text-[10px] font-bold text-purple-400 uppercase tracking-widest px-1 flex items-center gap-2">
              <FlaskConical className="w-3 h-3" /> Branch Eksperimen
            </h3>
            
            <div className="space-y-3">
              {experimentQuests.map(goal => (
                <div 
                  key={goal.id} 
                  onClick={() => onSelectGoal(goal)}
                  className={`p-4 border-l-2 bg-slate-800/20 rounded-r transition-all cursor-pointer ${
                    selectedGoal?.id === goal.id 
                    ? 'border-purple-500 bg-purple-500/5 translate-x-1' 
                    : 'border-slate-700 opacity-60 hover:opacity-100 hover:border-slate-500'
                  }`}
                >
                  <p className={`text-xs font-bold ${selectedGoal?.id === goal.id ? 'text-white' : 'text-slate-400'}`}>Exp: {goal.title}</p>
                  <div className="mt-3 h-1 bg-slate-950 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500 transition-all duration-1000" 
                      style={{ width: `${Math.min(100, (goal.repetition_count / (goal.difficulty * 1.5)) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-4 pt-4 border-t border-slate-800/50 space-y-3">
          <button 
            onClick={onNewQuest}
            className="w-full py-3.5 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 text-slate-300 text-xs font-bold uppercase tracking-widest rounded-lg transition-all active:scale-95"
          >
            + Buat Quest Manual
          </button>
        </div>
      </div>
    </div>
  );
}

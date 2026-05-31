import type { Goal } from '../../../shared/types/goal';
import { getDaysSinceLastLog, getBetaParams, calculateBayesianProbability } from '../../../shared/utils/vibeMath';

export const groupQuests = (goals: Goal[]) => {
  const activeGoals = goals.filter(g => g.status !== 'archived');
  const mainQuests = activeGoals.filter(g => g.category === 'Main Quest');
  const dailyQuests = activeGoals.filter(g => g.category === 'Daily Quest');
  const sideQuests = activeGoals.filter(g => g.category !== 'Main Quest' && g.category !== 'Daily Quest');

  return { mainQuests, dailyQuests, sideQuests };
};

export const calculateExpMultiplier = (goals: Goal[]) => {
  const activeGoals = goals.filter(g => g.status !== 'archived');
  if (!activeGoals.length) return 0;
  const totalAlpha = activeGoals.reduce((acc, curr) => acc + curr.reward_alpha, 0);
  return Number((totalAlpha / activeGoals.length).toFixed(2));
};

export const calculateQuestProbability = (goal: Goal, sandboxDateOffset: number = 0): number => {
  const daysSinceLast = getDaysSinceLastLog(goal.logs || [], goal.createdAt, sandboxDateOffset);
  const { alpha, beta } = getBetaParams(goal.repetition_count, goal.difficulty, daysSinceLast);
  const prob = calculateBayesianProbability(alpha, beta);
  return Math.round(prob * 100);
};


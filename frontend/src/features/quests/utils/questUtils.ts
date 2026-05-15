import type { Goal } from '../../../shared/types/goal';

export const groupQuests = (goals: Goal[]) => {
  const mainQuests = goals.filter(g => g.category === 'Main Quest');
  const dailyQuests = goals.filter(g => g.category === 'Daily Quest');
  const sideQuests = goals.filter(g => g.category !== 'Main Quest' && g.category !== 'Daily Quest');

  return { mainQuests, dailyQuests, sideQuests };
};

export const calculateExpMultiplier = (goals: Goal[]) => {
  if (!goals.length) return 0;
  const totalAlpha = goals.reduce((acc, curr) => acc + curr.reward_alpha, 0);
  return Number((totalAlpha / goals.length).toFixed(2));
};

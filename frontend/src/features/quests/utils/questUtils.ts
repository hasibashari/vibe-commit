import type { Goal } from '../../../app/App';

export const groupQuests = (goals: Goal[]) => {
  const mainQuests = goals.filter(g => g.category === 'Main Quest' && !g.is_experimental);
  const dailyQuests = goals.filter(g => g.category === 'Daily Quest' && !g.is_experimental);
  const sideQuests = goals.filter(g => g.category !== 'Main Quest' && g.category !== 'Daily Quest' && !g.is_experimental);
  const experimentQuests = goals.filter(g => g.is_experimental);

  return { mainQuests, dailyQuests, sideQuests, experimentQuests };
};

export const calculateExpMultiplier = (goals: Goal[]) => {
  if (!goals.length) return 0;
  const totalAlpha = goals.reduce((acc, curr) => acc + curr.reward_alpha, 0);
  return Number((totalAlpha / goals.length).toFixed(2));
};

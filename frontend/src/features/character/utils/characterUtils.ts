export const groupGoalsByCategory = (goals: { category: string }[]) => {
  const categoryCounts: Record<string, number> = {};
  goals.forEach(g => {
    const cat = g.category || 'Uncategorized';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });
  return Object.entries(categoryCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a,b) => b.value - a.value);
};

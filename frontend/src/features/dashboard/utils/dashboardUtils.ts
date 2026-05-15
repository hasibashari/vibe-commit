import type { Goal } from '../../../app/App';

export const calculateRPGStats = (allLogs: any[], userData: any, baseHp: number = 100, baseMana: number = 100) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // HP: Drops if no activity. Max 100.
  let daysSinceLastLog = 0;
  if (allLogs.length > 0) {
    let maxTimestamp = 0;
    allLogs.forEach((l: any) => {
      let dateStr = l.timestamp;
      if (typeof dateStr === 'string' && dateStr.includes(' ')) {
        dateStr = dateStr.replace(' ', 'T');
      }
      const time = new Date(dateStr).getTime();
      if (!isNaN(time) && time > maxTimestamp) maxTimestamp = time;
    });

    const lastLogDate = new Date(maxTimestamp);
    lastLogDate.setHours(0, 0, 0, 0);
    daysSinceLastLog = Math.floor((now.getTime() - lastLogDate.getTime()) / (1000 * 60 * 60 * 24));
  } else {
    daysSinceLastLog = 0; // New user penalty setup
  }
  const calculatedHp = Math.max(0, Math.min(baseHp, baseHp - daysSinceLastLog * 15));

  // Mana (Focus): Drops as you complete tasks today (limits burnout). Starts at baseMana.
  const todayDateStr = new Date().toISOString().split('T')[0];
  const logsToday = allLogs.filter((l: any) => {
    if (!l.timestamp) return false;
    const logDateStr = typeof l.timestamp === 'string' ? l.timestamp.split(' ')[0].split('T')[0] : '';
    return logDateStr === todayDateStr;
  }).length;
  const calculatedMana = Math.max(0, baseMana - logsToday * 10); // Each task costs ~10 focus

  return {
    ...userData,
    hp: calculatedHp,
    mana: calculatedMana,
    level: Math.floor(allLogs.length / 10) + 1,
    exp: (allLogs.length % 10) * 10,
  };
};

export const getCompletedIdsToday = (goalsData: Goal[]) => {
  const today = new Date().toISOString().split('T')[0];
  const completedIds: string[] = [];

  goalsData.forEach((goal) => {
    if (goal.logs && goal.logs.length > 0) {
      const hasLogToday = goal.logs.some((log) => {
        if (!log.timestamp) return false;
        const logDateStr = typeof log.timestamp === 'string' ? log.timestamp.split(' ')[0].split('T')[0] : '';
        return logDateStr === today;
      });

      if (hasLogToday) {
        completedIds.push(goal.id);
      }
    }
  });

  return completedIds;
};

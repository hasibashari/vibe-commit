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

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  progress: number;
  maxProgress: number;
  category: 'milestone' | 'combat' | 'exploration';
}

export const calculateAchievements = (allLogs: any[], level: number): Achievement[] => {
  const totalTasks = allLogs.length;

  return [
    {
      id: 'first_blood',
      title: 'First Blood',
      description: 'Menyelesaikan quest pertamamu.',
      icon: 'Sword',
      isUnlocked: totalTasks >= 1,
      progress: Math.min(totalTasks, 1),
      maxProgress: 1,
      category: 'combat'
    },
    {
      id: 'novice_adventurer',
      title: 'Novice Adventurer',
      description: 'Menyelesaikan 10 quest.',
      icon: 'Shield',
      isUnlocked: totalTasks >= 10,
      progress: Math.min(totalTasks, 10),
      maxProgress: 10,
      category: 'combat'
    },
    {
      id: 'veteran_slayer',
      title: 'Veteran Slayer',
      description: 'Menyelesaikan 50 quest.',
      icon: 'Swords',
      isUnlocked: totalTasks >= 50,
      progress: Math.min(totalTasks, 50),
      maxProgress: 50,
      category: 'combat'
    },
    {
      id: 'level_5',
      title: 'Rising Star',
      description: 'Mencapai Level 5.',
      icon: 'Star',
      isUnlocked: level >= 5,
      progress: Math.min(level, 5),
      maxProgress: 5,
      category: 'milestone'
    },
    {
      id: 'level_10',
      title: 'The Vanguard',
      description: 'Mencapai Level 10.',
      icon: 'Crown',
      isUnlocked: level >= 10,
      progress: Math.min(level, 10),
      maxProgress: 10,
      category: 'milestone'
    }
  ];
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

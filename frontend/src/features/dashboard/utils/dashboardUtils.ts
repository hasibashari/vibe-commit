import type { Goal } from '../../../shared/types/goal';
import type { Log } from '../../../shared/types/log';
import type { UserStats } from '../../../shared/types/user';

export const calculateRPGStats = (_allLogs: Log[], userData: UserStats) => {
  return {
    ...userData,
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

export const calculateAchievements = (allLogs: Log[], level: number): Achievement[] => {
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

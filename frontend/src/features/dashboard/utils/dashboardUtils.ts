import type { Goal } from '../../../shared/types/goal';
import type { Log } from '../../../shared/types/log';
import type { UserStats } from '../../../shared/types/user';
import { getAvailableCoins, getLogDateString, getTodayLocalString } from '../../../shared/utils/dateUtils';

/**
 * Derives all computed RPG stats from the raw server user row.
 * Previously a no-op; now calculates `availableCoins` so the frontend
 * has a correct spendable-coin balance without a dedicated API field.
 */
export const calculateRPGStats = (_allLogs: Log[], userData: UserStats) => {
  const availableCoins = getAvailableCoins(
    userData.level,
    userData.exp,
    userData.spent_coins ?? 0,
  );
  return {
    ...userData,
    availableCoins,
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

export const getCompletedIdsToday = (goalsData: Goal[], offset: number = 0) => {
  // Use local date (not UTC) so "today" matches the user's timezone.
  const today = getTodayLocalString(offset);
  const completedIds: string[] = [];

  goalsData.forEach((goal) => {
    if (goal.logs && goal.logs.length > 0) {
      const hasLogToday = goal.logs.some((log) => {
        if (!log.timestamp) return false;
        // Normalise both SQLite-space and ISO-T timestamps safely using getLogDateString
        const logDateStr = getLogDateString(log.timestamp);
        return logDateStr === today;
      });

      if (hasLogToday) {
        completedIds.push(goal.id);
      }
    }
  });

  return completedIds;
};

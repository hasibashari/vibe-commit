import type { Goal } from '../../../shared/types/goal';
import type { Log } from '../../../shared/types/log';
import type { UserStats } from '../../../shared/types/user';

export const calculateRPGStats = (allLogs: Log[], userData: UserStats, goals: Goal[] = []) => {
  let initialTotalExp = userData.exp || 0; // Manual / Sandbox EXP
  let totalEarnedFromLogs = 0;
  
  // Calculate total EXP earned from all recorded logs based on actual difficulty
  allLogs.forEach(log => {
    const goal = goals.find(g => g.id === (log as any).goal_id);
    if (goal) {
      totalEarnedFromLogs += Math.floor(goal.difficulty * 10 * goal.reward_alpha);
    } else {
      totalEarnedFromLogs += 10; // Fallback if goal deleted
    }
  });
  
  const totalExp = initialTotalExp + totalEarnedFromLogs;
  
  // Exponential / Progressive Leveling Formula
  // Level L requires: 50 * (L - 1) * L  total experience
  // Which means Level 1: 0 exp, Level 2: 100 exp, Level 3: 300 exp, Level 4: 600 exp
  const L = Math.floor((1 + Math.sqrt(1 + 4 * (totalExp / 50))) / 2);
  
  const maxLevel = 99;
  const currentLevel = Math.min(L, maxLevel);
  
  // Calculate EXP needed for current and next level bounds
  const currentLevelTotalExp = 50 * (currentLevel - 1) * currentLevel;
  const nextLevelTotalExp = 50 * currentLevel * (currentLevel + 1);
  const expIntoCurrentLevel = totalExp - currentLevelTotalExp;
  const expNeededForNextLevel = nextLevelTotalExp - currentLevelTotalExp; // Which is 100 * currentLevel
  
  const expPercentage = Math.min(100, Math.floor((expIntoCurrentLevel / expNeededForNextLevel) * 100));

  return {
    ...userData,
    level: currentLevel,
    exp: expPercentage,
    total_exp: totalExp
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

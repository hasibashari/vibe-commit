import type { Goal } from '../../../shared/types/goal';
import type { Log } from '../../../shared/types/log';
import type { UserStats } from '../../../shared/types/user';

export const calculateRPGStats = (allLogs: Log[], userData: UserStats) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  let isShieldActive = false;
  if (userData.shield_until) {
    const shieldDate = new Date(userData.shield_until);
    if (now.getTime() <= shieldDate.getTime()) {
      isShieldActive = true;
    }
  }

  let maxTimestamp = 0;
  if (allLogs.length > 0) {
    allLogs.forEach((l: Log) => {
      let dateStr = l.timestamp;
      if (typeof dateStr === 'string' && dateStr.includes(' ')) {
        dateStr = dateStr.replace(' ', 'T');
      }
      const time = new Date(dateStr).getTime();
      if (!isNaN(time) && time > maxTimestamp) maxTimestamp = time;
    });
  }

  // If shield was bought, it acts as if the user logged in on the day the shield expired
  if (userData.shield_until) {
    // Shield expiration is at 23:59:59 of a certain day. 
    // We treat the "last log" as the midnight of the day the shield was purchased for.
    const shieldDate = new Date(userData.shield_until);
    shieldDate.setHours(0, 0, 0, 0);
    if (shieldDate.getTime() > maxTimestamp) {
      maxTimestamp = shieldDate.getTime();
    }
  }

  // HP: Drops if no activity. Max 100.
  let daysSinceLastLog = 0;
  if (maxTimestamp > 0) {
    const lastLogDate = new Date(maxTimestamp);
    lastLogDate.setHours(0, 0, 0, 0);
    daysSinceLastLog = Math.floor((now.getTime() - lastLogDate.getTime()) / (1000 * 60 * 60 * 24));
  } else {
    daysSinceLastLog = 0; // New user penalty setup
  }

  if (isShieldActive) {
    daysSinceLastLog = 0;
  }

  const baseHp = userData.hp ?? 100;
  const baseMana = userData.mana ?? 100;

  const calculatedHp = Math.max(0, Math.min(100, baseHp - daysSinceLastLog * 15));

  // Mana (Focus): Drops as you complete tasks today (limits burnout). Starts at baseMana.
  const todayDateStr = new Date().toISOString().split('T')[0];
  const logsToday = allLogs.filter((l: Log) => {
    if (!l.timestamp) return false;
    const logDateStr = typeof l.timestamp === 'string' ? l.timestamp.split(' ')[0].split('T')[0] : '';
    return logDateStr === todayDateStr;
  }).length;
  const calculatedMana = Math.max(0, Math.min(100, baseMana - logsToday * 10)); // Each task costs ~10 focus

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

import { useState, useEffect } from 'react';
import type { Goal } from '../../../app/App';
import { calculateStats, calculateStochasticNudges, analyzeBurnoutRisk, BurnoutPrediction } from '../../../shared/services/vibeService';

interface UserStats {
  id?: string;
  name?: string;
  title?: string;
  avatar_color?: string;
  hp: number;
  mana: number;
  level: number;
  exp: number;
}

export function useDashboardState() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [user, setUser] = useState<UserStats>({ hp: 100, mana: 100, level: 1, exp: 0 });
  const [latestDump, setLatestDump] = useState<{ summary: string; anxietyLevel: string; anxietyScore: number } | null>(null);
  const [burnoutMonitor, setBurnoutMonitor] = useState<BurnoutPrediction | null>(null);
  const [expPopups, setExpPopups] = useState<{id: string, exp: number}[]>([]);
  const [nudge, setNudge] = useState<{ optimalHour: number; suggestion: string } | null>(null);
  const [recentlyCompletedIds, setRecentlyCompletedIds] = useState<string[]>([]);

  const checkCompletedToday = (goalsData: Goal[]) => {
    const today = new Date().toISOString().split('T')[0];
    const completedIds: string[] = [];

    goalsData.forEach(goal => {
      if (goal.logs && goal.logs.length > 0) {
        const hasLogToday = goal.logs.some(log => {
          if (!log.timestamp) return false;
          // SQLite might have return dates as 'YYYY-MM-DD HH:MM:SS'
          const logDateStr = typeof log.timestamp === 'string' ? log.timestamp.split(' ')[0].split('T')[0] : '';
          return logDateStr === today;
        });
        
        if (hasLogToday) {
          completedIds.push(goal.id);
        }
      }
    });

    setRecentlyCompletedIds(completedIds);
  };

  const fetchData = async () => {
    try {
      const gRes = await fetch('/api/goals/user123'); // Semi-mocked user id
      const goalsData = await gRes.json();
      
      const goalsWithCounts = await Promise.all(goalsData.map(async (g: any) => {
        const lRes = await fetch(`/api/logs/${g.id}`);
        const logs = await lRes.json();
        return { ...g, repetition_count: logs.length, logs };
      }));
      
      setGoals(goalsWithCounts);
      checkCompletedToday(goalsWithCounts);

      // Stochastic Nudge Calculation
      const allLogs = goalsWithCounts.flatMap(g => {
        return g.logs.map((l: any) => ({ ...l, goal_id: g.id }));
      });
      const nudgeData = calculateStochasticNudges(allLogs);
      if (nudgeData) setNudge(nudgeData);

      // Burnout monitoring
      const burnoutRisk = analyzeBurnoutRisk(allLogs, goalsWithCounts);
      setBurnoutMonitor(burnoutRisk);

      const dumpsRes = await fetch('/api/brain-dump/user123');
      const dumpsData = await dumpsRes.json();
      if (dumpsData && dumpsData.length > 0) {
        setLatestDump(JSON.parse(dumpsData[0].analysis));
      }
      
      const userRes = await fetch('/api/user/user123');
      const userData = await userRes.json();

      // Calculate RPG Stats: HP (Vitality) and Mana (Focus Capacity)
      const now = new Date();
      now.setHours(0,0,0,0);

      // HP: Drops if no activity. Max 100.
      let daysSinceLastLog = 0;
      if (allLogs.length > 0) {
        let maxTimestamp = 0;
        allLogs.forEach((l: any) => {
          let dateStr = l.timestamp;
          if (typeof dateStr === 'string' && dateStr.includes(' ')) {
            // Convert 'YYYY-MM-DD HH:MM:SS' to 'YYYY-MM-DDTHH:MM:SS' for reliable parsing
            dateStr = dateStr.replace(' ', 'T');
          }
          const time = new Date(dateStr).getTime();
          if (!isNaN(time) && time > maxTimestamp) maxTimestamp = time;
        });
        
        const lastLogDate = new Date(maxTimestamp);
        lastLogDate.setHours(0,0,0,0);
        daysSinceLastLog = Math.floor((now.getTime() - lastLogDate.getTime()) / (1000 * 60 * 60 * 24));
      } else {
        daysSinceLastLog = 3; // New user penalty setup
      }
      const calculatedHp = Math.max(0, Math.min(100, 100 - (daysSinceLastLog * 15)));

      // Mana (Focus): Drops as you complete tasks today (limits burnout). Starts at 100.
      const todayDateStr = new Date().toISOString().split('T')[0];
      const logsToday = allLogs.filter((l: any) => {
          if (!l.timestamp) return false;
          const logDateStr = typeof l.timestamp === 'string' ? l.timestamp.split(' ')[0].split('T')[0] : '';
          return logDateStr === todayDateStr;
      }).length;
      const calculatedMana = Math.max(0, 100 - (logsToday * 10)); // Each task costs ~10 focus
      
      setUser({
        ...userData,
        hp: calculatedHp,
        mana: calculatedMana,
        level: Math.floor(allLogs.length / 10) + 1,
        exp: (allLogs.length % 10) * 10
      });
    } catch (e) {
      console.error(e);
    }
  };

  const updateProfile = async (data: { name: string, title: string, avatar_color: string }) => {
    try {
      const res = await fetch('/api/user/user123', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const updatedUser = await res.json();
      setUser(prev => ({ ...prev, ...updatedUser }));
    } catch (e) {
      console.error('Failed to update profile', e);
    }
  };

  const resetProfile = async () => {
    try {
      await fetch('/api/user/user123/reset', { method: 'POST' });
      setGoals([]);
      setLatestDump(null);
      setBurnoutMonitor(null);
      setExpPopups([]);
      setRecentlyCompletedIds([]);
      setNudge(null);
      setUser({ hp: 100, mana: 100, level: 1, exp: 0 });
    } catch (e) {
      console.error('Failed to reset profile', e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    goals,
    setGoals,
    user,
    latestDump,
    burnoutMonitor,
    expPopups,
    setExpPopups,
    fetchData,
    nudge,
    recentlyCompletedIds,
    updateProfile,
    resetProfile
  };
}

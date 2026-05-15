import { useState, useEffect, useCallback } from 'react';
import type { Goal } from '../../../app/App';
import { calculateStochasticNudges, analyzeBurnoutRisk, BurnoutPrediction } from '../../../shared/services/vibeService';
import { fetchDashboardData, updateProfileData, resetProfileData, UserStats } from '../services/dashboardApi';
import { calculateRPGStats, getCompletedIdsToday } from '../utils/dashboardUtils';

export function useDashboardState() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [user, setUser] = useState<UserStats>({ hp: 100, mana: 100, level: 1, exp: 0 });
  const [latestDump, setLatestDump] = useState<{ summary: string; anxietyLevel: string; anxietyScore: number } | null>(null);
  const [burnoutMonitor, setBurnoutMonitor] = useState<BurnoutPrediction | null>(null);
  const [expPopups, setExpPopups] = useState<{id: string, exp: number}[]>([]);
  const [nudge, setNudge] = useState<{ optimalHour: number; suggestion: string } | null>(null);
  const [recentlyCompletedIds, setRecentlyCompletedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const { goalsWithCounts, dumpsData, userData } = await fetchDashboardData('user123');
      
      setGoals(goalsWithCounts);
      setRecentlyCompletedIds(getCompletedIdsToday(goalsWithCounts));

      const allLogs = goalsWithCounts.flatMap(g => g.logs.map((l: any) => ({ ...l, goal_id: g.id })));
      
      const nudgeData = calculateStochasticNudges(allLogs);
      if (nudgeData) setNudge(nudgeData);

      const burnoutRisk = analyzeBurnoutRisk(allLogs, goalsWithCounts);
      setBurnoutMonitor(burnoutRisk);

      if (dumpsData && dumpsData.length > 0) {
        setLatestDump(JSON.parse(dumpsData[0].analysis));
      }
      
      const calculatedUser = calculateRPGStats(allLogs, userData, 100, 100);
      setUser(calculatedUser);
    } catch (e) {
      console.error('Failed to fetch dashboard data:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = async (data: { name: string, title: string, avatar_color: string }) => {
    try {
      const updatedUser = await updateProfileData('user123', data);
      setUser(prev => ({ ...prev, ...updatedUser }));
    } catch (e) {
      console.error('Failed to update profile', e);
    }
  };

  const resetProfile = async () => {
    try {
      await resetProfileData('user123');
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
  }, [fetchData]);

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
    resetProfile,
    isLoading
  };
}

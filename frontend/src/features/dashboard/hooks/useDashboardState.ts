import { useState, useEffect, useCallback } from 'react';
import type { Goal } from '../../../shared/types/goal';
import { calculateStochasticNudges, analyzeBurnoutRisk, BurnoutPrediction } from '../../../shared/services/analyticsService';
import { fetchDashboardData, updateProfileData, resetProfileData, UserStats } from '../services/dashboardApi';
import { calculateRPGStats, getCompletedIdsToday, calculateAchievements, Achievement } from '../utils/dashboardUtils';
import { useToast } from '../../../shared/components/Toast';

export function useDashboardState() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [user, setUser] = useState<UserStats>({ hp: 100, mana: 100, level: 1, exp: 0 });
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [latestDump, setLatestDump] = useState<{ summary: string; anxietyLevel: string; anxietyScore: number } | null>(null);

  const [burnoutMonitor, setBurnoutMonitor] = useState<BurnoutPrediction | null>(null);
  const [expPopups, setExpPopups] = useState<{id: string, exp: number}[]>([]);
  const [nudge, setNudge] = useState<{ optimalHour: number; suggestion: string } | null>(null);
  const [recentlyCompletedIds, setRecentlyCompletedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const { goalsWithCounts, dumpsData, userData } = await fetchDashboardData();
      
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
      
      const newAchievements = calculateAchievements(allLogs, calculatedUser.level);
      setAchievements(newAchievements);
    } catch (e: unknown) {
      toast({
        title: "Koneksi Terputus",
        description: "Gagal memuat data dari server.",
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const updateProfile = async (data: { name: string, title: string, avatar_color: string }) => {
    try {
      const updatedUser = await updateProfileData(undefined, data);
      setUser(prev => ({ ...prev, ...updatedUser }));
      toast({ title: "Profil Disimpan", type: 'success' });
    } catch (e: unknown) {
      toast({ title: "Gagal Menyimpan Profil", type: 'error' });
    }
  };

  const resetProfile = async () => {
    try {
      await resetProfileData();
      setGoals([]);
      setLatestDump(null);
      setBurnoutMonitor(null);
      setExpPopups([]);
      setRecentlyCompletedIds([]);
      setNudge(null);
      setUser({ hp: 100, mana: 100, level: 1, exp: 0 });
      setAchievements(calculateAchievements([], 1));
      toast({ title: "Data Direset", description: "Semua progres telah dihapus.", type: 'info' });
    } catch (e: unknown) {
      toast({ title: "Gagal Mereset Data", type: 'error' });
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    goals,
    setGoals,
    user,
    achievements,
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

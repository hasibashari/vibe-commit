import { create } from 'zustand';
import type { Goal } from '../shared/types/goal';
import type { UserStats } from '../shared/types/user';
import { BurnoutPrediction, calculateStochasticNudges, analyzeBurnoutRisk } from '../shared/services/analyticsService';
import { fetchDashboardData, updateProfileData, resetProfileData, updateSandboxData, buyItemAPI } from '../features/dashboard/services/dashboardApi';
import { calculateRPGStats, getCompletedIdsToday, calculateAchievements, Achievement } from '../features/dashboard/utils/dashboardUtils';
import { useToastStore } from './toastStore';

interface DashboardStore {
  goals: Goal[];
  setGoals: (goals: Goal[]) => void;
  user: UserStats;
  setUser: (user: UserStats) => void;
  achievements: Achievement[];
  latestDump: { summary: string; anxietyLevel: string; anxietyScore: number } | null;
  burnoutMonitor: BurnoutPrediction | null;
  expPopups: {id: string, exp: number}[];
  setExpPopups: (popups: {id: string, exp: number}[]) => void;
  nudge: { optimalHour: number; suggestion: string } | null;
  recentlyCompletedIds: string[];
  isLoading: boolean;

  fetchData: () => Promise<void>;
  updateProfile: (data: Partial<UserStats>, silent?: boolean) => Promise<void>;
  resetProfile: () => Promise<void>;
  updateSandbox: (payload: { hp?: number | null; mana?: number | null; level?: number | null; coins_delta?: number | null }) => Promise<void>;
  buyItem: (itemId: string, cost?: number, overrideCoins?: number | null) => Promise<boolean>;
}

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  goals: [],
  setGoals: (goals) => set({ goals }),
  user: { hp: 100, mana: 100, level: 1, exp: 0 },
  setUser: (user) => set({ user }),
  achievements: [],
  latestDump: null,
  burnoutMonitor: null,
  expPopups: [],
  setExpPopups: (popups) => set({ expPopups: popups }),
  nudge: null,
  recentlyCompletedIds: [],
  isLoading: true,

  fetchData: async () => {
    const { toast } = useToastStore.getState();
    try {
      set({ isLoading: true });
      const { goalsWithCounts, dumpsData, userData } = await fetchDashboardData();
      
      const allLogs = goalsWithCounts.flatMap(g => (g.logs || []).map((l: any) => ({ ...l, goal_id: g.id })));
      
      const calculatedUser = calculateRPGStats(allLogs, userData);
      
      set({
        goals: goalsWithCounts,
        recentlyCompletedIds: getCompletedIdsToday(goalsWithCounts),
        nudge: calculateStochasticNudges(allLogs) || null,
        burnoutMonitor: analyzeBurnoutRisk(allLogs, goalsWithCounts),
        latestDump: dumpsData && dumpsData.length > 0 ? JSON.parse(dumpsData[0].analysis) : null,
        user: calculatedUser,
        achievements: calculateAchievements(allLogs, calculatedUser.level)
      });
    } catch (e: unknown) {
      toast({
        title: "Koneksi Terputus",
        description: "Gagal memuat data dari server.",
        type: 'error'
      });
    } finally {
      set({ isLoading: false });
    }
  },

  updateProfile: async (data, silent) => {
    const { toast } = useToastStore.getState();
    try {
      const updatedUser = await updateProfileData(undefined, data);
      
      const { goals, user } = get();
      const allLogs = goals.flatMap(g => (g.logs || []).map((l: any) => ({ ...l, goal_id: g.id })));
      const newStats = calculateRPGStats(allLogs, { ...user, ...updatedUser });
      
      set({ user: newStats });
      if (!silent) toast({ title: "Profil Disimpan", type: 'success' });
    } catch (e: unknown) {
      if (!silent) toast({ title: "Gagal Menyimpan Profil", type: 'error' });
    }
  },

  resetProfile: async () => {
    const { toast } = useToastStore.getState();
    try {
      await resetProfileData();
      set({
        goals: [],
        latestDump: null,
        burnoutMonitor: null,
        expPopups: [],
        recentlyCompletedIds: [],
        nudge: null,
        user: { hp: 100, mana: 100, level: 1, exp: 0 },
        achievements: calculateAchievements([], 1)
      });
      toast({ title: "Data Direset", description: "Semua progres telah dihapus.", type: 'info' });
    } catch (e: unknown) {
      toast({ title: "Gagal Mereset Data", type: 'error' });
    }
  },

  updateSandbox: async (payload) => {
    try {
      const { user, goals } = get();
      const data = await updateSandboxData(user.id, payload);
      const newUser = { ...user, ...data };
      set({ user: newUser });
      if (payload.level !== undefined && payload.level !== null) {
        const allLogs = goals.flatMap(g => g.logs || []);
        set({ achievements: calculateAchievements(allLogs, data.level) });
      }
    } catch (e) {
      console.error(e);
    }
  },

  buyItem: async (itemId, cost, overrideCoins) => {
    const { toast } = useToastStore.getState();
    try {
      const { user, goals } = get();
      const updatedUser = await buyItemAPI(user.id, itemId);
      
      const allLogs = goals.flatMap(g => (g.logs || []).map((l: any) => ({ ...l, goal_id: g.id })));
      set({ user: calculateRPGStats(allLogs, { ...user, ...updatedUser }) });
      
      toast({ title: "Pembelian Berhasil", type: 'success' });
      return true;
    } catch (e: any) {
      toast({ title: e.message || "Gagal membeli item", type: 'error' });
      return false;
    }
  }
}));

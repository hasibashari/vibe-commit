import { create } from 'zustand';
import type { Goal } from '../shared/types/goal';
import type { Log } from '../shared/types/log';
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
  expPopups: { id: string, exp: number }[];
  setExpPopups: (popups: { id: string, exp: number }[]) => void;
  nudge: { optimalHour: number; suggestion: string } | null;
  recentlyCompletedIds: string[];
  allLogs: Log[];
  isLoading: boolean;

  fetchData: (options?: { skipCache?: boolean }) => Promise<void>;
  updateProfile: (data: Partial<UserStats>, silent?: boolean) => Promise<void>;
  resetProfile: () => Promise<void>;
  updateSandbox: (payload: { hp?: number | null; mana?: number | null; level?: number | null; coins_delta?: number | null; sandbox_date_offset?: number | null }) => Promise<void>;
  buyItem: (itemId: string, cost?: number, overrideCoins?: number | null) => Promise<boolean>;
  syncOfflineData: () => Promise<void>;
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
  allLogs: [],
  isLoading: true,

  fetchData: async (options?: { skipCache?: boolean }) => {
    const { toast } = useToastStore.getState();

    let cachedDataLoaded = false;
    const cachedDataStr = !options?.skipCache ? localStorage.getItem('vibe_commit_dashboard_cache') : null;

    if (cachedDataStr) {
      try {
        const { goalsWithCounts, dumpsData, userData, allLogsData } = JSON.parse(cachedDataStr);
        const allLogs = allLogsData || goalsWithCounts.flatMap((g: any) => (g.logs || []).map((l: any) => ({ ...l, goal_id: g.id })));
        const calculatedUser = calculateRPGStats(allLogs, userData);
        const offset = userData?.sandbox_date_offset || 0;

        set({
          goals: goalsWithCounts,
          recentlyCompletedIds: getCompletedIdsToday(goalsWithCounts, offset),
          nudge: calculateStochasticNudges(allLogs) || null,
          burnoutMonitor: analyzeBurnoutRisk(allLogs, goalsWithCounts, offset),
          latestDump: dumpsData && dumpsData.length > 0
            ? (() => {
              const parsed = typeof dumpsData[0].analysis === 'string' ? JSON.parse(dumpsData[0].analysis) : dumpsData[0].analysis;
              return {
                ...parsed,
                summary: parsed.summary || parsed.analysisSummary || ''
              };
            })()
            : null,
          user: calculatedUser,
          achievements: calculateAchievements(allLogs, calculatedUser.level),
          allLogs,
          isLoading: false
        });
        cachedDataLoaded = true;
      } catch (cacheErr) {
        console.error('Error parsing dashboard cache', cacheErr);
      }
    }

    // Only show the blocking loading spinner if we don't have any cached data to display
    if (!cachedDataLoaded) {
      set({ isLoading: true });
    }

    try {
      const { goalsWithCounts, dumpsData, userData, allLogsData } = await fetchDashboardData();

      try {
        localStorage.setItem('vibe_commit_dashboard_cache', JSON.stringify({
          goalsWithCounts,
          dumpsData,
          userData,
          allLogsData
        }));
      } catch (err) {
        console.error('Failed to write local dashboard cache', err);
      }

      const allLogs = allLogsData || goalsWithCounts.flatMap(g => (g.logs || []).map((l: any) => ({ ...l, goal_id: g.id })));
      const calculatedUser = calculateRPGStats(allLogs, userData);
      const offset = userData?.sandbox_date_offset || 0;

      set({
        goals: goalsWithCounts,
        recentlyCompletedIds: getCompletedIdsToday(goalsWithCounts, offset),
        nudge: calculateStochasticNudges(allLogs) || null,
        burnoutMonitor: analyzeBurnoutRisk(allLogs, goalsWithCounts, offset),
        latestDump: dumpsData && dumpsData.length > 0
          ? (() => {
            const parsed = typeof dumpsData[0].analysis === 'string' ? JSON.parse(dumpsData[0].analysis) : dumpsData[0].analysis;
            return {
              ...parsed,
              summary: parsed.summary || parsed.analysisSummary || ''
            };
          })()
          : null,
        user: calculatedUser,
        achievements: calculateAchievements(allLogs, calculatedUser.level),
        isLoading: false
      });
    } catch (e: unknown) {
      if (!cachedDataLoaded) {
        toast({
          title: "Koneksi Terputus",
          description: "Gagal memuat data dari server.",
          type: 'error'
        });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  updateProfile: async (data, silent) => {
    const { toast } = useToastStore.getState();
    try {
      const updatedUser = await updateProfileData(undefined, data);

      const { goals, user } = get();
      
      // Need to fetch full logs to calculate stats accurately after profile update
      // But for immediate UI update, we fallback to reconstructing from goals
      // since syncOfflineData/fetchData is typically called shortly after.
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
        allLogs: [],
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

      // Reconstruct temporary allLogs for immediate UI optimism before fetchData overwrites it
      const allLogs = goals.flatMap(g => (g.logs || []).map((l: any) => ({ ...l, goal_id: g.id })));
      const offset = newUser.sandbox_date_offset || 0;

      set({
        user: newUser,
        recentlyCompletedIds: getCompletedIdsToday(goals, offset),
        burnoutMonitor: analyzeBurnoutRisk(allLogs, goals, offset),
      });

      if (payload.level !== undefined && payload.level !== null) {
        set({ achievements: calculateAchievements(allLogs, data.level) });
      }

      await get().fetchData({ skipCache: true });
    } catch (e) {
      console.error(e);
    }
  },

  buyItem: async (itemId, _cost, _overrideCoins) => {
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
  },

  syncOfflineData: async () => {
    const { toast } = useToastStore.getState();
    const pendingActionsStr = localStorage.getItem('vibe_commit_pending_actions');
    if (!pendingActionsStr) return;

    let pendingActions: any[] = [];
    try {
      pendingActions = JSON.parse(pendingActionsStr);
    } catch (e) {
      console.error("Failed to parse pending sync actions", e);
      localStorage.removeItem('vibe_commit_pending_actions');
      return;
    }

    if (pendingActions.length === 0) return;

    const { logQuestActionApi, createQuestApi, updateQuestApi, deleteQuestApi, updateQuestDifficultyApi } =
      await import('../features/quests/services/questApi');

    const failedActions: any[] = [];

    for (const action of pendingActions) {
      try {
        if (action.type === 'LOG_QUEST') {
          await logQuestActionApi(action.goalId, action.logId);
        } else if (action.type === 'CREATE_QUEST') {
          await createQuestApi(action.questData, action.id);
        } else if (action.type === 'UPDATE_QUEST') {
          await updateQuestApi(action.questId, action.questData);
        } else if (action.type === 'DELETE_QUEST') {
          await deleteQuestApi(action.questId);
        } else if (action.type === 'UPDATE_DIFFICULTY') {
          await updateQuestDifficultyApi(action.goalId, action.newDifficulty);
        }
      } catch (err: any) {
        console.error("Failed to sync action", action, err);
        // Discard permanent errors (4xx Client errors: 400 Bad Request, 403 Forbidden, 404 Not Found, etc.)
        // to prevent blockages in the queue. Keep 5xx or network errors to retry later.
        const isApiError = err && err.name === 'ApiError';
        const isClientError = err && typeof err.status === 'number' && err.status >= 400 && err.status < 500;

        if (isClientError || isApiError) {
          console.warn(`[Sync Conflict] Discarding permanent conflict action of type ${action.type} due to HTTP status: ${err.status || 400}`);
        } else {
          failedActions.push(action);
        }
      }
    }

    if (failedActions.length > 0) {
      localStorage.setItem('vibe_commit_pending_actions', JSON.stringify(failedActions));
      toast({
        title: "Sinkronisasi Tertunda",
        description: `Gagal mengirim ${failedActions.length} aksi. Akan dicoba lagi nanti.`,
        type: 'info'
      });
    } else {
      localStorage.removeItem('vibe_commit_pending_actions');
      toast({
        title: "Sinkronisasi Selesai!",
        description: "Semua aksi offline berhasil disinkronkan ke server.",
        type: 'success'
      });
    }

    await get().fetchData({ skipCache: true });
  }
}));

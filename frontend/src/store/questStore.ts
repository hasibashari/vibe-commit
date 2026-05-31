import { create } from 'zustand';
import type { Goal } from '../shared/types/goal';
import { logQuestActionApi, updateQuestApi, createQuestApi, deleteQuestApi } from '../features/quests/services/questApi';
import { useToastStore } from './toastStore';
import { useDashboardStore } from './dashboardStore';
import { useUIStore } from './uiStore';
import { getExpNeededForLevel, MAX_LEVEL } from '../shared/utils/dateUtils';
import { generateId } from '../shared/utils/uuid';

const playVictoryOscillator = () => {
  try {
    if (typeof window === 'undefined') return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const audioCtx = new AudioContextClass();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    osc.type = 'square';

    const now = audioCtx.currentTime;
    osc.frequency.setValueAtTime(261.63, now); // C4
    osc.frequency.setValueAtTime(329.63, now + 0.1); // E4
    osc.frequency.setValueAtTime(392.00, now + 0.2); // G4
    osc.frequency.setValueAtTime(523.25, now + 0.3); // C5

    gainNode.gain.setValueAtTime(0.05, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.start(now);
    osc.stop(now + 0.6);
  } catch (e) { }
};

const handleOptimisticRPGStats = (currentLevel: number, currentExp: number, expEarned: number) => {
  let level = currentLevel;
  let exp = currentExp + expEarned;

  while (level < MAX_LEVEL && exp >= getExpNeededForLevel(level)) {
    exp -= getExpNeededForLevel(level);
    level += 1;
  }

  return { level, exp };
};

interface QuestStore {
  selectedGoal: Goal | null;
  setSelectedGoal: (goal: Goal | null) => void;
  questToDelete: string | null;
  setQuestToDelete: (id: string | null) => void;
  questToEdit: Goal | null;
  setQuestToEdit: (goal: Goal | null) => void;

  handleLogAction: (goalId: string) => Promise<void>;
  handleSaveQuest: (questData: Partial<Goal>) => Promise<void>;
  confirmDeleteQuest: (goalId: string) => void;
  executeDeleteQuest: () => Promise<void>;
}

export const useQuestStore = create<QuestStore>((set, get) => ({
  selectedGoal: null,
  setSelectedGoal: (goal) => set({ selectedGoal: goal }),
  questToDelete: null,
  setQuestToDelete: (id) => set({ questToDelete: id }),
  questToEdit: null,
  setQuestToEdit: (goal) => set({ questToEdit: goal }),

  handleLogAction: async (goalId: string) => {
    const { goals, setGoals, setExpPopups, user, setUser, fetchData } = useDashboardStore.getState();
    const { toast } = useToastStore.getState();
    const goal = goals.find(g => g.id === goalId);

    let expEarned = 0;
    if (goal) {
      expEarned = Math.floor(goal.difficulty * 10 * goal.reward_alpha);
      const popupId = generateId();
      const currentPopups = useDashboardStore.getState().expPopups;
      setExpPopups([...currentPopups, { id: popupId, exp: expEarned }]);
      setTimeout(() => {
        const remainingPopups = useDashboardStore.getState().expPopups;
        setExpPopups(remainingPopups.filter((p: any) => p.id !== popupId));
      }, 2500);

      // Play 8-bit sound directly via Web Audio
      playVictoryOscillator();
    }

    const logId = generateId();

    // Check online status
    if (!navigator.onLine) {
      if (goal) {
        // Queue action
        const pendingStr = localStorage.getItem('vibe_commit_pending_actions') || '[]';
        try {
          const pending = JSON.parse(pendingStr);
          const isDuplicate = pending.some((a: any) => a.type === 'LOG_QUEST' && a.goalId === goalId && a.logId === logId);
          if (!isDuplicate) {
            pending.push({ type: 'LOG_QUEST', goalId, logId });
            localStorage.setItem('vibe_commit_pending_actions', JSON.stringify(pending));
          }
        } catch (e) {
          console.error(e);
        }

        // Perform local optimistic update
        const updatedGoals = goals.map(g => {
          if (g.id === goalId) {
            const newLogs = [...(g.logs || []), {
              id: logId,
              goal_id: goalId,
              timestamp: new Date().toISOString()
            }];
            return {
              ...g,
              repetition_count: Number(g.repetition_count || 0) + 1,
              logs: newLogs
            };
          }
          return g;
        });

        // Calculate and update local RPG Stats
        const newStats = handleOptimisticRPGStats(user.level, user.exp, expEarned);
        setUser({ ...user, ...newStats });
        setGoals(updatedGoals);
      }
      return;
    }

    try {
      await logQuestActionApi(goalId, logId);
      await fetchData();
    } catch (e: unknown) {
      if (goal) {
        const pendingStr = localStorage.getItem('vibe_commit_pending_actions') || '[]';
        try {
          const pending = JSON.parse(pendingStr);
          const isDuplicate = pending.some((a: any) => a.type === 'LOG_QUEST' && a.goalId === goalId && a.logId === logId);
          if (!isDuplicate) {
            pending.push({ type: 'LOG_QUEST', goalId, logId });
            localStorage.setItem('vibe_commit_pending_actions', JSON.stringify(pending));
          }
        } catch (err) { }

        const updatedGoals = goals.map(g => {
          if (g.id === goalId) {
            const newLogs = [...(g.logs || []), {
              id: logId,
              goal_id: goalId,
              timestamp: new Date().toISOString()
            }];
            return {
              ...g,
              repetition_count: Number(g.repetition_count || 0) + 1,
              logs: newLogs
            };
          }
          return g;
        });

        const newStats = handleOptimisticRPGStats(user.level, user.exp, expEarned);
        setUser({ ...user, ...newStats });
        setGoals(updatedGoals);
      } else {
        let desc = "Pastikan koneksi lancar.";
        if (e instanceof Error) desc = e.message;
        toast({
          title: "Gagal Melog Quest",
          description: desc,
          type: 'error'
        });
      }
    }
  },

  handleSaveQuest: async (questData: Partial<Goal>) => {
    const { questToEdit, selectedGoal } = get();
    const { goals, setGoals, fetchData } = useDashboardStore.getState();
    const { toast } = useToastStore.getState();
    const { setIsQuestEditorOpen } = useUIStore.getState();

    const questId = questToEdit ? questToEdit.id : generateId();

    // Construct the optimistic quest and goal list
    const previousGoals = [...goals];
    const previousSelectedGoal = selectedGoal;

    const optimisticQuest: Goal = questToEdit
      ? ({ ...questToEdit, ...questData } as Goal)
      : {
          id: questId,
          title: questData.title || 'Untitled Quest',
          description: questData.description || '',
          category: questData.category || 'productivity',
          difficulty: questData.difficulty ?? 1.0,
          reward_alpha: questData.reward_alpha ?? 0.5,
          type: questData.type || 'daily',
          repetition_count: 0,
          logs: [],
          status: 'active'
        };

    const optimisticGoals = questToEdit
      ? goals.map(g => (g.id === questToEdit.id ? { ...g, ...questData } as Goal : g))
      : [...goals, optimisticQuest];

    // Check offline status
    if (!navigator.onLine) {
      // Offline local optimistic update
      setGoals(optimisticGoals);
      if (questToEdit && selectedGoal?.id === questToEdit.id) {
        set({ selectedGoal: optimisticQuest });
      }

      const pendingStr = localStorage.getItem('vibe_commit_pending_actions') || '[]';
      try {
        const pending = JSON.parse(pendingStr);
        if (questToEdit) {
          const existingIdx = pending.findIndex((a: any) => a.type === 'UPDATE_QUEST' && a.questId === questToEdit.id);
          if (existingIdx !== -1) {
            pending[existingIdx].questData = { ...pending[existingIdx].questData, ...questData };
          } else {
            pending.push({ type: 'UPDATE_QUEST', questId: questToEdit.id, questData });
          }
        } else {
          const isDuplicate = pending.some((a: any) => a.type === 'CREATE_QUEST' && a.id === questId);
          if (!isDuplicate) {
            pending.push({ type: 'CREATE_QUEST', id: questId, questData });
          }
        }
        localStorage.setItem('vibe_commit_pending_actions', JSON.stringify(pending));
      } catch (e) { }

      toast({ title: questToEdit ? "Quest Diperbarui (Offline)" : "Quest Baru Dibuat (Offline)", type: 'success' });
      setIsQuestEditorOpen(false);
      set({ questToEdit: null });
      return;
    }

    // Online optimistic update
    setGoals(optimisticGoals);
    if (questToEdit && selectedGoal?.id === questToEdit.id) {
      set({ selectedGoal: optimisticQuest });
    }
    setIsQuestEditorOpen(false);
    set({ questToEdit: null });

    try {
      if (questToEdit) {
        await updateQuestApi(questToEdit.id, questData);
        toast({ title: "Quest Diperbarui", type: 'success' });
      } else {
        await createQuestApi(questData, questId);
        toast({ title: "Quest Baru Dibuat", type: 'success' });
      }
      // Silently sync database in the background to ensure consistency
      fetchData().catch(() => {});
    } catch (e: unknown) {
      // Rollback optimistic state
      setGoals(previousGoals);
      set({ selectedGoal: previousSelectedGoal });

      // Save to offline queue so user doesn't lose their data
      const pendingStr = localStorage.getItem('vibe_commit_pending_actions') || '[]';
      try {
        const pending = JSON.parse(pendingStr);
        if (questToEdit) {
          const existingIdx = pending.findIndex((a: any) => a.type === 'UPDATE_QUEST' && a.questId === questToEdit.id);
          if (existingIdx !== -1) {
            pending[existingIdx].questData = { ...pending[existingIdx].questData, ...questData };
          } else {
            pending.push({ type: 'UPDATE_QUEST', questId: questToEdit.id, questData });
          }
        } else {
          const isDuplicate = pending.some((a: any) => a.type === 'CREATE_QUEST' && a.id === questId);
          if (!isDuplicate) {
            pending.push({ type: 'CREATE_QUEST', id: questId, questData });
          }
        }
        localStorage.setItem('vibe_commit_pending_actions', JSON.stringify(pending));
      } catch (err) { }

      toast({ title: "Koneksi Bermasalah - Disimpan Lokal", type: 'info' });
    }
  },

  confirmDeleteQuest: (goalId: string) => {
    set({ questToDelete: goalId });
  },

  executeDeleteQuest: async () => {
    const { questToDelete, selectedGoal } = get();
    const { fetchData, goals, setGoals } = useDashboardStore.getState();
    const { toast } = useToastStore.getState();

    if (!questToDelete) return;

    const previousGoals = [...goals];
    const previousSelectedGoal = selectedGoal;
    const deletedId = questToDelete;

    // Optimistic UI update
    if (selectedGoal?.id === deletedId) {
      set({ selectedGoal: null });
    }
    setGoals(goals.map((g: any) => g.id === deletedId ? { ...g, status: 'archived' } : g));
    set({ questToDelete: null });

    if (!navigator.onLine) {
      const pendingStr = localStorage.getItem('vibe_commit_pending_actions') || '[]';
      try {
        const pending = JSON.parse(pendingStr);
        const isDuplicate = pending.some((a: any) => a.type === 'DELETE_QUEST' && a.questId === deletedId);
        if (!isDuplicate) {
          pending.push({ type: 'DELETE_QUEST', questId: deletedId });
          localStorage.setItem('vibe_commit_pending_actions', JSON.stringify(pending));
        }
      } catch (e) { }
      toast({ title: "Quest Dihapus (Offline)", type: 'success' });
      return;
    }

    try {
      await deleteQuestApi(deletedId);
      // Silently sync database in the background to ensure consistency
      fetchData().catch(() => {});
    } catch (e: unknown) {
      // Rollback optimistic state
      setGoals(previousGoals);
      set({ selectedGoal: previousSelectedGoal });

      // Save to offline queue so user doesn't lose their deletion intent
      const pendingStr = localStorage.getItem('vibe_commit_pending_actions') || '[]';
      try {
        const pending = JSON.parse(pendingStr);
        const isDuplicate = pending.some((a: any) => a.type === 'DELETE_QUEST' && a.questId === deletedId);
        if (!isDuplicate) {
          pending.push({ type: 'DELETE_QUEST', questId: deletedId });
          localStorage.setItem('vibe_commit_pending_actions', JSON.stringify(pending));
        }
      } catch (err) { }

      toast({ title: "Koneksi Bermasalah - Dihapus Lokal", type: 'info' });
    }
  }
}));

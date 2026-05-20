import { create } from 'zustand';
import type { Goal } from '../shared/types/goal';
import { calculateProbability, adjustDifficultyBayesian } from '../shared/utils/vibeMath';
import { logQuestActionApi, updateQuestDifficultyApi, updateQuestApi, createQuestApi, deleteQuestApi } from '../features/quests/services/questApi';
import { useToastStore } from './toastStore';
import { useDashboardStore } from './dashboardStore';
import { useUIStore } from './uiStore';

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
  } catch (e) {}
};

const getExpNeededForLevel = (level: number): number => {
  return Math.floor(100 * Math.pow(1.2, level - 1));
};

const handleOptimisticRPGStats = (currentLevel: number, currentExp: number, expEarned: number) => {
  let level = currentLevel;
  let exp = currentExp + expEarned;
  
  while (exp >= getExpNeededForLevel(level)) {
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
      const popupId = crypto.randomUUID();
      const currentPopups = useDashboardStore.getState().expPopups;
      setExpPopups([...currentPopups, { id: popupId, exp: expEarned }]);
      setTimeout(() => {
        const remainingPopups = useDashboardStore.getState().expPopups;
        setExpPopups(remainingPopups.filter((p: any) => p.id !== popupId));
      }, 2500);

      // Play 8-bit sound directly via Web Audio
      playVictoryOscillator();
    }

    const logId = crypto.randomUUID();

    // Check online status
    if (!navigator.onLine) {
      if (goal) {
        // Queue action
        const pendingStr = localStorage.getItem('vibe_commit_pending_actions') || '[]';
        try {
          const pending = JSON.parse(pendingStr);
          pending.push({ type: 'LOG_QUEST', goalId, logId });
          localStorage.setItem('vibe_commit_pending_actions', JSON.stringify(pending));
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
              repetition_count: g.repetition_count + 1,
              logs: newLogs
            };
          }
          return g;
        });

        // Bayesian calibration locally
        const updatedGoal = updatedGoals.find(g => g.id === goalId);
        if (updatedGoal) {
          const prob = calculateProbability(updatedGoal.repetition_count, updatedGoal.difficulty, updatedGoal.reward_alpha);
          const newD = adjustDifficultyBayesian(prob, updatedGoal.difficulty);
          if (newD !== updatedGoal.difficulty) {
            updatedGoal.difficulty = newD;
            // Also queue the difficulty update
            const pendingStr2 = localStorage.getItem('vibe_commit_pending_actions') || '[]';
            try {
              const pending2 = JSON.parse(pendingStr2);
              pending2.push({ type: 'UPDATE_DIFFICULTY', goalId, newDifficulty: newD });
              localStorage.setItem('vibe_commit_pending_actions', JSON.stringify(pending2));
            } catch (e) {}
          }
        }

        // Calculate and update local RPG Stats
        const newStats = handleOptimisticRPGStats(user.level, user.exp, expEarned);
        setUser({ ...user, ...newStats });
        setGoals(updatedGoals);
      }
      return;
    }

    try {
      await logQuestActionApi(goalId, logId);

      if (goal) {
        const prob = calculateProbability(goal.repetition_count + 1, goal.difficulty, goal.reward_alpha);
        const newD = adjustDifficultyBayesian(prob, goal.difficulty);
        
        if (newD !== goal.difficulty) {
          await updateQuestDifficultyApi(goalId, newD);
        }
      }

      await fetchData();
    } catch (e: unknown) {
      if (goal) {
        const pendingStr = localStorage.getItem('vibe_commit_pending_actions') || '[]';
        try {
          const pending = JSON.parse(pendingStr);
          pending.push({ type: 'LOG_QUEST', goalId, logId });
          localStorage.setItem('vibe_commit_pending_actions', JSON.stringify(pending));
        } catch (err) {}

        const updatedGoals = goals.map(g => {
          if (g.id === goalId) {
            const newLogs = [...(g.logs || []), {
              id: logId,
              goal_id: goalId,
              timestamp: new Date().toISOString()
            }];
            return {
              ...g,
              repetition_count: g.repetition_count + 1,
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

    const questId = questToEdit ? questToEdit.id : crypto.randomUUID();

    if (!navigator.onLine) {
      if (questToEdit) {
        const updatedGoals = goals.map(g => {
          if (g.id === questToEdit.id) {
            return { ...g, ...questData } as Goal;
          }
          return g;
        });
        setGoals(updatedGoals);
        if (selectedGoal?.id === questToEdit.id) {
          set({ selectedGoal: { ...selectedGoal, ...questData } as Goal });
        }

        const pendingStr = localStorage.getItem('vibe_commit_pending_actions') || '[]';
        try {
          const pending = JSON.parse(pendingStr);
          pending.push({ type: 'UPDATE_QUEST', questId: questToEdit.id, questData });
          localStorage.setItem('vibe_commit_pending_actions', JSON.stringify(pending));
        } catch (e) {}

        toast({ title: "Quest Diperbarui (Offline)", type: 'success' });
      } else {
        const newGoal: Goal = {
          id: questId,
          title: questData.title || 'Untitled Quest',
          description: questData.description || '',
          category: questData.category || 'productivity',
          difficulty: questData.difficulty ?? 0.5,
          reward_alpha: questData.reward_alpha ?? 1,
          repetition_count: 0,
          logs: [],
          status: 'active'
        };
        setGoals([...goals, newGoal]);

        const pendingStr = localStorage.getItem('vibe_commit_pending_actions') || '[]';
        try {
          const pending = JSON.parse(pendingStr);
          pending.push({ type: 'CREATE_QUEST', id: questId, questData });
          localStorage.setItem('vibe_commit_pending_actions', JSON.stringify(pending));
        } catch (e) {}

        toast({ title: "Quest Baru Dibuat (Offline)", type: 'success' });
      }

      setIsQuestEditorOpen(false);
      set({ questToEdit: null });
      return;
    }

    try {
      if (questToEdit) {
        await updateQuestApi(questToEdit.id, questData);
        if (selectedGoal?.id === questToEdit.id) {
          set({ selectedGoal: { ...selectedGoal, ...questData } as Goal });
        }
        toast({ title: "Quest Diperbarui", type: 'success' });
      } else {
        await createQuestApi(questData, questId);
        toast({ title: "Quest Baru Dibuat", type: 'success' });
      }
      setIsQuestEditorOpen(false);
      set({ questToEdit: null });
      await fetchData();
    } catch (e: unknown) {
      if (questToEdit) {
        const updatedGoals = goals.map(g => {
          if (g.id === questToEdit.id) {
            return { ...g, ...questData } as Goal;
          }
          return g;
        });
        setGoals(updatedGoals);
        if (selectedGoal?.id === questToEdit.id) {
          set({ selectedGoal: { ...selectedGoal, ...questData } as Goal });
        }

        const pendingStr = localStorage.getItem('vibe_commit_pending_actions') || '[]';
        try {
          const pending = JSON.parse(pendingStr);
          pending.push({ type: 'UPDATE_QUEST', questId: questToEdit.id, questData });
          localStorage.setItem('vibe_commit_pending_actions', JSON.stringify(pending));
        } catch (err) {}

        toast({ title: "Koneksi Bermasalah - Disimpan Lokal", type: 'info' });
      } else {
        const newGoal: Goal = {
          id: questId,
          title: questData.title || 'Untitled Quest',
          description: questData.description || '',
          category: questData.category || 'productivity',
          difficulty: questData.difficulty ?? 0.5,
          reward_alpha: questData.reward_alpha ?? 1,
          repetition_count: 0,
          logs: [],
          status: 'active'
        };
        setGoals([...goals, newGoal]);

        const pendingStr = localStorage.getItem('vibe_commit_pending_actions') || '[]';
        try {
          const pending = JSON.parse(pendingStr);
          pending.push({ type: 'CREATE_QUEST', id: questId, questData });
          localStorage.setItem('vibe_commit_pending_actions', JSON.stringify(pending));
        } catch (err) {}

        toast({ title: "Koneksi Bermasalah - Dibuat Lokal", type: 'info' });
      }
      setIsQuestEditorOpen(false);
      set({ questToEdit: null });
    }
  },

  confirmDeleteQuest: (goalId: string) => {
    set({ questToDelete: goalId });
  },

  executeDeleteQuest: async () => {
    const { questToDelete, selectedGoal } = get();
    const { fetchData, goals, setGoals } = useDashboardStore.getState();


    if (!questToDelete) return;

    if (!navigator.onLine) {
      if (selectedGoal?.id === questToDelete) {
        set({ selectedGoal: null });
      }
      setGoals(goals.filter((g: any) => g.id !== questToDelete));
      set({ questToDelete: null });

      const pendingStr = localStorage.getItem('vibe_commit_pending_actions') || '[]';
      try {
        const pending = JSON.parse(pendingStr);
        pending.push({ type: 'DELETE_QUEST', questId: questToDelete });
        localStorage.setItem('vibe_commit_pending_actions', JSON.stringify(pending));
      } catch (e) {}

      return;
    }

    try {
      await deleteQuestApi(questToDelete);
      
      if (selectedGoal?.id === questToDelete) {
        set({ selectedGoal: null });
      }
      setGoals(goals.filter((g: any) => g.id !== questToDelete));
      set({ questToDelete: null });
      await fetchData();
    } catch (e: unknown) {
      if (selectedGoal?.id === questToDelete) {
        set({ selectedGoal: null });
      }
      setGoals(goals.filter((g: any) => g.id !== questToDelete));
      set({ questToDelete: null });

      const pendingStr = localStorage.getItem('vibe_commit_pending_actions') || '[]';
      try {
        const pending = JSON.parse(pendingStr);
        pending.push({ type: 'DELETE_QUEST', questId: questToDelete });
        localStorage.setItem('vibe_commit_pending_actions', JSON.stringify(pending));
      } catch (err) {}
    }
  }
}));

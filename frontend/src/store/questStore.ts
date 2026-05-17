import { create } from 'zustand';
import type { Goal } from '../shared/types/goal';
import { calculateProbability, adjustDifficultyBayesian } from '../shared/utils/vibeMath';
import { logQuestActionApi, updateQuestDifficultyApi, updateQuestApi, createQuestApi, deleteQuestApi } from '../features/quests/services/questApi';
import { useToastStore } from './toastStore';
import { useDashboardStore } from './dashboardStore';
import { useUIStore } from './uiStore';

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
    const { goals, setExpPopups, recalculateState } = useDashboardStore.getState();
    const { toast } = useToastStore.getState();
    const goalIndex = goals.findIndex(g => g.id === goalId);
    const goal = goals[goalIndex];
    
    if (goal) {
      const expEarned = Math.floor(goal.difficulty * 10 * goal.reward_alpha);
      const popupId = crypto.randomUUID();
      const currentPopups = useDashboardStore.getState().expPopups;
      setExpPopups([...currentPopups, { id: popupId, exp: expEarned }]);
      setTimeout(() => {
        const remainingPopups = useDashboardStore.getState().expPopups;
        setExpPopups(remainingPopups.filter((p: { id: string, exp: number }) => p.id !== popupId));
      }, 2500);

      // Optimistic Log Update
      const logId = crypto.randomUUID();
      const newLog = {
        id: logId,
        goal_id: goalId,
        timestamp: new Date().toISOString(),
        vibe_score: 8,
        notes: 'Auto-logged from dashboard'
      };
      
      const updatedGoal = { 
        ...goal, 
        repetition_count: (goal.repetition_count || 0) + 1,
        logs: [newLog, ...(goal.logs || [])]
      };

      const updatedGoals = [...goals];
      updatedGoals[goalIndex] = updatedGoal;
      recalculateState(updatedGoals);

      try {
        await logQuestActionApi(goalId, logId);

        const prob = calculateProbability(updatedGoal.repetition_count, updatedGoal.difficulty, updatedGoal.reward_alpha);
        const newD = adjustDifficultyBayesian(prob, updatedGoal.difficulty, updatedGoal.repetition_count);
        
        if (newD !== updatedGoal.difficulty) {
          await updateQuestDifficultyApi(goalId, newD);
          updatedGoals[goalIndex] = { ...updatedGoal, difficulty: newD };
          recalculateState(updatedGoals);
          toast({
            title: "Kalibrasi",
            description: `Tingkat kesulitan '${goal.title}' disesuaikan.`,
            type: 'info'
          });
        }
      } catch(e: unknown) {
        // Revert on failure
        recalculateState(goals);
        let desc = "Pastikan koneksi lancar.";
        if (e instanceof Error) desc = e.message;
        toast({ title: "Gagal Melog Quest", description: desc, type: 'error' });
      }
    }
  },

  handleSaveQuest: async (questData: Partial<Goal>) => {
    const { questToEdit, selectedGoal } = get();
    const { goals, recalculateState } = useDashboardStore.getState();
    const { toast } = useToastStore.getState();
    const { setIsQuestEditorOpen } = useUIStore.getState();

    try {
      let updatedGoals = [...goals];
      
      if (questToEdit) {
        const index = updatedGoals.findIndex(g => g.id === questToEdit.id);
        const updatedGoal = { ...updatedGoals[index], ...questData };
        updatedGoals[index] = updatedGoal;
        
        // Optimistic UI Update
        recalculateState(updatedGoals);
        if (selectedGoal?.id === questToEdit.id) {
          set({ selectedGoal: updatedGoal });
        }
        
        await updateQuestApi(questToEdit.id, questData);
        toast({ title: "Quest Diperbarui", type: 'success' });
      } else {
        const newId = crypto.randomUUID();
        const newGoal = {
          id: newId,
          title: questData.title || '',
          description: questData.description || null,
          category: questData.category || null,
          difficulty: questData.difficulty || 1.0,
          reward_alpha: questData.reward_alpha || 0.5,
          user_id: '',
          created_at: new Date().toISOString(),
          repetition_count: 0,
          logs: []
        };
        
        // Optimistic
        updatedGoals.push(newGoal);
        recalculateState(updatedGoals);
        
        await createQuestApi(questData, newId);
        toast({ title: "Quest Baru Dibuat", type: 'success' });
      }
      setIsQuestEditorOpen(false);
      set({ questToEdit: null });
    } catch (e: unknown) {
      // Revert if fetch/save fails
      recalculateState(useDashboardStore.getState().goals);
      let desc = "Terjadi kesalahan";
      if (e instanceof Error) desc = e.message;
      toast({ title: "Gagal Menyimpan Quest", description: desc, type: 'error' });
    }
  },

  confirmDeleteQuest: (goalId: string) => {
    set({ questToDelete: goalId });
  },

  executeDeleteQuest: async () => {
    const { questToDelete, selectedGoal } = get();
    const { goals, recalculateState } = useDashboardStore.getState();
    const { toast } = useToastStore.getState();

    if (!questToDelete) return;

    const originalGoals = [...goals];
    // Optimistic Delete
    const updatedGoals = originalGoals.filter(g => g.id !== questToDelete);
    recalculateState(updatedGoals);
    
    if (selectedGoal?.id === questToDelete) {
      set({ selectedGoal: null });
    }
    set({ questToDelete: null });

    try {
      await deleteQuestApi(questToDelete);
      toast({ title: "Quest Dihapus", type: 'info' });
    } catch (e: unknown) {
      // Revert
      recalculateState(originalGoals);
      console.error(e);
      let desc = "Terjadi kesalahan";
      if (e instanceof Error) desc = e.message;
      toast({ title: "Gagal Menghapus Quest", description: desc, type: 'error' });
    }
  }
}));

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
    const { goals, setExpPopups, fetchData } = useDashboardStore.getState();
    const { toast } = useToastStore.getState();
    const goal = goals.find(g => g.id === goalId);
    
    if (goal) {
      const expEarned = Math.floor(goal.difficulty * 10 * goal.reward_alpha);
      const popupId = crypto.randomUUID();
      const currentPopups = useDashboardStore.getState().expPopups;
      setExpPopups([...currentPopups, { id: popupId, exp: expEarned }]);
      setTimeout(() => {
        const remainingPopups = useDashboardStore.getState().expPopups;
        setExpPopups(remainingPopups.filter((p: any) => p.id !== popupId));
      }, 2500);
    }

    try {
      const logId = crypto.randomUUID();
      await logQuestActionApi(goalId, logId);

      if (goal) {
        const prob = calculateProbability(goal.repetition_count + 1, goal.difficulty, goal.reward_alpha);
        const newD = adjustDifficultyBayesian(prob, goal.difficulty);
        
        if (newD !== goal.difficulty) {
          await updateQuestDifficultyApi(goalId, newD);
          toast({
            title: "Kalibrasi",
            description: `Tingkat kesulitan '${goal.title}' disesuaikan.`,
            type: 'info'
          });
        }
      }

      await fetchData();
    } catch(e: unknown) {
      let desc = "Pastikan koneksi lancar.";
      if (e instanceof Error) desc = e.message;
      toast({
        title: "Gagal Melog Quest",
        description: desc,
        type: 'error'
      });
    }
  },

  handleSaveQuest: async (questData: Partial<Goal>) => {
    const { questToEdit, selectedGoal } = get();
    const { fetchData } = useDashboardStore.getState();
    const { toast } = useToastStore.getState();
    const { setIsQuestEditorOpen } = useUIStore.getState();

    try {
      if (questToEdit) {
        await updateQuestApi(questToEdit.id, questData);
        if (selectedGoal?.id === questToEdit.id) {
          set({ selectedGoal: { ...selectedGoal, ...questData } as Goal });
        }
        toast({ title: "Quest Diperbarui", type: 'success' });
      } else {
        await createQuestApi(questData, crypto.randomUUID());
        toast({ title: "Quest Baru Dibuat", type: 'success' });
      }
      setIsQuestEditorOpen(false);
      set({ questToEdit: null });
      await fetchData();
    } catch (e: unknown) {
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
    const { fetchData, goals, setGoals } = useDashboardStore.getState();
    const { toast } = useToastStore.getState();

    if (!questToDelete) return;
    try {
      await deleteQuestApi(questToDelete);
      
      if (selectedGoal?.id === questToDelete) {
        set({ selectedGoal: null });
      }
      setGoals(goals.filter((g: any) => g.id !== questToDelete));
      set({ questToDelete: null });
      await fetchData();
      toast({ title: "Quest Dihapus", type: 'info' });
    } catch (e: unknown) {
      console.error(e);
      set({ questToDelete: null });
      let desc = "Terjadi kesalahan";
      if (e instanceof Error) desc = e.message;
      toast({ title: "Gagal Menghapus Quest", description: desc, type: 'error' });
    }
  }
}));

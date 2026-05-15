import React, { useState } from 'react';
import type { Goal } from '../../../shared/types/goal';
import { calculateProbability, adjustDifficultyBayesian } from '../../../shared/utils/vibeMath';
import { logQuestActionApi, updateQuestDifficultyApi, createExperimentalBranchApi, updateQuestApi, createQuestApi, deleteQuestApi } from '../services/questApi';
import { useToast } from '../../../shared/components/Toast';

export function useQuest(
  goals: Goal[], 
  fetchData: () => Promise<void>, 
  setExpPopups: React.Dispatch<React.SetStateAction<{id: string, exp: number}[]>>
) {
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [isQuestEditorOpen, setIsQuestEditorOpen] = useState(false);
  const [questToDelete, setQuestToDelete] = useState<string | null>(null);
  const [questToEdit, setQuestToEdit] = useState<Goal | null>(null);
  const { toast } = useToast();

  const handleLogAction = async (goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (goal) {
      const expEarned = Math.floor(goal.difficulty * 10 * goal.reward_alpha);
      const popupId = crypto.randomUUID();
      setExpPopups(prev => [...prev, { id: popupId, exp: expEarned }]);
      setTimeout(() => {
        setExpPopups(prev => prev.filter(p => p.id !== popupId));
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

      fetchData();
    } catch(e: unknown) {
      let desc = "Pastikan koneksi lancar.";
      if (e instanceof Error) desc = e.message;
      toast({
        title: "Gagal Melog Quest",
        description: desc,
        type: 'error'
      });
    }
  };

  const handleBranch = async (parent: Goal) => {
    try {
      const id = crypto.randomUUID();
      await createExperimentalBranchApi(parent, id);
      fetchData();
      toast({ title: "Branching Berhasil", description: `Variasi dari '${parent.title}' dibuat.`, type: 'success' });
    } catch(e: unknown) {
      let desc = "Terjadi kesalahan";
      if (e instanceof Error) desc = e.message;
      toast({ title: "Gagal Branching", description: desc, type: 'error' });
    }
  };

  const handleSaveQuest = async (questData: Partial<Goal>) => {
    try {
      if (questToEdit) {
        await updateQuestApi(questToEdit.id, questData);
        if (selectedGoal?.id === questToEdit.id) {
          setSelectedGoal({ ...selectedGoal, ...questData } as Goal);
        }
        toast({ title: "Quest Diperbarui", type: 'success' });
      } else {
        await createQuestApi(questData, crypto.randomUUID());
        toast({ title: "Quest Baru Dibuat", type: 'success' });
      }
      setIsQuestEditorOpen(false);
      setQuestToEdit(null);
      fetchData();
    } catch (e: unknown) {
      let desc = "Terjadi kesalahan";
      if (e instanceof Error) desc = e.message;
      toast({ title: "Gagal Menyimpan Quest", description: desc, type: 'error' });
    }
  };

  const confirmDeleteQuest = (goalId: string) => {
    setQuestToDelete(goalId);
  };

  const executeDeleteQuest = async (setGoals: React.Dispatch<React.SetStateAction<Goal[]>>) => {
    if (!questToDelete) return;
    try {
      await deleteQuestApi(questToDelete);
      
      if (selectedGoal?.id === questToDelete) {
        setSelectedGoal(null);
      }
      setGoals(prev => prev.filter(g => g.id !== questToDelete));
      setQuestToDelete(null);
      await fetchData();
      toast({ title: "Quest Dihapus", type: 'info' });
    } catch (e: unknown) {
      console.error(e);
      setQuestToDelete(null);
      let desc = "Terjadi kesalahan";
      if (e instanceof Error) desc = e.message;
      toast({ title: "Gagal Menghapus Quest", description: desc, type: 'error' });
    }
  };

  return {
    selectedGoal,
    setSelectedGoal,
    isQuestEditorOpen,
    setIsQuestEditorOpen,
    questToDelete,
    setQuestToDelete,
    questToEdit,
    setQuestToEdit,
    handleLogAction,
    handleBranch,
    handleSaveQuest,
    confirmDeleteQuest,
    executeDeleteQuest
  };
}

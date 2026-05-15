import React, { useState } from 'react';
import type { Goal } from '../../../app/App';
import { calculateProbability, adjustDifficultyBayesian } from '../../../shared/services/vibeService';
import { logQuestActionApi, updateQuestDifficultyApi, createExperimentalBranchApi, updateQuestApi, createQuestApi, deleteQuestApi } from '../services/questApi';

export function useQuest(
  goals: Goal[], 
  fetchData: () => Promise<void>, 
  setExpPopups: React.Dispatch<React.SetStateAction<{id: string, exp: number}[]>>
) {
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [isQuestEditorOpen, setIsQuestEditorOpen] = useState(false);
  const [questToDelete, setQuestToDelete] = useState<string | null>(null);
  const [questToEdit, setQuestToEdit] = useState<Goal | null>(null);

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

    const logId = crypto.randomUUID();
    await logQuestActionApi(goalId, logId);

    if (goal) {
      const prob = calculateProbability(goal.repetition_count + 1, goal.difficulty, goal.reward_alpha);
      const newD = adjustDifficultyBayesian(prob, goal.difficulty);
      
      if (newD !== goal.difficulty) {
        await updateQuestDifficultyApi(goalId, newD);
        console.log(`Bayesian adjustment: D shifted from ${goal.difficulty} to ${newD}`);
      }
    }

    fetchData();
  };

  const handleBranch = async (parent: Goal) => {
    const id = crypto.randomUUID();
    await createExperimentalBranchApi(parent, id);
    fetchData();
  };

  const handleSaveQuest = async (questData: Partial<Goal>) => {
    if (questToEdit) {
      await updateQuestApi(questToEdit.id, questData);
      if (selectedGoal?.id === questToEdit.id) {
        setSelectedGoal({ ...selectedGoal, ...questData } as Goal);
      }
    } else {
      await createQuestApi(questData, crypto.randomUUID());
    }
    setIsQuestEditorOpen(false);
    setQuestToEdit(null);
    fetchData();
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
    } catch (e) {
      console.error(e);
      setQuestToDelete(null);
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

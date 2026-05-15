import type { Goal } from '../../../shared/types/goal';
import { DEFAULT_USER_ID } from '../../../shared/config/constants';

export const logQuestActionApi = async (goalId: string, logId: string) => {
  await fetch('/api/logs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: logId, goalId, vibeScore: 8, notes: 'Auto-logged from dashboard' })
  });
};

export const updateQuestDifficultyApi = async (goalId: string, newDifficulty: number) => {
  await fetch(`/api/goals/${goalId}/difficulty`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ difficulty: newDifficulty })
  });
};

export const updateQuestApi = async (questId: string, questData: Partial<Goal>) => {
  await fetch(`/api/goals/${questId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: questData.title,
      description: questData.description,
      difficulty: questData.difficulty,
      rewardAlpha: questData.reward_alpha,
      category: questData.category
    })
  });
};

export const createQuestApi = async (questData: Partial<Goal>, id: string) => {
  await fetch('/api/goals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id,
      userId: DEFAULT_USER_ID,
      title: questData.title,
      description: questData.description,
      difficulty: questData.difficulty,
      rewardAlpha: questData.reward_alpha,
      category: questData.category
    })
  });
};

export const deleteQuestApi = async (questId: string) => {
  const response = await fetch(`/api/goals/${questId}`, { method: 'DELETE' });
  if (!response.ok) {
    throw new Error('Failed to delete node from server');
  }
};

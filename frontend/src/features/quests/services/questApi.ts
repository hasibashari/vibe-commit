import { getCurrentUser, getAuthHeaders } from '../../../shared/services/session';
import type { Goal } from '../../../shared/types/goal';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}



export const logQuestActionApi = async (goalId: string, logId: string) => {
  const user = getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  try {
    const res = await fetch('/api/logs', {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        id: logId,
        goalId: goalId,
        vibeScore: 8,
        notes: 'Auto-logged from dashboard'
      })
    });
    if (!res.ok) throw new ApiError("Gagal menyimpan log quest", res.status);
    return await res.json();
  } catch (err) {
    throw err;
  }
};

export const updateQuestDifficultyApi = async (goalId: string, newDifficulty: number) => {
  const user = getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  try {
    const res = await fetch(`/api/goals/${goalId}/difficulty`, {
      method: 'PATCH',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        difficulty: newDifficulty
      })
    });
    if (!res.ok) throw new ApiError("Gagal memperbarui tingkat kesulitan quest", res.status);
  } catch (err) {
    throw err;
  }
};

export const updateQuestApi = async (questId: string, questData: Partial<Goal>) => {
  const user = getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  try {
    const res = await fetch(`/api/goals/${questId}`, {
      method: 'PUT',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        title: questData.title,
        description: questData.description,
        difficulty: questData.difficulty,
        rewardAlpha: questData.reward_alpha,
        category: questData.category
      })
    });
    if (!res.ok) throw new ApiError("Gagal memperbarui quest", res.status);
  } catch (err) {
    throw err;
  }
};

export const createQuestApi = async (questData: Partial<Goal>, id: string) => {
  const user = getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  try {
    const res = await fetch('/api/goals', {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        id,
        userId: user.uid,
        title: questData.title,
        description: questData.description,
        difficulty: questData.difficulty,
        rewardAlpha: questData.reward_alpha,
        category: questData.category
      })
    });
    if (!res.ok) throw new ApiError("Gagal membuat quest", res.status);
  } catch (err) {
    throw err;
  }
};

export const deleteQuestApi = async (questId: string) => {
  const user = getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  try {
    const res = await fetch(`/api/goals/${questId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new ApiError("Gagal menghapus quest", res.status);
  } catch (err) {
    throw err;
  }
};

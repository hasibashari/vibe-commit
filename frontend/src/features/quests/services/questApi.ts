import { auth } from '../../../shared/services/firebase';
import type { Goal } from '../../../shared/types/goal';

function handleFirestoreError(error: unknown) {
  console.error('API Error:', error);
  throw error;
}

export const logQuestActionApi = async (goalId: string, logId: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  try {
    const res = await fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: logId,
        goalId: goalId,
        vibeScore: 8,
        notes: 'Auto-logged from dashboard'
      })
    });
    if (!res.ok) throw new Error("Gagal menyimpan log quest");
    return await res.json();
  } catch (err) {
    handleFirestoreError(err);
  }
};

export const updateQuestDifficultyApi = async (goalId: string, newDifficulty: number) => {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  try {
    const res = await fetch(`/api/goals/${goalId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        difficulty: newDifficulty
      })
    });
    if (!res.ok) throw new Error("Gagal memperbarui tingkat kesulitan quest");
  } catch (err) {
    handleFirestoreError(err);
  }
};

export const updateQuestApi = async (questId: string, questData: Partial<Goal>) => {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  try {
    const res = await fetch(`/api/goals/${questId}`, {
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
    if (!res.ok) throw new Error("Gagal memperbarui quest");
  } catch (err) {
    handleFirestoreError(err);
  }
};

export const createQuestApi = async (questData: Partial<Goal>, id: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  try {
    const res = await fetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
    if (!res.ok) throw new Error("Gagal membuat quest");
  } catch (err) {
    handleFirestoreError(err);
  }
};

export const deleteQuestApi = async (questId: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  try {
    const res = await fetch(`/api/goals/${questId}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error("Gagal menghapus quest");
  } catch (err) {
    handleFirestoreError(err);
  }
};

import { doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../../../shared/services/firebase';
import type { Goal } from '../../../shared/types/goal';

function handleFirestoreError(error: unknown) {
  console.error('Firestore Error:', error);
  throw error;
}

export const logQuestActionApi = async (goalId: string, logId: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  try {
    await setDoc(doc(db, 'quest_logs', logId), {
      goal_id: goalId,
      user_id: user.uid,
      timestamp: new Date().toISOString(),
      vibeScore: 8,
      notes: 'Auto-logged from dashboard'
    });
  } catch (err) {
    handleFirestoreError(err);
  }
};

export const updateQuestDifficultyApi = async (goalId: string, newDifficulty: number) => {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  try {
    await updateDoc(doc(db, 'goals', goalId), {
      difficulty: newDifficulty
    });
  } catch (err) {
    handleFirestoreError(err);
  }
};

export const updateQuestApi = async (questId: string, questData: Partial<Goal>) => {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  try {
    await updateDoc(doc(db, 'goals', questId), {
      title: questData.title,
      description: questData.description,
      difficulty: questData.difficulty,
      reward_alpha: questData.reward_alpha,
      category: questData.category
    });
  } catch (err) {
    handleFirestoreError(err);
  }
};

export const createQuestApi = async (questData: Partial<Goal>, id: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  try {
    await setDoc(doc(db, 'goals', id), {
      user_id: user.uid,
      title: questData.title,
      description: questData.description,
      difficulty: questData.difficulty,
      reward_alpha: questData.reward_alpha,
      category: questData.category,
      created_at: new Date().toISOString()
    });
  } catch (err) {
    handleFirestoreError(err);
  }
};

export const deleteQuestApi = async (questId: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  try {
    await deleteDoc(doc(db, 'goals', questId));
  } catch (err) {
    handleFirestoreError(err);
  }
};

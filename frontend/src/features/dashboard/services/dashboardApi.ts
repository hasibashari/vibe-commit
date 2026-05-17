import { getDoc, doc, setDoc, updateDoc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { db, auth } from '../../../shared/services/firebase';
import type { UserStats } from '../../../shared/types/user';
import type { Goal } from '../../../shared/types/goal';
import type { Log } from '../../../shared/types/log';

function handleFirestoreError(error: unknown) {
  console.error('Firestore Error:', error);
  throw error;
}

export const fetchDashboardData = async () => {
  const user = auth.currentUser;
  if (!user) {
    return { goalsWithCounts: [], dumpsData: [], userData: null };
  }
  const userId = user.uid;

  try {
    const goalsSnap = await getDocs(query(collection(db, 'goals'), where('user_id', '==', userId)));
    const goalsData = goalsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    const logsSnap = await getDocs(query(collection(db, 'quest_logs'), where('user_id', '==', userId)));
    const allLogsData = logsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    const dumpsSnap = await getDocs(query(collection(db, 'brain_dumps'), where('user_id', '==', userId)));
    const dumpsData = dumpsSnap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const userSnap = await getDoc(doc(db, 'users', userId));
    const userData = userSnap.exists() ? userSnap.data() : null;

    const goalsWithCounts = goalsData.map((g: any) => {
      const logs = allLogsData.filter((log: any) => log.goal_id === g.id);
      return { ...g, repetition_count: logs.length, logs };
    });

    return { 
      goalsWithCounts, 
      rawGoalsData: goalsData,
      dumpsData, 
      userData 
    };
  } catch (error) {
    handleFirestoreError(error);
    return { goalsWithCounts: [], rawGoalsData: [], dumpsData: [], userData: null };
  }
};

export const updateProfileData = async (
  userIdStr?: string,
  data?: Partial<UserStats>
) => {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  const userId = user.uid;

  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      const newUserData = {
        name: user.displayName || 'Novice',
        hp: 100, mana: 100, level: 1, exp: 0,
        ...data
      };
      await setDoc(userRef, newUserData);
      return newUserData;
    } else {
      if (data) {
        await updateDoc(userRef, data);
      }
      return { ...userSnap.data(), ...data };
    }
  } catch (error) {
    handleFirestoreError(error);
    throw error;
  }
};

export const resetProfileData = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  const userId = user.uid;

  try {
    const batch = writeBatch(db);
    const goalsSnap = await getDocs(query(collection(db, 'goals'), where('user_id', '==', userId)));
    goalsSnap.forEach(d => batch.delete(d.ref));

    const logsSnap = await getDocs(query(collection(db, 'quest_logs'), where('user_id', '==', userId)));
    logsSnap.forEach(d => batch.delete(d.ref));

    const dumpsSnap = await getDocs(query(collection(db, 'brain_dumps'), where('user_id', '==', userId)));
    dumpsSnap.forEach(d => batch.delete(d.ref));

    batch.update(doc(db, 'users', userId), {
      hp: 100, mana: 100, level: 1, exp: 0
    });

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error);
    throw error;
  }
};

export const updateSandboxData = async (
  userIdStr?: string,
  payload?: { hp?: number | null; mana?: number | null; level?: number | null; coins_delta?: number | null }
) => {
  const user = auth.currentUser;
  if (!user || !payload) throw new Error("Not authenticated");
  const userId = user.uid;

  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const data = userSnap.data();
      const updates: any = {};
      if (payload.hp !== undefined && payload.hp !== null) updates.hp = payload.hp;
      if (payload.mana !== undefined && payload.mana !== null) updates.mana = payload.mana;
      if (payload.level !== undefined && payload.level !== null) updates.level = payload.level;
      if (payload.coins_delta !== undefined && payload.coins_delta !== null) {
        updates.spent_coins = (data.spent_coins || 0) - payload.coins_delta;
      }
      await updateDoc(userRef, updates);
      return { ...data, ...updates };
    }
  } catch (error) {
    handleFirestoreError(error);
    throw error;
  }
};

export const buyItemAPI = async (
  userIdStr: string,
  itemId: string
) => {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  const userId = user.uid;
  
  // Notice: Buy Item still calls backend because logic is complex and we don't 
  // want to duplicate it. Or we can reimplement here. But wait, I'll still call
  // the Express backend. But it needs the userId exactly.
  
  const res = await fetch(`/api/user/${userId}/buy-item`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ itemId }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Pembelian gagal' }));
    throw new Error(errorData.error);
  }
  return res.json();
};

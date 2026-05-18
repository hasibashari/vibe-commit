import { getDoc, doc, setDoc, updateDoc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { deleteUser, reauthenticateWithPopup } from 'firebase/auth';
import { db, auth, googleProvider } from '../../../shared/services/firebase';
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
    const goalsData = goalsSnap.docs.map(d => ({ id: d.id, ...d.data() }) as unknown as Goal);

    const logsSnap = await getDocs(query(collection(db, 'quest_logs'), where('user_id', '==', userId)));
    const allLogsData = logsSnap.docs.map(d => ({ id: d.id, ...d.data() }) as unknown as Log);

    const dumpsSnap = await getDocs(query(collection(db, 'brain_dumps'), where('user_id', '==', userId)));
    const dumpsData = dumpsSnap.docs.map(d => ({ id: d.id, ...d.data() }) as { id: string, created_at: string }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const userSnap = await getDoc(doc(db, 'users', userId));
    const userData = userSnap.exists() ? userSnap.data() as UserStats : null;

    const goalsWithCounts = goalsData.map((g: Goal) => {
      const logs = allLogsData.filter((log: Log) => log.goal_id === g.id);
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
        await setDoc(userRef, data, { merge: true });
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

    batch.set(doc(db, 'users', userId), {
      hp: 100, mana: 100, level: 1, exp: 0
    }, { merge: true });

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error);
    throw error;
  }
};

export const deleteAccountAPI = async () => {
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

    batch.delete(doc(db, 'users', userId));

    await batch.commit();

    await deleteUser(user);
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'auth/requires-recent-login') {
      try {
        await reauthenticateWithPopup(user, googleProvider);
        await deleteUser(user);
      } catch (reauthError: unknown) {
        throw new Error("Tolong login ulang (re-authenticate) secara manual sebelum menghapus akun demi keamanan, atau pastikan popup tidak diblokir.");
      }
    } else {
      handleFirestoreError(error);
      throw error;
    }
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
      const updates: Partial<UserStats> = {};
      if (payload.hp !== undefined && payload.hp !== null) updates.hp = payload.hp;
      if (payload.mana !== undefined && payload.mana !== null) updates.mana = payload.mana;
      if (payload.level !== undefined && payload.level !== null) updates.level = payload.level;
      if (payload.coins_delta !== undefined && payload.coins_delta !== null) {
        updates.spent_coins = (data.spent_coins || 0) - payload.coins_delta;
      }
      await setDoc(userRef, updates, { merge: true });
      return { ...data, ...updates };
    }
  } catch (error) {
    handleFirestoreError(error);
    throw error;
  }
};

export const importDataAPI = async (data: { user?: Partial<UserStats> & { id?: string }, goals?: Array<any> }) => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Not authenticated");
  const userId = currentUser.uid;

  try {
    const batch = writeBatch(db);
    
    // Delete existing goals & logs to replace with imported data
    const existingGoalsSnap = await getDocs(query(collection(db, 'goals'), where('user_id', '==', userId)));
    existingGoalsSnap.forEach(d => batch.delete(d.ref));
    
    const existingLogsSnap = await getDocs(query(collection(db, 'quest_logs'), where('user_id', '==', userId)));
    existingLogsSnap.forEach(d => batch.delete(d.ref));

    if (data.user) {
      const todayStr = new Date().toISOString().split('T')[0];
      const userRef = doc(db, 'users', userId);
      const userUpdate: Partial<UserStats> & { last_penalty_date?: string, id?: string } = { ...data.user, last_penalty_date: todayStr };
      // Remove db specific ID if any
      delete userUpdate.id; 
      batch.set(userRef, userUpdate, { merge: true });
    }

    if (data.goals && Array.isArray(data.goals)) {
      for (const goal of data.goals) {
        const goalRef = doc(db, 'goals', goal.id || crypto.randomUUID());
        batch.set(goalRef, {
          user_id: userId,
          title: goal.title,
          description: goal.description ?? null,
          category: goal.category ?? null,
          difficulty: goal.difficulty ?? 1.0,
          reward_alpha: goal.reward_alpha ?? 0.5,
          created_at: goal.createdAt || new Date().toISOString()
        });

        if (goal.logs && Array.isArray(goal.logs)) {
          for (const log of goal.logs) {
            const logId = log.id || crypto.randomUUID();
            const logRef = doc(db, 'quest_logs', logId);
            batch.set(logRef, {
              goal_id: goalRef.id,
              user_id: userId,
              timestamp: log.timestamp || log.completedAt || new Date().toISOString(),
              vibeScore: log.vibeScore ?? log.vibe_score ?? 8,
              notes: log.notes ?? 'Imported log'
            });
          }
        }
      }
    }

    await batch.commit();
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
  
  const ITEM_PRICES: Record<string, number> = {
    'hp_elixir': 150,
    'mana_tonic': 200,
    'streak_shield': 500,
    'aesthetic_color_cyan': 300,
    'aesthetic_color_rose': 300,
    'aesthetic_theme_matrix': 800,
    'aesthetic_theme_neon': 800,
    'aesthetic_title_vanguard': 1000,
    'aesthetic_title_legendary': 1500,
  };

  if (!(itemId in ITEM_PRICES)) {
    throw new Error('Invalid item');
  }
  const cost = ITEM_PRICES[itemId];

  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) throw new Error('User not found');
    const userData = userSnap.data();

    // Fetch logs and goals to accurately calculate total earned coins (coins = exp)
    const logsSnap = await getDocs(query(collection(db, 'quest_logs'), where('user_id', '==', userId)));
    const allLogs = logsSnap.docs.map(d => d.data());
    const goalsSnap = await getDocs(query(collection(db, 'goals'), where('user_id', '==', userId)));
    const goalsDict = goalsSnap.docs.reduce((acc, d) => ({ ...acc, [d.id]: d.data() }), {} as Record<string, any>);
    
    let totalEarnedFromLogs = 0;
    allLogs.forEach(log => {
      const goal = goalsDict[log.goal_id];
      if (goal) {
        totalEarnedFromLogs += Math.floor((goal.difficulty || 1.0) * 10 * (goal.reward_alpha || 0.5));
      } else {
        totalEarnedFromLogs += 10;
      }
    });
    const initialExp = userData.exp || 0;
    
    const totalEarned = initialExp + totalEarnedFromLogs;
    const availableCoins = totalEarned - (userData.spent_coins || 0);

    if (availableCoins < cost) {
      throw new Error('Insufficient coins');
    }

    let updates: Partial<UserStats> & { shield_until?: string } = { spent_coins: (userData.spent_coins || 0) + cost };
    let newUnlockedItems = [];
    try {
      newUnlockedItems = JSON.parse(userData.unlocked_items || '[]');
    } catch {
      newUnlockedItems = [];
    }

    if (itemId === 'hp_elixir') {
      updates.hp = (userData.hp || 0) + 30;
    } else if (itemId === 'mana_tonic') {
      updates.mana = (userData.mana || 0) + 20;
    } else if (itemId === 'streak_shield') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(23, 59, 59, 999);
      updates.shield_until = tomorrow.toISOString();
    } else if (itemId.startsWith('aesthetic_')) {
      if (newUnlockedItems.includes(itemId)) {
        throw new Error('Item already owned');
      }
      newUnlockedItems.push(itemId);
      updates.unlocked_items = JSON.stringify(newUnlockedItems);
    }

    await setDoc(userRef, updates, { merge: true });
    return { ...userData, ...updates };
  } catch (error) {
    handleFirestoreError(error);
    throw error;
  }
};

import { getCurrentUser, getAuthHeaders } from '../../../shared/services/session';
import type { UserStats } from '../../../shared/types/user';

function handleApiError(error: unknown) {
  console.error('API Error:', error);
  throw error;
}

export const fetchDashboardData = async () => {
  const user = getCurrentUser();
  if (!user) {
    return { goalsWithCounts: [], rawGoalsData: [], dumpsData: [], userData: null };
  }
  const userId = user.uid;

  try {
    // Fetch all 4 independent resources in parallel to eliminate network waterfall
    const [goalsRes, logsRes, dumpsRes, userRes] = await Promise.all([
      fetch(`/api/goals/${userId}`, { headers: getAuthHeaders() }),
      fetch(`/api/logs/user/${userId}`, { headers: getAuthHeaders() }),
      fetch(`/api/brain-dump/${userId}`, { headers: getAuthHeaders() }),
      fetch(`/api/user/${userId}`, { headers: getAuthHeaders() })
    ]);

    if (!goalsRes.ok) throw new Error("Gagal memuat data Quest");
    const rawGoalsData = await goalsRes.json();

    if (!logsRes.ok) throw new Error("Gagal memuat data Quest Log");
    const allLogsDataRaw = await logsRes.json();
    
    // Map Snake Case vibe_score to Camel Case vibeScore expected by frontend types
    const allLogsData = allLogsDataRaw.map((log: any) => ({
      ...log,
      vibeScore: log.vibe_score
    }));

    const dumpsData = dumpsRes.ok ? await dumpsRes.json() : [];
    const userData = userRes.ok ? await userRes.json() : null;

    const goalsWithCounts = rawGoalsData.map((g: any) => {
      const logs = allLogsData.filter((log: any) => log.goal_id === g.id);
      return { 
        ...g, 
        repetition_count: logs.length, 
        logs 
      };
    });

    return { 
      goalsWithCounts, 
      rawGoalsData,
      dumpsData, 
      userData 
    };
  } catch (error) {
    handleApiError(error);
    return { goalsWithCounts: [], rawGoalsData: [], dumpsData: [], userData: null };
  }
};

export const updateProfileData = async (
  userIdStr?: string,
  data?: Partial<UserStats>
 ) => {
  const user = getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  const userId = user.uid;

  try {
    const res = await fetch(`/api/user/${userId}`, {
      method: 'PUT',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Gagal memperbarui profil di server");
    return await res.json();
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const resetProfileData = async () => {
  const user = getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  const userId = user.uid;

  try {
    const res = await fetch(`/api/user/${userId}/reset`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error("Gagal mereset profil di server");
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const updateSandboxData = async (
  userIdStr?: string,
  payload?: { hp?: number | null; mana?: number | null; level?: number | null; coins_delta?: number | null }
) => {
  const user = getCurrentUser();
  if (!user || !payload) throw new Error("Not authenticated");
  const userId = user.uid;

  try {
    const res = await fetch(`/api/user/${userId}/sandbox`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Gagal memperbarui sandbox");
    return await res.json();
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const buyItemAPI = async (
  userIdStr: string,
  itemId: string
) => {
  const user = getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  const userId = user.uid;

  const res = await fetch(`/api/user/${userId}/buy-item`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ itemId }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Pembelian gagal' }));
    throw new Error(errorData.error);
  }
  return res.json();
};


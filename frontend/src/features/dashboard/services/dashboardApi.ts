import { DEFAULT_USER_ID } from '../../../shared/config/constants';
import type { UserStats } from '../../../shared/types/user';

export const fetchDashboardData = async (userId: string = DEFAULT_USER_ID) => {
  const gRes = await fetch(`/api/goals/${userId}`);
  const goalsData = await gRes.json();

  const lRes = await fetch(`/api/logs/user/${userId}`);
  const allLogsData = await lRes.json();

  const goalsWithCounts = goalsData.map((g: any) => {
    const logs = allLogsData.filter((log: any) => log.goal_id === g.id);
    return { ...g, repetition_count: logs.length, logs };
  });

  const dumpsRes = await fetch(`/api/brain-dump/${userId}`);
  const dumpsData = await dumpsRes.json();

  const userRes = await fetch(`/api/user/${userId}`);
  const userData = await userRes.json();

  return { 
    goalsWithCounts: goalsWithCounts, 
    rawGoalsData: goalsData,
    dumpsData, 
    userData 
  };
};

export const updateProfileData = async (
  userId: string = DEFAULT_USER_ID,
  data: { name: string; title: string; avatar_color: string }
) => {
  const res = await fetch(`/api/user/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const resetProfileData = async (userId: string = DEFAULT_USER_ID) => {
  await fetch(`/api/user/${userId}/reset`, { method: 'POST' });
};

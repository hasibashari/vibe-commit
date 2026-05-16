import { DEFAULT_USER_ID } from '../../../shared/config/constants';
import type { UserStats } from '../../../shared/types/user';
import type { Goal } from '../../../shared/types/goal';
import type { Log } from '../../../shared/types/log';

export const fetchDashboardData = async (userId: string = DEFAULT_USER_ID) => {
  const [gRes, lRes, dumpsRes, userRes] = await Promise.all([
    fetch(`/api/goals/${userId}`),
    fetch(`/api/logs/user/${userId}`),
    fetch(`/api/brain-dump/${userId}`),
    fetch(`/api/user/${userId}`)
  ]);

  const [goalsData, allLogsData, dumpsData, userData] = await Promise.all([
    gRes.json(),
    lRes.json(),
    dumpsRes.json(),
    userRes.json()
  ]);

  const goalsWithCounts = goalsData.map((g: Goal) => {
    const logs = allLogsData.filter((log: Log) => log.goal_id === g.id);
    return { ...g, repetition_count: logs.length, logs };
  });

  return { 
    goalsWithCounts: goalsWithCounts, 
    rawGoalsData: goalsData,
    dumpsData, 
    userData 
  };
};

export const updateProfileData = async (
  userId: string = DEFAULT_USER_ID,
  data: Partial<UserStats>
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

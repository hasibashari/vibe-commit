export interface UserStats {
  id?: string;
  name?: string;
  title?: string;
  avatar_color?: string;
  hp: number;
  mana: number;
  level: number;
  exp: number;
}

export const fetchDashboardData = async (userId: string = 'user123') => {
  const gRes = await fetch(`/api/goals/${userId}`);
  const goalsData = await gRes.json();

  const goalsWithCounts = await Promise.all(
    goalsData.map(async (g: any) => {
      const lRes = await fetch(`/api/logs/${g.id}`);
      const logs = await lRes.json();
      return { ...g, repetition_count: logs.length, logs };
    })
  );

  const dumpsRes = await fetch(`/api/brain-dump/${userId}`);
  const dumpsData = await dumpsRes.json();

  const userRes = await fetch(`/api/user/${userId}`);
  const userData = await userRes.json();

  return { goalsWithCounts, dumpsData, userData };
};

export const updateProfileData = async (
  userId: string = 'user123',
  data: { name: string; title: string; avatar_color: string }
) => {
  const res = await fetch(`/api/user/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const resetProfileData = async (userId: string = 'user123') => {
  await fetch(`/api/user/${userId}/reset`, { method: 'POST' });
};

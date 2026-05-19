import { getCurrentUser, getAuthHeaders } from '../../../shared/services/session';

interface BrainDumpAnalysisResult {
  anxietyLevel: string;
  anxietyScore: number;
  analysisSummary: string;
  quests: BrainDumpQuest[];
}

interface BrainDumpQuest {
  title: string;
  description: string;
  difficulty: number;
  rewardAlpha: number;
  category: string;
}

function handleApiError(error: unknown) {
  console.error('API Error:', error);
  throw error;
}

export const saveBrainDumpApi = async (draftContent: string, analysisResult: BrainDumpAnalysisResult) => {
  const user = getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  try {
    const id = crypto.randomUUID();
    const res = await fetch('/api/brain-dump', {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        id,
        userId: user.uid,
        rawContent: draftContent,
        analysis: {
          anxietyLevel: analysisResult.anxietyLevel,
          anxietyScore: analysisResult.anxietyScore,
          summary: analysisResult.analysisSummary
        }
      })
    });
    if (!res.ok) throw new Error("Gagal menyimpan brain dump");
  } catch (err) {
    handleApiError(err);
  }
};

export const saveQuestsFromBrainDumpApi = async (quests: BrainDumpQuest[]) => {
  const user = getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  try {
    await Promise.all(quests.map(res => 
      fetch('/api/goals', {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          id: crypto.randomUUID(),
          userId: user.uid,
          title: res.title,
          description: res.description,
          difficulty: res.difficulty,
          rewardAlpha: res.rewardAlpha,
          category: res.category
        })
      })
    ));
  } catch (err) {
    handleApiError(err);
  }
};


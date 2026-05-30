import { getCurrentUser, getAuthHeaders } from '../../../shared/services/session';
import { generateId } from '../../../shared/utils/uuid';

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


export const saveBrainDumpApi = async (draftContent: string, analysisResult: BrainDumpAnalysisResult) => {
  const user = getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  try {
    const id = generateId();
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
          analysisSummary: analysisResult.analysisSummary
        }
      })
    });
    if (!res.ok) throw new Error("Gagal menyimpan brain dump");
  } catch (err) {
    throw err;
  }
};

export const saveQuestsFromBrainDumpApi = async (quests: BrainDumpQuest[]) => {
  const user = getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  try {
    await Promise.all(quests.map(async (res) => {
      const categoryRaw = res.category || 'Side Quest';
      const categoryNorm = categoryRaw.toLowerCase().includes('main') ? 'Main Quest'
        : categoryRaw.toLowerCase().includes('daily') ? 'Daily Quest'
          : 'Side Quest';

      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          id: generateId(),
          userId: user.uid,
          title: res.title || 'Untitled Quest',
          description: res.description || '',
          difficulty: typeof res.difficulty === 'number' ? res.difficulty : 1.0,
          rewardAlpha: typeof res.rewardAlpha === 'number' ? res.rewardAlpha : 0.5,
          category: categoryNorm
        })
      });

      if (!response.ok) {
        throw new Error(`Gagal menyimpan quest: ${response.status}`);
      }
    }));
  } catch (err) {
    throw err;
  }
};


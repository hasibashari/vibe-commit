import { analyzeBrainDump } from '../../../shared/services/aiService';

export const analyzeBrainDumpApi = async (draftContent: string) => {
  const result = await analyzeBrainDump(draftContent);
  return result;
};

export const saveBrainDumpApi = async (draftContent: string, analysisResult: any) => {
  await fetch('/api/brain-dump', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: crypto.randomUUID(),
      userId: 'user123',
      rawContent: draftContent,
      analysis: {
        anxietyLevel: analysisResult.anxietyLevel,
        anxietyScore: analysisResult.anxietyScore,
        summary: analysisResult.analysisSummary
      }
    })
  });
};

export const saveQuestsFromBrainDumpApi = async (quests: any[]) => {
  for (const res of quests) {
    await fetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: crypto.randomUUID(),
        userId: 'user123',
        title: res.title,
        description: res.description,
        difficulty: res.difficulty,
        rewardAlpha: res.rewardAlpha,
        category: res.category,
        isExperimental: false
      })
    });
  }
};

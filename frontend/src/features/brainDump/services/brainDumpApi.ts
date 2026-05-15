import { DEFAULT_USER_ID } from '../../../shared/config/constants';

export const saveBrainDumpApi = async (draftContent: string, analysisResult: any) => {
  await fetch('/api/brain-dump', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: crypto.randomUUID(),
      userId: DEFAULT_USER_ID,
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
        userId: DEFAULT_USER_ID,
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

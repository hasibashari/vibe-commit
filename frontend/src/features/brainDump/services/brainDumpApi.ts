import { DEFAULT_USER_ID } from '../../../shared/config/constants';
import type { Goal } from '../../../shared/types/goal';

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

export const saveQuestsFromBrainDumpApi = async (quests: BrainDumpQuest[]) => {
  await Promise.all(quests.map(res => 
    fetch('/api/goals', {
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
    })
  ));
};

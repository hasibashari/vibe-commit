import { auth } from '../../../shared/services/firebase';

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

function handleFirestoreError(error: unknown) {
  console.error('API Error:', error);
  throw error;
}

export const saveBrainDumpApi = async (draftContent: string, analysisResult: BrainDumpAnalysisResult) => {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  try {
    const id = crypto.randomUUID();
    const res = await fetch('/api/brain-dump', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        user_id: user.uid,
        raw_content: draftContent,
        analysis: JSON.stringify({
          anxietyLevel: analysisResult.anxietyLevel,
          anxietyScore: analysisResult.anxietyScore,
          summary: analysisResult.analysisSummary
        })
      })
    });
    if (!res.ok) throw new Error("Gagal menyimpan brain dump");
  } catch (err) {
    handleFirestoreError(err);
  }
};

export const saveQuestsFromBrainDumpApi = async (quests: BrainDumpQuest[]) => {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  try {
    await Promise.all(quests.map(res => 
      fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: crypto.randomUUID(),
          user_id: user.uid,
          title: res.title,
          description: res.description,
          difficulty: res.difficulty,
          reward_alpha: String(res.rewardAlpha),
          category: res.category
        })
      })
    ));
  } catch (err) {
    handleFirestoreError(err);
  }
};

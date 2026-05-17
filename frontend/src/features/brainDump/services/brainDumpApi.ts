import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../../../shared/services/firebase';

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
  console.error('Firestore Error:', error);
  throw error;
}

export const saveBrainDumpApi = async (draftContent: string, analysisResult: BrainDumpAnalysisResult) => {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  try {
    const id = crypto.randomUUID();
    await setDoc(doc(db, 'brain_dumps', id), {
      user_id: user.uid,
      raw_content: draftContent,
      created_at: new Date().toISOString(),
      analysis: JSON.stringify({
        anxietyLevel: analysisResult.anxietyLevel,
        anxietyScore: analysisResult.anxietyScore,
        summary: analysisResult.analysisSummary
      })
    });
  } catch (err) {
    handleFirestoreError(err);
  }
};

export const saveQuestsFromBrainDumpApi = async (quests: BrainDumpQuest[]) => {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  try {
    await Promise.all(quests.map(res => 
      setDoc(doc(db, 'goals', crypto.randomUUID()), {
        user_id: user.uid,
        title: res.title,
        description: res.description,
        difficulty: res.difficulty,
        reward_alpha: res.rewardAlpha,
        category: res.category,
        created_at: new Date().toISOString()
      })
    ));
  } catch (err) {
    handleFirestoreError(err);
  }
};

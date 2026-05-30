import { getAuthHeaders } from './session';

export interface AnalyzedQuest {
  title: string;
  description: string;
  difficulty: number;
  rewardAlpha: number;
  category: string;
}

export interface BrainDumpAnalysis {
  anxietyLevel: string;
  anxietyScore: number;
  analysisSummary: string;
  quests: AnalyzedQuest[];
}

export async function analyzeBrainDump(content: string): Promise<BrainDumpAnalysis> {
  const res = await fetch('/api/ai/analyze-brain-dump', {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ content })
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to analyze brain dump');
  }

  return res.json();
}

interface AIContext {
  userName?: string;
  level?: number;
  hp?: number;
  mana?: number;
  activeQuests?: string;
}

export async function chatWithAI(history: { role: 'user' | 'model', content: string }[], context: AIContext): Promise<string> {
  try {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ history, context })
    });

    if (!res.ok) {
      throw new Error('Chat failed');
    }

    const data = await res.json();
    return data.response;
  } catch (err) {
    console.error('Chat error:', err);
    return "Maaf, aku lagi nge-lag nih. Boleh ulangi?";
  }
}


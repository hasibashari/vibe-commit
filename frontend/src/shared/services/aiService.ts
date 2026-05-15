import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `You are the Gemini AI Integration Module. Your task is to process a user's "Raw Input Analysis" or "Brain Dump," which contains anxiety, overwhelm, and piled-up responsibilities.
    
    Instructions (Step-by-Step):
    1. Analyze the text to identify the user's anxiety level.
    2. Perform Micro-task Fragmentation by breaking large problems into smaller structured tasks (Quests).
    3. Assign Difficulty (D) (1-10) and Reward (alpha) (0.1-1.0) weights for each structured task.
    4. Provide the correct category for each task: MUST BE one of "Main Quest", "Daily Quest", or "Side Quest".
    5. The output must be in JSON format, ready to be inserted into the QuestLog dashboard.

    Content: ${content}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          anxietyLevel: { type: Type.STRING, description: "e.g., Low, Moderate, High, Severe" },
          anxietyScore: { type: Type.NUMBER, description: "1-10 scale" },
          analysisSummary: { type: Type.STRING, description: "Brief empathetic summary of the user's state and how the fragmentation helps." },
          quests: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                difficulty: { type: Type.NUMBER },
                rewardAlpha: { type: Type.NUMBER },
                category: { type: Type.STRING },
              },
              required: ["title", "description", "difficulty", "rewardAlpha", "category"],
            },
          }
        },
        required: ["anxietyLevel", "anxietyScore", "analysisSummary", "quests"],
      },
    },
  });

  const rawText = response.text || '{"anxietyLevel":"Unknown","anxietyScore":0,"analysisSummary":"","quests":[]}';
  const cleanText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(cleanText);
}

export async function chatWithAI(history: { role: 'user' | 'model', content: string }[], context: any): Promise<string> {
  const prompt = `System: You are an AI Companion in a gamified productivity app.
The user's current status:
- Name: ${context.userName || "User"}
- Level: ${context.level}
- HP (Stamina/Energy): ${context.hp}/100
- Mana (Focus/Mental Energy): ${context.mana}/100
- Active Quests: ${context.activeQuests || 'None'}

Act as an empathetic, encouraging, and slightly game-flavored assistant. 
Keep responses relatively short, natural, and engaging (1-3 sentences). 
Use friendly Indonesian slang slightly (gue/lo or casual bahasa like 'kamu', 'banget', 'yuk' depending on the tone, keep it warm and respectful).
Remind them to rest if HP/Mana is low, and motivate them to tackle their active quests.

Conversation History:
${history.map(msg => (msg.role === 'user' ? 'User' : 'AI') + ': ' + msg.content).join('\n')}
AI:`;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
  });

  return response.text || "Maaf, aku lagi nge-lag nih. Boleh ulangi?";
}

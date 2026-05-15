import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('GEMINI_API_KEY is not set. AI features might fail.');
}

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

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
  if (!ai) {
    throw new Error('Konfigurasi API AI tidak ditemukan. Tolong masukkan GEMINI_API_KEY kamu.');
  }

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Kamu adalah Modul Integrasi AI Gemini. Tugas kamu adalah memproses "Raw Input Analysis" atau "Brain Dump" dari pengguna yang berisi kecemasan, rasa kewalahan, dan tumpukan tanggung jawab.
    
    Instruksi (Langkah-demi-Langkah):
    1. Analisis teks untuk mengidentifikasi tingkat kecemasan pengguna.
    2. Lakukan Fragmentasi Tugas Mikro dengan memecah masalah besar menjadi tugas-tugas terstruktur yang lebih kecil (Quest).
    3. Tetapkan bobot Kesulitan (Difficulty) (D) (1-10) dan Hadiah (Reward) (alpha) (0.1-1.0) untuk setiap tugas terstruktur.
    4. Berikan kategori yang tepat untuk setiap tugas: HARUS salah satu dari "Main Quest", "Daily Quest", atau "Side Quest".
    5. Semua teks ringkasan, judul tugas, dan deskripsi TUGAS HARUS MENGGUNAKAN BAHASA INDONESIA.
    6. Output harus dalam format JSON, siap untuk dimasukkan ke dasbor QuestLog.

    Konten: ${content}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          anxietyLevel: { type: Type.STRING, description: "contoh: Rendah, Sedang, Tinggi, Parah" },
          anxietyScore: { type: Type.NUMBER, description: "Skala 1-10" },
          analysisSummary: { type: Type.STRING, description: "Ringkasan empatik singkat tentang kondisi pengguna dan bagaimana fragmentasi membantu." },
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

  const rawText = response.text || '{"anxietyLevel":"Tidak diketahui","anxietyScore":0,"analysisSummary":"","quests":[]}';
  const cleanText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(cleanText);
}

export async function chatWithAI(history: { role: 'user' | 'model', content: string }[], context: any): Promise<string> {
  if (!ai) {
    return "Maaf, API Key belum di-set. Coba configure environment variable dulu ya!";
  }

  const prompt = `System: Kamu adalah Companion AI (teman virtual) di aplikasi produktivitas berbasis gamifikasi.
Status pengguna saat ini:
- Nama: ${context.userName || "User"}
- Level: ${context.level}
- HP (Stamina/Energi): ${context.hp}/100
- Mana (Fokus/Energi Mental): ${context.mana}/100
- Quest Aktif: ${context.activeQuests || 'Tidak ada'}

Berperanlah sebagai asisten yang empatik, memberikan semangat, dan memiliki nuansa game (rpg).
Jawablah dalam bahasa Indonesia dengan gaya kasual yang ramah (boleh pakai 'kamu', 'aku', bahasanya santai tapi asyik).
Pastikan balasan tetap relatif singkat, natural, dan interaktif (1-3 kalimat).
Ingatkan pengguna untuk istirahat jika HP/Mana sedang rendah, dan berikan motivasi untuk menyelesaikan Quest Aktif mereka.

Riwayat Percakapan:
${history.map(msg => (msg.role === 'user' ? 'User' : 'AI') + ': ' + msg.content).join('\n')}
AI:`;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
  });

  return response.text || "Maaf, aku lagi nge-lag nih. Boleh ulangi?";
}

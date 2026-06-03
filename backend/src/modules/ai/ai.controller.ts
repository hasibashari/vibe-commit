import { Request, Response, NextFunction } from 'express';
import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import * as QuestService from '../quest/quest.service.js';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const BASE_SYSTEM_INSTRUCTION = `Anda adalah seorang ahli Game Master Edukasi untuk LMS bertema RPG. Tugas utama Anda adalah merancang quest berdasarkan Ilmu Kognitif dan Psikologi Perilaku.

SISTEM PENILAIAN & FORMAT QUEST:
1. TITLE: Gunakan kata kerja aksi yang jelas, tegas, dan berorientasi tindakan dalam Bahasa Indonesia. DILARANG menggunakan metafora RPG yang berlebihan/kabur (Contoh bagus: "Selesaikan Modul React Router", BUKAN "Mengarungi Badai Router").
2. DESCRIPTION: Instruksi wajib *to the point* dan memenuhi kaidah SMART (Specific, Measurable, Achievable, Relevant). Definisikan kriteria selesai (Definition of Done) dengan sangat eksplisit.
3. DIFFICULTY (Float, 1.0 - 5.0): Kalibrasikan secara ketat dengan Taksonomi Bloom:
   - 1.0 - 2.0: Mengingat / Memahami (Remembering / Understanding)
   - 3.0 - 4.0: Menerapkan / Menganalisis (Applying / Analyzing)
   - 4.5 - 5.0: Mengevaluasi / Membuat sistem kompleks (Evaluating / Creating)
4. REWARD ALPHA (Float, 0.5 - 2.0): Gunakan Equity Theory. Kesulitan tinggi WAJIB menghasilkan reward tinggi. Rumus mental: Difficulty tinggi = RewardAlpha mendekati 2.0.
5. CATEGORY: Wajib memilih salah satu dari: 'Main Quest', 'Daily Quest', atau 'Side Quest'.
6. TYPE: Wajib memilih 'daily' (pembentukan kebiasaan/rutinitas) atau 'one-off' (proyek sekali jalan).

ATURAN OUTPUT:
Otoritas Anda hanya terbatas pada memproduksi objek JSON valid. Jangan berikan teks pembuka atau penutup di luar JSON. Gunakan tipe data yang tepat (jangan bungkus Number dengan tanda kutip).`;

function buildTimeContext(clientHour?: number) {
  const hour = clientHour !== undefined ? clientHour : new Date().getHours();
  let timePhase = "";
  let timeRules = "";

  if (hour >= 5 && hour < 12) {
    timePhase = "Pagi Hari (05:00 - 12:00) - Fase PEAK (Puncak Energi)";
    timeRules = "Waktu terbaik untuk analisis, logika kompleks, Deep Work, dan pemecahan masalah berat. Berikan quest teknis atau proyek utama yang butuh konsentrasi tinggi.";
  } else if (hour >= 12 && hour < 17) {
    timePhase = "Siang/Sore Hari (12:00 - 17:00) - Fase TROUGH (Penurunan Energi)";
    timeRules = "Waktu terbaik untuk Shallow Work, administratif, merapikan lingkungan, jalan kaki singkat, atau wellness. DILARANG KERAS memberikan tugas sistem yang kompleks atau berat kecuali pengguna secara eksplisit memintanya.";
  } else {
    timePhase = "Malam Hari (17:00 - 05:00) - Fase RECOVERY (Pemulihan & Kreativitas)";
    timeRules = "Waktu terbaik untuk kreativitas, brainstorming, refleksi, merencanakan hari esok, atau membaca. Berikan quest eksploratif, Side Quest santai, atau persiapan ringan.";
  }

  return { hour, timePhase, timeRules };
}

async function buildUserContext(userId: string, prompt: string, clientHour?: number): Promise<string> {
  const activeGoals = await QuestService.getGoalsForUser(userId);
  const dailyCount = activeGoals.filter(g => g.category === 'Daily Quest').length;
  const mainCount = activeGoals.filter(g => g.category === 'Main Quest').length;
  const sideCount = activeGoals.filter(g => g.category === 'Side Quest').length;

  const { hour, timePhase, timeRules } = buildTimeContext(clientHour);

  const contextKeywords = ['sesuai', 'berkaitan', 'quest yang ada', 'pekerjaan saya', 'tugas saya', 'proyek saya', 'lanjutkan', 'hubungkan'];
  const userWantsContext = contextKeywords.some(keyword => prompt.toLowerCase().includes(keyword));

  let goalTitles = "";
  let alignmentRule = "";

  if (hour >= 5 && hour < 12 && userWantsContext) {
    goalTitles = activeGoals.length > 0
      ? activeGoals.map(g => `- [${g.category}] ${g.title}`).join('\n')
      : '- Belum ada quest aktif.';
    alignmentRule = `1. WAJIB KORELASI: Pengguna ingin menghubungkan tugas baru dengan pekerjaannya saat ini. Buat quest baru yang melengkapi atau menjadi langkah logis selanjutnya dari "Daftar Quest aktif saat ini". Tetap sesuaikan beban kerja dengan fase PEAK sirkadian.`;
  } else if (hour >= 5 && hour < 12 && !userWantsContext) {
    goalTitles = "- [DAFTAR QUEST DISEMBUNYIKAN UNTUK MENCEGAH OVER-ANCHORING]";
    alignmentRule = `2. ISOLASI MANDIRI: Buat quest yang murni merespons perintah baru secara independen. DILARANG mengaitkan atau berasumsi tentang pekerjaan masa lalu pengguna.`;
  } else {
    goalTitles = "- [DAFTAR QUEST DISEMBUNYIKAN DEMI PSYCHOLOGICAL DETACHMENT]";
    alignmentRule = `3. RECOVERY & WELLNESS MODE: Karena berada di fase TROUGH/RECOVERY, Anda DILARANG membuat quest teknis berat, pemrograman rumit, atau analisis mendalam, KECUALI pengguna memintanya dengan sangat spesifik. Fokuskan deskripsi quest pada aspek *Psychological Detachment*, istirahat kreatif, refleksi, atau persiapan ringan untuk esok hari.`;
  }

  return `\n\nKONTEKS PENGGUNA SAAT INI:
- Daily Quest aktif: ${dailyCount} (Batas ideal: 5)
- Main Quest aktif: ${mainCount}
- Side Quest aktif: ${sideCount}
- WAKTU LOKAL SAAT INI: Jam ${hour}:00, berada pada ${timePhase}

Daftar Quest aktif saat ini:
${goalTitles}

ATURAN WAJIB BERDASARKAN KONTEKS:
1. Jika Daily Quest saat ini >= 5 dan pengguna meminta rutinitas baru, DILARANG KERAS membuat 'Daily Quest'. Ubah secara paksa kategorinya menjadi 'Side Quest' (sebagai Habit Backlog).
2. Jangan membuat quest yang duplikat dengan "Daftar Quest aktif saat ini".
${alignmentRule}
3. TUGAS ADAPTIF BERBASIS KRONOBIOLOGI: Anda HARUS memperhatikan 'WAKTU LOKAL SAAT INI'. Panduan fase saat ini: ${timeRules}. Jangan berikan tugas yang bertentangan dengan sains sirkadian ini kecuali diperintahkan secara spesifik oleh pengguna!`;
}

// Definisikan schema menggunakan Zod (atau Object Schema bawaan Gemini)
const questResponseSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    description: { type: "string" },
    difficulty: { type: "number", description: "Float antara 1.0 - 5.0" },
    rewardAlpha: { type: "number", description: "Float antara 0.5 - 2.0" },
    category: { type: "string", enum: ["Main Quest", "Daily Quest", "Side Quest"] },
    type: { type: "string", enum: ["daily", "one-off"] }
  },
  required: ["title", "description", "difficulty", "rewardAlpha", "category", "type"]
};

async function callAIModel(prompt: string, systemInstruction: string) {
  const response = await ai.models.generateContent({
    model: 'gemini-flash-lite-latest',
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: questResponseSchema as any,
    }
  });

  const responseText = response.text;
  if (!responseText) {
    throw new Error('No response from AI');
  }

  return JSON.parse(responseText);
}

export const generateQuest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schema = z.object({
      prompt: z.string().min(1),
      localHour: z.number().optional()
    });

    const { prompt, localHour } = schema.parse(req.body);
    const userId = (req as any).user?.id;

    let finalSystemInstruction = BASE_SYSTEM_INSTRUCTION;

    if (userId) {
      const userContext = await buildUserContext(userId, prompt, localHour);
      finalSystemInstruction += userContext;
    }

    const generatedQuest = await callAIModel(prompt, finalSystemInstruction);

    res.json(generatedQuest);
  } catch (err) {
    console.error('AI Quest Generation Error:', err);
    next(err);
  }
};

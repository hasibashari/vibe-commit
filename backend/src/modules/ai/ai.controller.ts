import { Request, Response, NextFunction } from 'express';
import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import * as QuestService from '../quest/quest.service.js';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const BASE_SYSTEM_INSTRUCTION = `Anda adalah seorang ahli Game Master Edukasi untuk LMS bertema RPG. Tugas Anda adalah merancang quest berdasarkan Ilmu Kognitif dan Psikologi Perilaku.

Saat membuat quest dari perintah pengguna, ikuti kerangka ilmiah berikut:
1. TITLE (Judul): Gunakan kata kerja aksi yang memberdayakan dan memicu motivasi intrinsik (Teori Determinasi Diri).
2. DESCRIPTION (Deskripsi): Buat tujuan yang bersifat SMART (Specific, Measurable, Achievable, Relevant). Pecah tugas kompleks menjadi 2-3 langkah kecil yang jelas untuk mengurangi beban kognitif yang tidak perlu. Definisikan dengan pasti apa syarat agar quest ini "selesai".
3. DIFFICULTY (Kesulitan, 1.0 - 5.0): Kalibrasikan menggunakan Taksonomi Bloom. 
   - 1.0-2.0 untuk tugas mengingat/memahami (remembering/understanding).
   - 3.0-4.0 untuk menerapkan/menganalisis (applying/analyzing).
   - 4.5-5.0 untuk mengevaluasi/membuat sistem kompleks (evaluating/creating).
4. REWARD ALPHA (0.5 - 2.0): Terapkan Teori Ekuitas (Equity Theory). Kesulitan yang tinggi HARUS menghasilkan reward yang tinggi. 
5. CATEGORY (Kategori): Harus memilih salah satu secara persis: 'Main Quest', 'Daily Quest', atau 'Side Quest'.
6. TYPE (Tipe): Pilih 'daily' untuk tugas membangun kebiasaan, atau 'one-off' untuk proyek mendalam/sekali jalan.

Anda HANYA boleh mengembalikan objek JSON dengan struktur berikut:
{
  "title": "String, judul yang memberdayakan dalam Bahasa Indonesia",
  "description": "String, tujuan SMART dengan langkah-langkah jelas",
  "difficulty": "Number antara 1.0 dan 5.0",
  "rewardAlpha": "Number antara 0.5 dan 2.0",
  "category": "String, persis 'Main Quest', 'Daily Quest', atau 'Side Quest'",
  "type": "String, persis 'daily' atau 'one-off'"
}`;

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
    // Fase PEAK: Pengguna secara spesifik meminta dihubungkan dengan quest yang ada
    goalTitles = activeGoals.length > 0 
      ? activeGoals.map(g => `- [${g.category}] ${g.title}`).join('\n')
      : '- Belum ada quest aktif.';
    alignmentRule = `3. PENTING: Pengguna meminta quest ini dikaitkan dengan pekerjaannya. Sesuaikan relevansi quest baru agar melengkapi "Daftar Quest aktif saat ini", TETAPI pastikan bebannya sesuai dengan ritme sirkadian saat ini.`;
  } else if (hour >= 5 && hour < 12 && !userWantsContext) {
    // Fase PEAK: Pengguna TIDAK meminta konteks, jadi sembunyikan untuk mencegah Over-anchoring
    goalTitles = "- [DAFTAR QUEST DISEMBUNYIKAN (OPT-IN CONTEXT). JANGAN KAITKAN DENGAN PEKERJAAN LAIN]";
    alignmentRule = `3. PENTING: Buatlah quest yang murni merespons perintah pengguna saat ini secara independen. Jangan mengaitkannya dengan pekerjaan masa lalu.`;
  } else {
    // Fase TROUGH & RECOVERY: Mutlak disembunyikan agar otak bisa istirahat
    goalTitles = "- [DAFTAR QUEST DISEMBUNYIKAN DEMI PSYCHOLOGICAL DETACHMENT (PEMULIHAN MENTAL)]";
    alignmentRule = `3. PENTING: Karena ini adalah fase TROUGH/RECOVERY, buatlah quest yang sepenuhnya tidak terkait dengan pekerjaan berat/teknis. Fokus pada *Psychological Detachment* (istirahat, relaksasi, wellness), kecuali pengguna secara tegas meminta quest pekerjaan teknis.`;
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
4. TUGAS ADAPTIF BERBASIS KRONOBIOLOGI: Anda HARUS memperhatikan 'WAKTU LOKAL SAAT INI'. Panduan fase saat ini: ${timeRules}. Jangan berikan tugas yang bertentangan dengan sains sirkadian ini kecuali diperintahkan secara spesifik oleh pengguna!`;
}

async function callAIModel(prompt: string, systemInstruction: string) {
  const response = await ai.models.generateContent({
    model: 'gemini-flash-lite-latest',
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
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

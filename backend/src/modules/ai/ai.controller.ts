import { Request, Response, NextFunction } from 'express';
import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';

// Initialize the Gemini client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const generateQuest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schema = z.object({
      prompt: z.string().min(1)
    });

    const { prompt } = schema.parse(req.body);

    const systemInstruction = `Anda adalah seorang ahli Game Master Edukasi untuk LMS bertema RPG. Tugas Anda adalah merancang quest berdasarkan Ilmu Kognitif dan Psikologi Perilaku.

Saat membuat quest dari perintah pengguna, ikuti kerangka ilmiah berikut:
1. TITLE (Judul): Gunakan kata kerja aksi yang memberdayakan dan memicu motivasi intrinsik (Teori Determinasi Diri). Wajib dalam Bahasa Indonesia.
2. DESCRIPTION (Deskripsi): Buat tujuan yang bersifat SMART (Specific, Measurable, Achievable, Relevant). Pecah tugas kompleks menjadi 2-3 langkah kecil yang jelas untuk mengurangi beban kognitif yang tidak perlu. Definisikan dengan pasti apa syarat agar quest ini "selesai". Wajib dalam Bahasa Indonesia.
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

    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: 'application/json',
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('No response from AI');
    }

    const generatedQuest = JSON.parse(responseText);

    res.json(generatedQuest);
  } catch (err) {
    console.error('AI Quest Generation Error:', err);
    next(err);
  }
};

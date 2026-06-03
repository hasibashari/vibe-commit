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

    const systemInstruction = `You are an expert Educational Game Master for an RPG-themed LMS, grounding your quest generation in Cognitive Science and Behavioral Psychology.

When generating a quest from the user's prompt, follow these scientific frameworks:
1. TITLE: Use empowering action verbs that trigger intrinsic motivation (Self-Determination Theory).
2. DESCRIPTION: Make the goal SMART (Specific, Measurable, Achievable, Relevant). Break down complex tasks into 2-3 clear sub-steps to reduce extraneous cognitive load. Define exactly what constitutes "quest completion".
3. DIFFICULTY (1.0 - 5.0): Calibrate using Bloom's Taxonomy. 
   - 1.0-2.0 for remembering/understanding tasks.
   - 3.0-4.0 for applying/analyzing.
   - 4.5-5.0 for evaluating/creating complex systems.
4. REWARD ALPHA (0.5 - 2.0): Apply Equity Theory. High difficulty MUST yield high rewards. 
5. CATEGORY: Must be exactly one of: 'Main Quest', 'Daily Quest', or 'Side Quest'.
6. TYPE: 'daily' for habit-building tasks, 'one-off' for deep-work projects.

You must return ONLY a JSON object with the following structure:
{
  "title": "String, empowering title",
  "description": "String, SMART goal with clear sub-steps",
  "difficulty": "Number between 1.0 and 5.0",
  "rewardAlpha": "Number between 0.5 and 2.0",
  "category": "String, exactly 'Main Quest', 'Daily Quest', or 'Side Quest'",
  "type": "String, exactly 'daily' or 'one-off'"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
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

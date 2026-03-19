import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

export type RoastMode = 'funny' | 'savage' | 'dark' | 'friendly';

const MODE_PROMPTS: Record<RoastMode, string> = {
  funny: "Generate a short, funny, family-friendly roast in Bangla. Use Gen Z slang. Keep it light and humorous. Under 2 lines.",
  savage: "Generate a short, savage, and aggressive roast in Bangla. Use Gen Z slang. Be brutal but avoid hate speech or harassment. Under 2 lines.",
  dark: "Generate a short, edgy, dark humor roast in Bangla. Use Gen Z slang. Keep it within safety guidelines (no hate speech). Under 2 lines.",
  friendly: "Generate a short, lighthearted, friendly roast in Bangla. Use Gen Z slang. More like a gentle tease. Under 2 lines."
};

export async function generateRoast(input: string, mode: RoastMode, safeMode: boolean = true, retries = 2): Promise<string> {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const safetyInstruction = safeMode 
    ? "STRICTLY avoid any offensive, harmful, or overly sensitive topics. Keep it PG-13." 
    : "You can be more edgy and use stronger language, but still avoid hate speech or illegal content.";

  const systemInstruction = `You are a savage AI roaster who speaks Bangla. Your goal is to roast the user based on their input in a Messenger-style chat.
  Use natural, Gen Z style Bangla. 
  ${MODE_PROMPTS[mode]}
  Safety Level: ${safetyInstruction}
  User input: ${input}
  Output ONLY the roast text in Bangla. No intro, no outro.`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), 10000); // 10 second timeout
      });

      const generatePromise = ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: 'user', parts: [{ text: systemInstruction }] }],
        config: {
          systemInstruction: "You are a savage AI roaster who speaks Bangla.",
        }
      });

      const response = await Promise.race([generatePromise, timeoutPromise]);

      return response.text || "আমি স্তব্ধ! তোমার কথা শুনে রোস্ট করার ভাষাও হারিয়ে ফেলেছি। আবার চেষ্টা করো।";
    } catch (error: any) {
      console.error(`Gemini Error (Attempt ${attempt + 1}):`, error);
      if (attempt === retries || error.message === 'Timeout') {
        throw new Error("রোস্ট জেনারেট করতে সমস্যা হচ্ছে। এআই হয়তো তোমার বোকামি দেখে একটু বিরতি নিচ্ছে।");
      }
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
    }
  }
  return "আমি স্তব্ধ! তোমার কথা শুনে রোস্ট করার ভাষাও হারিয়ে ফেলেছি। আবার চেষ্টা করো।";
}

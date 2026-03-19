import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { OpenAI } from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for OpenAI Roast Generation
  app.post("/api/generate-roast", async (req, res) => {
    const { input, mode, language } = req.body;

    if (!input) {
      return res.status(400).json({ error: "Input is required" });
    }

    let systemPrompt = "";

    if (language === "Bangla") {
      switch (mode) {
        case "funny":
          systemPrompt = "তুমি একজন মজার AI। নিচের বিষয় নিয়ে ২ লাইনের ছোট, funny Bangla roast দাও। কোনো অপমানজনক বা harmful কথা বলবে না।";
          break;
        case "savage":
          systemPrompt = "তুমি savage AI 😈। নিচের বিষয় নিয়ে sharp কিন্তু safe Bangla roast দাও (২ লাইনের মধ্যে)।";
          break;
        case "friendly":
          systemPrompt = "তুমি friendly AI 🙂। নিচের বিষয় নিয়ে হালকা মজার Bangla roast দাও।";
          break;
        case "dark":
          systemPrompt = "তুমি dark humor AI 🌚। edgy কিন্তু safe Bangla roast দাও।";
          break;
        default:
          systemPrompt = "Savage Bangla roast generator";
      }
    } else {
      // English prompts
      switch (mode) {
        case "funny":
          systemPrompt = "You are a funny AI. Give a short, 2-line funny English roast about the following topic. No offensive or harmful content.";
          break;
        case "savage":
          systemPrompt = "You are a savage AI 😈. Give a sharp but safe English roast (within 2 lines) about the following topic.";
          break;
        case "friendly":
          systemPrompt = "You are a friendly AI 🙂. Give a lighthearted funny English roast about the following topic.";
          break;
        case "dark":
          systemPrompt = "You are a dark humor AI 🌚. Give an edgy but safe English roast about the following topic.";
          break;
        default:
          systemPrompt = "Savage English roast generator";
      }
    }

    try {
      let roast = "আজকে roast server ছুটি নিয়েছে 😴";
      let retries = 2;
      
      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: input },
            ],
            temperature: 0.9,
            max_tokens: 100,
          }, { timeout: 10000 }); // 10 second timeout

          roast = response.choices[0]?.message?.content?.trim() || roast;
          break; // Success, exit retry loop
        } catch (error: any) {
          console.error(`OpenAI API Error (Attempt ${attempt + 1}):`, error.message);
          if (attempt === retries) {
            throw error;
          }
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
        }
      }

      res.json({ roast });
    } catch (error) {
      console.error("OpenAI API Final Error:", error);
      res.status(500).json({ roast: "আজকে roast server ছুটি নিয়েছে 😴" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

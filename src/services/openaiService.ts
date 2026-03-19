import { RoastMode } from "./geminiService";

export async function generateRoast(input: string, mode: RoastMode, language: "bn" | "en" = "bn"): Promise<string> {
  try {
    const response = await fetch("/api/generate-roast", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input,
        mode,
        language: language === "bn" ? "Bangla" : "English",
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate roast");
    }

    const data = await response.json();
    return data.roast;
  } catch (error) {
    console.error("Error generating roast:", error);
    return "আজকে roast server ছুটি নিয়েছে 😴";
  }
}

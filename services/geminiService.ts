import { GoogleGenAI } from "@google/genai";
import { AIConfig } from "../types";

// Ensure API Key is available
const apiKey = process.env.API_KEY;
const geminiClient = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const DEFAULT_AI_CONFIG: AIConfig = {
  // Prefer None (local heuristics) by default if no key, ensuring external calls aren't load bearing.
  // If key exists, default to Gemini, but user can switch to Ollama.
  provider: apiKey ? 'gemini' : 'none',
  ollamaEndpoint: 'http://localhost:11434/api/generate',
  ollamaModel: 'llava',
};

export const analyzeImage = async (
  base64Image: string, 
  mimeType: string,
  config: AIConfig = DEFAULT_AI_CONFIG
): Promise<{
    summary: string;
    labels: string[];
}> => {
  
  // 1. Local / None Strategy (FOSS/Offline default)
  if (config.provider === 'none') {
    return {
      summary: "No AI analysis performed. Metadata extracted locally.",
      labels: ["image", mimeType.split('/')[1]]
    };
  }

  // 2. Ollama Strategy (Self-Hosted FOSS)
  if (config.provider === 'ollama') {
    try {
        const response = await fetch(config.ollamaEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: config.ollamaModel,
                prompt: `Analyze this image for a cultural heritage manifest. 
                1. Provide a concise academic summary (max 2 sentences).
                2. Provide 3-5 short keywords or labels.
                Respond strictly with valid JSON: { "summary": string, "labels": string[] }`,
                images: [base64Image],
                stream: false,
                format: "json"
            })
        });
        
        if (!response.ok) throw new Error("Ollama connection failed. Check CORS settings.");
        const data = await response.json();
        
        let jsonStr = data.response;
        // Clean up markdown code blocks if present
        jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
        
        try {
           return JSON.parse(jsonStr);
        } catch (parseError) {
           // Fallback if model returns raw text despite instructions
           return {
             summary: jsonStr,
             labels: ["ollama-generated"]
           };
        }

    } catch (e) {
        console.error("Ollama Analysis Error:", e);
        throw new Error("Ollama Analysis Failed. Ensure Ollama is running with OLLAMA_ORIGINS=\"*\"");
    }
  }

  // 3. Gemini Strategy (External Bonus)
  if (config.provider === 'gemini') {
    if (!geminiClient) throw new Error("Gemini API Key not found in environment.");
    
    try {
      const modelId = "gemini-2.5-flash-image";
      const prompt = `Analyze this image for a IIIF cultural heritage manifest. 
      1. Provide a concise academic summary (max 2 sentences).
      2. Provide 3-5 short keywords or labels describing the visual content.
      Return JSON format: { "summary": string, "labels": string[] }`;

      const response = await geminiClient.models.generateContent({
        model: modelId,
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Image
              }
            },
            { text: prompt }
          ]
        },
        config: {
            responseMimeType: "application/json",
        }
      });

      const text = response.text || "{}";
      return JSON.parse(text);

    } catch (error) {
      console.error("Gemini Analysis Error:", error);
      throw error;
    }
  }

  throw new Error("Invalid Provider Configured");
};

export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};
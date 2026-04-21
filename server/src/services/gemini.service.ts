import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from "../models/Chat.model";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export class GeminiServiceError extends Error {
  status: number;
  retryAfter?: number;

  constructor(message: string, status = 500, retryAfter?: number) {
    super(message);
    this.name = "GeminiServiceError";
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

const extractRetryAfterSeconds = (message: string) => {
  const match = message.match(/retry in\s+(\d+(?:\.\d+)?)s/i);
  return match ? Math.ceil(Number(match[1])) : undefined;
};

// ✅ Use latest fast model
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

export const generateResponse = async (messages: ChatMessage[]) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new GeminiServiceError(
      "Gemini API key is missing on the server.",
      500,
    );
  }

  // ✅ Proper structured messages + system instruction
  const contents = [
    {
      role: "user",
      parts: [
        {
          text: `
You are a helpful AI assistant.

- Format responses using Markdown
- Use headings, bullet points, and code blocks when needed
- Keep answers clean and readable
`,
        },
      ],
    },
    ...messages.map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    })),
  ];

  try {
    const res = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents,
    });

    // ✅ safer extraction
    const text =
      res?.candidates?.[0]?.content?.parts?.[0]?.text || res?.text || "";

    return text.trim() || "I couldn't generate a response right now.";
  } catch (error: any) {
    const status = error?.status || 500;
    const rawMessage = error?.message || "Gemini request failed";

    if (status === 429) {
      throw new GeminiServiceError(
        "Gemini quota exceeded. Please wait and try again.",
        429,
        extractRetryAfterSeconds(rawMessage),
      );
    }

    throw new GeminiServiceError(rawMessage, status);
  }
};

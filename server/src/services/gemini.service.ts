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
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite-preview";

export const generateResponse = async (messages: ChatMessage[]) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new GeminiServiceError("API key missing", 500);
  }

  // ✅ ONLY conversation here (NO system prompt inside)
  const contents = messages.map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));

  try {
    const res = await ai.models.generateContent({
      model: GEMINI_MODEL,

      contents,

      config: {
        systemInstruction: {
          parts: [
            {
              text: `
You are a professional AI developer assistant.

OUTPUT RULES (VERY IMPORTANT):

1. Always format responses using clean Markdown.

2. For code:
   - ALWAYS use triple backticks
   - ALWAYS specify language
     Example:
     \`\`\`js
     console.log("Hello");
     \`\`\`
   - Never return raw code without code blocks

3. Supported languages:
   - javascript → js
   - typescript → ts
   - json → json
   - bash → bash
   - html → html
   - css → css

4. Inline code:
   - Use single backticks: \`const x = 10\`

5. Structure responses:
   - Use headings (##, ###)
   - Use bullet points
   - Keep spacing clean

6. Code quality:
   - Proper indentation
   - Clean readable formatting
   - No unnecessary comments unless helpful

7. Do NOT:
   - Do NOT wrap full response inside a code block
   - Do NOT skip language in code blocks
   - Do NOT output broken markdown

8. When explaining code:
   - First give explanation
   - Then give code block

9. Keep responses:
   - Clean
   - Developer-friendly
   - Easy to read in UI

Goal:
Your output should render perfectly in ReactMarkdown with syntax highlighting.
      `,
            },
          ],
        },
      },
    });

    const text =
      res?.candidates?.[0]?.content?.parts?.[0]?.text || res?.text || "";

    return text.trim() || "No response generated.";
  } catch (error: any) {
    throw new GeminiServiceError(error.message, error.status || 500);
  }
};

// import { GoogleGenAI } from "@google/genai";
// import { ChatMessage } from "../models/Chat.model";
// import dotenv from "dotenv";

// dotenv.config();

// const ai = new GoogleGenAI({
//   apiKey: process.env.GEMINI_API_KEY,
// });

// export class GeminiServiceError extends Error {
//   status: number;
//   retryAfter?: number;

//   constructor(message: string, status = 500, retryAfter?: number) {
//     super(message);
//     this.name = "GeminiServiceError";
//     this.status = status;
//     this.retryAfter = retryAfter;
//   }
// }

// const extractRetryAfterSeconds = (message: string) => {
//   const match = message.match(/retry in\s+(\d+(?:\.\d+)?)s/i);
//   return match ? Math.ceil(Number(match[1])) : undefined;
// };

// // ✅ Use latest fast model
// const GEMINI_MODEL =
//   process.env.GEMINI_MODEL || "gemini-3.1-flash-lite-preview";

// export const generateResponse = async (messages: ChatMessage[]) => {
//   if (!process.env.GEMINI_API_KEY) {
//     throw new GeminiServiceError(
//       "Gemini API key is missing on the server.",
//       500,
//     );
//   }

//   // ✅ Proper structured messages + system instruction
//   const contents = [
//     {
//       role: "user",
//       parts: [
//         {
//           text: `
// You are a helpful AI assistant.

// - Format responses using Markdown
// - Use headings, bullet points, and code blocks when needed
// - Keep answers clean and readable
// `,
//         },
//       ],
//     },
//     ...messages.map((msg) => ({
//       role: msg.role === "assistant" ? "model" : "user",
//       parts: [{ text: msg.content }],
//     })),
//   ];

//   try {
//     const res = await ai.models.generateContent({
//       model: GEMINI_MODEL,
//       contents,
//     });

//     // ✅ safer extraction
//     const text =
//       res?.candidates?.[0]?.content?.parts?.[0]?.text || res?.text || "";

//     return text.trim() || "I couldn't generate a response right now.";
//   } catch (error: any) {
//     const status = error?.status || 500;
//     const rawMessage = error?.message || "Gemini request failed";

//     if (status === 429) {
//       throw new GeminiServiceError(
//         "Gemini quota exceeded. Please wait and try again.",
//         429,
//         extractRetryAfterSeconds(rawMessage),
//       );
//     }

//     throw new GeminiServiceError(rawMessage, status);
//   }
// };

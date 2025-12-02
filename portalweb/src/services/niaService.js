import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const MODEL_NAME = "gemini-2.5-flash-lite"; // o "gemini-1.5-pro" si prefieres

let genAI;

function getClient() {
  if (!genAI) genAI = new GoogleGenerativeAI(API_KEY);
  return genAI;
}

function makeModel() {
  return getClient().getGenerativeModel({ model: MODEL_NAME });
}

/**
 * Crea una sesión de chat con historial.
 * history: [{role:"user"|"model"|"system", content:string}]
 */
export async function getChatSession(history = []) {
  const model = makeModel();

  const convertHistory = history
    .filter((h) => h.role === "user" || h.role === "model")
    .map((h) => ({
      role: h.role === "user" ? "user" : "model",
      parts: [{ text: h.content }],
    }));

  return model.startChat({
    history: convertHistory,
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024,
    },
  });
}

/**
 * Stream de respuesta
 */
export async function* sendMessageStream(chatSession, userText, signal) {
  const result = await chatSession.sendMessageStream(userText, { signal });

  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) {
      yield text;
    }
  }
}

import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Orden de preferencia: 1.5 Pro (latente), 1.5 Flash (rápido), 1.0 Pro (compatibilidad)
const PREFERRED_MODELS = [
  "gemini-2.5-flash-lite",
  "gemini-1.5-flash-latest",
  "gemini-1.0-pro",
];

let genAI;

function getClient() {
  if (!genAI) genAI = new GoogleGenerativeAI(API_KEY);
  return genAI;
}

function makeModel(name) {
  return getClient().getGenerativeModel({ model: name });
}

async function resolveModel() {
  for (const name of PREFERRED_MODELS) {
    try {
      await makeModel(name).generateContent({
        contents: [{ role: "user", parts: [{ text: "." }] }],
        generationConfig: { maxOutputTokens: 1 },
      });
      return name;
    } catch (err) {
      if (err?.status !== 429) continue;
      return name;
    }
  }
  return "gemini-1.0-pro";
}

let resolvedModelNamePromise = null;

async function getResolvedModel() {
  if (!resolvedModelNamePromise) resolvedModelNamePromise = resolveModel();
  return await resolvedModelNamePromise;
}

/**
 * Crea una sesión de chat con historial.
 * history: [{role:"user"|"model"|"system", content:string}]
 */
export async function getChatSession(history = []) {
  const modelName = await getResolvedModel();
  const model = makeModel(modelName);

  const convertHistory = history
    .filter((h) => h.role === "user" || h.role === "model")
    .map((h) => ({ role: h.role, parts: [{ text: h.content }] }));

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
    if (text) yield text;
  }
}

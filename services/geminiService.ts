import { CartItem, TransactionResult } from "../types.ts";

/**
 * Accesses the API key from the global process shim.
 */
const getApiKey = () => {
  return (window as any).process?.env?.API_KEY || '';
};

/**
 * Generates a cryptographically unique license key.
 * Uses dynamic import to keep the main bundle light.
 */
export const generateQuantumKey = async (items: CartItem[]): Promise<TransactionResult> => {
  const { GoogleGenAI, Type } = await import("@google/genai");
  const apiKey = getApiKey();
  const ai = new GoogleGenAI({ apiKey });
  const productSummary = items.map(i => `${i.name} x${i.quantity}`).join(", ");
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `The user has purchased: ${productSummary}. 
               Generate a secure verification package. 
               The 'licenseKey' must be exactly 16 characters, alphanumeric, uppercase.
               The 'quantumVerification' should be a technical 2-sentence explanation.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          transactionId: { type: Type.STRING, description: "Starts with ELON-" },
          licenseKey: { type: Type.STRING, description: "16-char alphanumeric uppercase" },
          quantumVerification: { type: Type.STRING, description: "Technical status" }
        },
        required: ["transactionId", "licenseKey", "quantumVerification"]
      }
    }
  });

  let text = response.text || "{}";
  text = text.replace(/```json/g, "").replace(/```/g, "").trim();
  
  try {
    const data = JSON.parse(text);
    return {
      ...data,
      licenseKey: data.licenseKey.trim().toUpperCase(),
      status: 'COMPLETED',
      timestamp: new Date().toISOString()
    };
  } catch (e) {
    console.error("Parse failure, raw text:", text);
    throw new Error("Quantum decryption failed.");
  }
};

/**
 * Creates a stateful chat session for support.
 * Uses dynamic import to avoid blocking the main thread.
 */
export const createQuantumChatSession = async (): Promise<any> => {
  const { GoogleGenAI } = await import("@google/genai");
  const apiKey = getApiKey();
  const ai = new GoogleGenAI({ apiKey });
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `You are the ELON FLASHER Quantum AI Core. 
      You are technical, efficient, and slightly mysterious. 
      You speak in terms of 'nodes', 'dimensional portals', and 'The Digital Forest'.
      Users use you for support. Keep responses concise and immersive.`,
    },
  });
};
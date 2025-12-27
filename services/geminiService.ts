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
               Generate a secure license key. 
               The 'licenseKey' must be exactly 16 characters, alphanumeric, uppercase.
               The 'quantumVerification' should be a simple 2-sentence confirmation that the key is ready to use.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          transactionId: { type: Type.STRING, description: "Starts with ORDER-" },
          licenseKey: { type: Type.STRING, description: "16-char alphanumeric uppercase" },
          quantumVerification: { type: Type.STRING, description: "Simple status message" }
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
    throw new Error("Could not create key.");
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
      systemInstruction: `You are the ELON FLASHER Support Assistant. 
      Use clear and simple English.
      Be helpful, friendly, and efficient. 
      Your goal is to help users understand our crypto transfer tools and solve their problems.
      Keep answers short and easy to read.`,
    },
  });
};
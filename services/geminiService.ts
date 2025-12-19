import { GoogleGenAI, Type, Chat } from "@google/genai";
import { CartItem, TransactionResult } from "../types.ts";

/**
 * Accesses the API key from the global process shim.
 */
const getApiKey = () => {
  // Rely on the window.process shim defined in index.html
  return (window as any).process?.env?.API_KEY || '';
};

/**
 * Simulates a backend call to generate a cryptographically "verified" license key
 * via Gemini reasoning.
 */
export const generateQuantumKey = async (items: CartItem[]): Promise<TransactionResult> => {
  const apiKey = getApiKey();
  const ai = new GoogleGenAI({ apiKey });
  const productSummary = items.map(i => `${i.name} x${i.quantity}`).join(", ");
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `The user has purchased the following quantum software: ${productSummary}. 
               Generate a secure verification package for this order. 
               The 'quantumVerification' should be a technical 2-sentence explanation of how the dimensional tunnel was secured for this specific order.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          transactionId: { type: Type.STRING, description: "A unique ID starting with ELON-" },
          licenseKey: { type: Type.STRING, description: "A complex 32-character hexadecimal key" },
          quantumVerification: { type: Type.STRING, description: "Technical verification status" }
        },
        required: ["transactionId", "licenseKey", "quantumVerification"]
      }
    }
  });

  const jsonStr = response.text?.trim() || "{}";
  const data = JSON.parse(jsonStr);
  return {
    ...data,
    status: 'COMPLETED',
    timestamp: new Date().toISOString()
  };
};

/**
 * Creates a stateful chat session for persistent support conversations.
 */
export const createQuantumChatSession = (): Chat => {
  const apiKey = getApiKey();
  const ai = new GoogleGenAI({ apiKey });
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `You are the ELON FLASHER Quantum AI Core. 
      You are technical, efficient, and slightly mysterious. 
      You speak in terms of 'nodes', 'dimensional portals', 'USDT flashing', and 'The Digital Forest'.
      Users come to you for troubleshooting their quantum software or choosing a version.
      Keep responses concise but immersive.`,
    },
  });
};
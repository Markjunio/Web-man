
import { GoogleGenAI, Type, Chat } from "@google/genai";
import { CartItem, TransactionResult } from "../types.ts";

/**
 * Simulates a backend call to generate a cryptographically "verified" license key
 * via Gemini reasoning.
 */
export const generateQuantumKey = async (items: CartItem[]): Promise<TransactionResult> => {
  // Create a new GoogleGenAI instance right before making an API call to ensure it always uses the most up-to-date API key.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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

  // Use the text property directly (it's not a method).
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
  // Create a new GoogleGenAI instance right before making an API call to ensure it always uses the most up-to-date API key.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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

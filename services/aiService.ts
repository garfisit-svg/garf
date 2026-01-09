import { GoogleGenAI } from "@google/genai";
import { Hub } from "../types";

// Note: process.env.API_KEY is automatically injected
const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAIScoutResponse = async (userQuery: string, availableHubs: Hub[]) => {
  const model = "gemini-3-flash-preview";
  
  // Create a context string from the hubs data
  const hubsContext = availableHubs.map(h => 
    `Name: ${h.name}, Type: ${h.type}, Location: ${h.location}, Rating: ${h.rating}, Price: ₹${h.priceStart}, Description: ${h.description}`
  ).join("\n");

  const prompt = `
    You are the "Garf Tactical Scout", an elite AI assistant for a premium sports turf and gaming cafe booking platform called Garf.
    Your tone is tactical, professional, and slightly futuristic (think military/e-sports commander).
    
    CONTEXT DATA:
    Here are the currently available hubs:
    ${hubsContext}
    
    USER QUERY:
    "${userQuery}"
    
    YOUR MISSION:
    1. Answer the user's question accurately based on the hub data provided.
    2. If they ask for recommendations, suggest the best-rated or most relevant hubs.
    3. Keep responses concise and tactical.
    4. If no relevant hub exists, suggest they keep scanning the radar for new units.
  `;

  try {
    const response = await genAI.models.generateContent({
      model: model,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        temperature: 0.7,
        topP: 0.95,
      }
    });

    return response.text || "Communication error. Tactical scan failed.";
  } catch (error) {
    console.error("AI Scout Error:", error);
    return "Negative. I've encountered a signal interference. Try again.";
  }
};

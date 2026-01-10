import { GoogleGenAI } from "@google/genai";
import { Hub } from "../types";

// Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAIScoutResponse = async (userQuery: string, availableHubs: Hub[]) => {
  const model = 'gemini-3-flash-preview';
  
  // Create a context string from the hubs data
  const hubsContext = availableHubs.length > 0 
    ? availableHubs.map(h => 
        `Name: ${h.name}, Type: ${h.type}, Location: ${h.location}, Rating: ${h.rating}, Price: ₹${h.priceStart}, Description: ${h.description}`
      ).join("\n")
    : "No hubs are currently registered on the network.";

  const prompt = `
    You are the "Garf Tactical Scout", a high-performance AI assistant for a sports turf and gaming cafe booking platform called Garf.
    Your tone is tactical, professional, and futuristic.
    
    MISSION PARAMETERS:
    1. Respond to the user's question based on the live hub data provided.
    2. If hubs are available, recommend the best options based on user needs.
    3. If NO hubs are available, inform the user that the sector is currently quiet and suggests they check back as new owners deploy units.
    4. Keep responses concise and focus on availability and coordination.
    
    CURRENT SECTOR DATA:
    ${hubsContext}
    
    USER TRANSMISSION:
    "${userQuery}"
  `;

  try {
    // Correct method to call generateContent with model and contents
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        temperature: 0.7,
        topP: 0.95,
      }
    });

    // Directly access the .text property from GenerateContentResponse
    return response.text || "Communication error. Tactical scan failed.";
  } catch (error) {
    console.error("AI Scout Error:", error);
    return "Negative. I've encountered signal interference. Re-establishing link...";
  }
};
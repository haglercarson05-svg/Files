
import { GoogleGenAI, Type } from "@google/genai";
import { NoteCategory } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Enhanced Processor: Focuses on "Building Mastery"
 */
export const processInformation = async (input: string, existingContext?: string, isSeed: boolean = false) => {
  const model = 'gemini-3-pro-preview';
  
  const systemPrompt = isSeed 
    ? `You are an Intellectual Mentor. The user wants to learn a new topic. 
       Generate a "Research Seed" note. Instead of just summarizing, create a structure of what they NEED to know.
       Formulate critical "Cues" that act as questions they must answer to achieve mastery.`
    : `You are a Knowledge Architect. Transform raw input into a validated, hierarchical Cornell note. 
       Highlight logical gaps and connections to existing knowledge.`;

  const response = await ai.models.generateContent({
    model,
    contents: `${systemPrompt}
    
    CONTEXT OF EXISTING KNOWLEDGE:
    ${existingContext || 'None'}

    INPUT:
    ${input}`,
    config: {
      thinkingConfig: { thinkingBudget: 32768 },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          category: { type: Type.STRING },
          tags: { type: Type.ARRAY, items: { type: Type.STRING } },
          cornell: {
            type: Type.OBJECT,
            properties: {
              notes: { type: Type.STRING },
              cues: { type: Type.ARRAY, items: { type: Type.STRING } },
              summary: { type: Type.STRING }
            },
            required: ["notes", "cues", "summary"]
          },
          validation: {
            type: Type.OBJECT,
            properties: {
              accuracyScore: { type: Type.NUMBER },
              verificationNote: { type: Type.STRING },
              factCheckDetails: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    fact: { type: Type.STRING },
                    status: { type: Type.STRING }
                  }
                }
              }
            },
            required: ["accuracyScore", "verificationNote", "factCheckDetails"]
          },
          connections: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                relation: { type: Type.STRING }
              }
            }
          }
        },
        required: ["title", "category", "tags", "cornell", "validation", "connections"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const askGeminiAboutNote = async (prompt: string, noteContext: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Help the user master this concept. CONTEXT: ${noteContext}. REQUEST: ${prompt}`,
  });
  return response.text;
};

/**
 * AI Keyword Expansion for Search
 */
export const getRelatedKeywords = async (query: string) => {
  if (!query || query.length < 2) return [];
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `The user is searching for "${query}" in their knowledge base. 
      Suggest 5 highly relevant, conceptual, or semantic keywords (1-2 words each) that are related to this query.
      Focus on academic, scientific, or professional terms.
      Return as a JSON array of strings.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Keyword expansion failed", e);
    return [];
  }
};

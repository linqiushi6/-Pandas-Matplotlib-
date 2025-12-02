import { GoogleGenAI } from "@google/genai";
import { EnergyDataPoint } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

export const GeminiService = {
  // Generate a specific insight for a chart
  analyzeChartData: async (
    chartTitle: string,
    dataContext: any[],
    region: string
  ): Promise<string> => {
    try {
      const ai = getClient();
      // Sampling data to avoid huge context, picking every 5th year + last year
      const sampledData = dataContext.filter((_, i) => i % 5 === 0 || i === dataContext.length - 1);
      
      const prompt = `
        You are a senior data journalist for the Financial Times.
        
        Analyze the following dataset for region: ${region}.
        Chart Subject: ${chartTitle}
        Data (Sampled): ${JSON.stringify(sampledData)}

        Task: Write a single, punchy, insight (max 2 sentences) that captures the most interesting trend, inflection point, or anomaly.
        Do not describe the chart literally (e.g., "the line goes up"). Instead, explain *why* or the *impact*.
        Use active voice.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      return response.text || "No insight generated.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Unable to analyze data at this moment.";
    }
  },

  // Generate a full "Data Story" based on current view
  generateFullStory: async (region: string, stats: any): Promise<string> => {
    try {
      const ai = getClient();
      
      const prompt = `
        You are a data storyteller.
        
        Write a short narrative (3 paragraphs) about the energy transition in ${region}.
        
        Key Stats for 2024:
        - Renewable Share: ${stats.renewablesShare.toFixed(1)}%
        - CO2 Emissions: ${stats.co2} Million Tonnes
        - Fossil Fuel Total: ${stats.totalFossil} TWh
        - Renewable Total: ${stats.totalRenewables} TWh
        
        Structure:
        1. The headline (Bold, catchy).
        2. The Challenge (Reliance on fossils).
        3. The Hope (Growth of renewables).
        
        Format the output with Markdown. Make it sound professional yet engaging.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      return response.text || "Story generation failed.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Could not generate the full story. Please check API key configuration.";
    }
  }
};

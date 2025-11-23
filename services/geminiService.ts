import { GoogleGenAI } from "@google/genai";

export const generateImageDescription = async (imageBlob: Blob): Promise<string> => {
  try {
    if (!process.env.API_KEY) {
      throw new Error("API Key not found");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Convert Blob to Base64
    const base64Data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(imageBlob);
      reader.onloadend = () => {
        const base64 = reader.result as string;
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        resolve(base64.split(',')[1]);
      };
      reader.onerror = reject;
    });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Data
            }
          },
          {
            text: "Vygeneruj stručný, výstižný popisek (alt text) pro tento obrázek v češtině. Maximálně 2 věty."
          }
        ]
      }
    });

    return response.text || "Popis se nepodařilo vygenerovat.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Chyba při generování popisu.";
  }
};

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const getGeminiResponse = async (message) => {
    const response = await ai.interactions.create({
        model: "gemini-3.6-flash",
        input: message
    });

    return response.output_text;
};

export default getGeminiResponse;
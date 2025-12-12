import { GoogleGenAI, Type, Chat, Modality } from "@google/genai";
import { AnalysisResponse, UrgencyLevel } from "../types";

// Helper to convert File to GenAI Part
const fileToPart = (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Helper to convert Audio Blob to GenAI Part
const audioToPart = (blob: Blob): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: blob.type || 'audio/webm',
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// Schema definition (Type annotation removed to avoid import error)
const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    urgency: {
      type: Type.STRING,
      enum: ["High", "Medium", "Low", "Alta", "Media", "Baja"],
      description: "Nivel de urgencia médica (Return 'High'/'Medium'/'Low' if English, 'Alta'/'Media'/'Baja' if Spanish).",
    },
    urgencyReason: { type: Type.STRING },
    clinicalSummary: {
      type: Type.OBJECT,
      properties: {
        duration: { type: Type.STRING },
        painLevel: { type: Type.STRING },
        keySymptoms: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["duration", "painLevel", "keySymptoms"],
    },
    recommendedSpecialist: { type: Type.STRING },
    referralLetter: { type: Type.STRING },
    medicalAdvice: { type: Type.STRING },
    warningSigns: { type: Type.ARRAY, items: { type: Type.STRING } },
    diagnoses: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          condition: { type: Type.STRING },
          confidence: { type: Type.NUMBER },
          description: { type: Type.STRING },
        },
        required: ["condition", "confidence", "description"],
      },
    },
    followUpQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
    homeCareSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
    visualSummaryDescription: { type: Type.STRING },
  },
  required: ["urgency", "urgencyReason", "clinicalSummary", "recommendedSpecialist", "referralLetter", "medicalAdvice", "warningSigns", "diagnoses", "followUpQuestions", "homeCareSteps", "visualSummaryDescription"],
};

export const analyzeSymptoms = async (
  textDescription: string,
  files: File[],
  audioBlob: Blob | null,
  language: 'es' | 'en'
): Promise<AnalysisResponse> => {
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const langText = language === 'es' ? 'SPANISH' : 'ENGLISH';
  
  const prompt = `
    Act as a Senior Medical Consultant AI (Gemini 3 Pro).
    
    TASK:
    1. Analyze provided TEXT.
    2. Analyze provided IMAGES/VIDEO for clinical signs.
    3. Listen to provided AUDIO (if any).
    
    OUTPUT REQUIREMENT:
    - **CRITICAL**: The JSON response content MUST be in **${langText}**.
    - If the user writes in Spanish but you are set to English, Translate the analysis to English.
    - If urgency is High, use "${language === 'es' ? 'Alta' : 'High'}".
    - Generate a professional "Referral Letter" in ${langText}.
    
    PATIENT INPUT:
    "${textDescription}"
  `;

  try {
    const parts: any[] = [];
    parts.push({ text: prompt });
    
    const fileParts = await Promise.all(files.map(fileToPart));
    parts.push(...fileParts);
    
    if (audioBlob) {
      const audioPart = await audioToPart(audioBlob);
      parts.push(audioPart);
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: [{ role: 'user', parts: parts }],
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        systemInstruction: `You are HealthVibe AI. Analyze multimodal medical data. Output strictly in ${langText}.`,
        temperature: 0.1, 
      }
    });

    const responseText = response.text;
    if (!responseText) throw new Error("No response received.");

    return JSON.parse(responseText) as AnalysisResponse;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};

export const createMedicalChat = (analysisContext: AnalysisResponse, language: 'es' | 'en'): Chat => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const contextString = JSON.stringify(analysisContext, null, 2);
  const langText = language === 'es' ? 'Spanish' : 'English';
  
  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: `
        Act as an Empathetic Medical Assistant.
        CONTEXT: ${contextString}
        LANGUAGE: Respond strictly in ${langText}.
        GOAL: Answer follow-up questions, clarify the referral letter, give palliative advice.
        SAFETY: Never change diagnosis or prescribe RX meds.
      `
    }
  });
};

export const generateWelcomeSpeech = async (language: 'es' | 'en'): Promise<string | undefined> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const text = language === 'es' 
      ? "Hola, soy el Doctor Health Vibe. Por favor, sube una foto de tu síntoma o descríbelo con una nota de voz para comenzar."
      : "Hello, I am Doctor Health Vibe. Please upload a photo of your symptom or describe it with a voice note to begin.";

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: { parts: [{ text }] },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Fenrir' } },
        },
      },
    });

    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  } catch (error) {
    console.error("TTS Error:", error);
    return undefined;
  }
};
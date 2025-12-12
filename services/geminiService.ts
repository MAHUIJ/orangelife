

import { GoogleGenAI, Type } from "@google/genai";
import { BankingAnalysisResult, SmartAssistantResult, AssistantMode, Language, DocumentAdvice, UserType, BankingRecommendation, ScoredBank } from "../types";
import { FRENCH_BANKS, TRANSLATIONS } from "../constants";

// Helper to convert File to base64
const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data url prefix (e.g. "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const getAIClient = () => {
  if (!process.env.API_KEY) {
    console.warn("API Key is missing - Using Demo Mock Mode");
    return null;
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const analyzeBankingDocument = async (file: File): Promise<BankingAnalysisResult> => {
  try {
    const ai = getAIClient();
    
    if (!ai) throw new Error("Demo Mode Trigger");

    const base64Data = await fileToGenerativePart(file);

    const prompt = `
      Analyze this image for a French bank account opening application.
      Identify if it is a Passport, Visa, or Proof of Address (Justificatif de domicile).
      Check if the text is legible and looks valid.
      Return a JSON object.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          { inlineData: { mimeType: file.type, data: base64Data } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isValid: { type: Type.BOOLEAN },
            documentType: { type: Type.STRING },
            extractedName: { type: Type.STRING },
            issues: { type: Type.ARRAY, items: { type: Type.STRING } },
            confidence: { type: Type.NUMBER }
          },
          required: ["isValid", "documentType", "issues", "confidence"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as BankingAnalysisResult;
    }
    throw new Error("No response from AI");
  } catch (error) {
    console.warn("Gemini Service Error (Falling back to Demo Mock):", error);
    await new Promise(resolve => setTimeout(resolve, 2000));
    return {
      isValid: true,
      documentType: "Passport / ID Card",
      extractedName: "Zhang Wei",
      issues: [],
      confidence: 0.98
    };
  }
};

export const analyzeAssistantContent = async (
  mode: AssistantMode,
  content: string | File,
  language: Language
): Promise<SmartAssistantResult> => {
  try {
    const ai = getAIClient();
    if (!ai) throw new Error("Demo Mode Trigger");

    let parts: any[] = [];
    if (content instanceof File) {
      const base64Data = await fileToGenerativePart(content);
      parts.push({ inlineData: { mimeType: content.type, data: base64Data } });
    } else {
      parts.push({ text: content });
    }

    const systemPrompt = mode === 'administrative' 
      ? `You are a French Administrative Assistant. Analyze the user's document/text.
         Output JSON with: type='administrative', summary (translated to ${language}), steps (array of strings translated to ${language}), deadline (YYYY-MM-DD or null), official_links (array of {name, url}).`
      : `You are a French Cybersecurity Expert. Analyze the user's input for SCAMS/PHISHING.
         Output JSON with: type='safety', risk_level ('low', 'medium', 'high'), explanation (translated to ${language}), advice (translated to ${language}), official_link ({name, url}).
         Strictly identify 'Ameli', 'CPF', 'Crit'air', 'Netflix' sms/emails as potential phishing.`;

    parts.push({ text: systemPrompt });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts },
      config: { responseMimeType: "application/json" }
    });

    if (response.text) {
      return JSON.parse(response.text) as SmartAssistantResult;
    }
    throw new Error("No response");

  } catch (error) {
    console.warn("Using Demo Fallback for Assistant");
    await new Promise(resolve => setTimeout(resolve, 1500));

    // DEMO MOCKS FROM CONSTANTS
    const mocks = TRANSLATIONS[language].mock_ai;
    if (mode === 'administrative') {
        return mocks.administrative;
    } else {
        return mocks.safety;
    }
  }
};

export const getDocumentAdvice = async (text: string, language: Language): Promise<DocumentAdvice> => {
  try {
    const ai = getAIClient();
    if (!ai) throw new Error("Demo Mode Trigger");

    const prompt = `
      You are an expert French administrative assistant helping a foreigner.
      Analyze the following text (which is likely a letter or email from a French administration like CAF, Ameli, or a Bank).
      
      Text to analyze: "${text}"

      Please provide:
      1. A summary of what this document says in ${language}.
      2. A list of specific action items the user needs to take (in ${language}).
      3. A translation of the original text into ${language}.

      Return the response in JSON format.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            actionItems: { type: Type.ARRAY, items: { type: Type.STRING } },
            translatedText: { type: Type.STRING }
          },
          required: ["summary", "actionItems", "translatedText"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as DocumentAdvice;
    }
    throw new Error("No response from AI");

  } catch (error) {
    console.warn("Gemini Service Error (Document Advice) - Falling back to mock:", error);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock response
    return {
      summary: "The Family Allowance Fund (CAF) has received your application but cannot process it because a document is unreadable.",
      actionItems: [
        "Ask your landlord for a new 'Attestation de loyer' (Rent Certificate).",
        "Ensure the document is signed.",
        "Upload it to your CAF account before October 5, 2024."
      ],
      translatedText: "Hello, Following your request for housing assistance, we have received your file. However, after review, it appears that the attached document 'Rent Certificate' is illegible. Please send us this document signed by your landlord before 05/10/2024. Without a response from you, your rights will be suspended. Sincerely, The CAF of Paris"
    };
  }
};

export const getBankRecommendations = async (
  userType: UserType,
  documents: File[]
): Promise<BankingRecommendation> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Logic: Score = 0.4*compatibility + 0.3*success + 0.2*profile + 0.1*distance
  
  const scoredBanks: ScoredBank[] = FRENCH_BANKS.map(bank => {
    let compatibility = 0.7; // Base
    let successRate = 0.8;
    let profileMatch = 0.5;
    let distanceScore = 0.5;
    let reason = "default"; // Translation key
    let distance = "2.5 km";

    // Customize logic based on User Type
    if (userType === UserType.STUDENT) {
      if (bank.category === 'online') {
        compatibility = 0.95;
        successRate = 0.98;
        profileMatch = 0.9;
        reason = "student_online";
      } else if (bank.id === 'bnp') {
        compatibility = 0.8;
        profileMatch = 0.85;
        reason = "student_bnp";
      }
    } else if (userType === UserType.WORKER) {
      if (bank.category === 'physical') {
        compatibility = 0.9;
        successRate = 0.85;
        profileMatch = 0.9;
        reason = "worker_physical";
        if (bank.id === 'lcl') reason = "worker_lcl";
      }
    } else {
        // Visitor
        if (bank.category === 'online') {
            reason = "visitor_online";
            successRate = 0.9;
        } else {
            successRate = 0.6;
            reason = "visitor_physical";
        }
    }

    if (bank.category === 'physical') {
        // Mock specific distance
        const distVal = (Math.random() * 5 + 0.5).toFixed(1);
        distance = `${distVal} km`;
        distanceScore = 1 - (parseFloat(distVal) / 10); // Closer is better
    } else {
        distanceScore = 1; // Online is "immediate"
    }

    const totalScore = (
        (0.4 * compatibility) + 
        (0.3 * successRate) + 
        (0.2 * profileMatch) + 
        (0.1 * distanceScore)
    ) * 100;

    return {
      ...bank,
      score: Math.round(totalScore),
      compatibilityScore: compatibility,
      successRate,
      profileMatchScore: profileMatch,
      reason,
      distance: bank.category === 'physical' ? distance : undefined
    };
  });

  // Split and Sort
  const online = scoredBanks
    .filter(b => b.category === 'online')
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
    
  const physical = scoredBanks
    .filter(b => b.category === 'physical')
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return { online, physical };
};
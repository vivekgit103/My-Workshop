import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

// Default to a dummy key if not provided during build, but throw in runtime if actually missing
const apiKey = process.env.GEMINI_API_KEY || '';

export const ai = new GoogleGenAI({
  apiKey: apiKey,
});

export const MODEL_NAMES = {
  ADVISORY_REASONING: 'gemini-2.5-pro',
  MULTIMODAL_DOCTOR: 'gemini-2.5-flash',
} as const;

// Service to extract structured data from call transcripts using Claude

import Anthropic from '@anthropic-ai/sdk';
import type { ExtractedCallData } from '../types.js';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const EXTRACTION_PROMPT = `You are a clinical data extraction assistant for a kidney transplant program.

Extract the following information from the call transcript below. Return ONLY valid JSON matching this exact structure — no markdown, no explanation:

{
  "medicalHistory": {
    "previousSurgeries": { "value": "...", "confidence": "high|medium|low" },
    "currentMedications": { "value": "...", "confidence": "high|medium|low" },
    "allergies": { "value": "...", "confidence": "high|medium|low" },
    "symptoms": { "value": "...", "confidence": "high|medium|low" }
  },
  "lifestyleInfo": {
    "supportSystem": { "value": "...", "confidence": "high|medium|low" },
    "transportation": { "value": "...", "confidence": "high|medium|low" },
    "livingSituation": { "value": "...", "confidence": "high|medium|low" },
    "complianceHistory": { "value": "...", "confidence": "high|medium|low" }
  }
}

Rules:
- If the patient didn't mention something, set value to "Not mentioned" and confidence to "low"
- confidence is "high" if stated clearly, "medium" if implied, "low" if not mentioned or unclear
- Be concise but complete in the value fields
- Do not add any fields beyond what is specified

Transcript:
`;

// Fallback data used when API key is missing or extraction fails
const FALLBACK_DATA: ExtractedCallData = {
  medicalHistory: {
    previousSurgeries: { value: 'Not extracted', confidence: 'low' },
    currentMedications: { value: 'Not extracted', confidence: 'low' },
    allergies: { value: 'Not extracted', confidence: 'low' },
    symptoms: { value: 'Not extracted', confidence: 'low' },
  },
  lifestyleInfo: {
    supportSystem: { value: 'Not extracted', confidence: 'low' },
    transportation: { value: 'Not extracted', confidence: 'low' },
    livingSituation: { value: 'Not extracted', confidence: 'low' },
    complianceHistory: { value: 'Not extracted', confidence: 'low' },
  },
};

export async function extractDataFromTranscript(transcript: string): Promise<ExtractedCallData> {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('[Extraction] ANTHROPIC_API_KEY not set — skipping LLM extraction');
    return FALLBACK_DATA;
  }

  if (!transcript || transcript.trim().length === 0) {
    console.warn('[Extraction] Empty transcript — skipping LLM extraction');
    return FALLBACK_DATA;
  }

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: EXTRACTION_PROMPT + transcript,
        },
      ],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const extracted = JSON.parse(text) as ExtractedCallData;

    console.log('[Extraction] Successfully extracted data from transcript');
    return extracted;
  } catch (error) {
    console.error('[Extraction] Failed to extract data:', error);
    return FALLBACK_DATA;
  }
}

export function calculateCallDuration(startedAt?: string, endedAt?: string): number {
  if (!startedAt || !endedAt) return 0;
  const start = new Date(startedAt).getTime();
  const end = new Date(endedAt).getTime();
  return Math.round((end - start) / 1000 / 60);
}

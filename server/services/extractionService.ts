// Service to extract structured data and risk assessment from call transcripts using Claude

import Anthropic from '@anthropic-ai/sdk';
import type { FullExtractionResult } from '../types.js';

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
  },
  "risk": {
    "level": "HIGH|MEDIUM|LOW",
    "totalScore": <number 0-100>,
    "confidenceScore": <number 0-100>,
    "factors": [
      {
        "category": "<one of: cardiac|diabetes|dialysis|sensitization|cancer|lifestyle|compliance|functional>",
        "name": "<short factor name>",
        "value": "<observed value from transcript>",
        "impact": "<high|medium|low>",
        "points": <number 5-25>,
        "description": "<one sentence clinical description>"
      }
    ]
  }
}

Rules for extraction fields:
- If the patient didn't mention something, set value to "Not mentioned" and confidence to "low"
- confidence is "high" if stated clearly, "medium" if implied, "low" if unclear or not mentioned
- Be concise but complete

Rules for risk assessment:
- LOW: 0-30 total score — patient appears to be a reasonable transplant candidate
- MEDIUM: 31-60 — some concerns requiring further evaluation
- HIGH: 61-100 — significant risk factors identified
- Include 2-5 factors based on what is mentioned in the transcript
- Only use categories from: cardiac, diabetes, dialysis, sensitization, cancer, lifestyle, compliance, functional

Transcript:
`;

const FALLBACK: FullExtractionResult = {
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

export async function extractDataFromTranscript(transcript: string): Promise<FullExtractionResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('[Extraction] ANTHROPIC_API_KEY not set — skipping LLM extraction');
    return FALLBACK;
  }

  if (!transcript || transcript.trim().length === 0) {
    console.warn('[Extraction] Empty transcript — skipping LLM extraction');
    return FALLBACK;
  }

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1500,
      messages: [{ role: 'user', content: EXTRACTION_PROMPT + transcript }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const extracted = JSON.parse(text) as FullExtractionResult;

    console.log(`[Extraction] Success — risk level: ${extracted.risk?.level ?? 'none'}`);
    return extracted;
  } catch (error) {
    console.error('[Extraction] Failed:', error);
    return FALLBACK;
  }
}

export function calculateCallDuration(startedAt?: string, endedAt?: string): number {
  if (!startedAt || !endedAt) return 0;
  const start = new Date(startedAt).getTime();
  const end = new Date(endedAt).getTime();
  return Math.round((end - start) / 1000 / 60);
}

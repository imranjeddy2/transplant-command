// Service to extract structured data and risk assessment from call transcripts using Claude

import Anthropic from '@anthropic-ai/sdk';
import type { FullExtractionResult } from '../types.js';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const EXTRACTION_PROMPT = `You are a clinical data extraction assistant for a kidney transplant program.

Extract the following information from the call transcript below.

CRITICAL: Return ONLY raw JSON — absolutely no markdown, no code blocks (no \`\`\`), no explanation before or after. The very first character of your response must be { and the very last must be }.

Use this exact JSON structure:

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
- Be flexible — extract ANY relevant medical information mentioned, even if it doesn't perfectly match the field name
- For previousSurgeries: include any surgeries, procedures, or operations mentioned
- For currentMedications: list any drugs, medications, or supplements mentioned
- For allergies: include any allergies or adverse reactions
- For symptoms: include any health complaints, conditions, or ongoing issues described
- For supportSystem: include family, friends, caregivers, or anyone helping the patient
- For transportation: any mention of how they get to appointments
- For livingSituation: living alone, with family, in a facility, etc.
- For complianceHistory: any mention of following medical advice, missing appointments, medication adherence
- If the patient clearly mentioned something, set value to what they said and confidence to "high"
- If something is implied but not stated directly, set confidence to "medium"
- Only use "Not mentioned" with confidence "low" if the topic was truly not discussed at all
- Be concise but complete — capture the actual words and specifics from the transcript

Rules for risk assessment:
- LOW: 0-30 total score — patient appears to be a reasonable transplant candidate
- MEDIUM: 31-60 — some concerns requiring further evaluation
- HIGH: 61-100 — significant risk factors identified
- Include 2-5 factors based on what is mentioned in the transcript
- Only use categories from: cardiac, diabetes, dialysis, sensitization, cancer, lifestyle, compliance, functional
- Base risk factors only on what is actually discussed in the transcript

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

function extractJsonFromText(text: string): string {
  // Strip markdown code blocks (```json ... ``` or ``` ... ```)
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) return codeBlockMatch[1].trim();
  return text.trim();
}

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
    const extracted = JSON.parse(extractJsonFromText(text)) as FullExtractionResult;

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

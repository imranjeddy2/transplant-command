// Service to extract structured data from Vapi call transcript
// For demo purposes, this returns mock data regardless of transcript content

import type { ExtractedCallData, VapiCallResponse } from '../types.js';

// Demo mock data - realistic pre-evaluation responses
const DEMO_EXTRACTED_DATA: ExtractedCallData = {
  medicalHistory: {
    previousSurgeries: {
      value: 'Appendectomy in 2018, minor knee arthroscopy in 2020',
      confidence: 'high',
    },
    currentMedications: {
      value: 'Lisinopril 10mg daily for blood pressure, Metformin 500mg twice daily for diabetes management',
      confidence: 'high',
    },
    allergies: {
      value: 'Penicillin (causes rash), no known food allergies',
      confidence: 'high',
    },
    symptoms: {
      value: 'Occasional fatigue, some swelling in ankles by end of day, mild shortness of breath with exertion',
      confidence: 'medium',
    },
  },
  lifestyleInfo: {
    supportSystem: {
      value: 'Lives with spouse who works from home. Adult daughter lives 15 minutes away and is available for appointments',
      confidence: 'high',
    },
    transportation: {
      value: 'Has reliable personal vehicle. Spouse can drive if needed. Daughter also available as backup',
      confidence: 'high',
    },
    livingSituation: {
      value: 'Single-story home with 2 bedrooms, accessible bathroom. No stairs required for daily activities',
      confidence: 'high',
    },
    complianceHistory: {
      value: 'Reports good medication adherence using pill organizer. Attends all scheduled appointments. Uses phone reminders',
      confidence: 'medium',
    },
  },
};

export function extractDataFromTranscript(_callResponse: VapiCallResponse): ExtractedCallData {
  // For demo: always return the same polished mock data
  // In production, this would parse the actual transcript
  return DEMO_EXTRACTED_DATA;
}

export function calculateCallDuration(startedAt?: string, endedAt?: string): number {
  if (!startedAt || !endedAt) return 0;

  const start = new Date(startedAt).getTime();
  const end = new Date(endedAt).getTime();

  return Math.round((end - start) / 1000 / 60); // Duration in minutes
}

// Frontend service for call API

// In production the frontend is served by the same Express server,
// so we use a relative path. In dev, point to the local backend.
const API_BASE_URL = import.meta.env.PROD ? '/api' : 'http://localhost:3001/api';

export type CallStatus = 'initiating' | 'ringing' | 'in_progress' | 'ended' | 'failed';

export interface ExtractedField {
  value: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface ExtractedCallData {
  medicalHistory: {
    previousSurgeries: ExtractedField;
    currentMedications: ExtractedField;
    allergies: ExtractedField;
    symptoms: ExtractedField;
  };
  lifestyleInfo: {
    supportSystem: ExtractedField;
    transportation: ExtractedField;
    livingSituation: ExtractedField;
    complianceHistory: ExtractedField;
  };
}

export interface InitiateCallResponse {
  callId: string;
  status: CallStatus;
}

export interface CallStatusResponse {
  callId: string;
  status: CallStatus;
  startedAt?: string;
  endedAt?: string;
  duration?: number;
  transcript?: string;
  extractedData?: ExtractedCallData | null;
  error?: string;
}

export async function initiateCall(
  patientId: string,
  phoneNumber: string,
  patientName: string
): Promise<InitiateCallResponse> {
  const response = await fetch(`${API_BASE_URL}/calls/initiate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ patientId, phoneNumber, patientName }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to initiate call');
  }

  return response.json();
}

export async function getCallStatus(callId: string): Promise<CallStatusResponse> {
  const response = await fetch(`${API_BASE_URL}/calls/${callId}/status`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to get call status');
  }

  return response.json();
}

export async function resetDemo(): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/demo/reset`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Failed to reset demo');
  }
}

export interface PatientRiskFactor {
  category: string;
  name: string;
  value: string;
  impact: 'high' | 'medium' | 'low';
  points: number;
  description: string;
}

export interface PatientStateResponse {
  patientId: string;
  status: string;
  riskAssessment?: {
    level: 'HIGH' | 'MEDIUM' | 'LOW';
    totalScore: number;
    confidenceScore: number;
    factors: PatientRiskFactor[];
  };
}

export async function getPatientState(patientId: string): Promise<PatientStateResponse | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/calls/patient/${patientId}/state`);
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

export async function clearPatientData(patientId: string): Promise<void> {
  await fetch(`${API_BASE_URL}/demo/reset/${patientId}`, { method: 'POST' });
}

export async function resetPatientDemo(patientId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/demo/reset/${patientId}`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Failed to reset patient demo');
  }
}

export interface PatientCallRecord {
  callId: string;
  patientId: string;
  patientName: string;
  status: CallStatus;
  createdAt: string;
  startedAt?: string;
  endedAt?: string;
  transcript?: string;
  summary?: string;
  extractedData?: ExtractedCallData | null;
}

export interface ExtractedPatientData {
  medicalHistory: {
    previousSurgeries: ExtractedField;
    currentMedications: ExtractedField;
    allergies: ExtractedField;
    symptoms: ExtractedField;
  };
  lifestyleInfo: {
    supportSystem: ExtractedField;
    transportation: ExtractedField;
    livingSituation: ExtractedField;
    complianceHistory: ExtractedField;
  };
}

export async function getExtractedData(patientId: string): Promise<ExtractedPatientData | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/calls/patient/${patientId}/extracted`);
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

export async function getPatientCalls(patientId: string): Promise<PatientCallRecord[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/calls/patient/${patientId}`);
    if (!response.ok) return [];
    return response.json();
  } catch {
    return [];
  }
}

export function getStatusLabel(status: CallStatus): string {
  switch (status) {
    case 'initiating':
      return 'Connecting...';
    case 'ringing':
      return 'Ringing...';
    case 'in_progress':
      return 'Call in progress';
    case 'ended':
      return 'Call completed';
    case 'failed':
      return 'Call failed';
    default:
      return 'Unknown';
  }
}

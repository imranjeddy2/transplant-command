// Frontend service for call API

const API_BASE_URL = 'http://localhost:3001/api';

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

export async function resetPatientDemo(patientId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/demo/reset/${patientId}`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Failed to reset patient demo');
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

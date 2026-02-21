// Backend-specific types for Vapi integration

export type VapiCallStatus = 'queued' | 'ringing' | 'in-progress' | 'forwarding' | 'ended';

export interface VapiCallResponse {
  id: string;
  orgId: string;
  createdAt: string;
  updatedAt: string;
  type: 'outboundPhoneCall';
  status: VapiCallStatus;
  endedReason?: string;
  phoneNumberId: string;
  assistantId: string;
  customer: {
    number: string;
  };
  transcript?: string;
  messages?: VapiMessage[];
  analysis?: VapiAnalysis;
  startedAt?: string;
  endedAt?: string;
}

export interface VapiMessage {
  role: 'assistant' | 'user' | 'system';
  message: string;
  time: number;
  secondsFromStart: number;
}

export interface VapiAnalysis {
  summary?: string;
  structuredData?: Record<string, unknown>;
}

export interface InitiateCallRequest {
  patientId: string;
  phoneNumber: string;
  patientName: string;
}

export interface InitiateCallResponse {
  callId: string;
  status: CallStatus;
}

export type CallStatus = 'initiating' | 'ringing' | 'in_progress' | 'ended' | 'failed';

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

export interface ExtractedField {
  value: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface StoredCall {
  callId: string;
  patientId: string;
  patientName: string;
  phoneNumber: string;
  status: CallStatus;
  vapiCallId: string;
  createdAt: string;
  startedAt?: string;
  endedAt?: string;
  transcript?: string;
  summary?: string;
  extractedData?: ExtractedCallData;
  error?: string;
}

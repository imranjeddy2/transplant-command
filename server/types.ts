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

export interface RiskFactorData {
  category: string;
  name: string;
  value: string;
  impact: 'high' | 'medium' | 'low';
  points: number;
  description: string;
}

export interface PatientRiskAssessment {
  level: 'HIGH' | 'MEDIUM' | 'LOW';
  totalScore: number;
  confidenceScore: number;
  factors: RiskFactorData[];
}

export interface PatientState {
  patientId: string;
  status: string;
  riskAssessment?: PatientRiskAssessment;
}

export interface FullExtractionResult extends ExtractedCallData {
  risk?: PatientRiskAssessment;
}

// UDAAP Compliance types
export type RiskCategory =
  | 'False Sense of Urgency'
  | 'No Barrier to Entry'
  | 'Omission of Conditions'
  | 'Guarantees'
  | 'Credit Deception'
  | 'Unsubstantiated Claims'
  | 'Puffery';

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TextStyle {
  textColor: string;
  backgroundColor: string;
  fontSize: 'small' | 'medium' | 'large' | 'xlarge';
  fontWeight: 'normal' | 'bold';
  textAlign: 'left' | 'center' | 'right';
}

export interface ComplianceIssue {
  id: number;
  severity: 'high' | 'medium' | 'low';
  category: 'Deceptive' | 'Unfair' | 'Abusive';
  riskCategory: RiskCategory;
  udaapReference: string;
  location: string;
  locationHint?: 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  boundingBox?: BoundingBox;
  textStyle?: TextStyle;
  excerpt: string;
  explanation: string;
  suggestion: string;
  proposedPhrase: string;
}

export interface ComplianceAnalysisResult {
  complianceScore: number;
  readingLevel: string;
  clarityScore: number;
  overallAssessment: string;
  issues: ComplianceIssue[];
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

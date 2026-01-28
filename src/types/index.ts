// Task Types
export type TaskStatus = 'review_needed' | 'in_progress' | 'completed' | 'pending' | 'cancelled';
export type TaskType = 'referral_review' | 'document_upload' | 'insurance_verification' | 'clinical_review';

export interface Task {
  id: string;
  patientId: string;
  patientName: string;
  type: TaskType;
  status: TaskStatus;
  description: string;
  createdAt: string;
  dueDate?: string;
  mrn: string;
  referringProvider?: string;
}

// Patient Types
export type PatientStatus =
  | 'referral_received'
  | 'under_review'
  | 'evaluation_scheduled'
  | 'evaluation_complete'
  | 'waitlisted'
  | 'transplanted'
  | 'inactive';

export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type DialysisType = 'Hemodialysis' | 'Peritoneal';

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  mrn: string;
  ssn?: string;
  phone?: string;
  email?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  status: PatientStatus;
  referralDate: string;

  // Clinical Data
  gfr?: number;
  creatinine?: number;
  bloodType?: BloodType;
  bmi?: number;
  primaryDiagnosis?: string;

  // Comorbidities
  diabetes?: boolean;
  hypertension?: boolean;
  previousTransplants?: number;

  // Dialysis
  onDialysis?: boolean;
  dialysisStartDate?: string;
  dialysisType?: DialysisType;

  // Providers
  referringProvider?: Provider;
  receivingProvider?: Provider;

  // Insurance
  insurance?: Insurance;
}

export interface Provider {
  name: string;
  organization: string;
  npi?: string;
  phone?: string;
  fax?: string;
  address?: string;
}

export interface Insurance {
  carrier: string;
  policyNumber: string;
  groupNumber?: string;
  authorizationStatus?: 'pending' | 'approved' | 'denied';
}

// Document Types
export interface Document {
  id: string;
  patientId: string;
  name: string;
  type: 'referral' | 'lab_results' | 'imaging' | 'consent' | 'insurance' | 'other';
  uploadedAt: string;
  pageCount?: number;
}

// Journey Types
export type JourneyStepStatus = 'completed' | 'in_progress' | 'pending';

export interface JourneySubStep {
  id: string;
  title: string;
  timestamp?: string;
  aiCompleted?: boolean;
}

export interface JourneyStep {
  id: string;
  title: string;
  status: JourneyStepStatus;
  timestamp?: string;
  aiCompleted?: boolean;
  subSteps?: JourneySubStep[];
}

// Extraction Types
export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface ExtractedField {
  value: string;
  confidence: ConfidenceLevel;
  edited?: boolean;
}

export interface ExtractionData {
  // Patient Info
  firstName: ExtractedField;
  lastName: ExtractedField;
  dateOfBirth: ExtractedField;
  ssn: ExtractedField;
  phone: ExtractedField;
  address: ExtractedField;

  // Clinical Data
  gfr: ExtractedField;
  creatinine: ExtractedField;
  bloodType: ExtractedField;
  bmi: ExtractedField;
  primaryDiagnosis: ExtractedField;

  // Comorbidities
  diabetes: ExtractedField;
  hypertension: ExtractedField;
  previousTransplants: ExtractedField;

  // Dialysis
  onDialysis: ExtractedField;
  dialysisStartDate: ExtractedField;
  dialysisType: ExtractedField;

  // Referring Provider
  referringProviderName: ExtractedField;
  referringOrganization: ExtractedField;
  referringNpi: ExtractedField;
  referringPhone: ExtractedField;
  referringFax: ExtractedField;

  // Receiving Provider
  receivingProviderName: ExtractedField;
  receivingOrganization: ExtractedField;
  receivingNpi: ExtractedField;

  // Insurance
  insuranceCarrier: ExtractedField;
  policyNumber: ExtractedField;
  groupNumber: ExtractedField;
}

// Analytics Types
export interface AnalyticsMetric {
  label: string;
  value: number;
  change?: number;
  changeLabel?: string;
}

export interface TrendDataPoint {
  month: string;
  referrals: number;
  evaluations: number;
}

export interface InsuranceBreakdown {
  carrier: string;
  count: number;
  percentage: number;
}

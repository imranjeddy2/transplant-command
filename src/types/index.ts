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

// Pre-Evaluation Types
export type PreEvaluationStatus = 'notified' | 'scheduled' | 'completed' | 'info_verified';

export interface MedicalHistoryInfo {
  previousSurgeries: ExtractedField;
  currentMedications: ExtractedField;
  allergies: ExtractedField;
  symptoms: ExtractedField;
}

export interface LifestyleInfo {
  supportSystem: ExtractedField;
  transportation: ExtractedField;
  livingSituation: ExtractedField;
  complianceHistory: ExtractedField;
}

export interface PreEvaluationData {
  id: string;
  patientId: string;
  status: PreEvaluationStatus;
  notifiedAt?: string;
  scheduledAt?: string;
  scheduledCallTime?: string;
  completedAt?: string;
  verifiedAt?: string;
  actualCallDuration?: number;
  medicalHistory?: MedicalHistoryInfo;
  lifestyleInfo?: LifestyleInfo;
  verifiedBy?: string;
  verificationNotes?: string;
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

// Scheduling Types
export interface TimeSlot {
  id: string;
  datetime: string;
  available: boolean;
}

export interface SchedulePatientData {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  preEvaluationId: string;
  centerId: string;
}

// Risk Assessment Types
export type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW';
export type RiskFactorCategory = 'cardiac' | 'diabetes' | 'dialysis' | 'sensitization' | 'cancer' | 'lifestyle' | 'compliance' | 'functional';

export interface RiskFactor {
  id: string;
  category: RiskFactorCategory;
  name: string;
  value: string;
  impact: 'high' | 'medium' | 'low';
  points: number;
  description: string;
}

export interface RiskAssessment {
  patientId: string;
  calculatedLevel: RiskLevel;
  overrideLevel?: RiskLevel;
  overrideReason?: string;
  overrideBy?: string;
  overrideAt?: string;
  totalScore: number;
  confidenceScore: number;
  factors: RiskFactor[];
  createdAt: string;
}

// Risk Analytics Types
export interface RiskDistribution {
  high: number;
  medium: number;
  low: number;
}

export interface VariableImportance {
  variable: string;
  importance: number;
  category: string;
}

export interface RiskAnalyticsData {
  distribution: RiskDistribution;
  variableImportance: VariableImportance[];
  modelConfidence: number;
  totalAssessed: number;
}

// Model Performance Analytics
export interface ModelPerformanceMetric {
  name: string;
  technicalName: string;
  value: number;
  benchmark: number;
  description: string;
}

export interface ModelPerformanceData {
  metrics: ModelPerformanceMetric[];
  validationInfo: {
    sampleSize: number;
    validationPeriod: string;
    lastUpdated: string;
  };
}

// Calibration Analytics
export interface CalibrationDecile {
  predictedRisk: number;
  actualOutcomes: number;
  patientCount: number;
}

export interface CalibrationData {
  deciles: CalibrationDecile[];
  interpretation: string;
}

// Risk Distribution Histogram
export interface RiskHistogramBin {
  scoreRange: string;
  scoreMidpoint: number;
  count: number;
  percentage: number;
}

export interface RiskDistributionData {
  histogram: RiskHistogramBin[];
  thresholds: { lowToMedium: number; mediumToHigh: number };
  statistics: { mean: number; median: number; standardDeviation: number };
}

// Outcome Tracking
export interface MonthlyOutcome {
  month: string;
  predictedHighRisk: number;
  actualComplications: number;
  truePositives: number;
}

export interface OutcomeTrackingData {
  monthly: MonthlyOutcome[];
  aggregate: {
    overallAccuracy: number;
    trend: 'improving' | 'stable' | 'declining';
  };
}

// Call Transcript
export interface PatientCall {
  id: string;
  patientId: string;
  date: string;
  duration: number;
  coordinator: string;
  status: 'completed' | 'scheduled' | 'cancelled' | 'missed';
  transcript?: string;
  summary?: string;
}

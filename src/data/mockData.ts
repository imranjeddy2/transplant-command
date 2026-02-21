import type {
  Patient,
  Task,
  Document,
  JourneyStep,
  ExtractionData,
  TrendDataPoint,
  InsuranceBreakdown,
  PreEvaluationData,
  TimeSlot,
  SchedulePatientData,
  MedicalHistoryInfo,
  LifestyleInfo,
  RiskAssessment,
  RiskAnalyticsData,
  ModelPerformanceData,
  CalibrationData,
  RiskDistributionData,
  OutcomeTrackingData,
  PatientCall,
} from '@/types';

// Helper to generate dates
const daysAgo = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
};

const hoursAgo = (hours: number): string => {
  const date = new Date();
  date.setHours(date.getHours() - hours);
  return date.toISOString();
};

// Mock Patients (15 records)
export const patients: Patient[] = [
  {
    id: 'p-manpreet-vapi',
    firstName: 'Manpreet',
    lastName: 'Vapi',
    dateOfBirth: '1975-04-12',
    mrn: 'MRN-2024-016',
    phone: '(555) 600-0001',
    status: 'evaluation_scheduled',
    referralDate: daysAgo(3),
    gfr: 19,
    creatinine: 4.0,
    bloodType: 'B+',
    bmi: 25.2,
    primaryDiagnosis: 'CKD Stage 5 - Hypertensive Nephropathy',
    diabetes: false,
    hypertension: true,
    previousTransplants: 0,
    onDialysis: true,
    dialysisStartDate: '2023-09-01',
    dialysisType: 'Hemodialysis',
    referringProvider: {
      name: 'Dr. Anika Patel',
      organization: 'South Asian Nephrology Group',
      phone: '(555) 600-0002',
    },
    insurance: {
      carrier: 'United Healthcare',
      policyNumber: 'UHC-999888777',
      authorizationStatus: 'pending',
    },
  },
  {
    id: 'p-manpreet-retell',
    firstName: 'Manpreet',
    lastName: 'Retell',
    dateOfBirth: '1975-04-12',
    mrn: 'MRN-2024-017',
    phone: '(555) 600-0003',
    status: 'evaluation_scheduled',
    referralDate: daysAgo(3),
    gfr: 19,
    creatinine: 4.0,
    bloodType: 'B+',
    bmi: 25.2,
    primaryDiagnosis: 'CKD Stage 5 - Hypertensive Nephropathy',
    diabetes: false,
    hypertension: true,
    previousTransplants: 0,
    onDialysis: true,
    dialysisStartDate: '2023-09-01',
    dialysisType: 'Hemodialysis',
    referringProvider: {
      name: 'Dr. Anika Patel',
      organization: 'South Asian Nephrology Group',
      phone: '(555) 600-0002',
    },
    insurance: {
      carrier: 'United Healthcare',
      policyNumber: 'UHC-999888777',
      authorizationStatus: 'pending',
    },
  },
  {
    id: 'p-001',
    firstName: 'John',
    lastName: 'Smith',
    dateOfBirth: '1958-03-15',
    mrn: 'MRN-2024-001',
    phone: '(555) 123-4567',
    email: 'john.smith@email.com',
    address: {
      street: '123 Oak Street',
      city: 'Chicago',
      state: 'IL',
      zip: '60601',
    },
    status: 'under_review',
    referralDate: daysAgo(2),
    gfr: 18,
    creatinine: 4.2,
    bloodType: 'O+',
    bmi: 26.5,
    primaryDiagnosis: 'CKD Stage 5 - Diabetic Nephropathy',
    diabetes: true,
    hypertension: true,
    previousTransplants: 0,
    onDialysis: true,
    dialysisStartDate: '2023-06-15',
    dialysisType: 'Hemodialysis',
    referringProvider: {
      name: 'Dr. Sarah Johnson',
      organization: 'Midwest Nephrology Associates',
      npi: '1234567890',
      phone: '(555) 234-5678',
      fax: '(555) 234-5679',
    },
    receivingProvider: {
      name: 'Dr. Michael Chen',
      organization: 'University Transplant Center',
      npi: '0987654321',
    },
    insurance: {
      carrier: 'Blue Cross Blue Shield',
      policyNumber: 'BCBS-789456123',
      groupNumber: 'GRP-445566',
      authorizationStatus: 'pending',
    },
  },
  {
    id: 'p-002',
    firstName: 'Jane',
    lastName: 'Doe',
    dateOfBirth: '1965-07-22',
    mrn: 'MRN-2024-002',
    phone: '(555) 234-5678',
    status: 'evaluation_scheduled',
    referralDate: daysAgo(7),
    gfr: 22,
    creatinine: 3.8,
    bloodType: 'A+',
    bmi: 24.1,
    primaryDiagnosis: 'ESRD - Polycystic Kidney Disease',
    diabetes: false,
    hypertension: true,
    previousTransplants: 0,
    onDialysis: true,
    dialysisStartDate: '2022-11-01',
    dialysisType: 'Peritoneal',
    referringProvider: {
      name: 'Dr. Robert Williams',
      organization: 'Lakeside Medical Group',
      npi: '2345678901',
    },
    insurance: {
      carrier: 'Aetna',
      policyNumber: 'AET-123456789',
      authorizationStatus: 'approved',
    },
  },
  {
    id: 'p-003',
    firstName: 'Robert',
    lastName: 'Johnson',
    dateOfBirth: '1972-11-08',
    mrn: 'MRN-2024-003',
    phone: '(555) 345-6789',
    status: 'referral_received',
    referralDate: daysAgo(1),
    gfr: 15,
    creatinine: 5.1,
    bloodType: 'B+',
    bmi: 28.3,
    primaryDiagnosis: 'CKD Stage 5',
    diabetes: true,
    hypertension: true,
    previousTransplants: 0,
    onDialysis: false,
    referringProvider: {
      name: 'Dr. Emily Davis',
      organization: 'Metro Kidney Care',
      npi: '3456789012',
    },
    insurance: {
      carrier: 'UnitedHealthcare',
      policyNumber: 'UHC-987654321',
      authorizationStatus: 'pending',
    },
  },
  {
    id: 'p-004',
    firstName: 'Maria',
    lastName: 'Garcia',
    dateOfBirth: '1980-04-30',
    mrn: 'MRN-2024-004',
    phone: '(555) 456-7890',
    status: 'evaluation_complete',
    referralDate: daysAgo(21),
    gfr: 12,
    creatinine: 6.2,
    bloodType: 'AB+',
    bmi: 23.7,
    primaryDiagnosis: 'ESRD - Lupus Nephritis',
    diabetes: false,
    hypertension: true,
    previousTransplants: 0,
    onDialysis: true,
    dialysisStartDate: '2023-01-15',
    dialysisType: 'Hemodialysis',
    insurance: {
      carrier: 'Cigna',
      policyNumber: 'CIG-456789123',
      authorizationStatus: 'approved',
    },
  },
  {
    id: 'p-005',
    firstName: 'William',
    lastName: 'Brown',
    dateOfBirth: '1955-09-12',
    mrn: 'MRN-2024-005',
    phone: '(555) 567-8901',
    status: 'waitlisted',
    referralDate: daysAgo(45),
    gfr: 10,
    creatinine: 7.1,
    bloodType: 'O-',
    bmi: 25.9,
    primaryDiagnosis: 'ESRD - Hypertensive Nephrosclerosis',
    diabetes: false,
    hypertension: true,
    previousTransplants: 0,
    onDialysis: true,
    dialysisStartDate: '2022-05-20',
    dialysisType: 'Hemodialysis',
    insurance: {
      carrier: 'Medicare',
      policyNumber: 'MCR-111222333',
      authorizationStatus: 'approved',
    },
  },
  {
    id: 'p-006',
    firstName: 'Patricia',
    lastName: 'Davis',
    dateOfBirth: '1968-12-03',
    mrn: 'MRN-2024-006',
    phone: '(555) 678-9012',
    status: 'under_review',
    referralDate: daysAgo(3),
    gfr: 19,
    creatinine: 4.0,
    bloodType: 'A-',
    bmi: 27.2,
    primaryDiagnosis: 'CKD Stage 4 - IgA Nephropathy',
    diabetes: false,
    hypertension: true,
    previousTransplants: 0,
    onDialysis: false,
    insurance: {
      carrier: 'Blue Cross Blue Shield',
      policyNumber: 'BCBS-222333444',
      authorizationStatus: 'pending',
    },
  },
  {
    id: 'p-007',
    firstName: 'James',
    lastName: 'Wilson',
    dateOfBirth: '1975-06-18',
    mrn: 'MRN-2024-007',
    phone: '(555) 789-0123',
    status: 'referral_received',
    referralDate: daysAgo(0),
    gfr: 25,
    creatinine: 3.2,
    bloodType: 'B-',
    bmi: 29.8,
    primaryDiagnosis: 'CKD Stage 4',
    diabetes: true,
    hypertension: true,
    previousTransplants: 0,
    onDialysis: false,
    insurance: {
      carrier: 'Aetna',
      policyNumber: 'AET-333444555',
      authorizationStatus: 'pending',
    },
  },
  {
    id: 'p-008',
    firstName: 'Linda',
    lastName: 'Martinez',
    dateOfBirth: '1962-02-25',
    mrn: 'MRN-2024-008',
    phone: '(555) 890-1234',
    status: 'evaluation_scheduled',
    referralDate: daysAgo(10),
    gfr: 14,
    creatinine: 5.5,
    bloodType: 'O+',
    bmi: 24.5,
    primaryDiagnosis: 'ESRD - Diabetic Nephropathy',
    diabetes: true,
    hypertension: true,
    previousTransplants: 1,
    onDialysis: true,
    dialysisStartDate: '2021-08-10',
    dialysisType: 'Hemodialysis',
    insurance: {
      carrier: 'UnitedHealthcare',
      policyNumber: 'UHC-444555666',
      authorizationStatus: 'approved',
    },
  },
  {
    id: 'p-009',
    firstName: 'David',
    lastName: 'Anderson',
    dateOfBirth: '1970-08-07',
    mrn: 'MRN-2024-009',
    phone: '(555) 901-2345',
    status: 'transplanted',
    referralDate: daysAgo(90),
    gfr: 45,
    creatinine: 1.8,
    bloodType: 'A+',
    bmi: 26.1,
    primaryDiagnosis: 'Post-Transplant',
    diabetes: false,
    hypertension: false,
    previousTransplants: 1,
    onDialysis: false,
    insurance: {
      carrier: 'Cigna',
      policyNumber: 'CIG-555666777',
      authorizationStatus: 'approved',
    },
  },
  {
    id: 'p-010',
    firstName: 'Susan',
    lastName: 'Taylor',
    dateOfBirth: '1978-01-14',
    mrn: 'MRN-2024-010',
    phone: '(555) 012-3456',
    status: 'under_review',
    referralDate: daysAgo(4),
    gfr: 16,
    creatinine: 4.8,
    bloodType: 'AB-',
    bmi: 22.9,
    primaryDiagnosis: 'CKD Stage 5 - FSGS',
    diabetes: false,
    hypertension: true,
    previousTransplants: 0,
    onDialysis: true,
    dialysisStartDate: '2024-01-05',
    dialysisType: 'Peritoneal',
    insurance: {
      carrier: 'Blue Cross Blue Shield',
      policyNumber: 'BCBS-666777888',
      authorizationStatus: 'pending',
    },
  },
  {
    id: 'p-011',
    firstName: 'Michael',
    lastName: 'Thomas',
    dateOfBirth: '1959-05-21',
    mrn: 'MRN-2024-011',
    phone: '(555) 111-2222',
    status: 'inactive',
    referralDate: daysAgo(60),
    gfr: 20,
    creatinine: 3.9,
    bloodType: 'O+',
    bmi: 31.2,
    primaryDiagnosis: 'CKD Stage 4',
    diabetes: true,
    hypertension: true,
    previousTransplants: 0,
    onDialysis: false,
    insurance: {
      carrier: 'Medicare',
      policyNumber: 'MCR-777888999',
      authorizationStatus: 'denied',
    },
  },
  {
    id: 'p-012',
    firstName: 'Elizabeth',
    lastName: 'Jackson',
    dateOfBirth: '1983-10-09',
    mrn: 'MRN-2024-012',
    phone: '(555) 222-3333',
    status: 'referral_received',
    referralDate: daysAgo(1),
    gfr: 21,
    creatinine: 3.6,
    bloodType: 'B+',
    bmi: 25.4,
    primaryDiagnosis: 'CKD Stage 4 - Chronic Glomerulonephritis',
    diabetes: false,
    hypertension: true,
    previousTransplants: 0,
    onDialysis: false,
    insurance: {
      carrier: 'Aetna',
      policyNumber: 'AET-888999000',
      authorizationStatus: 'pending',
    },
  },
  {
    id: 'p-013',
    firstName: 'Richard',
    lastName: 'White',
    dateOfBirth: '1967-07-16',
    mrn: 'MRN-2024-013',
    phone: '(555) 333-4444',
    status: 'evaluation_complete',
    referralDate: daysAgo(28),
    gfr: 11,
    creatinine: 6.8,
    bloodType: 'A+',
    bmi: 27.8,
    primaryDiagnosis: 'ESRD - Diabetic Nephropathy',
    diabetes: true,
    hypertension: true,
    previousTransplants: 0,
    onDialysis: true,
    dialysisStartDate: '2023-03-20',
    dialysisType: 'Hemodialysis',
    insurance: {
      carrier: 'UnitedHealthcare',
      policyNumber: 'UHC-999000111',
      authorizationStatus: 'approved',
    },
  },
  {
    id: 'p-014',
    firstName: 'Jennifer',
    lastName: 'Harris',
    dateOfBirth: '1974-03-28',
    mrn: 'MRN-2024-014',
    phone: '(555) 444-5555',
    status: 'waitlisted',
    referralDate: daysAgo(35),
    gfr: 9,
    creatinine: 7.5,
    bloodType: 'O-',
    bmi: 23.2,
    primaryDiagnosis: 'ESRD - Polycystic Kidney Disease',
    diabetes: false,
    hypertension: true,
    previousTransplants: 0,
    onDialysis: true,
    dialysisStartDate: '2022-09-15',
    dialysisType: 'Hemodialysis',
    insurance: {
      carrier: 'Cigna',
      policyNumber: 'CIG-000111222',
      authorizationStatus: 'approved',
    },
  },
  {
    id: 'p-015',
    firstName: 'Charles',
    lastName: 'Clark',
    dateOfBirth: '1960-11-30',
    mrn: 'MRN-2024-015',
    phone: '(555) 555-6666',
    status: 'under_review',
    referralDate: daysAgo(5),
    gfr: 17,
    creatinine: 4.4,
    bloodType: 'B-',
    bmi: 28.9,
    primaryDiagnosis: 'CKD Stage 5',
    diabetes: true,
    hypertension: true,
    previousTransplants: 0,
    onDialysis: true,
    dialysisStartDate: '2024-02-01',
    dialysisType: 'Hemodialysis',
    insurance: {
      carrier: 'Blue Cross Blue Shield',
      policyNumber: 'BCBS-111222333',
      authorizationStatus: 'pending',
    },
  },
];

// Mock Tasks (18 records)
export const tasks: Task[] = [
  {
    id: 't-001',
    patientId: 'p-001',
    patientName: 'John Smith',
    type: 'referral_review',
    status: 'review_needed',
    description: 'Review referral packet and verify AI extractions',
    createdAt: hoursAgo(2),
    mrn: 'MRN-2024-001',
    referringProvider: 'Dr. Sarah Johnson',
  },
  {
    id: 't-002',
    patientId: 'p-003',
    patientName: 'Robert Johnson',
    type: 'referral_review',
    status: 'review_needed',
    description: 'New referral packet received - pending review',
    createdAt: hoursAgo(4),
    mrn: 'MRN-2024-003',
    referringProvider: 'Dr. Emily Davis',
  },
  {
    id: 't-003',
    patientId: 'p-007',
    patientName: 'James Wilson',
    type: 'referral_review',
    status: 'review_needed',
    description: 'Urgent referral - review required',
    createdAt: hoursAgo(1),
    mrn: 'MRN-2024-007',
    referringProvider: 'Dr. Thomas Lee',
  },
  {
    id: 't-004',
    patientId: 'p-012',
    patientName: 'Elizabeth Jackson',
    type: 'referral_review',
    status: 'review_needed',
    description: 'Review referral packet',
    createdAt: hoursAgo(6),
    mrn: 'MRN-2024-012',
    referringProvider: 'Dr. Karen Brown',
  },
  {
    id: 't-005',
    patientId: 'p-006',
    patientName: 'Patricia Davis',
    type: 'insurance_verification',
    status: 'in_progress',
    description: 'Verify insurance authorization status',
    createdAt: hoursAgo(8),
    mrn: 'MRN-2024-006',
  },
  {
    id: 't-006',
    patientId: 'p-010',
    patientName: 'Susan Taylor',
    type: 'clinical_review',
    status: 'in_progress',
    description: 'Complete clinical data review',
    createdAt: hoursAgo(12),
    mrn: 'MRN-2024-010',
  },
  {
    id: 't-007',
    patientId: 'p-015',
    patientName: 'Charles Clark',
    type: 'document_upload',
    status: 'in_progress',
    description: 'Request missing lab results',
    createdAt: hoursAgo(24),
    mrn: 'MRN-2024-015',
  },
  {
    id: 't-008',
    patientId: 'p-002',
    patientName: 'Jane Doe',
    type: 'clinical_review',
    status: 'completed',
    description: 'Clinical evaluation review completed',
    createdAt: hoursAgo(48),
    mrn: 'MRN-2024-002',
  },
  {
    id: 't-009',
    patientId: 'p-004',
    patientName: 'Maria Garcia',
    type: 'referral_review',
    status: 'completed',
    description: 'Referral review completed',
    createdAt: hoursAgo(72),
    mrn: 'MRN-2024-004',
  },
  {
    id: 't-010',
    patientId: 'p-008',
    patientName: 'Linda Martinez',
    type: 'insurance_verification',
    status: 'completed',
    description: 'Insurance authorization verified',
    createdAt: hoursAgo(96),
    mrn: 'MRN-2024-008',
  },
  {
    id: 't-011',
    patientId: 'p-005',
    patientName: 'William Brown',
    type: 'referral_review',
    status: 'completed',
    description: 'Referral review completed',
    createdAt: hoursAgo(120),
    mrn: 'MRN-2024-005',
  },
  {
    id: 't-012',
    patientId: 'p-013',
    patientName: 'Richard White',
    type: 'clinical_review',
    status: 'completed',
    description: 'Clinical review completed',
    createdAt: hoursAgo(144),
    mrn: 'MRN-2024-013',
  },
  {
    id: 't-013',
    patientId: 'p-014',
    patientName: 'Jennifer Harris',
    type: 'referral_review',
    status: 'completed',
    description: 'Referral processing completed',
    createdAt: hoursAgo(168),
    mrn: 'MRN-2024-014',
  },
  {
    id: 't-014',
    patientId: 'p-001',
    patientName: 'John Smith',
    type: 'insurance_verification',
    status: 'pending',
    description: 'Pending insurance verification',
    createdAt: hoursAgo(3),
    dueDate: daysAgo(-2),
    mrn: 'MRN-2024-001',
  },
  {
    id: 't-015',
    patientId: 'p-011',
    patientName: 'Michael Thomas',
    type: 'referral_review',
    status: 'cancelled',
    description: 'Referral cancelled - patient declined',
    createdAt: hoursAgo(200),
    mrn: 'MRN-2024-011',
  },
  {
    id: 't-016',
    patientId: 'p-006',
    patientName: 'Patricia Davis',
    type: 'referral_review',
    status: 'review_needed',
    description: 'Additional documents received - re-review needed',
    createdAt: hoursAgo(5),
    mrn: 'MRN-2024-006',
    referringProvider: 'Dr. James Miller',
  },
  {
    id: 't-017',
    patientId: 'p-010',
    patientName: 'Susan Taylor',
    type: 'referral_review',
    status: 'review_needed',
    description: 'Review updated referral information',
    createdAt: hoursAgo(7),
    mrn: 'MRN-2024-010',
    referringProvider: 'Dr. Nancy Wilson',
  },
  {
    id: 't-018',
    patientId: 'p-015',
    patientName: 'Charles Clark',
    type: 'referral_review',
    status: 'review_needed',
    description: 'Initial referral review pending',
    createdAt: hoursAgo(10),
    mrn: 'MRN-2024-015',
    referringProvider: 'Dr. Paul Anderson',
  },
];

// Mock Documents
export const documents: Document[] = [
  {
    id: 'd-001',
    patientId: 'p-001',
    name: 'Referral Packet - John Smith',
    type: 'referral',
    uploadedAt: hoursAgo(2),
    pageCount: 4,
  },
  {
    id: 'd-002',
    patientId: 'p-001',
    name: 'Lab Results - January 2024',
    type: 'lab_results',
    uploadedAt: hoursAgo(24),
    pageCount: 2,
  },
  {
    id: 'd-003',
    patientId: 'p-002',
    name: 'Referral Packet - Jane Doe',
    type: 'referral',
    uploadedAt: hoursAgo(168),
    pageCount: 3,
  },
  {
    id: 'd-004',
    patientId: 'p-002',
    name: 'Insurance Authorization',
    type: 'insurance',
    uploadedAt: hoursAgo(120),
    pageCount: 1,
  },
];

// Pre-Evaluation data for advanced patients (evaluation_scheduled, evaluation_complete, waitlisted, transplanted)
export const patientPreEvaluations: Record<string, PreEvaluationData> = {
  // p-001: John Smith - under_review (pre-eval completed)
  'p-001': {
    id: 'pe-001',
    patientId: 'p-001',
    status: 'info_verified',
    notifiedAt: hoursAgo(48),
    scheduledAt: hoursAgo(46),
    scheduledCallTime: hoursAgo(24),
    completedAt: hoursAgo(24),
    verifiedAt: hoursAgo(20),
    actualCallDuration: 18,
    medicalHistory: {
      previousSurgeries: { value: 'Coronary stent placement (2021), Laser eye treatment for retinopathy (2019)', confidence: 'high' },
      currentMedications: { value: 'Metformin 1000mg twice daily, Lisinopril 20mg daily, Carvedilol 25mg twice daily, Aspirin 81mg daily, Insulin glargine 30 units nightly', confidence: 'high' },
      allergies: { value: 'No known drug allergies', confidence: 'high' },
      symptoms: { value: 'Neuropathy in feet, fatigue, occasional chest discomfort with exertion', confidence: 'high' },
    },
    lifestyleInfo: {
      supportSystem: { value: 'Wife works full-time, alone during day, limited family nearby', confidence: 'medium' },
      transportation: { value: 'Can drive himself, wife available evenings/weekends', confidence: 'high' },
      livingSituation: { value: 'Two-story home, bedroom upstairs, considering moving to first floor', confidence: 'high' },
      complianceHistory: { value: 'Generally good, occasionally misses evening medications when tired', confidence: 'medium' },
    },
    verifiedBy: 'Coordinator Sarah Miller',
    verificationNotes: 'Patient has significant cardiac history. Cardiology clearance recommended before transplant listing.',
  },

  // p-002: Jane Doe - evaluation_scheduled (pre-eval completed)
  'p-002': {
    id: 'pe-002',
    patientId: 'p-002',
    status: 'info_verified',
    notifiedAt: hoursAgo(150),
    scheduledAt: hoursAgo(145),
    scheduledCallTime: hoursAgo(140),
    completedAt: hoursAgo(140),
    verifiedAt: hoursAgo(135),
    actualCallDuration: 22,
    medicalHistory: {
      previousSurgeries: { value: 'Appendectomy (2010), Cyst removal (2018)', confidence: 'high' },
      currentMedications: { value: 'Lisinopril 10mg daily, Amlodipine 5mg daily, Epoetin alfa weekly', confidence: 'high' },
      allergies: { value: 'Penicillin - rash', confidence: 'high' },
      symptoms: { value: 'Fatigue, occasional nausea, mild swelling in ankles', confidence: 'medium' },
    },
    lifestyleInfo: {
      supportSystem: { value: 'Lives with spouse, adult children nearby', confidence: 'high' },
      transportation: { value: 'Has personal vehicle, spouse can drive', confidence: 'high' },
      livingSituation: { value: 'Single-story home, no accessibility issues', confidence: 'high' },
      complianceHistory: { value: 'Excellent medication adherence, attends all dialysis appointments', confidence: 'high' },
    },
    verifiedBy: 'Coordinator Sarah Miller',
    verificationNotes: 'All information verified. Patient is well-prepared for evaluation.',
  },

  // p-004: Maria Garcia - evaluation_complete (pre-eval completed)
  'p-004': {
    id: 'pe-004',
    patientId: 'p-004',
    status: 'info_verified',
    notifiedAt: hoursAgo(450),
    scheduledAt: hoursAgo(440),
    scheduledCallTime: hoursAgo(420),
    completedAt: hoursAgo(420),
    verifiedAt: hoursAgo(410),
    actualCallDuration: 28,
    medicalHistory: {
      previousSurgeries: { value: 'None', confidence: 'high' },
      currentMedications: { value: 'Prednisone 5mg daily, Hydroxychloroquine 200mg twice daily, Tacrolimus 2mg twice daily', confidence: 'high' },
      allergies: { value: 'No known allergies', confidence: 'high' },
      symptoms: { value: 'Joint pain (managed), fatigue, occasional headaches', confidence: 'high' },
    },
    lifestyleInfo: {
      supportSystem: { value: 'Lives with parents, strong family support network', confidence: 'high' },
      transportation: { value: 'Family members available for transportation', confidence: 'high' },
      livingSituation: { value: 'Two-story home, bedroom on first floor available', confidence: 'high' },
      complianceHistory: { value: 'Excellent compliance with lupus treatment regimen', confidence: 'high' },
    },
    verifiedBy: 'Coordinator James Wilson',
    verificationNotes: 'Patient very engaged and informed about transplant process.',
  },

  // p-005: William Brown - waitlisted (pre-eval completed)
  'p-005': {
    id: 'pe-005',
    patientId: 'p-005',
    status: 'info_verified',
    notifiedAt: hoursAgo(950),
    scheduledAt: hoursAgo(940),
    scheduledCallTime: hoursAgo(920),
    completedAt: hoursAgo(920),
    verifiedAt: hoursAgo(910),
    actualCallDuration: 25,
    medicalHistory: {
      previousSurgeries: { value: 'Knee replacement (2019)', confidence: 'high' },
      currentMedications: { value: 'Carvedilol 25mg twice daily, Furosemide 40mg daily, Calcium acetate with meals', confidence: 'high' },
      allergies: { value: 'Sulfa drugs - hives', confidence: 'high' },
      symptoms: { value: 'Shortness of breath with exertion, leg cramps during dialysis', confidence: 'medium' },
    },
    lifestyleInfo: {
      supportSystem: { value: 'Lives with wife, daughter visits weekly', confidence: 'high' },
      transportation: { value: 'Wife drives, also uses medical transport for dialysis', confidence: 'high' },
      livingSituation: { value: 'Ranch-style home, fully accessible', confidence: 'high' },
      complianceHistory: { value: 'Good compliance, occasionally misses evening medications', confidence: 'medium' },
    },
    verifiedBy: 'Coordinator Sarah Miller',
    verificationNotes: 'Discussed importance of medication timing. Patient committed to improvement.',
  },

  // p-008: Linda Martinez - evaluation_scheduled (pre-eval scheduled, not yet completed)
  'p-008': {
    id: 'pe-008',
    patientId: 'p-008',
    status: 'scheduled',
    notifiedAt: hoursAgo(100),
    scheduledAt: hoursAgo(95),
    scheduledCallTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
  },

  // p-009: David Anderson - transplanted (pre-eval completed)
  'p-009': {
    id: 'pe-009',
    patientId: 'p-009',
    status: 'info_verified',
    notifiedAt: hoursAgo(2100),
    scheduledAt: hoursAgo(2090),
    scheduledCallTime: hoursAgo(2050),
    completedAt: hoursAgo(2050),
    verifiedAt: hoursAgo(2040),
    actualCallDuration: 20,
    medicalHistory: {
      previousSurgeries: { value: 'Hernia repair (2005)', confidence: 'high' },
      currentMedications: { value: 'Lisinopril 5mg daily (at time of call)', confidence: 'high' },
      allergies: { value: 'No known allergies', confidence: 'high' },
      symptoms: { value: 'Mild fatigue, no other significant symptoms', confidence: 'high' },
    },
    lifestyleInfo: {
      supportSystem: { value: 'Lives with wife and teenage son', confidence: 'high' },
      transportation: { value: 'Has own vehicle, flexible work schedule', confidence: 'high' },
      livingSituation: { value: 'Two-story home, no accessibility concerns', confidence: 'high' },
      complianceHistory: { value: 'Excellent compliance history', confidence: 'high' },
    },
    verifiedBy: 'Coordinator James Wilson',
    verificationNotes: 'Ideal candidate. Strong support system and excellent health literacy.',
  },

  // p-013: Richard White - evaluation_complete (pre-eval completed)
  'p-013': {
    id: 'pe-013',
    patientId: 'p-013',
    status: 'info_verified',
    notifiedAt: hoursAgo(550),
    scheduledAt: hoursAgo(540),
    scheduledCallTime: hoursAgo(520),
    completedAt: hoursAgo(520),
    verifiedAt: hoursAgo(510),
    actualCallDuration: 30,
    medicalHistory: {
      previousSurgeries: { value: 'Coronary stent placement (2020), Cataract surgery (2022)', confidence: 'high' },
      currentMedications: { value: 'Metformin 1000mg twice daily, Insulin glargine 20 units nightly, Atorvastatin 40mg daily, Aspirin 81mg daily', confidence: 'high' },
      allergies: { value: 'Contrast dye - requires premedication', confidence: 'high' },
      symptoms: { value: 'Neuropathy in feet, vision changes (managed), fatigue', confidence: 'high' },
    },
    lifestyleInfo: {
      supportSystem: { value: 'Lives alone, sister nearby, church community support', confidence: 'high' },
      transportation: { value: 'No longer drives, relies on sister and church members', confidence: 'medium' },
      livingSituation: { value: 'Ground floor apartment, accessible', confidence: 'high' },
      complianceHistory: { value: 'Good compliance, uses pill organizer and phone reminders', confidence: 'high' },
    },
    verifiedBy: 'Coordinator Sarah Miller',
    verificationNotes: 'Transportation plan confirmed with sister. Social worker notified for additional support assessment.',
  },

  // p-014: Jennifer Harris - waitlisted (pre-eval completed)
  'p-014': {
    id: 'pe-014',
    patientId: 'p-014',
    status: 'info_verified',
    notifiedAt: hoursAgo(750),
    scheduledAt: hoursAgo(740),
    scheduledCallTime: hoursAgo(720),
    completedAt: hoursAgo(720),
    verifiedAt: hoursAgo(710),
    actualCallDuration: 24,
    medicalHistory: {
      previousSurgeries: { value: 'C-section (2008), Laparoscopic cyst removal (2015)', confidence: 'high' },
      currentMedications: { value: 'Sevelamer 800mg three times daily with meals, Calcitriol 0.25mcg daily, Iron supplements', confidence: 'high' },
      allergies: { value: 'Shellfish - anaphylaxis', confidence: 'high' },
      symptoms: { value: 'Abdominal discomfort from enlarged kidneys, back pain', confidence: 'high' },
    },
    lifestyleInfo: {
      supportSystem: { value: 'Lives with husband and two children (ages 16, 14)', confidence: 'high' },
      transportation: { value: 'Has vehicle, husband has flexible job', confidence: 'high' },
      livingSituation: { value: 'Two-story home, considering first-floor bedroom conversion', confidence: 'high' },
      complianceHistory: { value: 'Excellent compliance, very proactive about health management', confidence: 'high' },
    },
    verifiedBy: 'Coordinator James Wilson',
    verificationNotes: 'Very motivated patient. Family fully supportive of transplant journey.',
  },
};

// Helper to get pre-evaluation by patient ID
export function getPreEvaluationByPatientId(patientId: string): PreEvaluationData | null {
  return patientPreEvaluations[patientId] || null;
}

// Get all pre-evaluations as a list for dashboard
export function getAllPreEvaluations(): Array<PreEvaluationData & { patientName: string; mrn: string }> {
  return Object.values(patientPreEvaluations).map((preEval) => {
    const patient = getPatientById(preEval.patientId);
    return {
      ...preEval,
      patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown',
      mrn: patient?.mrn || '',
    };
  });
}

// Journey data for all patients - mapped by patient ID
export const patientJourneys: Record<string, JourneyStep[]> = {
  // p-001: John Smith - under_review (Human Verification in progress)
  'p-001': [
    {
      id: 'j-001',
      title: 'Referral Packet Received',
      status: 'completed',
      timestamp: hoursAgo(2),
      aiCompleted: true,
      subSteps: [
        { id: 'js-001-1', title: 'Document classified as kidney transplant referral', timestamp: hoursAgo(2), aiCompleted: true },
        { id: 'js-001-2', title: 'Missing data identified: Insurance Group Number', timestamp: hoursAgo(2), aiCompleted: true },
        { id: 'js-001-3', title: 'Patient matched to existing MRN', timestamp: hoursAgo(2), aiCompleted: true },
      ],
    },
    {
      id: 'j-002',
      title: 'AI Data Extraction',
      status: 'completed',
      timestamp: hoursAgo(2),
      aiCompleted: true,
      subSteps: [
        { id: 'js-002-1', title: 'Demographics extracted (High confidence)', timestamp: hoursAgo(2), aiCompleted: true },
        { id: 'js-002-2', title: 'Clinical values extracted (High confidence)', timestamp: hoursAgo(2), aiCompleted: true },
        { id: 'js-002-3', title: 'Provider information extracted (Medium confidence)', timestamp: hoursAgo(2), aiCompleted: true },
      ],
    },
    { id: 'j-003', title: 'Human Verification', status: 'in_progress', subSteps: [{ id: 'js-003-1', title: 'Awaiting coordinator review' }] },
    { id: 'j-004', title: 'Insurance Verification', status: 'pending' },
    { id: 'j-005', title: 'Pre-Evaluation (AI Voice)', status: 'pending' },
    { id: 'j-006', title: 'Clinical Evaluation', status: 'pending' },
    { id: 'j-007', title: 'Committee Review', status: 'pending' },
    { id: 'j-008', title: 'Synced to EMR', status: 'pending' },
  ],

  // p-002: Jane Doe - evaluation_scheduled (Clinical Evaluation in progress)
  'p-002': [
    { id: 'j-001', title: 'Referral Packet Received', status: 'completed', timestamp: hoursAgo(168), aiCompleted: true },
    { id: 'j-002', title: 'AI Data Extraction', status: 'completed', timestamp: hoursAgo(167), aiCompleted: true },
    { id: 'j-003', title: 'Human Verification', status: 'completed', timestamp: hoursAgo(160) },
    { id: 'j-004', title: 'Insurance Verification', status: 'completed', timestamp: hoursAgo(120), subSteps: [{ id: 'js-004-1', title: 'Aetna authorization approved' }] },
    { id: 'j-005', title: 'Pre-Evaluation (AI Voice)', status: 'completed', timestamp: hoursAgo(135), aiCompleted: true, subSteps: [
      { id: 'js-005-1', title: 'Call scheduled', timestamp: hoursAgo(145), aiCompleted: true },
      { id: 'js-005-2', title: 'Call completed', timestamp: hoursAgo(140), aiCompleted: true },
      { id: 'js-005-3', title: 'Info verified', timestamp: hoursAgo(135) },
    ] },
    { id: 'j-006', title: 'Clinical Evaluation', status: 'in_progress', subSteps: [{ id: 'js-006-1', title: 'Evaluation scheduled for next week' }] },
    { id: 'j-007', title: 'Committee Review', status: 'pending' },
    { id: 'j-008', title: 'Synced to EMR', status: 'pending' },
  ],

  // p-003: Robert Johnson - referral_received (AI Extraction in progress)
  'p-003': [
    { id: 'j-001', title: 'Referral Packet Received', status: 'completed', timestamp: hoursAgo(24), aiCompleted: true },
    { id: 'j-002', title: 'AI Data Extraction', status: 'in_progress', subSteps: [{ id: 'js-002-1', title: 'Processing referral documents...', aiCompleted: true }] },
    { id: 'j-003', title: 'Human Verification', status: 'pending' },
    { id: 'j-004', title: 'Insurance Verification', status: 'pending' },
    { id: 'j-005', title: 'Pre-Evaluation (AI Voice)', status: 'pending' },
    { id: 'j-006', title: 'Clinical Evaluation', status: 'pending' },
    { id: 'j-007', title: 'Committee Review', status: 'pending' },
    { id: 'j-008', title: 'Synced to EMR', status: 'pending' },
  ],

  // p-004: Maria Garcia - evaluation_complete (Committee Review in progress)
  'p-004': [
    { id: 'j-001', title: 'Referral Packet Received', status: 'completed', timestamp: hoursAgo(504), aiCompleted: true },
    { id: 'j-002', title: 'AI Data Extraction', status: 'completed', timestamp: hoursAgo(503), aiCompleted: true },
    { id: 'j-003', title: 'Human Verification', status: 'completed', timestamp: hoursAgo(480) },
    { id: 'j-004', title: 'Insurance Verification', status: 'completed', timestamp: hoursAgo(400), subSteps: [{ id: 'js-004-1', title: 'Cigna authorization approved' }] },
    { id: 'j-005', title: 'Pre-Evaluation (AI Voice)', status: 'completed', timestamp: hoursAgo(410), aiCompleted: true, subSteps: [
      { id: 'js-005-1', title: 'Call scheduled', timestamp: hoursAgo(440), aiCompleted: true },
      { id: 'js-005-2', title: 'Call completed', timestamp: hoursAgo(420), aiCompleted: true },
      { id: 'js-005-3', title: 'Info verified', timestamp: hoursAgo(410) },
    ] },
    { id: 'j-006', title: 'Clinical Evaluation', status: 'completed', timestamp: hoursAgo(72), subSteps: [{ id: 'js-006-1', title: 'All tests completed' }, { id: 'js-006-2', title: 'Patient cleared for transplant' }] },
    { id: 'j-007', title: 'Committee Review', status: 'in_progress', subSteps: [{ id: 'js-007-1', title: 'Scheduled for Thursday committee meeting' }] },
    { id: 'j-008', title: 'Synced to EMR', status: 'pending' },
  ],

  // p-005: William Brown - waitlisted (Synced to EMR, on waitlist)
  'p-005': [
    { id: 'j-001', title: 'Referral Packet Received', status: 'completed', timestamp: hoursAgo(1080), aiCompleted: true },
    { id: 'j-002', title: 'AI Data Extraction', status: 'completed', timestamp: hoursAgo(1079), aiCompleted: true },
    { id: 'j-003', title: 'Human Verification', status: 'completed', timestamp: hoursAgo(1060) },
    { id: 'j-004', title: 'Insurance Verification', status: 'completed', timestamp: hoursAgo(900), subSteps: [{ id: 'js-004-1', title: 'Medicare authorization approved' }] },
    { id: 'j-005', title: 'Pre-Evaluation (AI Voice)', status: 'completed', timestamp: hoursAgo(910), aiCompleted: true, subSteps: [
      { id: 'js-005-1', title: 'Call scheduled', timestamp: hoursAgo(940), aiCompleted: true },
      { id: 'js-005-2', title: 'Call completed', timestamp: hoursAgo(920), aiCompleted: true },
      { id: 'js-005-3', title: 'Info verified', timestamp: hoursAgo(910) },
    ] },
    { id: 'j-006', title: 'Clinical Evaluation', status: 'completed', timestamp: hoursAgo(600) },
    { id: 'j-007', title: 'Committee Review', status: 'completed', timestamp: hoursAgo(400), subSteps: [{ id: 'js-007-1', title: 'Approved for transplant waitlist' }] },
    { id: 'j-008', title: 'Synced to EMR', status: 'completed', timestamp: hoursAgo(380), subSteps: [{ id: 'js-008-1', title: 'Added to UNOS waitlist' }] },
  ],

  // p-006: Patricia Davis - under_review (Human Verification in progress)
  'p-006': [
    { id: 'j-001', title: 'Referral Packet Received', status: 'completed', timestamp: hoursAgo(72), aiCompleted: true },
    { id: 'j-002', title: 'AI Data Extraction', status: 'completed', timestamp: hoursAgo(71), aiCompleted: true },
    { id: 'j-003', title: 'Human Verification', status: 'in_progress', subSteps: [{ id: 'js-003-1', title: 'Additional documents received - re-review needed' }] },
    { id: 'j-004', title: 'Insurance Verification', status: 'pending' },
    { id: 'j-005', title: 'Pre-Evaluation (AI Voice)', status: 'pending' },
    { id: 'j-006', title: 'Clinical Evaluation', status: 'pending' },
    { id: 'j-007', title: 'Committee Review', status: 'pending' },
    { id: 'j-008', title: 'Synced to EMR', status: 'pending' },
  ],

  // p-007: James Wilson - referral_received (Just received today)
  'p-007': [
    { id: 'j-001', title: 'Referral Packet Received', status: 'completed', timestamp: hoursAgo(1), aiCompleted: true },
    { id: 'j-002', title: 'AI Data Extraction', status: 'in_progress', subSteps: [{ id: 'js-002-1', title: 'Urgent referral - prioritized processing', aiCompleted: true }] },
    { id: 'j-003', title: 'Human Verification', status: 'pending' },
    { id: 'j-004', title: 'Insurance Verification', status: 'pending' },
    { id: 'j-005', title: 'Pre-Evaluation (AI Voice)', status: 'pending' },
    { id: 'j-006', title: 'Clinical Evaluation', status: 'pending' },
    { id: 'j-007', title: 'Committee Review', status: 'pending' },
    { id: 'j-008', title: 'Synced to EMR', status: 'pending' },
  ],

  // p-008: Linda Martinez - evaluation_scheduled (Pre-Evaluation scheduled, not yet completed)
  'p-008': [
    { id: 'j-001', title: 'Referral Packet Received', status: 'completed', timestamp: hoursAgo(240), aiCompleted: true },
    { id: 'j-002', title: 'AI Data Extraction', status: 'completed', timestamp: hoursAgo(239), aiCompleted: true },
    { id: 'j-003', title: 'Human Verification', status: 'completed', timestamp: hoursAgo(220) },
    { id: 'j-004', title: 'Insurance Verification', status: 'completed', timestamp: hoursAgo(96), subSteps: [{ id: 'js-004-1', title: 'UnitedHealthcare authorization approved' }] },
    { id: 'j-005', title: 'Pre-Evaluation (AI Voice)', status: 'in_progress', subSteps: [
      { id: 'js-005-1', title: 'Call scheduled', timestamp: hoursAgo(95), aiCompleted: true },
      { id: 'js-005-2', title: 'Call pending - scheduled in 2 days' },
    ] },
    { id: 'j-006', title: 'Clinical Evaluation', status: 'pending' },
    { id: 'j-007', title: 'Committee Review', status: 'pending' },
    { id: 'j-008', title: 'Synced to EMR', status: 'pending' },
  ],

  // p-009: David Anderson - transplanted (All complete!)
  'p-009': [
    { id: 'j-001', title: 'Referral Packet Received', status: 'completed', timestamp: hoursAgo(2160), aiCompleted: true },
    { id: 'j-002', title: 'AI Data Extraction', status: 'completed', timestamp: hoursAgo(2159), aiCompleted: true },
    { id: 'j-003', title: 'Human Verification', status: 'completed', timestamp: hoursAgo(2140) },
    { id: 'j-004', title: 'Insurance Verification', status: 'completed', timestamp: hoursAgo(2000) },
    { id: 'j-005', title: 'Pre-Evaluation (AI Voice)', status: 'completed', timestamp: hoursAgo(2040), aiCompleted: true, subSteps: [
      { id: 'js-005-1', title: 'Call scheduled', timestamp: hoursAgo(2090), aiCompleted: true },
      { id: 'js-005-2', title: 'Call completed', timestamp: hoursAgo(2050), aiCompleted: true },
      { id: 'js-005-3', title: 'Info verified', timestamp: hoursAgo(2040) },
    ] },
    { id: 'j-006', title: 'Clinical Evaluation', status: 'completed', timestamp: hoursAgo(1500) },
    { id: 'j-007', title: 'Committee Review', status: 'completed', timestamp: hoursAgo(1200), subSteps: [{ id: 'js-007-1', title: 'Approved for transplant waitlist' }] },
    { id: 'j-008', title: 'Synced to EMR', status: 'completed', timestamp: hoursAgo(1180) },
    { id: 'j-009', title: 'Transplant Complete', status: 'completed', timestamp: hoursAgo(720), subSteps: [{ id: 'js-009-1', title: 'Successful kidney transplant' }, { id: 'js-009-2', title: 'Post-operative recovery on track' }] },
  ],

  // p-010: Susan Taylor - under_review (Human Verification in progress)
  'p-010': [
    { id: 'j-001', title: 'Referral Packet Received', status: 'completed', timestamp: hoursAgo(96), aiCompleted: true },
    { id: 'j-002', title: 'AI Data Extraction', status: 'completed', timestamp: hoursAgo(95), aiCompleted: true },
    { id: 'j-003', title: 'Human Verification', status: 'in_progress', subSteps: [{ id: 'js-003-1', title: 'Review updated referral information' }] },
    { id: 'j-004', title: 'Insurance Verification', status: 'pending' },
    { id: 'j-005', title: 'Pre-Evaluation (AI Voice)', status: 'pending' },
    { id: 'j-006', title: 'Clinical Evaluation', status: 'pending' },
    { id: 'j-007', title: 'Committee Review', status: 'pending' },
    { id: 'j-008', title: 'Synced to EMR', status: 'pending' },
  ],

  // p-011: Michael Thomas - inactive (Cancelled at verification stage, before pre-eval)
  'p-011': [
    { id: 'j-001', title: 'Referral Packet Received', status: 'completed', timestamp: hoursAgo(1440), aiCompleted: true },
    { id: 'j-002', title: 'AI Data Extraction', status: 'completed', timestamp: hoursAgo(1439), aiCompleted: true },
    { id: 'j-003', title: 'Human Verification', status: 'completed', timestamp: hoursAgo(1400) },
    { id: 'j-004', title: 'Insurance Verification', status: 'completed', timestamp: hoursAgo(1300), subSteps: [{ id: 'js-004-1', title: 'Medicare authorization denied' }] },
    { id: 'j-005', title: 'Referral Cancelled', status: 'completed', timestamp: hoursAgo(1200), subSteps: [{ id: 'js-005-1', title: 'Patient declined to continue' }] },
  ],

  // p-012: Elizabeth Jackson - referral_received (AI Extraction in progress)
  'p-012': [
    { id: 'j-001', title: 'Referral Packet Received', status: 'completed', timestamp: hoursAgo(24), aiCompleted: true },
    { id: 'j-002', title: 'AI Data Extraction', status: 'in_progress', subSteps: [{ id: 'js-002-1', title: 'Processing referral packet', aiCompleted: true }] },
    { id: 'j-003', title: 'Human Verification', status: 'pending' },
    { id: 'j-004', title: 'Insurance Verification', status: 'pending' },
    { id: 'j-005', title: 'Pre-Evaluation (AI Voice)', status: 'pending' },
    { id: 'j-006', title: 'Clinical Evaluation', status: 'pending' },
    { id: 'j-007', title: 'Committee Review', status: 'pending' },
    { id: 'j-008', title: 'Synced to EMR', status: 'pending' },
  ],

  // p-013: Richard White - evaluation_complete (Committee Review in progress)
  'p-013': [
    { id: 'j-001', title: 'Referral Packet Received', status: 'completed', timestamp: hoursAgo(672), aiCompleted: true },
    { id: 'j-002', title: 'AI Data Extraction', status: 'completed', timestamp: hoursAgo(671), aiCompleted: true },
    { id: 'j-003', title: 'Human Verification', status: 'completed', timestamp: hoursAgo(650) },
    { id: 'j-004', title: 'Insurance Verification', status: 'completed', timestamp: hoursAgo(500), subSteps: [{ id: 'js-004-1', title: 'UnitedHealthcare authorization approved' }] },
    { id: 'j-005', title: 'Pre-Evaluation (AI Voice)', status: 'completed', timestamp: hoursAgo(510), aiCompleted: true, subSteps: [
      { id: 'js-005-1', title: 'Call scheduled', timestamp: hoursAgo(540), aiCompleted: true },
      { id: 'js-005-2', title: 'Call completed', timestamp: hoursAgo(520), aiCompleted: true },
      { id: 'js-005-3', title: 'Info verified', timestamp: hoursAgo(510) },
    ] },
    { id: 'j-006', title: 'Clinical Evaluation', status: 'completed', timestamp: hoursAgo(144), subSteps: [{ id: 'js-006-1', title: 'Clinical review completed' }] },
    { id: 'j-007', title: 'Committee Review', status: 'in_progress', subSteps: [{ id: 'js-007-1', title: 'Pending committee meeting' }] },
    { id: 'j-008', title: 'Synced to EMR', status: 'pending' },
  ],

  // p-014: Jennifer Harris - waitlisted (Synced to EMR, on waitlist)
  'p-014': [
    { id: 'j-001', title: 'Referral Packet Received', status: 'completed', timestamp: hoursAgo(840), aiCompleted: true },
    { id: 'j-002', title: 'AI Data Extraction', status: 'completed', timestamp: hoursAgo(839), aiCompleted: true },
    { id: 'j-003', title: 'Human Verification', status: 'completed', timestamp: hoursAgo(820) },
    { id: 'j-004', title: 'Insurance Verification', status: 'completed', timestamp: hoursAgo(700), subSteps: [{ id: 'js-004-1', title: 'Cigna authorization approved' }] },
    { id: 'j-005', title: 'Pre-Evaluation (AI Voice)', status: 'completed', timestamp: hoursAgo(710), aiCompleted: true, subSteps: [
      { id: 'js-005-1', title: 'Call scheduled', timestamp: hoursAgo(740), aiCompleted: true },
      { id: 'js-005-2', title: 'Call completed', timestamp: hoursAgo(720), aiCompleted: true },
      { id: 'js-005-3', title: 'Info verified', timestamp: hoursAgo(710) },
    ] },
    { id: 'j-006', title: 'Clinical Evaluation', status: 'completed', timestamp: hoursAgo(400) },
    { id: 'j-007', title: 'Committee Review', status: 'completed', timestamp: hoursAgo(200), subSteps: [{ id: 'js-007-1', title: 'Approved for transplant waitlist' }] },
    { id: 'j-008', title: 'Synced to EMR', status: 'completed', timestamp: hoursAgo(168), subSteps: [{ id: 'js-008-1', title: 'Added to UNOS waitlist' }] },
  ],

  // p-015: Charles Clark - under_review (Human Verification in progress)
  'p-015': [
    { id: 'j-001', title: 'Referral Packet Received', status: 'completed', timestamp: hoursAgo(120), aiCompleted: true },
    { id: 'j-002', title: 'AI Data Extraction', status: 'completed', timestamp: hoursAgo(119), aiCompleted: true },
    { id: 'j-003', title: 'Human Verification', status: 'in_progress', subSteps: [{ id: 'js-003-1', title: 'Requesting missing lab results' }] },
    { id: 'j-004', title: 'Insurance Verification', status: 'pending' },
    { id: 'j-005', title: 'Pre-Evaluation (AI Voice)', status: 'pending' },
    { id: 'j-006', title: 'Clinical Evaluation', status: 'pending' },
    { id: 'j-007', title: 'Committee Review', status: 'pending' },
    { id: 'j-008', title: 'Synced to EMR', status: 'pending' },
  ],
};

// Legacy export for backwards compatibility
export const johnSmithJourney = patientJourneys['p-001'];

// Helper to get journey by patient ID
export function getJourneyByPatientId(patientId: string): JourneyStep[] {
  return patientJourneys[patientId] || [
    { id: 'j-1', title: 'Referral Packet Received', status: 'completed', aiCompleted: true },
    { id: 'j-2', title: 'AI Data Extraction', status: 'pending' },
    { id: 'j-3', title: 'Human Verification', status: 'pending' },
    { id: 'j-4', title: 'Insurance Verification', status: 'pending' },
    { id: 'j-5', title: 'Pre-Evaluation (AI Voice)', status: 'pending' },
    { id: 'j-6', title: 'Clinical Evaluation', status: 'pending' },
    { id: 'j-7', title: 'Committee Review', status: 'pending' },
    { id: 'j-8', title: 'Synced to EMR', status: 'pending' },
  ];
}

// Mock Extraction Data for Task Viewer
export const johnSmithExtraction: ExtractionData = {
  firstName: { value: 'John', confidence: 'high' },
  lastName: { value: 'Smith', confidence: 'high' },
  dateOfBirth: { value: '03/15/1958', confidence: 'high' },
  ssn: { value: '***-**-4567', confidence: 'high' },
  phone: { value: '(555) 123-4567', confidence: 'high' },
  address: { value: '123 Oak Street, Chicago, IL 60601', confidence: 'high' },
  gfr: { value: '18', confidence: 'high' },
  creatinine: { value: '4.2', confidence: 'high' },
  bloodType: { value: 'O+', confidence: 'high' },
  bmi: { value: '26.5', confidence: 'medium' },
  primaryDiagnosis: { value: 'CKD Stage 5 - Diabetic Nephropathy', confidence: 'high' },
  diabetes: { value: 'Yes', confidence: 'high' },
  hypertension: { value: 'Yes', confidence: 'high' },
  previousTransplants: { value: '0', confidence: 'high' },
  onDialysis: { value: 'Yes', confidence: 'high' },
  dialysisStartDate: { value: '06/15/2023', confidence: 'medium' },
  dialysisType: { value: 'Hemodialysis', confidence: 'high' },
  referringProviderName: { value: 'Dr. Sarah Johnson', confidence: 'high' },
  referringOrganization: { value: 'Midwest Nephrology Associates', confidence: 'high' },
  referringNpi: { value: '1234567890', confidence: 'high' },
  referringPhone: { value: '(555) 234-5678', confidence: 'medium' },
  referringFax: { value: '(555) 234-5679', confidence: 'low' },
  receivingProviderName: { value: 'Dr. Michael Chen', confidence: 'high' },
  receivingOrganization: { value: 'University Transplant Center', confidence: 'high' },
  receivingNpi: { value: '0987654321', confidence: 'high' },
  insuranceCarrier: { value: 'Blue Cross Blue Shield', confidence: 'high' },
  policyNumber: { value: 'BCBS-789456123', confidence: 'high' },
  groupNumber: { value: 'GRP-445566', confidence: 'medium' },
};

// Analytics Mock Data
export const trendData: TrendDataPoint[] = [
  { month: 'Jul', referrals: 45, evaluations: 32 },
  { month: 'Aug', referrals: 52, evaluations: 38 },
  { month: 'Sep', referrals: 48, evaluations: 35 },
  { month: 'Oct', referrals: 61, evaluations: 45 },
  { month: 'Nov', referrals: 58, evaluations: 42 },
  { month: 'Dec', referrals: 67, evaluations: 48 },
  { month: 'Jan', referrals: 73, evaluations: 54 },
];

export const insuranceBreakdown: InsuranceBreakdown[] = [
  { carrier: 'Blue Cross Blue Shield', count: 28, percentage: 38 },
  { carrier: 'Medicare', count: 18, percentage: 25 },
  { carrier: 'UnitedHealthcare', count: 12, percentage: 16 },
  { carrier: 'Aetna', count: 9, percentage: 12 },
  { carrier: 'Cigna', count: 6, percentage: 9 },
];

export const analyticsMetrics = {
  totalReferrals: 73,
  newPatients: 45,
  newPatientsPercent: 62,
  evaluationRate: 74,
  avgProcessingDays: 4.2,
  aiAccuracyRate: 94,
  pendingReviews: 8,
  completedThisWeek: 12,
};

// Helper function to generate extraction data from patient
export function getExtractionDataByPatientId(patientId: string): ExtractionData {
  const patient = patients.find((p) => p.id === patientId);

  if (!patient) {
    // Return empty extraction if patient not found
    return {
      firstName: { value: '', confidence: 'low' },
      lastName: { value: '', confidence: 'low' },
      dateOfBirth: { value: '', confidence: 'low' },
      ssn: { value: '', confidence: 'low' },
      phone: { value: '', confidence: 'low' },
      address: { value: '', confidence: 'low' },
      gfr: { value: '', confidence: 'low' },
      creatinine: { value: '', confidence: 'low' },
      bloodType: { value: '', confidence: 'low' },
      bmi: { value: '', confidence: 'low' },
      primaryDiagnosis: { value: '', confidence: 'low' },
      diabetes: { value: '', confidence: 'low' },
      hypertension: { value: '', confidence: 'low' },
      previousTransplants: { value: '', confidence: 'low' },
      onDialysis: { value: '', confidence: 'low' },
      dialysisStartDate: { value: '', confidence: 'low' },
      dialysisType: { value: '', confidence: 'low' },
      referringProviderName: { value: '', confidence: 'low' },
      referringOrganization: { value: '', confidence: 'low' },
      referringNpi: { value: '', confidence: 'low' },
      referringPhone: { value: '', confidence: 'low' },
      referringFax: { value: '', confidence: 'low' },
      receivingProviderName: { value: '', confidence: 'low' },
      receivingOrganization: { value: '', confidence: 'low' },
      receivingNpi: { value: '', confidence: 'low' },
      insuranceCarrier: { value: '', confidence: 'low' },
      policyNumber: { value: '', confidence: 'low' },
      groupNumber: { value: '', confidence: 'low' },
    };
  }

  // Format date of birth
  const dob = new Date(patient.dateOfBirth);
  const formattedDob = `${String(dob.getMonth() + 1).padStart(2, '0')}/${String(dob.getDate()).padStart(2, '0')}/${dob.getFullYear()}`;

  // Format address
  const address = patient.address
    ? `${patient.address.street}, ${patient.address.city}, ${patient.address.state} ${patient.address.zip}`
    : '';

  // Format dialysis start date if exists
  let dialysisStartFormatted = '';
  if (patient.dialysisStartDate) {
    const dialysisDate = new Date(patient.dialysisStartDate);
    dialysisStartFormatted = `${String(dialysisDate.getMonth() + 1).padStart(2, '0')}/${String(dialysisDate.getDate()).padStart(2, '0')}/${dialysisDate.getFullYear()}`;
  }

  // Generate SSN placeholder based on patient ID
  const ssnLastFour = patient.id.replace('p-', '').padStart(4, '0').slice(-4);

  return {
    firstName: { value: patient.firstName, confidence: 'high' },
    lastName: { value: patient.lastName, confidence: 'high' },
    dateOfBirth: { value: formattedDob, confidence: 'high' },
    ssn: { value: `***-**-${ssnLastFour}`, confidence: 'high' },
    phone: { value: patient.phone || '', confidence: patient.phone ? 'high' : 'low' },
    address: { value: address, confidence: address ? 'high' : 'low' },
    gfr: { value: String(patient.gfr ?? ''), confidence: patient.gfr ? 'high' : 'low' },
    creatinine: { value: String(patient.creatinine ?? ''), confidence: patient.creatinine ? 'high' : 'low' },
    bloodType: { value: patient.bloodType || '', confidence: patient.bloodType ? 'high' : 'low' },
    bmi: { value: String(patient.bmi ?? ''), confidence: patient.bmi ? 'medium' : 'low' },
    primaryDiagnosis: { value: patient.primaryDiagnosis || '', confidence: patient.primaryDiagnosis ? 'high' : 'low' },
    diabetes: { value: patient.diabetes ? 'Yes' : 'No', confidence: 'high' },
    hypertension: { value: patient.hypertension ? 'Yes' : 'No', confidence: 'high' },
    previousTransplants: { value: String(patient.previousTransplants), confidence: 'high' },
    onDialysis: { value: patient.onDialysis ? 'Yes' : 'No', confidence: 'high' },
    dialysisStartDate: { value: dialysisStartFormatted, confidence: dialysisStartFormatted ? 'medium' : 'low' },
    dialysisType: { value: String(patient.dialysisType || ''), confidence: patient.dialysisType ? 'high' : 'low' },
    referringProviderName: { value: String(patient.referringProvider?.name || ''), confidence: patient.referringProvider?.name ? 'high' : 'low' },
    referringOrganization: { value: String(patient.referringProvider?.organization || ''), confidence: patient.referringProvider?.organization ? 'high' : 'medium' },
    referringNpi: { value: String(patient.referringProvider?.npi || ''), confidence: patient.referringProvider?.npi ? 'high' : 'low' },
    referringPhone: { value: patient.referringProvider?.phone || '', confidence: patient.referringProvider?.phone ? 'medium' : 'low' },
    referringFax: { value: patient.referringProvider?.fax || '', confidence: patient.referringProvider?.fax ? 'low' : 'low' },
    receivingProviderName: { value: patient.receivingProvider?.name || '', confidence: patient.receivingProvider?.name ? 'high' : 'low' },
    receivingOrganization: { value: patient.receivingProvider?.organization || '', confidence: patient.receivingProvider?.organization ? 'high' : 'low' },
    receivingNpi: { value: patient.receivingProvider?.npi || '', confidence: patient.receivingProvider?.npi ? 'high' : 'low' },
    insuranceCarrier: { value: patient.insurance?.carrier || '', confidence: patient.insurance?.carrier ? 'high' : 'low' },
    policyNumber: { value: patient.insurance?.policyNumber || '', confidence: patient.insurance?.policyNumber ? 'high' : 'low' },
    groupNumber: { value: patient.insurance?.groupNumber || '', confidence: patient.insurance?.groupNumber ? 'medium' : 'low' },
  };
}

// Helper functions
export function getPatientById(id: string): Patient | undefined {
  return patients.find((p) => p.id === id);
}

export function getTasksByPatientId(patientId: string): Task[] {
  return tasks.filter((t) => t.patientId === patientId);
}

export function getDocumentsByPatientId(patientId: string): Document[] {
  return documents.filter((d) => d.patientId === patientId);
}

export function getTasksByStatus(status: Task['status']): Task[] {
  return tasks.filter((t) => t.status === status);
}

// Scheduling helper functions

// Generate available time slots for the next 14 days (30-minute intervals, weekdays only)
export function getAvailableTimeSlots(startDate: Date = new Date()): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  for (let day = 0; day < 14; day++) {
    const date = new Date(start);
    date.setDate(date.getDate() + day);

    // Skip weekends (0 = Sunday, 6 = Saturday)
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    // Add 30-minute slots from 9:00 AM to 4:30 PM
    for (let hour = 9; hour <= 16; hour++) {
      for (const minute of [0, 30]) {
        // Skip 5:00 PM slot (only go up to 4:30)
        if (hour === 16 && minute === 30) continue;

        const slotDate = new Date(date);
        slotDate.setHours(hour, minute, 0, 0);

        // Skip slots in the past
        if (slotDate <= new Date()) continue;

        slots.push({
          id: `slot-${day}-${hour}-${minute}`,
          datetime: slotDate.toISOString(),
          available: Math.random() > 0.25, // 75% availability
        });
      }
    }
  }

  return slots;
}

// Validate scheduling token and return patient data
export function validateSchedulingToken(token: string): SchedulePatientData | null {
  // In mock, the token is simply the patient ID
  const patient = patients.find((p) => p.id === token);

  if (!patient) return null;

  const preEval = patientPreEvaluations[patient.id];

  return {
    id: patient.id,
    firstName: patient.firstName,
    lastName: patient.lastName,
    phone: patient.phone || '',
    preEvaluationId: preEval?.id || `pe-${patient.id}`,
    centerId: 'nyu-langone',
  };
}

// Schedule a pre-evaluation call
export function schedulePreEvaluationCall(
  patientId: string,
  slotTime: string
): PreEvaluationData {
  // Check if pre-evaluation exists
  let preEval = patientPreEvaluations[patientId];

  if (!preEval) {
    // Create a new pre-evaluation record
    preEval = {
      id: `pe-${patientId}`,
      patientId,
      status: 'notified',
      notifiedAt: new Date().toISOString(),
    };
    patientPreEvaluations[patientId] = preEval;
  }

  // Update to scheduled status
  preEval.status = 'scheduled';
  preEval.scheduledAt = new Date().toISOString();
  preEval.scheduledCallTime = slotTime;

  return preEval;
}

// Update pre-evaluation with call results from Vapi
export function updatePreEvaluationWithCallResults(
  patientId: string,
  callResults: {
    medicalHistory: MedicalHistoryInfo;
    lifestyleInfo: LifestyleInfo;
    actualCallDuration: number;
  }
): PreEvaluationData {
  let preEval = patientPreEvaluations[patientId];

  if (!preEval) {
    // Create a new pre-evaluation record if it doesn't exist
    preEval = {
      id: `pe-${patientId}`,
      patientId,
      status: 'notified',
      notifiedAt: new Date().toISOString(),
    };
    patientPreEvaluations[patientId] = preEval;
  }

  // Update to completed status with extracted data
  preEval.status = 'completed';
  preEval.completedAt = new Date().toISOString();
  preEval.actualCallDuration = callResults.actualCallDuration;
  preEval.medicalHistory = callResults.medicalHistory;
  preEval.lifestyleInfo = callResults.lifestyleInfo;

  return preEval;
}

// Reset pre-evaluation for demo purposes
export function resetPreEvaluation(patientId: string): void {
  const preEval = patientPreEvaluations[patientId];
  if (preEval) {
    // Reset to notified status
    preEval.status = 'notified';
    preEval.scheduledAt = undefined;
    preEval.scheduledCallTime = undefined;
    preEval.completedAt = undefined;
    preEval.actualCallDuration = undefined;
    preEval.medicalHistory = undefined;
    preEval.lifestyleInfo = undefined;
    preEval.verifiedAt = undefined;
    preEval.verifiedBy = undefined;
    preEval.verificationNotes = undefined;
  }
}

// ============================================================
// RISK ASSESSMENT DATA
// ============================================================

// Risk assessments for patients with completed pre-evaluations
export const patientRiskAssessments: Record<string, RiskAssessment> = {
  // John Smith (p-001) - HIGH Risk: Diabetes + Cardiac + Limited support
  'p-001': {
    patientId: 'p-001',
    calculatedLevel: 'HIGH',
    totalScore: 72,
    confidenceScore: 91,
    createdAt: hoursAgo(1),
    factors: [
      {
        id: 'rf-001-1',
        category: 'cardiac',
        name: 'Heart Failure',
        value: 'EF 35%, diagnosed 2021',
        impact: 'high',
        points: 15,
        description: 'Reduced ejection fraction indicates significant cardiac compromise',
      },
      {
        id: 'rf-001-2',
        category: 'cardiac',
        name: 'Heart Attack with Stents',
        value: '2 stents placed in 2021',
        impact: 'high',
        points: 15,
        description: 'History of MI with coronary intervention',
      },
      {
        id: 'rf-001-3',
        category: 'diabetes',
        name: 'Diabetic Neuropathy',
        value: 'Bilateral lower extremity',
        impact: 'medium',
        points: 4,
        description: 'Peripheral neuropathy affecting feet',
      },
      {
        id: 'rf-001-4',
        category: 'diabetes',
        name: 'Diabetic Retinopathy',
        value: 'Laser treatment performed',
        impact: 'medium',
        points: 5,
        description: 'Required photocoagulation therapy',
      },
      {
        id: 'rf-001-5',
        category: 'diabetes',
        name: 'Type 2 Diabetes Duration',
        value: '22 years',
        impact: 'medium',
        points: 6,
        description: 'Long-standing diabetes increases complication risk',
      },
      {
        id: 'rf-001-6',
        category: 'lifestyle',
        name: 'Former Smoker',
        value: '30 pack-years, quit 2021',
        impact: 'medium',
        points: 4,
        description: 'Significant smoking history affects cardiovascular risk',
      },
      {
        id: 'rf-001-7',
        category: 'lifestyle',
        name: 'Limited Support System',
        value: 'Spouse works full-time, alone during day',
        impact: 'medium',
        points: 6,
        description: 'May need additional post-transplant support arrangements',
      },
      {
        id: 'rf-001-8',
        category: 'dialysis',
        name: 'Dialysis Duration',
        value: '18 months on hemodialysis',
        impact: 'low',
        points: 2,
        description: 'Moderate dialysis duration',
      },
    ],
  },

  // Linda Martinez (p-008) - HIGH Risk: Previous transplant + Cardiac + Long dialysis
  'p-008': {
    patientId: 'p-008',
    calculatedLevel: 'HIGH',
    totalScore: 65,
    confidenceScore: 88,
    createdAt: hoursAgo(100),
    factors: [
      {
        id: 'rf-008-1',
        category: 'sensitization',
        name: 'Previous Failed Transplant',
        value: 'Kidney transplant 2018, failed 2020 (rejection)',
        impact: 'high',
        points: 8,
        description: 'Prior transplant failure increases sensitization and rejection risk',
      },
      {
        id: 'rf-008-2',
        category: 'cardiac',
        name: 'Bypass Surgery',
        value: 'Triple bypass in 2019',
        impact: 'high',
        points: 8,
        description: 'History of coronary artery bypass grafting',
      },
      {
        id: 'rf-008-3',
        category: 'dialysis',
        name: 'Extended Dialysis Duration',
        value: '3.5 years on hemodialysis',
        impact: 'medium',
        points: 5,
        description: 'Prolonged dialysis associated with increased complications',
      },
      {
        id: 'rf-008-4',
        category: 'dialysis',
        name: 'Dialysis Complications',
        value: 'Fistula revised twice, hypotension episodes',
        impact: 'medium',
        points: 4,
        description: 'Access complications and intradialytic hypotension',
      },
      {
        id: 'rf-008-5',
        category: 'diabetes',
        name: 'Type 2 Diabetes',
        value: 'Diagnosed 15 years ago',
        impact: 'medium',
        points: 6,
        description: 'Long-standing diabetes with renal complications',
      },
      {
        id: 'rf-008-6',
        category: 'sensitization',
        name: 'Blood Transfusions',
        value: '4 units during transplant surgery',
        impact: 'medium',
        points: 4,
        description: 'Prior transfusions may increase antibody levels',
      },
    ],
  },

  // Maria Garcia (p-004) - MEDIUM Risk: Lupus, good support, compliant
  'p-004': {
    patientId: 'p-004',
    calculatedLevel: 'MEDIUM',
    totalScore: 38,
    confidenceScore: 85,
    createdAt: hoursAgo(410),
    factors: [
      {
        id: 'rf-004-1',
        category: 'dialysis',
        name: 'Dialysis Duration',
        value: '18 months on hemodialysis',
        impact: 'low',
        points: 2,
        description: 'Moderate dialysis duration',
      },
      {
        id: 'rf-004-2',
        category: 'compliance',
        name: 'Immunosuppression History',
        value: 'On prednisone and tacrolimus for lupus',
        impact: 'medium',
        points: 4,
        description: 'Already experienced with immunosuppressive medications',
      },
      {
        id: 'rf-004-3',
        category: 'lifestyle',
        name: 'Strong Support System',
        value: 'Lives with parents, sister is a nurse',
        impact: 'low',
        points: -3,
        description: 'Excellent family support reduces post-transplant risk',
      },
      {
        id: 'rf-004-4',
        category: 'compliance',
        name: 'Excellent Compliance',
        value: 'Uses pill organizer, no missed doses',
        impact: 'low',
        points: -2,
        description: 'Strong medication adherence history',
      },
    ],
  },

  // Jennifer Harris (p-014) - MEDIUM Risk: PKD, minimal comorbidities
  'p-014': {
    patientId: 'p-014',
    calculatedLevel: 'MEDIUM',
    totalScore: 35,
    confidenceScore: 89,
    createdAt: hoursAgo(710),
    factors: [
      {
        id: 'rf-014-1',
        category: 'dialysis',
        name: 'Dialysis Duration',
        value: '2 years on hemodialysis',
        impact: 'low',
        points: 3,
        description: 'Moderate dialysis exposure',
      },
      {
        id: 'rf-014-2',
        category: 'sensitization',
        name: 'Prior Pregnancies',
        value: '2 pregnancies (C-section)',
        impact: 'low',
        points: 3,
        description: 'Pregnancies may contribute to sensitization',
      },
      {
        id: 'rf-014-3',
        category: 'lifestyle',
        name: 'Good Support System',
        value: 'Husband with flexible job, teenage children',
        impact: 'low',
        points: -2,
        description: 'Adequate family support available',
      },
      {
        id: 'rf-014-4',
        category: 'compliance',
        name: 'Proactive Patient',
        value: 'Very engaged in health management',
        impact: 'low',
        points: -2,
        description: 'Demonstrated commitment to health',
      },
    ],
  },

  // David Anderson (p-009) - LOW Risk: Pre-emptive, no comorbidities, ideal
  'p-009': {
    patientId: 'p-009',
    calculatedLevel: 'LOW',
    totalScore: 15,
    confidenceScore: 94,
    createdAt: hoursAgo(2040),
    factors: [
      {
        id: 'rf-009-1',
        category: 'dialysis',
        name: 'Pre-Dialysis',
        value: 'Pre-emptive transplant evaluation',
        impact: 'low',
        points: 0,
        description: 'Not yet on dialysis - optimal timing',
      },
      {
        id: 'rf-009-2',
        category: 'lifestyle',
        name: 'Never Smoked',
        value: 'No tobacco history',
        impact: 'low',
        points: 0,
        description: 'No smoking-related cardiovascular risk',
      },
      {
        id: 'rf-009-3',
        category: 'lifestyle',
        name: 'Excellent Support System',
        value: 'Wife works from home, extended family nearby',
        impact: 'low',
        points: -3,
        description: 'Ideal support network for recovery',
      },
      {
        id: 'rf-009-4',
        category: 'compliance',
        name: 'Excellent Compliance',
        value: 'Never missed medication dose',
        impact: 'low',
        points: -3,
        description: 'Perfect medication adherence',
      },
      {
        id: 'rf-009-5',
        category: 'functional',
        name: 'Fully Independent',
        value: 'Active lifestyle, exercises regularly',
        impact: 'low',
        points: -2,
        description: 'No functional limitations',
      },
    ],
  },

  // William Brown (p-005) - MEDIUM Risk: Waitlisted patient
  'p-005': {
    patientId: 'p-005',
    calculatedLevel: 'MEDIUM',
    totalScore: 42,
    confidenceScore: 86,
    createdAt: hoursAgo(910),
    factors: [
      {
        id: 'rf-005-1',
        category: 'dialysis',
        name: 'Extended Dialysis Duration',
        value: '2.5 years on hemodialysis',
        impact: 'medium',
        points: 4,
        description: 'Prolonged time on dialysis',
      },
      {
        id: 'rf-005-2',
        category: 'dialysis',
        name: 'Dialysis Complications',
        value: 'Leg cramps, shortness of breath',
        impact: 'low',
        points: 2,
        description: 'Some intradialytic symptoms reported',
      },
      {
        id: 'rf-005-3',
        category: 'compliance',
        name: 'Occasional Missed Medications',
        value: 'Sometimes misses evening doses',
        impact: 'low',
        points: 2,
        description: 'Minor compliance issues noted',
      },
      {
        id: 'rf-005-4',
        category: 'lifestyle',
        name: 'Good Support',
        value: 'Lives with wife, daughter visits weekly',
        impact: 'low',
        points: -1,
        description: 'Adequate support system',
      },
    ],
  },

  // Richard White (p-013) - HIGH Risk: Diabetic with cardiac and compliance
  'p-013': {
    patientId: 'p-013',
    calculatedLevel: 'HIGH',
    totalScore: 61,
    confidenceScore: 87,
    createdAt: hoursAgo(510),
    factors: [
      {
        id: 'rf-013-1',
        category: 'diabetes',
        name: 'Diabetic Neuropathy',
        value: 'Feet affected, uses special footwear',
        impact: 'medium',
        points: 4,
        description: 'Peripheral neuropathy present',
      },
      {
        id: 'rf-013-2',
        category: 'diabetes',
        name: 'Diabetic Retinopathy',
        value: 'Cataract surgery, vision changes',
        impact: 'medium',
        points: 5,
        description: 'Eye complications from diabetes',
      },
      {
        id: 'rf-013-3',
        category: 'cardiac',
        name: 'Coronary Stents',
        value: 'Stent placement 2020',
        impact: 'medium',
        points: 5,
        description: 'History of coronary intervention',
      },
      {
        id: 'rf-013-4',
        category: 'lifestyle',
        name: 'Lives Alone',
        value: 'Sister nearby, church community support',
        impact: 'medium',
        points: 4,
        description: 'May need additional support coordination',
      },
      {
        id: 'rf-013-5',
        category: 'functional',
        name: 'Transportation Dependent',
        value: 'No longer drives, relies on others',
        impact: 'medium',
        points: 3,
        description: 'Requires transportation assistance',
      },
      {
        id: 'rf-013-6',
        category: 'dialysis',
        name: 'Dialysis Duration',
        value: '20 months on hemodialysis',
        impact: 'low',
        points: 2,
        description: 'Moderate dialysis duration',
      },
    ],
  },

  // Jane Doe (p-002) - MEDIUM Risk: Evaluation scheduled
  'p-002': {
    patientId: 'p-002',
    calculatedLevel: 'MEDIUM',
    totalScore: 32,
    confidenceScore: 90,
    createdAt: hoursAgo(135),
    factors: [
      {
        id: 'rf-002-1',
        category: 'dialysis',
        name: 'Peritoneal Dialysis',
        value: '2 years on PD',
        impact: 'low',
        points: 3,
        description: 'Home dialysis modality',
      },
      {
        id: 'rf-002-2',
        category: 'lifestyle',
        name: 'Strong Support',
        value: 'Spouse, adult children nearby',
        impact: 'low',
        points: -2,
        description: 'Excellent family support',
      },
      {
        id: 'rf-002-3',
        category: 'compliance',
        name: 'Excellent Adherence',
        value: 'Attends all dialysis appointments',
        impact: 'low',
        points: -2,
        description: 'Perfect attendance record',
      },
    ],
  },
};

// Call transcripts for patients with completed pre-evaluations
export const patientTranscripts: Record<string, string> = {
  'p-001': `Coordinator: Hello, may I speak with John?
Patient: Yes, this is John Smith speaking.

Coordinator: Hi John, I'm calling from the transplant clinic regarding your kidney transplant evaluation. Is this a good time to talk for about 15 minutes?
Patient: Yes, that's fine.

Coordinator: Great. Can you confirm your date of birth for me?
Patient: March 15th, 1958.

Coordinator: Thank you. Now, who is your nephrologist?
Patient: Dr. Sarah Johnson at Midwest Nephrology.

Coordinator: And what caused your kidney disease?
Patient: It was from diabetes. I've had Type 2 for about 22 years now.

Coordinator: Any complications from the diabetes?
Patient: Yes, I have neuropathy in my feet - can't feel much below my ankles. And I had some laser treatment for my eyes a few years back - retinopathy they said.

Coordinator: I understand. Any heart problems?
Patient: I had a heart attack back in 2021. They put in two stents. I also take medication for heart failure now - my ejection fraction is around 35%.

Coordinator: Are you currently on dialysis?
Patient: Yes, hemodialysis. I started in June 2023.

Coordinator: What days do you go and how long are your sessions?
Patient: Monday, Wednesday, Friday. Each session is about 4 hours.

Coordinator: Any complications with dialysis?
Patient: Sometimes my blood pressure drops during treatment, but it's manageable.

Coordinator: Do you smoke?
Patient: I quit after the heart attack. But I smoked for 30 years, about a pack a day.

Coordinator: Any alcohol or recreational drugs?
Patient: Just the occasional beer. Never any drugs.

Coordinator: Who will help you after transplant surgery?
Patient: My wife works full-time, but she said she can take a week off. After that I'll mostly be on my own during the day.

Coordinator: How are you with taking your medications?
Patient: Pretty good. I use a pill organizer. Sometimes I forget the evening dose if I'm tired, but mostly I'm on top of it.

Coordinator: Thank you, John. I'll send this information to our transplant team for review. We'll be in touch with next steps.`,

  'p-008': `Coordinator: Hello, may I speak with Linda?
Patient: Yes, this is Linda Martinez.

Coordinator: Hi Linda, I'm calling from the transplant clinic. Is this a good time?
Patient: Yes, go ahead.

Coordinator: Can you confirm your date of birth?
Patient: February 25th, 1962.

Coordinator: Have you had a transplant before?
Patient: Yes, I had one in 2018 but it failed after about 2 years. Rejection.

Coordinator: I'm sorry to hear that. How long have you been on dialysis?
Patient: Since the transplant failed, so about 3 and a half years now. I go Monday, Wednesday, Friday for 4 hours each.

Coordinator: Any complications with dialysis?
Patient: My fistula has had problems - I've had it revised twice. And I get pretty bad cramping and low blood pressure sometimes.

Coordinator: Any heart problems?
Patient: I had bypass surgery in 2019 - triple bypass. But I'm doing okay now, I see my cardiologist every 3 months.

Coordinator: Are you diabetic?
Patient: Yes, Type 2. About 15 years now. I take metformin and insulin.

Coordinator: Any diabetes complications?
Patient: Some numbness in my feet, but no major issues.

Coordinator: Who will support you after surgery?
Patient: My daughter lives with me. She works from home so she's very available.

Coordinator: How is your medication compliance?
Patient: Very good. I never miss my dialysis and I take all my medications on time.

Coordinator: Thank you, Linda. We'll review this information and be in touch.`,

  'p-004': `Coordinator: Hello, is this Maria Garcia?
Patient: Yes, speaking.

Coordinator: Hi Maria, I'm calling from the transplant clinic regarding your evaluation. Is now a good time?
Patient: Yes, that's fine.

Coordinator: Can you confirm your date of birth?
Patient: April 30th, 1980.

Coordinator: What caused your kidney disease?
Patient: Lupus nephritis. I was diagnosed with lupus when I was 25, and it eventually affected my kidneys.

Coordinator: Any heart problems?
Patient: No, my heart is healthy. I have regular check-ups.

Coordinator: Are you on dialysis?
Patient: Yes, hemodialysis since January 2023. Three times a week.

Coordinator: Any complications?
Patient: No, it's been going smoothly.

Coordinator: Do you smoke or drink?
Patient: Never smoked. I have an occasional glass of wine with dinner, maybe once a week.

Coordinator: Who will help you after surgery?
Patient: I live with my parents and they're both retired. My sister also lives nearby and she's a nurse. They're all very supportive.

Coordinator: How is your medication compliance?
Patient: Very good. I use a pill organizer and phone reminders. I haven't missed any doses in months.

Coordinator: That's excellent. Thank you, Maria. Our team will review and contact you soon.`,

  'p-009': `Coordinator: Hello, may I speak with David Anderson?
Patient: Yes, this is David.

Coordinator: Hi David, I'm calling from the transplant clinic. Do you have about 15 minutes?
Patient: Sure, go ahead.

Coordinator: Can you confirm your date of birth?
Patient: August 7th, 1970.

Coordinator: What caused your kidney disease?
Patient: IgA nephropathy - it's an autoimmune condition. They caught it early through routine bloodwork.

Coordinator: Are you on dialysis?
Patient: Not yet. My doctor says I'm getting close but we're trying to do a pre-emptive transplant before I need dialysis.

Coordinator: That's ideal. Any diabetes or heart problems?
Patient: No diabetes, no heart problems. I exercise regularly and try to eat healthy.

Coordinator: Have you ever smoked?
Patient: Never. I've never used drugs either. Maybe a beer occasionally but that's it.

Coordinator: Have you had any surgeries?
Patient: Just a hernia repair back in 2005. Nothing major.

Coordinator: Who will support you after surgery?
Patient: My wife works from home and my son is in high school. We have great family support - my parents live 20 minutes away.

Coordinator: How are you with taking medications?
Patient: Very disciplined. I've never missed a dose of my blood pressure medication.

Coordinator: Excellent. You sound like an ideal candidate. Our team will be in touch very soon.`,

  'p-014': `Coordinator: Hello, is this Jennifer Harris?
Patient: Yes, it is.

Coordinator: Hi Jennifer, I'm calling from the transplant center. Is this a good time?
Patient: Yes, I've been expecting your call.

Coordinator: Can you confirm your date of birth?
Patient: March 28th, 1974.

Coordinator: What caused your kidney disease?
Patient: Polycystic kidney disease - it runs in my family. My mother had it too.

Coordinator: Are you diabetic?
Patient: No, I'm not diabetic.

Coordinator: Any heart problems?
Patient: No heart problems. Just the kidney issues.

Coordinator: Are you on dialysis?
Patient: Yes, hemodialysis for about 2 years now.

Coordinator: Any complications?
Patient: Some back pain from my enlarged kidneys, but dialysis itself goes well.

Coordinator: Have you had any major surgeries?
Patient: I had a C-section in 2008 and had a cyst removed laparoscopically in 2015. That's it.

Coordinator: Any allergies?
Patient: Yes, shellfish - I have anaphylaxis, so I carry an EpiPen.

Coordinator: Do you have any support at home?
Patient: Yes, I live with my husband and two teenagers. My husband has a flexible job and can work from home when needed.

Coordinator: How is your medication compliance?
Patient: Excellent. I'm very proactive about my health. I track everything in an app.

Coordinator: That's great to hear. We'll review your information and be in touch with next steps.`,
};

// Risk analytics data for the analytics dashboard
export const riskAnalyticsData: RiskAnalyticsData = {
  distribution: {
    high: 23,
    medium: 45,
    low: 32,
  },
  variableImportance: [
    { variable: 'Cardiac History', importance: 18, category: 'cardiac' },
    { variable: 'Diabetes Complications', importance: 15, category: 'diabetes' },
    { variable: 'Previous Transplant', importance: 12, category: 'sensitization' },
    { variable: 'Dialysis Duration', importance: 10, category: 'dialysis' },
    { variable: 'Smoking Status', importance: 9, category: 'lifestyle' },
    { variable: 'Support System', importance: 8, category: 'lifestyle' },
    { variable: 'Medication Compliance', importance: 8, category: 'compliance' },
    { variable: 'Cancer History', importance: 7, category: 'cancer' },
    { variable: 'Functional Status', importance: 6, category: 'functional' },
    { variable: 'Sensitization Events', importance: 5, category: 'sensitization' },
  ],
  modelConfidence: 87,
  totalAssessed: 127,
};

// Helper functions for risk data
export function getRiskAssessmentByPatientId(patientId: string): RiskAssessment | null {
  return patientRiskAssessments[patientId] || null;
}

export function getTranscriptByPatientId(patientId: string): string | null {
  return patientTranscripts[patientId] || null;
}

// Update risk assessment (for manual override)
export function updateRiskAssessment(
  patientId: string,
  updates: {
    overrideLevel?: RiskAssessment['overrideLevel'];
    overrideReason?: string;
    overrideBy?: string;
  }
): RiskAssessment | null {
  const assessment = patientRiskAssessments[patientId];
  if (!assessment) return null;

  if (updates.overrideLevel) {
    assessment.overrideLevel = updates.overrideLevel;
    assessment.overrideReason = updates.overrideReason;
    assessment.overrideBy = updates.overrideBy;
    assessment.overrideAt = new Date().toISOString();
  }

  return assessment;
}

// ============================================================
// ENHANCED RISK ANALYTICS DATA
// ============================================================

// Model Performance Data - sensitivity, specificity, PPV, NPV
export const modelPerformanceData: ModelPerformanceData = {
  metrics: [
    {
      name: 'Detects High-Risk',
      technicalName: 'Sensitivity',
      value: 89,
      benchmark: 85,
      description: 'Correctly identifies patients who develop complications',
    },
    {
      name: 'Confirms Low-Risk',
      technicalName: 'Specificity',
      value: 82,
      benchmark: 80,
      description: 'Correctly identifies patients who stay complication-free',
    },
    {
      name: 'High-Risk Accuracy',
      technicalName: 'PPV',
      value: 76,
      benchmark: 70,
      description: 'When flagged high-risk, how often that\'s correct',
    },
    {
      name: 'Low-Risk Accuracy',
      technicalName: 'NPV',
      value: 92,
      benchmark: 90,
      description: 'When flagged low-risk, how often that\'s correct',
    },
  ],
  validationInfo: {
    sampleSize: 1247,
    validationPeriod: 'Jan 2023 - Dec 2024',
    lastUpdated: '2025-01-15',
  },
};

// Calibration Data - predicted vs actual outcomes (10 deciles)
export const calibrationData: CalibrationData = {
  deciles: [
    { predictedRisk: 5, actualOutcomes: 4, patientCount: 124 },
    { predictedRisk: 15, actualOutcomes: 13, patientCount: 118 },
    { predictedRisk: 25, actualOutcomes: 23, patientCount: 132 },
    { predictedRisk: 35, actualOutcomes: 32, patientCount: 145 },
    { predictedRisk: 45, actualOutcomes: 47, patientCount: 139 },
    { predictedRisk: 55, actualOutcomes: 52, patientCount: 128 },
    { predictedRisk: 65, actualOutcomes: 68, patientCount: 115 },
    { predictedRisk: 75, actualOutcomes: 73, patientCount: 108 },
    { predictedRisk: 85, actualOutcomes: 88, patientCount: 96 },
    { predictedRisk: 95, actualOutcomes: 93, patientCount: 82 },
  ],
  interpretation: 'Predictions are well-calibrated. Actual outcomes closely match predicted risk levels across all deciles.',
};

// Risk Distribution Histogram Data
export const riskDistributionHistogramData: RiskDistributionData = {
  histogram: [
    { scoreRange: '0-10', scoreMidpoint: 5, count: 28, percentage: 4 },
    { scoreRange: '10-20', scoreMidpoint: 15, count: 76, percentage: 11 },
    { scoreRange: '20-30', scoreMidpoint: 25, count: 134, percentage: 19 },
    { scoreRange: '30-40', scoreMidpoint: 35, count: 156, percentage: 22 },
    { scoreRange: '40-50', scoreMidpoint: 45, count: 112, percentage: 16 },
    { scoreRange: '50-60', scoreMidpoint: 55, count: 84, percentage: 12 },
    { scoreRange: '60-70', scoreMidpoint: 65, count: 56, percentage: 8 },
    { scoreRange: '70-80', scoreMidpoint: 75, count: 35, percentage: 5 },
    { scoreRange: '80-90', scoreMidpoint: 85, count: 14, percentage: 2 },
    { scoreRange: '90-100', scoreMidpoint: 95, count: 7, percentage: 1 },
  ],
  thresholds: { lowToMedium: 30, mediumToHigh: 60 },
  statistics: { mean: 38.4, median: 35, standardDeviation: 18.2 },
};

// Outcome Tracking Data - 12 months
export const outcomeTrackingData: OutcomeTrackingData = {
  monthly: [
    { month: 'Jan', predictedHighRisk: 12, actualComplications: 10, truePositives: 9 },
    { month: 'Feb', predictedHighRisk: 14, actualComplications: 11, truePositives: 10 },
    { month: 'Mar', predictedHighRisk: 11, actualComplications: 9, truePositives: 8 },
    { month: 'Apr', predictedHighRisk: 15, actualComplications: 13, truePositives: 12 },
    { month: 'May', predictedHighRisk: 13, actualComplications: 12, truePositives: 11 },
    { month: 'Jun', predictedHighRisk: 16, actualComplications: 14, truePositives: 13 },
    { month: 'Jul', predictedHighRisk: 14, actualComplications: 12, truePositives: 11 },
    { month: 'Aug', predictedHighRisk: 18, actualComplications: 15, truePositives: 14 },
    { month: 'Sep', predictedHighRisk: 15, actualComplications: 13, truePositives: 12 },
    { month: 'Oct', predictedHighRisk: 17, actualComplications: 14, truePositives: 13 },
    { month: 'Nov', predictedHighRisk: 19, actualComplications: 16, truePositives: 15 },
    { month: 'Dec', predictedHighRisk: 16, actualComplications: 14, truePositives: 13 },
  ],
  aggregate: {
    overallAccuracy: 87,
    trend: 'stable',
  },
};

// ============================================================
// PATIENT CALLS DATA
// ============================================================

export const patientCalls: Record<string, PatientCall[]> = {
  'p-001': [
    {
      id: 'call-001-1',
      patientId: 'p-001',
      date: hoursAgo(1),
      duration: 14,
      coordinator: 'Sarah Miller',
      status: 'completed',
      transcript: patientTranscripts['p-001'],
      summary: 'Pre-evaluation call completed. Patient has significant cardiac history (heart attack 2021, 2 stents, EF 35%) and diabetic complications (neuropathy, retinopathy). 30 pack-year smoking history, quit 2021. Limited daytime support - wife works full-time.',
    },
  ],
  'p-002': [
    {
      id: 'call-002-1',
      patientId: 'p-002',
      date: hoursAgo(135),
      duration: 11,
      coordinator: 'Jennifer Adams',
      status: 'completed',
      transcript: `Coordinator: Hello, is this Jane Doe?
Patient: Yes, speaking.

Coordinator: Hi Jane, I'm calling from the transplant clinic for your pre-evaluation. Is this a good time?
Patient: Yes, go ahead.

Coordinator: Can you confirm your date of birth?
Patient: July 22nd, 1965.

Coordinator: What caused your kidney disease?
Patient: Polycystic kidney disease. It runs in my family.

Coordinator: Are you on dialysis?
Patient: Yes, peritoneal dialysis for about 2 years now.

Coordinator: Any complications?
Patient: No major issues. I do it at home and it's been going smoothly.

Coordinator: Do you have any heart problems?
Patient: No heart problems.

Coordinator: Any diabetes?
Patient: No diabetes either.

Coordinator: Who will support you after surgery?
Patient: My husband is very supportive. We have two adult children who live nearby too.

Coordinator: How is your medication compliance?
Patient: Excellent. I never miss my dialysis exchanges or medications.

Coordinator: That's great. Thank you, Jane. Our team will be in touch soon.`,
      summary: 'Pre-evaluation completed. PKD patient on home peritoneal dialysis for 2 years. No cardiac issues or diabetes. Excellent support system with husband and adult children nearby. Perfect compliance history.',
    },
  ],
  'p-004': [
    {
      id: 'call-004-1',
      patientId: 'p-004',
      date: hoursAgo(410),
      duration: 12,
      coordinator: 'Sarah Miller',
      status: 'completed',
      transcript: patientTranscripts['p-004'],
      summary: 'Pre-evaluation completed. Lupus nephritis patient on hemodialysis 18 months. No cardiac issues. Excellent support - lives with retired parents, sister is a nurse. Perfect medication compliance using pill organizer and phone reminders.',
    },
  ],
  'p-008': [
    {
      id: 'call-008-1',
      patientId: 'p-008',
      date: hoursAgo(95),
      duration: 0,
      coordinator: 'Jennifer Adams',
      status: 'scheduled',
      summary: 'Pre-evaluation call scheduled for tomorrow at 10:00 AM.',
    },
  ],
  'p-009': [
    {
      id: 'call-009-1',
      patientId: 'p-009',
      date: hoursAgo(2040),
      duration: 10,
      coordinator: 'Sarah Miller',
      status: 'completed',
      transcript: patientTranscripts['p-009'],
      summary: 'Pre-evaluation completed. Ideal candidate - pre-emptive evaluation, no dialysis yet. IgA nephropathy. No diabetes or cardiac issues. Never smoked. Excellent support system with wife working from home. Perfect medication adherence.',
    },
  ],
  'p-014': [
    {
      id: 'call-014-1',
      patientId: 'p-014',
      date: hoursAgo(710),
      duration: 13,
      coordinator: 'Jennifer Adams',
      status: 'completed',
      transcript: patientTranscripts['p-014'],
      summary: 'Pre-evaluation completed. PKD patient on hemodialysis 2 years. No diabetes or cardiac issues. Shellfish allergy (anaphylaxis). Good support - lives with husband and teenagers. Excellent compliance, uses health tracking app.',
    },
  ],
};

export function getCallsByPatientId(patientId: string): PatientCall[] {
  return patientCalls[patientId] || [];
}

import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  CheckCircle2,
  Clock,
  Circle,
  FileText,
  Upload,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  getPatientById,
  getTasksByPatientId,
  getDocumentsByPatientId,
  getJourneyByPatientId,
  getPreEvaluationByPatientId,
  getRiskAssessmentByPatientId,
  patients,
} from '@/data/mockData';
import type { JourneyStep, JourneyStepStatus } from '@/types';
import { PreEvalResultsTab } from './PreEvalResultsTab';
import { CallsTab } from './CallsTab';
import { getExtractedData, type ExtractedPatientData } from '@/services/callService';
import type { PreEvaluationData } from '@/types';

type TabKey = 'journey' | 'tasks' | 'pre-eval' | 'calls' | 'insurance' | 'documents';

const tabs: { key: TabKey; label: string }[] = [
  { key: 'journey', label: 'Patient Journey' },
  { key: 'tasks', label: 'Tasks' },
  { key: 'pre-eval', label: 'Pre-Eval Results' },
  { key: 'calls', label: 'Calls' },
  { key: 'insurance', label: 'Insurance' },
  { key: 'documents', label: 'Documents' },
];

const stepStatusIcons: Record<JourneyStepStatus, typeof CheckCircle2> = {
  completed: CheckCircle2,
  in_progress: Clock,
  pending: Circle,
};

const stepStatusColors: Record<JourneyStepStatus, string> = {
  completed: 'text-green-600 bg-green-100',
  in_progress: 'text-primary bg-primary/10',
  pending: 'text-gray-400 bg-gray-100',
};

function JourneyTimeline({ steps }: { steps: JourneyStep[] }) {
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>(
    // Start with all completed steps expanded
    steps.reduce((acc, step) => ({ ...acc, [step.id]: step.status !== 'pending' }), {})
  );

  const toggleStep = (stepId: string) => {
    setExpandedSteps((prev) => ({ ...prev, [stepId]: !prev[stepId] }));
  };

  return (
    <div className="space-y-4">
      {steps.map((step, index) => {
        const StatusIcon = stepStatusIcons[step.status];
        const isExpanded = expandedSteps[step.id];
        const hasSubSteps = step.subSteps && step.subSteps.length > 0;

        return (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative"
          >
            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={`absolute left-5 top-10 w-0.5 h-full -translate-x-1/2 ${
                  step.status === 'completed' ? 'bg-green-200' : 'bg-gray-200'
                }`}
              />
            )}

            <div className="flex gap-4">
              {/* Status Icon */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${stepStatusColors[step.status]}`}
              >
                <StatusIcon className="h-5 w-5" />
              </div>

              {/* Content */}
              <div className="flex-1 bg-card rounded-lg border border-border p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-foreground">{step.title}</h3>
                    {step.aiCompleted && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                        <Sparkles className="h-3 w-3" />
                        AI completed
                      </span>
                    )}
                  </div>
                  {hasSubSteps && (
                    <button
                      onClick={() => toggleStep(step.id)}
                      className="p-1 hover:bg-muted rounded transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  )}
                </div>

                {step.timestamp && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(step.timestamp).toLocaleString()}
                  </p>
                )}

                {/* Sub-steps */}
                {hasSubSteps && isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 pl-4 border-l-2 border-gray-200 space-y-2"
                  >
                    {step.subSteps!.map((subStep) => (
                      <div key={subStep.id} className="flex items-center gap-2 text-sm">
                        {subStep.aiCompleted && (
                          <Sparkles className="h-3 w-3 text-primary flex-shrink-0" />
                        )}
                        <span className="text-muted-foreground">{subStep.title}</span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function EmptyDocuments() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
        <FileText className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-1">No documents yet</h3>
      <p className="text-muted-foreground mb-4 max-w-sm">
        Documents associated with this patient will appear here once uploaded.
      </p>
      <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
        <Upload className="h-4 w-4" />
        Upload Document
      </button>
    </div>
  );
}

export function PatientProfile() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as { defaultTab?: TabKey; from?: string } | null;
  const defaultTab = locationState?.defaultTab || 'journey';
  const backPath = locationState?.from || '/patients';
  const [activeTab, setActiveTab] = useState<TabKey>(defaultTab);

  const patient = getPatientById(patientId || '');
  const patientTasks = getTasksByPatientId(patientId || '');
  const patientDocuments = getDocumentsByPatientId(patientId || '');

  // Find current patient index for navigation
  const currentIndex = patients.findIndex((p) => p.id === patientId);
  const prevPatient = currentIndex > 0 ? patients[currentIndex - 1] : null;
  const nextPatient = currentIndex < patients.length - 1 ? patients[currentIndex + 1] : null;

  // Get patient-specific journey data
  const journey = getJourneyByPatientId(patientId || '');
  const mockPreEvaluation = getPreEvaluationByPatientId(patientId || '');
  const riskAssessment = getRiskAssessmentByPatientId(patientId || '');

  // Fetch real extracted data from webhook calls (overrides mock pre-eval if available)
  const [realExtracted, setRealExtracted] = useState<ExtractedPatientData | null>(null);
  useEffect(() => {
    getExtractedData(patientId || '').then(setRealExtracted);
  }, [patientId]);

  // Build preEvaluation: use real extracted data if available, otherwise mock
  const preEvaluation: PreEvaluationData | null = realExtracted
    ? {
        id: `webhook-${patientId}`,
        patientId: patientId || '',
        status: 'completed',
        completedAt: new Date().toISOString(),
        medicalHistory: realExtracted.medicalHistory,
        lifestyleInfo: realExtracted.lifestyleInfo,
      }
    : mockPreEvaluation;

  if (!patient) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">Patient not found</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(backPath)}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-xl font-semibold">
                {patient.firstName} {patient.lastName}
              </h1>
              <p className="text-sm text-muted-foreground">{patient.mrn}</p>
            </div>
          </div>

          {/* Patient Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => prevPatient && navigate(`/patients/${prevPatient.id}`)}
              disabled={!prevPatient}
              className="p-2 hover:bg-muted rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => nextPatient && navigate(`/patients/${nextPatient.id}`)}
              disabled={!nextPatient}
              className="p-2 hover:bg-muted rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Patient Sidebar */}
        <div className="w-80 bg-card border-r border-border p-6 min-h-[calc(100vh-73px)]">
          {/* Avatar */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-2xl font-semibold text-primary">
                {patient.firstName[0]}
                {patient.lastName[0]}
              </span>
            </div>
            <div>
              <p className="font-medium text-foreground">
                {patient.firstName} {patient.lastName}
              </p>
              <p className="text-sm text-muted-foreground">{patient.mrn}</p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">DOB:</span>
              <span className="text-foreground">{formatDate(patient.dateOfBirth)}</span>
            </div>
            {patient.phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{patient.phone}</span>
              </div>
            )}
            {patient.email && (
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{patient.email}</span>
              </div>
            )}
            {patient.address && (
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span className="text-foreground">
                  {patient.address.street}, {patient.address.city}, {patient.address.state}{' '}
                  {patient.address.zip}
                </span>
              </div>
            )}
          </div>

          {/* Clinical Info */}
          <div className="border-t border-border pt-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Clinical Data</h3>
            <div className="grid grid-cols-2 gap-3">
              {patient.gfr && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">GFR</p>
                  <p className="text-lg font-semibold text-foreground">{patient.gfr}</p>
                </div>
              )}
              {patient.creatinine && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Creatinine</p>
                  <p className="text-lg font-semibold text-foreground">{patient.creatinine}</p>
                </div>
              )}
              {patient.bloodType && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Blood Type</p>
                  <p className="text-lg font-semibold text-foreground">{patient.bloodType}</p>
                </div>
              )}
              {patient.bmi && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">BMI</p>
                  <p className="text-lg font-semibold text-foreground">{patient.bmi}</p>
                </div>
              )}
            </div>

            {patient.primaryDiagnosis && (
              <div className="mt-3 bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Primary Diagnosis</p>
                <p className="text-sm font-medium text-foreground mt-1">
                  {patient.primaryDiagnosis}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Tabs */}
          <div className="border-b border-border mb-6">
            <div className="flex gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.key
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'journey' && <JourneyTimeline steps={journey} />}

          {activeTab === 'tasks' && (
            <div className="space-y-3">
              {patientTasks.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No tasks for this patient.
                </p>
              ) : (
                patientTasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-card rounded-lg border border-border p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-foreground">{task.description}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Created {new Date(task.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        task.status === 'completed'
                          ? 'bg-green-50 text-green-600'
                          : task.status === 'review_needed'
                            ? 'bg-primary/10 text-primary'
                            : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'insurance' && (
            <div className="bg-card rounded-lg border border-border p-6">
              {patient.insurance ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Carrier</p>
                    <p className="text-lg font-medium text-foreground">
                      {patient.insurance.carrier}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Policy Number</p>
                      <p className="font-medium text-foreground">{patient.insurance.policyNumber}</p>
                    </div>
                    {patient.insurance.groupNumber && (
                      <div>
                        <p className="text-sm text-muted-foreground">Group Number</p>
                        <p className="font-medium text-foreground">
                          {patient.insurance.groupNumber}
                        </p>
                      </div>
                    )}
                  </div>
                  {patient.insurance.authorizationStatus && (
                    <div>
                      <p className="text-sm text-muted-foreground">Authorization Status</p>
                      <span
                        className={`inline-flex mt-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                          patient.insurance.authorizationStatus === 'approved'
                            ? 'bg-green-50 text-green-600'
                            : patient.insurance.authorizationStatus === 'pending'
                              ? 'bg-amber-50 text-amber-600'
                              : 'bg-red-50 text-red-600'
                        }`}
                      >
                        {patient.insurance.authorizationStatus}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No insurance information available.
                </p>
              )}
            </div>
          )}

          {activeTab === 'documents' && (
            <>
              {patientDocuments.length === 0 ? (
                <EmptyDocuments />
              ) : (
                <div className="space-y-3">
                  {patientDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="bg-card rounded-lg border border-border p-4 flex items-center justify-between hover:bg-muted/30 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{doc.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {doc.pageCount} pages • Uploaded{' '}
                            {new Date(doc.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'pre-eval' && (
            <PreEvalResultsTab
              preEvaluation={preEvaluation}
              riskAssessment={riskAssessment}
              patientName={`${patient.firstName} ${patient.lastName}`}
            />
          )}

          {activeTab === 'calls' && (
            <CallsTab
              patientId={patient.id}
              patientName={`${patient.firstName} ${patient.lastName}`}
            />
          )}
        </div>
      </div>
    </div>
  );
}

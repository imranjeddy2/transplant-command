import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Check,
  Loader2,
  Clock,
  CheckCircle2,
  Circle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { tasks, getPatientById, getExtractionDataByPatientId } from '@/data/mockData';
import type { ExtractionData, ConfidenceLevel, TaskStatus } from '@/types';

const statusConfig: Record<
  TaskStatus,
  { label: string; color: string; bgColor: string; icon: typeof Circle }
> = {
  review_needed: {
    label: 'Review Needed',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    icon: AlertCircle,
  },
  in_progress: {
    label: 'In Progress',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    icon: Clock,
  },
  completed: {
    label: 'Completed',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    icon: CheckCircle2,
  },
  pending: {
    label: 'Pending',
    color: 'text-gray-500',
    bgColor: 'bg-gray-100',
    icon: Circle,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-gray-400',
    bgColor: 'bg-gray-50',
    icon: XCircle,
  },
};

type TabKey = 'patient' | 'coverage' | 'referring' | 'receiving' | 'diagnosis';

const tabs: { key: TabKey; label: string }[] = [
  { key: 'patient', label: 'Patient' },
  { key: 'coverage', label: 'Coverage' },
  { key: 'referring', label: 'Referring' },
  { key: 'receiving', label: 'Receiving' },
  { key: 'diagnosis', label: 'Diagnosis' },
];

const confidenceStyles: Record<ConfidenceLevel, string> = {
  high: '',
  medium: 'bg-amber-50 border-amber-200',
  low: 'bg-red-50 border-red-200',
};

interface FormFieldProps {
  label: string;
  value: string;
  confidence: ConfidenceLevel;
  onChange: (value: string) => void;
  showAnimation?: boolean;
  readOnly?: boolean;
}

function FormField({ label, value, confidence, onChange, showAnimation, readOnly }: FormFieldProps) {
  const [displayValue, setDisplayValue] = useState(showAnimation ? '' : value);
  const [animationComplete, setAnimationComplete] = useState(!showAnimation);

  useEffect(() => {
    if (showAnimation && !animationComplete && value) {
      let i = 0;
      const interval = setInterval(() => {
        if (i <= value.length) {
          setDisplayValue(value.slice(0, i));
          i++;
        } else {
          clearInterval(interval);
          setAnimationComplete(true);
        }
      }, 30);
      return () => clearInterval(interval);
    }
  }, [showAnimation, animationComplete]);

  // Once animation is complete, always show the actual value
  const inputValue = animationComplete ? value : displayValue;

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-muted-foreground">{label}</label>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => onChange(e.target.value)}
        readOnly={readOnly}
        className={`w-full px-3 py-2 rounded-lg border text-sm transition-colors ${
          readOnly
            ? 'bg-muted/50 cursor-default'
            : 'focus:ring-2 focus:ring-primary focus:border-primary'
        } ${
          confidence !== 'high'
            ? confidenceStyles[confidence]
            : 'border-border bg-background'
        }`}
      />
    </div>
  );
}

export function TaskViewer() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const task = tasks.find((t) => t.id === taskId);
  const patient = task ? getPatientById(task.patientId) : null;

  // Only show extraction animation for review_needed tasks
  const needsExtraction = task?.status === 'review_needed';
  const isReadOnly = task?.status === 'completed' || task?.status === 'cancelled';

  const [activeTab, setActiveTab] = useState<TabKey>('patient');
  const [isExtracting, setIsExtracting] = useState(needsExtraction);
  const [showFields, setShowFields] = useState(!needsExtraction);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [extraction, setExtraction] = useState<ExtractionData>(() =>
    getExtractionDataByPatientId(task?.patientId || '')
  );
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 4;

  useEffect(() => {
    // Only simulate AI extraction animation for review_needed tasks
    if (needsExtraction) {
      const timer = setTimeout(() => {
        setIsExtracting(false);
        setShowFields(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [needsExtraction]);

  const updateField = (field: keyof ExtractionData, value: string) => {
    setExtraction((prev) => ({
      ...prev,
      [field]: { ...prev[field], value, edited: true },
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsComplete(true);
  };

  if (!task || !patient) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">Task not found</p>
      </div>
    );
  }

  if (isComplete) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center"
      >
        <div className="text-center space-y-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 10 }}
            className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto"
          >
            <Check className="h-8 w-8 text-green-600" />
          </motion.div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Review Complete</h2>
            <p className="text-muted-foreground mt-1">
              Data has been verified and is ready for EMR sync
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate(`/patients/${patient.id}`)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              View Patient Profile
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
            >
              Back to Tasks
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-lg font-semibold">
              {patient.firstName} {patient.lastName}
            </h1>
            <p className="text-sm text-muted-foreground">{patient.mrn}</p>
          </div>
        </div>

        <AnimatePresence>
          {showFields && task && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              {needsExtraction && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">AI Extracted</span>
                </div>
              )}
              {(() => {
                const status = statusConfig[task.status];
                const StatusIcon = status.icon;
                return (
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${status.bgColor}`}>
                    <StatusIcon className={`h-4 w-4 ${status.color}`} />
                    <span className={`text-sm font-medium ${status.color}`}>{status.label}</span>
                  </div>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Document Panel */}
        <div className="w-1/2 bg-muted/30 border-r border-border flex flex-col">
          {/* Document Controls */}
          <div className="bg-card border-b border-border px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button className="p-1.5 hover:bg-muted rounded transition-colors">
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="text-sm text-muted-foreground">100%</span>
              <button className="p-1.5 hover:bg-muted rounded transition-colors">
                <ZoomIn className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 hover:bg-muted rounded transition-colors disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 hover:bg-muted rounded transition-colors disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Document Image */}
          <div className="flex-1 overflow-auto p-6">
            <div className="bg-white rounded-lg shadow-lg p-8 min-h-[800px]">
              {/* Mock Referral Form */}
              <div className="text-center border-b pb-4 mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  KIDNEY TRANSPLANT REFERRAL FORM
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {extraction.referringOrganization.value || 'Nephrology Associates'}
                </p>
              </div>

              <div className="space-y-6 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500 text-xs uppercase mb-1">Patient Name</p>
                    <p className="border-b border-gray-300 pb-1 font-handwriting text-lg">
                      {extraction.firstName.value} {extraction.lastName.value}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase mb-1">Date of Birth</p>
                    <p className="border-b border-gray-300 pb-1 font-handwriting text-lg">
                      {extraction.dateOfBirth.value}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500 text-xs uppercase mb-1">Phone</p>
                    <p className="border-b border-gray-300 pb-1 font-handwriting text-lg">
                      {extraction.phone.value}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase mb-1">SSN (Last 4)</p>
                    <p className="border-b border-gray-300 pb-1 font-handwriting text-lg">
                      {extraction.ssn.value}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-gray-500 text-xs uppercase mb-1">Address</p>
                  <p className="border-b border-gray-300 pb-1 font-handwriting text-lg">
                    {extraction.address.value || '—'}
                  </p>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="font-semibold text-gray-700 mb-3">Clinical Information</h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <p className="text-gray-500 text-xs uppercase mb-1">GFR</p>
                      <p className="border-b border-gray-300 pb-1 font-handwriting text-lg">
                        {extraction.gfr.value}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs uppercase mb-1">Creatinine</p>
                      <p className="border-b border-gray-300 pb-1 font-handwriting text-lg">
                        {extraction.creatinine.value}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs uppercase mb-1">Blood Type</p>
                      <p className="border-b border-gray-300 pb-1 font-handwriting text-lg">
                        {extraction.bloodType.value}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs uppercase mb-1">BMI</p>
                      <p className="border-b border-gray-300 pb-1 font-handwriting text-lg">
                        {extraction.bmi.value}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-gray-500 text-xs uppercase mb-1">Primary Diagnosis</p>
                  <p className="border-b border-gray-300 pb-1 font-handwriting text-lg">
                    {extraction.primaryDiagnosis.value}
                  </p>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="font-semibold text-gray-700 mb-3">Referring Physician</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-500 text-xs uppercase mb-1">Name</p>
                      <p className="border-b border-gray-300 pb-1 font-handwriting text-lg">
                        {extraction.referringProviderName.value || '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs uppercase mb-1">NPI</p>
                      <p className="border-b border-gray-300 pb-1 font-handwriting text-lg">
                        {extraction.referringNpi.value || '—'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Extraction Form Panel */}
        <div className="w-1/2 flex flex-col">
          {/* Tabs */}
          <div className="bg-card border-b border-border px-4">
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

          {/* Form Content */}
          <div className="flex-1 overflow-auto p-6">
            <AnimatePresence mode="wait">
              {isExtracting ? (
                <motion.div
                  key="extracting"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-full gap-4"
                >
                  <div className="relative">
                    <Sparkles className="h-12 w-12 text-primary animate-pulse" />
                  </div>
                  <p className="text-muted-foreground">Extracting data from document...</p>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {activeTab === 'patient' && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          label="First Name"
                          value={extraction.firstName.value}
                          confidence={extraction.firstName.confidence}
                          onChange={(v) => updateField('firstName', v)}
                          showAnimation={showFields && needsExtraction}
                          readOnly={isReadOnly}
                        />
                        <FormField
                          label="Last Name"
                          value={extraction.lastName.value}
                          confidence={extraction.lastName.confidence}
                          onChange={(v) => updateField('lastName', v)}
                          showAnimation={showFields && needsExtraction}
                          readOnly={isReadOnly}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          label="Date of Birth"
                          value={extraction.dateOfBirth.value}
                          confidence={extraction.dateOfBirth.confidence}
                          onChange={(v) => updateField('dateOfBirth', v)}
                          showAnimation={showFields && needsExtraction}
                          readOnly={isReadOnly}
                        />
                        <FormField
                          label="SSN"
                          value={extraction.ssn.value}
                          confidence={extraction.ssn.confidence}
                          onChange={(v) => updateField('ssn', v)}
                          showAnimation={showFields && needsExtraction}
                          readOnly={isReadOnly}
                        />
                      </div>
                      <FormField
                        label="Phone"
                        value={extraction.phone.value}
                        confidence={extraction.phone.confidence}
                        onChange={(v) => updateField('phone', v)}
                        showAnimation={showFields && needsExtraction}
                        readOnly={isReadOnly}
                      />
                      <FormField
                        label="Address"
                        value={extraction.address.value}
                        confidence={extraction.address.confidence}
                        onChange={(v) => updateField('address', v)}
                        showAnimation={showFields && needsExtraction}
                        readOnly={isReadOnly}
                      />
                    </>
                  )}

                  {activeTab === 'diagnosis' && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          label="GFR (ml/min)"
                          value={extraction.gfr.value}
                          confidence={extraction.gfr.confidence}
                          onChange={(v) => updateField('gfr', v)}
                          showAnimation={showFields && needsExtraction}
                          readOnly={isReadOnly}
                        />
                        <FormField
                          label="Creatinine (mg/dL)"
                          value={extraction.creatinine.value}
                          confidence={extraction.creatinine.confidence}
                          onChange={(v) => updateField('creatinine', v)}
                          showAnimation={showFields && needsExtraction}
                          readOnly={isReadOnly}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          label="Blood Type"
                          value={extraction.bloodType.value}
                          confidence={extraction.bloodType.confidence}
                          onChange={(v) => updateField('bloodType', v)}
                          showAnimation={showFields && needsExtraction}
                          readOnly={isReadOnly}
                        />
                        <FormField
                          label="BMI"
                          value={extraction.bmi.value}
                          confidence={extraction.bmi.confidence}
                          onChange={(v) => updateField('bmi', v)}
                          showAnimation={showFields && needsExtraction}
                          readOnly={isReadOnly}
                        />
                      </div>
                      <FormField
                        label="Primary Diagnosis"
                        value={extraction.primaryDiagnosis.value}
                        confidence={extraction.primaryDiagnosis.confidence}
                        onChange={(v) => updateField('primaryDiagnosis', v)}
                        showAnimation={showFields && needsExtraction}
                        readOnly={isReadOnly}
                      />
                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          label="Diabetes"
                          value={extraction.diabetes.value}
                          confidence={extraction.diabetes.confidence}
                          onChange={(v) => updateField('diabetes', v)}
                          showAnimation={showFields && needsExtraction}
                          readOnly={isReadOnly}
                        />
                        <FormField
                          label="Hypertension"
                          value={extraction.hypertension.value}
                          confidence={extraction.hypertension.confidence}
                          onChange={(v) => updateField('hypertension', v)}
                          showAnimation={showFields && needsExtraction}
                          readOnly={isReadOnly}
                        />
                        <FormField
                          label="Previous Transplants"
                          value={extraction.previousTransplants.value}
                          confidence={extraction.previousTransplants.confidence}
                          onChange={(v) => updateField('previousTransplants', v)}
                          showAnimation={showFields && needsExtraction}
                          readOnly={isReadOnly}
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          label="On Dialysis"
                          value={extraction.onDialysis.value}
                          confidence={extraction.onDialysis.confidence}
                          onChange={(v) => updateField('onDialysis', v)}
                          showAnimation={showFields && needsExtraction}
                          readOnly={isReadOnly}
                        />
                        <FormField
                          label="Dialysis Start Date"
                          value={extraction.dialysisStartDate.value}
                          confidence={extraction.dialysisStartDate.confidence}
                          onChange={(v) => updateField('dialysisStartDate', v)}
                          showAnimation={showFields && needsExtraction}
                          readOnly={isReadOnly}
                        />
                        <FormField
                          label="Dialysis Type"
                          value={extraction.dialysisType.value}
                          confidence={extraction.dialysisType.confidence}
                          onChange={(v) => updateField('dialysisType', v)}
                          showAnimation={showFields && needsExtraction}
                          readOnly={isReadOnly}
                        />
                      </div>
                    </>
                  )}

                  {activeTab === 'referring' && (
                    <>
                      <FormField
                        label="Provider Name"
                        value={extraction.referringProviderName.value}
                        confidence={extraction.referringProviderName.confidence}
                        onChange={(v) => updateField('referringProviderName', v)}
                        showAnimation={showFields && needsExtraction}
                        readOnly={isReadOnly}
                      />
                      <FormField
                        label="Organization"
                        value={extraction.referringOrganization.value}
                        confidence={extraction.referringOrganization.confidence}
                        onChange={(v) => updateField('referringOrganization', v)}
                        showAnimation={showFields && needsExtraction}
                        readOnly={isReadOnly}
                      />
                      <FormField
                        label="NPI"
                        value={extraction.referringNpi.value}
                        confidence={extraction.referringNpi.confidence}
                        onChange={(v) => updateField('referringNpi', v)}
                        showAnimation={showFields && needsExtraction}
                        readOnly={isReadOnly}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          label="Phone"
                          value={extraction.referringPhone.value}
                          confidence={extraction.referringPhone.confidence}
                          onChange={(v) => updateField('referringPhone', v)}
                          showAnimation={showFields && needsExtraction}
                          readOnly={isReadOnly}
                        />
                        <FormField
                          label="Fax"
                          value={extraction.referringFax.value}
                          confidence={extraction.referringFax.confidence}
                          onChange={(v) => updateField('referringFax', v)}
                          showAnimation={showFields && needsExtraction}
                          readOnly={isReadOnly}
                        />
                      </div>
                    </>
                  )}

                  {activeTab === 'receiving' && (
                    <>
                      <FormField
                        label="Provider Name"
                        value={extraction.receivingProviderName.value}
                        confidence={extraction.receivingProviderName.confidence}
                        onChange={(v) => updateField('receivingProviderName', v)}
                        showAnimation={showFields && needsExtraction}
                        readOnly={isReadOnly}
                      />
                      <FormField
                        label="Organization"
                        value={extraction.receivingOrganization.value}
                        confidence={extraction.receivingOrganization.confidence}
                        onChange={(v) => updateField('receivingOrganization', v)}
                        showAnimation={showFields && needsExtraction}
                        readOnly={isReadOnly}
                      />
                      <FormField
                        label="NPI"
                        value={extraction.receivingNpi.value}
                        confidence={extraction.receivingNpi.confidence}
                        onChange={(v) => updateField('receivingNpi', v)}
                        showAnimation={showFields && needsExtraction}
                        readOnly={isReadOnly}
                      />
                    </>
                  )}

                  {activeTab === 'coverage' && (
                    <>
                      <FormField
                        label="Insurance Carrier"
                        value={extraction.insuranceCarrier.value}
                        confidence={extraction.insuranceCarrier.confidence}
                        onChange={(v) => updateField('insuranceCarrier', v)}
                        showAnimation={showFields && needsExtraction}
                        readOnly={isReadOnly}
                      />
                      <FormField
                        label="Policy Number"
                        value={extraction.policyNumber.value}
                        confidence={extraction.policyNumber.confidence}
                        onChange={(v) => updateField('policyNumber', v)}
                        showAnimation={showFields && needsExtraction}
                        readOnly={isReadOnly}
                      />
                      <FormField
                        label="Group Number"
                        value={extraction.groupNumber.value}
                        confidence={extraction.groupNumber.confidence}
                        onChange={(v) => updateField('groupNumber', v)}
                        showAnimation={showFields && needsExtraction}
                        readOnly={isReadOnly}
                      />
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          {showFields && (
            <div className="bg-card border-t border-border px-6 py-4">
              {isReadOnly ? (
                <button
                  onClick={() => navigate('/')}
                  className="w-full py-2.5 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2"
                >
                  Back to Tasks
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : needsExtraction ? (
                    'Continue'
                  ) : (
                    'Save Changes'
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

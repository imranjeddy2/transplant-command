import { motion } from 'framer-motion';
import {
  Bell,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  Clock,
  Pill,
  AlertTriangle,
  Activity,
  Users,
  Car,
  Home,
  ClipboardCheck,
  Stethoscope,
  MessageSquare,
  PhoneCall,
} from 'lucide-react';
import type { PreEvaluationData, PreEvaluationStatus, ExtractedField, ConfidenceLevel } from '@/types';

interface PreEvalResultsTabProps {
  preEvaluation: PreEvaluationData | null;
}

const statusConfig: Record<
  PreEvaluationStatus,
  { label: string; color: string; bgColor: string; icon: typeof Bell }
> = {
  notified: {
    label: 'Patient Notified',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    icon: Bell,
  },
  scheduled: {
    label: 'Call Scheduled',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    icon: Calendar,
  },
  completed: {
    label: 'Call Completed',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    icon: CheckCircle2,
  },
  info_verified: {
    label: 'Info Verified',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    icon: ShieldCheck,
  },
};

const confidenceColors: Record<ConfidenceLevel, { bg: string; text: string; label: string }> = {
  high: { bg: 'bg-green-100', text: 'text-green-700', label: 'High' },
  medium: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Medium' },
  low: { bg: 'bg-red-100', text: 'text-red-700', label: 'Low' },
};

function ConfidenceBadge({ confidence }: { confidence: ConfidenceLevel }) {
  const config = confidenceColors[confidence];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}

function ExtractedFieldDisplay({
  label,
  field,
  icon: Icon,
}: {
  label: string;
  field: ExtractedField;
  icon: typeof Pill;
}) {
  return (
    <div className="bg-muted/30 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <ConfidenceBadge confidence={field.confidence} />
          </div>
          <p className="text-foreground">{field.value}</p>
        </div>
      </div>
    </div>
  );
}

function StatusTimeline({ preEvaluation }: { preEvaluation: PreEvaluationData }) {
  const steps = [
    {
      key: 'notified',
      label: 'Notified',
      timestamp: preEvaluation.notifiedAt,
      icon: Bell,
    },
    {
      key: 'scheduled',
      label: 'Scheduled',
      timestamp: preEvaluation.scheduledAt,
      icon: Calendar,
    },
    {
      key: 'completed',
      label: 'Completed',
      timestamp: preEvaluation.completedAt,
      icon: CheckCircle2,
    },
    {
      key: 'verified',
      label: 'Verified',
      timestamp: preEvaluation.verifiedAt,
      icon: ShieldCheck,
    },
  ];

  const statusOrder: PreEvaluationStatus[] = ['notified', 'scheduled', 'completed', 'info_verified'];
  const currentStatusIndex = statusOrder.indexOf(preEvaluation.status);

  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => {
        const isCompleted = index <= currentStatusIndex;
        const isCurrent = index === currentStatusIndex;
        const Icon = step.icon;

        return (
          <div key={step.key} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isCompleted
                    ? isCurrent
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-green-100 text-green-600'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <p className={`text-xs mt-2 font-medium ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                {step.label}
              </p>
              {step.timestamp && (
                <p className="text-xs text-muted-foreground">
                  {new Date(step.timestamp).toLocaleDateString()}
                </p>
              )}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 ${
                  index < currentStatusIndex ? 'bg-green-200' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function PreEvalResultsTab({ preEvaluation }: PreEvalResultsTabProps) {
  if (!preEvaluation) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <PhoneCall className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-1">No Pre-Evaluation Data</h3>
        <p className="text-muted-foreground max-w-sm">
          Pre-evaluation data will appear here once the patient has been scheduled for or completed their AI bot call.
        </p>
      </div>
    );
  }

  const statusInfo = statusConfig[preEvaluation.status];
  const StatusIcon = statusInfo.icon;
  const hasResults = preEvaluation.status === 'completed' || preEvaluation.status === 'info_verified';

  return (
    <div className="space-y-6">
      {/* Status Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-lg border border-border p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${statusInfo.bgColor}`}>
              <StatusIcon className={`h-5 w-5 ${statusInfo.color}`} />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Pre-Evaluation Status</h3>
              <p className={`text-sm font-medium ${statusInfo.color}`}>{statusInfo.label}</p>
            </div>
          </div>
          {preEvaluation.actualCallDuration && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-sm">{preEvaluation.actualCallDuration} min call</span>
            </div>
          )}
        </div>

        <StatusTimeline preEvaluation={preEvaluation} />

        {preEvaluation.scheduledCallTime && preEvaluation.status === 'scheduled' && (
          <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-sm text-amber-800">
              <span className="font-medium">Scheduled Call:</span>{' '}
              {new Date(preEvaluation.scheduledCallTime).toLocaleString()}
            </p>
          </div>
        )}
      </motion.div>

      {/* Medical History Section */}
      {hasResults && preEvaluation.medicalHistory && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-lg border border-border p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Stethoscope className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Medical History</h3>
          </div>
          <div className="grid gap-4">
            <ExtractedFieldDisplay
              label="Previous Surgeries"
              field={preEvaluation.medicalHistory.previousSurgeries}
              icon={Activity}
            />
            <ExtractedFieldDisplay
              label="Current Medications"
              field={preEvaluation.medicalHistory.currentMedications}
              icon={Pill}
            />
            <ExtractedFieldDisplay
              label="Allergies"
              field={preEvaluation.medicalHistory.allergies}
              icon={AlertTriangle}
            />
            <ExtractedFieldDisplay
              label="Current Symptoms"
              field={preEvaluation.medicalHistory.symptoms}
              icon={Activity}
            />
          </div>
        </motion.div>
      )}

      {/* Lifestyle Information Section */}
      {hasResults && preEvaluation.lifestyleInfo && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-lg border border-border p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Lifestyle Information</h3>
          </div>
          <div className="grid gap-4">
            <ExtractedFieldDisplay
              label="Support System"
              field={preEvaluation.lifestyleInfo.supportSystem}
              icon={Users}
            />
            <ExtractedFieldDisplay
              label="Transportation"
              field={preEvaluation.lifestyleInfo.transportation}
              icon={Car}
            />
            <ExtractedFieldDisplay
              label="Living Situation"
              field={preEvaluation.lifestyleInfo.livingSituation}
              icon={Home}
            />
            <ExtractedFieldDisplay
              label="Compliance History"
              field={preEvaluation.lifestyleInfo.complianceHistory}
              icon={ClipboardCheck}
            />
          </div>
        </motion.div>
      )}

      {/* Verification Notes */}
      {preEvaluation.status === 'info_verified' && preEvaluation.verifiedBy && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-lg border border-border p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Verification Notes</h3>
          </div>
          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
            <p className="text-sm font-medium text-emerald-800 mb-2">
              Verified by {preEvaluation.verifiedBy}
            </p>
            {preEvaluation.verificationNotes && (
              <p className="text-emerald-700">{preEvaluation.verificationNotes}</p>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

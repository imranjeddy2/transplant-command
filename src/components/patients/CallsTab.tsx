import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Clock, User, ChevronDown, ChevronUp, Calendar, FileText } from 'lucide-react';
import type { PatientCall } from '@/types';
import { getCallsByPatientId } from '@/data/mockData';

interface CallsTabProps {
  patientId: string;
  patientName: string;
}

const statusConfig: Record<PatientCall['status'], { label: string; color: string; bgColor: string }> = {
  completed: {
    label: 'Completed',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  scheduled: {
    label: 'Scheduled',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
  },
  missed: {
    label: 'Missed',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
};

function CallCard({ call }: { call: PatientCall }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const status = statusConfig[call.status];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDuration = (minutes: number) => {
    if (minutes === 0) return 'Pending';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl border border-border overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Phone className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Pre-Evaluation Call</h3>
              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{formatDate(call.date)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{formatTime(call.date)}</span>
                </div>
              </div>
            </div>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>
            {status.label}
          </span>
        </div>

        {/* Call metadata */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Duration</p>
              <p className="text-sm font-medium text-foreground">{formatDuration(call.duration)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Coordinator</p>
              <p className="text-sm font-medium text-foreground">{call.coordinator}</p>
            </div>
          </div>
        </div>

        {/* Summary */}
        {call.summary && (
          <div className="mt-4 p-3 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Summary: </span>
              {call.summary}
            </p>
          </div>
        )}
      </div>

      {/* Transcript section */}
      {call.transcript && (
        <>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">View Transcript</span>
            </div>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4">
                  <div className="bg-muted/20 rounded-lg p-4 max-h-96 overflow-y-auto">
                    <pre className="text-sm text-foreground whitespace-pre-wrap font-mono leading-relaxed">
                      {call.transcript.split('\n').map((line, index) => {
                        const isCoordinator = line.startsWith('Coordinator:');
                        const isPatient = line.startsWith('Patient:');

                        if (isCoordinator || isPatient) {
                          const [speaker, ...rest] = line.split(':');
                          return (
                            <div key={index} className="mb-2">
                              <span className={`font-semibold ${isCoordinator ? 'text-primary' : 'text-green-600'}`}>
                                {speaker}:
                              </span>
                              <span className="text-foreground">{rest.join(':')}</span>
                            </div>
                          );
                        }
                        return line ? <div key={index} className="mb-2 text-muted-foreground">{line}</div> : <div key={index} className="h-2" />;
                      })}
                    </pre>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </motion.div>
  );
}

export function CallsTab({ patientId, patientName }: CallsTabProps) {
  const calls = getCallsByPatientId(patientId);

  if (calls.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <Phone className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-1">No Calls Recorded</h3>
        <p className="text-muted-foreground max-w-sm">
          No calls recorded for {patientName} yet. Calls will appear here once scheduled or completed.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {calls.map((call, index) => (
        <motion.div
          key={call.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <CallCard call={call} />
        </motion.div>
      ))}
    </div>
  );
}

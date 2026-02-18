import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Clock, Volume2, HelpCircle, CheckCircle2, PhoneCall, Loader2, ExternalLink } from 'lucide-react';
import type { TransplantCenterConfig } from '@/config/transplantCenters';
import { useCallStatus } from '@/hooks/useCallStatus';
import { updatePreEvaluationWithCallResults } from '@/data/mockData';
import type { CallStatus } from '@/services/callService';

interface CallNowConfirmationProps {
  patientPhone: string;
  center: TransplantCenterConfig;
  callId: string;
  patientId: string;
}

function CallStatusIndicator({ status, primaryColor }: { status: CallStatus | null; primaryColor: string }) {
  if (!status) return null;

  const statusConfig: Record<CallStatus, { icon: typeof Phone; label: string; animate: boolean; color: string }> = {
    initiating: {
      icon: Loader2,
      label: 'Connecting...',
      animate: true,
      color: 'text-amber-600',
    },
    ringing: {
      icon: PhoneCall,
      label: 'Ringing your phone...',
      animate: true,
      color: 'text-amber-600',
    },
    in_progress: {
      icon: Phone,
      label: 'Call in progress',
      animate: true,
      color: 'text-green-600',
    },
    ended: {
      icon: CheckCircle2,
      label: 'Call completed',
      animate: false,
      color: 'text-green-600',
    },
    failed: {
      icon: Phone,
      label: 'Call failed',
      animate: false,
      color: 'text-red-600',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-2">
      <Icon
        className={`h-5 w-5 ${config.color} ${config.animate ? 'animate-pulse' : ''}`}
        style={status === 'in_progress' ? { color: primaryColor } : undefined}
      />
      <span className={`font-medium ${config.color}`}>{config.label}</span>
    </div>
  );
}

function CallDurationTimer({ startedAt }: { startedAt: string | null }) {
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!startedAt) return;

    const startTime = new Date(startedAt).getTime();
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      setDuration(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [startedAt]);

  if (!startedAt) return null;

  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;

  return (
    <div className="flex items-center gap-2 text-gray-600">
      <Clock className="h-4 w-4" />
      <span className="font-mono">
        {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
      </span>
    </div>
  );
}

export function CallNowConfirmation({ patientPhone, center, callId, patientId }: CallNowConfirmationProps) {
  const [dataUpdated, setDataUpdated] = useState(false);

  const {
    status,
    startedAt,
    endedAt: _endedAt,
    duration,
    extractedData: _extractedData,
    error,
    startPolling,
  } = useCallStatus({
    pollInterval: 3000,
    onCallEnded: (data) => {
      // Update patient's pre-evaluation with extracted data
      if (data) {
        try {
          updatePreEvaluationWithCallResults(patientId, {
            medicalHistory: data.medicalHistory,
            lifestyleInfo: data.lifestyleInfo,
            actualCallDuration: duration || 0,
          });
          setDataUpdated(true);
        } catch (err) {
          console.error('Failed to update pre-evaluation data:', err);
        }
      }
    },
  });

  // Start polling when component mounts
  useEffect(() => {
    if (callId) {
      startPolling(callId);
    }
  }, [callId, startPolling]);

  const isCallEnded = status === 'ended';
  const isCallActive = status === 'in_progress' || status === 'ringing';

  return (
    <div className="text-center space-y-8">
      {/* Status Animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 15,
          delay: 0.1,
        }}
        className="inline-flex items-center justify-center w-20 h-20 rounded-full"
        style={{ backgroundColor: isCallEnded ? '#dcfce7' : `${center.primaryColor}15` }}
      >
        {isCallEnded ? (
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        ) : (
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <Phone className="h-10 w-10" style={{ color: center.primaryColor }} />
          </motion.div>
        )}
      </motion.div>

      {/* Main Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {isCallEnded ? (
          <>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Call Completed!
            </h2>
            <p className="text-gray-600">
              Thank you for completing your pre-evaluation call. Your information has been recorded.
            </p>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              {status === 'in_progress' ? 'Call In Progress' : "We're Calling You Now!"}
            </h2>
            <p className="text-gray-600">
              {status === 'in_progress'
                ? 'Please continue your conversation with our AI assistant.'
                : 'Please stay by your phone. Our AI assistant will call you shortly.'}
            </p>
          </>
        )}
      </motion.div>

      {/* Call Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gray-50 rounded-xl p-6 text-left space-y-4"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${center.primaryColor}15` }}
            >
              <Phone className="h-5 w-5" style={{ color: center.primaryColor }} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Calling</p>
              <p className="font-semibold text-gray-900">{patientPhone}</p>
            </div>
          </div>
          <CallStatusIndicator status={status} primaryColor={center.primaryColor} />
        </div>

        {/* Call Duration */}
        {(isCallActive || isCallEnded) && (
          <div className="flex items-start gap-4">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${center.primaryColor}15` }}
            >
              <Clock className="h-5 w-5" style={{ color: center.primaryColor }} />
            </div>
            <div>
              <p className="text-sm text-gray-500">
                {isCallEnded ? 'Call Duration' : 'Elapsed Time'}
              </p>
              {isCallEnded && duration ? (
                <p className="font-semibold text-gray-900">{duration} minutes</p>
              ) : (
                <CallDurationTimer startedAt={startedAt} />
              )}
            </div>
          </div>
        )}
      </motion.div>

      {/* Tips (show when call not ended) */}
      {!isCallEnded && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-left"
        >
          <div className="flex items-center gap-2 mb-3">
            <Volume2 className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">Tips for your call</h3>
          </div>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• Find a quiet place to talk</li>
            <li>• Have your medication list handy if possible</li>
            <li>• The call will take about 15-20 minutes</li>
            <li>• Answer any incoming call from an unknown number</li>
          </ul>
        </motion.div>
      )}

      {/* Success Message (show when call ended) */}
      {isCallEnded && dataUpdated && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-green-50 border border-green-200 rounded-xl p-5 text-left"
        >
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <h3 className="font-semibold text-green-900">Information Captured</h3>
          </div>
          <p className="text-sm text-green-800 mb-4">
            We've captured your medical history and lifestyle information. Our care team will review this before your evaluation.
          </p>
          <a
            href={`/patients/${patientId}?tab=pre-eval`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-green-700 hover:text-green-800 hover:underline"
          >
            View your pre-evaluation results
            <ExternalLink className="h-4 w-4" />
          </a>
        </motion.div>
      )}

      {/* Error message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-xl p-5 text-left"
        >
          <p className="text-sm text-red-800">
            {error.message || 'An error occurred. Please try again.'}
          </p>
        </motion.div>
      )}

      {/* Help section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex items-start gap-3 text-left bg-white border border-gray-200 rounded-xl p-4"
      >
        <HelpCircle className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-gray-600">
            {isCallEnded ? 'Have questions? ' : "Didn't receive a call? "}
            Contact us at{' '}
            <a
              href={`tel:${center.contactPhone.replace(/[^0-9]/g, '')}`}
              className="font-medium hover:underline"
              style={{ color: center.primaryColor }}
            >
              {center.contactPhone}
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

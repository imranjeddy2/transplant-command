import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, Loader2, Phone } from 'lucide-react';
import { getTransplantCenter, defaultCenterId } from '@/config/transplantCenters';
import {
  validateSchedulingToken,
  getAvailableTimeSlots,
  schedulePreEvaluationCall,
} from '@/data/mockData';
import { initiateCall } from '@/services/callService';
import type { TimeSlot, SchedulePatientData } from '@/types';
import type { TransplantCenterConfig } from '@/config/transplantCenters';
import { SchedulingHeader } from './SchedulingHeader';
import { PatientGreeting } from './PatientGreeting';
import { CallExplanation } from './CallExplanation';
import { TimeSlotPicker } from './TimeSlotPicker';
import { ConfirmationView } from './ConfirmationView';
import { CallNowConfirmation } from './CallNowConfirmation';

type SchedulingStep = 'loading' | 'error' | 'ready' | 'confirming' | 'confirmed' | 'call_now_confirming' | 'call_now_confirmed';
type ErrorType = 'invalid_token' | 'already_scheduled' | 'network_error' | 'call_failed';

interface SchedulingState {
  step: SchedulingStep;
  patient: SchedulePatientData | null;
  center: TransplantCenterConfig | null;
  slots: TimeSlot[];
  selectedSlot: TimeSlot | null;
  errorType: ErrorType | null;
  scheduledTime: string | null;
  callId: string | null;
}

function ErrorView({ errorType, center }: { errorType: ErrorType; center: TransplantCenterConfig | null }) {
  const messages: Record<ErrorType, { title: string; description: string }> = {
    invalid_token: {
      title: 'Invalid or Expired Link',
      description: 'This scheduling link is no longer valid. Please contact your care team for a new link.',
    },
    already_scheduled: {
      title: 'Already Scheduled',
      description: 'You already have a pre-evaluation call scheduled. Check your confirmation for details.',
    },
    network_error: {
      title: 'Something Went Wrong',
      description: 'We encountered an error loading your information. Please try again or contact us.',
    },
    call_failed: {
      title: 'Unable to Place Call',
      description: 'We were unable to initiate the call. Please try again or schedule for a later time.',
    },
  };

  const { title, description } = messages[errorType];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center"
      >
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600 mb-6">{description}</p>
        {center && (
          <p className="text-sm text-gray-500">
            Need help? Call us at{' '}
            <a
              href={`tel:${center.contactPhone.replace(/[^0-9]/g, '')}`}
              className="font-medium text-purple-600 hover:underline"
            >
              {center.contactPhone}
            </a>
          </p>
        )}
      </motion.div>
    </div>
  );
}

function LoadingView() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <Loader2 className="h-8 w-8 text-purple-600 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Loading your information...</p>
      </motion.div>
    </div>
  );
}

export function SchedulingPage() {
  const { token } = useParams<{ token: string }>();
  const [state, setState] = useState<SchedulingState>({
    step: 'loading',
    patient: null,
    center: null,
    slots: [],
    selectedSlot: null,
    errorType: null,
    scheduledTime: null,
    callId: null,
  });

  useEffect(() => {
    // Simulate loading delay for realistic feel
    const loadData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 800));

      if (!token) {
        setState((prev) => ({
          ...prev,
          step: 'error',
          errorType: 'invalid_token',
          center: getTransplantCenter(defaultCenterId),
        }));
        return;
      }

      const patient = validateSchedulingToken(token);

      if (!patient) {
        setState((prev) => ({
          ...prev,
          step: 'error',
          errorType: 'invalid_token',
          center: getTransplantCenter(defaultCenterId),
        }));
        return;
      }

      const center = getTransplantCenter(patient.centerId);
      const slots = getAvailableTimeSlots();

      setState({
        step: 'ready',
        patient,
        center,
        slots,
        selectedSlot: null,
        errorType: null,
        scheduledTime: null,
        callId: null,
      });
    };

    loadData();
  }, [token]);

  const handleSelectSlot = (slot: TimeSlot) => {
    setState((prev) => ({ ...prev, selectedSlot: slot }));
  };

  const handleConfirm = async () => {
    if (!state.selectedSlot || !state.patient) return;

    setState((prev) => ({ ...prev, step: 'confirming' }));

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Schedule the call
    schedulePreEvaluationCall(state.patient.id, state.selectedSlot.datetime);

    setState((prev) => ({
      ...prev,
      step: 'confirmed',
      scheduledTime: state.selectedSlot!.datetime,
    }));
  };

  const handleCallNow = async () => {
    if (!state.patient) return;

    setState((prev) => ({ ...prev, step: 'call_now_confirming' }));

    try {
      // Call backend to initiate Vapi call
      const response = await initiateCall(
        state.patient.id,
        state.patient.phone,
        `${state.patient.firstName} ${state.patient.lastName}`
      );

      // Update local pre-evaluation status
      schedulePreEvaluationCall(state.patient.id, new Date().toISOString());

      setState((prev) => ({
        ...prev,
        step: 'call_now_confirmed',
        callId: response.callId,
      }));
    } catch (error) {
      console.error('Failed to initiate call:', error);
      setState((prev) => ({
        ...prev,
        step: 'error',
        errorType: 'call_failed',
      }));
    }
  };

  if (state.step === 'loading') {
    return <LoadingView />;
  }

  if (state.step === 'error' && state.errorType) {
    return <ErrorView errorType={state.errorType} center={state.center} />;
  }

  if (!state.center || !state.patient) {
    return <LoadingView />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SchedulingHeader center={state.center} />

      <main className="max-w-2xl mx-auto px-4 py-8">
        {state.step === 'confirmed' && state.scheduledTime ? (
          <ConfirmationView
            scheduledTime={state.scheduledTime}
            patientPhone={state.patient.phone}
            center={state.center}
          />
        ) : state.step === 'call_now_confirmed' && state.callId ? (
          <CallNowConfirmation
            patientPhone={state.patient.phone}
            center={state.center}
            callId={state.callId}
            patientId={state.patient.id}
          />
        ) : (
          <div className="space-y-8">
            <PatientGreeting
              firstName={state.patient.firstName}
              welcomeMessage={state.center.welcomeMessage}
            />

            <CallExplanation />

            {/* Call Me Now Option */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Available right now?</h3>
                    <p className="text-sm text-gray-600">
                      Get your pre-evaluation call immediately instead of scheduling for later.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCallNow}
                  disabled={state.step === 'call_now_confirming'}
                  className="w-full sm:w-auto px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {state.step === 'call_now_confirming' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Calling...
                    </>
                  ) : (
                    <>
                      <Phone className="h-4 w-4" />
                      Call Me Now
                    </>
                  )}
                </button>
              </div>
            </motion.div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-50 text-gray-500">or schedule for later</span>
              </div>
            </div>

            <TimeSlotPicker
              slots={state.slots}
              selectedSlot={state.selectedSlot}
              onSelectSlot={handleSelectSlot}
              onConfirm={handleConfirm}
              isConfirming={state.step === 'confirming'}
              primaryColor={state.center.primaryColor}
            />
          </div>
        )}
      </main>
    </div>
  );
}

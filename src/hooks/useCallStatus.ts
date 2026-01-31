// Hook for polling call status

import { useState, useEffect, useCallback, useRef } from 'react';
import { getCallStatus, type CallStatus, type CallStatusResponse, type ExtractedCallData } from '@/services/callService';

interface UseCallStatusOptions {
  pollInterval?: number; // ms
  onStatusChange?: (status: CallStatus) => void;
  onCallEnded?: (data: ExtractedCallData | null) => void;
  onError?: (error: Error) => void;
}

interface UseCallStatusReturn {
  status: CallStatus | null;
  startedAt: string | null;
  endedAt: string | null;
  duration: number | null;
  transcript: string | null;
  extractedData: ExtractedCallData | null;
  error: Error | null;
  isPolling: boolean;
  startPolling: (callId: string) => void;
  stopPolling: () => void;
}

export function useCallStatus(options: UseCallStatusOptions = {}): UseCallStatusReturn {
  const { pollInterval = 3000 } = options;

  const [status, setStatus] = useState<CallStatus | null>(null);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [endedAt, setEndedAt] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedCallData | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  const intervalRef = useRef<number | null>(null);
  const previousStatusRef = useRef<CallStatus | null>(null);
  const callIdRef = useRef<string | null>(null);

  // Use refs for callbacks to avoid dependency changes
  const onStatusChangeRef = useRef(options.onStatusChange);
  const onCallEndedRef = useRef(options.onCallEnded);
  const onErrorRef = useRef(options.onError);

  // Keep refs updated
  useEffect(() => {
    onStatusChangeRef.current = options.onStatusChange;
    onCallEndedRef.current = options.onCallEnded;
    onErrorRef.current = options.onError;
  });

  const stopPolling = useCallback(() => {
    console.log('[useCallStatus] stopPolling called, intervalRef:', intervalRef.current);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPolling(false);
  }, []);

  const pollStatus = useCallback(async () => {
    const id = callIdRef.current;
    console.log('[useCallStatus] pollStatus called, callId:', id);
    if (!id) {
      console.log('[useCallStatus] pollStatus early return - no callId');
      return;
    }

    try {
      console.log('[useCallStatus] Fetching status from API...');
      const response: CallStatusResponse = await getCallStatus(id);
      console.log('[useCallStatus] API response:', response.status);

      setStatus(response.status);
      setStartedAt(response.startedAt || null);
      setEndedAt(response.endedAt || null);
      setDuration(response.duration || null);
      setTranscript(response.transcript || null);

      // Notify on status change
      if (response.status !== previousStatusRef.current) {
        previousStatusRef.current = response.status;
        onStatusChangeRef.current?.(response.status);
      }

      // If call ended, stop polling and extract data
      if (response.status === 'ended') {
        console.log('[useCallStatus] Call ended, stopping polling');
        setExtractedData(response.extractedData || null);
        onCallEndedRef.current?.(response.extractedData || null);
        stopPolling();
      }

      // If call failed, stop polling
      if (response.status === 'failed') {
        console.log('[useCallStatus] Call failed, stopping polling');
        const err = new Error(response.error || 'Call failed');
        setError(err);
        onErrorRef.current?.(err);
        stopPolling();
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      onErrorRef.current?.(error);
      // Don't stop polling on network errors - might be temporary
      console.error('[useCallStatus] Error polling call status:', error);
    }
  }, [stopPolling]);

  const startPolling = useCallback((id: string) => {
    console.log('[useCallStatus] startPolling called with id:', id);
    console.log('[useCallStatus] Current state - callIdRef:', callIdRef.current, 'intervalRef:', intervalRef.current);

    // Prevent duplicate polling for same call
    if (callIdRef.current === id && intervalRef.current) {
      console.log('[useCallStatus] Skipping - already polling for this call');
      return;
    }

    // Reset state
    callIdRef.current = id;
    setStatus('initiating');
    setStartedAt(null);
    setEndedAt(null);
    setDuration(null);
    setTranscript(null);
    setExtractedData(null);
    setError(null);
    previousStatusRef.current = 'initiating';

    // Clear existing interval
    if (intervalRef.current) {
      console.log('[useCallStatus] Clearing existing interval:', intervalRef.current);
      clearInterval(intervalRef.current);
    }

    setIsPolling(true);

    // Poll immediately
    console.log('[useCallStatus] Calling pollStatus immediately');
    pollStatus();

    // Then poll at interval
    console.log('[useCallStatus] Setting up interval with pollInterval:', pollInterval);
    intervalRef.current = window.setInterval(pollStatus, pollInterval);
    console.log('[useCallStatus] Interval created:', intervalRef.current);
  }, [pollInterval, pollStatus]);

  // Cleanup on unmount
  useEffect(() => {
    console.log('[useCallStatus] Hook mounted');
    return () => {
      console.log('[useCallStatus] Hook unmounting, clearing interval:', intervalRef.current);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;  // Reset ref so remount doesn't see stale value
      }
    };
  }, []);

  return {
    status,
    startedAt,
    endedAt,
    duration,
    transcript,
    extractedData,
    error,
    isPolling,
    startPolling,
    stopPolling,
  };
}

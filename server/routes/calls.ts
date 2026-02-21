// Call initiation and status routes

import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { initiateOutboundCall, getCallStatus, mapVapiStatus } from '../services/vapiService.js';
import { extractDataFromTranscript, calculateCallDuration } from '../services/extractionService.js';
import { createCall, getCall, updateCall, resetDemo, resetPatient, getAllCalls, getAllCallsByPatientId, getPatientCallResults } from '../store/demoStore.js';
import type { InitiateCallRequest, StoredCall, CallStatus } from '../types.js';

const router = Router();

// POST /api/calls/initiate - Start a new call
router.post('/initiate', async (req: Request, res: Response) => {
  try {
    const { patientId, phoneNumber, patientName } = req.body as InitiateCallRequest;

    if (!patientId || !phoneNumber || !patientName) {
      res.status(400).json({ error: 'Missing required fields: patientId, phoneNumber, patientName' });
      return;
    }

    // Use demo phone number from env if set, otherwise use patient's phone
    const demoPhone = process.env.DEMO_PHONE_NUMBER;
    const targetPhone = demoPhone || phoneNumber;

    // Validate phone number format (basic check)
    const cleanPhone = targetPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      res.status(400).json({ error: 'Invalid phone number format' });
      return;
    }

    // Format phone number for Vapi (E.164 format)
    const formattedPhone = cleanPhone.startsWith('1') ? `+${cleanPhone}` : `+1${cleanPhone}`;

    console.log(`Initiating call to ${formattedPhone} for patient ${patientId}`);

    // Call Vapi API
    const vapiResponse = await initiateOutboundCall(formattedPhone, { patientId, patientName });

    // Generate internal call ID
    const callId = uuidv4();

    // Store call in memory
    const storedCall: StoredCall = {
      callId,
      patientId,
      patientName,
      phoneNumber: formattedPhone,
      status: mapVapiStatus(vapiResponse.status),
      vapiCallId: vapiResponse.id,
      createdAt: new Date().toISOString(),
    };

    createCall(storedCall);

    console.log(`Call initiated: ${callId} (Vapi: ${vapiResponse.id})`);

    res.json({
      callId,
      status: storedCall.status,
    });
  } catch (error) {
    console.error('Error initiating call:', error);
    res.status(500).json({
      error: 'Failed to initiate call',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/calls/patient/:patientId - Get all completed calls for a patient
router.get('/patient/:patientId', (req: Request, res: Response) => {
  const { patientId } = req.params;
  const patientCalls = getAllCallsByPatientId(patientId);
  res.json(patientCalls);
});

// GET /api/calls/patient/:patientId/extracted - Get latest extracted data for a patient
router.get('/patient/:patientId/extracted', (req: Request, res: Response) => {
  const { patientId } = req.params;
  const extracted = getPatientCallResults(patientId);
  if (!extracted) {
    res.status(404).json({ error: 'No extracted data found' });
    return;
  }
  res.json(extracted);
});

// GET /api/calls/:callId/status - Get call status
router.get('/:callId/status', async (req: Request, res: Response) => {
  try {
    const { callId } = req.params;

    const storedCall = getCall(callId);
    if (!storedCall) {
      res.status(404).json({ error: 'Call not found' });
      return;
    }

    // If call already ended with extracted data, return cached result
    if (storedCall.status === 'ended' && storedCall.extractedData) {
      res.json({
        callId,
        status: storedCall.status,
        startedAt: storedCall.startedAt,
        endedAt: storedCall.endedAt,
        duration: calculateCallDuration(storedCall.startedAt, storedCall.endedAt),
        transcript: storedCall.transcript,
        extractedData: storedCall.extractedData,
      });
      return;
    }

    // Poll Vapi for current status
    const vapiStatus = await getCallStatus(storedCall.vapiCallId);
    console.log(`Vapi status for ${callId}:`, JSON.stringify({
      status: vapiStatus.status,
      startedAt: vapiStatus.startedAt,
      endedAt: vapiStatus.endedAt,
      hasTranscript: !!vapiStatus.transcript
    }));

    const mappedStatus: CallStatus = mapVapiStatus(vapiStatus.status);
    console.log(`Mapped status: ${mappedStatus}`);

    // Update stored call
    const updates: Partial<StoredCall> = {
      status: mappedStatus,
      startedAt: vapiStatus.startedAt,
      endedAt: vapiStatus.endedAt,
    };

    // If call ended, extract data from transcript using Claude
    if (mappedStatus === 'ended') {
      console.log(`Call ${callId} ended, extracting data from transcript...`);
      updates.transcript = vapiStatus.transcript || '';
      updates.extractedData = await extractDataFromTranscript(vapiStatus.transcript || '');
    }

    updateCall(callId, updates);

    const duration = calculateCallDuration(vapiStatus.startedAt, vapiStatus.endedAt);

    res.json({
      callId,
      status: mappedStatus,
      startedAt: vapiStatus.startedAt,
      endedAt: vapiStatus.endedAt,
      duration,
      transcript: mappedStatus === 'ended' ? vapiStatus.transcript : undefined,
      extractedData: updates.extractedData || null,
    });
  } catch (error) {
    console.error('Error getting call status:', error);
    res.status(500).json({
      error: 'Failed to get call status',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/demo/reset - Reset all demo data
router.post('/demo/reset', (_req: Request, res: Response) => {
  resetDemo();
  res.json({ success: true, message: 'Demo data has been reset' });
});

// POST /api/demo/reset/:patientId - Reset demo data for specific patient
router.post('/demo/reset/:patientId', (req: Request, res: Response) => {
  const { patientId } = req.params;
  resetPatient(patientId);
  res.json({ success: true, message: `Demo data reset for patient: ${patientId}` });
});

// GET /api/calls - List all calls (for debugging)
router.get('/', (_req: Request, res: Response) => {
  const calls = getAllCalls();
  res.json(calls);
});

export default router;

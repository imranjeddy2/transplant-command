// Webhook handlers for Vapi and Retell post-call events

import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { replacePatientCall } from '../store/demoStore.js';
import { extractDataFromTranscript } from '../services/extractionService.js';
import type { StoredCall, VapiCallResponse } from '../types.js';

const router = Router();

// Normalize provider transcript format to our "Coordinator: / Patient:" format
function normalizeTranscript(transcript: string): string {
  return transcript
    .replace(/^AI:/gm, 'Coordinator:')
    .replace(/^Assistant:/gm, 'Coordinator:')
    .replace(/^Agent:/gm, 'Coordinator:')
    .replace(/^User:/gm, 'Patient:');
}

// POST /api/webhooks/vapi
// Vapi sends a POST for each call event; we only process end-of-call-report
// Always overwrites the previous call for p-manpreet-vapi
router.post('/vapi', async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const messageType = payload?.message?.type;

    if (messageType !== 'end-of-call-report') {
      res.json({ received: true });
      return;
    }

    const { message } = payload;
    const call = message.call;

    const patientId: string = call?.metadata?.patientId || 'p-manpreet-vapi';
    const patientName: string = call?.metadata?.patientName || 'Manpreet Vapi';

    const vapiCallId: string = call.id || uuidv4();
    const rawTranscript: string = message.transcript || '';
    const transcript = normalizeTranscript(rawTranscript);
    const summary: string = message.analysis?.summary || message.summary || '';
    const startedAt: string | undefined = call.startedAt;
    const endedAt: string | undefined = call.endedAt;

    const storedCall: StoredCall = {
      callId: vapiCallId,
      patientId,
      patientName,
      phoneNumber: call.customer?.number || '',
      vapiCallId,
      createdAt: call.createdAt || new Date().toISOString(),
      status: 'ended',
      transcript,
      summary,
      startedAt,
      endedAt,
      extractedData: extractDataFromTranscript({ ...call, transcript: rawTranscript } as VapiCallResponse),
    };

    replacePatientCall(storedCall);

    console.log(`[Vapi webhook] Replaced call for patient ${patientId} (call ${vapiCallId})`);
    res.json({ received: true });
  } catch (error) {
    console.error('[Vapi webhook] Error processing payload:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

// POST /api/webhooks/retell
// Retell sends a POST for each call event; we only process call_ended
// Always overwrites the previous call for p-manpreet-retell
router.post('/retell', async (req: Request, res: Response) => {
  try {
    const payload = req.body;

    if (payload?.event !== 'call_ended') {
      res.json({ received: true });
      return;
    }

    const { call } = payload;

    const patientId: string = call?.metadata?.patientId || 'p-manpreet-retell';
    const patientName: string = call?.metadata?.patientName || 'Manpreet Retell';

    const retellCallId: string = call.call_id || uuidv4();
    const rawTranscript: string = call.transcript || '';
    const transcript = normalizeTranscript(rawTranscript);
    const summary: string = call.call_analysis?.call_summary || '';

    // Retell timestamps are Unix ms
    const startedAt = call.start_timestamp ? new Date(call.start_timestamp).toISOString() : undefined;
    const endedAt = call.end_timestamp ? new Date(call.end_timestamp).toISOString() : undefined;

    const storedCall: StoredCall = {
      callId: retellCallId,
      patientId,
      patientName,
      phoneNumber: call.to_number || call.from_number || '',
      status: 'ended',
      vapiCallId: retellCallId,
      createdAt: startedAt || new Date().toISOString(),
      startedAt,
      endedAt,
      transcript,
      summary,
      extractedData: extractDataFromTranscript({ transcript: rawTranscript } as VapiCallResponse),
    };

    replacePatientCall(storedCall);

    console.log(`[Retell webhook] Replaced call for patient ${patientId} (call ${retellCallId})`);
    res.json({ received: true });
  } catch (error) {
    console.error('[Retell webhook] Error processing payload:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

export default router;

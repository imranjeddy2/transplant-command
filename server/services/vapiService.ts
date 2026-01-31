// Vapi API integration service

import type { VapiCallResponse, VapiCallStatus, CallStatus } from '../types.js';

const VAPI_BASE_URL = 'https://api.vapi.ai';

function getApiKey(): string {
  const apiKey = process.env.VAPI_API_KEY;
  if (!apiKey) {
    throw new Error('VAPI_API_KEY environment variable is not set');
  }
  return apiKey;
}

function getAssistantId(): string {
  const assistantId = process.env.VAPI_ASSISTANT_ID;
  if (!assistantId) {
    throw new Error('VAPI_ASSISTANT_ID environment variable is not set');
  }
  return assistantId;
}

function getPhoneNumberId(): string {
  const phoneNumberId = process.env.VAPI_PHONE_NUMBER_ID;
  if (!phoneNumberId) {
    throw new Error('VAPI_PHONE_NUMBER_ID environment variable is not set');
  }
  return phoneNumberId;
}

export function mapVapiStatus(vapiStatus: VapiCallStatus | string): CallStatus {
  // Log the raw status for debugging
  console.log(`Raw Vapi status: "${vapiStatus}"`);

  switch (vapiStatus) {
    case 'queued':
      return 'initiating';
    case 'ringing':
      return 'ringing';
    case 'in-progress':
    case 'forwarding':
      return 'in_progress';
    case 'ended':
    case 'completed':  // Some APIs use 'completed' instead of 'ended'
      return 'ended';
    case 'failed':
    case 'busy':
    case 'no-answer':
      return 'failed';
    default:
      console.log(`Unknown Vapi status: "${vapiStatus}" - defaulting to initiating`);
      return 'initiating';
  }
}

export async function initiateOutboundCall(
  phoneNumber: string,
  metadata: { patientId: string; patientName: string }
): Promise<VapiCallResponse> {
  const response = await fetch(`${VAPI_BASE_URL}/call/phone`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getApiKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      assistantId: getAssistantId(),
      phoneNumberId: getPhoneNumberId(),
      customer: {
        number: phoneNumber,
      },
      assistantOverrides: {
        metadata: {
          patientId: metadata.patientId,
          patientName: metadata.patientName,
        },
        firstMessage: `Hello ${metadata.patientName.split(' ')[0]}, this is Robin, the digital clinical assistant for the NYU Langone Transplant Institute. I am helping the specialist team prepare for your evaluation. Just wanted to let you know this call is recorded and protected by HIPAA. I just need to ask a few quick questions about your health and support system to get your chart ready for the committee. Is now a good time to talk for ten to fifteen minutes?`,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Vapi API error: ${response.status} - ${error}`);
  }

  return response.json();
}

export async function getCallStatus(callId: string): Promise<VapiCallResponse> {
  const response = await fetch(`${VAPI_BASE_URL}/call/${callId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${getApiKey()}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Vapi API error: ${response.status} - ${error}`);
  }

  return response.json();
}

export async function pollUntilCallEnds(
  callId: string,
  onStatusChange?: (status: VapiCallResponse) => void,
  maxAttempts: number = 200, // ~10 minutes with 3s interval
  intervalMs: number = 3000
): Promise<VapiCallResponse> {
  let attempts = 0;

  while (attempts < maxAttempts) {
    const callData = await getCallStatus(callId);

    if (onStatusChange) {
      onStatusChange(callData);
    }

    if (callData.status === 'ended') {
      return callData;
    }

    attempts++;
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }

  throw new Error('Call polling timeout - max attempts reached');
}

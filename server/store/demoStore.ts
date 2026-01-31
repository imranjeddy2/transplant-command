// In-memory store for demo purposes
// Data persists during server runtime but resets on restart

import type { StoredCall, ExtractedCallData } from '../types.js';

// Store calls by callId
const calls: Map<string, StoredCall> = new Map();

// Store call results by patientId for quick lookup
const patientCallResults: Map<string, ExtractedCallData> = new Map();

export function createCall(call: StoredCall): void {
  calls.set(call.callId, call);
}

export function getCall(callId: string): StoredCall | undefined {
  return calls.get(callId);
}

export function updateCall(callId: string, updates: Partial<StoredCall>): StoredCall | undefined {
  const call = calls.get(callId);
  if (!call) return undefined;

  const updated = { ...call, ...updates };
  calls.set(callId, updated);

  // If we have extracted data, also store by patientId
  if (updates.extractedData) {
    patientCallResults.set(call.patientId, updates.extractedData);
  }

  return updated;
}

export function getCallByPatientId(patientId: string): StoredCall | undefined {
  for (const call of calls.values()) {
    if (call.patientId === patientId) {
      return call;
    }
  }
  return undefined;
}

export function getPatientCallResults(patientId: string): ExtractedCallData | undefined {
  return patientCallResults.get(patientId);
}

export function resetDemo(): void {
  calls.clear();
  patientCallResults.clear();
  console.log('Demo data has been reset');
}

export function resetPatient(patientId: string): void {
  // Remove calls for this patient
  for (const [callId, call] of calls.entries()) {
    if (call.patientId === patientId) {
      calls.delete(callId);
    }
  }
  patientCallResults.delete(patientId);
  console.log(`Demo data reset for patient: ${patientId}`);
}

export function getAllCalls(): StoredCall[] {
  return Array.from(calls.values());
}

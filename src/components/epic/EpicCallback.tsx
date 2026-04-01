import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

interface FhirCondition {
  resource: {
    id: string;
    clinicalStatus?: { coding?: { code?: string; display?: string }[] };
    verificationStatus?: { coding?: { code?: string; display?: string }[] };
    category?: { coding?: { display?: string }[] }[];
    code?: { coding?: { display?: string; code?: string; system?: string }[]; text?: string };
    onsetDateTime?: string;
    recordedDate?: string;
  };
}

interface FhirPatient {
  id: string;
  name?: { given?: string[]; family?: string; use?: string }[];
  birthDate?: string;
  gender?: string;
}

export function EpicCallback() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [patient, setPatient] = useState<FhirPatient | null>(null);
  const [conditions, setConditions] = useState<FhirCondition[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Exchange the auth code on mount
  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setError(`Epic authorization failed: ${errorParam}`);
      setStatus('error');
      return;
    }

    if (!code || !state) {
      setStatus('error');
      setError('Missing authorization code. Please start the login flow again.');
      return;
    }

    exchangeToken(code, state);
  }, [searchParams]);

  const exchangeToken = async (code: string, state: string) => {
    try {
      const response = await fetch('/api/epic/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, state }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.details || data.error || 'Token exchange failed');
      }

      const data = await response.json();
      setSessionId(data.sessionId);
      setStatus('authenticated');

      // Fetch patient data and conditions
      fetchPatientData(data.sessionId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
      setStatus('error');
    }
  };

  const fetchPatientData = async (sid: string) => {
    setLoadingData(true);
    const headers = { 'x-epic-session': sid };

    try {
      const [patientRes, conditionsRes] = await Promise.all([
        fetch('/api/epic/patient/demographics', { headers }),
        fetch('/api/epic/patient/conditions', { headers }),
      ]);

      if (patientRes.ok) {
        const patientData = await patientRes.json();
        setPatient(patientData);
      }

      if (conditionsRes.ok) {
        const bundle = await conditionsRes.json();
        setConditions(bundle.entry || []);
      }
    } catch (err) {
      console.error('Failed to fetch patient data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const getPatientName = (p: FhirPatient): string => {
    const official = p.name?.find(n => n.use === 'official') || p.name?.[0];
    if (!official) return p.id;
    return `${official.given?.join(' ') || ''} ${official.family || ''}`.trim();
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold text-foreground mb-2">Epic FHIR Connection</h1>
      <p className="text-muted-foreground mb-6">SMART on FHIR standalone launch — Sandbox</p>

      {status === 'loading' && (
        <div className="bg-card border border-border rounded-md p-8 flex items-center justify-center gap-3">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-foreground">Exchanging authorization code with Epic...</p>
        </div>
      )}

      {status === 'error' && (
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-700 font-medium mb-1">Authentication Error</p>
            <p className="text-sm text-red-600">{error}</p>
          </div>
          <a
            href="/api/epic/launch"
            className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Try Again
          </a>
        </div>
      )}

      {status === 'authenticated' && (
        <div className="space-y-6">
          {/* Connection status */}
          <div className="bg-green-50 border border-green-200 rounded-md px-4 py-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full" />
            <p className="text-sm text-green-700 font-medium">Connected to Epic Sandbox</p>
          </div>

          {loadingData ? (
            <div className="bg-card border border-border rounded-md p-8 flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-foreground">Fetching patient data...</p>
            </div>
          ) : (
            <>
              {/* Patient demographics */}
              {patient && (
                <div className="bg-card border border-border rounded-md p-5">
                  <p className="text-xs font-medium text-muted-foreground mb-3">Patient</p>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Name</p>
                      <p className="text-sm font-medium text-foreground">{getPatientName(patient)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Date of Birth</p>
                      <p className="text-sm font-medium text-foreground">{patient.birthDate || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Gender</p>
                      <p className="text-sm font-medium text-foreground capitalize">{patient.gender || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">FHIR ID</p>
                      <p className="text-sm font-mono text-foreground truncate">{patient.id}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Conditions */}
              <div className="bg-card border border-border rounded-md p-5">
                <p className="text-xs font-medium text-muted-foreground mb-3">
                  Conditions ({conditions.length})
                </p>
                {conditions.length > 0 ? (
                  <div className="space-y-2">
                    {conditions.map((entry, i) => {
                      const c = entry.resource;
                      const name = c.code?.text || c.code?.coding?.[0]?.display || 'Unknown condition';
                      const clinicalStatus = c.clinicalStatus?.coding?.[0]?.code || '—';
                      const category = c.category?.[0]?.coding?.[0]?.display || '—';
                      const onset = c.onsetDateTime ? new Date(c.onsetDateTime).toLocaleDateString() : c.recordedDate ? new Date(c.recordedDate).toLocaleDateString() : '—';

                      return (
                        <div key={c.id || i} className="flex items-center gap-4 py-2 border-b border-border last:border-0">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">{name}</p>
                            <p className="text-xs text-muted-foreground">{category}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              clinicalStatus === 'active' ? 'bg-red-100 text-red-700'
                              : clinicalStatus === 'resolved' ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                            }`}>
                              {clinicalStatus}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground flex-shrink-0 w-24 text-right">{onset}</p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No conditions found for this patient.</p>
                )}
              </div>

              {/* Raw session info */}
              <div className="text-xs text-muted-foreground">
                Session: {sessionId?.substring(0, 8)}...
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

import { Router, Request, Response } from 'express';
import crypto from 'crypto';

const router = Router();

const EPIC_CONFIG = {
  clientId: process.env.EPIC_CLIENT_ID || '1b1537b4-eccc-4a41-8373-f69e8873ad05',
  fhirBase: 'https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4',
  authorizeUrl: 'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/authorize',
  tokenUrl: 'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token',
  redirectUri: process.env.EPIC_REDIRECT_URI || 'https://revtrend.com/epic',
  scopes: 'patient/Condition.read patient/Patient.read launch/patient openid fhirUser',
};

// In-memory store for state verification and tokens (use a proper store in production)
const stateStore = new Map<string, { createdAt: number }>();
const tokenStore = new Map<string, { accessToken: string; patient: string; expiresAt: number }>();

// GET /api/epic/launch — Redirect to Epic's authorization page
router.get('/launch', (_req: Request, res: Response) => {
  const state = crypto.randomBytes(16).toString('hex');
  stateStore.set(state, { createdAt: Date.now() });

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: EPIC_CONFIG.clientId,
    redirect_uri: EPIC_CONFIG.redirectUri,
    scope: EPIC_CONFIG.scopes,
    state,
    aud: EPIC_CONFIG.fhirBase,
  });

  const url = `${EPIC_CONFIG.authorizeUrl}?${params.toString()}`;
  console.log(`[Epic] Launching OAuth — redirecting to Epic authorize`);
  res.redirect(url);
});

// POST /api/epic/token — Exchange authorization code for access token
router.post('/token', async (req: Request, res: Response) => {
  try {
    const { code, state } = req.body;

    if (!code || !state) {
      res.status(400).json({ error: 'Missing code or state' });
      return;
    }

    // Verify state
    if (!stateStore.has(state)) {
      res.status(400).json({ error: 'Invalid state parameter' });
      return;
    }
    stateStore.delete(state);

    // Exchange code for token
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: EPIC_CONFIG.redirectUri,
      client_id: EPIC_CONFIG.clientId,
    });

    const response = await fetch(EPIC_CONFIG.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Epic] Token exchange failed (${response.status}):`, errorText);
      res.status(response.status).json({ error: 'Token exchange failed', details: errorText });
      return;
    }

    const tokenData = await response.json();
    console.log(`[Epic] Token received — patient: ${tokenData.patient}`);

    // Store the token keyed by a session ID
    const sessionId = crypto.randomBytes(16).toString('hex');
    tokenStore.set(sessionId, {
      accessToken: tokenData.access_token,
      patient: tokenData.patient,
      expiresAt: Date.now() + (tokenData.expires_in || 3600) * 1000,
    });

    res.json({
      sessionId,
      patient: tokenData.patient,
      scope: tokenData.scope,
      expiresIn: tokenData.expires_in,
    });
  } catch (error) {
    console.error('[Epic] Token error:', error);
    res.status(500).json({ error: 'Failed to exchange token' });
  }
});

// GET /api/epic/session/:sessionId — Get session info
router.get('/session/:sessionId', (req: Request, res: Response) => {
  const session = tokenStore.get(req.params.sessionId);
  if (!session || session.expiresAt < Date.now()) {
    res.status(401).json({ error: 'Session expired or not found' });
    return;
  }
  res.json({ patient: session.patient });
});

// GET /api/epic/patient/conditions — Get conditions for the authorized patient
router.get('/patient/conditions', async (req: Request, res: Response) => {
  try {
    const sessionId = req.headers['x-epic-session'] as string;
    if (!sessionId) {
      res.status(401).json({ error: 'Missing x-epic-session header' });
      return;
    }

    const session = tokenStore.get(sessionId);
    if (!session || session.expiresAt < Date.now()) {
      res.status(401).json({ error: 'Session expired or not found' });
      return;
    }

    const url = `${EPIC_CONFIG.fhirBase}/Condition?patient=${session.patient}`;
    console.log(`[Epic] Fetching conditions for patient ${session.patient}`);

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        Accept: 'application/fhir+json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Epic] Condition fetch failed (${response.status}):`, errorText);
      res.status(response.status).json({ error: 'Failed to fetch conditions', details: errorText });
      return;
    }

    const bundle = await response.json();
    console.log(`[Epic] Got ${bundle.total || bundle.entry?.length || 0} conditions`);
    res.json(bundle);
  } catch (error) {
    console.error('[Epic] Conditions error:', error);
    res.status(500).json({ error: 'Failed to fetch conditions' });
  }
});

// GET /api/epic/patient/demographics — Get patient demographics
router.get('/patient/demographics', async (req: Request, res: Response) => {
  try {
    const sessionId = req.headers['x-epic-session'] as string;
    if (!sessionId) {
      res.status(401).json({ error: 'Missing x-epic-session header' });
      return;
    }

    const session = tokenStore.get(sessionId);
    if (!session || session.expiresAt < Date.now()) {
      res.status(401).json({ error: 'Session expired or not found' });
      return;
    }

    const url = `${EPIC_CONFIG.fhirBase}/Patient/${session.patient}`;
    console.log(`[Epic] Fetching demographics for patient ${session.patient}`);

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        Accept: 'application/fhir+json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      res.status(response.status).json({ error: 'Failed to fetch patient', details: errorText });
      return;
    }

    const patient = await response.json();
    res.json(patient);
  } catch (error) {
    console.error('[Epic] Patient error:', error);
    res.status(500).json({ error: 'Failed to fetch patient' });
  }
});

export default router;

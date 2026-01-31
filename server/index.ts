// Express server for Vapi integration

import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import callsRouter from './routes/calls.js';

// Load environment variables
config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Request logging
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/calls', callsRouter);

// Demo reset routes (mounted at root level for convenience)
app.post('/api/demo/reset', (_req, res) => {
  // Forward to calls router
  import('./store/demoStore.js').then(({ resetDemo }) => {
    resetDemo();
    res.json({ success: true, message: 'Demo data has been reset' });
  });
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: {
      hasApiKey: !!process.env.VAPI_API_KEY,
      hasAssistantId: !!process.env.VAPI_ASSISTANT_ID,
      hasPhoneNumberId: !!process.env.VAPI_PHONE_NUMBER_ID,
    }
  });
});

// Error handling
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📞 Vapi integration ready`);
  console.log(`\nEndpoints:`);
  console.log(`  POST /api/calls/initiate - Initiate a call`);
  console.log(`  GET  /api/calls/:id/status - Get call status`);
  console.log(`  POST /api/demo/reset - Reset demo data`);
  console.log(`  GET  /api/health - Health check`);

  // Warn if environment variables are missing
  if (!process.env.VAPI_API_KEY) {
    console.warn('\n⚠️  Warning: VAPI_API_KEY not set');
  }
  if (!process.env.VAPI_ASSISTANT_ID) {
    console.warn('⚠️  Warning: VAPI_ASSISTANT_ID not set');
  }
  if (!process.env.VAPI_PHONE_NUMBER_ID) {
    console.warn('⚠️  Warning: VAPI_PHONE_NUMBER_ID not set');
  }
});

import { Router, Request, Response } from 'express';
import { analyzeImageForCompliance } from '../services/complianceService.js';

const router = Router();

// POST /api/compliance/analyze
router.post('/analyze', async (req: Request, res: Response) => {
  try {
    const { image } = req.body;

    if (!image || typeof image !== 'string') {
      res.status(400).json({ error: 'Missing required field: image (base64 string)' });
      return;
    }

    // Strip data URI prefix if present
    let base64Data = image;
    let mediaType = 'image/png';

    const dataUriMatch = image.match(/^data:(image\/\w+);base64,(.+)$/);
    if (dataUriMatch) {
      mediaType = dataUriMatch[1];
      base64Data = dataUriMatch[2];
    }

    console.log(`[Compliance] Analyzing image (${mediaType}, ${Math.round(base64Data.length / 1024)}KB base64)`);

    const result = await analyzeImageForCompliance(base64Data, mediaType);
    res.json(result);
  } catch (error) {
    console.error('[Compliance] Analysis failed:', error);
    res.status(500).json({ error: 'Failed to analyze image' });
  }
});

export default router;

import { Router, Request, Response } from 'express';
import { analyzeImageForCompliance } from '../services/complianceService.js';
import { editImageText } from '../services/imageEditService.js';

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

// POST /api/compliance/edit-image
router.post('/edit-image', async (req: Request, res: Response) => {
  try {
    const { image, originalText, replacementText } = req.body;

    if (!image || !originalText || !replacementText) {
      res.status(400).json({ error: 'Missing required fields: image, originalText, replacementText' });
      return;
    }

    let base64Data = image;
    let mediaType = 'image/png';

    const dataUriMatch = image.match(/^data:(image\/\w+);base64,(.+)$/);
    if (dataUriMatch) {
      mediaType = dataUriMatch[1];
      base64Data = dataUriMatch[2];
    }

    console.log(`[Compliance] Editing image — replacing "${originalText.substring(0, 50)}..." with "${replacementText.substring(0, 50)}..."`);

    const editedImageUrl = await editImageText(base64Data, mediaType, originalText, replacementText);
    res.json({ editedImage: editedImageUrl });
  } catch (error) {
    console.error('[Compliance] Image edit failed:', error);
    res.status(500).json({ error: 'Failed to edit image' });
  }
});

export default router;

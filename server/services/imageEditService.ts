import { GoogleGenAI } from '@google/genai';

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (!client) {
    if (!process.env.GOOGLE_AI_API_KEY) {
      throw new Error('GOOGLE_AI_API_KEY not set');
    }
    client = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY });
  }
  return client;
}

export async function editImageText(
  base64Data: string,
  mediaType: string,
  originalText: string,
  replacementText: string
): Promise<string> {
  const ai = getClient();

  const prompt = `You are an image editor. Your task is to make ONE precise text replacement in this image.

FIND THIS EXACT TEXT in the image:
"${originalText}"

REPLACE IT WITH THIS EXACT TEXT (word-for-word, character-for-character — do NOT paraphrase, summarize, or alter this in any way):
"${replacementText}"

CRITICAL RULES:
1. The replacement text MUST be reproduced EXACTLY as written above — every word, every comma, every period. Do not change, shorten, rephrase, or reinterpret it.
2. Keep the SAME font, font size, color, weight, and alignment as the original text.
3. Keep the SAME position and layout — the new text should occupy the same area.
4. If the replacement text is longer, slightly reduce font size to fit the same area rather than overflowing.
5. Do NOT change anything else in the image — all other text, images, colors, backgrounds, and design elements must remain identical.
6. The output image must be the same dimensions as the input image.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: [
      {
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType: mediaType,
              data: base64Data,
            },
          },
          { text: prompt },
        ],
      },
    ],
    config: {
      responseModalities: ['Text', 'Image'],
    },
  });

  // Extract the image from the response
  if (response.candidates && response.candidates[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData?.data) {
        const resultMime = part.inlineData.mimeType || 'image/png';
        return `data:${resultMime};base64,${part.inlineData.data}`;
      }
    }
  }

  throw new Error('Gemini did not return an edited image');
}

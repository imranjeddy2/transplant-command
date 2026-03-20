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

  const prompt = `Edit this image: find the text "${originalText}" and replace it with "${replacementText}". Keep everything else exactly the same — same layout, colors, fonts, background, images, and design. Only change the specified text. The replacement text should match the original text's style, size, color, and position as closely as possible.`;

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

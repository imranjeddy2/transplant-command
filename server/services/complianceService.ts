import Anthropic from '@anthropic-ai/sdk';
import type { ComplianceAnalysisResult } from '../types.js';

function getClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

const UDAAP_ANALYSIS_PROMPT = `You are a UDAAP (Unfair, Deceptive, or Abusive Acts or Practices) compliance analyst for financial services marketing materials.

Analyze the provided image of a marketing creative (advertisement, email, landing page, flyer, etc.) for potential UDAAP violations.

CRITICAL: Return ONLY raw JSON — no markdown, no code blocks, no explanation. The first character must be { and the last must be }.

Use this exact JSON structure:

{
  "complianceScore": <number 1-5>,
  "readingLevel": "<e.g. Grade 8, Grade 12, College>",
  "clarityScore": <number 1-5>,
  "overallAssessment": "<2-3 sentence summary of compliance posture>",
  "issues": [
    {
      "id": <number>,
      "severity": "high" | "medium" | "low",
      "category": "Deceptive" | "Unfair" | "Abusive",
      "udaapReference": "<specific UDAAP principle or section>",
      "location": "<description of where in the image this appears>",
      "locationHint": "top-left" | "top-center" | "top-right" | "center-left" | "center" | "center-right" | "bottom-left" | "bottom-center" | "bottom-right",
      "excerpt": "<the exact problematic text or element>",
      "explanation": "<why this is a UDAAP concern>",
      "suggestion": "<recommended alternative text or approach>"
    }
  ]
}

Scoring guide:
- complianceScore: 1=Critical violations, 2=Major issues, 3=Moderate concerns, 4=Minor issues, 5=Compliant
- clarityScore: 1=Very confusing, 2=Unclear, 3=Adequate, 4=Clear, 5=Very clear
- readingLevel: Assess the Flesch-Kincaid grade level of all visible text

UDAAP categories to check:
- Deceptive: Misleading claims, hidden fees, unclear terms, fine print that contradicts headlines, bait-and-switch, omission of material information, exaggerated benefits
- Unfair: Terms that cause substantial injury not reasonably avoidable by consumers, one-sided contract terms, excessive fees buried in disclosures
- Abusive: Taking unreasonable advantage of consumer's lack of understanding, inability to protect their interests, or reasonable reliance on the entity

Look specifically for:
- Headline claims vs. fine print contradictions
- Missing or inadequate disclosures (APR, fees, terms)
- Trigger terms without required disclosures (e.g., "low monthly payments" without APR)
- Deceptive visual hierarchy (large benefits, tiny disclaimers)
- Unclear eligibility requirements
- Time pressure tactics without substantiation
- Testimonials without proper disclaimers
- Guarantees without conditions

If no issues are found, return an empty issues array with complianceScore: 5.
Always return at least a reading level assessment and clarity score.`;

function extractJsonFromText(text: string): string {
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) return codeBlockMatch[1].trim();
  return text.trim();
}

export async function analyzeImageForCompliance(
  base64Data: string,
  mediaType: string
): Promise<ComplianceAnalysisResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY not set');
  }

  const response = await getClient().messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: mediaType as 'image/png' | 'image/jpeg' | 'image/gif' | 'image/webp',
            data: base64Data,
          },
        },
        {
          type: 'text',
          text: UDAAP_ANALYSIS_PROMPT,
        },
      ],
    }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const result = JSON.parse(extractJsonFromText(text)) as ComplianceAnalysisResult;

  console.log(`[Compliance] Analysis complete — score: ${result.complianceScore}, issues: ${result.issues.length}`);
  return result;
}

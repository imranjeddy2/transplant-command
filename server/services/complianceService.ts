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
      "id": <number starting at 1>,
      "severity": "high" | "medium" | "low",
      "category": "Deceptive" | "Unfair" | "Abusive",
      "riskCategory": "<one of the 7 risk categories below>",
      "udaapReference": "<specific UDAAP principle, regulation section, or legal basis>",
      "location": "<description of where in the image this appears>",
      "locationHint": "top-left" | "top-center" | "top-right" | "center-left" | "center" | "center-right" | "bottom-left" | "bottom-center" | "bottom-right",
      "boundingBox": {
        "x": <number 0-1, left edge as fraction of image width>,
        "y": <number 0-1, top edge as fraction of image height>,
        "width": <number 0-1, width as fraction of image width>,
        "height": <number 0-1, height as fraction of image height>
      },
      "textStyle": {
        "textColor": "<hex color of the problematic text, e.g. '#FFFFFF'>",
        "backgroundColor": "<hex color of the background directly behind the text, e.g. '#1A3B5C'>",
        "fontSize": "small" | "medium" | "large" | "xlarge",
        "fontWeight": "normal" | "bold",
        "textAlign": "left" | "center" | "right"
      },
      "excerpt": "<the exact problematic text or element from the creative>",
      "explanation": "<why this is a UDAAP concern — be specific about the risk to consumers>",
      "suggestion": "<recommended approach or principle to fix this>",
      "proposedPhrase": "<a concrete, ready-to-use replacement phrase that could directly replace the problematic text>"
    }
  ]
}

Scoring guide:
- complianceScore: 1=Critical violations, 2=Major issues, 3=Moderate concerns, 4=Minor issues, 5=Compliant
- clarityScore: 1=Very confusing, 2=Unclear, 3=Adequate, 4=Clear, 5=Very clear
- readingLevel: Assess the Flesch-Kincaid grade level of all visible text

=== COMPLIANCE RISK CATEGORIES ===
Assign exactly one of these 7 categories to each issue:

1. "False Sense of Urgency" — Phrases or terms that create a sense of urgency or panic in potential customers but are not based on actual time-sensitive information or a genuine need to take action. Examples: "Special offer" (without a genuine time limitation), "Limited-time offer" (without disclosed start and end dates), "Time-sensitive application", "Final days to qualify", "This offer won't come around again", "Limited availability", "Be among the first to apply", "Apply today to lock in these benefits", "This opportunity won't last long", "Act now before it's too late", "Only a few spots left", "Don't miss this once-in-a-lifetime opportunity".

2. "No Barrier to Entry" — Statements or descriptions that imply that there are no obstacles or requirements for consumers to obtain or get approved for a particular financial product or service. Examples: "Straightforward", "No waiting period", "Automatic", "Hassle-free", "Apply instantly", "Regardless of credit history", "Approval made simple", "Easy acceptance process", "Zero requirements", "No minimum income required", "Anyone can apply", "Everyone qualifies", "Available to all", "Flexible approval criteria", "No credit check required", "No income verification needed", "Simplified application process".

3. "Omission of Conditions" — Statements that should include qualifications, limitations, or conditions. Examples: "Special offer" (without disclosed material restrictions or eligibility requirements), "Price protection on all purchases", "Priority boarding privileges", "Annual travel credit", "Reward points for every referral", "Special financing options available", "Get extra points", "Low APR for all cardholders", "No hidden charges", "Rewards on every dollar spent", "Unlimited cash back", "Transfer points to any airline", "Balance transfer with no fees", "2X points everywhere", "Points never expire", "0% introductory rate", "Receive bonus points on every purchase", "No annual fee for the first year", "Earn 5X points on travel", "Get up to 5% cash back". IMPORTANT NOTE: It IS acceptable for conditions to be spelled out in the footnotes as opposed to the main body of text — check for footnote references before flagging.

4. "Guarantees" — Terms or phrases that imply that something is definite, when this is not always the case for all consumers. Examples: "Locked-in benefits", "Permanent fee structure", "Assured cash back earnings", "Unchanging rewards structure", "No exceptions", "Lifetime fixed rates", "Steady rewards earnings", "Guaranteed approval for eligible applicants", "Reliable low-interest rates", "Consistent point-earning structure", "Proven wealth-building strategy". IMPORTANT NOTE: Use of the conditional tense and qualifying clauses will often mitigate this issue. For example, "you could get" is acceptable whereas "you're getting" is not.

5. "Credit Deception" — Terms or phrases within proximity to the word "credit" that might imply that the advertised product can positively influence or repair a consumer's credit score or history more effectively than it actually can. Examples: "Maximize your credit potential", "Accelerate credit growth", "Fast track to higher credit score", "Increase creditworthiness", "Build credit fast", "Boost your credit score", "Credit repair made easy", "Erase bad credit history", "Enhance your credit profile", "Path to credit line increases".

6. "Unsubstantiated Claims" — Statements that must be backed up with evidence, where the evidence is not present. Examples: "Preferred by 9 out of 10", "Most widely accepted card", "Fastest approval process", "Perks you won't find anywhere else", "Chosen by more people than any other card", "Rated #1", "Most popular card among millennials", "99% customer satisfaction rate", "Most trusted by financial advisors", "Top-rated solutions", "Most comprehensive travel insurance coverage".

7. "Puffery" — Non-evidence based statements that are designed to make the product or service appear more attractive or valuable than it actually is. This includes exaggerations, boastful or subjective descriptions. Examples: "Beyond compare", "The future of credit, in your wallet", "Get more than you could ever expect", "A truly elite experience", "Seamless", "Tailored to your unique needs", "Recognized as most-rewarding", "Best choice", "Industry-leading", "Unlimited rewards potential", "Near-immediate approval times", "Limitless spending power", "Unparalleled rewards", "Exclusive benefits".

=== UDAAP PARENT CATEGORIES ===
- Deceptive: Misleading representations or omissions likely to mislead a reasonable consumer
- Unfair: Practices causing substantial injury not reasonably avoidable by consumers, not outweighed by countervailing benefits
- Abusive: Taking unreasonable advantage of consumer's lack of understanding, inability to protect interests, or reasonable reliance

=== BOUNDING BOX & TEXT STYLE REQUIREMENTS ===
For each issue, you MUST provide:
- boundingBox: Estimate the rectangular region of the problematic text as fractions (0 to 1) of the total image dimensions. Be as precise as possible. For example, text in the top-left quadrant taking up about 40% of width and 5% of height might be {x: 0.05, y: 0.1, width: 0.4, height: 0.05}.
- textStyle: Analyze the visual appearance of the problematic text:
  - textColor: The exact hex color of the text (sample from the image)
  - backgroundColor: The hex color directly behind/around the text
  - fontSize: "small" (fine print/disclaimers), "medium" (body text), "large" (subheadings), "xlarge" (headlines)
  - fontWeight: "bold" or "normal"
  - textAlign: "left", "center", or "right" based on how the text appears aligned

=== PROPOSED PHRASE REQUIREMENTS ===
For each issue, the "proposedPhrase" MUST be:
- A direct, copy-paste-ready replacement for the problematic text
- Compliant with the relevant regulation
- Natural marketing language (not legalese unless it's a required disclosure)
- Similar in length and tone to the original where possible
- Example: If excerpt is "Guaranteed lowest rate!", proposedPhrase could be "Competitive rates available — subject to credit approval and market conditions."

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

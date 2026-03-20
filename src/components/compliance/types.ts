export type RiskCategory =
  | 'False Sense of Urgency'
  | 'No Barrier to Entry'
  | 'Omission of Conditions'
  | 'Guarantees'
  | 'Credit Deception'
  | 'Unsubstantiated Claims'
  | 'Puffery';

export interface BoundingBox {
  x: number;      // 0-1, left edge as fraction of image width
  y: number;      // 0-1, top edge as fraction of image height
  width: number;  // 0-1, width as fraction of image width
  height: number; // 0-1, height as fraction of image height
}

export interface TextStyle {
  textColor: string;       // hex color of original text, e.g. "#FFFFFF"
  backgroundColor: string; // hex color behind the text, e.g. "#1A3B5C"
  fontSize: 'small' | 'medium' | 'large' | 'xlarge'; // relative to image
  fontWeight: 'normal' | 'bold';
  textAlign: 'left' | 'center' | 'right';
}

export interface ComplianceIssue {
  id: number;
  severity: 'high' | 'medium' | 'low';
  category: 'Deceptive' | 'Unfair' | 'Abusive';
  riskCategory: RiskCategory;
  udaapReference: string;
  location: string;
  locationHint?: 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  boundingBox?: BoundingBox;
  textStyle?: TextStyle;
  excerpt: string;
  explanation: string;
  suggestion: string;
  proposedPhrase: string;
}

export interface CreativeIntelligence {
  company: string;
  product: string;
  industry: string;
  marketingChannel: string;
}

export interface ComplianceAnalysisResult {
  creative: CreativeIntelligence;
  complianceScore: number;
  readingLevel: string;
  clarityScore: number;
  overallAssessment: string;
  issues: ComplianceIssue[];
}

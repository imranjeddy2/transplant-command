export type RiskCategory =
  | 'False Sense of Urgency'
  | 'No Barrier to Entry'
  | 'Omission of Conditions'
  | 'Guarantees'
  | 'Credit Deception'
  | 'Unsubstantiated Claims'
  | 'Puffery';

export interface ComplianceIssue {
  id: number;
  severity: 'high' | 'medium' | 'low';
  category: 'Deceptive' | 'Unfair' | 'Abusive';
  riskCategory: RiskCategory;
  udaapReference: string;
  location: string;
  locationHint?: 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  excerpt: string;
  explanation: string;
  suggestion: string;
  proposedPhrase: string;
}

export interface ComplianceAnalysisResult {
  complianceScore: number;
  readingLevel: string;
  clarityScore: number;
  overallAssessment: string;
  issues: ComplianceIssue[];
}

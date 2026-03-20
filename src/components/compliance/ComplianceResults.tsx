import { useState } from 'react';
import type { ComplianceAnalysisResult, ComplianceIssue } from './types';

const SEVERITY_STYLES: Record<string, string> = {
  high: 'bg-red-100 text-red-700 border-red-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  low: 'bg-blue-100 text-blue-700 border-blue-200',
};

const CATEGORY_STYLES: Record<string, string> = {
  Deceptive: 'bg-red-50 text-red-600',
  Unfair: 'bg-amber-50 text-amber-600',
  Abusive: 'bg-purple-50 text-purple-600',
};

const COMPLIANCE_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: 'Critical', color: 'text-red-600' },
  2: { label: 'Poor', color: 'text-red-500' },
  3: { label: 'Fair', color: 'text-amber-600' },
  4: { label: 'Good', color: 'text-green-600' },
  5: { label: 'Excellent', color: 'text-green-700' },
};

const CLARITY_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: 'Very Confusing', color: 'text-red-600' },
  2: { label: 'Unclear', color: 'text-red-500' },
  3: { label: 'Adequate', color: 'text-amber-600' },
  4: { label: 'Clear', color: 'text-green-600' },
  5: { label: 'Very Clear', color: 'text-green-700' },
};

// Position markers on the image based on locationHint
const POSITION_MAP: Record<string, string> = {
  'top-left': 'top-[8%] left-[8%]',
  'top-center': 'top-[8%] left-1/2 -translate-x-1/2',
  'top-right': 'top-[8%] right-[8%]',
  'center-left': 'top-1/2 -translate-y-1/2 left-[8%]',
  'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
  'center-right': 'top-1/2 -translate-y-1/2 right-[8%]',
  'bottom-left': 'bottom-[8%] left-[8%]',
  'bottom-center': 'bottom-[8%] left-1/2 -translate-x-1/2',
  'bottom-right': 'bottom-[8%] right-[8%]',
};

function ScoreBar({ score, max = 5 }: { score: number; max?: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          className={`h-2 flex-1 rounded-sm ${
            i < score
              ? score >= 4 ? 'bg-green-500' : score >= 3 ? 'bg-amber-500' : 'bg-red-500'
              : 'bg-muted'
          }`}
        />
      ))}
    </div>
  );
}

interface ComplianceResultsProps {
  result: ComplianceAnalysisResult;
  imageUrl: string;
}

export function ComplianceResults({ result, imageUrl }: ComplianceResultsProps) {
  const [selectedIssue, setSelectedIssue] = useState<number | null>(null);

  const compliance = COMPLIANCE_LABELS[result.complianceScore] || COMPLIANCE_LABELS[3];
  const clarity = CLARITY_LABELS[result.clarityScore] || CLARITY_LABELS[3];

  const highCount = result.issues.filter(i => i.severity === 'high').length;
  const mediumCount = result.issues.filter(i => i.severity === 'medium').length;
  const lowCount = result.issues.filter(i => i.severity === 'low').length;

  return (
    <div className="space-y-6">
      {/* Score Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-md p-5">
          <p className="text-sm text-muted-foreground mb-1">Compliance Score</p>
          <div className="flex items-baseline gap-2 mb-2">
            <span className={`text-2xl font-semibold ${compliance.color}`}>
              {result.complianceScore}/5
            </span>
            <span className={`text-sm font-medium ${compliance.color}`}>{compliance.label}</span>
          </div>
          <ScoreBar score={result.complianceScore} />
        </div>

        <div className="bg-card border border-border rounded-md p-5">
          <p className="text-sm text-muted-foreground mb-1">Reading Level</p>
          <p className="text-2xl font-semibold text-foreground mb-2">{result.readingLevel}</p>
          <p className="text-xs text-muted-foreground">Flesch-Kincaid assessment</p>
        </div>

        <div className="bg-card border border-border rounded-md p-5">
          <p className="text-sm text-muted-foreground mb-1">Clarity Score</p>
          <div className="flex items-baseline gap-2 mb-2">
            <span className={`text-2xl font-semibold ${clarity.color}`}>
              {result.clarityScore}/5
            </span>
            <span className={`text-sm font-medium ${clarity.color}`}>{clarity.label}</span>
          </div>
          <ScoreBar score={result.clarityScore} />
        </div>
      </div>

      {/* Overall Assessment */}
      <div className="bg-card border border-border rounded-md p-4">
        <p className="text-sm text-muted-foreground mb-1">Assessment</p>
        <p className="text-sm text-foreground">{result.overallAssessment}</p>
        {result.issues.length > 0 && (
          <div className="flex gap-3 mt-3 text-xs">
            {highCount > 0 && (
              <span className="px-2 py-1 bg-red-100 text-red-700 rounded">{highCount} high</span>
            )}
            {mediumCount > 0 && (
              <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded">{mediumCount} medium</span>
            )}
            {lowCount > 0 && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">{lowCount} low</span>
            )}
          </div>
        )}
      </div>

      {/* Main Content: Image + Issues */}
      {result.issues.length > 0 ? (
        <div className="grid grid-cols-5 gap-6">
          {/* Image with markers */}
          <div className="col-span-3 bg-card border border-border rounded-md p-4">
            <p className="text-sm font-medium text-foreground mb-3">Creative Preview</p>
            <div className="relative inline-block w-full">
              <img
                src={imageUrl}
                alt="Uploaded creative"
                className="w-full rounded border border-border"
              />
              {/* Issue markers */}
              {result.issues.map((issue) => {
                const pos = POSITION_MAP[issue.locationHint || 'center'];
                return (
                  <button
                    key={issue.id}
                    onClick={() => setSelectedIssue(selectedIssue === issue.id ? null : issue.id)}
                    className={`absolute ${pos} w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center cursor-pointer transition-transform hover:scale-110 ${
                      issue.severity === 'high'
                        ? 'bg-red-500 text-white'
                        : issue.severity === 'medium'
                        ? 'bg-amber-500 text-white'
                        : 'bg-blue-500 text-white'
                    } ${selectedIssue === issue.id ? 'ring-2 ring-offset-2 ring-foreground scale-110' : ''}`}
                  >
                    {issue.id}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Issues Panel */}
          <div className="col-span-2 space-y-3 max-h-[700px] overflow-y-auto">
            <p className="text-sm font-medium text-foreground">Issues ({result.issues.length})</p>
            {result.issues.map((issue: ComplianceIssue) => (
              <div
                key={issue.id}
                onClick={() => setSelectedIssue(selectedIssue === issue.id ? null : issue.id)}
                className={`bg-card border rounded-md p-4 cursor-pointer transition-colors ${
                  selectedIssue === issue.id ? 'border-primary ring-1 ring-primary' : 'border-border hover:border-muted-foreground/30'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={`w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center ${
                    issue.severity === 'high' ? 'bg-red-500 text-white'
                    : issue.severity === 'medium' ? 'bg-amber-500 text-white'
                    : 'bg-blue-500 text-white'
                  }`}>
                    {issue.id}
                  </span>
                  <span className={`text-xs px-1.5 py-0.5 rounded border ${SEVERITY_STYLES[issue.severity]}`}>
                    {issue.severity}
                  </span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${CATEGORY_STYLES[issue.category]}`}>
                    {issue.category}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground mb-1">{issue.udaapReference}</p>

                <p className="text-sm font-medium text-foreground mb-1">
                  "{issue.excerpt}"
                </p>

                <p className="text-sm text-muted-foreground mb-3">{issue.explanation}</p>

                <div className="bg-green-50 border border-green-200 rounded p-2.5">
                  <p className="text-xs text-green-700 font-medium mb-0.5">Suggested alternative</p>
                  <p className="text-sm text-green-800">{issue.suggestion}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-md p-8 text-center">
          <p className="text-lg font-semibold text-green-600 mb-1">No issues found</p>
          <p className="text-sm text-muted-foreground">This creative appears to be UDAAP compliant.</p>
        </div>
      )}
    </div>
  );
}

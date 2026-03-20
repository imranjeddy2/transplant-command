import { useState } from 'react';
import type { ComplianceAnalysisResult, ComplianceIssue, RiskCategory } from './types';

const SEVERITY_STYLES: Record<string, string> = {
  high: 'bg-red-100 text-red-700 border-red-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  low: 'bg-blue-100 text-blue-700 border-blue-200',
};

const RISK_CATEGORY_STYLES: Record<RiskCategory, { bg: string; text: string }> = {
  'False Sense of Urgency': { bg: 'bg-red-50', text: 'text-red-600' },
  'No Barrier to Entry': { bg: 'bg-orange-50', text: 'text-orange-600' },
  'Omission of Conditions': { bg: 'bg-amber-50', text: 'text-amber-700' },
  'Guarantees': { bg: 'bg-rose-50', text: 'text-rose-600' },
  'Credit Deception': { bg: 'bg-purple-50', text: 'text-purple-600' },
  'Unsubstantiated Claims': { bg: 'bg-blue-50', text: 'text-blue-600' },
  'Puffery': { bg: 'bg-teal-50', text: 'text-teal-600' },
};

const COMPLIANCE_LABELS: Record<number, { label: string; color: string; bg: string }> = {
  1: { label: 'Critical', color: 'text-red-600', bg: 'bg-red-50' },
  2: { label: 'Poor', color: 'text-red-500', bg: 'bg-red-50' },
  3: { label: 'Fair', color: 'text-amber-600', bg: 'bg-amber-50' },
  4: { label: 'Good', color: 'text-green-600', bg: 'bg-green-50' },
  5: { label: 'Excellent', color: 'text-green-700', bg: 'bg-green-50' },
};

const CLARITY_LABELS: Record<number, { label: string; color: string; bg: string }> = {
  1: { label: 'Very Confusing', color: 'text-red-600', bg: 'bg-red-50' },
  2: { label: 'Unclear', color: 'text-red-500', bg: 'bg-red-50' },
  3: { label: 'Adequate', color: 'text-amber-600', bg: 'bg-amber-50' },
  4: { label: 'Clear', color: 'text-green-600', bg: 'bg-green-50' },
  5: { label: 'Very Clear', color: 'text-green-700', bg: 'bg-green-50' },
};

const MARKER_CSS_POSITIONS: Record<string, string> = {
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
  const [appliedFixes, setAppliedFixes] = useState<Set<number>>(new Set());
  const [editingIssueId, setEditingIssueId] = useState<number | null>(null);
  // Track the current image — starts as original, updated after each Gemini edit
  const [currentImageUrl, setCurrentImageUrl] = useState<string>(imageUrl);
  const [editError, setEditError] = useState<string | null>(null);

  const compliance = COMPLIANCE_LABELS[result.complianceScore] || COMPLIANCE_LABELS[3];
  const clarity = CLARITY_LABELS[result.clarityScore] || CLARITY_LABELS[3];

  const highCount = result.issues.filter(i => i.severity === 'high').length;
  const mediumCount = result.issues.filter(i => i.severity === 'medium').length;
  const lowCount = result.issues.filter(i => i.severity === 'low').length;

  const riskCategoryCounts: Partial<Record<RiskCategory, number>> = {};
  result.issues.forEach(i => {
    if (i.riskCategory) {
      riskCategoryCounts[i.riskCategory] = (riskCategoryCounts[i.riskCategory] || 0) + 1;
    }
  });

  const handleUseFix = async (issue: ComplianceIssue) => {
    if (appliedFixes.has(issue.id)) return; // Already applied

    setEditingIssueId(issue.id);
    setEditError(null);

    try {
      const response = await fetch('/api/compliance/edit-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: currentImageUrl,
          originalText: issue.excerpt,
          replacementText: issue.proposedPhrase,
        }),
      });

      if (!response.ok) {
        throw new Error(`Edit failed (${response.status})`);
      }

      const data = await response.json();
      setCurrentImageUrl(data.editedImage);
      setAppliedFixes(prev => new Set([...prev, issue.id]));
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Failed to edit image');
    } finally {
      setEditingIssueId(null);
    }
  };

  const handleReset = () => {
    setCurrentImageUrl(imageUrl);
    setAppliedFixes(new Set());
    setEditError(null);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.download = 'compliance-fixed-creative.png';
    link.href = currentImageUrl;
    link.click();
  };

  return (
    <div className="space-y-5">
      {/* Summary Bar */}
      <div className="grid grid-cols-4 gap-3">
        <div className={`${compliance.bg} border border-border rounded-md p-4`}>
          <p className="text-xs text-muted-foreground mb-1">Compliance Score</p>
          <div className="flex items-baseline gap-2 mb-2">
            <span className={`text-2xl font-bold ${compliance.color}`}>
              {result.complianceScore}/5
            </span>
            <span className={`text-xs font-medium ${compliance.color}`}>{compliance.label}</span>
          </div>
          <ScoreBar score={result.complianceScore} />
        </div>

        <div className="bg-card border border-border rounded-md p-4">
          <p className="text-xs text-muted-foreground mb-1">Reading Level</p>
          <p className="text-2xl font-bold text-foreground">{result.readingLevel}</p>
          <p className="text-xs text-muted-foreground mt-1">Flesch-Kincaid</p>
        </div>

        <div className={`${clarity.bg} border border-border rounded-md p-4`}>
          <p className="text-xs text-muted-foreground mb-1">Clarity Score</p>
          <div className="flex items-baseline gap-2 mb-2">
            <span className={`text-2xl font-bold ${clarity.color}`}>
              {result.clarityScore}/5
            </span>
            <span className={`text-xs font-medium ${clarity.color}`}>{clarity.label}</span>
          </div>
          <ScoreBar score={result.clarityScore} />
        </div>

        <div className="bg-card border border-border rounded-md p-4">
          <p className="text-xs text-muted-foreground mb-1">Issues Found</p>
          <p className="text-2xl font-bold text-foreground">{result.issues.length}</p>
          <div className="flex gap-2 mt-1">
            {highCount > 0 && (
              <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-700 rounded">{highCount} high</span>
            )}
            {mediumCount > 0 && (
              <span className="text-xs px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded">{mediumCount} med</span>
            )}
            {lowCount > 0 && (
              <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">{lowCount} low</span>
            )}
          </div>
        </div>
      </div>

      {/* Assessment + Risk Categories */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-card border border-border rounded-md p-4">
          <p className="text-xs font-medium text-muted-foreground mb-1">Assessment</p>
          <p className="text-sm text-foreground">{result.overallAssessment}</p>
        </div>

        {Object.keys(riskCategoryCounts).length > 0 && (
          <div className="bg-card border border-border rounded-md p-4">
            <p className="text-xs font-medium text-muted-foreground mb-2">Risk Categories</p>
            <div className="flex flex-wrap gap-1.5">
              {(Object.entries(riskCategoryCounts) as [RiskCategory, number][]).map(([cat, count]) => {
                const style = RISK_CATEGORY_STYLES[cat] || { bg: 'bg-gray-50', text: 'text-gray-600' };
                return (
                  <span key={cat} className={`text-xs px-2 py-1 rounded ${style.bg} ${style.text}`}>
                    {cat} ({count})
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Applied fixes bar */}
      {appliedFixes.size > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-md px-4 py-2.5 flex items-center justify-between">
          <p className="text-sm text-green-700">
            <span className="font-medium">{appliedFixes.size} fix{appliedFixes.size !== 1 ? 'es' : ''}</span> applied to image
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleDownload}
              className="text-xs text-green-700 hover:text-green-900 font-medium underline"
            >
              Download edited image
            </button>
            <button
              onClick={handleReset}
              className="text-xs text-green-700 hover:text-green-900 font-medium underline"
            >
              Reset to original
            </button>
          </div>
        </div>
      )}

      {/* Edit error */}
      {editError && (
        <div className="bg-red-50 border border-red-200 rounded-md px-4 py-2.5">
          <p className="text-sm text-red-700">Image edit failed: {editError}</p>
        </div>
      )}

      {/* Main Content: Image + Issues */}
      {result.issues.length > 0 ? (
        <div className="grid grid-cols-5 gap-5">
          {/* Image with markers */}
          <div className="col-span-3 bg-card border border-border rounded-md p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-foreground">
                {appliedFixes.size > 0 ? 'Edited Creative' : 'Creative Preview'}
              </p>
              {appliedFixes.size > 0 && (
                <span className="text-xs text-green-600 font-medium">
                  {appliedFixes.size} fix{appliedFixes.size !== 1 ? 'es' : ''} applied
                </span>
              )}
            </div>
            <div className="relative inline-block w-full">
              {/* Show loading overlay when editing */}
              {editingIssueId !== null && (
                <div className="absolute inset-0 bg-white/70 rounded border border-border flex items-center justify-center z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-medium text-foreground">Editing image...</p>
                  </div>
                </div>
              )}
              <img
                src={currentImageUrl}
                alt="Creative"
                className="w-full rounded border border-border"
              />
              {/* Issue markers — only for unfixed issues */}
              {result.issues.filter(i => !appliedFixes.has(i.id)).map((issue) => {
                const pos = MARKER_CSS_POSITIONS[issue.locationHint || 'center'];
                return (
                  <button
                    key={issue.id}
                    onClick={() => setSelectedIssue(selectedIssue === issue.id ? null : issue.id)}
                    className={`absolute ${pos} w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center cursor-pointer transition-all hover:scale-110 ${
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
          <div className="col-span-2 space-y-3 max-h-[750px] overflow-y-auto pr-1">
            <p className="text-sm font-medium text-foreground">Issues ({result.issues.length})</p>
            {result.issues.map((issue: ComplianceIssue) => {
              const isFixed = appliedFixes.has(issue.id);
              const isEditing = editingIssueId === issue.id;
              const riskStyle = RISK_CATEGORY_STYLES[issue.riskCategory] || { bg: 'bg-gray-50', text: 'text-gray-600' };

              return (
                <div
                  key={issue.id}
                  onClick={() => setSelectedIssue(selectedIssue === issue.id ? null : issue.id)}
                  className={`bg-card border rounded-md p-4 cursor-pointer transition-colors ${
                    selectedIssue === issue.id ? 'border-primary ring-1 ring-primary' : 'border-border hover:border-muted-foreground/30'
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 ${
                      isFixed ? 'bg-green-500 text-white'
                      : issue.severity === 'high' ? 'bg-red-500 text-white'
                      : issue.severity === 'medium' ? 'bg-amber-500 text-white'
                      : 'bg-blue-500 text-white'
                    }`}>
                      {isFixed ? '\u2713' : issue.id}
                    </span>
                    <span className={`text-xs px-1.5 py-0.5 rounded border ${SEVERITY_STYLES[issue.severity]}`}>
                      {issue.severity}
                    </span>
                    {issue.riskCategory && (
                      <span className={`text-xs px-1.5 py-0.5 rounded ${riskStyle.bg} ${riskStyle.text}`}>
                        {issue.riskCategory}
                      </span>
                    )}
                    {isFixed && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-green-100 text-green-700">Fixed</span>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground mb-1">{issue.udaapReference}</p>

                  <p className="text-sm font-medium text-foreground mb-1">
                    &ldquo;{issue.excerpt}&rdquo;
                  </p>

                  <p className="text-sm text-muted-foreground mb-3">{issue.explanation}</p>

                  {/* Recommendation */}
                  <div className="bg-muted/50 border border-border rounded p-2.5 mb-2">
                    <p className="text-xs text-muted-foreground font-medium mb-0.5">Recommendation</p>
                    <p className="text-sm text-foreground">{issue.suggestion}</p>
                  </div>

                  {/* Proposed phrase + Use button */}
                  {issue.proposedPhrase && (
                    <div className={`border rounded p-2.5 ${isFixed ? 'bg-green-100 border-green-400' : 'bg-green-50 border-green-200'}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-green-700 font-medium mb-0.5">Proposed replacement</p>
                          <p className="text-sm text-green-800">&ldquo;{issue.proposedPhrase}&rdquo;</p>
                        </div>
                        {!isFixed && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUseFix(issue);
                            }}
                            disabled={isEditing || editingIssueId !== null}
                            className="flex-shrink-0 px-3 py-1.5 rounded text-xs font-medium transition-colors bg-green-100 text-green-700 hover:bg-green-200 border border-green-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isEditing ? (
                              <span className="flex items-center gap-1.5">
                                <span className="w-3 h-3 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                                Editing...
                              </span>
                            ) : 'Use'}
                          </button>
                        )}
                        {isFixed && (
                          <span className="flex-shrink-0 px-3 py-1.5 rounded text-xs font-medium bg-green-600 text-white">
                            Applied
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
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

import { useState, useRef, useEffect, useCallback } from 'react';
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

const POSITION_MAP: Record<string, { x: number; y: number }> = {
  'top-left': { x: 0.12, y: 0.1 },
  'top-center': { x: 0.5, y: 0.1 },
  'top-right': { x: 0.88, y: 0.1 },
  'center-left': { x: 0.12, y: 0.5 },
  'center': { x: 0.5, y: 0.5 },
  'center-right': { x: 0.88, y: 0.5 },
  'bottom-left': { x: 0.12, y: 0.88 },
  'bottom-center': { x: 0.5, y: 0.88 },
  'bottom-right': { x: 0.88, y: 0.88 },
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
  const [editedImageUrl, setEditedImageUrl] = useState<string>(imageUrl);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const compliance = COMPLIANCE_LABELS[result.complianceScore] || COMPLIANCE_LABELS[3];
  const clarity = CLARITY_LABELS[result.clarityScore] || CLARITY_LABELS[3];

  const highCount = result.issues.filter(i => i.severity === 'high').length;
  const mediumCount = result.issues.filter(i => i.severity === 'medium').length;
  const lowCount = result.issues.filter(i => i.severity === 'low').length;

  // Count risk categories
  const riskCategoryCounts: Partial<Record<RiskCategory, number>> = {};
  result.issues.forEach(i => {
    if (i.riskCategory) {
      riskCategoryCounts[i.riskCategory] = (riskCategoryCounts[i.riskCategory] || 0) + 1;
    }
  });

  // Load the image for canvas operations
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => { imageRef.current = img; };
    img.src = imageUrl;
  }, [imageUrl]);

  const renderCanvas = useCallback((fixIds: Set<number>) => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);

    // Apply all fixes
    fixIds.forEach(fixId => {
      const issue = result.issues.find(i => i.id === fixId);
      if (!issue) return;

      const pos = POSITION_MAP[issue.locationHint || 'center'];
      const x = pos.x * canvas.width;
      const y = pos.y * canvas.height;

      const fontSize = Math.max(14, Math.min(canvas.width * 0.022, 28));
      ctx.font = `bold ${fontSize}px Inter, system-ui, sans-serif`;

      const lines = wrapText(ctx, issue.proposedPhrase, canvas.width * 0.35);
      const lineHeight = fontSize * 1.3;
      const blockHeight = lines.length * lineHeight + 16;
      const maxLineWidth = Math.max(...lines.map(l => ctx.measureText(l).width));
      const blockWidth = maxLineWidth + 24;

      // Position the box centered on the location hint
      const boxX = Math.max(4, Math.min(x - blockWidth / 2, canvas.width - blockWidth - 4));
      const boxY = Math.max(4, Math.min(y - blockHeight / 2, canvas.height - blockHeight - 4));

      // Draw background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      roundRect(ctx, boxX, boxY, blockWidth, blockHeight, 6);
      ctx.fill();

      // Draw green left border
      ctx.fillStyle = '#16a34a';
      roundRect(ctx, boxX, boxY, 4, blockHeight, 2);
      ctx.fill();

      // Draw text
      ctx.fillStyle = '#15803d';
      ctx.font = `bold ${fontSize}px Inter, system-ui, sans-serif`;
      lines.forEach((line, idx) => {
        ctx.fillText(line, boxX + 14, boxY + 12 + (idx + 1) * lineHeight - 4);
      });
    });

    setEditedImageUrl(canvas.toDataURL('image/png'));
  }, [result.issues]);

  const handleUseFix = (issueId: number) => {
    const newFixes = new Set(appliedFixes);
    if (newFixes.has(issueId)) {
      newFixes.delete(issueId);
    } else {
      newFixes.add(issueId);
    }
    setAppliedFixes(newFixes);
    renderCanvas(newFixes);
  };

  const displayUrl = appliedFixes.size > 0 ? editedImageUrl : imageUrl;

  return (
    <div className="space-y-5">
      {/* Summary Bar */}
      <div className="grid grid-cols-4 gap-3">
        {/* Compliance Score */}
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

        {/* Reading Level */}
        <div className="bg-card border border-border rounded-md p-4">
          <p className="text-xs text-muted-foreground mb-1">Reading Level</p>
          <p className="text-2xl font-bold text-foreground">{result.readingLevel}</p>
          <p className="text-xs text-muted-foreground mt-1">Flesch-Kincaid</p>
        </div>

        {/* Clarity Score */}
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

        {/* Issues Summary */}
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

      {/* Applied fixes indicator */}
      {appliedFixes.size > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-md px-4 py-2.5 flex items-center justify-between">
          <p className="text-sm text-green-700">
            <span className="font-medium">{appliedFixes.size} fix{appliedFixes.size !== 1 ? 'es' : ''}</span> applied to preview
          </p>
          <button
            onClick={() => { setAppliedFixes(new Set()); setEditedImageUrl(imageUrl); }}
            className="text-xs text-green-700 hover:text-green-900 font-medium underline"
          >
            Reset all
          </button>
        </div>
      )}

      {/* Main Content: Image + Issues */}
      {result.issues.length > 0 ? (
        <div className="grid grid-cols-5 gap-5">
          {/* Image with markers */}
          <div className="col-span-3 bg-card border border-border rounded-md p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-foreground">Creative Preview</p>
              {appliedFixes.size > 0 && (
                <span className="text-xs text-green-600 font-medium">
                  {appliedFixes.size} fix{appliedFixes.size !== 1 ? 'es' : ''} shown
                </span>
              )}
            </div>
            <div className="relative inline-block w-full">
              <img
                src={displayUrl}
                alt="Uploaded creative"
                className="w-full rounded border border-border"
              />
              {/* Issue markers */}
              {result.issues.map((issue) => {
                const pos = MARKER_CSS_POSITIONS[issue.locationHint || 'center'];
                const isFixed = appliedFixes.has(issue.id);
                return (
                  <button
                    key={issue.id}
                    onClick={() => setSelectedIssue(selectedIssue === issue.id ? null : issue.id)}
                    className={`absolute ${pos} w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center cursor-pointer transition-all hover:scale-110 ${
                      isFixed
                        ? 'bg-green-500 text-white'
                        : issue.severity === 'high'
                        ? 'bg-red-500 text-white'
                        : issue.severity === 'medium'
                        ? 'bg-amber-500 text-white'
                        : 'bg-blue-500 text-white'
                    } ${selectedIssue === issue.id ? 'ring-2 ring-offset-2 ring-foreground scale-110' : ''}`}
                  >
                    {isFixed ? '✓' : issue.id}
                  </button>
                );
              })}
            </div>
            {/* Hidden canvas for image editing */}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Issues Panel */}
          <div className="col-span-2 space-y-3 max-h-[750px] overflow-y-auto pr-1">
            <p className="text-sm font-medium text-foreground">Issues ({result.issues.length})</p>
            {result.issues.map((issue: ComplianceIssue) => {
              const isFixed = appliedFixes.has(issue.id);
              const riskStyle = RISK_CATEGORY_STYLES[issue.riskCategory] || { bg: 'bg-gray-50', text: 'text-gray-600' };

              return (
                <div
                  key={issue.id}
                  onClick={() => setSelectedIssue(selectedIssue === issue.id ? null : issue.id)}
                  className={`bg-card border rounded-md p-4 cursor-pointer transition-colors ${
                    selectedIssue === issue.id ? 'border-primary ring-1 ring-primary' : 'border-border hover:border-muted-foreground/30'
                  } ${isFixed ? 'opacity-60' : ''}`}
                >
                  {/* Header row: marker + badges */}
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 ${
                      isFixed ? 'bg-green-500 text-white'
                      : issue.severity === 'high' ? 'bg-red-500 text-white'
                      : issue.severity === 'medium' ? 'bg-amber-500 text-white'
                      : 'bg-blue-500 text-white'
                    }`}>
                      {isFixed ? '✓' : issue.id}
                    </span>
                    <span className={`text-xs px-1.5 py-0.5 rounded border ${SEVERITY_STYLES[issue.severity]}`}>
                      {issue.severity}
                    </span>
                    {issue.riskCategory && (
                      <span className={`text-xs px-1.5 py-0.5 rounded ${riskStyle.bg} ${riskStyle.text}`}>
                        {issue.riskCategory}
                      </span>
                    )}
                  </div>

                  {/* UDAAP reference */}
                  <p className="text-xs text-muted-foreground mb-1">{issue.udaapReference}</p>

                  {/* Excerpt */}
                  <p className="text-sm font-medium text-foreground mb-1">
                    &ldquo;{issue.excerpt}&rdquo;
                  </p>

                  {/* Explanation */}
                  <p className="text-sm text-muted-foreground mb-3">{issue.explanation}</p>

                  {/* Suggestion */}
                  <div className="bg-muted/50 border border-border rounded p-2.5 mb-2">
                    <p className="text-xs text-muted-foreground font-medium mb-0.5">Recommendation</p>
                    <p className="text-sm text-foreground">{issue.suggestion}</p>
                  </div>

                  {/* Proposed phrase + Use button */}
                  {issue.proposedPhrase && (
                    <div className={`border rounded p-2.5 ${isFixed ? 'bg-green-50 border-green-300' : 'bg-green-50 border-green-200'}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-green-700 font-medium mb-0.5">Proposed alternative</p>
                          <p className="text-sm text-green-800">&ldquo;{issue.proposedPhrase}&rdquo;</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUseFix(issue.id);
                          }}
                          className={`flex-shrink-0 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                            isFixed
                              ? 'bg-green-600 text-white hover:bg-green-700'
                              : 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300'
                          }`}
                        >
                          {isFixed ? 'Applied' : 'Use'}
                        </button>
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

// Canvas helpers
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

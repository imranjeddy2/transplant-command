import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Edit2, Shield, TrendingUp, Clock, User, Info } from 'lucide-react';
import type { RiskAssessment, RiskLevel, RiskFactorCategory, RiskFactor } from '@/types';
import { RiskBadge } from './RiskBadge';
import { RiskOverrideModal } from './RiskOverrideModal';
import { updateRiskAssessment } from '@/data/mockData';

interface RiskAssessmentPanelProps {
  assessment: RiskAssessment;
  patientName: string;
  onUpdate?: (updated: RiskAssessment) => void;
}

const categoryLabels: Record<RiskFactorCategory, string> = {
  cardiac: 'Cardiac History',
  diabetes: 'Diabetes',
  dialysis: 'Dialysis',
  sensitization: 'Sensitization',
  cancer: 'Cancer',
  lifestyle: 'Lifestyle',
  compliance: 'Compliance',
  functional: 'Functional Status',
};

const summaryCategoryLabels: Record<RiskFactorCategory, string> = {
  cardiac: 'cardiac history',
  diabetes: 'diabetes complications',
  dialysis: 'dialysis factors',
  sensitization: 'sensitization events',
  cancer: 'oncology history',
  lifestyle: 'lifestyle factors',
  compliance: 'compliance concerns',
  functional: 'functional status',
};

function generateRiskSummary(factors: RiskFactor[], level: RiskLevel): string {
  const highImpactFactors = factors.filter(f => f.impact === 'high');
  const topCategories = [...new Set(highImpactFactors.slice(0, 3).map(f => f.category))];

  const mainConcerns = topCategories.map(c => summaryCategoryLabels[c as RiskFactorCategory]).join(', ');

  if (level === 'HIGH') {
    if (mainConcerns) {
      return `This patient has elevated risk primarily due to ${mainConcerns}. Close monitoring and additional pre-transplant workup is recommended.`;
    }
    return `This patient has elevated risk based on multiple contributing factors. Close monitoring and additional pre-transplant workup is recommended.`;
  } else if (level === 'MEDIUM') {
    if (mainConcerns) {
      return `This patient has moderate risk factors including ${mainConcerns}. Standard evaluation protocol with attention to identified concerns.`;
    }
    return `This patient has moderate risk based on contributing factors. Standard evaluation protocol with attention to identified concerns.`;
  } else {
    return `This patient presents with minimal risk factors. Standard transplant evaluation pathway is appropriate.`;
  }
}

function generateConfidenceExplanation(confidenceScore: number, factors: RiskFactor[]): string {
  const totalFactors = factors.length;
  const highConfidenceFactors = factors.filter(f => f.impact === 'high' || f.impact === 'medium').length;
  const categoriesCovered = new Set(factors.map(f => f.category)).size;

  const parts: string[] = [];

  // Data completeness
  if (confidenceScore >= 90) {
    parts.push('Comprehensive patient data was collected during the pre-evaluation call');
  } else if (confidenceScore >= 80) {
    parts.push('Most key patient data points were captured during the call');
  } else if (confidenceScore >= 70) {
    parts.push('Core patient information was obtained, but some details may be incomplete');
  } else {
    parts.push('Limited data was available for assessment');
  }

  // Factors analysis
  if (totalFactors >= 6) {
    parts.push(`${totalFactors} risk factors were identified and evaluated`);
  } else if (totalFactors >= 3) {
    parts.push(`${totalFactors} risk factors were identified`);
  } else {
    parts.push('Few risk factors were identified, which may indicate incomplete information');
  }

  // Categories covered
  if (categoriesCovered >= 4) {
    parts.push(`Assessment covers ${categoriesCovered} distinct risk categories (cardiac, lifestyle, compliance, etc.)`);
  } else {
    parts.push(`Assessment covers ${categoriesCovered} risk ${categoriesCovered === 1 ? 'category' : 'categories'}`);
  }

  // High-impact factors
  if (highConfidenceFactors > 0) {
    parts.push(`${highConfidenceFactors} clinically significant ${highConfidenceFactors === 1 ? 'factor was' : 'factors were'} clearly documented`);
  }

  return parts.join('. ') + '.';
}

function ConfidenceTooltip({
  confidenceScore,
  factors
}: {
  confidenceScore: number;
  factors: RiskFactor[];
}) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        className="p-0.5 rounded-full hover:bg-muted transition-colors"
        aria-label="Confidence explanation"
      >
        <Info className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
      </button>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72"
          >
            <div className="bg-popover border border-border rounded-lg shadow-lg p-3">
              <p className="text-xs font-medium text-foreground mb-1.5">
                Why {confidenceScore}% confidence?
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {generateConfidenceExplanation(confidenceScore, factors)}
              </p>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full">
                <div className="border-8 border-transparent border-t-border" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 border-[7px] border-transparent border-t-popover" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function RiskAssessmentPanel({
  assessment,
  patientName,
  onUpdate,
}: RiskAssessmentPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [localAssessment, setLocalAssessment] = useState(assessment);

  const effectiveLevel = localAssessment.overrideLevel || localAssessment.calculatedLevel;
  const isOverridden = !!localAssessment.overrideLevel;

  // Group factors by category
  const factorsByCategory = localAssessment.factors.reduce((acc, factor) => {
    if (!acc[factor.category]) {
      acc[factor.category] = [];
    }
    acc[factor.category].push(factor);
    return acc;
  }, {} as Record<RiskFactorCategory, typeof localAssessment.factors>);

  const handleOverride = (newLevel: RiskLevel, reason: string) => {
    const updated = updateRiskAssessment(localAssessment.patientId, {
      overrideLevel: newLevel,
      overrideReason: reason,
      overrideBy: 'Coordinator Sarah Miller',
    });

    if (updated) {
      setLocalAssessment(updated);
      onUpdate?.(updated);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl border border-border overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Risk Assessment</h3>
              <p className="text-sm text-muted-foreground">
                Based on pre-evaluation call data
              </p>
            </div>
          </div>
          <RiskBadge level={effectiveLevel} size="lg" isOverridden={isOverridden} />
        </div>

        {/* Quick Stats */}
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Score</p>
              <p className="text-sm font-medium text-foreground">{localAssessment.totalScore}/100</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="flex items-center gap-1">
                <p className="text-xs text-muted-foreground">Confidence</p>
                <ConfidenceTooltip
                  confidenceScore={localAssessment.confidenceScore}
                  factors={localAssessment.factors}
                />
              </div>
              <p className="text-sm font-medium text-foreground">{localAssessment.confidenceScore}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Assessed</p>
              <p className="text-sm font-medium text-foreground">
                {new Date(localAssessment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>
        </div>

        {/* Override Info */}
        {isOverridden && (
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-2">
              <User className="h-4 w-4 text-amber-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  Manually overridden from {localAssessment.calculatedLevel} to {localAssessment.overrideLevel}
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                  By {localAssessment.overrideBy} on {formatDate(localAssessment.overrideAt!)}
                </p>
                {localAssessment.overrideReason && (
                  <p className="text-sm text-amber-700 dark:text-amber-300 mt-2 italic">
                    "{localAssessment.overrideReason}"
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Risk Summary */}
      <div className="px-4 py-4 border-b border-border">
        <div className={`p-3 rounded-lg border ${
          effectiveLevel === 'HIGH'
            ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            : effectiveLevel === 'MEDIUM'
            ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
            : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
        }`}>
          <p className={`text-sm ${
            effectiveLevel === 'HIGH'
              ? 'text-red-800 dark:text-red-200'
              : effectiveLevel === 'MEDIUM'
              ? 'text-amber-800 dark:text-amber-200'
              : 'text-green-800 dark:text-green-200'
          }`}>
            {generateRiskSummary(localAssessment.factors, effectiveLevel)}
          </p>
        </div>
      </div>

      {/* Expandable Factors */}
      <div className="border-b border-border">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
        >
          <span className="text-sm font-medium text-foreground">
            Why this score? ({localAssessment.factors.length} factors)
          </span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="p-4 pt-0 space-y-4">
                {Object.entries(factorsByCategory).map(([category, factors]) => (
                  <div key={category}>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">
                      {categoryLabels[category as RiskFactorCategory]}
                    </h4>
                    <div className="space-y-2">
                      {factors.map((factor) => (
                        <div
                          key={factor.id}
                          className="p-3 bg-muted/30 rounded-lg border border-border/50"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-foreground">
                                {factor.name}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {factor.value}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1 italic">
                                {factor.description}
                              </p>
                            </div>
                            <div className={`text-sm font-semibold ${
                              factor.points > 0 ? 'text-red-500' :
                              factor.points < 0 ? 'text-green-500' :
                              'text-muted-foreground'
                            }`}>
                              {factor.points > 0 ? '+' : ''}{factor.points}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Actions */}
      <div className="p-4">
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
        >
          <Edit2 className="h-4 w-4" />
          Override Risk Level
        </button>
      </div>

      {/* Override Modal */}
      <RiskOverrideModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleOverride}
        currentLevel={effectiveLevel}
        patientName={patientName}
      />
    </motion.div>
  );
}

import { cn } from '@/lib/utils';
import type { RiskLevel } from '@/types';

interface RiskBadgeProps {
  level: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  isOverridden?: boolean;
  className?: string;
}

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base font-semibold',
};

const levelStyles: Record<RiskLevel, string> = {
  HIGH: 'bg-red-500 text-white',
  MEDIUM: 'bg-amber-500 text-black',
  LOW: 'bg-green-500 text-white',
};

const levelLabels: Record<RiskLevel, string> = {
  HIGH: 'High Risk',
  MEDIUM: 'Medium Risk',
  LOW: 'Low Risk',
};

export function RiskBadge({
  level,
  size = 'md',
  showLabel = true,
  isOverridden = false,
  className,
}: RiskBadgeProps) {
  return (
    <div className={cn('inline-flex items-center gap-1.5', className)}>
      <span
        className={cn(
          'inline-flex items-center rounded-full font-medium',
          sizeStyles[size],
          levelStyles[level]
        )}
      >
        {showLabel ? levelLabels[level] : level}
      </span>
      {isOverridden && (
        <span className="text-xs text-muted-foreground italic">(Override)</span>
      )}
    </div>
  );
}

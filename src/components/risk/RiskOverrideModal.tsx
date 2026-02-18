import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';
import type { RiskLevel } from '@/types';
import { RiskBadge } from './RiskBadge';

interface RiskOverrideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newLevel: RiskLevel, reason: string) => void;
  currentLevel: RiskLevel;
  patientName: string;
}

export function RiskOverrideModal({
  isOpen,
  onClose,
  onSubmit,
  currentLevel,
  patientName,
}: RiskOverrideModalProps) {
  const [selectedLevel, setSelectedLevel] = useState<RiskLevel | null>(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!selectedLevel) {
      setError('Please select a risk level');
      return;
    }
    if (!reason.trim()) {
      setError('Please provide a reason for the override');
      return;
    }
    if (reason.trim().length < 10) {
      setError('Please provide a more detailed reason (at least 10 characters)');
      return;
    }

    onSubmit(selectedLevel, reason.trim());
    setSelectedLevel(null);
    setReason('');
    setError(null);
    onClose();
  };

  const handleClose = () => {
    setSelectedLevel(null);
    setReason('');
    setError(null);
    onClose();
  };

  const levels: RiskLevel[] = ['HIGH', 'MEDIUM', 'LOW'];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-card rounded-xl border border-border shadow-xl w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <h2 className="text-lg font-semibold text-foreground">Override Risk Level</h2>
              </div>
              <button
                onClick={handleClose}
                className="p-1 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              <p className="text-sm text-muted-foreground">
                Override the calculated risk level for <span className="font-medium text-foreground">{patientName}</span>.
                This action will be logged.
              </p>

              {/* Current Level */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Current:</span>
                <RiskBadge level={currentLevel} size="sm" />
              </div>

              {/* Level Selection */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  New Risk Level
                </label>
                <div className="flex gap-2">
                  {levels.map((level) => (
                    <button
                      key={level}
                      onClick={() => {
                        setSelectedLevel(level);
                        setError(null);
                      }}
                      disabled={level === currentLevel}
                      className={`flex-1 py-2 px-3 rounded-lg border transition-all ${
                        selectedLevel === level
                          ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                          : level === currentLevel
                          ? 'border-border bg-muted/50 opacity-50 cursor-not-allowed'
                          : 'border-border hover:border-primary/50 hover:bg-muted/50'
                      }`}
                    >
                      <RiskBadge level={level} size="sm" showLabel={false} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Reason for Override <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value);
                    setError(null);
                  }}
                  placeholder="Explain why you are overriding the calculated risk level..."
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                  rows={3}
                />
              </div>

              {/* Error */}
              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 p-4 border-t border-border">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Confirm Override
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

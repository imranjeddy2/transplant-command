import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Filter, Bell, Calendar, CheckCircle2, ShieldCheck, PhoneCall } from 'lucide-react';
import { getAllPreEvaluations } from '@/data/mockData';
import type { PreEvaluationStatus } from '@/types';

const statusConfig: Record<
  PreEvaluationStatus,
  { label: string; color: string; bgColor: string; icon: typeof Bell }
> = {
  notified: {
    label: 'Notified',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    icon: Bell,
  },
  scheduled: {
    label: 'Scheduled',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    icon: Calendar,
  },
  completed: {
    label: 'Completed',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    icon: CheckCircle2,
  },
  info_verified: {
    label: 'Info Verified',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    icon: ShieldCheck,
  },
};

type FilterOption = 'all' | PreEvaluationStatus;

export function PreEvaluationDashboard() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterOption>('all');

  const preEvaluations = getAllPreEvaluations();
  const filteredPreEvals =
    filter === 'all' ? preEvaluations : preEvaluations.filter((pe) => pe.status === filter);

  const handleRowClick = (patientId: string) => {
    navigate(`/patients/${patientId}`, { state: { defaultTab: 'pre-eval', from: '/pre-evaluations' } });
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    const now = new Date();

    // Check if it's in the future
    if (date > now) {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    }

    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  };

  const getLastUpdated = (preEval: (typeof preEvaluations)[0]) => {
    // Return the most recent timestamp based on status
    if (preEval.verifiedAt) return preEval.verifiedAt;
    if (preEval.completedAt) return preEval.completedAt;
    if (preEval.scheduledCallTime) return preEval.scheduledCallTime;
    if (preEval.scheduledAt) return preEval.scheduledAt;
    return preEval.notifiedAt;
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <PhoneCall className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-semibold text-foreground">Pre-Evaluations</h1>
        </div>
        <p className="text-muted-foreground mt-1">
          Manage AI bot calls that collect patient information before clinical evaluation
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Filter className="h-4 w-4" />
            <span className="text-sm font-medium">Filter:</span>
          </div>
          <div className="flex gap-2">
            {(['all', 'scheduled', 'completed', 'info_verified'] as FilterOption[]).map(
              (option) => (
                <button
                  key={option}
                  onClick={() => setFilter(option)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filter === option
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  {option === 'all' ? 'All' : statusConfig[option].label}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Pre-Evaluation Table */}
      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                Patient
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">MRN</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                Status
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                Scheduled Time
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                Duration
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                Last Updated
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredPreEvals.map((preEval, index) => {
              const status = statusConfig[preEval.status];
              const StatusIcon = status.icon;

              return (
                <motion.tr
                  key={preEval.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => handleRowClick(preEval.patientId)}
                  className="border-b border-border last:border-0 cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <td className="py-3 px-4">
                    <span className="font-medium text-foreground">{preEval.patientName}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-muted-foreground font-mono">{preEval.mrn}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}
                    >
                      <StatusIcon className="h-3.5 w-3.5" />
                      {status.label}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-muted-foreground">
                      {formatDateTime(preEval.scheduledCallTime)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-muted-foreground">
                      {preEval.actualCallDuration ? `${preEval.actualCallDuration} min` : '—'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-muted-foreground">
                      {formatDateTime(getLastUpdated(preEval))}
                    </span>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>

        {filteredPreEvals.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">No pre-evaluations found matching your filter.</p>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="mt-4 text-sm text-muted-foreground">
        Showing {filteredPreEvals.length} of {preEvaluations.length} pre-evaluations
      </div>
    </div>
  );
}

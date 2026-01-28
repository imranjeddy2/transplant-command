import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Filter, Clock, CheckCircle2, AlertCircle, Circle, XCircle } from 'lucide-react';
import { tasks } from '@/data/mockData';
import type { Task, TaskStatus } from '@/types';

const statusConfig: Record<
  TaskStatus,
  { label: string; color: string; bgColor: string; icon: typeof Circle }
> = {
  review_needed: {
    label: 'Review Needed',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    icon: AlertCircle,
  },
  in_progress: {
    label: 'In Progress',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    icon: Clock,
  },
  completed: {
    label: 'Completed',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    icon: CheckCircle2,
  },
  pending: {
    label: 'Pending',
    color: 'text-gray-500',
    bgColor: 'bg-gray-100',
    icon: Circle,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-gray-400',
    bgColor: 'bg-gray-50',
    icon: XCircle,
  },
};

const taskTypeLabels: Record<Task['type'], string> = {
  referral_review: 'Referral Review',
  document_upload: 'Document Upload',
  insurance_verification: 'Insurance Verification',
  clinical_review: 'Clinical Review',
};

type FilterOption = 'all' | TaskStatus;

export function TaskDashboard() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterOption>('all');

  const filteredTasks = filter === 'all' ? tasks : tasks.filter((t) => t.status === filter);

  const handleTaskClick = (task: Task) => {
    if (task.status === 'review_needed') {
      navigate(`/tasks/${task.id}`);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Tasks</h1>
        <p className="text-muted-foreground mt-1">Manage and review transplant referral tasks</p>
      </div>

      {/* Filter Bar */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Filter className="h-4 w-4" />
            <span className="text-sm font-medium">Filter:</span>
          </div>
          <div className="flex gap-2">
            {(['all', 'review_needed', 'in_progress', 'completed'] as FilterOption[]).map(
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
                  {option === 'all' ? 'All Tasks' : statusConfig[option].label}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Task Table */}
      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                Patient
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">MRN</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                Task Type
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                Status
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                Created
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                Referring
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((task, index) => {
              const status = statusConfig[task.status];
              const StatusIcon = status.icon;
              const isClickable = task.status === 'review_needed';

              return (
                <motion.tr
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => handleTaskClick(task)}
                  className={`border-b border-border last:border-0 ${
                    isClickable
                      ? 'cursor-pointer hover:bg-muted/50 transition-colors'
                      : 'opacity-75'
                  }`}
                >
                  <td className="py-3 px-4">
                    <span className="font-medium text-foreground">{task.patientName}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-muted-foreground font-mono">{task.mrn}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-foreground">{taskTypeLabels[task.type]}</span>
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
                      {formatTime(task.createdAt)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-muted-foreground">
                      {task.referringProvider || '—'}
                    </span>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>

        {filteredTasks.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">No tasks found matching your filter.</p>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="mt-4 text-sm text-muted-foreground">
        Showing {filteredTasks.length} of {tasks.length} tasks
      </div>
    </div>
  );
}

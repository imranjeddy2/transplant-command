import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, Clock, Calendar, ArrowRight, Sparkles } from 'lucide-react';
import { tasks, getAllPreEvaluations } from '@/data/mockData';
import { useUser } from '@/context';
import type { Task } from '@/types';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays}d ago`;
}

interface StatCardProps {
  title: string;
  count: number;
  subtitle: string;
  icon: typeof AlertCircle;
  color: 'primary' | 'blue' | 'amber';
  onClick?: () => void;
}

function StatCard({ title, count, subtitle, icon: Icon, color, onClick }: StatCardProps) {
  const colorClasses = {
    primary: { bg: 'bg-primary/10', text: 'text-primary', gradient: 'from-primary/5 to-transparent' },
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-500', gradient: 'from-blue-500/5 to-transparent' },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-500', gradient: 'from-amber-500/5 to-transparent' },
  };

  const classes = colorClasses[color];

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      onClick={onClick}
      className="relative bg-card rounded-xl border border-border p-6 text-left hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 w-full overflow-hidden group"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${classes.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-semibold text-foreground mt-2 tracking-tight">{count}</p>
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        </div>
        <div className={`p-3 rounded-xl ${classes.bg} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`h-6 w-6 ${classes.text}`} />
        </div>
      </div>
    </motion.button>
  );
}

interface ActionItemProps {
  task: Task;
  index: number;
  onClick: () => void;
}

function ActionItem({ task, index, onClick }: ActionItemProps) {
  const statusConfig = {
    review_needed: { icon: AlertCircle, color: 'text-primary' },
    in_progress: { icon: Clock, color: 'text-blue-500' },
  };

  const config = statusConfig[task.status as keyof typeof statusConfig] || statusConfig.review_needed;
  const Icon = config.icon;

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 bg-muted/30 hover:bg-muted/50 rounded-lg transition-colors text-left"
    >
      <Icon className={`h-5 w-5 ${config.color} flex-shrink-0`} />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">{task.patientName}</p>
        <p className="text-sm text-muted-foreground truncate">{task.description}</p>
      </div>
      <span className="text-xs text-muted-foreground flex-shrink-0">
        {formatTimeAgo(task.createdAt)}
      </span>
    </motion.button>
  );
}

export function HomeDashboard() {
  const navigate = useNavigate();
  const { user } = useUser();

  const reviewNeededTasks = tasks.filter((t) => t.status === 'review_needed');
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress');
  const scheduledPreEvals = getAllPreEvaluations().filter((pe) => pe.status === 'scheduled');

  const handleTaskClick = (taskId: string) => {
    navigate(`/tasks/${taskId}`);
  };

  return (
    <div className="p-8">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-semibold text-foreground">
            {getGreeting()}, {user.firstName}
          </h1>
          <motion.div
            initial={{ rotate: -20, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          >
            <Sparkles className="h-5 w-5 text-primary" />
          </motion.div>
        </div>
        <p className="text-muted-foreground">
          Here's what needs your attention today
        </p>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Review Needed"
          count={reviewNeededTasks.length}
          subtitle="tasks awaiting review"
          icon={AlertCircle}
          color="primary"
          onClick={() => navigate('/tasks')}
        />
        <StatCard
          title="In Progress"
          count={inProgressTasks.length}
          subtitle="tasks being worked on"
          icon={Clock}
          color="blue"
          onClick={() => navigate('/tasks')}
        />
        <StatCard
          title="Scheduled Pre-Evals"
          count={scheduledPreEvals.length}
          subtitle="calls pending"
          icon={Calendar}
          color="amber"
          onClick={() => navigate('/pre-evaluations')}
        />
      </div>

      {/* Action Lists */}
      <div className="space-y-6">
        {/* Review Needed Section */}
        {reviewNeededTasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-xl border border-border p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-foreground">Needs Your Review</h2>
              <button
                onClick={() => navigate('/tasks')}
                className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                View all
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2">
              {reviewNeededTasks.slice(0, 5).map((task, index) => (
                <ActionItem
                  key={task.id}
                  task={task}
                  index={index}
                  onClick={() => handleTaskClick(task.id)}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* In Progress Section */}
        {inProgressTasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-xl border border-border p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-foreground">In Progress</h2>
              <button
                onClick={() => navigate('/tasks')}
                className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                View all
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2">
              {inProgressTasks.slice(0, 5).map((task, index) => (
                <ActionItem
                  key={task.id}
                  task={task}
                  index={index}
                  onClick={() => handleTaskClick(task.id)}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Scheduled Pre-Evals Section */}
        {scheduledPreEvals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card rounded-xl border border-border p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-foreground">Upcoming Pre-Evaluation Calls</h2>
              <button
                onClick={() => navigate('/pre-evaluations')}
                className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                View all
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2">
              {scheduledPreEvals.slice(0, 3).map((preEval, index) => (
                <motion.div
                  key={preEval.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg"
                >
                  <Calendar className="h-5 w-5 text-amber-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{preEval.patientName}</p>
                    <p className="text-sm text-muted-foreground">
                      Scheduled: {new Date(preEval.scheduledCallTime!).toLocaleString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

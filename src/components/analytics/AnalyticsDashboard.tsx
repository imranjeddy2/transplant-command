import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { TrendingUp, Users, Clock, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { trendData, insuranceBreakdown, analyticsMetrics } from '@/data/mockData';
import { RiskAnalyticsSection } from './RiskAnalyticsSection';

const COLORS = ['#9333EA', '#10B981', '#3B82F6', '#F59E0B', '#EC4899'];

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: typeof TrendingUp;
  trend?: { value: number; label: string };
  color?: string;
}

function MetricCard({ title, value, subtitle, icon: Icon, trend, color = 'primary' }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl border border-border p-6"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-semibold text-foreground mt-2">{value}</p>
          {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
          {trend && (
            <p
              className={`text-sm mt-2 ${trend.value >= 0 ? 'text-green-600' : 'text-red-600'}`}
            >
              {trend.value >= 0 ? '+' : ''}
              {trend.value}% {trend.label}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-${color}/10`}>
          <Icon className={`h-6 w-6 text-${color}`} />
        </div>
      </div>
    </motion.div>
  );
}

export function AnalyticsDashboard() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Operational metrics and transplant referral insights
        </p>
      </div>

      {/* Risk Assessment Analytics - FIRST */}
      <div className="mb-8">
        <RiskAnalyticsSection />
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Referrals"
          value={analyticsMetrics.totalReferrals}
          subtitle="This month"
          icon={Users}
          trend={{ value: 12, label: 'vs last month' }}
        />
        <MetricCard
          title="New Patients"
          value={`${analyticsMetrics.newPatientsPercent}%`}
          subtitle={`${analyticsMetrics.newPatients} patients`}
          icon={TrendingUp}
          trend={{ value: 8, label: 'vs last month' }}
        />
        <MetricCard
          title="Evaluation Rate"
          value={`${analyticsMetrics.evaluationRate}%`}
          subtitle="Referrals evaluated"
          icon={CheckCircle2}
          trend={{ value: 5, label: 'vs last month' }}
        />
        <MetricCard
          title="Avg. Processing Time"
          value={`${analyticsMetrics.avgProcessingDays}`}
          subtitle="Days"
          icon={Clock}
          trend={{ value: -15, label: 'vs last month' }}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-card rounded-xl border border-border p-6"
        >
          <h3 className="text-lg font-medium text-foreground mb-4">Referral Trends</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="referrals"
                  stroke="#9333EA"
                  strokeWidth={2}
                  dot={{ fill: '#9333EA', strokeWidth: 2 }}
                  name="Referrals"
                />
                <Line
                  type="monotone"
                  dataKey="evaluations"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ fill: '#10B981', strokeWidth: 2 }}
                  name="Evaluations"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-6 mt-4 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-sm text-muted-foreground">Referrals</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm text-muted-foreground">Evaluations</span>
            </div>
          </div>
        </motion.div>

        {/* Insurance Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-xl border border-border p-6"
        >
          <h3 className="text-lg font-medium text-foreground mb-4">Insurance Breakdown</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={insuranceBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="count"
                >
                  {insuranceBreakdown.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {insuranceBreakdown.slice(0, 4).map((item, index) => (
              <div key={item.carrier} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: COLORS[index] }}
                  />
                  <span className="text-muted-foreground">{item.carrier}</span>
                </div>
                <span className="font-medium text-foreground">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* AI Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-xl border border-border p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-medium text-foreground">AI Performance</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Extraction Accuracy</span>
              <span className="text-2xl font-semibold text-foreground">
                {analyticsMetrics.aiAccuracyRate}%
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${analyticsMetrics.aiAccuracyRate}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {analyticsMetrics.aiAccuracyRate}% of AI extractions were accepted without manual
              edits
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card rounded-xl border border-border p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            <h3 className="text-lg font-medium text-foreground">Pending Actions</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-foreground">Reviews Pending</span>
              <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                {analyticsMetrics.pendingReviews}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-foreground">Completed This Week</span>
              <span className="px-2.5 py-1 bg-green-50 text-green-600 rounded-full text-sm font-medium">
                {analyticsMetrics.completedThisWeek}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

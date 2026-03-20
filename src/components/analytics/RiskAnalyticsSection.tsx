import { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';
import { ChevronDown, Settings2 } from 'lucide-react';
import {
  riskAnalyticsData,
  modelPerformanceData,
  calibrationData,
  riskDistributionHistogramData,
  outcomeTrackingData,
} from '@/data/mockData';

const RISK_COLORS = {
  high: '#EF4444',
  medium: '#F59E0B',
  low: '#10B981',
};


// Summary box component for plain-language explanations
function SummaryBox({ children, variant = 'info' }: { children: React.ReactNode; variant?: 'info' | 'success' | 'warning' }) {
  const styles = {
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
    warning: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200',
  };

  return (
    <div className={`p-3 rounded-lg border text-sm ${styles[variant]}`}>
      {children}
    </div>
  );
}

// Model Performance Chart - Diagnostic Accuracy
function ModelPerformanceChart() {
  const data = modelPerformanceData.metrics.map((m) => ({
    ...m,
    fill: m.value >= m.benchmark ? '#10B981' : '#F59E0B',
  }));

  return (
    <div className="bg-card rounded-md border border-border p-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base font-medium text-foreground">Model Performance</h3>
        <span className="text-xs text-green-700 font-medium">Validated</span>
      </div>

      <SummaryBox variant="success">
        This model correctly identifies <strong>89%</strong> of high-risk patients. When it flags someone as high-risk, it's accurate <strong>76%</strong> of the time.
      </SummaryBox>

      <div className="h-56 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          >
            <XAxis
              type="number"
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
              stroke="#9CA3AF"
              fontSize={12}
            />
            <YAxis
              type="category"
              dataKey="name"
              stroke="#9CA3AF"
              fontSize={11}
              width={100}
            />
            <ReferenceLine x={80} stroke="#6B7280" strokeDasharray="3 3" label={{ value: 'Benchmark', position: 'top', fontSize: 10, fill: '#6B7280' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
              }}
              formatter={(value, _name, props) => {
                const payload = props.payload as { technicalName?: string; description?: string };
                return [
                  `${value}% (${payload.technicalName || ''})`,
                  payload.description || '',
                ];
              }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="text-xs text-muted-foreground mt-2 text-center">
        Validated on {modelPerformanceData.validationInfo.sampleSize.toLocaleString()} patients • {modelPerformanceData.validationInfo.validationPeriod}
      </p>
    </div>
  );
}

// Calibration Curve Chart
function CalibrationCurveChart() {
  const data = calibrationData.deciles.map((d) => ({
    predicted: d.predictedRisk,
    actual: d.actualOutcomes,
    perfect: d.predictedRisk,
    patients: d.patientCount,
  }));

  return (
    <div className="lg:col-span-2 bg-card rounded-md border border-border p-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base font-medium text-foreground">Calibration Curve</h3>
        <span className="text-xs text-green-700 font-medium">Good calibration</span>
      </div>

      <SummaryBox variant="success">
        When this model predicts a risk level, reality closely matches. Predictions are <strong>trustworthy across all risk levels</strong>.
      </SummaryBox>

      <div className="h-64 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="predicted"
              tickFormatter={(value) => `${value}%`}
              stroke="#9CA3AF"
              fontSize={12}
              label={{ value: 'Predicted Risk', position: 'bottom', offset: -5, fontSize: 11, fill: '#6B7280' }}
            />
            <YAxis
              tickFormatter={(value) => `${value}%`}
              stroke="#9CA3AF"
              fontSize={12}
              label={{ value: 'Actual Outcomes', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#6B7280' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
              }}
              formatter={(value, name) => [
                `${value}%`,
                name === 'perfect' ? 'Perfect Calibration' : name === 'actual' ? 'Actual Outcomes' : String(name),
              ]}
            />
            <Line
              type="monotone"
              dataKey="perfect"
              stroke="#9CA3AF"
              strokeDasharray="5 5"
              strokeWidth={2}
              dot={false}
              name="Perfect Calibration"
            />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#1D4ED8"
              strokeWidth={2}
              dot={{ fill: '#1D4ED8', strokeWidth: 2, r: 4 }}
              name="Actual Outcomes"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="flex gap-6 mt-2 justify-center text-sm">
        <div className="flex items-center gap-2">
          <div className="w-6 h-0.5 bg-gray-400" style={{ borderStyle: 'dashed' }} />
          <span className="text-muted-foreground">Perfect calibration</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-0.5 bg-primary" />
          <span className="text-muted-foreground">Actual model</span>
        </div>
      </div>
    </div>
  );
}

// Risk Score Distribution Histogram
function RiskScoreDistributionChart() {
  const data = riskDistributionHistogramData.histogram.map((bin) => {
    let fill = RISK_COLORS.low;
    if (bin.scoreMidpoint >= riskDistributionHistogramData.thresholds.mediumToHigh) {
      fill = RISK_COLORS.high;
    } else if (bin.scoreMidpoint >= riskDistributionHistogramData.thresholds.lowToMedium) {
      fill = RISK_COLORS.medium;
    }
    return { ...bin, fill };
  });

  const stats = riskDistributionHistogramData.statistics;
  const thresholds = riskDistributionHistogramData.thresholds;

  // Calculate percentages for each zone
  const lowRiskPct = data.filter(d => d.scoreMidpoint < thresholds.lowToMedium).reduce((sum, d) => sum + d.percentage, 0);
  const medRiskPct = data.filter(d => d.scoreMidpoint >= thresholds.lowToMedium && d.scoreMidpoint < thresholds.mediumToHigh).reduce((sum, d) => sum + d.percentage, 0);
  const highRiskPct = data.filter(d => d.scoreMidpoint >= thresholds.mediumToHigh).reduce((sum, d) => sum + d.percentage, 0);

  return (
    <div className="bg-card rounded-md border border-border p-6">
      <h3 className="text-base font-medium text-foreground mb-2">Risk Score Distribution</h3>

      <SummaryBox>
        Most patients cluster around scores of <strong>30-40</strong>. {lowRiskPct}% are low-risk, {medRiskPct}% medium-risk, and {highRiskPct}% high-risk.
      </SummaryBox>

      <div className="h-56 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="riskGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={RISK_COLORS.low} stopOpacity={0.3} />
                <stop offset="30%" stopColor={RISK_COLORS.low} stopOpacity={0.3} />
                <stop offset="30%" stopColor={RISK_COLORS.medium} stopOpacity={0.3} />
                <stop offset="60%" stopColor={RISK_COLORS.medium} stopOpacity={0.3} />
                <stop offset="60%" stopColor={RISK_COLORS.high} stopOpacity={0.3} />
                <stop offset="100%" stopColor={RISK_COLORS.high} stopOpacity={0.3} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="scoreRange"
              stroke="#9CA3AF"
              fontSize={10}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis
              tickFormatter={(value) => `${value}%`}
              stroke="#9CA3AF"
              fontSize={12}
            />
            <ReferenceLine x="20-30" stroke={RISK_COLORS.medium} strokeDasharray="3 3" />
            <ReferenceLine x="60-70" stroke={RISK_COLORS.high} strokeDasharray="3 3" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
              }}
              formatter={(value) => [`${value}%`, 'Patients']}
            />
            <Area
              type="monotone"
              dataKey="percentage"
              fill="url(#riskGradient)"
              stroke="none"
            />
            <Bar dataKey="percentage" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-center gap-8 mt-2 text-xs text-muted-foreground">
        <span>Mean: <strong className="text-foreground">{stats.mean}</strong></span>
        <span>Median: <strong className="text-foreground">{stats.median}</strong></span>
        <span>Std Dev: <strong className="text-foreground">{stats.standardDeviation}</strong></span>
      </div>
    </div>
  );
}

// Category config for Variable Importance
const CATEGORY_CONFIG: Record<string, { label: string; color: string }> = {
  cardiac:       { label: 'Cardiac',       color: '#DC2626' },
  diabetes:      { label: 'Diabetes',      color: '#D97706' },
  sensitization: { label: 'Sensitization', color: '#1D4ED8' },
  dialysis:      { label: 'Dialysis',      color: '#0891B2' },
  lifestyle:     { label: 'Lifestyle',     color: '#6B7280' },
  compliance:    { label: 'Compliance',    color: '#16A34A' },
  cancer:        { label: 'Oncology',      color: '#9D174D' },
  functional:    { label: 'Functional',    color: '#4F46E5' },
};

// Variable Importance Chart
function VariableImportanceChart() {
  const data = riskAnalyticsData.variableImportance
    .sort((a, b) => b.importance - a.importance)
    .map((item, index) => ({
      ...item,
      rank: index + 1,
      config: CATEGORY_CONFIG[item.category] || { label: item.category, color: '#6B7280' },
    }));

  const maxImportance = Math.max(...data.map(d => d.importance));
  const topThree = data.slice(0, 3);
  const topCategories = [...new Set(topThree.map(d => d.config.label))].join(', ');

  return (
    <div className="lg:col-span-2 bg-card rounded-md border border-border p-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base font-medium text-foreground">Variable Importance</h3>
        <span className="text-xs text-muted-foreground">{data.length} factors</span>
      </div>

      <SummaryBox>
        The top predictors are <strong>{topCategories}</strong>. Cardiac history alone accounts for <strong>{topThree[0]?.importance}%</strong> of the risk calculation.
      </SummaryBox>

      <div className="mt-4 space-y-1.5">
        {data.map((item) => {
          const barWidth = (item.importance / maxImportance) * 100;

          return (
            <div key={item.variable} className="flex items-center gap-3 py-1 border-l-2 pl-3" style={{ borderLeftColor: item.config.color }}>
              <span className="text-xs text-muted-foreground w-4 text-right flex-shrink-0">{item.rank}</span>
              <span className="text-sm text-foreground w-44 flex-shrink-0 truncate">{item.variable}</span>
              <div className="flex-1 h-1.5 bg-muted rounded-sm overflow-hidden">
                <div
                  className="h-full rounded-sm"
                  style={{ width: `${barWidth}%`, backgroundColor: item.config.color }}
                />
              </div>
              <span className="text-sm text-muted-foreground w-10 text-right flex-shrink-0">{item.importance}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Outcome Tracking Chart
function OutcomeTrackingChart() {
  const data = outcomeTrackingData.monthly;
  const aggregate = outcomeTrackingData.aggregate;

  const trendIcon = aggregate.trend === 'improving' ? '↑' : aggregate.trend === 'declining' ? '↓' : '→';
  const trendColor = aggregate.trend === 'improving' ? 'text-green-600' : aggregate.trend === 'declining' ? 'text-red-600' : 'text-gray-600';

  return (
    <div className="bg-card rounded-md border border-border p-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base font-medium text-foreground">Outcome Tracking</h3>
        <span className={`text-sm font-medium ${trendColor}`}>
          {aggregate.overallAccuracy}% accuracy {trendIcon}
        </span>
      </div>

      <SummaryBox variant="success">
        Over 12 months, high-risk predictions matched actual outcomes <strong>{aggregate.overallAccuracy}%</strong> of the time. Performance has remained <strong>{aggregate.trend}</strong>.
      </SummaryBox>

      <div className="h-48 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="month" stroke="#9CA3AF" fontSize={10} />
            <YAxis stroke="#9CA3AF" fontSize={10} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #D1D5DB',
                borderRadius: '4px',
                fontSize: '12px',
              }}
            />
            <Bar dataKey="actualComplications" fill="#93C5FD" name="Actual Complications" />
            <Bar dataKey="truePositives" fill="#1D4ED8" name="True Positives" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex gap-4 mt-2 justify-center text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-blue-200" />
          <span className="text-muted-foreground">Complications</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-primary" />
          <span className="text-muted-foreground">True Positives</span>
        </div>
      </div>
    </div>
  );
}

export function RiskAnalyticsSection() {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  // Transform distribution data for pie chart
  const distributionData = [
    { name: 'High Risk', value: riskAnalyticsData.distribution.high, color: RISK_COLORS.high },
    { name: 'Medium Risk', value: riskAnalyticsData.distribution.medium, color: RISK_COLORS.medium },
    { name: 'Low Risk', value: riskAnalyticsData.distribution.low, color: RISK_COLORS.low },
  ];

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <h2 className="text-lg font-semibold text-foreground">Risk Assessment Analytics</h2>

      {/* Row 1: Risk Distribution + Outcome Tracking (stacked) | Variable Importance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Stacked charts */}
        <div className="space-y-6">
          {/* Risk Distribution */}
          <div className="bg-card rounded-md border border-border p-6">
            <h3 className="text-base font-medium text-foreground mb-4">Patient Risk Distribution</h3>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                    }}
                    formatter={(value) => [`${value}%`, 'Percentage']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-3">
              {distributionData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="font-medium text-foreground">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Outcome Tracking - moved here */}
          <OutcomeTrackingChart />
        </div>

        {/* Variable Importance - spans 2 columns */}
        <VariableImportanceChart />
      </div>

      {/* Row 2: Risk Score Distribution (full width) */}
      <RiskScoreDistributionChart />

      {/* Model Metrics (existing) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Model Confidence */}
        <div className="bg-card rounded-md border border-border p-6">
          <h3 className="text-base font-medium text-foreground mb-4">Model Confidence</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Overall Accuracy</span>
              <span className="text-2xl font-semibold text-foreground">
                {riskAnalyticsData.modelConfidence}%
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${riskAnalyticsData.modelConfidence}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Based on historical outcomes and clinical validation
            </p>
          </div>
        </div>

        {/* Patients Assessed */}
        <div className="bg-card rounded-md border border-border p-6">
          <h3 className="text-base font-medium text-foreground mb-4">Patients Assessed</h3>
          <div className="space-y-3">
            <p className="text-3xl font-semibold text-foreground">
              {riskAnalyticsData.totalAssessed}
            </p>
            <p className="text-sm text-muted-foreground">
              Total patients with completed risk assessments
            </p>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-green-500">+12</span>
              <span className="text-muted-foreground">this week</span>
            </div>
          </div>
        </div>

        {/* High Risk Alert */}
        <div className="bg-card rounded-md border border-border p-6">
          <h3 className="text-base font-medium text-foreground mb-4">High Risk Patients</h3>
          <div className="space-y-3">
            <p className="text-3xl font-semibold text-foreground">
              {Math.round(riskAnalyticsData.totalAssessed * riskAnalyticsData.distribution.high / 100)}
            </p>
            <p className="text-sm text-muted-foreground">
              Patients requiring additional review
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-red-100 rounded-full h-1.5">
                <div
                  className="bg-red-500 h-1.5 rounded-full"
                  style={{ width: `${riskAnalyticsData.distribution.high}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">
                {riskAnalyticsData.distribution.high}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Methodology Note */}
      <div className="bg-muted/30 rounded-lg p-4 border border-border">
        <h4 className="text-sm font-medium text-foreground mb-2">Methodology</h4>
        <p className="text-sm text-muted-foreground">
          Risk scores are calculated using a rule-based algorithm that weighs clinical factors including
          cardiac history, diabetes complications, dialysis duration, sensitization events, and lifestyle factors.
          The model has been validated against historical transplant outcomes and is continuously refined
          based on clinical feedback. Variable importance reflects the contribution of each factor category
          to the overall risk determination.
        </p>
      </div>

      {/* Advanced Model Details - Collapsible Section */}
      <div className="bg-card rounded-md border border-border overflow-hidden">
        <button
          onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
          className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <Settings2 className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-medium text-foreground">Advanced Model Details</h3>
              <p className="text-xs text-muted-foreground">
                Calibration curve, sensitivity/specificity, and diagnostic metrics
              </p>
            </div>
          </div>
          <ChevronDown
            className={`h-5 w-5 text-muted-foreground transition-transform ${isAdvancedOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {isAdvancedOpen && (
          <div className="overflow-hidden">
            <div className="p-4 pt-0 space-y-6 border-t border-border">
              {/* Model Performance + Calibration Curve */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
                <ModelPerformanceChart />
                <CalibrationCurveChart />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

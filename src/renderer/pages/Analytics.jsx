import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip
} from 'chart.js';
import { useEffect, useMemo, useState } from 'react';
import { Line, Pie } from 'react-chartjs-2';
import CashflowTimeline from '../components/CashflowTimeline';
import GoalRace from '../components/GoalRace';
import HealthScore from '../components/HealthScore';
import InteractiveSlider from '../components/InteractiveSlider';
import SpendingByDayChart from '../components/SpendingByDayChart';
import SpendingHeatmap from '../components/SpendingHeatmap';
import {
  calculateCashflowTimeline,
  calculateFutureImpact,
  calculateHealthScore,
  generateInsights,
  getGoalRaceData,
  getSpendingByDayOfWeek,
  getSpendingHeatmap
} from '../utils/analyticsInsights';
import {
  calculateAverageMonthlyIncome,
  calculateBurnRate,
  calculateSpendingVelocity,
  formatCurrency,
  getMonthlyTrends,
  getSpendingByCategory,
  getTotalMonthlyRecurring,
  projectFutureBalance
} from '../utils/calculations';
import { calculateGoalProgress, getGoalTypeInfo } from '../utils/goalCalculations';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Analytics({ transactions, totals }) {
  const [goals, setGoals] = useState([]);
  const [whatIfAdjustment, setWhatIfAdjustment] = useState(500);

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const data = await window.electronAPI.getGoals();
      setGoals(data);
    } catch (error) {
      console.error('Failed to load goals:', error);
    }
  };

  const trends = useMemo(() => getMonthlyTrends(transactions), [transactions]);
  const categoryData = useMemo(() => getSpendingByCategory(transactions), [transactions]);
  const projections = useMemo(() => projectFutureBalance(totals.balance, transactions, 24), [totals.balance, transactions]);
  const avgMonthlyIncome = useMemo(() => calculateAverageMonthlyIncome(transactions, 6), [transactions]);
  const spendingVelocity = useMemo(() => calculateSpendingVelocity(transactions), [transactions]);
  const burnRate = useMemo(() => calculateBurnRate(transactions), [transactions]);
  const monthlyRecurring = useMemo(() => getTotalMonthlyRecurring(transactions), [transactions]);

  const insights = useMemo(() => generateInsights(transactions, totals, goals), [transactions, totals, goals]);
  const futureImpact = useMemo(() => calculateFutureImpact(transactions, totals, goals, whatIfAdjustment), [transactions, totals, goals, whatIfAdjustment]);
  const healthScore = useMemo(() => calculateHealthScore(transactions, totals, goals), [transactions, totals, goals]);
  const heatmapData = useMemo(() => getSpendingHeatmap(transactions), [transactions]);
  const dayOfWeekData = useMemo(() => getSpendingByDayOfWeek(transactions), [transactions]);
  const cashflowTimeline = useMemo(() => calculateCashflowTimeline(transactions, totals.balance), [transactions, totals.balance]);
  const goalRaceData = useMemo(() => getGoalRaceData(goals, transactions, totals.balance), [goals, transactions, totals.balance]);

  const activeGoals = goals.filter(g => !g.completed && !g.archived);

  // Monthly Trends Chart
  const trendsChartData = {
    labels: trends.map(t => t.month),
    datasets: [
      {
        label: 'Income',
        data: trends.map(t => t.income),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
      },
      {
        label: 'Expenses',
        data: trends.map(t => t.expenses),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
      },
      {
        label: 'Net Income',
        data: trends.map(t => t.net),
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
      },
    ],
  };

  // Category Pie Chart
  const categoryChartData = {
    labels: categoryData.map(c => c.category),
    datasets: [
      {
        data: categoryData.map(c => c.amount),
        backgroundColor: [
          '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
          '#f59e0b', '#10b981', '#06b6d4', '#3b82f6',
          '#14b8a6', '#84cc16',
        ],
        borderWidth: 0,
      },
    ],
  };

  // Future Projections Chart with What-If
  const projectionsChartData = {
    labels: projections.map(p => `M${p.month}`),
    datasets: [
      {
        label: 'Current Pace',
        data: projections.map(p => p.balance),
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
      },
      {
        label: `With +${formatCurrency(whatIfAdjustment)}/mo`,
        data: projections.map(p => p.balance + (whatIfAdjustment * p.month)),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.05)',
        fill: false,
        tension: 0.4,
        borderWidth: 3,
        borderDash: [5, 5],
      },
      ...activeGoals.filter(g => g.type === 'balance').map((goal, idx) => ({
        label: goal.title,
        data: projections.map(() => goal.target_amount),
        borderColor: ['#f59e0b', '#ec4899', '#14b8a6'][idx % 3],
        borderDash: [5, 5],
        borderWidth: 2,
        fill: false,
        pointRadius: 0,
      })),
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: '#94a3b8',
          font: { size: 11 },
          padding: 12,
          usePointStyle: true,
        }
      },
      tooltip: {
        backgroundColor: '#1a1a24',
        titleColor: '#f8fafc',
        bodyColor: '#94a3b8',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) label += ': ';
            if (context.parsed.y !== null) {
              label += formatCurrency(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        ticks: { 
          color: '#64748b', 
          font: { size: 11 },
          callback: (value) => 'N$' + (value / 1000) + 'k',
        },
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        border: { display: false }
      },
      x: {
        ticks: { color: '#64748b', font: { size: 11 } },
        grid: { display: false },
        border: { display: false }
      }
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#94a3b8',
          font: { size: 11 },
          padding: 12,
          usePointStyle: true,
        }
      },
      tooltip: {
        backgroundColor: '#1a1a24',
        titleColor: '#f8fafc',
        bodyColor: '#94a3b8',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${formatCurrency(context.parsed)} (${percentage}%)`;
          }
        }
      }
    }
  };

  return (
    <div className="page-analytics">
      <h2 className="page-title">📊 Analytics & Insights</h2>

      {/* Financial Health Score */}
      <div className="analytics-section">
        <h3 className="section-title">💯 Financial Health Score</h3>
        <HealthScore healthData={healthScore} />
      </div>

      {/* Active Goals Overview */}
      {activeGoals.length > 0 && (
        <div className="analytics-section">
          <h3 className="section-title">🎯 Active Goals</h3>
          <div className="goals-mini-grid">
            {activeGoals.map((goal) => {
              const progress = calculateGoalProgress(goal, transactions, totals.balance);
              const typeInfo = getGoalTypeInfo(goal.type);

              return (
                <div key={goal.id} className="goal-mini-card">
                  <div className="goal-mini-header">
                    <span className="goal-mini-icon">{typeInfo.icon}</span>
                    <span className="goal-mini-title">{goal.title}</span>
                  </div>
                  <div className="goal-mini-progress">
                    <div className="goal-mini-bar-bg">
                      <div 
                        className={`goal-mini-bar ${progress.onTrack ? 'on-track' : 'behind'}`}
                        style={{ width: `${Math.min(progress.percentage, 100)}%` }}
                      />
                    </div>
                    <span className="goal-mini-percentage">{progress.percentage.toFixed(0)}%</span>
                  </div>
                  <div className="goal-mini-amount">
                    {formatCurrency(progress.current)} / {formatCurrency(progress.target)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Goal Race */}
      {goalRaceData.length > 1 && (
        <div className="analytics-section">
          <h3 className="section-title">🏁 Goal Race</h3>
          <GoalRace raceData={goalRaceData} />
        </div>
      )}

      {/* Smart Insights */}
      {insights.length > 0 && (
        <div className="analytics-section">
          <h3 className="section-title">💡 Smart Insights</h3>
          <div className="insights-list">
            {insights.map((insight, idx) => (
              <div key={idx} className={`insight-item ${insight.severity}`}>
                <div className="insight-icon">{insight.icon}</div>
                <div className="insight-content">
                  <div className="insight-message">{insight.message}</div>
                  <div className="insight-detail">{insight.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Future Impact Simulator */}
      <div className="analytics-section">
        <h3 className="section-title">🔮 Future Impact Simulator</h3>
        <div className="what-if-container">
          <InteractiveSlider
            value={whatIfAdjustment}
            onChange={setWhatIfAdjustment}
            min={-2000}
            max={5000}
            step={100}
            label="Adjust Monthly Savings"
          />

          <div className="what-if-results">
            <div className="what-if-stat">
              <div className="what-if-label">New Monthly Income</div>
              <div className="what-if-value">{formatCurrency(futureImpact.newMonthlyIncome)}</div>
              <div className={`what-if-change ${whatIfAdjustment >= 0 ? 'positive' : 'negative'}`}>
                {whatIfAdjustment >= 0 ? '+' : ''}{formatCurrency(whatIfAdjustment)}/month
              </div>
            </div>

            {futureImpact.impacts.map((impact, idx) => (
              <div key={idx} className="what-if-stat">
                <div className="what-if-label">{impact.goalTitle}</div>
                {impact.type === 'balance' && (
                  <>
                    <div className="what-if-value">
                      {impact.newMonths} months
                    </div>
                    <div className={`what-if-change ${impact.improvement ? 'positive' : 'negative'}`}>
                      {impact.improvement ? '↓' : '↑'} {Math.abs(impact.monthsSaved)} months
                    </div>
                  </>
                )}
                {impact.type === 'monthly_savings' && (
                  <>
                    <div className="what-if-value">
                      {impact.newPercentage.toFixed(1)}%
                    </div>
                    <div className={`what-if-change ${impact.improvement ? 'positive' : 'negative'}`}>
                      {impact.improvement ? '+' : ''}{(impact.newPercentage - impact.currentPercentage).toFixed(1)}%
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cashflow Timeline */}
      <div className="analytics-section">
        <h3 className="section-title">💸 Cashflow Timeline (Next 30 Days)</h3>
        <CashflowTimeline timeline={cashflowTimeline} />
      </div>

      {/* Spending Heatmap */}
      <div className="analytics-section">
        <h3 className="section-title">🗓️ Spending Heatmap (Last 12 Weeks)</h3>
        <SpendingHeatmap heatmapData={heatmapData} />
      </div>

      {/* Key Metrics - UPDATED */}
<div className="metrics-grid">
  <div className="metric-card primary">
    <div className="metric-icon-bg">
      <div className="metric-icon">📈</div>
    </div>
    <div className="metric-content">
      <div className="metric-label">Avg Monthly Income</div>
      <div className="metric-value">{formatCurrency(avgMonthlyIncome)}</div>
      <div className="metric-sub">After expenses</div>
    </div>
    <div className="metric-sparkle"></div>
  </div>

  <div className="metric-card secondary">
    <div className="metric-icon-bg">
      <div className="metric-icon">⚡</div>
    </div>
    <div className="metric-content">
      <div className="metric-label">Spending Velocity</div>
      <div className="metric-value">{formatCurrency(spendingVelocity)}<span className="metric-unit">/day</span></div>
      <div className="metric-sub">Daily average</div>
    </div>
    <div className="metric-sparkle"></div>
  </div>

  <div className="metric-card danger">
    <div className="metric-icon-bg">
      <div className="metric-icon">🔥</div>
    </div>
    <div className="metric-content">
      <div className="metric-label">Burn Rate</div>
      <div className="metric-value">{formatCurrency(burnRate)}<span className="metric-unit">/mo</span></div>
      <div className="metric-sub">Monthly expenses</div>
    </div>
    <div className="metric-sparkle"></div>
  </div>

  <div className="metric-card success">
    <div className="metric-icon-bg">
      <div className="metric-icon">💰</div>
    </div>
    <div className="metric-content">
      <div className="metric-label">Net Monthly Income</div>
      <div className="metric-value">{formatCurrency(monthlyRecurring)}<span className="metric-unit">/mo</span></div>
      <div className="metric-sub">Recurring only</div>
    </div>
    <div className="metric-sparkle"></div>
  </div>
</div>

      {/* Charts Grid */}
      <div className="charts-grid">
        <div className="chart-card wide">
          <h3 className="chart-title">Income vs Expenses Trend</h3>
          <div className="chart-container">
            <Line data={trendsChartData} options={chartOptions} />
          </div>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Spending Breakdown</h3>
          <div className="chart-container">
            <Pie data={categoryChartData} options={pieOptions} />
          </div>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Spending by Day of Week</h3>
          <div className="chart-container">
            <SpendingByDayChart dayData={dayOfWeekData} />
          </div>
        </div>

        <div className="chart-card ultra-wide">
          <h3 className="chart-title">Balance Projection with What-If Scenario</h3>
          <div className="chart-subtitle">
            Drag the slider above to see how changes affect your future balance
          </div>
          <div className="chart-container">
            <Line data={projectionsChartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}
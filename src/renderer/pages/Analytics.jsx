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
import { useMemo } from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  calculateAverageMonthlyIncome,
  calculateBurnRate,
  calculateSpendingVelocity,
  formatCurrency,
  getMonthlyTrends,
  getSpendingByCategory,
  predictGoalDate,
  projectFutureBalance
} from '../utils/calculations';

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
  const trends = useMemo(() => getMonthlyTrends(transactions), [transactions]);
  const categoryData = useMemo(() => getSpendingByCategory(transactions), [transactions]);
  const projections = useMemo(() => projectFutureBalance(totals.balance, transactions, 24), [totals.balance, transactions]);
  const avgMonthlyIncome = useMemo(() => calculateAverageMonthlyIncome(transactions, 6), [transactions]);
  const spendingVelocity = useMemo(() => calculateSpendingVelocity(transactions), [transactions]);
  const burnRate = useMemo(() => calculateBurnRate(transactions), [transactions]);
  const goalDate = useMemo(() => predictGoalDate(totals.balance, transactions, 1000000), [totals.balance, transactions]);

  // Calculate if on track
  const monthsToGoal = goalDate ? goalDate.months : null;
  const onTrack = monthsToGoal && monthsToGoal <= 24;

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
          '#6366f1',
          '#8b5cf6',
          '#ec4899',
          '#f43f5e',
          '#f59e0b',
          '#10b981',
          '#06b6d4',
          '#3b82f6',
          '#14b8a6',
          '#84cc16',
        ],
        borderWidth: 0,
      },
    ],
  };

  // Future Projections Chart (2 years)
  const projectionsChartData = {
    labels: projections.map(p => `Month ${p.month}`),
    datasets: [
      {
        label: 'Projected Balance',
        data: projections.map(p => p.balance),
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
      },
      {
        label: 'Goal (N$1M)',
        data: projections.map(() => 1000000),
        borderColor: '#10b981',
        borderDash: [5, 5],
        borderWidth: 2,
        fill: false,
        pointRadius: 0,
      },
    ],
  };

  // Spending by Category Bar Chart
  const categoryBarData = {
    labels: categoryData.slice(0, 5).map(c => c.category),
    datasets: [
      {
        label: 'Spending',
        data: categoryData.slice(0, 5).map(c => c.amount),
        backgroundColor: '#6366f1',
        borderRadius: 8,
      },
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
          font: { size: 12, family: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
          padding: 16,
          usePointStyle: true,
          pointStyle: 'circle',
        }
      },
      tooltip: {
        backgroundColor: '#1a1a24',
        titleColor: '#f8fafc',
        bodyColor: '#94a3b8',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
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
          callback: function(value) {
            return 'N$' + (value / 1000) + 'k';
          }
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
          pointStyle: 'circle',
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
      <h2 className="page-title">Analytics & Insights</h2>

      {/* Insights Cards */}
      <div className="insights-grid">
        <div className="insight-card">
          <div className="insight-icon">📈</div>
          <div className="insight-content">
            <div className="insight-label">Avg Monthly Income</div>
            <div className="insight-value positive">{formatCurrency(avgMonthlyIncome)}</div>
            <div className="insight-sub">After expenses</div>
          </div>
        </div>

        <div className="insight-card">
          <div className="insight-icon">⚡</div>
          <div className="insight-content">
            <div className="insight-label">Spending Velocity</div>
            <div className="insight-value">{formatCurrency(spendingVelocity)}/day</div>
            <div className="insight-sub">Daily average</div>
          </div>
        </div>

        <div className="insight-card">
          <div className="insight-icon">🔥</div>
          <div className="insight-content">
            <div className="insight-label">Burn Rate</div>
            <div className="insight-value negative">{formatCurrency(burnRate)}/month</div>
            <div className="insight-sub">Monthly expenses</div>
          </div>
        </div>

        <div className="insight-card">
          <div className="insight-icon">🎯</div>
          <div className="insight-content">
            <div className="insight-label">Goal ETA</div>
            <div className={`insight-value ${onTrack ? 'positive' : 'warning'}`}>
              {monthsToGoal ? `${monthsToGoal} months` : 'N/A'}
            </div>
            <div className="insight-sub">
              {onTrack ? '✓ On track' : '⚠️ Behind schedule'}
            </div>
          </div>
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
          <h3 className="chart-title">Top 5 Categories</h3>
          <div className="chart-container">
            <Bar data={categoryBarData} options={chartOptions} />
          </div>
        </div>

        <div className="chart-card ultra-wide">
          <h3 className="chart-title">Balance Projection (Next 24 Months)</h3>
          <div className="chart-subtitle">
            Based on your average monthly income of {formatCurrency(avgMonthlyIncome)}
          </div>
          <div className="chart-container">
            <Line data={projectionsChartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}
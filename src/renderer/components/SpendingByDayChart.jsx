import { Bar } from 'react-chartjs-2';
import { formatCurrency } from '../utils/calculations';

export default function SpendingByDayChart({ dayData }) {
  const chartData = {
    labels: dayData.map(d => d.day.slice(0, 3)),
    datasets: [
      {
        label: 'Spending',
        data: dayData.map(d => d.amount),
        backgroundColor: dayData.map((d, idx) => {
          // Highlight weekends
          if (idx === 0 || idx === 6) return '#f59e0b';
          return '#6366f1';
        }),
        borderRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1a1a24',
        titleColor: '#f8fafc',
        bodyColor: '#94a3b8',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (context) => formatCurrency(context.parsed.y),
        }
      }
    },
    scales: {
      y: {
        ticks: { 
          color: '#64748b',
          callback: (value) => 'N$' + (value / 1000) + 'k',
        },
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        border: { display: false }
      },
      x: {
        ticks: { color: '#64748b' },
        grid: { display: false },
        border: { display: false }
      }
    }
  };

  return <Bar data={chartData} options={options} />;
}
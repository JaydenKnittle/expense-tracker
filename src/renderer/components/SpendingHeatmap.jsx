import { formatCurrency } from '../utils/calculations';

export default function SpendingHeatmap({ heatmapData }) {
  // Get last 12 weeks (84 days)
  const today = new Date();
  const weeks = [];
  
  for (let weekIndex = 11; weekIndex >= 0; weekIndex--) {
    const week = [];
    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      const date = new Date(today);
      date.setDate(date.getDate() - (weekIndex * 7 + (6 - dayIndex)));
      const dateStr = date.toISOString().split('T')[0];
      const amount = heatmapData[dateStr] || 0;
      
      week.push({
        date: dateStr,
        dateObj: date,
        amount,
      });
    }
    weeks.push(week);
  }

  const maxAmount = Math.max(...Object.values(heatmapData), 1);

  const getIntensity = (amount) => {
    if (amount === 0) return 'empty';
    const ratio = amount / maxAmount;
    if (ratio < 0.25) return 'low';
    if (ratio < 0.5) return 'medium';
    if (ratio < 0.75) return 'high';
    return 'very-high';
  };

  return (
    <div className="heatmap-container">
      <div className="heatmap-grid">
        {weeks.map((week, weekIdx) => (
          <div key={weekIdx} className="heatmap-week">
            {week.map((day, dayIdx) => (
              <div
                key={dayIdx}
                className={`heatmap-day ${getIntensity(day.amount)}`}
                title={`${day.dateObj.toLocaleDateString('en-NA', { month: 'short', day: 'numeric' })}: ${formatCurrency(day.amount)}`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="heatmap-legend">
        <span>Less</span>
        <div className="heatmap-day empty" />
        <div className="heatmap-day low" />
        <div className="heatmap-day medium" />
        <div className="heatmap-day high" />
        <div className="heatmap-day very-high" />
        <span>More</span>
      </div>
    </div>
  );
}
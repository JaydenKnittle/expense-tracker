export default function StatCard({ title, value, icon, type, change }) {
  return (
    <div className={`stat-card ${type}`}>
      <div className="stat-card-header">
        <div className="stat-card-title">{title}</div>
        <div className="stat-card-icon">{icon}</div>
      </div>
      <div className="stat-card-value">
        {value >= 0 ? 'N$' : '-N$'}{Math.abs(value).toLocaleString('en-NA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
      {change && (
        <div className={`stat-card-change ${change > 0 ? 'positive' : 'negative'}`}>
          {change > 0 ? '↑' : '↓'} {Math.abs(change)}% from last month
        </div>
      )}
    </div>
  );
}
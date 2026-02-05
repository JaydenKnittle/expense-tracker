
export default function HealthScore({ healthData }) {
  const { score, maxScore, grade, factors } = healthData;
  const percentage = (score / maxScore) * 100;

  const getGradeColor = () => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#6366f1';
    if (score >= 40) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="health-score-container">
      <div className="health-score-main">
        <div className="health-score-circle">
          <svg width="160" height="160" viewBox="0 0 160 160">
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke="rgba(255, 255, 255, 0.05)"
              strokeWidth="12"
            />
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke={getGradeColor()}
              strokeWidth="12"
              strokeDasharray={`${(percentage / 100) * 440} 440`}
              strokeLinecap="round"
              transform="rotate(-90 80 80)"
              style={{ transition: 'stroke-dasharray 1s ease' }}
            />
          </svg>
          <div className="health-score-value">
            <div className="health-score-number">{score}</div>
            <div className="health-score-max">/ {maxScore}</div>
          </div>
        </div>
        <div className="health-score-grade" style={{ color: getGradeColor() }}>
          {grade}
        </div>
      </div>

      <div className="health-score-factors">
        {factors.map((factor, idx) => (
          <div key={idx} className="health-factor">
            <div className="health-factor-header">
              <span className="health-factor-name">{factor.name}</span>
              <span className="health-factor-score">
                {Math.round(factor.score)}/{factor.max}
              </span>
            </div>
            <div className="health-factor-bar-bg">
              <div
                className="health-factor-bar-fill"
                style={{ width: `${(factor.score / factor.max) * 100}%` }}
              />
            </div>
            <div className="health-factor-message">{factor.message}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
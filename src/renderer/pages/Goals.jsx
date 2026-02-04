import { formatCurrency, projectFutureBalance } from '../utils/calculations';

export default function Goals({ totals, transactions }) {
  const goal = 1000000; // N$1M
  const progress = (totals.balance / goal) * 100;
  const projections = projectFutureBalance(totals.balance, transactions, 24);
  
  // Find when goal will be reached
  const goalMonth = projections.find(p => p.balance >= goal);
  
  return (
    <div className="page-goals">
      <h2 className="page-title">Financial Goals</h2>

      <div className="goal-card main-goal">
        <div className="goal-header">
          <div>
            <div className="goal-title">🎯 Independence Goal</div>
            <div className="goal-amount">{formatCurrency(totals.balance)} / {formatCurrency(goal)}</div>
          </div>
          <div className="goal-percentage">{progress.toFixed(1)}%</div>
        </div>
        
        <div className="goal-progress">
          <div className="goal-progress-bar" style={{ width: `${Math.min(progress, 100)}%` }} />
        </div>

        <div className="goal-details">
          <div className="goal-detail">
            <span className="detail-label">Remaining</span>
            <span className="detail-value">{formatCurrency(goal - totals.balance)}</span>
          </div>
          {goalMonth && (
            <div className="goal-detail">
              <span className="detail-label">Est. Completion</span>
              <span className="detail-value">{goalMonth.month} months</span>
            </div>
          )}
        </div>
      </div>

      <div className="milestones">
        <h3 className="section-title">Milestones</h3>
        <div className="milestone-list">
          {[100000, 250000, 500000, 750000, 1000000].map((milestone) => {
            const reached = totals.balance >= milestone;
            const milestoneProgress = (totals.balance / milestone) * 100;
            
            return (
              <div key={milestone} className={`milestone ${reached ? 'completed' : ''}`}>
                <div className="milestone-icon">{reached ? '✓' : '○'}</div>
                <div className="milestone-info">
                  <div className="milestone-amount">{formatCurrency(milestone)}</div>
                  {!reached && (
                    <div className="milestone-progress-mini">
                      <div style={{ width: `${Math.min(milestoneProgress, 100)}%` }} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
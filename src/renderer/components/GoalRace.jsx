import { formatCurrency } from '../utils/calculations';
import { getGoalTypeInfo } from '../utils/goalCalculations';

export default function GoalRace({ raceData }) {
  return (
    <div className="goal-race-container">
      {raceData.map((goal, idx) => {
        const typeInfo = getGoalTypeInfo(goal.type);
        
        return (
          <div key={goal.id} className="goal-race-track">
            <div className="goal-race-info">
              <div className="goal-race-position">#{idx + 1}</div>
              <div className="goal-race-icon">{typeInfo.icon}</div>
              <div className="goal-race-details">
                <div className="goal-race-title">{goal.title}</div>
                <div className="goal-race-stats">
                  {formatCurrency(goal.current)} / {formatCurrency(goal.target)}
                </div>
              </div>
            </div>
            <div className="goal-race-progress">
              <div className="goal-race-track-bg">
                <div
                  className={`goal-race-track-fill ${goal.onTrack ? 'on-track' : 'behind'}`}
                  style={{ width: `${goal.progress}%` }}
                >
                  <div className="goal-race-runner">🏃</div>
                </div>
              </div>
              <div className="goal-race-percentage">{goal.progress.toFixed(0)}%</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
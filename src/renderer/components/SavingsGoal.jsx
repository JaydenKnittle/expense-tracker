import { useState } from 'react';

export default function SavingsGoal({ currentBalance }) {
  const [goal, setGoal] = useState(1000000); // N$1,000,000 goal
  const progress = Math.min((currentBalance / goal) * 100, 100);
  
  // Calculate days remaining (24 months from now)
  const targetDate = new Date();
  targetDate.setMonth(targetDate.getMonth() + 24);
  const today = new Date();
  const daysRemaining = Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24));

  return (
    <div className="savings-goal">
      <div className="savings-goal-header">
        <div>
          <div className="savings-goal-title">🎯 Savings Goal</div>
          <div className="savings-goal-amount">
            N${currentBalance.toLocaleString('en-NA', { minimumFractionDigits: 2 })} / N${goal.toLocaleString('en-NA')}
          </div>
        </div>
      </div>
      
      <div className="savings-progress">
        <div 
          className="savings-progress-bar" 
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <div className="savings-goal-details">
        <span>{progress.toFixed(1)}% Complete</span>
        <span>{daysRemaining} days remaining</span>
      </div>
    </div>
  );
}
import {
    calculateAverageMonthlyIncome,
    calculateMonthlyIncome
} from './calculations';

// Calculate current progress for a goal
export const calculateGoalProgress = (goal, transactions, currentBalance) => {
  const now = new Date();
  
  switch (goal.type) {
    case 'balance': {
      // Current balance vs target
      return {
        current: currentBalance,
        target: goal.target_amount,
        percentage: (currentBalance / goal.target_amount) * 100,
        remaining: goal.target_amount - currentBalance,
        onTrack: true, // Always "on track" for balance goals
      };
    }
    
    case 'monthly_savings': {
      // This month's net income vs target
      const thisMonth = calculateMonthlyIncome(transactions, now.getMonth(), now.getFullYear());
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const daysRemaining = daysInMonth - now.getDate();
      const expectedByNow = (goal.target_amount / daysInMonth) * now.getDate();
      
      return {
        current: thisMonth,
        target: goal.target_amount,
        percentage: (thisMonth / goal.target_amount) * 100,
        remaining: goal.target_amount - thisMonth,
        daysRemaining,
        onTrack: thisMonth >= expectedByNow,
      };
    }
    
    case 'yearly_savings': {
      // Year-to-date savings vs target
      let ytdSavings = 0;
      const currentYear = now.getFullYear();
      
      for (let month = 0; month <= now.getMonth(); month++) {
        ytdSavings += calculateMonthlyIncome(transactions, month, currentYear);
      }
      
      const monthsElapsed = now.getMonth() + 1;
      const expectedByNow = (goal.target_amount / 12) * monthsElapsed;
      
      return {
        current: ytdSavings,
        target: goal.target_amount,
        percentage: (ytdSavings / goal.target_amount) * 100,
        remaining: goal.target_amount - ytdSavings,
        monthsRemaining: 12 - monthsElapsed,
        onTrack: ytdSavings >= expectedByNow,
      };
    }
    
    case 'monthly_income': {
      // Average monthly income vs target
      const avgIncome = calculateAverageMonthlyIncome(transactions, 3);
      
      return {
        current: avgIncome,
        target: goal.target_amount,
        percentage: (avgIncome / goal.target_amount) * 100,
        remaining: goal.target_amount - avgIncome,
        onTrack: avgIncome >= goal.target_amount,
      };
    }
    
    default:
      return {
        current: 0,
        target: goal.target_amount,
        percentage: 0,
        remaining: goal.target_amount,
        onTrack: false,
      };
  }
};

// Get goal type display info
export const getGoalTypeInfo = (type) => {
  const types = {
    balance: {
      icon: '💰',
      label: 'Balance Goal',
      description: 'Reach a specific total balance',
    },
    monthly_savings: {
      icon: '📅',
      label: 'Monthly Savings',
      description: 'Save a specific amount this month',
    },
    yearly_savings: {
      icon: '🎉',
      label: 'Yearly Savings',
      description: 'Save a specific amount this year',
    },
    monthly_income: {
      icon: '📊',
      label: 'Monthly Income',
      description: 'Earn a specific amount per month',
    },
  };
  
  return types[type] || types.balance;
};

// Format deadline text
export const formatDeadline = (deadlineString) => {
  if (!deadlineString) return null;
  
  const deadline = new Date(deadlineString);
  const now = new Date();
  const diffTime = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return { text: 'Overdue', overdue: true };
  } else if (diffDays === 0) {
    return { text: 'Due today', overdue: false };
  } else if (diffDays === 1) {
    return { text: 'Due tomorrow', overdue: false };
  } else if (diffDays <= 7) {
    return { text: `${diffDays} days remaining`, overdue: false };
  } else if (diffDays <= 30) {
    const weeks = Math.floor(diffDays / 7);
    return { text: `${weeks} week${weeks > 1 ? 's' : ''} remaining`, overdue: false };
  } else {
    const months = Math.floor(diffDays / 30);
    return { text: `${months} month${months > 1 ? 's' : ''} remaining`, overdue: false };
  }
};
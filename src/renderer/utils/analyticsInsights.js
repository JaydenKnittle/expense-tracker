import {
    calculateMonthlyIncome,
    formatCurrency,
    getSpendingByCategory,
    getTotalMonthlyRecurring
} from './calculations';
import { calculateGoalProgress } from './goalCalculations';

// Generate smart insights based on data
export const generateInsights = (transactions, totals, goals) => {
  const insights = [];

  // Goal tracking insights
  const activeGoals = goals.filter(g => !g.completed && !g.archived);
  if (activeGoals.length > 0) {
    const onTrackCount = activeGoals.filter(g => {
      const progress = calculateGoalProgress(g, transactions, totals.balance);
      return progress.onTrack;
    }).length;

    insights.push({
      type: 'goal',
      icon: '🎯',
      severity: onTrackCount === activeGoals.length ? 'success' : 'warning',
      message: `You're on track for ${onTrackCount}/${activeGoals.length} goal${activeGoals.length > 1 ? 's' : ''}`,
      detail: onTrackCount < activeGoals.length ? 'Consider adjusting spending to meet all targets' : 'Great progress!',
    });
  }

  // Spending comparison (current month vs last month)
  const now = new Date();
  const thisMonth = now.getMonth();
  const lastMonth = (thisMonth - 1 + 12) % 12;
  const thisYear = now.getFullYear();
  const lastYear = thisMonth === 0 ? thisYear - 1 : thisYear;

  const thisMonthExpenses = transactions
    .filter(t => {
      const date = new Date(t.date);
      return t.type === 'expense' && 
             date.getMonth() === thisMonth && 
             date.getFullYear() === thisYear;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const lastMonthExpenses = transactions
    .filter(t => {
      const date = new Date(t.date);
      return t.type === 'expense' && 
             date.getMonth() === lastMonth && 
             date.getFullYear() === lastYear;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  if (lastMonthExpenses > 0) {
    const percentChange = ((thisMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100;
    
    if (Math.abs(percentChange) > 10) {
      insights.push({
        type: 'spending',
        icon: percentChange > 0 ? '⚠️' : '✅',
        severity: percentChange > 0 ? 'warning' : 'success',
        message: `Spending ${percentChange > 0 ? 'up' : 'down'} ${Math.abs(percentChange).toFixed(0)}% vs last month`,
        detail: `${formatCurrency(Math.abs(thisMonthExpenses - lastMonthExpenses))} ${percentChange > 0 ? 'more' : 'less'} than usual`,
      });
    }
  }

  // Category spending insights
  const categoryTotals = getSpendingByCategory(transactions);
  if (categoryTotals.length > 0) {
    const topCategory = categoryTotals[0];
    const totalSpending = categoryTotals.reduce((sum, c) => sum + c.amount, 0);
    const percentage = (topCategory.amount / totalSpending) * 100;

    if (percentage > 40) {
      insights.push({
        type: 'category',
        icon: '📊',
        severity: 'info',
        message: `${topCategory.category} is ${percentage.toFixed(0)}% of your spending`,
        detail: `${formatCurrency(topCategory.amount)} spent on ${topCategory.category}`,
      });
    }
  }

  // Weekend spending pattern
  const weekendSpending = transactions
    .filter(t => {
      const date = new Date(t.date);
      const day = date.getDay();
      return t.type === 'expense' && (day === 0 || day === 6);
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const weekdaySpending = transactions
    .filter(t => {
      const date = new Date(t.date);
      const day = date.getDay();
      return t.type === 'expense' && day > 0 && day < 6;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  if (weekendSpending > 0 && weekdaySpending > 0) {
    const weekendAvg = weekendSpending / (transactions.length > 0 ? 1 : 1);
    const weekdayAvg = weekdaySpending / (transactions.length > 0 ? 1 : 1);
    
    if (weekendAvg > weekdayAvg * 1.3) {
      insights.push({
        type: 'pattern',
        icon: '📅',
        severity: 'info',
        message: 'You spend more on weekends',
        detail: `Weekend spending is ${((weekendAvg / weekdayAvg - 1) * 100).toFixed(0)}% higher`,
      });
    }
  }

  // Balance goal timeline
  const balanceGoal = goals.find(g => g.type === 'balance' && !g.completed);
  if (balanceGoal) {
    const monthlyIncome = getTotalMonthlyRecurring(transactions);
    if (monthlyIncome > 0) {
      const remaining = balanceGoal.target_amount - totals.balance;
      const monthsToGoal = Math.ceil(remaining / monthlyIncome);
      const years = (monthsToGoal / 12).toFixed(1);

      insights.push({
        type: 'projection',
        icon: '🚀',
        severity: monthsToGoal <= 24 ? 'success' : 'info',
        message: `At current rate, reach ${formatCurrency(balanceGoal.target_amount)} in ${years} years`,
        detail: `Saving ${formatCurrency(monthlyIncome)}/month`,
      });
    }
  }

  // No recurring income warning
  const hasRecurringIncome = transactions.some(t => t.type === 'income' && t.isRecurring);
  if (!hasRecurringIncome && transactions.length > 0) {
    insights.push({
      type: 'warning',
      icon: '💡',
      severity: 'warning',
      message: 'No recurring income set',
      detail: 'Add recurring income for accurate projections',
    });
  }

  return insights;
};

// Calculate future impact of changes
export const calculateFutureImpact = (transactions, totals, goals, adjustment) => {
  const currentMonthlyIncome = getTotalMonthlyRecurring(transactions);
  const newMonthlyIncome = currentMonthlyIncome + adjustment;

  const impacts = [];

  // Impact on balance goal
  const balanceGoal = goals.find(g => g.type === 'balance' && !g.completed);
  if (balanceGoal) {
    const currentRemaining = balanceGoal.target_amount - totals.balance;
    const currentMonths = currentMonthlyIncome > 0 ? Math.ceil(currentRemaining / currentMonthlyIncome) : 99999;
    const newMonths = newMonthlyIncome > 0 ? Math.ceil(currentRemaining / newMonthlyIncome) : 99999;
    const monthsSaved = currentMonths - newMonths;

    impacts.push({
      goalTitle: balanceGoal.title,
      type: 'balance',
      currentMonths,
      newMonths,
      monthsSaved,
      improvement: monthsSaved > 0,
    });
  }

  // Impact on monthly savings goals
  const monthlySavingsGoals = goals.filter(g => g.type === 'monthly_savings' && !g.completed);
  monthlySavingsGoals.forEach(goal => {
    const currentProgress = calculateGoalProgress(goal, transactions, totals.balance);
    const newCurrent = currentProgress.current + adjustment;
    const newPercentage = (newCurrent / goal.target_amount) * 100;

    impacts.push({
      goalTitle: goal.title,
      type: 'monthly_savings',
      currentPercentage: currentProgress.percentage,
      newPercentage,
      improvement: newPercentage > currentProgress.percentage,
    });
  });

  return {
    adjustment,
    newMonthlyIncome,
    impacts,
  };
};

// Calculate financial health score (0-100)
export const calculateHealthScore = (transactions, totals, goals) => {
  let score = 0;
  const factors = [];

  // Factor 1: Savings Rate (30 points)
  const monthlyIncome = getTotalMonthlyRecurring(transactions);
  if (monthlyIncome > 0) {
    const savingsRate = (monthlyIncome / (totals.income || 1)) * 100;
    const savingsScore = Math.min(30, (savingsRate / 20) * 30); // 20% savings = max points
    score += savingsScore;
    factors.push({
      name: 'Savings Rate',
      score: savingsScore,
      max: 30,
      message: `${savingsRate.toFixed(1)}% savings rate`,
    });
  }

  // Factor 2: Goal Progress (25 points)
  const activeGoals = goals.filter(g => !g.completed && !g.archived);
  if (activeGoals.length > 0) {
    const onTrackCount = activeGoals.filter(g => {
      const progress = calculateGoalProgress(g, transactions, totals.balance);
      return progress.onTrack;
    }).length;
    const goalScore = (onTrackCount / activeGoals.length) * 25;
    score += goalScore;
    factors.push({
      name: 'Goal Progress',
      score: goalScore,
      max: 25,
      message: `${onTrackCount}/${activeGoals.length} goals on track`,
    });
  } else {
    factors.push({
      name: 'Goal Progress',
      score: 0,
      max: 25,
      message: 'No active goals',
    });
  }

  // Factor 3: Positive Balance (20 points)
  const balanceScore = totals.balance > 0 ? 20 : 0;
  score += balanceScore;
  factors.push({
    name: 'Positive Balance',
    score: balanceScore,
    max: 20,
    message: totals.balance > 0 ? 'Balance is positive' : 'Balance is negative',
  });

  // Factor 4: Consistent Income (15 points)
  const hasRecurring = transactions.some(t => t.type === 'income' && t.isRecurring);
  const consistencyScore = hasRecurring ? 15 : 0;
  score += consistencyScore;
  factors.push({
    name: 'Income Consistency',
    score: consistencyScore,
    max: 15,
    message: hasRecurring ? 'Recurring income set' : 'No recurring income',
  });

  // Factor 5: Spending Control (10 points)
  const now = new Date();
  const thisMonth = calculateMonthlyIncome(transactions, now.getMonth(), now.getFullYear());
  const controlScore = thisMonth >= 0 ? 10 : 0;
  score += controlScore;
  factors.push({
    name: 'Spending Control',
    score: controlScore,
    max: 10,
    message: thisMonth >= 0 ? 'Net positive this month' : 'Spending exceeds income',
  });

  return {
    score: Math.round(score),
    maxScore: 100,
    grade: score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Needs Improvement',
    factors,
  };
};

// Get spending heatmap data (for calendar visualization)
export const getSpendingHeatmap = (transactions) => {
  const heatmapData = {};
  
  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      const date = new Date(t.date).toISOString().split('T')[0];
      heatmapData[date] = (heatmapData[date] || 0) + t.amount;
    });

  return heatmapData;
};

// Get spending by day of week
export const getSpendingByDayOfWeek = (transactions) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const spending = [0, 0, 0, 0, 0, 0, 0];

  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      const dayIndex = new Date(t.date).getDay();
      spending[dayIndex] += t.amount;
    });

  return days.map((day, idx) => ({ day, amount: spending[idx] }));
};

// Calculate cashflow timeline (next 30 days)
export const calculateCashflowTimeline = (transactions, currentBalance) => {
  const timeline = [];
  const today = new Date();
  
  // Get all recurring transactions
  const recurring = transactions.filter(t => t.isRecurring);
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    
    let dayIncome = 0;
    let dayExpenses = 0;
    
    // Check if any recurring transactions happen on this day
    recurring.forEach(t => {
      const txDate = new Date(t.date);
      if (txDate.getDate() === date.getDate()) {
        if (t.type === 'income') {
          dayIncome += t.amount;
        } else {
          dayExpenses += t.amount;
        }
      }
    });
    
    const netChange = dayIncome - dayExpenses;
    const newBalance = i === 0 ? currentBalance : timeline[i - 1].balance + netChange;
    
    timeline.push({
      date: date.toISOString().split('T')[0],
      dateObj: date,
      income: dayIncome,
      expenses: dayExpenses,
      netChange,
      balance: newBalance,
      warning: newBalance < 1000, // Warning if balance drops below N$1000
    });
  }
  
  return timeline;
};

// Get goal race data (visualize goals as race)
export const getGoalRaceData = (goals, transactions, currentBalance) => {
  return goals
    .filter(g => !g.completed && !g.archived)
    .map(goal => {
      const progress = calculateGoalProgress(goal, transactions, currentBalance);
      return {
        id: goal.id,
        title: goal.title,
        type: goal.type,
        progress: Math.min(progress.percentage, 100),
        current: progress.current,
        target: progress.target,
        onTrack: progress.onTrack,
      };
    })
    .sort((a, b) => b.progress - a.progress);
};
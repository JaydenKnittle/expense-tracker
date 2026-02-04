// Calculate monthly income (income - expenses) - ALL transactions
export const calculateMonthlyIncome = (transactions, month, year) => {
  const monthTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    return date.getMonth() === month && date.getFullYear() === year;
  });

  const income = monthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = monthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return income - expenses;
};

// Calculate RECURRING monthly income (for projections)
// Only counts recurring transactions that have already occurred this month
export const calculateRecurringMonthlyIncome = (transactions) => {
  const now = new Date();
  const today = now.getDate();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Get all recurring transactions
  const recurring = transactions.filter(t => t.isRecurring);

  let recurringIncome = 0;
  let recurringExpenses = 0;

  recurring.forEach(t => {
    const txDate = new Date(t.date);
    const txDay = txDate.getDate();
    const txMonth = txDate.getMonth();
    const txYear = txDate.getFullYear();

    // If transaction is from current month
    if (txMonth === currentMonth && txYear === currentYear) {
      // Only count if it's already happened (date <= today)
      if (txDay <= today) {
        if (t.type === 'income') {
          recurringIncome += t.amount;
        } else {
          recurringExpenses += t.amount;
        }
      }
    } else if (txYear < currentYear || (txYear === currentYear && txMonth < currentMonth)) {
      // For past months, count everything
      if (t.type === 'income') {
        recurringIncome += t.amount;
      } else {
        recurringExpenses += t.amount;
      }
    }
  });

  return recurringIncome - recurringExpenses;
};

// Get TOTAL monthly recurring (for projections - what WILL happen each month)
export const getTotalMonthlyRecurring = (transactions) => {
  const recurringIncome = transactions
    .filter(t => t.type === 'income' && t.isRecurring)
    .reduce((sum, t) => sum + t.amount, 0);

  const recurringExpenses = transactions
    .filter(t => t.type === 'expense' && t.isRecurring)
    .reduce((sum, t) => sum + t.amount, 0);

  return recurringIncome - recurringExpenses;
};

// Get upcoming recurring expenses (not yet occurred this month)
export const getUpcomingRecurring = (transactions) => {
  const now = new Date();
  const today = now.getDate();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const upcoming = transactions.filter(t => {
    if (!t.isRecurring) return false;

    const txDate = new Date(t.date);
    const txDay = txDate.getDate();
    const txMonth = txDate.getMonth();
    const txYear = txDate.getFullYear();

    // Only show if it's in the current month and hasn't happened yet
    return txMonth === currentMonth && txYear === currentYear && txDay > today;
  });

  return upcoming.sort((a, b) => new Date(a.date).getDate() - new Date(b.date).getDate());
};

// Calculate average monthly income (FIXED - uses recurring if not enough history)
export const calculateAverageMonthlyIncome = (transactions, months = 6) => {
  if (transactions.length === 0) return 0;

  // Check if we have enough historical data
  const oldestTransaction = transactions.reduce((oldest, t) => {
    const tDate = new Date(t.date);
    return tDate < oldest ? tDate : oldest;
  }, new Date());

  const now = new Date();
  const monthsSinceOldest = Math.floor(
    (now.getTime() - oldestTransaction.getTime()) / (1000 * 60 * 60 * 24 * 30)
  );

  // If we don't have enough history, use recurring income
  if (monthsSinceOldest < 1) {
    return getTotalMonthlyRecurring(transactions);
  }

  // Otherwise, calculate average from actual history
  const monthsToCheck = Math.min(months, monthsSinceOldest + 1);
  const totals = [];

  for (let i = 0; i < monthsToCheck; i++) {
    const month = now.getMonth() - i;
    const year = now.getFullYear() + Math.floor(month / 12);
    const adjustedMonth = ((month % 12) + 12) % 12;
    totals.push(calculateMonthlyIncome(transactions, adjustedMonth, year));
  }

  const avg = totals.reduce((sum, val) => sum + val, 0) / monthsToCheck;
  return avg;
};

// Calculate spending velocity (FIXED - handles single day)
export const calculateSpendingVelocity = (transactions) => {
  const expenses = transactions.filter(t => t.type === 'expense');
  if (expenses.length === 0) return 0;

  const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
  
  const dates = expenses.map(t => new Date(t.date).getTime());
  const oldest = Math.min(...dates);
  const newest = Math.max(...dates);
  const days = Math.max(1, Math.ceil((newest - oldest) / (1000 * 60 * 60 * 24)) + 1);

  return totalExpenses / days;
};

// Calculate burn rate (RECURRING expenses only)
export const calculateBurnRate = (transactions) => {
  const recurringExpenses = transactions
    .filter(t => t.type === 'expense' && t.isRecurring)
    .reduce((sum, t) => sum + t.amount, 0);

  return recurringExpenses;
};

// Predict when goal will be reached (using TOTAL recurring income)
export const predictGoalDate = (currentBalance, transactions, goalAmount) => {
  const totalRecurring = getTotalMonthlyRecurring(transactions);
  
  if (totalRecurring <= 0) {
    return null;
  }

  const remaining = goalAmount - currentBalance;
  const months = Math.ceil(remaining / totalRecurring);

  return {
    months,
    date: new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000)
  };
};

// Project future balance (using TOTAL recurring income)
export const projectFutureBalance = (currentBalance, transactions, monthsAhead = 24) => {
  const totalRecurring = getTotalMonthlyRecurring(transactions);
  const projections = [];

  for (let i = 1; i <= monthsAhead; i++) {
    projections.push({
      month: i,
      balance: currentBalance + (totalRecurring * i)
    });
  }

  return projections;
};

// Get spending by category
export const getSpendingByCategory = (transactions) => {
  const expenses = transactions.filter(t => t.type === 'expense');
  const categoryTotals = {};

  expenses.forEach(t => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
  });

  return Object.entries(categoryTotals)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
};

// Get monthly trends (last 12 months)
export const getMonthlyTrends = (transactions) => {
  const now = new Date();
  const trends = [];

  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = date.getMonth();
    const year = date.getFullYear();

    const monthTxns = transactions.filter(t => {
      const txDate = new Date(t.date);
      return txDate.getMonth() === month && txDate.getFullYear() === year;
    });

    const income = monthTxns
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = monthTxns
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    trends.push({
      month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      income,
      expenses,
      net: income - expenses
    });
  }

  return trends;
};

// Calculate net balance (current balance - upcoming recurring expenses)
export const calculateNetBalance = (currentBalance, transactions) => {
  const upcoming = getUpcomingRecurring(transactions);
  
  const upcomingIncome = upcoming
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const upcomingExpenses = upcoming
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  return currentBalance + upcomingIncome - upcomingExpenses;
};

// Format currency
export const formatCurrency = (amount) => {
  return `N$${Math.abs(amount).toLocaleString('en-NA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};
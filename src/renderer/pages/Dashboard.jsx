import { useCountUp } from '../utils/animations';
import {
  calculateMonthlyIncome,
  calculateNetBalance,
  formatCurrency,
  getUpcomingRecurring
} from '../utils/calculations';

export default function Dashboard({ totals, transactions, onDelete }) {
  const balance = useCountUp(totals.balance, 1500);
  const netBalance = calculateNetBalance(totals.balance, transactions);
  const netBalanceAnimated = useCountUp(netBalance, 1500);
  
  const now = new Date();
  const thisMonthIncome = calculateMonthlyIncome(
    transactions, 
    now.getMonth(), 
    now.getFullYear()
  );

  const isPositive = thisMonthIncome >= 0;
  const recentTransactions = transactions.slice(0, 8);
  const upcomingRecurring = getUpcomingRecurring(transactions);
  
  const pendingAmount = totals.balance - netBalance;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-NA', { month: 'short', day: 'numeric' });
    }
  };

  const getDaysUntil = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `in ${diffDays} days`;
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this transaction?')) {
      await onDelete(id);
    }
  };

  return (
    <div className="page-dashboard">
      {/* Balance Section */}
      <div className="balance-section">
        <div className="balance-container">
          {/* Current Balance */}
          <div className="balance-label">Current Balance</div>
          <div className="balance-amount">
            {formatCurrency(balance)}
          </div>
          
          {/* Net Balance (if different) */}
          {pendingAmount !== 0 && (
            <div className="net-balance-container">
              <div className="net-balance-label">
                Net Balance (End of Month)
              </div>
              <div className="net-balance-amount">
                {formatCurrency(netBalanceAnimated)}
              </div>
              <div className="net-balance-pending">
                ↓ {formatCurrency(Math.abs(pendingAmount))} in pending transactions
              </div>
            </div>
          )}
          
          <div className={`balance-change ${isPositive ? 'positive' : 'negative'}`}>
            {isPositive ? '↑' : '↓'} {formatCurrency(thisMonthIncome)} this month
          </div>
        </div>
      </div>

      {/* Recent & Upcoming */}
      <div className="dashboard-bottom">
        {/* Upcoming Recurring Expenses */}
        {upcomingRecurring.length > 0 && (
          <div className="upcoming-section">
            <div className="section-header">
              <h3>⏰ Upcoming This Month</h3>
              <span className="section-count">{upcomingRecurring.length} pending</span>
            </div>
            
            <div className="upcoming-list">
              {upcomingRecurring.map((transaction) => (
                <div key={transaction.id} className="upcoming-item">
                  <div className="upcoming-left">
                    <div className={`upcoming-icon ${transaction.type}`}>
                      {transaction.type === 'income' ? '💵' : '💸'}
                    </div>
                    <div className="upcoming-details">
                      <div className="upcoming-description">
                        {transaction.description || transaction.category}
                      </div>
                      <div className="upcoming-when">{getDaysUntil(transaction.date)}</div>
                    </div>
                  </div>
                  <div className="upcoming-right">
                    <div className={`upcoming-amount ${transaction.type}`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </div>
                    <button 
                      className="upcoming-delete"
                      onClick={() => handleDelete(transaction.id)}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Transactions */}
        {recentTransactions.length > 0 && (
          <div className="recent-section">
            <div className="section-header">
              <h3>Recent Activity</h3>
              <span className="section-count">{transactions.length} total</span>
            </div>
            
            <div className="recent-list">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="recent-item">
                  <div className="recent-left">
                    <div className={`recent-icon ${transaction.type}`}>
                      {transaction.type === 'income' ? '💵' : '💸'}
                    </div>
                    <div className="recent-details">
                      <div className="recent-description">
                        {transaction.description || transaction.category}
                      </div>
                      <div className="recent-date">{formatDate(transaction.date)}</div>
                    </div>
                  </div>
                  <div className="recent-right">
                    <div className={`recent-amount ${transaction.type}`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </div>
                    <button 
                      className="recent-delete"
                      onClick={() => handleDelete(transaction.id)}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
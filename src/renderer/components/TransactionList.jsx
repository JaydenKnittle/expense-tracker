export default function TransactionList({ transactions, onDelete }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NA', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (transactions.length === 0) {
    return (
      <div className="transaction-list">
        <div className="transaction-list-header">
          <h3 className="transaction-list-title">Recent Transactions</h3>
        </div>
        <div className="empty-state">
          <div className="empty-state-icon">📝</div>
          <div className="empty-state-title">No transactions yet</div>
          <div className="empty-state-description">
            Click "Add Transaction" to get started
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="transaction-list">
      <div className="transaction-list-header">
        <h3 className="transaction-list-title">Recent Transactions</h3>
        <span style={{ fontSize: '14px', color: '#94a3b8' }}>
          {transactions.length} total
        </span>
      </div>
      
      <div className="transaction-items">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="transaction-item">
            <div className="transaction-info">
              <div className={`transaction-icon ${transaction.type}`}>
                {transaction.type === 'income' ? '💵' : '💸'}
              </div>
              <div className="transaction-details">
                <div className="transaction-description">
                  {transaction.description || 'No description'}
                </div>
                <div className="transaction-category">{transaction.category}</div>
              </div>
            </div>
            
            <div className="transaction-right">
              <div>
                <div className={`transaction-amount ${transaction.type}`}>
                  {transaction.type === 'income' ? '+' : '-'}N${transaction.amount.toLocaleString('en-NA', { 
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2 
                  })}
                </div>
                <div className="transaction-date">{formatDate(transaction.date)}</div>
              </div>
              <button 
                className="transaction-delete"
                onClick={() => onDelete(transaction.id)}
                title="Delete transaction"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
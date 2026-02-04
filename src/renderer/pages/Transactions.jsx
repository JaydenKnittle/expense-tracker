import { useState } from 'react';
import { formatCurrency } from '../utils/calculations';

export default function Transactions({ transactions, onDelete }) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filteredTransactions = transactions
    .filter(t => filter === 'all' || t.type === filter)
    .filter(t => 
      t.description?.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase())
    );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-NA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="page-transactions">
      <div className="page-header">
        <h2 className="page-title">Transactions</h2>
        <div className="transactions-controls">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All</option>
            <option value="income">Income</option>
            <option value="expense">Expenses</option>
          </select>
        </div>
      </div>

      <div className="transactions-list">
        {filteredTransactions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📝</div>
            <div className="empty-state-title">No transactions found</div>
          </div>
        ) : (
          filteredTransactions.map((transaction) => (
            <div key={transaction.id} className="transaction-row">
              <div className="transaction-info">
                <div className={`transaction-icon ${transaction.type}`}>
                  {transaction.type === 'income' ? '💵' : '💸'}
                </div>
                <div className="transaction-details">
                  <div className="transaction-description">
                    {transaction.description || 'No description'}
                  </div>
                  <div className="transaction-meta">
                    <span className="transaction-category">{transaction.category}</span>
                    <span className="transaction-date">{formatDate(transaction.date)}</span>
                  </div>
                </div>
              </div>
              <div className="transaction-actions">
                <div className={`transaction-amount ${transaction.type}`}>
                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </div>
                <button 
                  className="transaction-delete"
                  onClick={() => onDelete(transaction.id)}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
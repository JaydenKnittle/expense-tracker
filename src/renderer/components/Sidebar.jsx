
export default function Sidebar({ currentPage, onPageChange, onAddTransaction }) {
  const pages = [
    { id: 'dashboard', icon: '💰', label: 'Dashboard' },
    { id: 'analytics', icon: '📊', label: 'Analytics' },
    { id: 'transactions', icon: '📝', label: 'Transactions' },
    { id: 'goals', icon: '🎯', label: 'Goals' },
  ];

  return (
    <aside className="sidebar">
      <div className="logo">
        <span className="logo-icon">💰</span>
        <h1>Expense Tracker</h1>
      </div>

      <nav className="nav">
        {pages.map((page) => (
          <button
            key={page.id}
            className={`nav-item ${currentPage === page.id ? 'active' : ''}`}
            onClick={() => onPageChange(page.id)}
          >
            <span className="nav-icon">{page.icon}</span>
            {page.label}
          </button>
        ))}
      </nav>

      <button className="add-transaction-btn" onClick={onAddTransaction}>
        <span>+</span> Add Transaction
      </button>
    </aside>
  );
}
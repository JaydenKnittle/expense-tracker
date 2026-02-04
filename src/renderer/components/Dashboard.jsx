import StatCard from './StatCard';

export default function Dashboard({ totals }) {
  return (
    <div className="dashboard">
      <h2 className="dashboard-title">Overview</h2>
      <div className="stats-grid">
        <StatCard
          title="Total Income"
          value={totals.income}
          icon="💵"
          type="income"
        />
        <StatCard
          title="Total Expenses"
          value={totals.expenses}
          icon="💸"
          type="expense"
        />
        <StatCard
          title="Balance"
          value={totals.balance}
          icon="💰"
          type="balance"
        />
      </div>
    </div>
  );
}
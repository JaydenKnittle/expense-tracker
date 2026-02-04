import { useEffect, useState } from 'react';
import AddTransactionModal from './components/AddTransactionModal';
import Dashboard from './components/Dashboard';
import SavingsGoal from './components/SavingsGoal';
import TitleBar from './components/TitleBar';
import TransactionList from './components/TransactionList';
import './styles/App.css';

export default function App() {
  const [transactions, setTransactions] = useState([]);
  const [totals, setTotals] = useState({ income: 0, expenses: 0, balance: 0 });
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [txns, tots] = await Promise.all([
        window.electronAPI.getTransactions(),
        window.electronAPI.getTotals(),
      ]);
      setTransactions(txns);
      setTotals(tots);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTransaction = async (data) => {
    try {
      await window.electronAPI.addTransaction(data);
      await loadData();
      setShowAddModal(false);
    } catch (error) {
      console.error('Failed to add transaction:', error);
      throw error;
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await window.electronAPI.deleteTransaction(id);
        await loadData();
      } catch (error) {
        console.error('Failed to delete transaction:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="app">
        <TitleBar />
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading your expenses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <TitleBar />
      
      <div className="content">
        <aside className="sidebar">
          <div className="logo">
            <span className="logo-icon">💰</span>
            <h1>Expense Tracker</h1>
          </div>

          <nav className="nav">
            <button className="nav-item active">
              <span className="nav-icon">📊</span>
              Dashboard
            </button>
            <button className="nav-item">
              <span className="nav-icon">📝</span>
              Transactions
            </button>
            <button className="nav-item">
              <span className="nav-icon">🎯</span>
              Goals
            </button>
            <button className="nav-item">
              <span className="nav-icon">⚙️</span>
              Settings
            </button>
          </nav>

          <button 
            className="add-transaction-btn"
            onClick={() => setShowAddModal(true)}
          >
            <span>+</span> Add Transaction
          </button>
        </aside>

        <main className="main">
          <Dashboard totals={totals} />
          <SavingsGoal currentBalance={totals.balance} />
          <TransactionList 
            transactions={transactions}
            onDelete={handleDeleteTransaction}
          />
        </main>
      </div>

      {showAddModal && (
        <AddTransactionModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddTransaction}
        />
      )}
    </div>
  );
}
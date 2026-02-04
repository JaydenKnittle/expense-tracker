import { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import TitleBar from './components/TitleBar';
import AddTransaction from './pages/AddTransaction';
import Analytics from './pages/Analytics';
import Dashboard from './pages/Dashboard';
import Goals from './pages/Goals';
import Transactions from './pages/Transactions';
import './styles/App.css';

export default function App() {
  const [transactions, setTransactions] = useState([]);
  const [totals, setTotals] = useState({ income: 0, expenses: 0, balance: 0 });
  const [currentPage, setCurrentPage] = useState('dashboard');
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

  const renderPage = () => {
  switch (currentPage) {
    case 'dashboard':
      return <Dashboard totals={totals} transactions={transactions} onDelete={handleDeleteTransaction} />;
    case 'analytics':
      return <Analytics transactions={transactions} totals={totals} />;
    case 'transactions':
      return <Transactions transactions={transactions} onDelete={handleDeleteTransaction} />;
    case 'goals':
      return <Goals totals={totals} transactions={transactions} />;
    default:
      return <Dashboard totals={totals} transactions={transactions} onDelete={handleDeleteTransaction} />;
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
        <Sidebar 
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onAddTransaction={() => setShowAddModal(true)}
        />

        <main className="main">
          {renderPage()}
        </main>
      </div>

      {showAddModal && (
        <AddTransaction
          onCancel={() => setShowAddModal(false)}
          onAdd={handleAddTransaction}
        />
      )}
    </div>
  );
}
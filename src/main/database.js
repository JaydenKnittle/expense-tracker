const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');

// Database path (saved in user's app data folder)
const dbPath = path.join(app.getPath('userData'), 'expenses.db');
const db = new Database(dbPath);

console.log('📁 Database location:', dbPath);

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    amount REAL NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    date TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    savings_goal REAL DEFAULT 1000000,
    goal_date TEXT,
    currency TEXT DEFAULT 'N$'
  );

  INSERT OR IGNORE INTO settings (id, savings_goal) VALUES (1, 1000000);
`);

console.log('✅ Database initialized');

// Transaction functions
const transactions = {
  add: (type, amount, category, description, date) => {
    const stmt = db.prepare(
      'INSERT INTO transactions (type, amount, category, description, date) VALUES (?, ?, ?, ?, ?)'
    );
    return stmt.run(type, amount, category, description, date);
  },

  getAll: () => {
    return db.prepare('SELECT * FROM transactions ORDER BY date DESC, id DESC').all();
  },

  delete: (id) => {
    return db.prepare('DELETE FROM transactions WHERE id = ?').run(id);
  },

  getTotals: () => {
    const income = db.prepare(
      "SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'income'"
    ).get();
    
    const expenses = db.prepare(
      "SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'expense'"
    ).get();

    return {
      income: income.total || 0,
      expenses: expenses.total || 0,
      balance: (income.total || 0) - (expenses.total || 0)
    };
  },

  getCategoryTotals: () => {
    return db.prepare(`
      SELECT category, SUM(amount) as total 
      FROM transactions 
      WHERE type = 'expense'
      GROUP BY category 
      ORDER BY total DESC
    `).all();
  }
};

// Settings functions
const settings = {
  get: () => {
    return db.prepare('SELECT * FROM settings WHERE id = 1').get();
  },

  update: (savingsGoal, goalDate) => {
    return db.prepare(
      'UPDATE settings SET savings_goal = ?, goal_date = ? WHERE id = 1'
    ).run(savingsGoal, goalDate);
  }
};
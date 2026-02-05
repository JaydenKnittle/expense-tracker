const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Transactions
  addTransaction: (data) => ipcRenderer.invoke('add-transaction', data),
  getTransactions: () => ipcRenderer.invoke('get-transactions'),
  deleteTransaction: (id) => ipcRenderer.invoke('delete-transaction', id),
  getTotals: () => ipcRenderer.invoke('get-totals'),
  getCategoryTotals: () => ipcRenderer.invoke('get-category-totals'),
  
  // Settings
  getSettings: () => ipcRenderer.invoke('get-settings'),
  updateSettings: (data) => ipcRenderer.invoke('update-settings', data),
  
  // Goals
  addGoal: (data) => ipcRenderer.invoke('add-goal', data),
  getGoals: () => ipcRenderer.invoke('get-goals'),
  getGoal: (id) => ipcRenderer.invoke('get-goal', id),
  updateGoal: (data) => ipcRenderer.invoke('update-goal', data),
  deleteGoal: (id) => ipcRenderer.invoke('delete-goal', id),
  archiveGoal: (id) => ipcRenderer.invoke('archive-goal', id),
  markGoalComplete: (id) => ipcRenderer.invoke('mark-goal-complete', id),
  markGoalIncomplete: (id) => ipcRenderer.invoke('mark-goal-incomplete', id),
  
  // Window controls
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
});
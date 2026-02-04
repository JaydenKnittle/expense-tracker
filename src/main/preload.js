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
  
  // Window controls
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
});
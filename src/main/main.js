const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { transactions, settings, goals } = require('./database');

const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    backgroundColor: '#0f172a',
    titleBarStyle: 'hidden',
    frame: false,
    show: false,
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });
}

// Transaction IPC Handlers
ipcMain.handle('add-transaction', async (event, data) => {
  return transactions.add(
    data.type,
    data.amount,
    data.category,
    data.description,
    data.date,
    data.isRecurring || false
  );
});

ipcMain.handle('get-transactions', async () => {
  return transactions.getAll();
});

ipcMain.handle('delete-transaction', async (event, id) => {
  return transactions.delete(id);
});

ipcMain.handle('get-totals', async () => {
  return transactions.getTotals();
});

ipcMain.handle('get-category-totals', async () => {
  return transactions.getCategoryTotals();
});

// Settings IPC Handlers
ipcMain.handle('get-settings', async () => {
  return settings.get();
});

ipcMain.handle('update-settings', async (event, data) => {
  return settings.update(data.savingsGoal, data.goalDate);
});

// Goals IPC Handlers
ipcMain.handle('add-goal', async (event, data) => {
  return goals.add(data.title, data.type, data.targetAmount, data.deadline);
});

ipcMain.handle('get-goals', async () => {
  return goals.getAll();
});

ipcMain.handle('get-goal', async (event, id) => {
  return goals.getById(id);
});

ipcMain.handle('update-goal', async (event, data) => {
  return goals.update(data.id, data.title, data.type, data.targetAmount, data.deadline);
});

ipcMain.handle('delete-goal', async (event, id) => {
  return goals.delete(id);
});

ipcMain.handle('archive-goal', async (event, id) => {
  return goals.archive(id);
});

ipcMain.handle('mark-goal-complete', async (event, id) => {
  return goals.markComplete(id);
});

ipcMain.handle('mark-goal-incomplete', async (event, id) => {
  return goals.markIncomplete(id);
});

// Window controls
ipcMain.handle('minimize-window', () => {
  BrowserWindow.getFocusedWindow()?.minimize();
});

ipcMain.handle('maximize-window', () => {
  const win = BrowserWindow.getFocusedWindow();
  if (win?.isMaximized()) {
    win.unmaximize();
  } else {
    win?.maximize();
  }
});

ipcMain.handle('close-window', () => {
  BrowserWindow.getFocusedWindow()?.close();
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
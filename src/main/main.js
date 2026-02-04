const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { transactions, settings } = require('./database');

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
    show: false, // Don't show until ready
  });

  // Load from dev server in development, or production build
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'));
  }

  // Show window when ready (prevents white flash)
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });
}

// IPC Handlers
ipcMain.handle('add-transaction', async (event, data) => {
  return transactions.add(
    data.type,
    data.amount,
    data.category,
    data.description,
    data.date
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

ipcMain.handle('get-settings', async () => {
  return settings.get();
});

ipcMain.handle('update-settings', async (event, data) => {
  return settings.update(data.savingsGoal, data.goalDate);
});

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
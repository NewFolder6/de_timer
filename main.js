const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const express = require('express');
const http = require('http');

let mainWindow;

function createWindow() {
  const { screen } = require('electron');
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;
  
  const windowWidth = 400;
  const windowHeight = 200;
  
  mainWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    x: Math.round((screenWidth - windowWidth) / 2), // Center horizontally
    y: Math.max(0, screenHeight - windowHeight - 50), // Ensure it's not below screen
    frame: false,
    transparent: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    minimizable: false,
    maximizable: false,
    focusable: false,
  });

  mainWindow.setIgnoreMouseEvents(true);
  mainWindow.setAlwaysOnTop(true, 'screen-saver');
  mainWindow.setVisibleOnAllWorkspaces(true);
  mainWindow.loadFile('index.html');

  // Force window to stay on top even in fullscreen games
  mainWindow.on('blur', () => {
    mainWindow.setAlwaysOnTop(true, 'screen-saver');
  });

  //mainWindow.webContents.openDevTools(); // For debugging
}

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

// GSI Server
const gsiApp = express();
const server = http.createServer(gsiApp);
const port = 3000;

gsiApp.use(express.json());

gsiApp.post('/', (req, res) => {
  const data = req.body;

  if (data.round && data.round.bomb === 'planted') {
    if (mainWindow) {
      mainWindow.webContents.send('c4-planted');
    }
  } else if (data.round && (data.round.phase === 'over' || data.round.bomb === 'exploded' || data.round.bomb === 'defused')) {
    if (mainWindow) {
      mainWindow.webContents.send('round-over');
    }
  }


  res.sendStatus(200);
});

server.listen(port, () => {
  console.log(`CS2 GSI server listening at http://localhost:${port}`);
});

ipcMain.on('quit-app', () => {
    app.quit();
});

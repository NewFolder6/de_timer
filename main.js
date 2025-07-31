const { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const express = require('express');
const http = require('http');

let mainWindow;
let tray;

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
    minimizable: true,
    maximizable: true,
    focusable: true,
    show: false
  });

  mainWindow.setIgnoreMouseEvents(true);
  mainWindow.setVisibleOnAllWorkspaces(true);
  mainWindow.loadFile('index.html');

  // Show window after it's ready and force maximum always on top
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.setAlwaysOnTop(true, 'screen-saver', 1);
    mainWindow.moveTop();
    
    // Force refresh position periodically to combat fullscreen issues
    setInterval(() => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.setAlwaysOnTop(false);
        mainWindow.setAlwaysOnTop(true, 'screen-saver', 1);
        mainWindow.moveTop();
      }
    }, 2000);
  });

  // Force window to stay on top even in fullscreen games
  mainWindow.on('blur', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.setAlwaysOnTop(true, 'screen-saver', 1);
      mainWindow.moveTop();
    }
  });

  // Hide window instead of closing when user clicks X
  mainWindow.on('close', (event) => {
    if (!app.isQuiting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  //mainWindow.webContents.openDevTools(); // For debugging
}

function createTray() {
  // Use the icon.ico file for the system tray
  const iconPath = path.join(__dirname, 'icon.ico');
  tray = new Tray(iconPath);
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'de_timer',
      enabled: false
    },
    {
      type: 'separator'
    },
    {
      label: 'Exit',
      click: () => {
        app.isQuiting = true;
        app.quit();
      }
    }
  ]);
  
  tray.setToolTip('CS2 C4 Timer');
  tray.setContextMenu(contextMenu);
}

app.whenReady().then(() => {
  createWindow();
  createTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // On Windows, keep the app running in the system tray
  // Don't quit when all windows are closed
  if (process.platform === 'darwin') {
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
    app.isQuiting = true;
    app.quit();
});

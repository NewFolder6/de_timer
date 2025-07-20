const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onC4Planted: (callback) => ipcRenderer.on('c4-planted', callback),
  onRoundOver: (callback) => ipcRenderer.on('round-over', callback),
  quitApp: () => ipcRenderer.send('quit-app')
});

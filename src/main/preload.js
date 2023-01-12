const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  onDrop: file => {
    ipcRenderer.send('onDrop', file);
  },
  onExportFailOrder: data => {
    ipcRenderer.send('onExportFailOrder', data);
  },
  onRun: (orderId = '', message = '', shop = '', waitTime = 3000) => {
    ipcRenderer.send('onRun', orderId, message, shop, waitTime);
  },
  onOpenFileDialog: () => {
    ipcRenderer.send('onOpenFileDialog');
  },
  onRestart: () => {
    ipcRenderer.send('onRestart');
  },
  getConfig: () => {
    ipcRenderer.send('getConfig');
  },
  setConfing: config => {
    ipcRenderer.send('setConfig', config);
  },
  ipcRenderer: {
    myPing() {
      ipcRenderer.send('ipc-example', 'ping');
    },
    on(channel, func) {
      // Deliberately strip event as it includes `sender`
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    },
    once(channel, func) {
      // Deliberately strip event as it includes `sender`
      ipcRenderer.once(channel, (event, ...args) => func(...args));
    },
  },
});

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  onDrop: (file) => {
    ipcRenderer.send('onDrop', file);
  },
  onExportFailOrder: (data) => {
    ipcRenderer.send('onExportFailOrder', data);
  },
  onRun: (orderId = '', message = '', waitTime = 3000, isAgain = false) => {
    ipcRenderer.send('onRun', orderId, message, waitTime, isAgain);
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

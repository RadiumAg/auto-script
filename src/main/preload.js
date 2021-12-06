const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  onDrop: (file) => {
    ipcRenderer.send('onDrop', file);
  },
  onRun: (orderId = '', message = '') => {
    ipcRenderer.send('onRun', orderId, message);
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

/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import path from 'path';
import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron';
import { NsisUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import { initEvents } from './events';

export default class AppUpdater {
  private static autoUpdater: NsisUpdater;

  static {
    const checkingDialogController = new AbortController();
    const downloadProgressController = new AbortController();
    this.autoUpdater = new NsisUpdater();
    this.autoUpdater.setFeedURL({
      provider: 'generic',
      url: app.isPackaged ? 'http://121.199.50.60:8080' : 'http://127.0.0.1',
      protocol: 'http',
    });
    this.autoUpdater.logger = log;

    this.autoUpdater.addListener('checking-for-update', () => {
      dialog.showMessageBox({
        message: '检查中',
        signal: checkingDialogController.signal,
      });
    });

    this.autoUpdater.addListener('download-progress', event => {
      checkingDialogController.abort();
      if (downloadProgressController.signal) downloadProgressController.abort();

      dialog.showMessageBox({
        message: `${event.percent}`,
        signal: downloadProgressController.signal,
      });
    });

    this.autoUpdater.addListener('update-downloaded', async () => {
      checkingDialogController.abort();
      const buttonIndex = await dialog.showMessageBox({
        type: 'info',
        title: '应用更新',
        message: '发现新版本，是否更新？',
        buttons: ['是', '否'],
      });

      if (buttonIndex.response === 0) {
        this.autoUpdater.quitAndInstall();
        app.quit();
      }
    });
    this.autoUpdater.addListener('error', e => {
      dialog.showErrorBox('错误', e.message);
    });

    this.autoUpdater.forceDevUpdateConfig = true;
  }

  static update() {
    this.autoUpdater.checkForUpdates();
  }
}

export let mainWindow: BrowserWindow | null = null;

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDevelopment =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDevelopment) {
  require('electron-debug')();
  require('electron-reloader')(module);
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map(name => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDevelopment) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    title: 'autoScript',
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);

initEvents();

import { ipcMain, dialog } from 'electron';
import { readFile, utils, WorkBook } from 'xlsx';
import log from 'electron-log';
import { Config } from '../../config';
import { EScriptType } from '../../auto-script/type';
import { buildScript, resetScript, setup } from '../../auto-script/setup';

let scriptType: EScriptType;
let workbook: WorkBook;

async function init() {
  ipcMain.on('onDrop', (event, filePath: string) => {
    workbook = readFile(filePath);
    event.reply('onDrop', workbook.SheetNames);
  });

  ipcMain.on('onSheetSelect', (event, name: string) => {
    const sheet = workbook.Sheets[name];
    event.reply('onSheetSelect', utils.sheet_to_json(sheet));
  });

  ipcMain.on('onExportFailOrder', async (event, data) => {
    const path = await dialog.showSaveDialog({
      filters: [
        {
          name: 'excel',
          extensions: ['xlsx'],
        },
      ],
    });
  });

  ipcMain.on(
    'onRun',
    async (
      event,
      key: string,
      message: string,
      shop: string,
      waitTime: number,
    ) => {
      try {
        if (scriptType !== (await Config.getConfig()).scriptType) {
          await buildScript();
          scriptType = (await Config.getConfig()).scriptType;
        }
        await setup({ key, message, waitTime, shop });
        event.reply('onRun', {
          state: true,
          key,
        });
      } catch (e) {
        if (e instanceof Error) {
          event.reply('onRun', {
            state: false,
            orderId: e.message,
          });
        }
      }
    },
  );

  ipcMain.on('onRestart', async event => {
    try {
      await resetScript();
      await buildScript();
    } catch (e) {
      log.warn(e);
    } finally {
      event.reply('onRestart');
    }
  });

  ipcMain.on('onOpenFileDialog', async event => {
    const { filePaths } = await dialog.showOpenDialog({
      title: '',
      properties: ['openDirectory'],
    });

    event.reply('onOpenFileDialog', filePaths);
  });

  ipcMain.on('getConfig', async event => {
    const config = await Config.getConfig();
    event.reply('getConfig', config);
  });

  ipcMain.on('setConfig', async (event, config) => {
    try {
      await Config.setConfig(config);
      event.reply('setConfig', undefined);
    } catch (e) {
      event.reply('setConfig', e);
    }
  });
}

export default init;

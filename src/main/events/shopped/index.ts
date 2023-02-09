import { ipcMain, dialog } from 'electron';
import { readFile, utils, WorkBook, writeFile } from 'xlsx';
import log from 'electron-log';
import { Config } from '../../config';
import { EScriptType } from '../../auto-script/type';
import { buildScript, resetScript, setup } from '../../auto-script/setup';

let scriptType: EScriptType;
const workbookCache = {
  data: [],
  filePath: '',
  sheetName: '',
  workbook: null as WorkBook,
};

async function init() {
  ipcMain.on('onDrop', (event, filePath: string) => {
    workbookCache.filePath = filePath;
    workbookCache.workbook = readFile(filePath);
    event.reply('onDrop', workbookCache.workbook.SheetNames);
  });

  ipcMain.on('onSheetSelect', (event, name: string) => {
    const sheet = workbookCache.workbook.Sheets[name];
    workbookCache.data = utils.sheet_to_json(sheet);
    workbookCache.sheetName = name;
    event.reply('onSheetSelect', workbookCache.data);
  });

  ipcMain.on('onMarkOrgin', (event, orderId: string, state: string) => {
    workbookCache.data.find(data => data['线上订单号'] === orderId)['状态'] =
      state;
    const sheet = utils.json_to_sheet(workbookCache.data, {});
    workbookCache.workbook.Sheets[workbookCache.sheetName] = sheet;

    writeFile(workbookCache.workbook, workbookCache.filePath, {
      sheet: workbookCache.sheetName,
    });
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

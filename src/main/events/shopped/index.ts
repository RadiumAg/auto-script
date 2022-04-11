import { ipcMain, dialog } from 'electron';
import { parse, build } from 'node-xlsx';
import fs from 'fs';
import { init as autoScriptInit } from '../../auto-script/shopped';

function init() {
  ipcMain.on('onDrop', (event, filePath: string) => {
    const xlsData = parse(filePath);
    event.reply('onDrop', xlsData);
  });

  ipcMain.on('onExportFailOrder', async (event, data) => {
    const path = await dialog.showSaveDialog({});
    const buffer = build([{ name: '导出订单', data: [data] }]);
    console.log(buffer);
    const dv = new DataView(buffer);
    fs.writeFile(path.filePath, dv, () => {});
  });

  ipcMain.on(
    'onRun',
    async (
      event,
      orderId: string,
      message: string,
      waitTime: number,
      isAgain
    ) => {
      try {
        await autoScriptInit(orderId, message, waitTime, isAgain);
        // await sleep(1000);
        event.reply('onRun', {
          state: true,
          orderId,
        });
      } catch (e) {
        if (e instanceof Error) {
          event.reply('onRun', {
            state: false,
            orderId: e.message,
          });
        }
      }
    }
  );
}

export default init;

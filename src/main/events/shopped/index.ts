import { ipcMain } from 'electron';
import { parse } from 'node-xlsx';
import { init as autoScriptInit } from '../../auto-script/shopped';

function init() {
  ipcMain.on('onDrop', (event, filePath: string) => {
    const xlsData = parse(filePath);
    event.reply('onDrop', xlsData);
  });

  ipcMain.on('onRun', async (event, orderId) => {
    try {
      await autoScriptInit(orderId);
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
  });
}

export default init;
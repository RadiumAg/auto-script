import { ipcMain, dialog } from 'electron';
import { parse, build } from 'node-xlsx';
import fs from 'fs';
import { ScriptType } from '../../auto-script/type';
import { init as autoScriptInit } from '../../auto-script/setup';

function init() {
  ipcMain.on('onDrop', (event, filePath: string) => {
    const xlsData = parse(filePath);
    event.reply('onDrop', xlsData);
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
    const buffer = build([{ name: '导出订单', data }]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fs.writeFile(path.filePath, buffer as any, () => {});
  });

  ipcMain.on(
    'onRun',
    async (
      event,
      orderId: string,
      message: string,
      waitTime: number,
      isAgain: boolean,
      scriptType: ScriptType
    ) => {
      try {
        await autoScriptInit(orderId, message, waitTime, isAgain, scriptType);
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

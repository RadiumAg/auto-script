import { ipcMain, dialog } from 'electron';
import { parse, build } from 'node-xlsx';
import fs from 'fs';
import { Config } from '../../config';
import { setup } from '../../auto-script/setup';

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
    ) => {
      try {
        const { scriptType } = await Config.getConfig();
        await setup(orderId, message, waitTime, isAgain, scriptType);
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
    },
  );
}

export default init;

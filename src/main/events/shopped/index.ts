import { ipcMain, dialog } from 'electron';
import { parse, build } from 'node-xlsx';
import fs from 'fs';
import chalk from 'chalk';
import consola from 'consola';
import { Config } from '../../config';
import { EScriptType } from '../../auto-script/type';
import { buildScript, resetScript, setup } from '../../auto-script/setup';

let scriptType: EScriptType;

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
      consola.info(chalk.yellow(e));
    } finally {
      event.reply('onRestart');
    }
  });
}

export default init;

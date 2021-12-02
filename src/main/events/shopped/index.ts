import { ipcMain } from 'electron';
import { read_excel } from 'danfojs-node';

function init() {
  ipcMain.on('onDrop', async (event, filePath: string) => {
    const excelData = await read_excel(filePath, { sheet: 0 });
    console.log(excelData);
  });
}

export default init;

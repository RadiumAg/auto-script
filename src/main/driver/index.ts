import axios from 'axios';
import fs from 'fs';
import { IncomingMessage } from 'http';
import path from 'path';
import StreamZip from 'node-stream-zip';
import { app, Notification } from 'electron';
import { Config } from '../config';
import { setProgress } from '../core/util';

const driverUrl = 'https://chromedriver.storage.googleapis.com';
const chromePath = 'C:/Program Files/Google/Chrome/Application';
let notification: Notification;

function getLocalVersion() {
  const dirs = fs.readdirSync(chromePath);
  const version = dirs.find(dirName => /([0-9]+\.?)+/.test(dirName));
  return version;
}

async function getZip(version: string) {
  const { data } = await axios.get<IncomingMessage>(
    `${driverUrl}/${version}/chromedriver_win32.zip`,
    {
      responseType: 'stream',
    },
  );
  return data;
}

async function downloadDriver() {
  let message: IncomingMessage;
  let buffer = Buffer.from([]);
  const { start, finsh } = setProgress();
  const localVersion = getLocalVersion();
  start();

  try {
    message = await getZip(localVersion);
  } catch {
    const { data } = await axios.get<string>(`${driverUrl}`);
    const mainVersion = localVersion.split('.')[0];
    const matchRes = data.matchAll(
      new RegExp(`(${mainVersion}\\.\\d\\.\\d{4}\\.\\d{2})`, 'g'),
    );
    console.log(matchRes);
    message = await getZip([...matchRes].at(-1)[0]);
  }

  message.addListener('data', (chunk: Buffer) => {
    buffer = Buffer.concat([buffer, chunk]);
  });

  message.addListener('end', async () => {
    await fs.promises.writeFile(
      path.resolve(__dirname, 'chromedriver.zip'),
      buffer,
    );
    // eslint-disable-next-line new-cap
    const zip = new StreamZip.async({
      file: path.resolve(__dirname, 'chromedriver.zip'),
    });

    try {
      await zip.extract(
        zip.entries()[0],
        app.isPackaged
          ? path.resolve(__dirname, '../auto-script')
          : path.resolve(__dirname, '../../../src/main/auto-script'),
      );
      finsh();
      new Notification({ title: '通知', body: '更新完成' }).show();
    } catch (e) {
      if (e instanceof Error) {
        new Notification({ title: '通知', body: e.message }).show();
        finsh();
      }
    }
  });
}

export const updateDriver = async () => {
  const localVersion = getLocalVersion();
  if (localVersion !== (await Config.getConfig()).driverVersion) {
    await downloadDriver();
    Config.setConfig({ driverVersion: localVersion });
  } else {
    notification?.close();
    notification = new Notification({
      title: '通知',
      body: '已经最新',
      subtitle: 'autoScript',
    });
    notification.show();
  }
};

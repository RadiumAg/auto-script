import axios from 'axios';
import fs from 'fs';
import { IncomingMessage } from 'http';
import path from 'path';
import StreamZip from 'node-stream-zip';
import { Config } from '../config';

const driverUrl = 'https://chromedriver.storage.googleapis.com';
const chromePath = 'C:/Program Files/Google/Chrome/Application';

function getLocalVersion() {
  const dirs = fs.readdirSync(chromePath);
  const version = dirs.find(dirName => /([0-9]+\.?)+/.test(dirName));
  return version;
}

async function getZip(version: string) {
  const { data } = await axios.get<IncomingMessage>(
    `${driverUrl}/${version}/chromedriver_win32.zip`,
    { responseType: 'stream' },
  );
  return data;
}

async function downloadDriver() {
  let message: IncomingMessage;
  let buffer = Buffer.from([]);
  const localVersion = getLocalVersion();

  try {
    message = await getZip(localVersion);
  } catch {
    const { data } = await axios.get<string>(`${driverUrl}`);
    const mainVersion = localVersion.split('.')[0];
    const matchRes = data.matchAll(
      new RegExp(`(${mainVersion}.\\d.\\d{4}.\\d{2})`, 'g'),
    );
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
    await zip.extract(zip.entries()[0], __dirname);
  });
}

export const updateDriver = async () => {
  const localVersion = getLocalVersion();
  if (localVersion !== (await Config.getConfig()).driverVersion) {
    await downloadDriver();
    Config.setConfig({ driverVersion: localVersion });
  }
};

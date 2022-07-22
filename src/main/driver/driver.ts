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
  console.log(version);
  return version;
}

async function downloadDriver() {
  const { data: message } = await axios.get<IncomingMessage>(
    `${driverUrl}/${getLocalVersion()}/chromedriver_win32.zip`,
    { responseType: 'stream' },
  );
  let buffer = Buffer.from([]);

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

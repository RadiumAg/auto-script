import axios from 'axios';
import fs from 'fs';
import { Config } from 'main/config';
import { IncomingMessage } from 'http';
import { unzip } from 'zlib';
import path from 'path';
import StreamZip from 'node-stream-zip';

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
    const zip = new StreamZip({
      file: 'chromedriver.zip',
    });
    zip.extract(
      'chromedriver.exe',
      path.resolve(__dirname, './chromedriver.exe'),
      error => {
        console.log(error);
      },
    );
    zip.close();
  });
}

export const updateDriver = async () => {
  const localVersion = getLocalVersion();
  if (localVersion !== (await Config.getConfig()).driverVersion) {
  }
};

downloadDriver();

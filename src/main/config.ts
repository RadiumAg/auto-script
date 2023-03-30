import { app } from 'electron';
import fs from 'fs';
import path from 'path';
import { EScriptType } from './auto-script/type';

const configPath = app.isPackaged
  ? path.resolve(__dirname, '../../../src/main/app.config.json')
  : path.resolve(__dirname, './app.config.json');

type Mode = 'single' | 'multiple';

export type ConfigData = Partial<{
  mode: Mode;
  appDataPath: string;
  driverVersion: string;
  scriptType: EScriptType;
  multipleFilePath: string;
}>;

let cacheConfig: ConfigData;

export class Config {
  static async getConfig() {
    if (!cacheConfig) {
      cacheConfig = JSON.parse(
        (await fs.promises.readFile(configPath)).toString(),
      ) as ConfigData;
    }

    return cacheConfig;
  }

  static async setConfig(data: ConfigData) {
    let config = await this.getConfig();
    config = { ...config, ...data };
    cacheConfig = config;
    await fs.promises.writeFile(configPath, JSON.stringify(config));
  }
}

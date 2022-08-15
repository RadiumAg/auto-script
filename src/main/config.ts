import fs from 'fs';
import path from 'path';
import { EScriptType } from './auto-script/type';

const configPath = path.resolve(__dirname, 'app.config.json');

type ConfigData = {
  scriptType?: EScriptType;
  driverVersion?: string;
};

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

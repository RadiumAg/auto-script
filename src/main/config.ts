import fs from 'fs';
import path from 'path';
import { EScriptType } from './auto-script/type';

const configPath = path.resolve(__dirname, 'app.config.json');

type ConfigData = {
  scriptType?: EScriptType;
  driverVersion?: string;
};

export class Config {
  static async getConfig() {
    console.log((await fs.promises.readFile(configPath)).toString());
    return JSON.parse(
      (await fs.promises.readFile(configPath)).toString(),
    ) as ConfigData;
  }

  static async setConfig(data: ConfigData) {
    let config = await this.getConfig();
    config = { ...config, ...data };
    await fs.promises.writeFile(configPath, JSON.stringify(config));
  }
}

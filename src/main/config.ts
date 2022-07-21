import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { EScriptType } from './auto-script/type';

const configPath = path.resolve(__dirname, 'app.config.json');

type ConfigData = {
  scriptType: EScriptType;
};

export class Config {
  // eslint-disable-next-line class-methods-use-this
  static getConfig() {
    return new Promise<ConfigData>((resolve, reject) => {
      try {
        const res = JSON.parse(
          readFileSync(configPath).toString(),
        ) as ConfigData;
        resolve(res);
      } catch (e) {
        reject(e);
      }
    });
  }

  static async setConfig(data: ConfigData) {
    let config = await this.getConfig();
    return new Promise((resolve, reject) => {
      try {
        config = { ...config, ...data };
        writeFileSync(configPath, JSON.stringify(config));
        resolve(true);
      } catch (e) {
        reject(e);
      }
    });
  }
}

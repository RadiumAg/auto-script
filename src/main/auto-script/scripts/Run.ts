/* eslint-disable no-useless-catch */
import { ThenableWebDriver } from 'selenium-webdriver';
import { Await } from '../type';

export abstract class Run {
  constructor(
    driver: Await<ThenableWebDriver>,
    operatePageUrl: string,
    loginPageUrl: string,
    waitTime: number,
  ) {
    this.driver = driver;
    this.operatePageUrl = operatePageUrl;
    this.loginPageUrl = loginPageUrl;
    this.waitTime = waitTime * 1000;
  }

  protected isStop: boolean = false;

  protected loginPageUrl: string;

  protected operatePageUrl: string;

  protected driver: Await<ThenableWebDriver>;

  protected waitTime = 0;

  protected windows: {
    windowHandles: string[];
    current: string;
  } = { windowHandles: [], current: '' };

  protected abstract run(key: string, message: string): Promise<void>;

  protected async isLogin() {
    while ((await this.driver.getCurrentUrl()) !== this.operatePageUrl) {
      await this.driver.sleep(1000);
    }
  }

  async start(key: string, message: string) {
    if (this.isStop) throw new Error(key);

    if ((await this.driver.getCurrentUrl()) !== this.operatePageUrl) {
      await this.driver.get(this.loginPageUrl);

      try {
        await this.isLogin();
      } catch (e) {
        throw e;
      }
    }

    await this.run(key, message);
  }

  stop() {
    this.driver = undefined;
    this.isStop = true;
  }

  async waitForWindow() {
    await this.driver.sleep(this.waitTime);
    const handlesNow = await this.driver.getAllWindowHandles();
    if (handlesNow.length > this.windows.windowHandles.length) {
      return handlesNow.find(
        handle => !this.windows.windowHandles.includes(handle),
      );
    }
    throw new Error('New window did not appear before timeout');
  }
}

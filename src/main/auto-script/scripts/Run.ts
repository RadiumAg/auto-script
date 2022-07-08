/* eslint-disable no-useless-catch */
import { ThenableWebDriver } from 'selenium-webdriver';
import { Await } from '../type';

export abstract class Run {
  constructor(
    driver: Await<ThenableWebDriver>,
    operatePageUrl: (string | RegExp)[],
    loginPageUrl: string,
  ) {
    this.driver = driver;
    this.operatePageUrl = operatePageUrl;
    this.loginPageUrl = loginPageUrl;
  }

  protected isStop: boolean = false;

  protected loginPageUrl: string;

  private async isOperateUrl() {
    const currentUrl = await this.driver.getCurrentUrl();
    return this.operatePageUrl.every(_ => {
      if (_ instanceof RegExp) {
        return currentUrl.match(_)?.length;
      } else {
        return _.includes(currentUrl);
      }
    });
  }

  protected operatePageUrl: (string | RegExp)[];

  protected driver: Await<ThenableWebDriver>;

  protected waitTime = 0;

  protected windows: {
    windowHandles: string[];
    current: string;
  } = { windowHandles: [], current: '' };

  protected abstract run(key: string, message: string, ...args): Promise<void>;

  protected async isLogin() {
    while (!this.isOperateUrl()) {
      await this.driver.sleep(1000);
    }
  }

  async start(key: string, message: string, waitTime: number, ...args) {
    this.waitTime = waitTime * 1000;
    if (this.isStop) throw new Error(key);
    if (!this.isOperateUrl()) {
      await this.driver.get(this.loginPageUrl);
      await this.isLogin();
    }
    await this.run(key, message, ...args);
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

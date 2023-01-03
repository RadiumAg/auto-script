/* eslint-disable no-useless-catch */
import { By, ThenableWebDriver, WebElement } from 'selenium-webdriver';
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

  protected isStop = false;

  protected loginPageUrl: string;

  private async isOperateUrl() {
    const currentUrl = await this.driver.getCurrentUrl();
    return this.operatePageUrl.some(_ => {
      if (_ instanceof RegExp) {
        return currentUrl.match(_);
      } else {
        return currentUrl.includes(_);
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
    while (!(await this.isOperateUrl())) {
      await this.driver.sleep(1000);
    }
  }

  async start(key: string, message: string, waitTime: number, ...args) {
    this.waitTime = waitTime * 1000;
    if (this.isStop) throw new Error(key);
    if (!(await this.isOperateUrl())) {
      await this.driver.get(this.loginPageUrl);
      await this.isLogin();
    }
    await this.run(key, message, ...args);
  }

  stop() {
    this.driver = undefined;
    this.isStop = true;
  }

  async isFind(
    element: WebElement,
    fn: (element: WebElement) => Promise<boolean>,
  ) {
    try {
      return await fn(element);
    } catch {
      return false;
    }
  }

  async untilDisaperend(selector: By, fn?: (element: WebElement) => void) {
    let flag = false;
    const startTime = process.uptime();

    while (!flag && process.uptime() - startTime <= 20) {
      await this.driver.sleep(this.waitTime);
      try {
        const target = await this.driver.findElement(selector);
        await fn?.(target);
      } catch {
        flag = true;
      }
    }
  }

  async untilAppear(selector: By, fn?: (element: WebElement) => void) {
    let flag = false;
    const startTime = process.uptime();

    while (!flag && process.uptime() - startTime <= 20) {
      await this.driver.sleep(this.waitTime);
      try {
        const target = await this.driver.findElement(selector);
        await fn?.(target);
        flag = true;
        await this.driver.sleep(this.waitTime);
      } catch {}
    }
  }

  async waitForWindow(time = this.waitTime) {
    await this.driver.sleep(time);
    const handlesNow = await this.driver.getAllWindowHandles();
    if (handlesNow.length > this.windows.windowHandles.length) {
      return handlesNow.find(
        handle => !this.windows.windowHandles.includes(handle),
      );
    }
    throw new Error('New window did not appear before timeout');
  }
}

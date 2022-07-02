// Generated by Radium
import { resolve } from 'path';
import chrome from 'selenium-webdriver/chrome';
import { Builder, ThenableWebDriver } from 'selenium-webdriver';
import { Await, ScriptType } from './type';
import { Run } from './scripts/Run';
import { Shopped } from './scripts/Shopped';
import { TickTok } from './scripts/ticktok';

const serviceBuilder = new chrome.ServiceBuilder(
  resolve(__dirname, './chromedriver.exe'),
);

let script: Run;
let driver: Await<ThenableWebDriver>;

export async function setup(
  key: string,
  message: string,
  waitTime: number,
  isAgain: boolean,
  type: ScriptType,
) {
  try {
    if (isAgain && driver) {
      await driver.close();
      await driver.quit();
      script.stop();
      script = null;
    }

    if (!script && !driver) {
      driver = await new Builder()
        .forBrowser('chrome')
        .setChromeService(serviceBuilder)
        .build();

      switch (type) {
        case 'shopped':
          script = new Shopped(
            driver,
            ['https://seller.shopee.cn/webchat/conversations'],
            'https://seller.shopee.cn/account/signin?next=%2Fwebchat%2Fconversations',
            waitTime,
          );
          break;

        case 'tiktok':
          script = new TickTok(
            driver,
            [
              'https://seller-th.tiktok.com/homepage?shop_region=TH',
              'https://seller-th.tiktok.com/account/welcome',
              'https://seller-th.tiktok.com/homepage?is_new_connect=0&need_local_region_check=1&shop_region=TH',
            ],
            'https://seller-th.tiktok.com/homepage',
            waitTime,
          );
          break;

        default:
          break;
      }
    }
    await script.start(key, message);
  } catch (e) {
    console.log(e instanceof Error && e.message);
    if (e instanceof Error) throw new Error(key);
  }
}

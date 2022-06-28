// Generated by Radium
import { resolve } from 'path';
import chrome from 'selenium-webdriver/chrome';
import { Builder, ThenableWebDriver } from 'selenium-webdriver';
import { Await, ScriptType } from './type';
import { Run } from './scripts/Run';
import { Shopped } from './scripts/Shopped';
import { TickTok } from './scripts/ticktok';

const serviceBuilder = new chrome.ServiceBuilder(
  resolve(__dirname, './chromedriver.exe')
);

let driver: Await<ThenableWebDriver>;

export async function init(
  key: string,
  message: string,
  waitTime: number,
  isAgain: boolean,
  type: ScriptType
) {
  try {
    let script: Run;

    if (isAgain && driver) {
      try {
        try {
          await Promise.race([
            driver.close(),
            driver.quit(),
            new Promise((_resolve, reject) => {
              const flag = setTimeout(() => {
                // eslint-disable-next-line prefer-promise-reject-errors
                reject('超时');
                clearTimeout(flag);
              }, 4000);
            }),
          ]);
        } finally {
          script.stop();
          script = null;
        }
      } catch (e) {
        console.log(e instanceof Error && e.message);
      }
    }

    if (!script) {
      driver = await new Builder()
        .forBrowser('chrome')
        .setChromeService(serviceBuilder)
        .build();

      switch (type) {
        case 'shopped':
          script = new Shopped(
            driver,
            'https://seller.shopee.cn/webchat/conversations',
            'https://seller.shopee.cn/account/signin?next=%2Fwebchat%2Fconversations',
            waitTime
          );
          break;

        case 'tiktok':
          script = new TickTok(
            driver,
            'https://seller-th.tiktok.com/homepage?is_new_connect=0&need_local_region_check=1&shop_region=TH',
            'https://seller-th.tiktok.com',
            waitTime
          );
          break;

        default:
          break;
      }
    } else {
      script.start(key, message);
    }
  } catch (e) {
    console.log(e instanceof Error && e.message);
    if (e instanceof Error) throw new Error(key);
  }
}

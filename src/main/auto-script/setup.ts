// Generated by Radium
import { resolve } from 'path';
import chrome from 'selenium-webdriver/chrome';
import { Builder, ThenableWebDriver } from 'selenium-webdriver';
import { app } from 'electron';
import { Config } from '../config';
import { Await, EScriptType } from './type';
import { Run } from './scripts/Run';
import { Shopped } from './scripts/Shopped';
import { TickTok } from './scripts/Ticktok';
import { TickTokCross } from './scripts/TicktokCross';
import { Lazada } from './scripts/Lazada';
import { TiktokIndonesia } from './scripts/TiktokIndonesia';

const serviceBuilder = new chrome.ServiceBuilder(
  resolve(
    app.isPackaged
      ? resolve(__dirname, '../../../src/main/auto-script/chromedriver.exe')
      : resolve(__dirname, './chromedriver.exe'),
  ),
);

// eslint-disable-next-line import/no-mutable-exports
export let script: Run;
// eslint-disable-next-line import/no-mutable-exports
export let driver: Await<ThenableWebDriver>;

export async function resetScript() {
  try {
    await driver?.quit?.();
    script?.stop?.();
  } finally {
    script = null;
    driver = null;
  }
}

export async function buildScript() {
  if (driver) return;
  const { scriptType } = await Config.getConfig();
  try {
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeService(serviceBuilder)
      .setChromeOptions(
        new chrome.Options().windowSize({ height: 1080, width: 1920 }),
      )
      .build();
  } catch (e) {
    console.log(e);
  }

  switch (scriptType) {
    case EScriptType.shopped:
      script = new Shopped(
        driver,
        ['https://seller.shopee.cn/webchat/conversations'],
        'https://seller.shopee.cn/account/signin?next=%2Fwebchat%2Fconversations',
      );
      break;

    case EScriptType.tiktok:
      script = new TickTok(
        driver,
        [
          'https://seller-th.tiktok.com/homepage?shop_region=TH',
          'https://seller-th.tiktok.com/account/welcome',
          'https://seller-th.tiktok.com/homepage?is_new_connect=0&need_local_region_check=1&shop_region=TH',
        ],
        'https://seller.tiktokglobalshop.com/account/login?redirect_url=https%3A%2F%2Fseller.tiktokglobalshop.com%2Fhomepage',
      );
      break;

    case EScriptType.tiktokCross:
      script = new TickTokCross(
        driver,
        [
          /https:\/\/seller\.tiktokglobalshop\.com\/homepage/g,
          /https:\/\/seller\.tiktokglobalshop\.com\/order/g,
        ],
        'https://seller.tiktokglobalshop.com/account/login',
      );
      break;

    case EScriptType.Lazada:
      script = new Lazada(
        driver,
        [
          /https:\/\/sellercenter-(ph|id|my|sg|th|vn)\.lazada-seller\.cn/,
          'https://gsp.lazada-seller.cn',
        ],
        'https://gsp.lazada-seller.cn/page/login',
      );
      break;

    case EScriptType.TiktokIndonesia:
      script = new TiktokIndonesia(
        driver,
        ['https://seller-id.tiktok.com/order'],
        'https://seller-id.tiktok.com/account/login?order_status%5B0%5D=200&selected_sort=6&tab=all&redirect_url=https%3A%2F%2Fseller-id.tiktok.com%2Forder%3Forder_status%255B0%255D%3D200%26selected_sort%3D6%26tab%3Dall',
      );
      break;

    default:
      break;
  }
}

export async function setup({
  key,
  message,
  waitTime,
  shop,
}: {
  waitTime: number;
  key?: string;
  message?: string;
  shop?: string;
}) {
  try {
    await script.start(key, message, waitTime, shop);
  } catch (e) {
    console.log(e instanceof Error && e.message);
    if (e instanceof Error) throw new Error(key);
  }
}

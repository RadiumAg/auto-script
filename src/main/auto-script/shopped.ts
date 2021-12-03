// Generated by Radium
import { resolve } from 'path';
import chorme from 'selenium-webdriver/chrome';
import { Builder, By, ThenableWebDriver } from 'selenium-webdriver';
import { Await } from './type';

const serviceBuilder = new chorme.ServiceBuilder(
  resolve(__dirname, './chromedriver.exe')
);
const operatePageUrl = 'https://seller.ph.shopee.cn/webchat/conversations';
const loginPageUrl =
  'https://seller.ph.shopee.cn/account/signin?next=%2Fwebchat%2Fconversations';

let driver: Await<ThenableWebDriver>;

export async function init(key: string) {
  try {
    // promise to have one window
    if (!driver) {
      driver = await new Builder()
        .forBrowser('chrome')
        .setChromeService(serviceBuilder)
        .build();
    }
    await run(key);
  } catch (e) {
    if (e instanceof Error) throw new Error(key);
  }
}

async function isLogin() {
  while ((await driver.getCurrentUrl()) !== operatePageUrl) {
    await driver.sleep(1000);
    console.log('wait login');
  }
}

async function run(key: string) {
  if ((await driver.getAllWindowHandles()).length === 1) {
    await driver.get(loginPageUrl);
  }
  await isLogin();
  await driver.sleep(3000);
  await driver.executeScript('window.scrollTo(0,0)');
  await driver.executeScript('window.scrollTo(0,0)');
  await driver.findElement(By.css('.\\_3oQvjrwelQ')).click();
  await driver.findElement(By.css('.\\_3oQvjrwelQ')).sendKeys(key);
  await driver.sleep(3000);
  try {
    await driver.findElement(By.css('.\\_2m-B0IaPxv')).click();
    await driver.executeScript('window.scrollTo(0,0)');
    await driver.sleep(3000);
  } catch (e) {
    if (e instanceof Error) throw new Error(key);
  }
  try {
    try {
      const resetCommitEle = await driver.findElement(By.css('._3SRbvVaoYY'));
      if (resetCommitEle) {
        await resetCommitEle.click();
        await driver.sleep(3000);
      }
    } catch (e) {
      console.log(e instanceof Error && e.message);
    }
    const commitTeatarea = await driver.findElement(By.css('.pmSS24qKJT'));
    await commitTeatarea.click();
    await commitTeatarea.sendKeys('do you play tiktok,dear?');
    await driver.findElement(By.css('.\\_1UCrc0YeSY > .chat-icon')).click();
    await driver.executeScript('window.scrollTo(0,0)');
  } catch (e) {
    if (e instanceof Error) throw new Error(key);
  }
}
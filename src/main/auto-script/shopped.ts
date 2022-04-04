// Generated by Radium
import { resolve } from 'path';
import chorme from 'selenium-webdriver/chrome';
import { Builder, By, ThenableWebDriver } from 'selenium-webdriver';
import { Await } from './type';

const serviceBuilder = new chorme.ServiceBuilder(
  resolve(__dirname, './chromedriver.exe')
);
const operatePageUrl = 'https://seller.shopee.cn/webchat/conversations';
const loginPageUrl =
  'https://seller.shopee.cn/account/signin?next=%2Fwebchat%2Fconversations';

let driver: Await<ThenableWebDriver>;

export async function init(
  key: string,
  message: string,
  waitTime: number,
  isAgain: boolean
) {
  try {
    console.log(isAgain, driver === undefined);
    // promise to have one window
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
          driver = undefined;
        }
      } catch (e) {
        console.log(e instanceof Error && e.message);
      }
    }

    if (!driver) {
      driver = await new Builder()
        .forBrowser('chrome')
        .setChromeService(serviceBuilder)
        .build();
    }
    await run(key, message, waitTime);
  } catch (e) {
    console.log(e instanceof Error && e.message);
    if (e instanceof Error) throw new Error(key);
  }
}

async function isLogin(key: string) {
  while ((await driver.getCurrentUrl()) !== operatePageUrl) {
    await driver.sleep(1000);
    if (!driver) {
      throw new Error(key);
    }
  }
}

async function run(key: string, message: string, waitTime: number) {
  if ((await driver.getCurrentUrl()) !== operatePageUrl) {
    await driver.get(loginPageUrl);
  }
  const durTime = waitTime * 1000;

  // eslint-disable-next-line no-useless-catch
  try {
    await isLogin(key);
  } catch (e) {
    throw e;
  }
  await driver.sleep(durTime);
  await driver.executeScript('window.scrollTo(0,0)');
  await driver.executeScript('window.scrollTo(0,0)');
  await driver.findElement(By.css('._3oQvjrwelQ')).click();
  try {
    await driver.findElement(By.css('._35r5VifQo2')).click();
  } catch (e) {
    console.warn(e instanceof Error && e.message);
  }
  await driver.findElement(By.css('._3oQvjrwelQ')).sendKeys(key);
  await driver.sleep(durTime);
  try {
    await driver.findElement(By.css('._2m-B0IaPxv')).click();
    await driver.executeScript('window.scrollTo(0,0)');
    await driver.sleep(durTime);
  } catch (e) {
    throw new Error(key);
  }
  try {
    try {
      const resetCommitEle = await driver.findElement(
        By.css('._2AOBj87MlbPlgdDbOTyrB8')
      );
      if (resetCommitEle) {
        await resetCommitEle.click();
        await driver.sleep(durTime);
      }
    } catch (e) {
      console.log(e instanceof Error && e.message);
    }
    const commitTeatarea = await driver.findElement(
      By.css('._1L56qVWs5lICF9a2voCfDg')
    );
    await commitTeatarea.click();
    await commitTeatarea.sendKeys(message);
    await driver
      .findElement(By.css('._3kEAcT1Mk5._2sWp7oBoR7zs8t1v8TtDX3'))
      .click();
    await driver.executeScript('window.scrollTo(0,0)');
  } catch (e) {
    throw new Error(key);
  }
}

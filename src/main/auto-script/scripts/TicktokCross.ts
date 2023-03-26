import log from 'electron-log';
import { Run } from './Run';

const { By } = require('selenium-webdriver');

enum EShop {
  马来西亚 = '马来西亚',
  菲律宾 = '菲律宾',
  泰国 = '泰国',
  越南 = '越南',
  英国 = '英国',
  新加坡 = '新加坡',
}

let preShop = '';

export class TickTokCross extends Run {
  protected async run(key: string, message: string, shop: EShop) {
    try {
      if (shop !== preShop) {
        const shopNav = By.css('.index__nameContainer--W2iiF');
        await this.untilAppear(shopNav);
        await this.driver.findElement(shopNav).click();

        const GBBy = By.css('input[value=GB] + span');
        await this.untilAppear(GBBy);

        switch (shop) {
          case EShop.英国:
            await this.driver.findElement(GBBy).click();
            break;

          case EShop.马来西亚:
            await this.driver
              .findElement(By.css('input[value=MY] + span'))
              .click();
            break;

          case EShop.菲律宾:
            await this.driver
              .findElement(By.css('input[value=PH] + span'))
              .click();
            break;

          case EShop.新加坡:
            await this.driver
              .findElement(By.css('input[value=SG] + span'))
              .click();
            break;

          case EShop.泰国:
            await this.driver
              .findElement(By.css('input[value=TH] + span'))
              .click();
            break;

          case EShop.越南:
            await this.driver
              .findElement(By.css('input[value=VN] + span'))
              .click();
            break;

          default:
            break;
        }
      }
      preShop = shop;

      const orderItemBy = By.css(
        '.homepage_menu_submenu_3 > .arco-menu-inline-header',
      );
      // 等出现订单
      await this.untilAppear(orderItemBy);
      const orderItem = await this.driver.findElement(orderItemBy);
      const orderManagerItem = await this.driver.findElement(
        By.css('#menu_item_9 > .arco-menu-item'),
      );
      if (
        !(await this.isFind(orderManagerItem, async element => {
          return (await element.getAttribute('class')).includes(
            'arco-menu-selected',
          );
        }))
      ) {
        await orderItem.click();
        await this.driver.sleep(this.waitTime);
        await orderManagerItem.click();
      }

      await this.driver.sleep(this.waitTime);

      try {
        // 过导航
        await this.untilDisaperend(
          By.css('.sc-bkzZxe.caMRRe.sc-dIUggk.bDquIG  button'),
          async element => {
            await element.click();
          },
        );
      } catch (e) {
        log.warn(e);
      }
      const allItemBy = By.css(
        '.OrderTab__TabContainer-sc-15sey9p-0>div:nth-child(1)',
      );
      await this.untilAppear(allItemBy);
      // 点全部
      await this.driver.findElement(allItemBy).click();
      // 等加载
      const searchInputBy = By.css('input[placeholder=搜索订单ID]');
      await this.untilAppear(searchInputBy);
      const searchInput = this.driver.findElement(
        By.css('input[placeholder=搜索订单ID]'),
      );
      await searchInput.click();
      // 搜索
      await searchInput.clear();
      await searchInput.sendKeys(key);
      this.windows.windowHandles = await this.driver.getAllWindowHandles();
      await this.driver.sleep(this.waitTime);
      await this.driver.findElement(By.css('.i18n-icon-search')).click();
      await this.untilDisaperend(By.css('.arco-spin-loading'));
      // 点聊天
      if (await this.driver.findElement(By.css('.index__chatIcon--SNjDl')))
        await this.driver
          .findElement(By.css('.index__ContactBuyerWrapper--eCQNn'))
          .click();

      this.windows.current = await this.waitForWindow();
      await this.driver.switchTo().window(this.windows.current);

      const commitTextBy = By.css('#chat-input-textarea textarea');
      await this.untilAppear(commitTextBy);

      // 过导航
      try {
        await this.untilDisaperend(
          By.css('#___reactour  button.zep-btn'),
          async element => {
            await element.click();
          },
        );
      } catch (e) {
        log.warn(e);
      }
      // 点聊天框
      const commitTextArea = await this.driver.findElement(commitTextBy);
      await commitTextArea.click();
      // 输入消息
      await commitTextArea.sendKeys(message);
      // 翻译
      await this.driver.sleep(this.waitTime);
      // 获得翻译后的内容
      const translateContent = await (
        await this.driver.findElements(
          By.css('#chat-input-textarea > textarea'),
        )
      )
        .at(-1)
        .getText();

      await this.driver.sleep(this.waitTime);

      // 要点开确认框
      try {
        await this.driver
          .findElement(By.css('.arco-modal-footer button:nth-child(2)'))
          .click();
      } catch {
        console.log('正常存活');
      }

      try {
        const chatDoms = await this.driver.findElements(
          By.css(
            '.chatd-bubble-main.chatd-bubble-main--self.chatd-bubble-main--left',
          ),
        );

        const lastChatContext = await chatDoms
          .at(-1)
          .findElement(By.css('.C4FxMIlJ34bAfFfudjB3,span'))
          .getText();

        // 如果最后内容不一样，才发送
        if (lastChatContext !== translateContent) {
          // 点发送
          await this.driver.findElement(By.css('.chatd-button')).click();
        }
      } catch {
        // 新订单直接发送
        await this.driver.findElement(By.css('.chatd-button')).click();
      }

      // 关闭当前页，预防断线
      await this.driver.close();
    } catch (e) {
      log.warn(e);
      throw new Error(key);
    } finally {
      await this.driver.switchTo().window(this.windows.windowHandles[0]);
    }
  }
}

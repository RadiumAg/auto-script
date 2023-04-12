import log from 'electron-log';
import { By } from 'selenium-webdriver';
import { Run } from './Run';

enum EShop {
  马来西亚 = 'MY',
  菲律宾 = 'PH',
  泰国 = 'TH',
  越南 = 'VN',
  英国 = 'GB',
  新加坡 = 'SG',
}

let preShop = '';

export class TickTokCross extends Run {
  private countryWindowMap: Map<string, string> = new Map();

  protected async run(key: string, message: string, shop: EShop) {
    try {
      if (shop !== preShop) {
        await this.driver.get(
          `https://seller.tiktokglobalshop.com/order?order_status[]=200&selected_sort=6&shop_region=${EShop[shop]}&tab=to_ship`,
        );

        await this.untilDisaperend(By.css('.index__loading--j9AUW'));
        await this.driver.sleep(this.waitTime);
      }

      await this.untilDisaperend(
        By.css('#___reactour  button.zep-btn'),
        async element => {
          await element.click();
        },
      );

      const allItemBy = By.css(
        '.OrderTab__TabContainer-sc-15sey9p-0>div:nth-child(1)',
      );
      await this.untilAppear(allItemBy);
      // 点全部 同时清空搜索条件
      await this.driver.findElement(allItemBy).click();
      // 等加载
      const searchInputBy = By.css('input[placeholder=搜索订单ID]');
      await this.untilAppear(searchInputBy);
      const searchInput = this.driver.findElement(searchInputBy);

      // 搜索
      await searchInput.click();
      await searchInput.sendKeys(key);

      this.windows.windowHandles = await this.driver.getAllWindowHandles();

      await this.driver.sleep(this.waitTime);

      await this.driver.findElement(By.css('.i18n-icon-search')).click();
      await this.untilDisaperend(By.css('.arco-spin-loading'));

      // 点聊天
      await this.untilAppear(By.css('.index__chatIcon--SNjDl'));
      await this.driver
        .findElement(By.css('.index__ContactBuyerWrapper--eCQNn'))
        .click();

      if (preShop !== shop) {
        // 切换到已经有的窗口
        if (this.countryWindowMap.has(shop)) {
          const windowName = this.countryWindowMap.get(shop);
          await this.driver.switchTo().window(windowName);
          this.windows.current = windowName;
        } else {
          this.windows.current = await this.waitForWindow();
          this.countryWindowMap.set(shop, this.windows.current);
          await this.driver.switchTo().window(this.windows.current);
        }
      } else if (this.windows.windowHandles.length >= 2) {
        // 如果有两个以上窗口，切换到最后那个城市的窗口
        await this.driver.switchTo().window(this.windows.current);
        await this.untilDisaperend(
          By.css('.arco-message-wrapper.arco-message-wrapper-top'),
        );
      }

      preShop = shop;

      const commitTextBy = By.css('#chat-input-textarea textarea');
      // 等待发送框加载完成
      await this.untilAppear(commitTextBy);

      // 要点开确认框
      try {
        await this.driver
          .findElement(By.css('.arco-modal-footer button:nth-child(1)'))
          .click();
      } catch {
        console.log('正常存活');
      }

      try {
        await this.driver.findElement(By.css('.arco-modal-footer button'))
          .click;
      } catch {
        console.log('无开始框');
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
        if (lastChatContext.trim() !== translateContent.trim()) {
          // 点发送
          await this.driver.findElement(By.css('.chatd-button')).click();
        }
      } catch {
        // 新订单直接发送
        await this.driver.findElement(By.css('.chatd-button')).click();
      }
    } catch (e) {
      log.warn(e);
      throw new Error(key);
    } finally {
      await this.driver.switchTo().window(this.windows.windowHandles[0]);
    }
  }
}

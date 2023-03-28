import log from 'electron-log';
import { Run } from './Run';

const { By } = require('selenium-webdriver');

export class TiktokIndonesia extends Run {
  private passModal = false;

  protected async run(key: string, message: string) {
    try {
      try {
        if (!this.passModal) {
          const bankModalBy = By.css('.sc-kEjbxe button');
          await this.untilAppear(bankModalBy, async () => {
            await this.driver.findElement(bankModalBy).click();
          });
          await this.driver
            .findElement(By.css('.arco-modal-footer > button'))
            .click();

          console.log('没绑银行账号');
          this.passModal = true;
        }
      } catch {
        console.log('没问题');
      }

      const searchInputBy = By.css('input[placeholder="Enter an order ID"]');
      await this.untilAppear(searchInputBy);

      const searchInput = this.driver.findElement(searchInputBy);
      // 清空
      await this.driver
        .findElement(By.css('[data-tid="order.tabs.all"]'))
        .click();
      await this.driver.sleep(this.waitTime);
      await searchInput.click();
      await searchInput.sendKeys(key);
      // 点击搜索放大镜
      await this.driver.findElement(By.css('.i18n-icon-search')).click();
      await this.untilDisaperend(By.css('.arco-spin-loading'));
      // 获得所有窗口
      this.windows.windowHandles = await this.driver.getAllWindowHandles();

      if (await this.driver.findElement(By.css('.index__chatIcon--SNjDl')))
        await this.driver
          .findElement(By.css('.index__ContactBuyerWrapper--eCQNn'))
          .click();

      await this.driver.sleep(this.waitTime);
      const commitTextBy = By.css('#chat-input-textarea textarea');

      if (this.windows.windowHandles.length === 1) {
        this.windows.current = await this.waitForWindow();
        await this.driver.switchTo().window(this.windows.current);
        // 等待发送框加载完成
        await this.untilAppear(commitTextBy);
      } else if (this.windows.windowHandles.length === 2) {
        // 如果有两个窗口
        await this.driver.switchTo().window(this.windows.windowHandles.at(1)); // 切回聊天窗口
        await this.untilDisaperend(
          By.css('.arco-message-wrapper.arco-message-wrapper-top'),
        );
      }

      // 要点开确认框
      try {
        await this.driver
          .findElement(By.css('.arco-modal-footer button:nth-child(1)'))
          .click();
      } catch {
        console.log('正常存活');
      }

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
        if (lastChatContext.trim() !== message.trim()) {
          // 点聊天框
          const commitTextArea = await this.driver.findElement(commitTextBy);
          await commitTextArea.click();
          // 输入消息
          await commitTextArea.sendKeys(message);
          // 点发送
          await this.driver.findElement(By.css('.chatd-button')).click();
        }
      } catch {
        const commitTextArea = await this.driver.findElement(commitTextBy);
        await commitTextArea.click();
        // 输入消息
        await commitTextArea.sendKeys(message);
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

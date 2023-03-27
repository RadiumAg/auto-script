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
          await this.untilAppear(bankModalBy);
          await this.driver.findElement(bankModalBy).click();
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
      await searchInput.click();
      // 搜索
      await searchInput.clear();
      await searchInput.sendKeys(key);
      // 点击搜索放大镜
      await this.driver.findElement(By.css('.i18n-icon-search')).click();
      await this.untilDisaperend(By.css('.arco-spin-loading'));

      if (await this.driver.findElement(By.css('.index__chatIcon--SNjDl')))
        await this.driver
          .findElement(By.css('.index__ContactBuyerWrapper--eCQNn'))
          .click();
      this.windows.windowHandles = await this.driver.getAllWindowHandles();

      await this.driver.sleep(this.waitTime);

      if ((await this.driver.getAllWindowHandles()).length === 1) {
        this.windows.current = await this.waitForWindow();
        await this.driver.switchTo().window(this.windows.current);
      } else if ((await this.driver.getAllWindowHandles()).length === 2) {
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
    } catch (e) {
      log.warn(e);
      throw new Error(key);
    } finally {
      await this.driver.switchTo().window(this.windows.windowHandles[0]);
    }
  }
}

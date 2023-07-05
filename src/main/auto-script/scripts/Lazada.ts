import { warn } from 'electron-log';
import { By, Key } from 'selenium-webdriver';
import { Run } from './Run';

export class Lazada extends Run {
  async run(key: string, message: string, shop: string) {
    this.windows.windowHandles = await this.driver.getAllWindowHandles();

    const isOperatePage =
      /https:\/\/sellercenter-(ph|id|my|sg|th|vn)\.lazada-seller\.cn/.test(
        await this.driver.getCurrentUrl(),
      );

    if (!isOperatePage) {
      try {
        await this.untilAppear(By.linkText('订单'), async element => {
          await element.click();
        });
        await this.driver.sleep(this.waitTime);
        await this.driver.findElement(By.linkText('管理订单')).click();
      } catch (e) {
        warn(e);
      }

      try {
        this.windows.current = await this.waitForWindow();
        await this.driver.switchTo().window(this.windows.current);
      } catch (e) {
        warn(e);
      }

      // 切换商店
      await this.driver.sleep(this.waitTime);
      await this.driver.findElement(By.linkText(shop || '越南')).click();
      await this.driver.sleep(this.waitTime);
      // 点全部
      await this.driver.findElement(By.css(`[data-spm='d_nav_all']`)).click();
    }

    try {
      // 点搜
      const searchInput = await this.driver.findElement(
        By.css('[name=orderNumbers]'),
      );
      try {
        await this.driver.findElement(By.css('.next-tag-close-btn')).click();
      } catch {
        console.log('头一次没删除');
      }

      await searchInput.click();
      await searchInput.sendKeys(key);

      await this.driver
        .findElement(By.css('[data-spm="d_batch_search_button_search"]'))
        .click(); // 点搜索

      await this.driver.sleep(this.waitTime);

      this.windows.windowHandles = await this.driver.getAllWindowHandles();
      // 点聊天
      await this.driver.sleep(this.waitTime);
      await this.driver
        .findElement(By.css('[data-spm="d_button_chat"]'))
        .click();
      this.windows.current = await this.waitForWindow(4000);
      await this.driver.switchTo().window(this.windows.current);
      await this.driver.sleep(this.waitTime);

      // 关闭莫名其妙的通知
      try {
        await this.driver.findElement(By.css('.next-dialog-close')).click();
      } catch (e) {
        warn(e);
      }

      await this.driver.sleep(this.waitTime);
      // let lastMessage = '';

      // try {
      //   lastMessage = await this.driver
      //     .findElement(By.css('.message-item-from-self:last-of-type'))
      //     .getText();

      //   console.log(`最后一句话是${lastMessage}`);
      // } catch (e) {
      //   console.log('没讲话兄嘚');
      // }

      // if (lastMessage.trim() !== message) {
      //   await this.driver.sleep(this.waitTime);
      //   const commentTextarea = await this.driver.findElement(
      //     By.css('.message-textarea'),
      //   );
      //   await commentTextarea.click();
      //   await commentTextarea.sendKeys(message);

      //   // await this.driver
      //   //   .findElement(By.css('.im-ui-icon'))
      //   //   .click();

      //   // 关闭当前页，预防断线
      // }

      const commentTextarea = await this.driver.findElement(
        By.css('.message-textarea'),
      );
      await commentTextarea.click();
      await commentTextarea.sendKeys(message);
      await this.driver.actions().keyDown(Key.ENTER).perform();

      // 发送图片
      try {
        await this.driver
          .actions()
          .click(commentTextarea)
          .keyDown(Key.CONTROL)
          .sendKeys('v')
          .keyUp(Key.CONTROL)
          .perform();

        await this.driver.findElement(By.css('[data-spm=d_btn_send]')).click();
        await this.untilDisaperend(By.css('[data-spm=d_btn_send]'));
      } catch {
        console.log('没有发送的图片');
      }

      await this.driver.close();
    } catch (e) {
      warn(e);
      throw e;
    } finally {
      // 切回第二个页面
      await this.driver.switchTo().window(this.windows.windowHandles[1]);
    }
  }
}

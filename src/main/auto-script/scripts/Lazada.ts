import { warn } from 'electron-log';
import { By } from 'selenium-webdriver';
import { Run } from './Run';

export class Lazada extends Run {
  async run(key: string, message: string, shop: string) {
    this.untilDisaperend(By.linkText('订单'));
    this.windows.windowHandles = await this.driver.getAllWindowHandles();
    try {
      await this.driver.findElement(By.linkText('订单')).click();
      await this.driver.sleep(this.waitTime);
      await this.driver.findElement(By.linkText('管理订单')).click();
      await this.driver.sleep(this.waitTime);
    } catch (e) {
      warn(e);
    }

    try {
      this.windows.current = await this.waitForWindow();
      await this.driver.switchTo().window(this.windows.current);
    } catch (e) {
      warn(e);
    }

    try {
      // 切换商店
      await this.driver.sleep(this.waitTime);
      await this.driver.findElement(By.linkText(shop)).click();
      await this.driver.sleep(this.waitTime);
      // 点全部
      await this.driver
        .findElement(
          By.css('.next-tabs-tab-inner .aplus-auto-clk.aplus-auto-exp'),
        )
        .click();

      // 点搜
      const searchInput = await this.driver.findElement(
        By.css(
          'div.dada-filter-item.aplus-auto-clk.aplus-auto-exp.ordernumbers > span > input',
        ),
      );
      await searchInput.click();
      await this.driver.sleep(this.waitTime);
      await searchInput.sendKeys(key);
      await this.driver.sleep(this.waitTime);
      await this.driver
        .findElement(By.css('.action-btn:nth-child(1) > .next-btn'))
        .click();
      this.windows.windowHandles = await this.driver.getAllWindowHandles();
      await this.driver
        .findElement(By.css('.aplus-auto-exp:nth-child(1) > img'))
        .click();
      this.windows.current = await this.waitForWindow(4000);
      await this.driver.switchTo().window(this.windows.current);
      await this.driver.sleep(this.waitTime);
      try {
        await this.driver
          .findElement(
            By.css(
              'div.next-dialog.next-closeable.next-overlay-inner.notification-dialog > a',
            ),
          )
          .click();
      } catch (e) {
        warn(e);
      }
      await this.driver.sleep(this.waitTime);
      const commentTextarea = await this.driver.findElement(
        By.css('.message-textarea'),
      );
      await commentTextarea.click();
      await commentTextarea.sendKeys(message);
      await this.driver
        .findElement(By.css('.message-bottom-field svg'))
        .click();
    } catch (e) {
      // 切回第二个页面
      warn(e);
      throw e;
    } finally {
      await this.driver.switchTo().window(this.windows.windowHandles[1]);
    }
  }
}

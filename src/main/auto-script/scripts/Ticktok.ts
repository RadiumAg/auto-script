import log from 'electron-log';
import { Run } from './Run';

const { By } = require('selenium-webdriver');

export class TickTok extends Run {
  protected async run(key: string, message: string) {
    try {
      await this.driver.sleep(this.waitTime);
      await this.driver
        .findElement(
          By.css('.homepage_menu_submenu_3 > .arco-menu-inline-header'),
        )
        .click();
      await this.driver.sleep(this.waitTime);
      await this.driver.findElement(By.css('#menu_item_9 .flex')).click();
      await this.driver.sleep(this.waitTime);
      try {
        await this.driver.findElement(By.css('.zep-btn')).click();
      } catch (e) {
        log.warn(e);
      }
      await this.driver.sleep(this.waitTime);
      await this.driver.findElement(By.css('.arco-input')).click();
      await this.driver.findElement(By.css('.arco-input')).sendKeys(key);
      this.windows.windowHandles = await this.driver.getAllWindowHandles();
      await this.driver.sleep(this.waitTime);
      await this.driver.findElement(By.css('.i18n-icon-search')).click();
      await this.driver.sleep(this.waitTime);
      await this.driver
        .findElement(By.css('.index__ContactBuyerWrapper--gh2Js'))
        .click();
      await this.driver.sleep(this.waitTime);
      this.windows.current = await this.waitForWindow();
      await this.driver.switchTo().window(this.windows.current);
      await this.driver.sleep(this.waitTime);

      try {
        await this.driver
          .findElement(By.css('div.Lv_rwcjYyTLPpSiW4tn4 > button'))
          .click();
      } catch (e) {
        log.warn(e);
      }

      await this.driver.sleep(8000);

      // 过导航
      try {
        await this.untilDisaperend(
          By.css(
            '#___reactour > div:nth-child(4) > div > div.sc-bZQynM.dTLnoP > div > button.sc-bdVaJa.cYQqRL.sc-htpNat.fYzjNt > span > button',
          ),
          async element => {
            await element.click();
          },
        );
      } catch (e) {
        log.warn(e);
      }
      await this.driver.sleep(this.waitTime);
      await this.driver.findElement(By.css('.ecom-badge')).click();
      await this.driver.sleep(this.waitTime);
      const commitTextArea = await this.driver.findElement(
        By.css('textarea.ZoiXF7KMcmL6v1y6a7F8'),
      );
      await this.driver.sleep(this.waitTime);
      await commitTextArea.click();
      await commitTextArea.sendKeys(message);
      await this.driver.findElement(By.css('.chatd-button')).click();
      this.driver.close();
    } catch (e) {
      log.warn(e);
      throw new Error(key);
    } finally {
      await this.driver.switchTo().window(this.windows.windowHandles[0]);
    }
  }
}

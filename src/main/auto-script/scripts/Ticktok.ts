import { ThenableWebDriver } from 'selenium-webdriver';
import { Await } from '../type';
import { Run } from './Run';

const { By } = require('selenium-webdriver');

let driver: Await<ThenableWebDriver>;

export class TickTok extends Run {
  protected async run(key: string, message: string) {
    try {
      await this.driver
        .findElement(
          By.css('.homepage_menu_submenu_3 > .arco-menu-inline-header')
        )
        .click();
      await this.driver.findElement(By.css('#menu_item_9 .flex')).click();
      await this.driver.findElement(By.css('.arco-input')).click();
      await this.driver
        .findElement(By.css('.i18n-icon-search > path:nth-child(1)'))
        .click();
      await this.driver
        .findElement(By.css('.arco-input'))
        .sendKeys('576559106538703642');
      this.windows.windowHandles = await driver.getAllWindowHandles();
      await this.driver
        .findElement(By.css('.index__chatIcon--9e80F > path'))
        .click();
      this.windows.current = await this.waitForWindow();
      await this.driver.switchTo().window(this.windows.current);
      const commitTextArea = await this.driver.findElement(
        By.css('.ZoiXF7KMcmL6v1y6a7F8')
      );
      await commitTextArea.click();
      await commitTextArea.sendKeys(message);
      await this.driver.findElement(By.css('.chatd-button')).click();
    } catch {
      throw new Error(key);
    }
  }
}

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
      await this.driver.findElement(By.css('#menu_item_9 .flex')).click();
      try {
        const skipButton = await this.driver.findElement(By.css('.zep-btn'));
        skipButton.click();
      } catch (e) {
        console.warn(e);
      }
      await this.driver.findElement(By.css('.arco-input')).click();
      await this.driver.findElement(By.css('.arco-input')).sendKeys(key);
      this.windows.windowHandles = await this.driver.getAllWindowHandles();
      await this.driver.findElement(By.css('.i18n-icon-search')).click();
      await this.driver.sleep(this.waitTime);
      await this.driver.findElement(By.css('.index__chatIcon--9e80F')).click();
      this.windows.current = await this.waitForWindow();
      await this.driver.switchTo().window(this.windows.current);
      await this.driver.sleep(this.waitTime);
      const commitTextArea = await this.driver.findElement(
        By.css('.ZoiXF7KMcmL6v1y6a7F8'),
      );
      await commitTextArea.click();
      await commitTextArea.sendKeys(message);
      await this.driver.findElement(By.css('.chatd-button')).click();
    } catch (e) {
      console.log(e);
      throw new Error(key);
    }
  }
}

import { Run } from './Run';

export class Lazada extends Run {
  async run(key: string, message: string) {
    // Test name: Untitled
    // Step # | name | target | value
    // 1 | open | /portal/home/index |
    await this.driver.get('https://gsp.lazada-seller.cn/portal/home/index');
    // 2 | setWindowSize | 1936x1048 |
    await this.driver.manage().window().setRect({ width: 1936, height: 1048 });
    // 3 | click | linkText=订单 |
    await driver.findElement(By.linkText('订单')).click();
    // 4 | click | linkText=管理订单 |
    vars.windowHandles = await driver.getAllWindowHandles();
    // 5 | selectWindow | handle=${win8601} |
    await driver.findElement(By.linkText('管理订单')).click();
    // 6 | click | linkText=越南 |
    vars.win8601 = await waitForWindow(2000);
    // 7 | click | css=.next-tabs-tab:nth-child(1) .tab-badge > .aplus-auto-clk |
    await this.driver.switchTo().window(vars.win8601);
    // 8 | click | css=.next-focus > input |
    await driver.findElement(By.linkText('越南')).click();
    // 9 | type | css=.next-focus > input | 361203637310691
    await driver
      .findElement(
        By.css('.next-tabs-tab:nth-child(1) .tab-badge > .aplus-auto-clk'),
      )
      .click();
    // 10 | click | css=.action-btn:nth-child(1) > .next-btn |
    await driver.findElement(By.css('.next-focus > input')).click();
    // 11 | click | css=.aplus-auto-exp:nth-child(1) > img |
    await driver
      .findElement(By.css('.next-focus > input'))
      .sendKeys('361203637310691');
    // 12 | selectWindow | handle=${win962} |
    await driver
      .findElement(By.css('.action-btn:nth-child(1) > .next-btn'))
      .click();
    // 13 | click | css=.message-textarea |
    vars.windowHandles = await driver.getAllWindowHandles();
    // 14 | click | css=.message-bottom-field svg |
    await driver
      .findElement(By.css('.aplus-auto-exp:nth-child(1) > img'))
      .click();
    vars.win962 = await waitForWindow(2000);
    await this.driver.switchTo().window(vars.win962);
    await this.driver.findElement(By.css('.message-textarea')).click();
    await this.driver.findElement(By.css('.message-bottom-field svg')).click();
  }
}

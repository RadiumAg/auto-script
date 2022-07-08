import chalk from 'chalk';
import consola from 'consola';
import { Run } from './Run';

const { By } = require('selenium-webdriver');

enum EShop {
  马来西亚 = '马来西亚',
  菲律宾 = '菲律宾',
  泰国 = '泰国',
  越南 = '越南',
}

export class TickTokCross extends Run {
  protected async run(key: string, message: string, shop: EShop) {
    await this.driver.sleep(this.waitTime * 2);
    // 过导航（非必选）
    try {
      await this.driver
        .findElement(
          By.css(
            '#___reactour > div:nth-child(4) > div > div.sc-gKsewC.gnwqMi > div > button.sc-bdfBwQ.fpJIEd.sc-dlfnbm.eZA-DpQ > span > button',
          ),
        )
        .click();
      await this.driver.sleep(this.waitTime);
    } catch (e) {
      consola.log(chalk.yellow(e));
    }

    // 选店铺(必选)
    try {
      await this.driver
        .findElement(By.css('.index__nameContainer--W2iiF'))
        .click();

      switch (shop) {
        case EShop.马来西亚:
          await this.driver
            .findElement(
              By.css(
                '#root > div > div.layout__navbar--JaN0B > div > div:nth-child(4) > span > div.zep-popover-content.zep-popover-content-bottom > div > div > div > div > div > div.self-start.px-24 > span > label:nth-child(1)',
              ),
            )
            .click();
          break;

        case EShop.菲律宾:
          await this.driver
            .findElement(
              By.css(
                '#root > div > div.layout__navbar--JaN0B > div > div:nth-child(4) > span > div.zep-popover-content.zep-popover-content-bottom > div > div > div > div > div > div.self-start.px-24 > span > label:nth-child(2)',
              ),
            )
            .click();
          break;

        case EShop.泰国:
          await this.driver
            .findElement(
              By.css(
                '#root > div > div.layout__navbar--JaN0B > div > div:nth-child(4) > span > div.zep-popover-content.zep-popover-content-bottom > div > div > div > div > div > div.self-start.px-24 > span > label:nth-child(3)',
              ),
            )
            .click();
          break;

        case EShop.越南:
          await this.driver
            .findElement(
              By.css(
                '#root > div > div.layout__navbar--JaN0B > div > div:nth-child(4) > span > div.zep-popover-content.zep-popover-content-bottom > div > div > div > div > div > div.self-start.px-24 > span > label:nth-child(4)',
              ),
            )
            .click();
          break;

        default:
          break;
      }

      // 点订单
      await this.driver
        .findElement(
          By.css('.homepage_menu_submenu_3 > .arco-menu-inline-header'),
        )
        .click();
      await this.driver.sleep(this.waitTime);

      // 点订单
      await this.driver.findElement(By.css('#menu_item_9 .flex')).click();
      await this.driver.sleep(this.waitTime);
      try {
        // 过导航
        await this.driver.findElement(By.css('.zep-btn')).click();
      } catch (e) {
        console.log(e);
      }
      await this.driver.sleep(this.waitTime);

      // 点全部
      await this.driver
        .findElement(
          By.css(
            'div.OrderTab__TabContainer-sc-2a4d1v-1.dRBLKs.flex.space-x-12 > div:nth-child(1) > div > div',
          ),
        )
        .click();
      await this.driver.sleep(this.waitTime);
      await this.driver.sleep(this.waitTime);
      await this.driver.findElement(By.css('.arco-input')).click();
      // 搜索
      await this.driver.findElement(By.css('.arco-input')).sendKeys(key);
      this.windows.windowHandles = await this.driver.getAllWindowHandles();
      await this.driver.sleep(this.waitTime);
      await this.driver.findElement(By.css('.i18n-icon-search')).click();
      await this.driver.sleep(this.waitTime * 2);
      await this.driver
        .findElement(By.css('.index__ContactBuyerWrapper--gh2Js'))
        .click();
      await this.driver.sleep(this.waitTime);
      this.windows.current = await this.waitForWindow();
      await this.driver.switchTo().window(this.windows.current);
      await this.driver.sleep(this.waitTime);
      try {
        await this.driver
          .findElement(By.css('.Ex4p_d7E8a3_iy1qaklu button'))
          .click();
        await this.driver.sleep(this.waitTime * 1.2);
        await this.driver
          .findElement(
            By.css(
              '#___reactour button.sc-bdVaJa.cYQqRL.sc-bxivhb.jtXjuz.reactour__close',
            ),
          )
          .click();
      } catch (e) {
        consola.info(chalk.yellow(e));
      }
      await this.driver.sleep(this.waitTime);
      await this.driver.findElement(By.css('.ecom-badge')).click();
      await this.driver.sleep(this.waitTime);
      const commitTextArea = await this.driver.findElement(
        By.css('textarea.ZoiXF7KMcmL6v1y6a7F8'),
      );
      await this.driver.sleep(this.waitTime);
      await commitTextArea.click();
      // 发送消息
      await commitTextArea.sendKeys(message);
      await this.driver.findElement(By.css('.chatd-button')).click();
      // 切回去
      await this.driver.switchTo().window(this.windows.windowHandles[0]);
    } catch (e) {
      consola.info(chalk.yellow(e));
      throw new Error(key);
    }
  }
}

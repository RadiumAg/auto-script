import chalk from 'chalk';
import consola from 'consola';
import { Run } from './Run';

const { By } = require('selenium-webdriver');

enum EShop {
  马来西亚 = '马来西亚',
  菲律宾 = '菲律宾',
  泰国 = '泰国',
  越南 = '越南',
  英国 = '英国',
  新加坡 = '新加坡',
}

export class TickTokCross extends Run {
  protected async run(key: string, message: string, shop: EShop) {
    await this.driver.sleep(8000);

    // 过导航（非必选）
    try {
      await this.driver
        .findElement(
          By.css(
            '#___reactour > div:nth-child(4) > div > div.sc-gKsewC.gnwqMi > div > button.sc-bdfBwQ.fpJIEd.sc-dlfnbm.eZA-DpQ > span > button',
          ),
        )
        .click();
    } catch (e) {
      consola.warn(chalk.yellow(e));
    }

    await this.driver.sleep(this.waitTime);

    // 选店铺(必选)
    try {
      await this.driver
        .findElement(By.css('.index__nameContainer--W2iiF'))
        .click();

      switch (shop) {
        case EShop.英国:
          await this.driver
            .findElement(
              By.css(
                '#root > div > div.layout__navbar--JaN0B > div > div:nth-child(4) > span > div.zep-popover-content.zep-popover-content-bottom > div > div > div > div > div > div.self-start.px-24 > span > label:nth-child(1)',
              ),
            )
            .click();
          break;

        case EShop.马来西亚:
          await this.driver
            .findElement(
              By.css(
                '#root > div > div.layout__navbar--JaN0B > div > div:nth-child(4) > span > div.zep-popover-content.zep-popover-content-bottom > div > div > div > div > div > div.self-start.px-24 > span > label:nth-child(2)',
              ),
            )
            .click();
          break;

        case EShop.菲律宾:
          await this.driver
            .findElement(
              By.css(
                '#root > div > div.layout__navbar--JaN0B > div > div:nth-child(4) > span > div.zep-popover-content.zep-popover-content-bottom > div > div > div > div > div > div.self-start.px-24 > span > label:nth-child(3)',
              ),
            )
            .click();
          break;

        case EShop.新加坡:
          await this.driver
            .findElement(
              By.css(
                '#root > div > div.layout__navbar--JaN0B > div > div:nth-child(4) > span > div.zep-popover-content.zep-popover-content-bottom > div > div > div > div > div > div.self-start.px-24 > span > label:nth-child(4)',
              ),
            )
            .click();
          break;

        case EShop.泰国:
          await this.driver
            .findElement(
              By.css(
                '#root > div > div.layout__navbar--JaN0B > div > div:nth-child(4) > span > div.zep-popover-content.zep-popover-content-bottom > div > div > div > div > div > div.self-start.px-24 > span > label:nth-child(5)',
              ),
            )
            .click();
          break;

        case EShop.越南:
          await this.driver
            .findElement(
              By.css(
                '#root > div > div.layout__navbar--JaN0B > div > div:nth-child(4) > span > div.zep-popover-content.zep-popover-content-bottom > div > div > div > div > div > div.self-start.px-24 > span > label:nth-child(6)',
              ),
            )
            .click();
          break;

        default:
          break;
      }

      await this.driver.sleep(10000);

      // 点订单
      try {
        await this.driver.findElement(By.css('#menu_item_9 .flex')).click();
        await this.driver.sleep(this.waitTime);
      } catch (e) {
        await this.driver
          .findElement(
            By.css('.homepage_menu_submenu_3 > .arco-menu-inline-header'),
          )
          .click();
        await this.driver.sleep(this.waitTime);
        await this.driver.findElement(By.css('#menu_item_9 .flex')).click();
        consola.warn(chalk.yellow(e));
      }

      await this.driver.sleep(8000);
      try {
        // 过导航
        await this.driver.findElement(By.css('.zep-btn')).click();
      } catch (e) {
        consola.warn(chalk.yellow(e));
      }
      await this.driver.sleep(this.waitTime);

      // 点全部
      await this.driver
        .findElement(
          By.css('.OrderTab__TabContainer-sc-15sey9p-0>div:nth-child(1)'),
        )
        .click();

      // 等加载
      await this.driver.sleep(8000);
      const searchInput = this.driver.findElement(
        By.css('input[placeholder=搜索订单ID]'),
      );
      await searchInput.click();
      // 搜索
      await searchInput.sendKeys(key);
      this.windows.windowHandles = await this.driver.getAllWindowHandles();
      await this.driver.sleep(this.waitTime);
      await this.driver.findElement(By.css('.i18n-icon-search')).click();
      // 等加载
      await this.driver.sleep(8000);
      // 点聊天
      if (await this.driver.findElement(By.css('.index__chatIcon--SNjDl')))
        await this.driver
          .findElement(By.css('.index__ContactBuyerWrapper--eCQNn'))
          .click();
      await this.driver.sleep(8000);
      this.windows.current = await this.waitForWindow();
      await this.driver.switchTo().window(this.windows.current);
      await this.driver.sleep(this.waitTime);

      try {
        await this.driver
          .findElement(By.css('div.Lv_rwcjYyTLPpSiW4tn4 > button'))
          .click();
      } catch (e) {
        consola.info(chalk.yellow(e));
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
        consola.warn(chalk.yellow(e));
      }
      await this.driver.sleep(this.waitTime);
      await this.driver.findElement(By.css('.ecom-badge')).click();
      await this.driver.sleep(this.waitTime);
      // 点聊天框
      const commitTextArea = await this.driver.findElement(
        By.css('textarea.ZoiXF7KMcmL6v1y6a7F8'),
      );
      await this.driver.sleep(this.waitTime);
      await commitTextArea.click();
      // 输入消息
      await commitTextArea.sendKeys(message);
      // 点发送
      await this.driver.sleep(this.waitTime);
      await this.driver.findElement(By.css('.chatd-button')).click();
      // 关闭当前页，预防断线
      await this.driver.close();
    } catch (e) {
      consola.warn(chalk.yellow(e));
      throw new Error(key);
    } finally {
      await this.driver.switchTo().window(this.windows.windowHandles[0]);
    }
  }
}

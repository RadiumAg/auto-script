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

      // 点订单
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
          By.css(
            '#global_popup_container > div > div.flex-1.h-full > div.pb-16.relative.min-h-full > div:nth-child(3) > div > div > div > div:nth-child(1) > div > div.Tag-sc-kugf2q-0.bUsRrm.arco-tag.arco-tag-checkable.arco-tag-checked.arco-tag-size-default',
          ),
        )
        .click();
      // 等加载
      await this.driver.sleep(8000);
      const searchInput = this.driver.findElement(
        By.css(
          '#global_popup_container > div > div.flex-1.h-full > div.pb-16.relative.min-h-full > div:nth-child(3) > div > div > div > div.FilterArea__FilterAreaDiv-sc-1ys4yxj-0.cXSprD.relative > div.zep-space.zep-space-horizontal.zep-space-align-center.zep-space-wrap > div:nth-child(1) > div > div.i18n-ecom-input.arco-input-group-wrapper.arco-input-group-wrapper-default.arco-input-has-suffix > span > span > input',
        ),
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
      await this.driver
        .findElement(
          By.css('.index__content--3d9WJ.index__ContactBuyerBox--XnQgs'),
        )
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
      // 切回第一个聊天框
      await this.driver.switchTo().window(this.windows.windowHandles[0]);
    } catch (e) {
      consola.warn(chalk.yellow(e));
      await this.driver.switchTo().window(this.windows.windowHandles[0]);
      throw new Error(key);
    }
  }
}

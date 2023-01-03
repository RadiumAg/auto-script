import { By } from 'selenium-webdriver';
import { Run } from './Run';

export class Shopped extends Run {
  async run(key: string, message: string) {
    await this.driver.sleep(this.waitTime);
    const searchInput = await this.driver.findElement(
      By.css('input[placeholder=搜索全部]'),
    );
    await searchInput.click();
    await searchInput.clear();
    await searchInput.sendKeys(key);
    await this.driver.sleep(this.waitTime);
    try {
      await this.driver.findElement(By.css('.ID2dqy7mpC')).click();
      await this.driver.sleep(this.waitTime);
    } catch {
      throw new Error(key);
    }
    await this.driver.sleep(this.waitTime);
    try {
      try {
        const resetCommitEle = await this.driver.findElement(
          By.css('.KkePTkfUj9'),
        );
        await resetCommitEle.click();
        await this.driver.sleep(this.waitTime);
      } catch (e) {
        console.log(e instanceof Error && e.message);
      }
      const commitTeatarea = await this.driver.findElement(
        By.css('textarea[placeholder=发送讯息]'),
      );
      await commitTeatarea.click();
      await commitTeatarea.sendKeys(message);
      await this.driver.findElement(By.css('.kgP1yPCqxR')).click();
    } catch (e) {
      throw new Error(key);
    }
  }
}

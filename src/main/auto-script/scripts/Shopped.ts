import { By } from 'selenium-webdriver';
import { Run } from './Run';

export class Shopped extends Run {
  async run(key: string, message: string) {
    if ((await this.driver.getCurrentUrl()) !== this.operatePageUrl) {
      await this.driver.get(this.loginPageUrl);
    }

    await this.driver.sleep(this.waitTime);
    await this.driver.executeScript('window.scrollTo(0,0)');
    await this.driver.executeScript('window.scrollTo(0,0)');
    await this.driver.findElement(By.css('._3oQvjrwelQ')).click();
    try {
      await this.driver.findElement(By.css('._35r5VifQo2')).click();
    } catch (e) {
      console.warn(e instanceof Error && e.message);
    }
    await this.driver.findElement(By.css('._3oQvjrwelQ')).sendKeys(key);
    await this.driver.sleep(this.waitTime);
    try {
      await this.driver.findElement(By.css('._1iV-6HJRtq')).click();
      await this.driver.executeScript('window.scrollTo(0,0)');
      await this.driver.sleep(this.waitTime);
    } catch {
      throw new Error(key);
    }
    try {
      try {
        const resetCommitEle = await this.driver.findElement(
          By.css('._2AOBj87MlbPlgdDbOTyrB8'),
        );
        if (resetCommitEle) {
          await resetCommitEle.click();
          await this.driver.sleep(this.waitTime);
        }
      } catch (e) {
        console.log(e instanceof Error && e.message);
      }
      const commitTeatarea = await this.driver.findElement(
        By.css('._1L56qVWs5lICF9a2voCfDg'),
      );
      await commitTeatarea.click();
      await commitTeatarea.sendKeys(message);
      await this.driver
        .findElement(By.css('._3kEAcT1Mk5._2sWp7oBoR7zs8t1v8TtDX3'))
        .click();
      await this.driver.executeScript('window.scrollTo(0,0)');
    } catch (e) {
      throw new Error(key);
    }
  }
}

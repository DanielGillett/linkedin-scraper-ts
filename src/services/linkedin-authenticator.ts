import { Page } from 'puppeteer';
import { IAuthenticator } from '../interfaces/browser.interface.js';
import { logger } from '../utils/logger.js';
import { delay } from '../utils/helpers.js';

export class LinkedInAuthenticator implements IAuthenticator {
  private page: Page | null = null;

  async login(email: string, password: string): Promise<void> {
    if (!this.page) {
      throw new Error('Page not initialized');
    }

    try {
      await this.page.goto('https://www.linkedin.com/login', {
        waitUntil: 'networkidle0',
        timeout: 30000
      });

      await delay(Math.random() * 1000 + 500);
      await this.page.type('#username', email, { delay: 100 });
      
      await delay(Math.random() * 800 + 200);
      await this.page.type('#password', password, { delay: 150 });
      
      await delay(Math.random() * 500 + 200);
      await this.page.click('button[type="submit"]');
      
      await this.page.waitForNavigation({ 
        waitUntil: 'networkidle0',
        timeout: 30000
      });

      logger.info('Successfully logged in to LinkedIn');
    } catch (error) {
      logger.error('Login failed');
      throw error;
    }
  }

  setPage(page: Page) {
    this.page = page;
  }
}
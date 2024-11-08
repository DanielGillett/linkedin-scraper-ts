import { Browser, Page } from 'puppeteer';
import { BrowserConfig, IBrowserManager } from '../interfaces/browser.interface.js';
import { createBrowser } from '../config/browser.js';
import { FIREFOX_USER_AGENT } from '../config/constants.js';
import { logger } from '../utils/logger.js';

export class BrowserManager implements IBrowserManager {
  private browser: Browser | null = null;
  private page: Page | null = null;

  async initialize(config: BrowserConfig = {}): Promise<void> {
    try {
      this.browser = await createBrowser({
        headless: config.headless ?? 'shell',
        userAgent: config.userAgent,
        viewport: config.viewport
      });
      this.page = await this.browser.newPage();
      
      await this.setupPage();
      logger.info('Browser initialized with stealth configuration');
    } catch (error) {
      logger.error('Failed to initialize browser');
      throw error;
    }
  }

  private async setupPage(): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');

    await this.page.setUserAgent(FIREFOX_USER_AGENT);
    await this.page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1'
    });
  }

  async getPage(): Promise<Page> {
    if (!this.page) throw new Error('Browser not initialized');
    return this.page;
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
      logger.info('Browser closed successfully');
    }
  }
}
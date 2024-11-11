import { Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker';
import type { Browser, Page } from 'puppeteer';
import { BrowserConfig } from '../interfaces/browser-config.interface';

@Injectable()
export class BrowserService {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private readonly DEFAULT_APP_TIMEOUT = 300000 // 5 minutes
  private readonly DEFAULT_NAV_TIMEOUT = 75000  // 125 minutes

  constructor() {
    try {
      puppeteer.use(StealthPlugin());
      puppeteer.use(AdblockerPlugin());
    } catch (error) {
      console.error('Failed to initialize Puppeteer plugins:', error);
    }
  }

  async initialize(config: BrowserConfig = {}): Promise<void> {
    try {
      this.browser = await puppeteer.launch({
        headless: config.headless ?? 'shell',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-infobars',
          '--window-position=0,0',
          '--ignore-certificate-errors',
          '--ignore-certificate-errors-spki-list',
        ],
        defaultViewport: config.viewport ?? { width: 1920, height: 1080 },
      })

      this.page = await this.browser.newPage()

      // Set longer timeouts for navigation and waiting
      this.page.setDefaultTimeout(this.DEFAULT_APP_TIMEOUT)
      this.page.setDefaultNavigationTimeout(this.DEFAULT_NAV_TIMEOUT)

      await this.setupPage(config.userAgent);
    } catch (error) {
      console.error('Failed to initialize browser:', error);
      throw error;
    }
  }

  private async setupPage(userAgent?: string): Promise<void> {
    if (!this.page) {
      throw new Error('Page not initialized');
    }

    try {
      if (userAgent) {
        await this.page.setUserAgent(userAgent);
      }

      await this.page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      });
    } catch (error) {
      console.error('Failed to setup page:', error);
      throw error;
    }
  }

  getPage(): Page {
    if (!this.page) {
      throw new Error('Browser not initialized');
    }
    return this.page;
  }

  async close(): Promise<void> {
    if (this.browser) {
      try {
        await this.browser.close();
      } catch (error) {
        console.error('Failed to close browser:', error);
      } finally {
        this.browser = null;
        this.page = null;
      }
    }
  }
}
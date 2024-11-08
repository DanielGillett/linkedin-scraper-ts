import puppeteer, { Browser, PuppeteerLaunchOptions } from 'puppeteer';
import { BrowserConfig } from '../interfaces/browser.interface.js';
import { logger } from '../utils/logger.js';

export async function createBrowser(config: BrowserConfig = {}): Promise<Browser> {
  try {
    const options: PuppeteerLaunchOptions = {
      headless: 'shell',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-infobars',
        '--window-position=0,0',
        '--ignore-certificate-errors',
        '--ignore-certificate-errors-spki-list',
      ],
      defaultViewport: config.viewport
    };

    const browser = await puppeteer.launch(options);
    logger.info('Browser launched successfully');
    return browser;
  } catch (error) {
    logger.error('Failed to launch browser');
    throw error;
  }
}
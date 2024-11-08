import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import type { Browser, PuppeteerLaunchOptions } from 'puppeteer';
import { FIREFOX_USER_AGENT, VIEWPORT } from './constants.js';
import { logger } from '../utils/logger.js';

export { FIREFOX_USER_AGENT, VIEWPORT };

export interface BrowserConfig {
  headless?: boolean | 'shell';
  userAgent?: string;
  viewport?: {
    width: number;
    height: number;
  };
}

export async function createBrowser(config: BrowserConfig = {}): Promise<Browser> {
  puppeteer.use(StealthPlugin());

  const options: PuppeteerLaunchOptions = {
    headless: config.headless ?? 'shell',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-infobars',
      '--window-position=0,0',
      '--ignore-certificate-errors',
      '--ignore-certificate-errors-spki-list',
    ],
    defaultViewport: config.viewport ?? VIEWPORT
  };

  const browser = await puppeteer.launch(options);
  const page = await browser.newPage();
  
  await page.setUserAgent(config.userAgent ?? FIREFOX_USER_AGENT);
  await page.setViewport(config.viewport ?? VIEWPORT);

  logger.info('Browser initialized with stealth configuration');
  return browser;
}
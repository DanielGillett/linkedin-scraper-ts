import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker';
import type { Browser, Page } from 'puppeteer';
import type { Config } from '../types/config.js';
import { JobResult } from '../types/job.js';

export class LinkedInScraper {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private readonly config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    puppeteer.use(StealthPlugin());
    puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

    this.browser = await puppeteer.launch({
      headless: this.config.headless,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-infobars',
        '--window-position=0,0',
        '--ignore-certificate-errors',
        '--ignore-certificate-errors-spki-list',
      ],
      defaultViewport: { width: 1920, height: 1080 }
    });

    this.page = await this.browser.newPage();
    await this.page.setUserAgent(this.config.userAgent);
  }

  async login(): Promise<void> {
    if (!this.page) throw new Error('Browser not initialized');

    await this.page.goto('https://www.linkedin.com/login');
    await this.page.type('#username', this.config.linkedinEmail);
    await this.page.type('#password', this.config.linkedinPassword);
    await this.page.click('button[type="submit"]');
    await this.page.waitForNavigation();
  }

  async searchJobs(query: string): Promise<JobResult[]> {
    if (!this.page) throw new Error('Browser not initialized');

    await this.page.goto(`https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(query)}`);
    await this.page.waitForSelector('.jobs-search__results-list');

    return await this.page.evaluate(() => {
      const jobs = document.querySelectorAll('.jobs-search__results-list > li');
      return Array.from(jobs).map(job => {
        const titleElement = job.querySelector('.job-card-list__title');
        const companyElement = job.querySelector('.job-card-container__company-name');
        const locationElement = job.querySelector('.job-card-container__metadata-item');
        const linkElement = job.querySelector('.job-card-list__title');

        return {
          title: titleElement?.textContent?.trim() || '',
          company: companyElement?.textContent?.trim() || '',
          location: locationElement?.textContent?.trim() || '',
          link: (linkElement as HTMLAnchorElement)?.href || '',
        };
      });
    });
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
  }
}
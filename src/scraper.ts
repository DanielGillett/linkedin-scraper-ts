import { Browser, Page } from 'puppeteer';
import { ILinkedInScraper, IScraperConfig } from './interfaces/scraper.interface.js';
import { BrowserManager } from './services/browser-manager.js';
import { LinkedInAuthenticator } from './services/linkedin-authenticator.js';
import { JobScraper } from './scraper/job-scraper.js';
import { JobListing, SearchFilters } from './types/index.js';
import { logger } from './utils/logger.js';

export class LinkedInScraper implements ILinkedInScraper {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private jobScraper: JobScraper | null = null;
  private browserManager: BrowserManager;
  private authenticator: LinkedInAuthenticator;

  constructor() {
    this.browserManager = new BrowserManager();
    this.authenticator = new LinkedInAuthenticator();
  }

  async initialize(config: IScraperConfig = {}) {
    try {
      await this.browserManager.initialize({
        headless: 'shell',
        ...config
      });
      
      this.page = await this.browserManager.getPage();
      this.jobScraper = new JobScraper(this.page);
      this.authenticator.setPage(this.page);
      
      logger.info('LinkedIn scraper initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize scraper');
      throw error;
    }
  }

  async login(email: string, password: string): Promise<void> {
    if (!this.page) throw new Error('Scraper not initialized');
    await this.authenticator.login(email, password);
  }

  async searchJobs(query: string, filters?: SearchFilters, maxJobs?: number): Promise<JobListing[]> {
    if (!this.jobScraper) throw new Error('Scraper not initialized');
    return this.jobScraper.searchJobs(query, filters, maxJobs);
  }

  async getJobDetails(jobUrl: string): Promise<Partial<JobListing>> {
    if (!this.jobScraper) throw new Error('Scraper not initialized');
    return this.jobScraper.getJobDetails(jobUrl);
  }

  async close(): Promise<void> {
    await this.browserManager.close();
  }
}
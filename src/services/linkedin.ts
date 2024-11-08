import type { Browser, Page } from 'puppeteer';
import { LINKEDIN_LOGIN_URL, LINKEDIN_JOBS_URL } from '../config/constants.js';
import { logger } from '../utils/logger.js';
import { delay } from '../utils/helpers.js';
import { JobListing } from '../types/index.js';

export class LinkedInService {
  private browser: Browser;
  private page!: Page;

  constructor(browser: Browser) {
    this.browser = browser;
  }

  async init(): Promise<void> {
    this.page = await this.browser.newPage();
    logger.info('LinkedIn service initialized');
  }

  async login(email: string, password: string): Promise<void> {
    try {
      await this.page.goto(LINKEDIN_LOGIN_URL);
      await this.page.waitForSelector('#username');
      
      await delay(Math.random() * 1000 + 500);
      await this.page.type('#username', email, { delay: 100 });
      
      await delay(Math.random() * 800 + 200);
      await this.page.type('#password', password, { delay: 150 });
      
      await Promise.all([
        this.page.waitForNavigation(),
        this.page.click('[type="submit"]')
      ]);
      
      logger.info('Successfully logged into LinkedIn');
    } catch (error) {
      logger.error(`Login failed: ${error}`);
      throw error;
    }
  }

  async searchJobs(query: string): Promise<JobListing[]> {
    try {
      await this.page.goto(LINKEDIN_JOBS_URL);
      await this.page.waitForSelector('.jobs-search-box__text-input');
      
      await this.page.type('.jobs-search-box__text-input', query);
      await Promise.all([
        this.page.waitForNavigation(),
        this.page.keyboard.press('Enter')
      ]);

      // Wait for job listings to load
      await this.page.waitForSelector('.scaffold-layout__list-container');
      await delay(2000); // Allow time for dynamic content to load

      // Scroll through the job list to load all jobs
      await this.scrollJobList();

      const jobs = await this.extractJobListings();
      
      // Display jobs in console
      logger.info(`\nFound ${jobs.length} jobs for query: "${query}"\n`);
      jobs.forEach((job, index) => {
        logger.info(`Job ${index + 1}:`);
        logger.info(`🏢 Company: ${job.company}`);
        logger.info(`💼 Title: ${job.title}`);
        logger.info(`📍 Location: ${job.location}`);
        if (job.salary) logger.info(`💰 Salary: ${job.salary}`);
        if (job.jobType) logger.info(`⏰ Type: ${job.jobType}`);
        if (job.postedDate) logger.info(`📅 Posted: ${job.postedDate}`);
        logger.info(`🔗 Link: ${job.link}\n`);
      });

      return jobs;
    } catch (error) {
      logger.error(`Failed to search jobs: ${error}`);
      throw error;
    }
  }

  private async scrollJobList(): Promise<void> {
    try {
      const listContainer = '.jobs-search-results-list';
      await this.page.waitForSelector(listContainer);

      let previousHeight = 0;
      let currentHeight = await this.page.evaluate(() => {
        const element = document.querySelector('.jobs-search-results-list');
        return element?.scrollHeight || 0;
      });
      
      while (previousHeight !== currentHeight) {
        previousHeight = currentHeight;
        
        await this.page.evaluate((selector, scrollHeight) => {
          const element = document.querySelector(selector);
          if (element) element.scrollTo(0, scrollHeight);
        }, listContainer, currentHeight);
        
        await delay(1000); // Wait for new content to load
        
        currentHeight = await this.page.evaluate(() => {
          const element = document.querySelector('.jobs-search-results-list');
          return element?.scrollHeight || 0;
        });
      }

      // Scroll back to top
      await this.page.evaluate((selector) => {
        const element = document.querySelector(selector);
        if (element) element.scrollTo(0, 0);
      }, listContainer);
      
      await delay(500);
      
    } catch (error) {
      logger.error(`Failed to scroll job list: ${error}`);
    }
  }

  private async extractJobListings(): Promise<JobListing[]> {
    return this.page.evaluate(() => {
      const jobCards = document.querySelectorAll('.jobs-search-results__list-item');
      return Array.from(jobCards).map(card => {
        const titleEl = card.querySelector('.job-card-list__title');
        const companyEl = card.querySelector('.job-card-container__company-name');
        const locationEl = card.querySelector('.job-card-container__metadata-item');
        const salaryEl = card.querySelector('.job-card-container__salary-info');
        const jobTypeEl = card.querySelector('.job-card-container__workplace-type');
        const postedEl = card.querySelector('time');
        const linkEl = card.querySelector('.job-card-list__title');

        return {
          title: titleEl?.textContent?.trim() || '',
          company: companyEl?.textContent?.trim() || '',
          location: locationEl?.textContent?.trim() || '',
          salary: salaryEl?.textContent?.trim() || undefined,
          jobType: jobTypeEl?.textContent?.trim() || undefined,
          link: (linkEl as HTMLAnchorElement)?.href || '',
          postedDate: postedEl?.getAttribute('datetime') || undefined
        };
      });
    });
  }

  async close(): Promise<void> {
    await this.browser.close();
    logger.info('Browser closed');
  }
}
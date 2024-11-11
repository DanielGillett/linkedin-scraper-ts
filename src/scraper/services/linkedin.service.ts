import { Injectable, Logger } from '@nestjs/common';
import { BrowserService } from './browser.service';
import { JobListing } from '../interfaces/job-listing.interface';
import { SearchFilters } from '../interfaces/search-filters.interface';
import { delay } from '../utils/helpers';
import { Page } from 'puppeteer';

@Injectable()
export class LinkedInService {
  private readonly logger = new Logger(LinkedInService.name);
  private isLoggedIn = false;

  constructor(private readonly browserService: BrowserService) {}

  async login(email: string, password: string): Promise<void> {
    if (this.isLoggedIn) {
      return; // Skip if already logged in
    }

    const page = this.browserService.getPage();

    try {
      await page.goto('https://www.linkedin.com/login', {
        waitUntil: 'networkidle0',
        timeout: 30000,
      });

      await delay(Math.random() * 1000 + 500);
      await page.type('#username', email, { delay: 100 });

      await delay(Math.random() * 800 + 200);
      await page.type('#password', password, { delay: 150 });

      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle0' }),
        page.click('button[type="submit"]'),
      ]);

      this.isLoggedIn = true;
      this.logger.log('Successfully logged in to LinkedIn');
    } catch (error) {
      this.logger.error('Login failed', error);
      throw error;
    }
  }

  async searchJobs(
    query: string,
    filters: SearchFilters = {},
    maxJobs = 25,
  ): Promise<JobListing[]> {
    const page = this.browserService.getPage();
    const searchUrl = this.buildSearchUrl(query, filters);

    try {
      console.log(`Navigating to search URL for query: ${query}`);
      await page.goto(searchUrl, { waitUntil: 'networkidle0' });
      await page.waitForSelector('.jobs-search__results-list');

      const jobs: JobListing[] = [];
      let loadedJobs = 0;

      while (loadedJobs < maxJobs) {
        await page.evaluate(() => {
          window.scrollTo(0, document.body.scrollHeight);
        });
        await delay(1000);

        const newJobs = await this.extractVisibleJobs(page);
        jobs.push(...newJobs);

        loadedJobs = jobs.length;
        console.log(`Loaded ${loadedJobs} jobs so far`);

        if (loadedJobs >= maxJobs) break;

        try {
          await page.click('.infinite-scroller__show-more-button');
          await delay(1000);
        } catch {
          break;
        }
      }

      const finalJobs = jobs.slice(0, maxJobs).map(job => new JobListing(job));
      console.log('Job search completed successfully');
      return finalJobs;
    } catch (error) {
      this.logger.error('Failed to search jobs', error);
      throw error;
    }
  }

  private buildSearchUrl(query: string, filters: SearchFilters = {}): string {
    const baseUrl = 'https://www.linkedin.com/jobs/search/?keywords=';
    const searchParams = new URLSearchParams();

    searchParams.append('keywords', query);

    if (filters.location) {
      searchParams.append('location', filters.location);
    }

    if (filters.datePosted) {
      const dateMap: Record<string, string> = {
        past_24h: 'r86400',
        past_week: 'r604800',
        past_month: 'r2592000',
      };
      searchParams.append('f_TPR', dateMap[filters.datePosted] || '');
    }

    if (filters.jobType?.length) {
      filters.jobType.forEach((type) => {
        searchParams.append('f_JT', type);
      });
    }

    return `${baseUrl}${searchParams.toString()}`;
  }

  private async extractVisibleJobs(page: Page): Promise<JobListing[]> {
    return page.$$eval(
      '.jobs-search__results-list > li',
      (elements: Element[]) =>
        elements.map((el: Element) => {
          const titleElement = el.querySelector('.job-card-list__title');
          const companyElement = el.querySelector(
            '.job-card-container__company-name',
          );
          const locationElement = el.querySelector(
            '.job-card-container__metadata-item',
          );
          const linkElement = el.querySelector('.job-card-list__title');

          return {
            title: titleElement?.textContent?.trim() || '',
            company: companyElement?.textContent?.trim() || '',
            location: locationElement?.textContent?.trim() || '',
            link: (linkElement as HTMLAnchorElement)?.href || '',
          };
        }),
    );
  }
}
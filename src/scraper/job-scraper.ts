import type { Page } from 'puppeteer';
import { JobListing, SearchFilters } from '../types/index.js';
import { logger } from '../utils/logger.js';
import { delay } from '../utils/helpers.js';

export class JobScraper {
  constructor(private page: Page) {}

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
        past_month: 'r2592000'
      };
      searchParams.append('f_TPR', dateMap[filters.datePosted] || '');
    }
    
    if (filters.jobType?.length) {
      filters.jobType.forEach(type => {
        searchParams.append('f_JT', type);
      });
    }
    
    if (filters.experienceLevel?.length) {
      filters.experienceLevel.forEach(level => {
        searchParams.append('f_E', level);
      });
    }

    if (filters.onSite?.length) {
      filters.onSite.forEach(type => {
        searchParams.append('f_WT', type);
      });
    }

    return `${baseUrl}${searchParams.toString()}`;
  }

  async searchJobs(query: string, filters: SearchFilters = {}, maxJobs = 25): Promise<JobListing[]> {
    try {
      const searchUrl = this.buildSearchUrl(query, filters);
      await this.page.goto(searchUrl, { waitUntil: 'networkidle0' });
      
      const jobs: JobListing[] = [];
      let loadedJobs = 0;

      while (loadedJobs < maxJobs) {
        await this.page.evaluate(() => {
          window.scrollTo(0, document.body.scrollHeight);
        });
        await delay(1000);

        const newJobs = await this.extractVisibleJobs();
        jobs.push(...newJobs);
        
        loadedJobs = jobs.length;
        
        try {
          await this.page.click('.infinite-scroller__show-more-button');
          await delay(1000);
        } catch {
          break;
        }
      }

      return jobs.slice(0, maxJobs);
    } catch (error) {
      logger.error('Failed to search jobs', error);
      throw error;
    }
  }

  private async extractVisibleJobs(): Promise<JobListing[]> {
    return this.page.$$eval('.jobs-search__results-list > li', (elements: Element[]) =>
      elements.map((el: Element): JobListing => {
        const titleEl = el.querySelector('.job-card-list__title');
        const companyEl = el.querySelector('.job-card-container__company-name');
        const locationEl = el.querySelector('.job-card-container__metadata-item');
        const linkEl = el.querySelector('.job-card-list__title');
        
        return {
          title: titleEl?.textContent?.trim() || '',
          company: companyEl?.textContent?.trim() || '',
          location: locationEl?.textContent?.trim() || '',
          link: (linkEl as HTMLAnchorElement)?.href || '',
        };
      })
    );
  }

  async getJobDetails(jobUrl: string): Promise<Partial<JobListing>> {
    try {
      await this.page.goto(jobUrl, { waitUntil: 'networkidle0' });
      
      const details = await this.page.evaluate(() => {
        const description = document.querySelector('.job-view-layout')?.textContent?.trim();
        const salary = document.querySelector('.compensation__salary-range')?.textContent?.trim();
        const postedDate = document.querySelector('.posted-time-ago__text')?.textContent?.trim();
        const jobType = document.querySelector('.job-details-jobs-unified-top-card__job-type')?.textContent?.trim();
        const applicants = document.querySelector('.num-applicants__caption')?.textContent?.trim();
        
        return {
          description,
          salary,
          postedDate,
          jobType,
          applicants,
        };
      });

      return details;
    } catch (error) {
      logger.error('Failed to get job details', error);
      throw error;
    }
  }
}
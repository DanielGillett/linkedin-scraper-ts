import { ILinkedInScraper, IScraperConfig } from '../interfaces/scraper.interface.js';
import { JobListing, SearchFilters } from '../types/index.js';
import { LinkedInScraper } from '../scraper.js';
import { logger } from '../utils/logger.js';

export async function createScraper(
  config: IScraperConfig = {}
): Promise<ILinkedInScraper> {
  try {
    const scraper = new LinkedInScraper();
    await scraper.initialize({
      headless: 'shell',
      ...config
    });
    return scraper;
  } catch (error) {
    logger.error('Failed to initialize scraper');
    throw error;
  }
}

export type { JobListing, SearchFilters, IScraperConfig };
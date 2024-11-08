import { JobListing, SearchFilters } from '../types/index.js';

export interface IScraperConfig {
  headless?: boolean | 'shell';
  userAgent?: string;
  viewport?: {
    width: number;
    height: number;
  };
}

export interface ILinkedInScraper {
  initialize(config?: IScraperConfig): Promise<void>;
  login(email: string, password: string): Promise<void>;
  searchJobs(query: string, filters?: SearchFilters, maxJobs?: number): Promise<JobListing[]>;
  getJobDetails(jobUrl: string): Promise<Partial<JobListing>>;
  close(): Promise<void>;
}
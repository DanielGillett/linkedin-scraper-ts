import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BrowserService } from './services/browser.service';
import { LinkedInService } from './services/linkedin.service';
import { SearchJobsDto } from './dto/search-jobs.dto';
import { JobListing } from './interfaces/job-listing.interface';

@Injectable()
export class ScraperService implements OnModuleInit, OnModuleDestroy {
  constructor(
    private readonly configService: ConfigService,
    private readonly browserService: BrowserService,
    private readonly linkedInService: LinkedInService,
  ) {}

  async onModuleInit() {
    // Only initialize the browser
    await this.browserService.initialize({
      headless: this.configService.get<boolean>('linkedin.headless'),
      userAgent: this.configService.get<string>('linkedin.userAgent'),
    });
    console.log('Browser initialized and ready for requests');
  }

  async onModuleDestroy() {
    await this.browserService.close();
  }

  async searchJobs(searchJobsDto: SearchJobsDto): Promise<JobListing[]> {
    try {
      // Login only when a search request is made
      const email = this.configService.get<string>('linkedin.email');
      const password = this.configService.get<string>('linkedin.password');
      
      if (!email || !password) {
        throw new Error('LinkedIn credentials not configured');
      }

      await this.linkedInService.login(email, password);
      console.log('Starting job search for query:', searchJobsDto.query);
      
      const jobs = await this.linkedInService.searchJobs(
        searchJobsDto.query,
        searchJobsDto.filters,
        searchJobsDto.maxJobs,
      );

      console.log(`Found ${jobs.length} jobs matching the search criteria`);
      return jobs;
    } catch (error) {
      console.error('Error during job search:', error);
      throw error;
    }
  }
}
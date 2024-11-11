import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ScraperService } from './scraper.service';
import { SearchJobsDto } from './dto/search-jobs.dto';
import { JobListing } from './interfaces/job-listing.interface';
import { AuthGuard } from './guards/auth.guard';

@ApiTags('scraper')
@Controller('scraper')
@UseGuards(AuthGuard)
export class ScraperController {
  constructor(private readonly scraperService: ScraperService) {}

  @Get('jobs')
  @ApiOperation({ summary: 'Search for jobs on LinkedIn' })
  @ApiResponse({ status: 200, description: 'Returns job listings', type: [JobListing] })
  async searchJobs(@Query() searchJobsDto: SearchJobsDto): Promise<JobListing[]> {
    return this.scraperService.searchJobs(searchJobsDto);
  }
}
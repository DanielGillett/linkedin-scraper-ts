import { Module } from '@nestjs/common';
import { ScraperController } from './scraper.controller';
import { ScraperService } from './scraper.service';
import { BrowserService } from './services/browser.service';
import { LinkedInService } from './services/linkedin.service';

@Module({
  controllers: [ScraperController],
  providers: [ScraperService, BrowserService, LinkedInService],
})
export class ScraperModule {}
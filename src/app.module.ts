import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScraperModule } from './scraper/scraper.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ScraperModule,
  ],
})
export class AppModule {}
import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SearchFilters } from '../interfaces/search-filters.interface';

export class SearchJobsDto {
  @ApiProperty({ description: 'Search query for jobs' })
  @IsString()
  query!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  filters?: SearchFilters;

  @ApiProperty({ required: false, minimum: 1, maximum: 100, default: 25 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  maxJobs?: number = 25;
}
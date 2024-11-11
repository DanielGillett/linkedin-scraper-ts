import { ApiProperty } from '@nestjs/swagger';

export class JobListing {
  @ApiProperty()
  title!: string;

  @ApiProperty()
  company!: string;

  @ApiProperty()
  location!: string;

  @ApiProperty()
  link!: string;

  @ApiProperty({ required: false })
  salary?: string;

  @ApiProperty({ required: false })
  jobType?: string;

  @ApiProperty({ required: false })
  postedDate?: string;

  @ApiProperty({ required: false })
  applicants?: string;

  constructor(partial: Partial<JobListing>) {
    Object.assign(this, partial);
  }
}
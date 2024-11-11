export interface SearchFilters {
  location?: string;
  datePosted?: 'past_24h' | 'past_week' | 'past_month';
  jobType?: ('full_time' | 'part_time' | 'contract' | 'temporary' | 'internship' | 'volunteer')[];
  experienceLevel?: ('internship' | 'entry' | 'associate' | 'mid_senior' | 'director' | 'executive')[];
  onSite?: ('remote' | 'hybrid' | 'on_site')[];
}
export interface LinkedInProfile {
  name: string;
  headline?: string;
  location?: string;
  about?: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
}

export interface Experience {
  title: string;
  company: string;
  duration?: string;
  location?: string;
  description?: string;
}

export interface Education {
  school: string;
  degree?: string;
  field?: string;
  duration?: string;
}

export interface JobListing {
  title: string;
  company: string;
  location: string;
  link: string;
  description?: string;
  salary?: string;
  postedDate?: string;
  jobType?: string;
  applicants?: string;
}

export interface SearchFilters {
  location?: string;
  datePosted?: 'any' | 'past_24h' | 'past_week' | 'past_month';
  jobType?: ('full_time' | 'part_time' | 'contract' | 'temporary' | 'internship' | 'volunteer')[];
  experienceLevel?: ('internship' | 'entry' | 'associate' | 'mid_senior' | 'director' | 'executive')[];
  onSite?: ('remote' | 'hybrid' | 'on_site')[];
}
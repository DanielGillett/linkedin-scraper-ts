export interface BrowserConfig {
  headless?: boolean | 'shell';
  userAgent?: string;
  viewport?: {
    width: number;
    height: number;
  };
}
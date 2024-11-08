import type { Page } from 'puppeteer';

export interface BrowserConfig {
  headless?: boolean | 'shell';
  userAgent?: string;
  viewport?: {
    width: number;
    height: number;
  };
}

export interface IBrowserManager {
  initialize(config?: BrowserConfig): Promise<void>;
  getPage(): Promise<Page>;
  close(): Promise<void>;
}

export interface IAuthenticator {
  login(email: string, password: string): Promise<void>;
}
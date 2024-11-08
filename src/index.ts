import { config } from './config/config.js';
import { createBrowser } from './config/browser.js';
import { LinkedInService } from './services/linkedin.js';
import { logger } from './utils/logger.js';

async function main() {
  try {
    const browser = await createBrowser({ headless: config.headless });
    const linkedin = new LinkedInService(browser);
    
    await linkedin.init();
    
    if (config.linkedinEmail && config.linkedinPassword) {
      await linkedin.login(config.linkedinEmail, config.linkedinPassword);
      const jobs = await linkedin.searchJobs('software engineer');
      logger.info(`Total jobs found: ${jobs.length}`);
    } else {
      logger.error('LinkedIn credentials not provided');
      process.exit(1);
    }
  } catch (error) {
    logger.error(`Failed to start: ${error}`);
    process.exit(1);
  }
}

main();
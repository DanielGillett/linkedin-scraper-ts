import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const configSchema = z.object({
  linkedinEmail: z.string().optional(),
  linkedinPassword: z.string().optional(),
  userAgent: z.string().default('Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:132.0) Gecko/20100101 Firefox/132.0'),
  headless: z.boolean().default(true),
});

export const config = configSchema.parse({
  linkedinEmail: process.env.LINKEDIN_EMAIL,
  linkedinPassword: process.env.LINKEDIN_PASSWORD,
  userAgent: process.env.USER_AGENT,
  headless: process.env.HEADLESS !== 'false',
});
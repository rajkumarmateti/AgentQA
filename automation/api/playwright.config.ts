import { defineConfig } from '@playwright/test';
import { config as loadEnv } from 'dotenv';
import path from 'node:path';

loadEnv({ path: path.resolve(__dirname, '.env') });

const baseURL = (process.env.BASE_URL ?? 'http://localhost:8000').replace(/\/$/, '');

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [['html', { open: 'never' }], ['list']],
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL,
    extraHTTPHeaders: { Accept: 'application/json' },
    trace: 'off'
  }
});

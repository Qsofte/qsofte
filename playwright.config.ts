import { defineConfig, devices } from '@playwright/test';

// Runs against the production build served like production nginx (scripts/serve-dist.mjs),
// or against a live URL when BASE_URL is set (used by the post-deploy smoke test).
const baseURL = process.env.BASE_URL ?? 'http://localhost:4173';

export default defineConfig({
  testDir: './e2e',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: { baseURL, trace: 'off' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
    { name: 'tablet', use: { viewport: { width: 768, height: 1024 }, hasTouch: true, isMobile: true } },
  ],
  webServer: process.env.BASE_URL
    ? undefined
    : { command: 'npm run serve', url: baseURL, reuseExistingServer: !process.env.CI },
});

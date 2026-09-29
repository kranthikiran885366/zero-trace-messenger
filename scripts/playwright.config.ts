import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.SITE_URL || 'https://7f9f07ec90e14c4eb9786c1a581ba4c2-d013ba103e97449584c25fa43.fly.dev';

export default defineConfig({
  timeout: 120_000,
  testDir: './scripts/e2e',
  outputDir: 'demo-video',
  retries: 0,
  use: {
    baseURL,
    viewport: { width: 1280, height: 720 },
    video: {
      mode: 'on',
      size: { width: 1280, height: 720 },
    },
    trace: 'off',
    screenshot: 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});

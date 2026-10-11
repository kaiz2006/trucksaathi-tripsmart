import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './specs',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  reporter: [
    ['list'],
    ['html', { outputFolder: './report-html', open: 'never' }],
  ],
  outputDir: './artifacts',
  use: {
    baseURL: 'http://127.0.0.1:8080',
    headless: true,
    ignoreHTTPSErrors: true,
    actionTimeout: 25_000,
    navigationTimeout: 45_000,
    screenshot: 'only-on-failure',
    video: 'on',
    trace: 'on-first-retry',
    viewport: { width: 1280, height: 720 },
  },
  projects: [
    {
      name: 'desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: 'mobile',
      use: {
        ...devices['Pixel 7'],
        viewport: { width: 390, height: 844 },
      },
    },
  ],
  webServer: {
    command: 'npm run seed && DEMO_MODE=true npx concurrently -k -n api,web "tsx watch src/api/server.ts" "vite dev --host 127.0.0.1 --port 8080"',
    url: 'http://127.0.0.1:8080',
    reuseExistingServer: true,
    timeout: 180_000,
  },
});

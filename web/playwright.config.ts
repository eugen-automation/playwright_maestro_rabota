import { defineConfig, devices } from '@playwright/test';
import { readEnvironment } from '../shared/config/load-env.js';
import { WEB_TEST_SETTINGS } from './constants/test-settings.js';

const environment = readEnvironment();
const ci = environment.ci;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: true,
  retries: 0,
  workers: ci ? WEB_TEST_SETTINGS.workers.ci : WEB_TEST_SETTINGS.workers.local,
  timeout: WEB_TEST_SETTINGS.timeouts.test,
  expect: { timeout: WEB_TEST_SETTINGS.timeouts.expect },
  outputDir: '../reports/web/artifacts',
  reporter: [
    ['list'],
    ['html', { outputFolder: '../reports/web/html', open: 'never' }],
    ['junit', { outputFile: '../reports/web/junit.xml' }],
  ],
  use: {
    ...(environment.webBaseUrl ? { baseURL: environment.webBaseUrl } : {}),
    locale: environment.locale,
    actionTimeout: WEB_TEST_SETTINGS.timeouts.action,
    navigationTimeout: WEB_TEST_SETTINGS.timeouts.navigation,
    serviceWorkers: 'block',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [
    {
      name: 'ui-chromium',
      testMatch: 'ui/**/*.spec.ts',
      use: { ...devices['Desktop Chrome'] },
      metadata: { layer: 'ui' },
    },
    { name: 'api', testMatch: 'api/**/*.spec.ts', metadata: { layer: 'api' } },
    {
      name: 'e2e-chromium',
      testMatch: 'journeys/**/*.spec.ts',
      use: { ...devices['Desktop Chrome'], javaScriptEnabled: false },
      metadata: { layer: 'e2e' },
    },
  ],
});

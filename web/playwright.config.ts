import { defineConfig, devices } from '@playwright/test';
import { readEnvironment } from '../shared/config/load-env.js';
import { WEB_TEST_SETTINGS } from './constants/test-settings.js';

const environment = readEnvironment();
const ci = environment.ci;
// Keep private session evidence separate from the public API run.
const reportRoot = environment.allowTestAccountAuth
  ? '../reports/web/auth'
  : '../reports/web';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: true,
  retries: 0,
  workers: ci ? WEB_TEST_SETTINGS.workers.ci : WEB_TEST_SETTINGS.workers.local,
  timeout: WEB_TEST_SETTINGS.timeouts.test,
  expect: { timeout: WEB_TEST_SETTINGS.timeouts.expect },
  outputDir: `${reportRoot}/artifacts`,
  reporter: [
    ['list'],
    ['html', { outputFolder: `${reportRoot}/html`, open: 'never' }],
    ['junit', { outputFile: `${reportRoot}/junit.xml` }],
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
      name: 'api',
      testMatch: 'api/**/*.spec.ts',
      testIgnore: 'api/auth/**/*.spec.ts',
      metadata: { layer: 'api' },
    },
    {
      name: 'api-auth',
      testMatch: 'api/auth/**/*.spec.ts',
      metadata: { layer: 'api', capability: 'test-account-auth' },
      fullyParallel: false,
      workers: 1,
      use: { trace: 'off', screenshot: 'off', video: 'off' },
    },
    {
      name: 'ui-chromium',
      testMatch: 'ui/**/*.spec.ts',
      use: { ...devices['Desktop Chrome'] },
      metadata: { layer: 'ui' },
    },
    {
      name: 'e2e-chromium',
      testMatch: 'journeys/**/*.spec.ts',
      use: { ...devices['Desktop Chrome'], javaScriptEnabled: false },
      metadata: { layer: 'e2e' },
    },
    {
      name: 'e2e-chrome',
      testMatch: 'journeys/**/*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        javaScriptEnabled: false,
      },
      metadata: { layer: 'e2e' },
    },
    {
      name: 'e2e-edge',
      testMatch: 'journeys/**/*.spec.ts',
      use: {
        ...devices['Desktop Edge'],
        channel: 'msedge',
        javaScriptEnabled: false,
      },
      metadata: { layer: 'e2e' },
    },
    {
      name: 'e2e-firefox',
      testMatch: 'journeys/**/*.spec.ts',
      use: { ...devices['Desktop Firefox'], javaScriptEnabled: false },
      metadata: { layer: 'e2e' },
    },
  ],
});

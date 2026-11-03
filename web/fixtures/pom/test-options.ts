import { test as base, expect } from '@playwright/test';
import {
  readEnvironment,
  requireRuntime,
} from '../../../shared/config/load-env.js';
import { RegistrationPage } from '../../pages/registration-page.js';
import { ROUTES } from '../../constants/routes.js';
import { allowsRegistrationDocument } from './read-only-policy.js';
import { WEB_TEST_SETTINGS } from '../../constants/test-settings.js';

type Fixtures = { registrationPage: RegistrationPage; executionGuard: void };

export const test = base.extend<Fixtures>({
  executionGuard: [
    async ({ baseURL }, use, testInfo) => {
      void baseURL;
      const layer: unknown = testInfo.project.metadata.layer;
      if (layer !== 'ui' && layer !== 'api' && layer !== 'e2e')
        throw new Error('Missing or invalid project layer.');
      const environment = readEnvironment();
      requireRuntime(environment, layer);
      if (layer !== 'e2e')
        throw new Error(
          'UI mocks and real API contracts are not implemented; execution is disabled.',
        );
      const layerTags = testInfo.tags.filter((tag) =>
        ['@ui', '@api', '@e2e'].includes(tag),
      );
      const suiteTags = testInfo.tags.filter((tag) =>
        ['@smoke', '@regression'].includes(tag),
      );
      if (
        layerTags.length !== 1 ||
        layerTags[0] !== `@${layer}` ||
        suiteTags.length !== 1
      ) {
        throw new Error(
          'Every test requires exactly one matching layer tag and one suite tag.',
        );
      }
      await use();
    },
    { auto: true },
  ],
  context: async ({ browser, executionGuard }, use) => {
    void executionGuard;
    const environment = readEnvironment();
    if (!environment.webBaseUrl) throw new Error('Missing verified web URL.');
    // This initial public check reads server-rendered markup only. No scripts,
    // background requests, stylesheets, images, or form submissions go online.
    const context = await browser.newContext({
      baseURL: environment.webBaseUrl,
      locale: environment.locale,
      javaScriptEnabled: false,
      serviceWorkers: 'block',
    });
    const registrationUrl = new URL(ROUTES.registration, environment.webBaseUrl)
      .href;
    context.setDefaultTimeout(WEB_TEST_SETTINGS.timeouts.action);
    context.setDefaultNavigationTimeout(WEB_TEST_SETTINGS.timeouts.navigation);
    await context.route('**/*', async (route) => {
      const request = route.request();
      if (
        allowsRegistrationDocument(
          {
            method: request.method(),
            url: request.url(),
            navigation: request.isNavigationRequest(),
            resourceType: request.resourceType(),
          },
          registrationUrl,
        )
      ) {
        await route.continue();
      } else {
        await route.abort('blockedbyclient');
      }
    });
    await context.routeWebSocket(/.*/, (socket) => socket.close());
    try {
      await use(context);
    } finally {
      await context.close();
    }
  },
  registrationPage: async ({ page }, use) => {
    await use(new RegistrationPage(page));
  },
});

export { expect };

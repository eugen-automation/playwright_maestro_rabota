import { test, expect } from '../../../fixtures/pom/test-options.js';
import { ACCOUNT_AUTH_PATHS } from '../../../../shared/api/clients/test-account-auth-endpoints.js';

test(
  'API-AUTH-FORM-01: the public sign-in form exposes the verified submission contract',
  { tag: ['@regression', '@api', '@auth'] },
  async ({ testAccountAuthApi }) => {
    const result = await testAccountAuthApi.loginForm();
    expect(result.status).toBe(200);
    expect(result.isHtml).toBe(true);
    expect(result.observedForm).toBe(true);
    expect(result.passwordInput).toBe(true);
  },
);

test(
  'API-AUTH-ACCESS-01: an anonymous account landing request redirects to sign-in',
  { tag: ['@regression', '@api', '@auth'] },
  async ({ testAccountAuthApi }) => {
    const result = await testAccountAuthApi.accountLanding();
    expect(result.status).toBe(302);
    expect(result.sameOriginRedirect).toBe(true);
    expect(result.redirectPath).toBe(ACCOUNT_AUTH_PATHS.login);
  },
);

test(
  'API-AUTH-SESSION-01: the dedicated account signs in and signs out of its isolated session',
  { tag: ['@smoke', '@api', '@auth'] },
  async ({ testAccountAuthApi }) => {
    await test.step('GET sign-in form - verify the contract before submitting', async () => {
      const result = await testAccountAuthApi.loginForm();
      expect(result.status).toBe(200);
      expect(result.isHtml).toBe(true);
      expect(result.observedForm).toBe(true);
      expect(result.passwordInput).toBe(true);
    });

    await test.step('POST sign-in - verify the observed account redirect', async () => {
      const result = await testAccountAuthApi.signIn();
      expect(result.status).toBe(302);
      expect(result.sameOriginRedirect).toBe(true);
      expect(result.redirectPath).toBe(ACCOUNT_AUTH_PATHS.accountLanding);
    });

    await test.step('GET homepage - verify the supplied account owns this session', async () => {
      const result = await testAccountAuthApi.session();
      expect(result.status).toBe(200);
      expect(result.isHtml).toBe(true);
      expect(result.accountIdentityVisible).toBe(true);
      expect(result.logoutLinkVisible).toBe(true);
    });

    await test.step('GET sign-out - verify the observed public redirect', async () => {
      const result = await testAccountAuthApi.signOut();
      expect(result.status).toBe(302);
      expect(result.sameOriginRedirect).toBe(true);
      expect(result.redirectPath).toBe(ACCOUNT_AUTH_PATHS.home);
    });

    await test.step('GET homepage - verify the account session is gone', async () => {
      const result = await testAccountAuthApi.session();
      expect(result.status).toBe(200);
      expect(result.accountIdentityVisible).toBe(false);
      expect(result.logoutLinkVisible).toBe(false);
    });
  },
);

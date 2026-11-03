import { test, expect } from '../../fixtures/pom/test-options.js';

test(
  'Romanian registration document exposes its basic form controls',
  {
    tag: ['@smoke', '@e2e', '@registration'],
  },
  async ({ registrationPage }) => {
    await registrationPage.open();
    await expect(registrationPage.heading).toBeVisible();
    await expect(registrationPage.emailInput).toBeVisible();
    await expect(registrationPage.passwordInput).toHaveAttribute(
      'type',
      'password',
    );
    await expect(registrationPage.submitButton).toBeVisible();
  },
);

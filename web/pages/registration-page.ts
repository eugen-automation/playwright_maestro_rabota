import type { Locator, Page } from '@playwright/test';
import { ROUTES } from '../constants/routes.js';
import { UI_TEXT } from '../constants/ui-text.js';

export class RegistrationPage {
  readonly heading: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', {
      name: UI_TEXT.registrationHeading,
      exact: true,
    });
    this.emailInput = page.getByPlaceholder(UI_TEXT.emailPlaceholder, {
      exact: true,
    });
    this.passwordInput = page.getByPlaceholder(UI_TEXT.passwordPlaceholder, {
      exact: true,
    });
    this.submitButton = page.getByRole('button', {
      name: UI_TEXT.finalizeAccount,
      exact: true,
    });
  }

  async open(): Promise<void> {
    await this.page.goto(ROUTES.registration);
  }
}

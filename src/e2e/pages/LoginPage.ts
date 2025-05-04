import type { Page } from '@playwright/test';

export class LoginPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async fillEmail(email: string) {
    await this.page.fill('[data-test-id="email-input"]', email);
  }

  async fillPassword(password: string) {
    await this.page.fill('[data-test-id="password-input"]', password);
  }

  async clickLoginButton() {
    await this.page.click('[data-test-id="login-button"]');
  }

  async login(email: string, password: string) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.clickLoginButton();
  }
} 
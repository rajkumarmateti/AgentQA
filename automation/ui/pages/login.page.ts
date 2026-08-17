import { type Page, expect } from '@playwright/test';
import { env, webPath } from '../utils/env';

export class LoginPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto(webPath('login'));
    await this.page.waitForURL('**/web/login');
  }

  async login(username = env.username, password = env.password): Promise<void> {
    await this.goto();
    await this.page.getByRole('textbox', { name: 'login-username' }).fill(username);
    await this.page.getByRole('textbox', { name: 'login-password' }).fill(password);
    await this.page.getByRole('button', { name: 'Log in' }).click();
    await expect(this.page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(this.page.getByRole('button', { name: 'navigation-menu' })).toBeVisible();
  }
}

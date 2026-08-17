import path from 'node:path';
import { test as setup } from '@playwright/test';
import { LoginPage } from '../pages/login.page';

const authFile = path.join(__dirname, '..', '.auth', 'user.json');

setup('authenticate', async ({ page }) => {
  // Covers: login prerequisite for UI-PART-* cases
  const login = new LoginPage(page);
  await login.login();
  await page.context().storageState({ path: authFile });
});

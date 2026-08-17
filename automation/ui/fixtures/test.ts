import { test as base, expect, type Page } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { PartDetailPage } from '../pages/part-detail.page';
import { PartsListPage } from '../pages/parts-list.page';
import { InventreeApi } from '../utils/api-client';
import { env } from '../utils/env';
import { uniqueName } from '../utils/unique';

type Fixtures = {
  api: InventreeApi;
  partsList: PartsListPage;
  partDetail: PartDetailPage;
  loginPage: LoginPage;
  testPrefix: string;
};

export const test = base.extend<Fixtures>({
  api: async ({}, use) => {
    const api = await InventreeApi.create();
    await use(api);
    await api.close();
  },
  partsList: async ({ page }, use) => {
    await use(new PartsListPage(page));
  },
  partDetail: async ({ page }, use) => {
    await use(new PartDetailPage(page));
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  testPrefix: async ({}, use) => {
    await use(uniqueName('QA-UI'));
  }
});

export { expect };

export async function loginAs(
  page: Page,
  username: string,
  password: string
): Promise<void> {
  const login = new LoginPage(page);
  await page.context().clearCookies();
  await login.login(username, password);
}

export const hasReadonlyUser = (): boolean =>
  Boolean(env.readonlyUsername && env.readonlyPassword);

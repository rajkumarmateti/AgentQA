import { PartsListPage } from '../pages/parts-list.page';
import { expect, hasReadonlyUser, loginAs, test } from '../fixtures/test';
import { env } from '../utils/env';

test.describe('Part creation validation', () => {
  test('submit without name is blocked @p1', async ({ partsList }) => {
    // Covers: UI-PART-006
    await partsList.gotoIndex();
    const form = await partsList.openCreatePart();
    await form.descriptionField().fill('No name');
    await form.submit();
    await form.expectValidationError();
  });

  test('empty name then fix and submit succeeds @p1', async ({
    page,
    partsList,
    partDetail,
    api,
    testPrefix
  }) => {
    // Covers: UI-PART-007
    const name = `${testPrefix}-fix`;
    await partsList.gotoIndex();
    const form = await partsList.openCreatePart();
    await form.submit();
    await form.expectValidationError();
    await form.fill({ name, description: 'Fixed' });
    await form.submit();
    await partDetail.expectOnDetail(name);
    await expect(page.getByText('Fixed').first()).toBeVisible();
    await api.deletePartByName(name);
  });

  test('IPN is optional @p2', async ({ partsList, partDetail, api, testPrefix }) => {
    // Covers: UI-PART-017
    const name = `${testPrefix}-noipn`;
    await partsList.gotoIndex();
    const form = await partsList.openCreatePart();
    await form.fill({ name, description: 'No IPN' });
    await form.submit();
    await partDetail.expectOnDetail(name);
    await api.deletePartByName(name);
  });

  test('duplicate part name is rejected @p1', async ({ partsList, api, testPrefix }) => {
    // Covers: UI-PART-013
    const name = `${testPrefix}-dup`;
    await api.createPart({ name, description: 'Original' });
    await partsList.gotoIndex();
    const form = await partsList.openCreatePart();
    await form.fill({ name, description: 'Dup name' });
    await form.submit();
    await form.expectValidationError();
    await api.deletePartByName(name);
  });

  test('Add Parts is hidden without create permission @p1', async ({ browser }) => {
    // Covers: UI-PART-012
    test.skip(!hasReadonlyUser(), 'Set INVENTREE_READONLY_USERNAME / PASSWORD to run');
    const page = await browser.newPage({ storageState: { cookies: [], origins: [] } });
    await loginAs(page, env.readonlyUsername, env.readonlyPassword);
    const list = new PartsListPage(page);
    await list.gotoIndex();
    await list.expectCreatePartHidden();
    await page.close();
  });
});

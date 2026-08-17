import { expect, test } from '../fixtures/test';

test.describe('Part CRUD', () => {
  test('create a part with required fields and land on detail @p1', async ({
    page,
    partsList,
    partDetail,
    api,
    testPrefix
  }) => {
    // Covers: UI-PART-001, UI-PART-003, UI-PART-005
    const name = `${testPrefix}-min`;
    await partsList.gotoIndex();
    await partsList.expectCreatePartAvailable();
    const form = await partsList.openCreatePart();
    await form.fill({ name, description: 'Minimum create' });
    await form.submit();
    await partDetail.expectOnDetail(name);

    await page.reload();
    await partDetail.expectOnDetail(name);

    await api.deletePartByName(name);
  });

  test('create part with optional header fields @p1', async ({
    page,
    partsList,
    partDetail,
    api,
    testPrefix
  }) => {
    // Covers: UI-PART-002
    const name = `${testPrefix}-full`;
    const ipn = `IPN-${testPrefix}`.slice(0, 100);
    await partsList.gotoIndex();
    const form = await partsList.openCreatePart();
    await form.fill({
      name,
      description: 'Full create',
      ipn,
      keywords: 'resistor,smd',
      link: 'https://example.com/qa-full',
      revision: 'A'
    });
    await form.submit();
    await partDetail.expectOnDetail(name);
    await expect(page.getByText('Full create').first()).toBeVisible();
    await expect(page.getByText(ipn).first()).toBeVisible();

    await api.deletePartByName(name);
  });

  test('created part appears in the parts table @p1', async ({
    partsList,
    partDetail,
    api,
    testPrefix
  }) => {
    // Covers: UI-PART-004
    const name = `${testPrefix}-list`;
    await partsList.gotoIndex();
    const form = await partsList.openCreatePart();
    await form.fill({ name, description: 'Listed part' });
    await form.submit();
    await partDetail.expectOnDetail(name);

    await partsList.gotoIndex();
    await partsList.expectPartListed(name);

    await api.deletePartByName(name);
  });

  test('cancel create does not persist a part @p2', async ({ partsList, api, testPrefix }) => {
    // Covers: UI-PART-022
    const name = `${testPrefix}-cancel`;
    await partsList.gotoIndex();
    const form = await partsList.openCreatePart();
    await form.fill({ name, description: 'Should not save' });
    await form.cancel();
    await expect(partsList.addPartsMenu()).toBeVisible();

    const found = await api.findPartByName(name);
    expect(found).toBeUndefined();
  });
});

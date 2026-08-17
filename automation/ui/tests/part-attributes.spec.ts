import { expect, test } from '../fixtures/test';

test.describe('Part attributes', () => {
  test('virtual part hides stock UI @p1', async ({ api, partDetail, page, testPrefix }) => {
    // Covers: UI-PART-053, UI-PART-096, UI-PART-097
    const part = await api.createPart({
      name: `${testPrefix}-virt`,
      description: 'Virtual',
      virtual: true
    });
    await partDetail.goto(part.pk);
    await expect(page.getByLabel('action-button-add-stock-item')).toHaveCount(0);
    await api.deletePartByName(part.name);
  });

  test('locked assembly blocks BOM and parameter edits @p1', async ({
    api,
    partDetail,
    page,
    testPrefix
  }) => {
    // Covers: UI-PART-137, UI-PART-138, UI-PART-139, UI-PART-259
    const part = await api.createPart({
      name: `${testPrefix}-lock`,
      description: 'Locked assembly',
      assembly: true,
      locked: true
    });
    await partDetail.goto(part.pk, 'bom');
    await partDetail.expectLocked();
    await partDetail.loadTab('Bill of Materials');
    await expect(page.getByRole('button', { name: 'action-menu-add-bom-items' })).toHaveCount(0);

    await partDetail.loadTab('Parameters');
    await expect(page.getByText(/part parameters cannot be/i)).toBeVisible();

    await api.patch(`part/${part.pk}/`, { locked: false });
    await api.deletePartByName(part.name);
  });

  test('component part shows Used In tab @p1', async ({ api, partDetail, testPrefix }) => {
    // Covers: UI-PART-061, UI-PART-113
    const part = await api.createPart({
      name: `${testPrefix}-usedin`,
      description: 'Component',
      component: true
    });
    await partDetail.goto(part.pk);
    await partDetail.expectTabVisible('Used In');
    await api.deletePartByName(part.name);
  });

  test('inactive part remains reachable in the UI @p1', async ({
    api,
    partDetail,
    testPrefix
  }) => {
    // Covers: UI-PART-132
    const part = await api.createPart({
      name: `${testPrefix}-inactive`,
      description: 'Inactive',
      active: false
    });
    await partDetail.goto(part.pk);
    await partDetail.expectOnDetail(part.name);
    await api.deletePartByName(part.name);
  });
});

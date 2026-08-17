import { expect, test } from '../fixtures/test';

test.describe('Categories and filtering', () => {
  test('part assigned to a category is listed there @p1', async ({
    api,
    partsList,
    testPrefix
  }) => {
    // Covers: UI-PART-004, UI-PART-079, UI-PART-086
    const category = await api.createCategory(testPrefix);
    const part = await api.createPart({
      name: `${testPrefix}-catpart`,
      description: 'In category',
      category: category.pk
    });

    await partsList.gotoCategory(category.pk);
    await partsList.expectPartListed(part.name);

    await api.deletePartByName(part.name);
    await api.deleteCategory(category.pk);
  });

  test('parent category lists parts from a sub-category @p1', async ({
    api,
    partsList,
    testPrefix
  }) => {
    // Covers: UI-PART-079, UI-PART-025
    const parent = await api.createCategory(`${testPrefix}-parent`);
    const child = await api.createCategory(`${testPrefix}-child`, parent.pk);
    const part = await api.createPart({
      name: `${testPrefix}-leaf`,
      description: 'In child category',
      category: child.pk
    });

    await partsList.gotoCategory(parent.pk);
    await partsList.expectPartListed(part.name);

    await api.deletePartByName(part.name);
    await api.deleteCategory(child.pk);
    await api.deleteCategory(parent.pk);
  });

  test('table search finds a part by name @p2', async ({ api, partsList, testPrefix }) => {
    // Covers: UI-PART-083, UI-PART-085
    const part = await api.createPart({
      name: `${testPrefix}-search`,
      description: 'Searchable',
      keywords: 'smd,resistor'
    });
    await partsList.gotoIndex();
    await partsList.expectPartListed(part.name);
    await api.deletePartByName(part.name);
  });

  test('parametric view control is available on a category parts table @p1', async ({
    api,
    partsList,
    page,
    testPrefix
  }) => {
    // Covers: UI-PART-087
    const category = await api.createCategory(`${testPrefix}-paramview`);
    await partsList.gotoCategory(category.pk);
    await partsList.showParametricView();
    await expect(
      page.getByRole('button', { name: 'segmented-icon-control-parametric' })
    ).toBeVisible();
    await api.deleteCategory(category.pk);
  });
});

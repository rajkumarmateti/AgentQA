import { expect, test } from '../fixtures/test';

test.describe('Revisions', () => {
  test('duplicate part form exposes copy options @p1', async ({
    api,
    partDetail,
    page,
    testPrefix
  }) => {
    // Covers: UI-PART-161, UI-PART-164
    const part = await api.createPart({
      name: `${testPrefix}-revbase`,
      description: 'Revision original',
      assembly: true
    });
    await partDetail.goto(part.pk);
    await partDetail.openDuplicate();
    await expect(page.getByText('Copy Parameters', { exact: true })).toBeVisible();
    await expect(page.getByText('Copy Tests', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Cancel' }).click();
    await api.deletePartByName(part.name);
  });

  test('creating a revision via duplicate keeps the original part @p1', async ({
    api,
    partDetail,
    page,
    testPrefix
  }) => {
    // Covers: UI-PART-161, UI-PART-162, UI-PART-163
    const originalName = `${testPrefix}-orig`;
    const revisionName = `${testPrefix}-revb`;
    const original = await api.createPart({
      name: originalName,
      description: 'Original',
      assembly: true
    });

    await partDetail.goto(original.pk);
    const form = await partDetail.openDuplicate();
    await form.fill({ name: revisionName, description: 'Revision B', revision: 'B' });
    const revisionOf = page.getByLabel('related-field-revision_of', { exact: true });
    if (await revisionOf.count()) {
      await revisionOf.fill(originalName);
      await page.getByRole('option').filter({ hasText: originalName }).first().click();
    }
    await form.submit();
    await partDetail.expectOnDetail(revisionName);

    const originalStill = await api.findPartByName(originalName);
    expect(originalStill?.pk).toBe(original.pk);

    await api.deletePartByName(revisionName);
    await api.deletePartByName(originalName);
  });
});

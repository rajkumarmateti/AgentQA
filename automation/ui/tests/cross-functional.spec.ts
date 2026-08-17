import { expect, test } from '../fixtures/test';
import { uniqueName } from '../utils/unique';

test.describe('Cross-functional flow', () => {
  test('create part → add parameter → add stock → verify in category @p1', async ({
    api,
    partsList,
    partDetail,
    page,
    testPrefix
  }) => {
    // Covers: UI-PART-256
    const category = await api.createCategory(`${testPrefix}-xfn`);
    const templateName = uniqueName('QA-Res');
    const template = await api.createParameterTemplate(templateName, 'ohm');
    const partName = `${testPrefix}-xfn-part`;

    await partsList.gotoCategory(category.pk);
    const form = await partsList.openCreatePart();
    await form.fill({
      name: partName,
      description: 'Cross-functional part',
      category: category.name
    });
    await form.submit();
    await partDetail.expectOnDetail(partName);

    await partDetail.addParameter(templateName, '10k');
    await expect(page.getByText('10k').first()).toBeVisible();

    await partDetail.addStock(8);
    await partDetail.loadTab('Stock', true);
    await expect(page.getByText(/8/).first()).toBeVisible();

    await partsList.gotoCategory(category.pk);
    await partsList.expectPartListed(partName);
    await partsList.showParametricView();
    await expect(page.getByText(partName).first()).toBeVisible();

    await api.deletePartByName(partName);
    await api.delete(`part/parameter/template/${template.pk}/`);
    await api.deleteCategory(category.pk);
  });
});

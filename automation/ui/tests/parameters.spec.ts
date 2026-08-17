import { expect, test } from '../fixtures/test';
import { uniqueName } from '../utils/unique';

test.describe('Parameters', () => {
  test('add a parameter from the Parameters tab @p1', async ({
    api,
    partDetail,
    page,
    testPrefix
  }) => {
    // Covers: UI-PART-068, UI-PART-184
    const templateName = uniqueName('QA-Color');
    const template = await api.createParameterTemplate(templateName);
    const part = await api.createPart({
      name: `${testPrefix}-param`,
      description: 'Has parameters'
    });

    await partDetail.goto(part.pk, 'parameters');
    await partDetail.addParameter(templateName, 'Red');
    await expect(page.getByText('Red').first()).toBeVisible();

    await api.deletePartByName(part.name);
    await api.delete(`part/parameter/template/${template.pk}/`);
  });
});

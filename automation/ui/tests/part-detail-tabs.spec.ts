import { expect, test } from '../fixtures/test';

test.describe('Part detail navigation and tabs', () => {
  test('stock, parameters, and attachments tabs are reachable @p1', async ({
    api,
    partDetail,
    testPrefix
  }) => {
    // Covers: UI-PART-043, UI-PART-049, UI-PART-068, UI-PART-069
    const part = await api.createPart({
      name: `${testPrefix}-tabs`,
      description: 'Tab navigation',
      component: true,
      purchaseable: true
    });
    await partDetail.goto(part.pk);
    await partDetail.expectOnDetail(part.name);
    await partDetail.loadTab('Stock', true);
    await partDetail.loadTab('Parameters');
    await partDetail.loadTab('Attachments');
    await partDetail.loadTab('Notes');
    await api.deletePartByName(part.name);
  });

  test('BOM tab is visible only for assemblies @p1', async ({ api, partDetail, testPrefix }) => {
    // Covers: UI-PART-057, UI-PART-104
    const assembly = await api.createPart({
      name: `${testPrefix}-asm`,
      description: 'Assembly',
      assembly: true
    });
    const component = await api.createPart({
      name: `${testPrefix}-cmp`,
      description: 'Component',
      assembly: false,
      component: true
    });

    await partDetail.goto(assembly.pk);
    await partDetail.expectTabVisible('Bill of Materials');

    await partDetail.goto(component.pk);
    await partDetail.expectTabHidden('Bill of Materials');

    await api.deletePartByName(assembly.name);
    await api.deletePartByName(component.name);
  });

  test('Suppliers tab is visible only when purchaseable @p1', async ({
    api,
    partDetail,
    testPrefix
  }) => {
    // Covers: UI-PART-062, UI-PART-122
    const buy = await api.createPart({
      name: `${testPrefix}-buy`,
      description: 'Purchaseable',
      purchaseable: true
    });
    const make = await api.createPart({
      name: `${testPrefix}-make`,
      description: 'Not purchaseable',
      purchaseable: false
    });

    await partDetail.goto(buy.pk);
    await partDetail.expectTabVisible('Suppliers');

    await partDetail.goto(make.pk);
    await partDetail.expectTabHidden('Suppliers');

    await api.deletePartByName(buy.name);
    await api.deletePartByName(make.name);
  });

  test('Variants tab is visible only for template parts @p1', async ({
    api,
    partDetail,
    testPrefix
  }) => {
    // Covers: UI-PART-048, UI-PART-103, UI-PART-211
    const template = await api.createPart({
      name: `${testPrefix}-tpl`,
      description: 'Template',
      is_template: true
    });
    const plain = await api.createPart({
      name: `${testPrefix}-plain`,
      description: 'Not template',
      is_template: false
    });

    await partDetail.goto(template.pk);
    await partDetail.expectTabVisible('Variants');

    await partDetail.goto(plain.pk);
    await partDetail.expectTabHidden('Variants');

    await api.deletePartByName(template.name);
    await api.deletePartByName(plain.name);
  });

  test('clicking a part name from the list opens detail @p1', async ({
    partsList,
    partDetail,
    api,
    testPrefix
  }) => {
    // Covers: UI-PART-074, UI-PART-086
    const part = await api.createPart({
      name: `${testPrefix}-nav`,
      description: 'Navigate from table'
    });
    await partsList.gotoIndex();
    await partsList.openPartFromTable(part.name);
    await partDetail.expectOnDetail(part.name);
    await api.deletePartByName(part.name);
  });
});

import { expect, test } from '../fixtures/test';

test.describe('Negative and boundary', () => {
  test('duplicate IPN is allowed when the default setting permits it @p2', async ({
    partsList,
    partDetail,
    api,
    testPrefix
  }) => {
    // Covers: UI-PART-014
    const ipn = `IPN-${testPrefix}`.slice(0, 100);
    const first = `${testPrefix}-ipn-a`;
    const second = `${testPrefix}-ipn-b`;
    await api.createPart({ name: first, description: 'First', IPN: ipn });

    await partsList.gotoIndex();
    const form = await partsList.openCreatePart();
    await form.fill({ name: second, description: 'Second', ipn });
    await form.submit();
    await partDetail.expectOnDetail(second);

    await api.deletePartByName(second);
    await api.deletePartByName(first);
  });

  test('blank IPN can be used on a new part @p2', async ({
    partsList,
    partDetail,
    api,
    testPrefix
  }) => {
    // Covers: UI-PART-016, UI-PART-017
    const name = `${testPrefix}-blank-ipn`;
    await partsList.gotoIndex();
    const form = await partsList.openCreatePart();
    await form.fill({ name, description: 'Blank IPN' });
    await form.submit();
    await partDetail.expectOnDetail(name);
    await api.deletePartByName(name);
  });

  test('unknown part id does not show a valid part detail @p2', async ({ page, partDetail }) => {
    // Covers: UI-PART-075 (persistence of a real part is the inverse)
    await partDetail.goto(99999999);
    await expect(page.getByText(/not found|404|does not exist/i).first()).toBeVisible();
  });
});

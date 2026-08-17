import { BOOLEAN_FLAGS } from '../data/parts';
import { createPart, expect, test } from '../fixtures/test';
import { assertClientError, assertPartSchema } from '../schemas/part';
import { padded } from '../utils/unique';

test.describe('Part field validation', () => {
  test('name length 100 accepted @p1 @validation', async ({ api, tracker }) => {
    // Covers: API-PART-071
    const name = padded(100, 'N');
    const response = await api.createPart({ name });
    expect(response.status()).toBe(201);
    const body = await response.json();
    tracker.parts.push(body.pk as number);
    expect((body.name as string).length).toBe(100);
    assertPartSchema(body);
  });

  test('name length 101 rejected @p1 @validation', async ({ api }) => {
    // Covers: API-PART-072
    const response = await api.createPart({ name: padded(101, 'N') });
    assertClientError(response);
    expect(response.status()).not.toBe(201);
  });

  for (const [id, payload] of [
    ['wrong-type', { name: 123 }],
    ['null', { name: null }]
  ] as const) {
    test(`name ${id} rejected @p1 @validation`, async ({ api }) => {
      // Covers: API-PART-073, API-PART-074
      assertClientError(await api.createPart(payload as Record<string, unknown>));
    });
  }

  test('IPN length 100 vs 101 @p1 @validation', async ({ api, tracker, prefix }) => {
    // Covers: API-PART-075
    const ok = await api.createPart({ name: `${prefix}-ipn100`, IPN: padded(100, 'I') });
    expect(ok.status()).toBe(201);
    tracker.parts.push((await ok.json()).pk as number);
    assertClientError(await api.createPart({ name: `${prefix}-ipn101`, IPN: padded(101, 'I') }));
  });

  test('IPN omitted defaults empty @p2 @validation', async ({ api, tracker, prefix }) => {
    // Covers: API-PART-076
    const body = await createPart(api, tracker, { name: `${prefix}-noipn` });
    expect(body.IPN === '' || body.IPN === null || typeof body.IPN === 'string').toBe(true);
  });

  test('description length 250 vs 251 @p1 @validation', async ({ api, tracker, prefix }) => {
    // Covers: API-PART-077
    const ok = await api.createPart({ name: `${prefix}-d250`, description: padded(250, 'D') });
    expect(ok.status()).toBe(201);
    tracker.parts.push((await ok.json()).pk as number);
    assertClientError(await api.createPart({ name: `${prefix}-d251`, description: padded(251, 'D') }));
  });

  test('keywords null and max length @p2 @validation', async ({ api, tracker, prefix }) => {
    // Covers: API-PART-078
    const nullable = await api.createPart({ name: `${prefix}-kw-null`, keywords: null });
    expect(nullable.status()).toBe(201);
    tracker.parts.push((await nullable.json()).pk as number);
    const ok = await api.createPart({ name: `${prefix}-kw250`, keywords: padded(250, 'K') });
    expect(ok.status()).toBe(201);
    tracker.parts.push((await ok.json()).pk as number);
    assertClientError(await api.createPart({ name: `${prefix}-kw251`, keywords: padded(251, 'K') }));
  });

  test('units null and max length @p2 @validation', async ({ api, tracker, prefix }) => {
    // Covers: API-PART-080
    const nullable = await api.createPart({ name: `${prefix}-u-null`, units: null });
    expect(nullable.status()).toBe(201);
    tracker.parts.push((await nullable.json()).pk as number);
    const ok = await api.createPart({ name: `${prefix}-u20`, units: 'x'.repeat(20) });
    expect(ok.status()).toBe(201);
    tracker.parts.push((await ok.json()).pk as number);
    assertClientError(await api.createPart({ name: `${prefix}-u21`, units: 'x'.repeat(21) }));
  });

  test('revision omit null and max @p2 @validation', async ({ api, tracker, prefix }) => {
    // Covers: API-PART-081
    await createPart(api, tracker, { name: `${prefix}-rev-omit` });
    const nullable = await api.createPart({ name: `${prefix}-rev-null`, revision: null });
    expect(nullable.status()).toBe(201);
    tracker.parts.push((await nullable.json()).pk as number);
    const ok = await api.createPart({ name: `${prefix}-rev100`, revision: padded(100, 'R') });
    expect(ok.status()).toBe(201);
    tracker.parts.push((await ok.json()).pk as number);
    assertClientError(await api.createPart({ name: `${prefix}-rev101`, revision: padded(101, 'R') }));
  });

  test('link valid URI @p2 @validation', async ({ api, tracker, prefix }) => {
    // Covers: API-PART-082
    const body = await createPart(api, tracker, { name: `${prefix}-link`, link: 'https://example.com/a' });
    expect(['https://example.com/a', 'https://example.com/a/']).toContain(body.link);
  });

  test('link empty string @p2 @validation', async ({ api, tracker, prefix }) => {
    // Covers: API-PART-083
    const body = await createPart(api, tracker, { name: `${prefix}-link-empty`, link: '' });
    expect(['', null]).toContain(body.link);
  });

  test('link null @p2 @validation', async ({ api, tracker, prefix }) => {
    // Covers: API-PART-084
    const body = await createPart(api, tracker, { name: `${prefix}-link-null`, link: null });
    expect(['', null]).toContain(body.link);
  });

  test('link invalid URI @p2 @validation', async ({ api, prefix }) => {
    // Covers: API-PART-085
    assertClientError(await api.createPart({ name: `${prefix}-bad-link`, link: 'not a url' }));
  });

  test('category null uncategorized @p1 @validation', async ({ api, tracker, prefix }) => {
    // Covers: API-PART-087
    const body = await createPart(api, tracker, { name: `${prefix}-nocat`, category: null });
    expect(body.category).toBeNull();
  });

  test('category wrong type @p1 @validation', async ({ api, prefix }) => {
    // Covers: API-PART-088
    assertClientError(await api.createPart({ name: `${prefix}-cat-str`, category: 'Electronics' }));
  });

  test('default_location null vs string @p2 @validation', async ({ api, tracker, prefix }) => {
    // Covers: API-PART-089
    const body = await createPart(api, tracker, { name: `${prefix}-loc-null`, default_location: null });
    expect(body.default_location).toBeNull();
    assertClientError(await api.createPart({ name: `${prefix}-loc-str`, default_location: 'warehouse' }));
  });

  for (const [expiry, ok] of [
    [0, true],
    [1, true],
    [-1, false]
  ] as const) {
    test(`default_expiry ${expiry} @p2 @validation`, async ({ api, tracker, prefix }) => {
      // Covers: API-PART-090
      const response = await api.createPart({ name: `${prefix}-exp-${expiry}`, default_expiry: expiry });
      if (ok) {
        expect(response.status()).toBe(201);
        tracker.parts.push((await response.json()).pk as number);
      } else {
        assertClientError(response);
      }
    });
  }

  test('default_expiry wrong type @p2 @validation', async ({ api, prefix }) => {
    // Covers: API-PART-091
    assertClientError(await api.createPart({ name: `${prefix}-exp-str`, default_expiry: 'tomorrow' }));
  });

  test('stock numeric vs string @p2 @validation', async ({ api, tracker, prefix }) => {
    // Covers: API-PART-092
    const zero = await api.createPart({ name: `${prefix}-stk0`, minimum_stock: 0.0 });
    expect(zero.status()).toBe(201);
    tracker.parts.push((await zero.json()).pk as number);
    const frac = await api.createPart({ name: `${prefix}-stk10`, minimum_stock: 10.5 });
    expect(frac.status()).toBe(201);
    tracker.parts.push((await frac.json()).pk as number);
    assertClientError(await api.createPart({ name: `${prefix}-stk-str`, minimum_stock: 'ten' }));
  });

  for (const flag of BOOLEAN_FLAGS) {
    test(`boolean ${flag} wrong type @p1 @validation`, async ({ api, tracker, prefix }) => {
      // Covers: API-PART-093
      const response = await api.createPart({ name: `${prefix}-bool-${flag}`, [flag]: 'yes' });
      if (response.status() === 201) {
        const body = await response.json();
        tracker.parts.push(body.pk as number);
        expect(typeof body[flag]).toBe('boolean');
      } else {
        assertClientError(response);
      }
    });
  }

  test('tags array vs invalid @p2 @validation', async ({ api, tracker, prefix }) => {
    // Covers: API-PART-094
    const ok = await api.createPart({ name: `${prefix}-tags`, tags: ['qa', 'api'] });
    if (ok.status() === 201) {
      tracker.parts.push((await ok.json()).pk as number);
    } else {
      test.skip(true, 'Instance rejected tags array (tagging may be disabled)');
    }
    assertClientError(await api.createPart({ name: `${prefix}-tags-str`, tags: 'qa' }));
    assertClientError(await api.createPart({ name: `${prefix}-tags-int`, tags: [1] }));
  });

  test('malformed JSON @p1 @validation', async ({ api }) => {
    // Covers: API-PART-096, API-PART-176
    const response = await api.post('part/', '{name:', { 'Content-Type': 'application/json' });
    assertClientError(response);
  });

  test('JSON array instead of object @p1 @validation', async ({ api }) => {
    // Covers: API-PART-177
    assertClientError(await api.post('part/', [{ name: 'x' }]));
  });

  test('patch description over maxLength @p1 @validation', async ({ api, tracker, prefix }) => {
    // Covers: API-PART-099
    const created = await createPart(api, tracker, { name: `${prefix}-desc-max`, description: 'ok' });
    assertClientError(await api.patchPart(created.pk as number, { description: padded(251, 'D') }));
    const fetched = await (await api.getPart(created.pk as number)).json();
    expect(fetched.description).toBe('ok');
  });

  test('patch name null @p1 @validation', async ({ api, tracker, prefix }) => {
    // Covers: API-PART-100
    const created = await createPart(api, tracker, { name: `${prefix}-name-keep` });
    assertClientError(await api.patchPart(created.pk as number, { name: null }));
    const fetched = await (await api.getPart(created.pk as number)).json();
    expect(fetched.name).toBe(created.name);
  });

  test('unicode name @p3 @validation', async ({ api, tracker, prefix }) => {
    // Covers: API-PART-105
    const name = `${prefix}-电阻-Ω`;
    const body = await createPart(api, tracker, { name });
    expect(body.name).toBe(name);
    expect((await (await api.getPart(body.pk as number)).json()).name).toBe(name);
  });
});

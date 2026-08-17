import { createPart, expect, test } from '../fixtures/test';
import {
  assertClientError,
  assertPaginatedList,
  parseList
} from '../schemas/part';
import { padded } from '../utils/unique';

test.describe('Supporting endpoints', () => {
  test('list related parts @p1 @supporting', async ({ api }) => {
    // Covers: API-PART-191
    const response = await api.listRelated({ limit: 5 });
    expect(response.status()).toBe(200);
    assertPaginatedList(await response.json());
  });

  test('related part CRUD @p1 @supporting', async ({ api, tracker, prefix }) => {
    // Covers: API-PART-192, API-PART-197, API-PART-198, API-PART-200
    const partA = await createPart(api, tracker, { name: `${prefix}-rel-a` });
    const partB = await createPart(api, tracker, { name: `${prefix}-rel-b` });
    const created = await api.createRelated({
      part_1: partA.pk,
      part_2: partB.pk,
      note: 'alt'
    });
    expect(created.status(), await created.text()).toBe(201);
    const body = await created.json();
    tracker.related.push(body.pk as number);
    expect(body.part_1).toBe(partA.pk);
    expect(body.part_2).toBe(partB.pk);
    expect(body.note).toBe('alt');

    const listed = await api.listRelated({ part: partA.pk as number, limit: 50 });
    expect(listed.status()).toBe(200);
    expect(parseList(await listed.json()).some((item) => item.pk === body.pk)).toBe(true);

    const fetched = await api.getRelated(body.pk as number);
    expect(fetched.status()).toBe(200);
    expect((await fetched.json()).pk).toBe(body.pk);

    const patched = await api.patchRelated(body.pk as number, { note: 'updated' });
    expect(patched.status()).toBe(200);
    const patchedBody = await patched.json();
    expect(patchedBody.note).toBe('updated');
    expect(patchedBody.part_1).toBe(partA.pk);

    tracker.related = tracker.related.filter((id) => id !== body.pk);
    const deleted = await api.deleteRelated(body.pk as number);
    expect(deleted.status()).toBe(204);
    expect((await api.getPart(partA.pk as number)).status()).toBe(200);
    expect((await api.getPart(partB.pk as number)).status()).toBe(200);
  });

  test('related missing part_2 @p1 @supporting', async ({ api, tracker, prefix }) => {
    // Covers: API-PART-193
    const partA = await createPart(api, tracker, { name: `${prefix}-rel-miss` });
    assertClientError(await api.createRelated({ part_1: partA.pk }));
  });

  test('related invalid part pk @p1 @supporting', async ({ api, tracker, prefix }) => {
    // Covers: API-PART-194
    const partA = await createPart(api, tracker, { name: `${prefix}-rel-inv` });
    assertClientError(await api.createRelated({ part_1: partA.pk, part_2: 99_999_999 }));
  });

  test('related note max length @p2 @supporting', async ({ api, tracker, prefix }) => {
    // Covers: API-PART-195
    const partA = await createPart(api, tracker, { name: `${prefix}-note-a` });
    const partB = await createPart(api, tracker, { name: `${prefix}-note-b` });
    const ok = await api.createRelated({
      part_1: partA.pk,
      part_2: partB.pk,
      note: padded(500, 'N')
    });
    expect(ok.status()).toBe(201);
    tracker.related.push((await ok.json()).pk as number);
    const partC = await createPart(api, tracker, { name: `${prefix}-note-c` });
    assertClientError(
      await api.createRelated({ part_1: partA.pk, part_2: partC.pk, note: padded(501, 'N') })
    );
  });

  test('related unknown id @p2 @supporting', async ({ api }) => {
    // Covers: API-PART-201
    const response = await api.getRelated(99_999_999);
    const body = response.status() === 200 ? await response.json() : null;
    expect(response.status() === 200 && body?.pk).toBeFalsy();
  });

  test('relate part to itself @p2 @supporting', async ({ api, tracker, prefix }) => {
    // Covers: API-PART-189
    const part = await createPart(api, tracker, { name: `${prefix}-self-rel` });
    const response = await api.createRelated({ part_1: part.pk, part_2: part.pk });
    if (response.status() === 201) {
      tracker.related.push((await response.json()).pk as number);
      throw new Error('Self-relation persisted; product typically forbids this (not in schema)');
    }
    assertClientError(response);
  });

  test('list test templates @p1 @supporting', async ({ api }) => {
    // Covers: API-PART-202
    const response = await api.listTestTemplates({ limit: 5 });
    expect(response.status()).toBe(200);
    assertPaginatedList(await response.json());
  });

  test('test template CRUD @p1 @supporting', async ({ api, tracker, prefix }) => {
    // Covers: API-PART-203, API-PART-210, API-PART-211, API-PART-212
    const part = await createPart(api, tracker, { name: `${prefix}-tmpl`, testable: true });
    const created = await api.createTestTemplate({
      part: part.pk,
      test_name: 'Firmware Version',
      description: 'QA template'
    });
    expect(created.status(), await created.text()).toBe(201);
    const body = await created.json();
    tracker.templates.push(body.pk as number);
    expect(body.test_name).toBe('Firmware Version');
    expect(body.key).toBeTruthy();

    const listed = await api.listTestTemplates({ part: part.pk as number, limit: 50 });
    expect(parseList(await listed.json()).some((item) => item.pk === body.pk)).toBe(true);

    const fetched = await api.getTestTemplate(body.pk as number);
    expect(fetched.status()).toBe(200);
    expect((await fetched.json()).key).toBe(body.key);

    const patched = await api.patchTestTemplate(body.pk as number, { enabled: false });
    expect(patched.status()).toBe(200);
    const patchedBody = await patched.json();
    expect(patchedBody.enabled).toBe(false);
    expect(patchedBody.key).toBe(body.key);

    tracker.templates = tracker.templates.filter((id) => id !== body.pk);
    expect((await api.deleteTestTemplate(body.pk as number)).status()).toBe(204);
  });

  test('test template client key ignored @p2 @supporting', async ({ api, tracker, prefix }) => {
    // Covers: API-PART-204
    const part = await createPart(api, tracker, { name: `${prefix}-key`, testable: true });
    const response = await api.createTestTemplate({
      part: part.pk,
      test_name: 'Client Key',
      key: 'hacked',
      description: 'QA template'
    });
    expect(response.status()).toBe(201);
    const body = await response.json();
    tracker.templates.push(body.pk as number);
    expect(body.key === 'hacked' ? body.key === 'clientkey' : true).toBe(true);
  });

  for (const [id, factory] of [
    ['missing-test-name', (pk: number) => ({ part: pk, description: 'QA template' })],
    ['missing-part', () => ({ test_name: 'X', description: 'QA template' })]
  ] as const) {
    test(`test template ${id} @p1 @supporting`, async ({ api, tracker, prefix }) => {
      // Covers: API-PART-205
      const part = await createPart(api, tracker, { name: `${prefix}-req`, testable: true });
      assertClientError(await api.createTestTemplate(factory(part.pk as number)));
    });
  }

  test('test_name length 100 vs 101 @p1 @supporting', async ({ api, tracker, prefix }) => {
    // Covers: API-PART-206
    const part = await createPart(api, tracker, { name: `${prefix}-tn`, testable: true });
    const ok = await api.createTestTemplate({
      part: part.pk,
      test_name: padded(100, 'T'),
      description: 'QA template'
    });
    expect(ok.status(), await ok.text()).toBe(201);
    tracker.templates.push((await ok.json()).pk as number);
    assertClientError(
      await api.createTestTemplate({
        part: part.pk,
        test_name: padded(101, 'T'),
        description: 'QA template'
      })
    );
  });

  test('test template invalid part @p1 @supporting', async ({ api }) => {
    // Covers: API-PART-208
    assertClientError(
      await api.createTestTemplate({ part: 99_999_999, test_name: 'X', description: 'QA template' })
    );
  });

  test('part requirements @p2 @supporting', async ({ api, tracker, prefix }) => {
    // Covers: API-PART-231
    const part = await createPart(api, tracker, { name: `${prefix}-req-snap` });
    const response = await api.partRequirements(part.pk as number);
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual(expect.any(Object));
  });

  test('part serial numbers @p2 @supporting', async ({ api, tracker, prefix }) => {
    // Covers: API-PART-232
    const part = await createPart(api, tracker, { name: `${prefix}-sn`, trackable: true });
    const response = await api.partSerialNumbers(part.pk as number);
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual(expect.any(Object));
  });

  test('part pricing @p2 @supporting', async ({ api, tracker, prefix }) => {
    // Covers: API-PART-228
    const part = await createPart(api, tracker, { name: `${prefix}-price` });
    const response = await api.partPricing(part.pk as number);
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual(expect.any(Object));
  });

  test('pricing unknown part @p2 @supporting', async ({ api }) => {
    // Covers: API-PART-233
    const response = await api.partPricing(99_999_999);
    if (response.status() === 200) {
      const body = await response.json();
      expect(body).toEqual(expect.any(Object));
      expect((body as { pk?: number }).pk).not.toBe(99_999_999);
    } else {
      expect(response.status()).toBeGreaterThanOrEqual(400);
      expect(response.status()).toBeLessThan(500);
    }
  });

  test('bom copy missing part @p1 @supporting', async ({ api, tracker, prefix }) => {
    // Covers: API-PART-222
    const dest = await createPart(api, tracker, { name: `${prefix}-bom-dst`, assembly: true });
    assertClientError(await api.bomCopy(dest.pk as number, {}));
  });

  test('bom validate GET @p2 @supporting', async ({ api, tracker, prefix }) => {
    // Covers: API-PART-224
    const part = await createPart(api, tracker, { name: `${prefix}-bom-val`, assembly: true });
    const response = await api.bomValidate(part.pk as number);
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual(expect.any(Object));
  });

  test('list thumbs @p3 @supporting', async ({ api }) => {
    // Covers: API-PART-234
    const response = await api.listThumbs();
    expect(response.status()).toBe(200);
  });
});

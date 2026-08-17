import { BOOLEAN_FLAGS } from '../data/parts';
import { createCategory, createPart, expect, test } from '../fixtures/test';
import { assertPaginatedList, assertPartSchema, parseList } from '../schemas/part';

test.describe('Part list filters', () => {
  test('pagination limit and offset @p1 @filter', async ({ api, tracker, prefix }) => {
    // Covers: API-PART-036, API-PART-037
    for (let i = 0; i < 3; i += 1) {
      await createPart(api, tracker, { name: `${prefix}-page-${i}` });
    }
    const first = await api.listParts({ limit: 2, search: prefix });
    expect(first.status()).toBe(200);
    const body = await first.json();
    assertPaginatedList(body);
    expect(body.results.length).toBeLessThanOrEqual(2);
    expect(body.count).toBeGreaterThanOrEqual(3);
    if (body.count > 2) {
      expect(body.next).toBeTruthy();
    }

    const second = await api.listParts({ limit: 2, offset: 2, search: prefix });
    expect(second.status()).toBe(200);
    const firstPks = new Set(parseList(body).map((item) => item.pk));
    const secondPks = new Set(parseList(await second.json()).map((item) => item.pk));
    for (const pk of secondPks) {
      expect(firstPks.has(pk as number)).toBe(false);
    }
  });

  test('offset 0 matches first page @p2 @filter', async ({ api, tracker, prefix }) => {
    // Covers: API-PART-038
    await createPart(api, tracker, { name: `${prefix}-off0` });
    const a = parseList(await (await api.listParts({ limit: 5, search: prefix })).json());
    const b = parseList(await (await api.listParts({ limit: 5, offset: 0, search: prefix })).json());
    expect(a.map((item) => item.pk)).toEqual(b.map((item) => item.pk));
  });

  test('offset beyond count @p2 @filter', async ({ api, tracker, prefix }) => {
    // Covers: API-PART-039
    await createPart(api, tracker, { name: `${prefix}-beyond` });
    const listed = await api.listParts({ search: prefix, limit: 50 });
    const count = (await listed.json()).count as number;
    const response = await api.listParts({ search: prefix, limit: 10, offset: count + 10 });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.results).toEqual([]);
    expect(body.count).toBe(count);
  });

  for (const limit of [0, -1]) {
    test(`limit ${limit} does not 500 @p2 @filter`, async ({ api }) => {
      // Covers: API-PART-040
      const response = await api.listParts({ limit });
      expect(response.status()).not.toBe(500);
    });
  }

  test('limit/offset wrong type does not 500 @p2 @filter', async ({ api }) => {
    // Covers: API-PART-041
    const response = await api.listParts({ limit: 'abc', offset: 'xyz' });
    expect(response.status()).not.toBe(500);
  });

  test('ordering by name @p2 @filter', async ({ api, tracker, prefix }) => {
    // Covers: API-PART-042
    await createPart(api, tracker, { name: `${prefix}-ord-a` });
    await createPart(api, tracker, { name: `${prefix}-ord-z` });
    const asc = await api.listParts({ search: prefix, ordering: 'name' });
    const desc = await api.listParts({ search: prefix, ordering: '-name' });
    expect(asc.status()).toBe(200);
    expect(desc.status()).toBe(200);
    const ascNames = parseList(await asc.json()).map((item) => item.name as string);
    const descNames = parseList(await desc.json()).map((item) => item.name as string);
    expect(ascNames).toEqual([...ascNames].sort());
    expect(descNames).toEqual([...descNames].sort().reverse());
  });

  test('filter active true and false @p1 @filter', async ({ api, tracker, prefix }) => {
    // Covers: API-PART-044
    const active = await createPart(api, tracker, { name: `${prefix}-act-t`, active: true });
    const inactive = await createPart(api, tracker, { name: `${prefix}-act-f`, active: true });
    expect((await api.patchPart(inactive.pk as number, { active: false })).status()).toBe(200);

    const trueList = await api.listParts({ search: prefix, active: true });
    const falseList = await api.listParts({ search: prefix, active: false });
    expect(trueList.status()).toBe(200);
    expect(falseList.status()).toBe(200);
    const trueRows = parseList(await trueList.json());
    const falseRows = parseList(await falseList.json());
    expect(trueRows.every((item) => item.active === true)).toBe(true);
    expect(falseRows.every((item) => item.active === false)).toBe(true);
    expect(trueRows.some((item) => item.pk === active.pk)).toBe(true);
    expect(falseRows.some((item) => item.pk === inactive.pk)).toBe(true);
    expect(trueRows.some((item) => item.pk === inactive.pk)).toBe(false);
  });

  for (const flag of BOOLEAN_FLAGS) {
    for (const value of [true, false]) {
      test(`boolean filter ${flag}=${value} @p1 @filter`, async ({ api, tracker, prefix }) => {
        // Covers: API-PART-045
        const payload: Record<string, unknown> = { name: `${prefix}-${flag}-${value}`, [flag]: value };
        const response = await api.createPart(payload);
        if (response.status() !== 201) {
          test.skip(true, `Server rejected create with ${flag}=${value}`);
        }
        const created = await response.json();
        tracker.parts.push(created.pk as number);
        const listed = await api.listParts({ search: created.name as string, [flag]: value });
        expect(listed.status()).toBe(200);
        const results = parseList(await listed.json());
        expect(results.length).toBeGreaterThan(0);
        expect(results.some((item) => item.pk === created.pk)).toBe(true);
      });
    }
  }

  test('filter by category pk @p1 @filter', async ({ api, tracker, prefix }) => {
    // Covers: API-PART-047
    const catA = await createCategory(api, tracker, { name: `${prefix}-cat-a` });
    const catB = await createCategory(api, tracker, { name: `${prefix}-cat-b` });
    const partA = await createPart(api, tracker, { name: `${prefix}-in-a`, category: catA.pk });
    const partB = await createPart(api, tracker, { name: `${prefix}-in-b`, category: catB.pk });
    const response = await api.listParts({ category: catA.pk as number });
    expect(response.status()).toBe(200);
    const results = parseList(await response.json());
    expect(results.every((item) => item.category === catA.pk)).toBe(true);
    const pks = new Set(results.map((item) => item.pk));
    expect(pks.has(partA.pk as number)).toBe(true);
    expect(pks.has(partB.pk as number)).toBe(false);
  });

  test('cascade category filter @p1 @filter', async ({ api, tracker, prefix }) => {
    // Covers: API-PART-048
    const parent = await createCategory(api, tracker, { name: `${prefix}-parent` });
    const child = await createCategory(api, tracker, { name: `${prefix}-child`, parent: parent.pk });
    const inParent = await createPart(api, tracker, { name: `${prefix}-p-part`, category: parent.pk });
    const inChild = await createPart(api, tracker, { name: `${prefix}-c-part`, category: child.pk });

    const cascaded = await api.listParts({ category: parent.pk as number, cascade: true });
    expect(cascaded.status()).toBe(200);
    const cascadedPks = new Set(parseList(await cascaded.json()).map((item) => item.pk));
    expect(cascadedPks.has(inParent.pk as number)).toBe(true);
    expect(cascadedPks.has(inChild.pk as number)).toBe(true);

    const direct = await api.listParts({ category: parent.pk as number, cascade: false });
    expect(direct.status()).toBe(200);
    const directPks = new Set(parseList(await direct.json()).map((item) => item.pk));
    expect(directPks.has(inParent.pk as number)).toBe(true);
  });

  test('filter uncategorized category=null @p2 @filter', async ({ api, tracker, prefix }) => {
    // Covers: API-PART-049
    const created = await createPart(api, tracker, { name: `${prefix}-nocat`, category: null });
    const response = await api.listParts({ category: 'null', search: prefix });
    expect(response.status()).toBe(200);
    const results = parseList(await response.json());
    expect(results.every((item) => item.category === null)).toBe(true);
    expect(results.some((item) => item.pk === created.pk)).toBe(true);
  });

  test('unknown category filter @p2 @filter', async ({ api }) => {
    // Covers: API-PART-050
    const response = await api.listParts({ category: 99_999_999 });
    expect(response.status()).not.toBe(500);
    if (response.status() === 200) {
      const body = await response.json();
      if (!Array.isArray(body)) {
        assertPaginatedList(body);
      }
    }
  });

  test('filter exact IPN @p1 @filter', async ({ api, tracker, prefix }) => {
    // Covers: API-PART-051
    const ipn = `API-IPN-${prefix.slice(-8)}`;
    const created = await createPart(api, tracker, { name: `${prefix}-ipn`, IPN: ipn });
    await createPart(api, tracker, { name: `${prefix}-other`, IPN: `OTHER-${prefix.slice(-8)}` });
    const response = await api.listParts({ IPN: ipn });
    expect(response.status()).toBe(200);
    const results = parseList(await response.json());
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((item) => item.IPN === ipn)).toBe(true);
    expect(results.some((item) => item.pk === created.pk)).toBe(true);
  });

  test('filter IPN_regex @p2 @filter', async ({ api, tracker, prefix }) => {
    // Covers: API-PART-052
    const ipn = `API-IPN-${prefix.slice(-8)}`;
    const created = await createPart(api, tracker, { name: `${prefix}-rx`, IPN: ipn });
    const response = await api.listParts({ IPN_regex: '^API-IPN-' });
    expect(response.status()).toBe(200);
    const results = parseList(await response.json());
    expect(results.some((item) => item.pk === created.pk)).toBe(true);
    expect(results.every((item) => String(item.IPN ?? '').startsWith('API-IPN-'))).toBe(true);
  });

  test('filter has_ipn @p2 @filter', async ({ api, tracker, prefix }) => {
    // Covers: API-PART-054
    const withIpn = await createPart(api, tracker, { name: `${prefix}-has`, IPN: `HAS-${prefix.slice(-6)}` });
    const without = await createPart(api, tracker, { name: `${prefix}-noipn` });
    const yes = await api.listParts({ search: prefix, has_ipn: true });
    const no = await api.listParts({ search: prefix, has_ipn: false });
    expect(yes.status()).toBe(200);
    expect(no.status()).toBe(200);
    expect(parseList(await yes.json()).some((item) => item.pk === withIpn.pk)).toBe(true);
    expect(parseList(await no.json()).some((item) => item.pk === without.pk)).toBe(true);
  });

  test('search by name @p1 @filter', async ({ api, tracker, prefix }) => {
    // Covers: API-PART-055
    const created = await createPart(api, tracker, { name: `${prefix}-search-me` });
    const response = await api.listParts({ search: prefix });
    expect(response.status()).toBe(200);
    expect(parseList(await response.json()).some((item) => item.pk === created.pk)).toBe(true);
  });

  for (const field of ['IPN', 'description', 'keywords'] as const) {
    test(`search documented field ${field} @p2 @filter`, async ({ api, tracker, prefix }) => {
      // Covers: API-PART-056
      const needle = `${prefix}-${field}`;
      const created = await createPart(api, tracker, { name: `${prefix}-by-${field}`, [field]: needle });
      const response = await api.listParts({ search: needle });
      expect(response.status()).toBe(200);
      expect(parseList(await response.json()).some((item) => item.pk === created.pk)).toBe(true);
    });
  }

  test('name_regex @p2 @filter', async ({ api, tracker, prefix }) => {
    // Covers: API-PART-057
    const created = await createPart(api, tracker, { name: `${prefix}-regex` });
    const response = await api.listParts({ name_regex: `^${prefix}` });
    expect(response.status()).toBe(200);
    expect(parseList(await response.json()).some((item) => item.pk === created.pk)).toBe(true);
  });

  test('exclude_id @p2 @filter', async ({ api, tracker, prefix }) => {
    // Covers: API-PART-063
    const a = await createPart(api, tracker, { name: `${prefix}-ex-a` });
    const b = await createPart(api, tracker, { name: `${prefix}-ex-b` });
    const response = await api.listParts({ search: prefix, exclude_id: String(a.pk) });
    expect(response.status()).toBe(200);
    const pks = new Set(parseList(await response.json()).map((item) => item.pk));
    expect(pks.has(a.pk as number)).toBe(false);
    expect(pks.has(b.pk as number)).toBe(true);
  });

  test('combined filter search pagination @p2 @filter', async ({ api, tracker, prefix }) => {
    // Covers: API-PART-065
    await createPart(api, tracker, { name: `${prefix}-combo`, active: true });
    const response = await api.listParts({ active: true, search: prefix, limit: 1 });
    expect(response.status()).toBe(200);
    const body = await response.json();
    assertPaginatedList(body);
    expect(body.results.length).toBeLessThanOrEqual(1);
    expect(parseList(body).every((item) => item.active === true)).toBe(true);
    if (body.results.length) {
      assertPartSchema(body.results[0]);
    }
  });
});

import { createCategory, expect, test } from '../fixtures/test';
import {
  assertCategorySchema,
  assertClientError,
  assertPaginatedList,
  parseList
} from '../schemas/part';
import { padded } from '../utils/unique';

test.describe('Part categories', () => {
  test('list categories @p1 @category', async ({ api, tracker, prefix }) => {
    // Covers: API-PART-106
    const created = await createCategory(api, tracker, { name: `${prefix}-list` });
    const response = await api.listCategories({ limit: 50, search: prefix });
    expect(response.status()).toBe(200);
    const body = await response.json();
    assertPaginatedList(body);
    expect(parseList(body).some((item) => item.pk === created.pk)).toBe(true);
    if (body.results.length) {
      assertCategorySchema(body.results[0]);
    }
  });

  test('create root category @p1 @category', async ({ api, tracker, prefix }) => {
    // Covers: API-PART-107
    const name = `${prefix}-electronics`;
    const response = await api.createCategory({ name });
    expect(response.status()).toBe(201);
    const body = await response.json();
    tracker.categories.push(body.pk as number);
    assertCategorySchema(body);
    expect(body.name).toBe(name);
    expect(body.parent).toBeNull();
    expect(typeof body.pathstring).toBe('string');
    const fetched = await api.getCategory(body.pk as number);
    expect(fetched.status()).toBe(200);
    expect((await fetched.json()).pk).toBe(body.pk);
  });

  test('create child category @p1 @category', async ({ api, tracker, prefix }) => {
    // Covers: API-PART-108
    const parent = await createCategory(api, tracker, { name: `${prefix}-parent` });
    const child = await createCategory(api, tracker, { name: `${prefix}-child`, parent: parent.pk });
    expect(child.parent).toBe(parent.pk);
  });

  test('create category optional fields @p2 @category', async ({ api, tracker, prefix }) => {
    // Covers: API-PART-109
    const body = await createCategory(api, tracker, {
      name: `${prefix}-opts`,
      description: 'optional',
      default_keywords: 'resistor',
      structural: false
    });
    expect(body.description).toBe('optional');
    expect(body.structural).toBe(false);
  });

  test('get category by id @p1 @category', async ({ api, tracker, prefix }) => {
    // Covers: API-PART-110
    const created = await createCategory(api, tracker, { name: `${prefix}-get` });
    const response = await api.getCategory(created.pk as number, { path_detail: true });
    expect(response.status()).toBe(200);
    const body = await response.json();
    assertCategorySchema(body);
    expect(body.pk).toBe(created.pk);
  });

  test('patch category rename @p1 @category', async ({ api, tracker, prefix }) => {
    // Covers: API-PART-111
    const created = await createCategory(api, tracker, { name: `${prefix}-rename` });
    const newName = `${prefix}-renamed`;
    const response = await api.patchCategory(created.pk as number, { name: newName });
    expect(response.status()).toBe(200);
    expect((await response.json()).name).toBe(newName);
    expect((await (await api.getCategory(created.pk as number)).json()).name).toBe(newName);
  });

  test('put category @p2 @category', async ({ api, tracker, prefix }) => {
    // Covers: API-PART-112
    const created = await createCategory(api, tracker, { name: `${prefix}-put` });
    const payload = { name: `${prefix}-put-2`, description: 'updated', structural: false };
    const response = await api.putCategory(created.pk as number, payload);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.name).toBe(payload.name);
    expect(body.pk).toBe(created.pk);
  });

  test('delete empty category @p1 @category', async ({ api, tracker, prefix }) => {
    // Covers: API-PART-113
    const created = await createCategory(api, tracker, { name: `${prefix}-del` });
    const pk = created.pk as number;
    tracker.categories = tracker.categories.filter((id) => id !== pk);
    const response = await api.deleteCategory(pk);
    expect(response.status()).toBe(204);
    const follow = await api.getCategory(pk);
    expect(follow.status() === 200 && (await follow.json()).pk === pk).toBeFalsy();
  });

  test('create category missing name @p1 @category', async ({ api }) => {
    // Covers: API-PART-114
    assertClientError(await api.createCategory({}));
  });

  test('category name length 100 vs 101 @p1 @category', async ({ api, tracker }) => {
    // Covers: API-PART-115
    const ok = await api.createCategory({ name: padded(100, 'C') });
    expect(ok.status()).toBe(201);
    tracker.categories.push((await ok.json()).pk as number);
    assertClientError(await api.createCategory({ name: padded(101, 'C') }));
  });

  test('category description length @p2 @category', async ({ api, tracker, prefix }) => {
    // Covers: API-PART-116
    const ok = await api.createCategory({ name: `${prefix}-d250`, description: padded(250, 'D') });
    expect(ok.status()).toBe(201);
    tracker.categories.push((await ok.json()).pk as number);
    assertClientError(await api.createCategory({ name: `${prefix}-d251`, description: padded(251, 'D') }));
  });

  test('invalid parent pk @p1 @category', async ({ api, prefix }) => {
    // Covers: API-PART-119
    assertClientError(await api.createCategory({ name: `${prefix}-bad-parent`, parent: 99_999_999 }));
  });

  test('parent wrong type @p2 @category', async ({ api, prefix }) => {
    // Covers: API-PART-120
    assertClientError(await api.createCategory({ name: `${prefix}-par-str`, parent: 'root' }));
  });

  test('parent null is root @p2 @category', async ({ api, tracker, prefix }) => {
    // Covers: API-PART-121
    const body = await createCategory(api, tracker, { name: `${prefix}-root-null`, parent: null });
    expect(body.parent).toBeNull();
  });

  test('cannot set parent to self @p1 @category', async ({ api, tracker, prefix }) => {
    // Covers: API-PART-122
    const created = await createCategory(api, tracker, { name: `${prefix}-self` });
    const response = await api.patchCategory(created.pk as number, { parent: created.pk });
    if (response.status() === 200) {
      expect((await response.json()).parent).not.toBe(created.pk);
    } else {
      assertClientError(response);
    }
  });

  test('cannot set parent to descendant @p1 @category', async ({ api, tracker, prefix }) => {
    // Covers: API-PART-123
    const parent = await createCategory(api, tracker, { name: `${prefix}-cyc-p` });
    const child = await createCategory(api, tracker, { name: `${prefix}-cyc-c`, parent: parent.pk });
    const response = await api.patchCategory(parent.pk as number, { parent: child.pk });
    if (response.status() === 200) {
      expect((await response.json()).parent).not.toBe(child.pk);
    } else {
      assertClientError(response);
    }
  });

  test('filter categories by parent @p1 @category', async ({ api, tracker, prefix }) => {
    // Covers: API-PART-124
    const parent = await createCategory(api, tracker, { name: `${prefix}-fp` });
    const child = await createCategory(api, tracker, { name: `${prefix}-fc`, parent: parent.pk });
    const response = await api.listCategories({ parent: parent.pk as number });
    expect(response.status()).toBe(200);
    const results = parseList(await response.json());
    expect(results.every((item) => item.parent === parent.pk)).toBe(true);
    expect(results.some((item) => item.pk === child.pk)).toBe(true);
  });

  test('filter top_level categories @p1 @category', async ({ api, tracker, prefix }) => {
    // Covers: API-PART-125
    const root = await createCategory(api, tracker, { name: `${prefix}-top` });
    const child = await createCategory(api, tracker, { name: `${prefix}-not-top`, parent: root.pk });
    const response = await api.listCategories({ top_level: true, search: prefix });
    expect(response.status()).toBe(200);
    const results = parseList(await response.json());
    const pks = new Set(results.map((item) => item.pk));
    expect(pks.has(root.pk as number)).toBe(true);
    expect(pks.has(child.pk as number)).toBe(false);
  });

  test('search categories @p1 @category', async ({ api, tracker, prefix }) => {
    // Covers: API-PART-127
    const created = await createCategory(api, tracker, { name: `${prefix}-search` });
    const response = await api.listCategories({ search: prefix });
    expect(response.status()).toBe(200);
    expect(parseList(await response.json()).some((item) => item.pk === created.pk)).toBe(true);
  });

  test('category pagination @p1 @category', async ({ api, tracker, prefix }) => {
    // Covers: API-PART-130
    for (let i = 0; i < 3; i += 1) {
      await createCategory(api, tracker, { name: `${prefix}-pg-${i}` });
    }
    const response = await api.listCategories({ search: prefix, limit: 1, offset: 0 });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(parseList(body).length).toBeLessThanOrEqual(1);
    expect((body as { count: number }).count).toBeGreaterThanOrEqual(3);
  });

  test('category ordering by name @p2 @category', async ({ api, tracker, prefix }) => {
    // Covers: API-PART-131
    await createCategory(api, tracker, { name: `${prefix}-ord-a` });
    await createCategory(api, tracker, { name: `${prefix}-ord-z` });
    const response = await api.listCategories({ search: prefix, ordering: 'name' });
    expect(response.status()).toBe(200);
    const names = parseList(await response.json()).map((item) => item.name as string);
    expect(names).toEqual([...names].sort());
  });

  test('category tree @p1 @category', async ({ api, tracker, prefix }) => {
    // Covers: API-PART-132
    const parent = await createCategory(api, tracker, { name: `${prefix}-tree-p` });
    await createCategory(api, tracker, { name: `${prefix}-tree-c`, parent: parent.pk });
    const response = await api.categoryTree({ search: prefix });
    expect(response.status()).toBe(200);
    const body = await response.json();
    const items = Array.isArray(body) ? body : parseList(body);
    expect(items.length).toBeGreaterThan(0);
    expect(items.some((item) => item.pk === parent.pk)).toBe(true);
  });

  test('get unknown category @p1 @category', async ({ api }) => {
    // Covers: API-PART-134
    const response = await api.getCategory(99_999_999);
    const body = response.status() === 200 ? await response.json() : null;
    expect(response.status() === 200 && body?.pk).toBeFalsy();
  });

  test('category read-only fields not overwritten @p1 @category', async ({ api, tracker, prefix }) => {
    // Covers: API-PART-135
    const created = await createCategory(api, tracker, { name: `${prefix}-ro` });
    const original = await (await api.getCategory(created.pk as number)).json();
    const response = await api.patchCategory(created.pk as number, {
      pathstring: 'hack',
      level: 99,
      pk: 1
    });
    if (response.status() === 200) {
      const body = await response.json();
      expect(body.pk).toBe(created.pk);
      expect(body.pathstring === 'hack' ? body.pathstring === original.pathstring : true).toBe(true);
    } else {
      assertClientError(response);
    }
  });

  test('create structural category @p1 @category', async ({ api, tracker, prefix }) => {
    // Covers: API-PART-136
    const body = await createCategory(api, tracker, { name: `${prefix}-struct`, structural: true });
    expect(body.structural).toBe(true);
  });
});

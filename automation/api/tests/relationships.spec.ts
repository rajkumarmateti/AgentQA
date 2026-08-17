import { createCategory, createPart, expect, test } from '../fixtures/test';
import { assertClientError, listPks } from '../schemas/part';

test.describe('Relationship integrity', () => {
  test('assign existing non-structural category @p1 @relationship', async ({ api, tracker, prefix }) => {
    // Covers: API-PART-141
    const category = await createCategory(api, tracker, { name: `${prefix}-rel-cat`, structural: false });
    const part = await createPart(api, tracker, { name: `${prefix}-rel-part`, category: category.pk });
    expect(part.category).toBe(category.pk);
    const fetched = await (await api.getPart(part.pk as number)).json();
    expect(fetched.category).toBe(category.pk);
  });

  test('category does not exist @p1 @relationship', async ({ api, prefix }) => {
    // Covers: API-PART-142
    const response = await api.createPart({ name: `${prefix}-bad-cat`, category: 99_999_999 });
    assertClientError(response);
    const listed = await api.listParts({ search: `${prefix}-bad-cat` });
    const body = await listed.json();
    if (Array.isArray(body)) {
      expect(body).toEqual([]);
    } else {
      expect(body.count).toBe(0);
    }
  });

  test('category pk pointing at a part @p2 @relationship', async ({ api, tracker, prefix }) => {
    // Covers: API-PART-143
    const part = await createPart(api, tracker, { name: `${prefix}-as-cat` });
    const response = await api.createPart({ name: `${prefix}-wrong-model`, category: part.pk });
    if (response.status() === 201) {
      const body = await response.json();
      tracker.parts.push(body.pk as number);
      const cat = await api.getCategory(part.pk as number);
      expect(cat.status(), 'Part PK was accepted as category but is not a category').toBe(200);
    } else {
      assertClientError(response);
    }
  });

  test('move part to another category @p1 @relationship', async ({ api, tracker, prefix }) => {
    // Covers: API-PART-144, API-PART-164
    const catA = await createCategory(api, tracker, { name: `${prefix}-move-a` });
    const catB = await createCategory(api, tracker, { name: `${prefix}-move-b` });
    const part = await createPart(api, tracker, { name: `${prefix}-move`, category: catA.pk });
    const response = await api.patchPart(part.pk as number, { category: catB.pk });
    expect(response.status()).toBe(200);
    expect((await response.json()).category).toBe(catB.pk);
    const inB = listPks(await (await api.listParts({ category: catB.pk as number })).json());
    const inA = listPks(
      await (await api.listParts({ category: catA.pk as number, cascade: false })).json()
    );
    expect(inB.has(part.pk as number)).toBe(true);
    expect(inA.has(part.pk as number)).toBe(false);
  });

  test('clear category @p2 @relationship', async ({ api, tracker, prefix }) => {
    // Covers: API-PART-145
    const category = await createCategory(api, tracker, { name: `${prefix}-clear` });
    const part = await createPart(api, tracker, { name: `${prefix}-uncat`, category: category.pk });
    const response = await api.patchPart(part.pk as number, { category: null });
    expect(response.status()).toBe(200);
    expect((await response.json()).category).toBeNull();
  });

  test('invalid default_location @p1 @relationship', async ({ api, prefix }) => {
    // Covers: API-PART-147
    assertClientError(await api.createPart({ name: `${prefix}-bad-loc`, default_location: 99_999_999 }));
  });

  test('cannot assign part to structural category @p1 @relationship', async ({ api, tracker, prefix }) => {
    // Covers: API-PART-148
    const structural = await createCategory(api, tracker, { name: `${prefix}-struct`, structural: true });
    const response = await api.createPart({ name: `${prefix}-on-struct`, category: structural.pk });
    assertClientError(response);
    const listed = await api.listParts({ search: `${prefix}-on-struct` });
    const body = await listed.json();
    if (Array.isArray(body)) {
      expect(body).toEqual([]);
    } else {
      expect(body.count).toBe(0);
    }
  });

  test('assign part to child of structural category @p2 @relationship', async ({ api, tracker, prefix }) => {
    // Covers: API-PART-149
    const structural = await createCategory(api, tracker, { name: `${prefix}-struct-p`, structural: true });
    const child = await createCategory(api, tracker, {
      name: `${prefix}-struct-c`,
      parent: structural.pk,
      structural: false
    });
    const part = await createPart(api, tracker, { name: `${prefix}-leaf`, category: child.pk });
    expect(part.category).toBe(child.pk);
  });

  test('revision_of valid part @p1 @relationship', async ({ api, tracker, prefix }) => {
    // Covers: API-PART-150
    const original = await createPart(api, tracker, { name: `${prefix}-rev-orig`, revision: 'A' });
    const revision = await createPart(api, tracker, {
      name: `${prefix}-rev-b`,
      revision: 'B',
      revision_of: original.pk
    });
    expect(revision.revision_of).toBe(original.pk);
    expect(revision.revision).toBe('B');
    const listed = await api.listParts({ revision_of: original.pk as number });
    expect(listed.status()).toBe(200);
    expect(listPks(await listed.json()).has(revision.pk as number)).toBe(true);
  });

  test('revision_of self rejected @p1 @relationship', async ({ api, tracker, prefix }) => {
    // Covers: API-PART-151
    const part = await createPart(api, tracker, { name: `${prefix}-self-rev` });
    const response = await api.patchPart(part.pk as number, { revision_of: part.pk });
    if (response.status() === 200) {
      expect((await response.json()).revision_of).not.toBe(part.pk);
    } else {
      assertClientError(response);
    }
  });

  test('revision_of invalid pk @p1 @relationship', async ({ api, prefix }) => {
    // Covers: API-PART-152
    assertClientError(await api.createPart({ name: `${prefix}-bad-rev`, revision_of: 99_999_999 }));
  });

  test('variant_of template @p1 @relationship', async ({ api, tracker, prefix }) => {
    // Covers: API-PART-155
    const template = await createPart(api, tracker, { name: `${prefix}-tpl`, is_template: true });
    const variant = await createPart(api, tracker, { name: `${prefix}-var`, variant_of: template.pk });
    expect(variant.variant_of).toBe(template.pk);
    const listed = await api.listParts({ variant_of: template.pk as number });
    expect(listed.status()).toBe(200);
    expect(listPks(await listed.json()).has(variant.pk as number)).toBe(true);
  });

  test('variant_of non-template @p2 @relationship', async ({ api, tracker, prefix }) => {
    // Covers: API-PART-156
    const base = await createPart(api, tracker, { name: `${prefix}-nontpl`, is_template: false });
    const response = await api.createPart({ name: `${prefix}-var-bad`, variant_of: base.pk });
    if (response.status() === 201) {
      const body = await response.json();
      tracker.parts.push(body.pk as number);
      expect(body.variant_of).toBe(base.pk);
    } else {
      assertClientError(response);
    }
  });

  test('variant_of invalid pk @p1 @relationship', async ({ api, prefix }) => {
    // Covers: API-PART-157
    assertClientError(await api.createPart({ name: `${prefix}-bad-var`, variant_of: 99_999_999 }));
  });
});

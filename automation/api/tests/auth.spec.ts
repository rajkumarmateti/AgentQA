import { InventreeClient } from '../clients/inventree';
import { createPart, expect, hasReadonlyUser, test } from '../fixtures/test';
import { assertClientError, assertPaginatedList } from '../schemas/part';
import { env } from '../utils/env';

test.describe('Auth and conflicts', () => {
  test('list parts without credentials @p1 @auth', async ({ anonApi }) => {
    // Covers: API-PART-166
    const response = await anonApi.listParts({ limit: 1 });
    const body = response.status() === 200 ? await response.json() : null;
    expect(response.status() === 200 && body && 'results' in body).toBeFalsy();
  });

  test('invalid token @p1 @auth', async () => {
    // Covers: API-PART-167
    const client = await InventreeClient.create({ token: 'invalidtoken' });
    const response = await client.listParts({ limit: 1 });
    const body = response.status() === 200 ? await response.json() : null;
    expect(response.status() === 200 && body && 'results' in body).toBeFalsy();
    await client.dispose();
  });

  test('token missing prefix @p1 @auth', async () => {
    // Covers: API-PART-168
    const basic = await InventreeClient.withBasic();
    let token = '';
    for (const path of ['user/token/', 'user/me/token/']) {
      const tokenRes = await basic.get(path);
      if (tokenRes.ok()) {
        const body = (await tokenRes.json()) as { token?: string; key?: string };
        token = body.token ?? body.key ?? '';
        if (token) {
          break;
        }
      }
    }
    await basic.dispose();
    if (!token) {
      test.skip(true, 'No raw token available to send without the Token prefix');
    }
    const client = await InventreeClient.withAuthorizationHeader(token);
    const response = await client.listParts({ limit: 1 });
    const body = response.status() === 200 ? await response.json() : null;
    expect(response.status() === 200 && body && 'results' in body).toBeFalsy();
    await client.dispose();
  });

  test('valid token auth @p1 @auth', async ({ api }) => {
    // Covers: API-PART-169
    const response = await api.listParts({ limit: 1 });
    expect(response.status()).toBe(200);
    assertPaginatedList(await response.json());
  });

  test('valid basic auth @p2 @auth', async () => {
    // Covers: API-PART-170
    const basic = await InventreeClient.withBasic();
    const response = await basic.listParts({ limit: 1 });
    expect(response.status()).toBe(200);
    assertPaginatedList(await response.json());
    await basic.dispose();
  });

  test('readonly cannot create part @p1 @auth', async ({ prefix }) => {
    // Covers: API-PART-171
    test.skip(!hasReadonlyUser(), 'INVENTREE_READONLY_USERNAME / PASSWORD not set');
    const client = await InventreeClient.create({
      username: env.readonlyUsername,
      password: env.readonlyPassword
    });
    const response = await client.createPart({ name: `${prefix}-forbidden-create` });
    expect(response.status()).toBe(403);
    const listed = await client.listParts({ search: `${prefix}-forbidden-create`, limit: 10 });
    if (listed.status() === 200) {
      const body = await listed.json();
      if (Array.isArray(body)) {
        expect(body).toEqual([]);
      } else {
        expect(body.count).toBe(0);
      }
    }
    await client.dispose();
  });

  test('readonly cannot patch part @p1 @auth', async ({ api, tracker, prefix }) => {
    // Covers: API-PART-172
    test.skip(!hasReadonlyUser(), 'INVENTREE_READONLY_USERNAME / PASSWORD not set');
    const client = await InventreeClient.create({
      username: env.readonlyUsername,
      password: env.readonlyPassword
    });
    const part = await createPart(api, tracker, { name: `${prefix}-ro-patch`, description: 'keep' });
    const response = await client.patchPart(part.pk as number, { description: 'nope' });
    expect(response.status()).toBe(403);
    expect((await (await api.getPart(part.pk as number)).json()).description).toBe('keep');
    await client.dispose();
  });

  test('readonly cannot delete part @p1 @auth', async ({ api, tracker, prefix }) => {
    // Covers: API-PART-173
    test.skip(!hasReadonlyUser(), 'INVENTREE_READONLY_USERNAME / PASSWORD not set');
    const client = await InventreeClient.create({
      username: env.readonlyUsername,
      password: env.readonlyPassword
    });
    const part = await createPart(api, tracker, { name: `${prefix}-ro-del` });
    const response = await client.deletePart(part.pk as number);
    expect(response.status()).toBe(403);
    expect((await api.getPart(part.pk as number)).status()).toBe(200);
    await client.dispose();
  });

  test('readonly cannot create category @p1 @auth', async ({ prefix }) => {
    // Covers: API-PART-174
    test.skip(!hasReadonlyUser(), 'INVENTREE_READONLY_USERNAME / PASSWORD not set');
    const client = await InventreeClient.create({
      username: env.readonlyUsername,
      password: env.readonlyPassword
    });
    const response = await client.createCategory({ name: `${prefix}-no-cat` });
    expect(response.status()).toBe(403);
    await client.dispose();
  });

  test('readonly can list if view granted @p2 @auth', async () => {
    // Covers: API-PART-175
    test.skip(!hasReadonlyUser(), 'INVENTREE_READONLY_USERNAME / PASSWORD not set');
    const client = await InventreeClient.create({
      username: env.readonlyUsername,
      password: env.readonlyPassword
    });
    const response = await client.listParts({ limit: 1 });
    expect(response.status()).toBe(200);
    assertPaginatedList(await response.json());
    await client.dispose();
  });

  test('duplicate name not assumed unique @p1 @auth', async ({ api, tracker, prefix }) => {
    // Covers: API-PART-183
    const name = `${prefix}-dup-name`;
    const first = await createPart(api, tracker, { name });
    const second = await api.createPart({ name });
    if (second.status() === 201) {
      const body = await second.json();
      tracker.parts.push(body.pk as number);
      expect(body.pk).not.toBe(first.pk);
    } else {
      assertClientError(second);
    }
  });

  test('duplicate IPN when allowed @p2 @auth', async ({ api, tracker, prefix }) => {
    // Covers: API-PART-185
    const ipn = `DUP-${prefix.slice(-8)}`;
    await createPart(api, tracker, { name: `${prefix}-ipn-a`, IPN: ipn });
    const second = await api.createPart({ name: `${prefix}-ipn-b`, IPN: ipn });
    if (second.status() === 201) {
      const body = await second.json();
      tracker.parts.push(body.pk as number);
      expect(body.IPN).toBe(ipn);
    } else {
      test.skip(true, 'Instance rejects duplicate IPN (product setting, not in this schema)');
    }
  });

  test('sequential patch last write wins @p3 @auth', async ({ api, tracker, prefix }) => {
    // Covers: API-PART-186
    const part = await createPart(api, tracker, { name: `${prefix}-lost` });
    const a = await api.patchPart(part.pk as number, { description: 'A' });
    const b = await api.patchPart(part.pk as number, { description: 'B' });
    expect(a.status()).toBe(200);
    expect(b.status()).toBe(200);
    expect((await (await api.getPart(part.pk as number)).json()).description).toBe('B');
  });
});

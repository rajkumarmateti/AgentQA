import { test as base, expect } from '@playwright/test';
import { InventreeClient, type Json } from '../clients/inventree';
import { env, hasReadonlyUser } from '../utils/env';
import { uniqueName } from '../utils/unique';

export type Tracker = {
  parts: number[];
  categories: number[];
  related: number[];
  templates: number[];
};

type Fixtures = {
  api: InventreeClient;
  anonApi: InventreeClient;
  prefix: string;
  tracker: Tracker;
};

export const test = base.extend<Fixtures>({
  api: async ({}, use) => {
    const client = await InventreeClient.create();
    const probe = await client.listParts({ limit: 1 });
    if (probe.status() === 401 || probe.status() === 403) {
      throw new Error(
        `Authentication failed against ${env.baseUrl} (HTTP ${probe.status()}). Check INVENTREE_USERNAME / INVENTREE_PASSWORD.`
      );
    }
    if (!probe.ok()) {
      throw new Error(`GET /api/part/ failed: HTTP ${probe.status()} ${await probe.text()}`);
    }
    await use(client);
    await client.dispose();
  },
  anonApi: async ({}, use) => {
    const client = await InventreeClient.create({ authenticate: false });
    await use(client);
    await client.dispose();
  },
  prefix: async ({}, use) => {
    await use(uniqueName('QA-API'));
  },
  tracker: async ({ api }, use) => {
    const created: Tracker = { parts: [], categories: [], related: [], templates: [] };
    await use(created);
    await cleanup(api, created);
  }
});

export { expect, hasReadonlyUser };

export async function createPart(api: InventreeClient, tracker: Tracker, fields: Json): Promise<Json> {
  const response = await api.createPart(fields);
  expect(response.status(), await response.text()).toBe(201);
  const body = (await response.json()) as Json;
  tracker.parts.push(body.pk as number);
  return body;
}

export async function createCategory(api: InventreeClient, tracker: Tracker, fields: Json): Promise<Json> {
  const response = await api.createCategory(fields);
  expect(response.status(), await response.text()).toBe(201);
  const body = (await response.json()) as Json;
  tracker.categories.push(body.pk as number);
  return body;
}

async function cleanup(api: InventreeClient, created: Tracker): Promise<void> {
  for (const pk of [...created.related].reverse()) {
    await api.deleteRelated(pk);
  }
  for (const pk of [...created.templates].reverse()) {
    await api.deleteTestTemplate(pk);
  }
  for (const pk of [...created.parts].reverse()) {
    await api.patchPart(pk, { active: false, locked: false });
    await api.deletePart(pk);
  }
  for (const pk of [...created.categories].reverse()) {
    await api.deleteCategory(pk);
  }
}

import { request, type APIRequestContext, type APIResponse } from '@playwright/test';
import { env } from '../utils/env';

export type Json = Record<string, unknown>;

type ClientOptions = {
  authenticate?: boolean;
  token?: string;
  username?: string;
  password?: string;
};

const toParams = (params?: Record<string, string | number | boolean | null>): Record<string, string> | undefined => {
  if (!params) {
    return undefined;
  }
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) {
      continue;
    }
    out[key] = String(value);
  }
  return out;
};

export class InventreeClient {
  constructor(private readonly ctx: APIRequestContext) {}

  static async create(options: ClientOptions = {}): Promise<InventreeClient> {
    const username = options.username ?? env.username;
    const password = options.password ?? env.password;
    const headers: Record<string, string> = { Accept: 'application/json' };

    if (options.token) {
      headers.Authorization = `Token ${options.token}`;
    } else if (options.authenticate !== false) {
      const token = await fetchToken(username, password);
      if (token) {
        headers.Authorization = `Token ${token}`;
      } else {
        headers.Authorization = basicAuth(username, password);
      }
    }

    const ctx = await request.newContext({
      baseURL: env.baseUrl,
      extraHTTPHeaders: headers,
      timeout: env.timeoutMs
    });
    return new InventreeClient(ctx);
  }

  static async withAuthorizationHeader(value: string): Promise<InventreeClient> {
    const ctx = await request.newContext({
      baseURL: env.baseUrl,
      extraHTTPHeaders: {
        Accept: 'application/json',
        Authorization: value
      },
      timeout: env.timeoutMs
    });
    return new InventreeClient(ctx);
  }

  static async withBasic(username = env.username, password = env.password): Promise<InventreeClient> {
    return InventreeClient.withAuthorizationHeader(
      `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`
    );
  }

  async dispose(): Promise<void> {
    await this.ctx.dispose();
  }

  get(path: string, params?: Record<string, string | number | boolean | null>): Promise<APIResponse> {
    return this.ctx.get(apiPath(path), { params: toParams(params) });
  }

  post(path: string, data?: unknown, headers?: Record<string, string>): Promise<APIResponse> {
    return this.ctx.post(apiPath(path), { data, headers });
  }

  patch(path: string, data?: unknown): Promise<APIResponse> {
    return this.ctx.patch(apiPath(path), { data });
  }

  put(path: string, data?: unknown): Promise<APIResponse> {
    return this.ctx.put(apiPath(path), { data });
  }

  delete(path: string, data?: unknown): Promise<APIResponse> {
    return this.ctx.delete(apiPath(path), data === undefined ? undefined : { data });
  }

  listParts(params: Record<string, string | number | boolean | null> = {}): Promise<APIResponse> {
    if (params.limit === undefined) {
      params.limit = 50;
    }
    return this.get('part/', params);
  }

  createPart(payload: Json): Promise<APIResponse> {
    return this.post('part/', payload);
  }

  getPart(pk: number, params?: Record<string, string | number | boolean | null>): Promise<APIResponse> {
    return this.get(`part/${pk}/`, params);
  }

  patchPart(pk: number, payload: Json): Promise<APIResponse> {
    return this.patch(`part/${pk}/`, payload);
  }

  putPart(pk: number, payload: Json): Promise<APIResponse> {
    return this.put(`part/${pk}/`, payload);
  }

  deletePart(pk: number): Promise<APIResponse> {
    return this.delete(`part/${pk}/`);
  }

  partRequirements(pk: number): Promise<APIResponse> {
    return this.get(`part/${pk}/requirements/`);
  }

  partSerialNumbers(pk: number): Promise<APIResponse> {
    return this.get(`part/${pk}/serial-numbers/`);
  }

  partPricing(pk: number): Promise<APIResponse> {
    return this.get(`part/${pk}/pricing/`);
  }

  bomCopy(pk: number, payload: Json): Promise<APIResponse> {
    return this.post(`part/${pk}/bom-copy/`, payload);
  }

  bomValidate(pk: number): Promise<APIResponse> {
    return this.get(`part/${pk}/bom-validate/`);
  }

  listCategories(params: Record<string, string | number | boolean | null> = {}): Promise<APIResponse> {
    if (params.limit === undefined) {
      params.limit = 50;
    }
    return this.get('part/category/', params);
  }

  createCategory(payload: Json): Promise<APIResponse> {
    return this.post('part/category/', payload);
  }

  getCategory(pk: number, params?: Record<string, string | number | boolean | null>): Promise<APIResponse> {
    return this.get(`part/category/${pk}/`, params);
  }

  patchCategory(pk: number, payload: Json): Promise<APIResponse> {
    return this.patch(`part/category/${pk}/`, payload);
  }

  putCategory(pk: number, payload: Json): Promise<APIResponse> {
    return this.put(`part/category/${pk}/`, payload);
  }

  deleteCategory(pk: number): Promise<APIResponse> {
    return this.delete(`part/category/${pk}/`, {
      delete_child_categories: true,
      delete_parts: true
    });
  }

  categoryTree(params?: Record<string, string | number | boolean | null>): Promise<APIResponse> {
    return this.get('part/category/tree/', params);
  }

  listRelated(params: Record<string, string | number | boolean | null> = {}): Promise<APIResponse> {
    if (params.limit === undefined) {
      params.limit = 50;
    }
    return this.get('part/related/', params);
  }

  createRelated(payload: Json): Promise<APIResponse> {
    return this.post('part/related/', payload);
  }

  getRelated(pk: number): Promise<APIResponse> {
    return this.get(`part/related/${pk}/`);
  }

  patchRelated(pk: number, payload: Json): Promise<APIResponse> {
    return this.patch(`part/related/${pk}/`, payload);
  }

  deleteRelated(pk: number): Promise<APIResponse> {
    return this.delete(`part/related/${pk}/`);
  }

  listTestTemplates(params: Record<string, string | number | boolean | null> = {}): Promise<APIResponse> {
    if (params.limit === undefined) {
      params.limit = 50;
    }
    return this.get('part/test-template/', params);
  }

  createTestTemplate(payload: Json): Promise<APIResponse> {
    return this.post('part/test-template/', payload);
  }

  getTestTemplate(pk: number): Promise<APIResponse> {
    return this.get(`part/test-template/${pk}/`);
  }

  patchTestTemplate(pk: number, payload: Json): Promise<APIResponse> {
    return this.patch(`part/test-template/${pk}/`, payload);
  }

  deleteTestTemplate(pk: number): Promise<APIResponse> {
    return this.delete(`part/test-template/${pk}/`);
  }

  listThumbs(): Promise<APIResponse> {
    return this.get('part/thumbs/');
  }
}

function apiPath(path: string): string {
  let normalized = path.replace(/^\//, '');
  if (!normalized.startsWith('api/')) {
    normalized = `api/${normalized}`;
  }
  if (!normalized.endsWith('/')) {
    normalized += '/';
  }
  return `/${normalized}`;
}

function basicAuth(username: string, password: string): string {
  return `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
}

async function fetchToken(username: string, password: string): Promise<string | undefined> {
  const ctx = await request.newContext({
    baseURL: env.baseUrl,
    extraHTTPHeaders: {
      Accept: 'application/json',
      Authorization: basicAuth(username, password)
    },
    timeout: env.timeoutMs
  });
  try {
    for (const path of ['/api/user/token/', '/api/user/me/token/']) {
      const response = await ctx.get(path);
      if (!response.ok()) {
        continue;
      }
      const body = (await response.json()) as { token?: string; key?: string };
      const value = body.token ?? body.key;
      if (value) {
        return String(value);
      }
    }
  } finally {
    await ctx.dispose();
  }
  return undefined;
}

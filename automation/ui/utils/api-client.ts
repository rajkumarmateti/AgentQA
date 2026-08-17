import { APIRequestContext, request } from '@playwright/test';
import { env } from './env';

type Json = Record<string, unknown>;

/**
 * API helpers for test *preparation and cleanup only*.
 * Behavior under test still goes through the UI.
 */
export class InventreeApi {
  constructor(private readonly api: APIRequestContext) {}

  static async create(): Promise<InventreeApi> {
    const context = await request.newContext({
      baseURL: env.baseUrl,
      extraHTTPHeaders: {
        Authorization: basicAuth(env.username, env.password)
      }
    });
    return new InventreeApi(context);
  }

  async close(): Promise<void> {
    await this.api.dispose();
  }

  async get<T = Json>(path: string, params?: Record<string, string>): Promise<T> {
    const response = await this.api.get(`/api/${path.replace(/^\//, '')}`, {
      params
    });
    if (!response.ok()) {
      throw new Error(`GET ${path} failed: ${response.status()} ${await response.text()}`);
    }
    return (await response.json()) as T;
  }

  async post<T = Json>(path: string, data: Json): Promise<T> {
    const response = await this.api.post(`/api/${path.replace(/^\//, '')}`, {
      data
    });
    if (!response.ok()) {
      throw new Error(`POST ${path} failed: ${response.status()} ${await response.text()}`);
    }
    return (await response.json()) as T;
  }

  async patch<T = Json>(path: string, data: Json): Promise<T> {
    const response = await this.api.patch(`/api/${path.replace(/^\//, '')}`, {
      data
    });
    if (!response.ok()) {
      throw new Error(`PATCH ${path} failed: ${response.status()} ${await response.text()}`);
    }
    return (await response.json()) as T;
  }

  async delete(path: string): Promise<number> {
    const response = await this.api.delete(`/api/${path.replace(/^\//, '')}`);
    return response.status();
  }

  async findPartByName(name: string): Promise<{ pk: number; name: string } | undefined> {
    const body = await this.get<unknown>('part/', { search: name, limit: '50' });
    const rows = Array.isArray(body)
      ? (body as Array<{ pk: number; name: string }>)
      : ((body as { results?: Array<{ pk: number; name: string }> }).results ?? []);
    return rows.find((part) => part.name === name);
  }

  async createCategory(name: string, parent?: number): Promise<{ pk: number; name: string }> {
    return this.post('part/category/', {
      name,
      description: `UI automation category ${name}`,
      ...(parent ? { parent } : {})
    });
  }

  async createPart(data: Json): Promise<{ pk: number; name: string }> {
    return this.post('part/', data);
  }

  async createStock(part: number, quantity: number, location?: number): Promise<Json> {
    return this.post('stock/', {
      part,
      quantity,
      ...(location ? { location } : {})
    });
  }

  async createParameterTemplate(name: string, units = ''): Promise<{ pk: number }> {
    const payload = { name, units };
    try {
      return await this.post('part/parameter/template/', payload);
    } catch {
      return this.post('generic/parameter/template/', {
        ...payload,
        model_type: 'part'
      });
    }
  }

  async createPartParameter(part: number, template: number, data: string): Promise<Json> {
    return this.post('part/parameter/', { part, template, data });
  }

  async deletePartByName(name: string): Promise<void> {
    const part = await this.findPartByName(name);
    if (!part) {
      return;
    }
    await this.patch(`part/${part.pk}/`, { active: false, locked: false });
    await this.delete(`part/${part.pk}/`);
  }

  async deleteCategory(pk: number): Promise<void> {
    await this.delete(`part/category/${pk}/`);
  }

  async firstLocationPk(): Promise<number | undefined> {
    const body = await this.get<{ results?: Array<{ pk: number }> }>('stock/location/', {
      limit: '1'
    });
    return body.results?.[0]?.pk;
  }

  async firstCategoryPk(): Promise<number | undefined> {
    const body = await this.get<{ results?: Array<{ pk: number }> }>('part/category/', {
      limit: '1'
    });
    return body.results?.[0]?.pk;
  }
}

const basicAuth = (username: string, password: string): string =>
  `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;

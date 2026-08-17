import { expect, type APIResponse } from '@playwright/test';

export type Json = Record<string, unknown>;

export const PART_REQUIRED_FIELDS = [
  'pk',
  'name',
  'full_name',
  'barcode_hash',
  'starred',
  'thumbnail'
] as const;

export const CATEGORY_REQUIRED_FIELDS = ['pk', 'name', 'pathstring', 'level'] as const;

export function parseList(body: unknown): Json[] {
  if (Array.isArray(body)) {
    return body as Json[];
  }
  if (body && typeof body === 'object' && Array.isArray((body as Json).results)) {
    return (body as { results: Json[] }).results;
  }
  throw new Error(`Expected paginated object or list, got ${typeof body}`);
}

export function listPks(body: unknown): Set<number> {
  return new Set(
    parseList(body)
      .map((item) => item.pk)
      .filter((pk): pk is number => typeof pk === 'number')
  );
}

export function assertPaginatedList(body: unknown): asserts body is {
  count: number;
  results: unknown[];
  next: string | null;
  previous: string | null;
} {
  expect(body).toEqual(
    expect.objectContaining({
      count: expect.any(Number),
      results: expect.any(Array)
    })
  );
}

export function assertPartSchema(body: unknown): asserts body is Json {
  expect(body).toEqual(expect.any(Object));
  const part = body as Json;
  for (const field of PART_REQUIRED_FIELDS) {
    expect(part, `missing ${field}`).toHaveProperty(field);
  }
  expect(part.pk).toEqual(expect.any(Number));
  expect(part.name).toEqual(expect.any(String));
  expect(part.full_name).toEqual(expect.any(String));
  expect(part.starred).toEqual(expect.any(Boolean));
}

export function assertCategorySchema(body: unknown): asserts body is Json {
  expect(body).toEqual(expect.any(Object));
  const category = body as Json;
  for (const field of CATEGORY_REQUIRED_FIELDS) {
    expect(category, `missing ${field}`).toHaveProperty(field);
  }
  expect(category.pk).toEqual(expect.any(Number));
  expect(category.name).toEqual(expect.any(String));
  expect(category.pathstring).toEqual(expect.any(String));
}

export function assertJsonContentType(response: APIResponse): void {
  const contentType = response.headers()['content-type'] ?? '';
  expect(contentType).toContain('application/json');
}

export function assertClientError(response: APIResponse): void {
  const status = response.status();
  expect(status, response.statusText()).toBeGreaterThanOrEqual(400);
  expect(status).toBeLessThan(500);
}

export async function jsonBody(response: APIResponse): Promise<unknown> {
  const text = await response.text();
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

import path from 'node:path';
import { config as loadEnv } from 'dotenv';

loadEnv({ path: path.resolve(__dirname, '..', '.env') });

export const env = {
  baseUrl: (process.env.BASE_URL ?? 'http://localhost:8000').replace(/\/$/, ''),
  username: process.env.INVENTREE_USERNAME ?? 'admin',
  password: process.env.INVENTREE_PASSWORD ?? 'inventree',
  readonlyUsername: process.env.INVENTREE_READONLY_USERNAME ?? '',
  readonlyPassword: process.env.INVENTREE_READONLY_PASSWORD ?? '',
  timeoutMs: Number(process.env.API_TIMEOUT_MS ?? 30_000)
};

export const hasReadonlyUser = (): boolean =>
  Boolean(env.readonlyUsername && env.readonlyPassword);

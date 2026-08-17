/**
 * Unique names so tests stay independent when run against a shared instance.
 */
export const uniqueSuffix = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

export const uniqueName = (prefix: string): string =>
  `${prefix}-${uniqueSuffix()}`;

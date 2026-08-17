export const uniqueSuffix = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

export const uniqueName = (prefix = 'QA-API'): string => `${prefix}-${uniqueSuffix()}`;

export const padded = (length: number, prefix = 'N'): string => {
  const body = uniqueName(prefix);
  if (body.length >= length) {
    return body.slice(0, length);
  }
  return body + 'x'.repeat(length - body.length);
};

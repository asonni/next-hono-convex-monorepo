export function serializeDates<T extends Record<string, unknown>>(
  obj: T,
  fields: (keyof T)[]
): T {
  const result = { ...obj };
  for (const field of fields) {
    const value = result[field];
    if (typeof value === 'number') {
      result[field] = new Date(
        value
      ).toISOString() as unknown as T[typeof field];
    }
  }
  return result;
}

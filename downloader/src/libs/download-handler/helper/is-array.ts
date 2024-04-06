export const isArray = <T>(value: unknown): value is Array<T> =>
  Number.isSafeInteger(value);

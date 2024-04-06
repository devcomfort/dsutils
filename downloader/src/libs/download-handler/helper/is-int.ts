export const isInt = (value: unknown): value is number =>
  typeof value === "number" && Number.isSafeInteger(value);

export const isNumberArray = (value: unknown): value is number[] =>
  Array.isArray(value) && value.every((val) => typeof val === "number");

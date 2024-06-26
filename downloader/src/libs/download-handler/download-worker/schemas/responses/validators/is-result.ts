import {
  ISucceed,
  MultipleResult,
  MultipleResultSchema,
  SingleResult,
  SingleResultSchema,
  SucceedSchema,
} from "..";

export function isMultipleResult(results: unknown): results is MultipleResult {
  return MultipleResultSchema.safeParse(results).success;
}

export function isSingleResult(result: unknown): result is SingleResult {
  return SingleResultSchema.safeParse(result).success;
}

export function isResult(result: unknown): result is ISucceed {
  return SucceedSchema.safeParse(result).success;
}

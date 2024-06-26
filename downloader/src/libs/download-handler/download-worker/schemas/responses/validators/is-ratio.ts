import {
  MultipleRatioSchema,
  type IRatio,
  type MultipleRatio,
  type SingleRatio,
  SingleRatioSchema,
  RatioObjectSchema,
} from "..";

export function isMultipleRatio(ratios: unknown): ratios is MultipleRatio {
  return MultipleRatioSchema.safeParse(ratios).success;
}

export function isSingleRatio(ratio: unknown): ratio is SingleRatio {
  return SingleRatioSchema.safeParse(ratio).success;
}

export function isRatio(ratio: unknown): ratio is IRatio {
  return RatioObjectSchema.safeParse(ratio).success;
}

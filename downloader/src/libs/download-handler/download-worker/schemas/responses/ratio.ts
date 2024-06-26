import { z } from "zod";
import { KeySchema } from "../core";
import { RatioSchema } from "../core/ratio/ratio";
import { RatiosSchema } from "../core/ratio/ratios";

export const SingleRatioSchema = z.object({
  type: z.literal("single-ratio"),
  message: RatioSchema,
  key: KeySchema,
});

export const MultipleRatioSchema = z.object({
  type: z.literal("multiple-ratio"),
  message: RatiosSchema,
  keys: KeySchema.array(),
});

export const RatioObjectSchema = z.union([
  SingleRatioSchema,
  MultipleRatioSchema,
]);

export type SingleRatio = z.infer<typeof SingleRatioSchema>;
export type MultipleRatio = z.infer<typeof MultipleRatioSchema>;
export type IRatio = z.infer<typeof RatioObjectSchema>;

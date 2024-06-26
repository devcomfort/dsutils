import { z } from "zod";
import { StateSchema } from "../core";

export const SingleResultSchema = z.object({
  type: z.literal("single-result"),
  message: StateSchema,
});
export const MultipleResultSchema = z.object({
  type: z.literal("multiple-result"),
  message: StateSchema.array(),
});

export const SucceedSchema = z.union([
  SingleResultSchema,
  MultipleResultSchema,
]);

export type SingleResult = z.infer<typeof SingleResultSchema>;
export type MultipleResult = z.infer<typeof MultipleResultSchema>;
export type ISucceed = z.infer<typeof SucceedSchema>;

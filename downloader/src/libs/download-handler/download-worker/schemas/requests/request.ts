import { z } from "zod";
import { KeySchema } from "../core";
import { DownloadRequestSchema } from "~/libs/download-handler/schema/download-request";

export const SingleRequestSchema = z.object({
  type: z.literal("single-request"),
  message: DownloadRequestSchema,
  key: KeySchema,
});

export const MultipleRequestSchema = z.object({
  type: z.literal("multiple-request"),
  message: DownloadRequestSchema.array(),
  poolSize: z.number().int().optional(),
});

export const RequestSchema = z.union([
  SingleRequestSchema,
  MultipleRequestSchema,
]);

export type ISingleRequest = z.infer<typeof SingleRequestSchema>;
export type IMultipleRequest = z.infer<typeof MultipleRequestSchema>;
export type IRequest = z.infer<typeof RequestSchema>;

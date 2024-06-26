import { z } from "zod";
import { KeySchema } from "../utils/key";

export const FailedSchema = z.object({
  key: KeySchema,
  state: z.literal("failed"),
  reason: z.instanceof(Error).describe("NOTE: 오류 객체/원인"),
});

export type IFailed = z.infer<typeof FailedSchema>;

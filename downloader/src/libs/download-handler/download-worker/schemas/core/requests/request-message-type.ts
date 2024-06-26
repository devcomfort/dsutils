import { z } from "zod";

export const RequestMessageType = z.enum([
  "single-request",
  "multiple-request",
]);
export type ReuqestType = z.infer<typeof RequestMessageType>;

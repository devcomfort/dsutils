import { z } from "zod";

export const ResponseMessageType = z.enum([
  "single-result",
  "multiple-result",
  "single-ratio",
  "multiple-ratio",
]);

export type ResponseType = z.infer<typeof ResponseMessageType>;

import { z } from "zod";
import { KeySchema } from "../utils/key";

export const SucceedSchema = z.object({
  key: KeySchema,
  state: z.literal("succeed"),
  data: z.instanceof(Blob),
});

export type ISucceed = z.infer<typeof SucceedSchema>;

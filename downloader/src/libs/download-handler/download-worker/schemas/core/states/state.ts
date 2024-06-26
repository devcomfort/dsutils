import { z } from "zod";
import { FailedSchema } from "./failed";
import { SucceedSchema } from "./succeed";

export const StateSchema = z.union([FailedSchema, SucceedSchema]);
export type State = z.infer<typeof StateSchema>;

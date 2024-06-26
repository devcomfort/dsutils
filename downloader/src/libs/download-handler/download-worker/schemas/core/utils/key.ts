import { z } from "zod";

export const KeySchema = z.string().uuid();
export type Key = z.infer<typeof KeySchema>;

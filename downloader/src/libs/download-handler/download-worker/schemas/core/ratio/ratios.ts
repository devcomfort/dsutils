import { z } from "zod";
import { RatioSchema } from "./ratio";

export const RatiosSchema = RatioSchema.array();
export type Ratios = z.infer<typeof RatiosSchema>;

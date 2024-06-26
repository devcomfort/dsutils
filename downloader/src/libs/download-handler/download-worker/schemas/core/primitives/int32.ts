import typia, { tags } from "typia";

export type Int32 = number & tags.Type<"int32">;

export const isInt32 = (value: unknown): value is Int32 =>
  typia.is<Int32>(value);

import typia, { tags } from "typia";

export type TURL = string & tags.Format<"url">;

export const isURL = (url: string): url is TURL => typia.is<TURL>(url);

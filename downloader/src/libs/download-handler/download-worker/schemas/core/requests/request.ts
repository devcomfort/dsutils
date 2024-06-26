import { z } from "zod";
import { RequestMessageType } from "./request-message-type";

/** 기본 요청 스키마
 * @description "message" 필드를 따로 추가하여 사용함
 */
export const BaseRequestSchema = z.object({
  type: RequestMessageType,
});

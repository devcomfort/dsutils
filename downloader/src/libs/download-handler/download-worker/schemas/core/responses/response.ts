import { z } from "zod";
import { ResponseMessageType } from ".";

/** 기본 응답 스키마
 * @description "message" 필드를 따로 추가하여 사용함
 */
export const BaseResponseSchema = z.object({
  type: ResponseMessageType,
});

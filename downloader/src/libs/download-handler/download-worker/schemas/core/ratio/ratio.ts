import { z } from "zod";

/** 진행도 타입
 * @description 범위: 0~1 사이의 실수
 * @description 진행도를 계산할 수 없는 경우 `null` 저장
 */
export const RatioSchema = z.number().min(0).max(1).nullable();

export type Ratio = z.infer<typeof RatioSchema>;

import { isArray } from "./is-array";
import { isInt } from "./is-int";

/**
 * ### 정수 배열 검증 함수
 *
 * - 입력된 값이 배열 형태이며, 각 요소가 정수인지 검증합니다
 *
 * @param value
 * @returns
 */
export const isIntArray = (value: unknown): value is number[] =>
  isArray(value) && value.every(isInt);

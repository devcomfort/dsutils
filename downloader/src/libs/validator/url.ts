import { z } from "zod";

export const URL = z.string().url({
  message: "올바른 URL을 입력해주세요",
});

/**
 * 입력한 문자열이 URL 구조인지 검사합니다
 * @param url
 * @returns
 */
export const isURL = (url: string): boolean => URL.safeParse(url).success;

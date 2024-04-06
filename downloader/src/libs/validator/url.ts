import { z } from "zod";

export const URL = z.string().url({
  message: "올바른 URL을 입력해주세요",
});

/**
 * 올바른 구조의 URL 문자열을 입력했는지 검사합니다
 * @param url
 * @returns
 */
export const isURL = (url: string) => URL.safeParse(url).success;

import { it, expect, describe } from "vitest";
import { isURL } from "./url";
import { randomString } from "remeda";

describe("isURL 메소드 테스트", () => {
  it("유효하지 않은 자료형 입력 (boolean)", () => {
    // @ts-ignore
    expect(isURL(true)).toBe(false);
    // @ts-ignore
    expect(isURL(false)).toBe(false);
  });

  it("유효하지 않은 자료형 입력 (number)", () => {
    // @ts-ignore
    expect(isURL(Math.random())).toBe(false);
  });

  it("유효하지 않은 문자열 입력 (random string)", () => {
    // @ts-ignore
    expect(isURL(randomString())).toBe(false);
  });

  it("유효하지 않은 URL 입력", () => {
    expect(isURL("www.google.com")).toBe(false);
    expect(isURL("https:www.google.com")).toBe(false);
  });

  it("유효한 URL 입력", () => {
    expect(isURL("https://www.google.com")).toBe(true);
  });
});

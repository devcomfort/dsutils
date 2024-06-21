import { describe, expect, it } from "vitest";
import { Loader } from "./loader";
import typia from "typia";
import { IMirrorHostRegistry } from "./schema";

describe("Loader 클래스 검증", () => {
  describe("Loader.getData() 메소드 검증", () => {
    it("데이터 유효성 검사", () => {
      const data = new Loader().getData();
      expect(typia.is<IMirrorHostRegistry>(data)).toBe(true);
    });
  });

  describe("constructor 검증", () => {
    it("오류 발생 여부 검사 (오류가 발생함 -> 데이터 오염됨)", () => {
      expect(() => new Loader()).not.toThrow();
    });
  });

  describe("데이터 오염 테스트 (고의로 오염된 데이터 로드 시도해보기)", () => {
    // NOTE: 정적 파일을 로드하는 방식인데
    //       파일이 오염되면 위의 테스트 케이스에서 오류가 발생함
    //       현재 세부적인 아래 명시된 세부적인 오류 케이스에 맞춰진 오류 처리가 이루어지지 않고 있고
    //       load 메소드를 수정할 수 없는 코드를 사용 중이므로, 해당 케이스의 테스트는 필요할 때 정의하도록 함
    it.todo("1. 잘못된 타입의 데이터를 포함함", () => {});
    it.todo("2. 필수 필드 누락됨", () => {});
  });
});

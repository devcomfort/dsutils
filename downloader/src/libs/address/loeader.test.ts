import { it } from "vitest";
import { Loader } from "./loader";

it("데이터 로드 테스트", async () => {
  const loader = new Loader();
  console.log(loader.getData());
});

it.todo("오류 문구 추가하기 (예시: 미러 호스트 주소를 가져오지 못 헀습니다!)");

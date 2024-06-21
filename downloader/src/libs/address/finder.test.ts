import { expect, it, describe } from "vitest";
import Finder from "./finder";
import Loader from "./loader";
import typia from "typia";
import { IMirrorHost } from "./schema";
import { TURL } from "../validator/url";

describe("Finder 클래스 테스트", () => {
  it("로드 오류 테스트 (여기서 터지면 Loader 클래스에 문제가 있는 것)", () => {
    expect(() => new Finder()).not.toThrow();
  });

  describe("데이터 탐색 테스트", () => {
    // 유효한 URL 만들기
    const loader = new Loader();
    const mirrorHost = loader.getData().mirrorHosts.at(0);

    it("미러 호스트 존재 여부 (레지스트리에 미러 호스트가 1개 이상 있으면 통과)", () => {
      expect(mirrorHost).not.toBeUndefined();
    });

    const compatibleUrl = `https://${mirrorHost!.compatibleHosts[0]}/...`;

    it("유효한 URL의 탐색", () => {
      const compatibleHosts = new Finder().findCompatibleMirrorHosts(
        compatibleUrl
      );
      const validated = compatibleHosts.every((compatibleHost) =>
        typia.is<IMirrorHost>(compatibleHost)
      );
      expect(validated && compatibleHosts.length > 0).toBe(true);
    });
    it("유효하지 않은 URL의 탐색", () => {
      const randomUrl = typia.random<TURL>();
      const compatibleHosts = new Finder().findCompatibleMirrorHosts(randomUrl);
      expect(compatibleHosts.length).toEqual(0);
    });
  });
});
